import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

import { cloudinary } from "../cloudinary.js";
import { envConfig } from "../config/envValidator.js";
import { protectedProcedure, router } from "../trpc.js";
import studentModel from "../models/studentModel.js";
import AssignmentModel, {
  IStudentAssignment,
} from "../models/assignmentModel.js";
import { wildcardDeleteCache } from "../utils/nodeCache.js";
import { isValidObjectId } from "mongoose";
import coursesModel, { ICourse } from "../models/coursesModel.js";
import { FilterQuery } from "mongoose";
import { getCacheOrFetch } from "../utils/getCacheOrFetch.js";

type TSubmissionData = Partial<
  Omit<IStudentAssignment, "title" | "lesson" | "dueDate" | "question">
>;

export type IStudentAssignmentPopulated = Omit<IStudentAssignment, "course"> & {
  course: ICourse;
};

// -- Validation Schemas --------------------------------------------------
const SubmissionCompleteZodSchema = z.object({
  assignmentId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid assignment ID" }),
  publicId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  fileUrl: z.string().url(),
});

const MarkAssignmentSchema = z.object({
  assignmentId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid assignment ID" }),
  grade: z.enum(["A", "B", "C", "D", "E", "F"]),
  remark: z.string().optional(),
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  course: z.string().refine(isValidObjectId, { message: "Invalid course ID" }),
  question: z.string(),
  dueDate: z.date(),
});

const GetAssignmentsZodSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  search: z.string().optional(),
  sortBy: z.enum(["title", "status", "dueDate"]).default("title"),
  order: z.enum(["asc", "desc"]).default("asc"),
  status: z.enum(["pending", "graded", "submitted"]).optional(),
  dueDate: z.date().optional(),
});

type TGetAssignmentsInput = z.infer<typeof GetAssignmentsZodSchema>;

const getCacheKey = (prefix: string, input: TGetAssignmentsInput) => {
  const { page, limit, search, sortBy, order, status, dueDate } = input || {};
  return `${prefix}-${page}-${limit}-${search}-${sortBy}-${order}-${status}-${dueDate}`;
};

