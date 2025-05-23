/* eslint-disable @typescript-eslint/no-explicit-any */
import AssignmentModel from "../models/assignmentModel.js";
import { NotificationService } from "./notificationService.js";
import { Types } from "mongoose";
import { TRPCError } from "@trpc/server";
import { wildcardDeleteCache } from "../utils/nodeCache.js";
import { UploadService } from "../modules/upload/upload.service.js";
import { UploadCategory } from "../modules/upload/upload.types.js";

class AssignmentService {
  private async getAdminId(): Promise<Types.ObjectId> {
    const AdminModel = (await import("../models/adminModel.js")).default;
    const admin = await AdminModel.findOne().select("_id").lean();
    if (!admin) throw new Error("No admin found in system");
    return admin._id;
  }
  async createAssignment(data: {
    title: string;
    description?: string;
    course: Types.ObjectId;
    classroomId?: Types.ObjectId;
    groupId?: Types.ObjectId;
    dueDate: Date;
    createdBy: { id: Types.ObjectId; model: "Admin" | "Instructor" };
    files?: Express.Multer.File[];
  }) {
    try {
      let assignmentFiles = [];
      if (data.files && data.files.length > 0) {
        const uploadedFiles = await UploadService.uploadMultipleFiles(
          data.files,
          UploadCategory.ASSIGNMENT,
          data.createdBy.id.toString()
        );
        assignmentFiles = uploadedFiles.map((file) => ({
          url: file.secure_url,
          publicId: file.public_id,
          fileName: file.original_filename || "document",
          fileType: file.resource_type,
          size: file.bytes,
        }));
      }

      const assignment = await AssignmentModel.create({
        title: data.title,
        description: data.description,
        course: data.course,
        classroomId: data.classroomId,
        groupId: data.groupId,
        dueDate: data.dueDate,
        instructorId: data.createdBy.id,
        instructorModel: data.createdBy.model,
        files: assignmentFiles,
        status: "published",
      });

      // Notify students
      await NotificationService.notifyCourseStudents(
        data.course,
        {
          title: "New Assignment",
          content: `New assignment "${
            data.title
          }" created. Due ${data.dueDate.toDateString()}`,
        },
        data.classroomId
      );

      // Notify other stakeholders
      if (data.createdBy.model === "Admin") {
        // If admin created, notify instructors
        await NotificationService.notifyCourseInstructors(data.course, {
          title: "New Assignment Created",
          content: `Admin created new assignment "${data.title}" for your course`,
        });
      } else {
        // If instructor created, notify admin
        await NotificationService.createNotification(
          await this.getAdminId(), // Helper method to get admin ID
          "admin",
          {
            title: "New Assignment Created",
            content: `Instructor created new assignment "${data.title}"`,
          }
        );
      }
      wildcardDeleteCache(`assignments-`);
      return assignment;
    } catch (error) {
      console.error("Error creating assignment:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create assignment",
      });
    }
  }

  async submitAssignment(data: {
    assignmentId: Types.ObjectId;
    studentId: Types.ObjectId;
    files: Express.Multer.File[];
  }) {
    try {
      const uploadedFiles = await UploadService.uploadMultipleFiles(
        data.files,
        UploadCategory.SUBMISSION,
        data.studentId.toString()
      );

      const submissionFiles = uploadedFiles.map((file) => ({
        url: file.secure_url,
        publicId: file.public_id,
        fileName: file.original_filename || "submission",
        fileType: file.resource_type,
        size: file.bytes,
      }));

      // Populate both instructor and course when finding the assignment
      const assignment = await AssignmentModel.findByIdAndUpdate(
        data.assignmentId,
        {
          studentId: data.studentId,
          submissionFiles,
          submissionDate: new Date(),
          status: "submitted",
        },
        { new: true }
      )
        .populate("instructorId")
        .populate("course", "title") // Only populate the title field from course
        .lean();

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assignment not found",
        });
      }

      // Type guard for populated instructor
      const instructor = assignment.instructorId as unknown as {
        _id: Types.ObjectId;
        // Add other instructor properties if needed
      };

      // Type guard for populated course
      const course = assignment.course as unknown as {
        title: string;
      };

      // Notify instructor/admin
      await NotificationService.createNotification(
        instructor._id,
        assignment.instructorModel.toLowerCase() as "admin" | "instructor",
        {
          title: "Assignment Submitted",
          content: `Student submitted assignment "${assignment.title}"`,
        }
      );

      // Notify admin
      await NotificationService.createNotification(
        await this.getAdminId(),
        "admin",
        {
          title: "Assignment Submitted",
          content: `Student submitted assignment "${assignment.title}" in ${course.title}`,
        }
      );

      wildcardDeleteCache(`assignments-`);
      return assignment;
    } catch (error) {
      console.error("Error submitting assignment:", error);
      throw error;
    }
  }

  async gradeAssignment(data: {
    assignmentId: Types.ObjectId;
    grade: string;
    remark?: string;
    gradedBy: { id: Types.ObjectId; model: "Admin" | "Instructor" };
  }) {
    try {
      const assignment = await AssignmentModel.findByIdAndUpdate(
        data.assignmentId,
        {
          grade: data.grade,
          remark: data.remark,
          status: "graded",
          isMarked: true,
        },
        { new: true }
      ).populate("studentId");

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assignment not found",
        });
      }

      // Notify student
      if (assignment.studentId) {
        await NotificationService.createNotification(
          assignment.studentId._id,
          "student",
          {
            title: "Assignment Graded",
            content: `Your assignment "${assignment.title}" has been graded`,
          }
        );
      }

      wildcardDeleteCache(`assignments-`);
      return assignment;
    } catch (error) {
      console.error("Error grading assignment:", error);
      throw error;
    }
  }

  async getAssignmentById(id: Types.ObjectId) {
    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Assignment ID is required",
      });
    }
    try {
      const assignment = await AssignmentModel.findById(id)
        .populate("course")
        .populate("classroomId")
        .populate("instructorId")
        .populate("studentId")
        .lean();

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assignment not found",
        });
      }

      return assignment;
    } catch (error) {
      console.error("Error getting assignment:", error);
      throw error;
    }
  }

  async getAssignmentsForStudent(
    studentId: Types.ObjectId,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      order?: "asc" | "desc";
      status?: string;
      dueDate?: Date;
    } = {}
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "dueDate",
        order = "asc",
        status,
        dueDate,
      } = filters;

      const skip = (page - 1) * limit;
      const sortOrder = order === "asc" ? 1 : -1;

      const query: any = {
        $or: [
          { studentId },
          {
            classroomId: { $exists: true },
            "classroom.students": studentId,
          },
        ],
      };

      if (status) {
        query.status = status;
      }

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
        AssignmentModel.find(query)
          .populate("course")
          .populate("classroomId")
          .populate("instructorId")
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        AssignmentModel.countDocuments(query),
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
    } catch (error) {
      console.error("Error getting student assignments:", error);
      throw error;
    }
  }

  async getAssignmentsForInstructor(
    instructorId: Types.ObjectId,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      order?: "asc" | "desc";
      status?: string;
      dueDate?: Date;
    } = {}
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "dueDate",
        order = "asc",
        status,
        dueDate,
      } = filters;

      const skip = (page - 1) * limit;
      const sortOrder = order === "asc" ? 1 : -1;

      const query: any = { instructorId };

      if (status) {
        query.status = status;
      }

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
        AssignmentModel.find(query)
          .populate("course")
          .populate("classroomId")
          .populate("studentId")
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        AssignmentModel.countDocuments(query),
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
    } catch (error) {
      console.error("Error getting instructor assignments:", error);
      throw error;
    }
  }

  async getAllAssignments(
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      order?: "asc" | "desc";
      status?: string;
      dueDate?: Date;
    } = {}
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "dueDate",
        order = "asc",
        status,
        dueDate,
      } = filters;

      const skip = (page - 1) * limit;
      const sortOrder = order === "asc" ? 1 : -1;

      const query: any = {};

      if (status) {
        query.status = status;
      }

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
        AssignmentModel.find(query)
          .populate("course")
          .populate("classroomId")
          .populate("studentId")
          .populate("instructorId")
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        AssignmentModel.countDocuments(query),
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
    } catch (error) {
      console.error("Error getting all assignments:", error);
      throw error;
    }
  }

  async getSubmittedAssignments(
    filters: {
      instructorId?: Types.ObjectId;
      classroomId?: Types.ObjectId;
      groupId?: Types.ObjectId;
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      order?: "asc" | "desc";
    } = {}
  ) {
    try {
      const {
        instructorId,
        classroomId,
        groupId,
        page = 1,
        limit = 10,
        search,
        sortBy = "submissionDate",
        order = "desc",
      } = filters;

      const skip = (page - 1) * limit;
      const sortOrder = order === "asc" ? 1 : -1;

      const query: any = {
        status: "submitted",
      };

      if (classroomId) {
        query.classroomId = classroomId;
      }

      if (groupId) {
        query.groupId = groupId;
      }

      if (instructorId) {
        query.instructorId = instructorId;
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
        AssignmentModel.find(query)
          .populate("course")
          .populate("classroomId")
          .populate("studentId")
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        AssignmentModel.countDocuments(query),
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
    } catch (error) {
      console.error("Error getting submitted assignments:", error);
      throw error;
    }
  }
}

export const assignmentService = new AssignmentService();
