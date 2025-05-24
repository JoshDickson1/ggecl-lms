import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc.js";
import { assignmentService } from "../services/assignmentService.js";
import { FilterQuery, isValidObjectId } from "mongoose";
import { Types } from "mongoose";
import { uploadMiddleware } from "../modules/upload/upload.middleware.js";
import { getCacheOrFetch } from "../utils/getCacheOrFetch.js";
import assignmentModel, { IAssignment } from "../models/assignmentModel.js";
import { UploadCategory } from "../modules/upload/upload.types.js";

const AssignmentIdSchema = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid Assignment ID",
  });

const CreateAssignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  courseId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid Course ID" }),
  classroomId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid Classroom ID" })
    .optional(),
  groupId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid Group ID" })
    .optional(),
  dueDate: z.string().datetime("Invalid date format"),
});

const SubmitAssignmentSchema = z.object({
  assignmentId: AssignmentIdSchema,
});

const GradeAssignmentSchema = z.object({
  assignmentId: AssignmentIdSchema,
  grade: z.enum(["A", "B", "C", "D", "E", "F"]),
  remark: z.string().optional(),
});

const GetAssignmentsZodSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  search: z.string().optional(),
  sortBy: z
    .enum(["title", "status", "dueDate", "createdAt"])
    .default("dueDate"),
  order: z.enum(["asc", "desc"]).default("asc"),
  status: z.enum(["draft", "published", "submitted", "graded"]).optional(),

  dueDate: z.date().optional(),
});

type TGetAssignmentsInput = z.infer<typeof GetAssignmentsZodSchema>;

const getCacheKey = (prefix: string, input: TGetAssignmentsInput) => {
  const { page, limit, search, sortBy, order, status, dueDate } = input;
  return `${prefix}-${page}-${limit}-${search}-${sortBy}-${order}-${status}-${dueDate?.toISOString()}`;
};