export const assignmentRouter = router({
  create: protectedProcedure
    .input(CreateAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const instructorId = ctx.user.id;

      try {
        const course = await coursesModel.findById(input.course);
        if (!course) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Course with id ${input.course} not found`,
          });
        }

        const assignment = await AssignmentModel.create({
          ...input,
          instructorId,
          course: course._id,
          status: "pending",
        });

        await studentModel.updateMany(
          { enrolledCourses: course._id },
          { $addToSet: { assignments: assignment._id } }
        );

        wildcardDeleteCache(`assignments-`);
        return assignment;
      } catch (err) {
        console.error("Failed to create assignment:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create assignment",
        });
      }
    }),

  // Get all assignments for a student
  getAllForStudent: protectedProcedure
    .input(GetAssignmentsZodSchema)
    .query(async ({ ctx, input }) => {
      const studentId = ctx.user.id;
      const cacheKey = `assignments-student-${studentId}`;

      try {
        return await getCacheOrFetch(cacheKey, async () => {
          const { page, limit, search, sortBy, order, status, dueDate } = input;
          const skip = (page - 1) * limit;
          const sortOrder = order === "asc" ? 1 : -1;

          const student = await studentModel
            .findById(studentId, { assignments: 1 })
            .lean();

          if (!student) throw new TRPCError({ code: "NOT_FOUND" });

          const searchQuery: FilterQuery<IStudentAssignment> = {
            _id: { $in: student.assignments },
            ...(status && { status }),
          };

          if (dueDate) {
            const start = new Date(dueDate);
            const end = new Date(dueDate);
            end.setDate(end.getDate() + 1);
            searchQuery.dueDate = { $gte: start, $lt: end };
          }

          if (search) {
            const pattern = new RegExp(search, "i");
            searchQuery.$or = [
              { title: pattern },
              { question: pattern },
              { "course.title": pattern },
            ];
          }

          const [assignments, total] = await Promise.all([
            AssignmentModel.find(searchQuery)
              .populate<{ course: ICourse }>("course")
              .select("-syllabus -reviews -description")
              .sort({ [sortBy]: sortOrder })
              .skip(skip)
              .limit(limit)
              .lean(),
            AssignmentModel.countDocuments(searchQuery),
          ]);

          return {
            assignments,
            meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          };
        });
      } catch (err) {
        console.error("Error fetching student assignments:", err);
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch student assignments",
        });
      }
    }),

  getAllForInstructor: protectedProcedure
    .input(GetAssignmentsZodSchema)
    .query(async ({ ctx, input }) => {
      const instructorId = ctx.user.id;

      const cacheKey = getCacheKey(
        `assignments-instructor-${instructorId}`,
        input
      );

      try {
        return await getCacheOrFetch(cacheKey, async () => {
          const { page, limit, search, sortBy, order, status, dueDate } = input;
          const skip = (page - 1) * limit;
          const sortOrder = order === "asc" ? 1 : -1;

          const searchQuery: FilterQuery<IStudentAssignment> = {
            instructorId,
            ...(status && { status }),
          };

          if (dueDate) {
            const start = new Date(dueDate);
            const end = new Date(dueDate);
            end.setDate(end.getDate() + 1);
            searchQuery.dueDate = { $gte: start, $lt: end };
          }

          if (search) {
            const pattern = new RegExp(search, "i");
            searchQuery.$or = [
              { title: pattern },
              { question: pattern },
              { "course.title": pattern },
            ];
          }

          const [assignments, total] = await Promise.all([
            AssignmentModel.find(searchQuery)
              .select("-studentId")
              .populate<{ course: ICourse }>("course")
              .select("-syllabus -reviews -description")
              .sort({ [sortBy]: sortOrder })
              .skip(skip)
              .limit(limit)
              .lean(),
            AssignmentModel.countDocuments(searchQuery),
          ]);

          return {
            assignments,
            meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          };
        });
      } catch (err) {
        console.error("Error fetching instructors assignments:", err);
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch instructors assignments",
        });
      }
    }),

  getAllSubmitted: protectedProcedure
    .input(GetAssignmentsZodSchema)
    .query(async ({ ctx, input }) => {
      const { id: instructorId, role } = ctx.user;
      const cacheKey = getCacheKey(
        `assignments-instructor-submitted-${instructorId}`,
        input
      );

      if (role !== "instructor") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have access to this resource",
        });
      }

      try {
        return await getCacheOrFetch(cacheKey, async () => {
          const { page, limit, search, sortBy, order, dueDate } = input;
          const skip = (page - 1) * limit;
          const sortOrder = order === "asc" ? 1 : -1;

          const searchQuery: FilterQuery<IStudentAssignment> = {
            instructorId,
            status: "submitted",
          };

          if (dueDate) {
            const start = new Date(dueDate);
            const end = new Date(dueDate);
            end.setDate(end.getDate() + 1);
            searchQuery.dueDate = { $gte: start, $lt: end };
          }

          if (search) {
            const pattern = new RegExp(search, "i");
            searchQuery.$or = [
              { title: pattern },
              { question: pattern },
              { "course.title": pattern },
              { "student.fullName": pattern },
            ];
          }

          const [assignments, total] = await Promise.all([
            AssignmentModel.find(searchQuery)
              .populate<{ studentId: { _id: string; fullName: string } }>(
                "studentId"
              )
              .populate<{ course: ICourse }>("course")
              .select("-syllabus -reviews -description")
              .sort({ [sortBy]: sortOrder })
              .skip(skip)
              .limit(limit)
              .lean(),
            AssignmentModel.countDocuments(searchQuery),
          ]);

          return {
            assignments,
            meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          };
        });
      } catch (err) {
        console.error("Error fetching assignments:", err);
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch submitted assignments",
        });
      }
    }),

  createCloudinarySignature: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        originalFileName: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { assignmentId, originalFileName } = input;
      const userId = ctx.user.id;
      const timestamp = Math.round(new Date().getTime() / 1000);

      const folder = `assignments/${assignmentId}/${userId}`;
      const uniqueSuffix = randomUUID();
      const baseFileName = originalFileName
        ? originalFileName.split(".").slice(0, -1).join(".")
        : "submission";
      const public_id = `${folder}/${baseFileName}-${uniqueSuffix}`;

      const paramsToSign = {
        folder,
        public_id,
        timestamp,
      };

      try {
        const signature = cloudinary.utils.api_sign_request(
          paramsToSign,
          envConfig.CLOUDINARY_API_SECRET!
        );

        return {
          signature,
          timestamp,
          apiKey: envConfig.CLOUDINARY_API_KEY!,
          cloudName: envConfig.CLOUDINARY_CLOUD_NAME!,
          folder,
          publicId: public_id,
        };
      } catch (error) {
        console.error("Error signing Cloudinary request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create upload signature.",
        });
      }
    }),

  markSubmissionComplete: protectedProcedure
    .input(SubmissionCompleteZodSchema)
    .mutation(async ({ ctx, input }) => {
      const { assignmentId, publicId, fileName, fileSize, fileType, fileUrl } =
        input;

      const userId = ctx.user.id;

      try {
        const student = await studentModel
          .findOne({
            _id: userId,
            assignments: assignmentId,
          })
          .lean();

        if (!student) {
          console.error(
            `Assignment ${assignmentId} not associated with student ${userId}. Attempting rollback.`
          );
          try {
            await cloudinary.uploader.destroy(publicId, {
              resource_type: "raw",
            });
            console.log(`Orphaned Cloudinary file ${publicId} deleted.`);
          } catch (destroyError) {
            console.error(
              `Failed to delete orphaned Cloudinary file ${publicId}:`,
              destroyError
            );
          }
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not assigned to this assignment.",
          });
        }

        // 2. Prepare submission data for update
        const submissionData: TSubmissionData = {
          studentId: student._id,
          status: "submitted",
          submissionDate: new Date(),
          submissionFileUrl: fileUrl,
          submissionPublicId: publicId,
          submissionFileName: fileName,
          submissionFileSize: fileSize,
          submissionFileType: fileType,
        };

        // 3. Update the Assignment document
        const updatedAssignment = await AssignmentModel.findOneAndUpdate(
          { _id: assignmentId },
          { $set: submissionData },
          { new: true, runValidators: true }
        );

        if (!updatedAssignment) {
          console.error(
            `Assignment not found for update: ${assignmentId}. Attempting rollback.`
          );
          try {
            await cloudinary.uploader.destroy(publicId, {
              resource_type: "raw",
            });
            console.log(
              `Cloudinary file ${publicId} deleted due to failed DB update.`
            );
          } catch (destroyError) {
            console.error(
              `Failed to delete Cloudinary file ${publicId} after DB error:`,
              destroyError
            );
          }
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assignment could not be updated.",
          });
        }

        wildcardDeleteCache("assignments-");

        return { success: true, assignment: updatedAssignment };
      } catch (error) {
        console.error("Error marking submission complete:", error);

        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update assignment submission.",
          cause: error,
        });
      }
    }),

  // Grade assignment
  mark: protectedProcedure
    .input(MarkAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { role } = ctx.user;
      if (!["admin", "instructor"].includes(role)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Insufficient permissions",
        });
      }

      try {
        const updated = await AssignmentModel.findByIdAndUpdate(
          input.assignmentId,
          { grade: input.grade, status: "graded", remark: input.remark },
          { new: true, runValidators: true }
        );

        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assignment not found",
          });
        }

        wildcardDeleteCache(`assignments-`);
        return updated;
      } catch (err) {
        console.error("Grading error:", err);
        if (err instanceof TRPCError) throw err;
      }
    }),
});