export const assignmentRouter = router({
  create: protectedProcedure
    .input(CreateAssignmentSchema)
    .use(uploadMiddleware(UploadCategory.ASSIGNMENT))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "instructor") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins and instructors can create assignments",
        });
      }

      try {
        const files = ctx.req.files as Express.Multer.File[];
        const assignment = await assignmentService.createAssignment({
          title: input.title,
          description: input.description,
          course: new Types.ObjectId(input.courseId),
          classroomId: input.classroomId
            ? new Types.ObjectId(input.classroomId)
            : undefined,
          groupId: input.groupId
            ? new Types.ObjectId(input.groupId)
            : undefined,
          dueDate: new Date(input.dueDate),
          createdBy: {
            id: new Types.ObjectId(ctx.user.id),
            model: ctx.user.role === "admin" ? "Admin" : "Instructor",
          },
          files,
        });

        return { success: true, assignment };
      } catch (error) {
        console.error("Failed to create assignment:", error);
        throw error;
      }
    }),

  submit: protectedProcedure
    .input(SubmitAssignmentSchema)
    .use(uploadMiddleware(UploadCategory.SUBMISSION))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "student") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only students can submit assignments",
        });
      }

      try {
        const files = ctx.req.files as Express.Multer.File[];
        const assignment = await assignmentService.submitAssignment({
          assignmentId: new Types.ObjectId(input.assignmentId),
          studentId: new Types.ObjectId(ctx.user.id),
          files,
        });

        return { success: true, assignment };
      } catch (error) {
        console.error("Error submitting assignment:", error);
        throw error;
      }
    }),

  grade: protectedProcedure
    .input(GradeAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "instructor") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins and instructors can grade assignments",
        });
      }

      try {
        const assignment = await assignmentService.gradeAssignment({
          assignmentId: new Types.ObjectId(input.assignmentId),
          grade: input.grade,
          remark: input.remark,
          gradedBy: {
            id: new Types.ObjectId(ctx.user.id),
            model: ctx.user.role === "admin" ? "Admin" : "Instructor",
          },
        });

        return { success: true, assignment };
      } catch (error) {
        console.error("Error grading assignment:", error);
        throw error;
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: AssignmentIdSchema }))
    .query(async ({ input }) => {
      try {
        const assignment = await assignmentService.getAssignmentById(
          new Types.ObjectId(input.id)
        );
        return assignment;
      } catch (error) {
        console.error("Error getting assignment:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get assignment",
        });
      }
    }),

  getAllForStudent: protectedProcedure
    .input(GetAssignmentsZodSchema)
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "student") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only students can view their assignments",
        });
      }

      const cacheKey = getCacheKey(`assignments-student-${ctx.user.id}`, input);

      try {
        return await getCacheOrFetch(cacheKey, async () => {
          const { page, limit, search, sortBy, order, status, dueDate } = input;
          const skip = (page - 1) * limit;
          const sortOrder = order === "asc" ? 1 : -1;

          const query: FilterQuery<IAssignment> = {
            $or: [
              { studentId: new Types.ObjectId(ctx.user.id) },
              {
                classroomId: { $exists: true },
                "classroom.students": new Types.ObjectId(ctx.user.id),
              },
            ],

            ...(status && { status }),
          };

          if (dueDate) {
            const start = new Date(dueDate);
            const end = new Date(dueDate);
            end.setDate(end.getDate() + 1);
            query.dueDate = { $gte: start, $lt: end };
          }

          if (search) {
            const pattern = new RegExp(search, "i");
            query.$or = [
              ...(query.$or || []),
              { title: pattern },
              { description: pattern },

              { "course.title": pattern },
            ];
          }

          const [assignments, total] = await Promise.all([
            assignmentModel
              .find(query)
              .populate("course")
              .populate("classroomId")
              .populate("instructorId")

              .sort({ [sortBy]: sortOrder })
              .skip(skip)
              .limit(limit)
              .lean(),
            assignmentModel.countDocuments(query),
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
      } catch (error) {
        console.error("Error fetching student assignments:", error);
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch student assignments",
        });
      }
    }),

  getAllForInstructor: protectedProcedure
    .input(GetAssignmentsZodSchema)
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "instructor") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only instructors can view these assignments",
        });
      }

      const cacheKey = getCacheKey(
        `assignments-instructor-${ctx.user.id}`,
        input
      );

      try {
        return await getCacheOrFetch(cacheKey, async () => {
          const { page, limit, search, sortBy, order, status, dueDate } = input;
          const skip = (page - 1) * limit;
          const sortOrder = order === "asc" ? 1 : -1;

          const query: FilterQuery<IAssignment> = {
            instructorId: new Types.ObjectId(ctx.user.id),
            ...(status && { status }),
          };

          if (dueDate) {
            const start = new Date(dueDate);
            const end = new Date(dueDate);
            end.setDate(end.getDate() + 1);
            query.dueDate = { $gte: start, $lt: end };
          }

          if (search) {
            const pattern = new RegExp(search, "i");
            query.$or = [
              { title: pattern },
              { description: pattern },
              { "course.title": pattern },
              { "student.fullName": pattern },
            ];
          }

          const [assignments, total] = await Promise.all([
            assignmentModel
              .find(query)
              .populate("course")
              .populate("classroomId")
              .populate("studentId")
              .sort({ [sortBy]: sortOrder })
              .skip(skip)
              .limit(limit)
              .lean(),
            assignmentModel.countDocuments(query),
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
      } catch (error) {
        console.error("Error fetching instructor assignments:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch instructor assignments",
        });
      }
    }),

  getAllForAdmin: protectedProcedure
    .input(GetAssignmentsZodSchema)
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can view all assignments",
        });
      }

      const cacheKey = getCacheKey("assignments-admin", input);

      try {
        return await getCacheOrFetch(cacheKey, async () => {
          const { page, limit, search, sortBy, order, status, dueDate } = input;
          const skip = (page - 1) * limit;
          const sortOrder = order === "asc" ? 1 : -1;

          const query: FilterQuery<IAssignment> = {
            ...(status && { status }),
          };

          if (dueDate) {
            const start = new Date(dueDate);
            const end = new Date(dueDate);
            end.setDate(end.getDate() + 1);
            query.dueDate = { $gte: start, $lt: end };
          }

          if (search) {
            const pattern = new RegExp(search, "i");
            query.$or = [
              { title: pattern },
              { description: pattern },
              { "course.title": pattern },
              { "student.fullName": pattern },
              { "instructor.fullName": pattern },
            ];
          }

          const [assignments, total] = await Promise.all([
            assignmentModel
              .find(query)
              .populate("course")
              .populate("classroomId")
              .populate("studentId")
              .populate("instructorId")
              .sort({ [sortBy]: sortOrder })
              .skip(skip)
              .limit(limit)
              .lean(),
            assignmentModel.countDocuments(query),
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
      } catch (error) {
        console.error("Error fetching admin assignments:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch all assignments",
        });
      }
    }),

  getSubmitted: protectedProcedure
    .input(
      GetAssignmentsZodSchema.extend({
        classroomId: z.string().refine(isValidObjectId).optional(),
        groupId: z.string().refine(isValidObjectId).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "instructor") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins and instructors can view submitted assignments",
        });
      }

      const cacheKey = getCacheKey(
        `assignments-submitted-${ctx.user.id}-${input.classroomId || "all"}-${
          input.groupId || "all"
        }`,
        input
      );

      try {
        return await getCacheOrFetch(cacheKey, async () => {
          const { page, limit, search, sortBy, order, classroomId, groupId } =
            input;
          const skip = (page - 1) * limit;
          const sortOrder = order === "asc" ? 1 : -1;

          const query: FilterQuery<IAssignment> = {
            status: "submitted",
            ...(classroomId && {
              classroomId: new Types.ObjectId(classroomId),
            }),
            ...(groupId && { groupId: new Types.ObjectId(groupId) }),
          };

          if (ctx.user.role === "instructor") {
            query.instructorId = new Types.ObjectId(ctx.user.id);
          }

          if (search) {
            const pattern = new RegExp(search, "i");
            query.$or = [
              { title: pattern },
              { description: pattern },
              { "course.title": pattern },
              { "student.fullName": pattern },
            ];
          }

          const [assignments, total] = await Promise.all([
            assignmentModel
              .find(query)
              .populate("course")
              .populate("classroomId")
              .populate("studentId")
              .sort({ [sortBy]: sortOrder })
              .skip(skip)
              .limit(limit)
              .lean(),
            assignmentModel.countDocuments(query),
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
      } catch (error) {
        console.error("Error fetching submitted assignments:", error);
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch submitted assignments",
        });
      }
    }),
});
