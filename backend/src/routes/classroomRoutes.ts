// routes/classroomRoutes.ts
import express from "express";
import { Types } from "mongoose";
import { ClassroomController } from "../controllers/classroomController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { UploadCategory } from "../modules/upload/upload.types.js";
import { multiUploadMiddleware } from "../modules/upload/upload.middleware.js";
import { UploadService } from "../modules/upload/upload.service.js";
import { Message } from "../models/messageSchema.js";
import { UploadApiResponse } from "cloudinary";

const router = express.Router();

/**
 * @api {post} /classrooms Create Classroom
 * @apiName CreateClassroom
 * @apiGroup Classroom
 * @apiPermission admin, instructor
 *
 * Creates a new classroom. Only accessible by admins and instructors.
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "instructor"]),
  ClassroomController.createClassroom
);

/**
 * @api {post} /classrooms/:classroomId/activities Add Activity
 * @apiName AddActivity
 * @apiGroup Classroom
 * @apiPermission instructor
 *
 * Adds an activity to a classroom. Only accessible by instructors.
 */
router.post(
  "/:classroomId/activities",
  authMiddleware,
  roleMiddleware(["instructor", "admin"]),
  ClassroomController.addActivity
);

/**
 * @api {post} /classrooms/:classroomId/groups Create Group
 * @apiName CreateGroup
 * @apiGroup Classroom
 * @apiPermission admin, instructor
 *
 * Creates a new group within a classroom. Only accessible by admins and instructors.
 */
router.post(
  "/:classroomId/groups",
  authMiddleware,
  roleMiddleware(["admin", "instructor"]),
  ClassroomController.createGroup
);

/**
 * @api {delete} /classrooms/:classroomId/groups/:groupName Delete Group
 * @apiName DeleteGroup
 * @apiGroup Classroom
 * @apiPermission admin, instructor
 *
 * Deletes a group from a classroom. Only accessible by admins and instructors.
 */
router.delete(
  "/:classroomId/groups/:groupName",
  authMiddleware,
  roleMiddleware(["admin", "instructor"]),
  ClassroomController.deleteGroup
);

/**
 * @api {post} /classrooms/:classroomId/groups/:groupName/assignments/:assignmentId/grade Grade Assignment
 * @apiName GradeGroupAssignment
 * @apiGroup Classroom
 * @apiPermission instructor
 *
 * Grades a group assignment. Only accessible by instructors and admins.
 */
router.post(
  "/:classroomId/groups/:groupName/assignments/:assignmentId/grade",
  authMiddleware,
  roleMiddleware(["instructor", "admin"]),
  ClassroomController.gradeGroupAssignment
);

/**
 * @api {post} /classrooms/:classroomId/groups/:groupName/students Add Students to Group
 * @apiName AddStudentsToGroup
 * @apiGroup Classroom
 * @apiPermission admin, instructor
 *
 * Adds students to a group. Only accessible by admins and instructors.
 */
router.post(
  "/:classroomId/groups/:groupName/students",
  authMiddleware,
  roleMiddleware(["admin", "instructor"]),
  ClassroomController.addStudentsToGroup
);

/**
 * @api {delete} /classrooms/:classroomId/groups/:groupName/students Remove Students from Group
 * @apiName RemoveStudentsFromGroup
 * @apiGroup Classroom
 * @apiPermission admin, instructor
 *
 * Removes students from a group. Only accessible by admins and instructors.
 */
router.delete(
  "/:classroomId/groups/:groupName/students",
  authMiddleware,
  roleMiddleware(["admin", "instructor"]),
  ClassroomController.removeStudentsFromGroup
);

/**
 * @api {get} /classrooms/:classroomId/groups Get Classroom Groups
 * @apiName GetClassroomGroups
 * @apiGroup Classroom
 * @apiPermission authenticated user
 *
 * Retrieves all groups for a classroom. Accessible by any authenticated user.
 */
router.get(
  "/:classroomId/groups",
  authMiddleware,
  ClassroomController.getClassroomGroups
);

/**
 * @api {get} /classrooms/:classroomId Get Classroom Details
 * @apiName GetClassroom
 * @apiGroup Classroom
 * @apiPermission authenticated user
 *
 * Retrieves details for a specific classroom. Accessible by any authenticated user.
 */
router.get("/:classroomId", authMiddleware, ClassroomController.getClassroom);

/**
 * @api {post} /classrooms/:classroomId/attendance/:studentId Record Attendance
 * @apiName RecordAttendance
 * @apiGroup Classroom
 * @apiPermission authenticated user
 *
 * Records attendance for a student in a classroom. Accessible by any authenticated user.
 */
router.post(
  "/:classroomId/attendance/:studentId",
  authMiddleware,
  ClassroomController.recordAttendance
);

// Helper function with proper typing
function mapResourceType(resourceType: string, format?: string): string {
  if (resourceType === "image") return "image";
  if (resourceType === "video") return "video";
  if (format === "pdf") return "pdf";
  if (format === "audio") return "audio";
  return "document";
}

/**
 * @api {post} /classrooms/:classroomId/:groupName/upload Upload Files to Group
 * @apiName UploadGroupFiles
 * @apiGroup Classroom
 * @apiPermission authenticated user
 *
 * Uploads files to a group discussion in a classroom. Handles multiple file uploads,
 * stores them in Cloudinary, saves message metadata to database, and broadcasts
 * via Socket.IO to all connected clients in the group room.
 */
router.post(
  "/:classroomId/:groupName/upload",
  multiUploadMiddleware(UploadCategory.GROUP_DISCUSSION),
  async (req, res) => {
    try {
      const { classroomId, groupName } = req.params;
      const { senderId, role, text } = req.body;

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      // 1. Upload files to Cloudinary
      const uploadResults = await UploadService.uploadMultipleFiles(
        req.files.map((file) => ({
          buffer: file.buffer,
          originalname: file.originalname,
        })),
        UploadCategory.GROUP_DISCUSSION,
        senderId
      );

      // 2. Save to database
      const newMessage = new Message({
        classroomId: new Types.ObjectId(classroomId),
        groupName,
        senderId,
        sender: role === "instructor" ? "Instructor" : "Student",
        role,
        text: text || undefined,
        files: uploadResults
          .filter((result): result is UploadApiResponse => !!result)
          .map((result) => ({
            url: result.secure_url,
            name: result.original_filename,
            type: mapResourceType(result.resource_type, result.format),
          })),
      });
      await newMessage.save();

      // 3. Broadcast via Socket.IO
      const io = req.app.get("socketio");
      const roomId = `classroom-${classroomId}-${groupName}`;
      io.to(roomId).emit("newClassroomMessage", newMessage);

      res.status(200).json({
        success: true,
        message: newMessage,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }
);

/**
 * @api {post} /classrooms/:classroomId/:groupName/upload-single Upload Single File to Group
 * @apiName UploadSingleGroupFile
 * @apiGroup Classroom
 * @apiPermission authenticated user
 *
 * Uploads a single file to a group discussion in a classroom. Handles file upload,
 * stores it in Cloudinary, saves message metadata to database, and broadcasts
 * via Socket.IO to all connected clients in the group room.
 */
router.post(
  "/:classroomId/:groupName/upload-single",
  authMiddleware,
  multiUploadMiddleware(UploadCategory.GROUP_DISCUSSION),
  async (req, res) => {
    try {
      const { classroomId, groupName } = req.params;
      const { senderId, role, text } = req.body;

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Take only the first file (even if multiple were sent)
      const file = req.files[0];

      // 1. Upload file to Cloudinary
      const uploadResult = await UploadService.uploadFile(
        file.buffer,
        UploadCategory.GROUP_DISCUSSION,
        file.originalname,
        senderId // Adding the userId as the 4th parameter
      );

      if (!uploadResult) {
        throw new Error("File upload failed");
      }

      // 2. Save to database
      const newMessage = new Message({
        classroomId: new Types.ObjectId(classroomId),
        groupName,
        senderId,
        sender: role === "instructor" ? "Instructor" : "Student",
        role,
        text: text || undefined,
        files: [
          {
            url: uploadResult.secure_url,
            name: uploadResult.original_filename,
            type: mapResourceType(
              uploadResult.resource_type,
              uploadResult.format
            ),
          },
        ],
      });
      await newMessage.save();

      // 3. Broadcast via Socket.IO
      const io = req.app.get("socketio");
      const roomId = `classroom-${classroomId}-${groupName}`;
      io.to(roomId).emit("newClassroomMessage", newMessage);

      res.status(200).json({
        success: true,
        message: newMessage,
      });
    } catch (error) {
      console.error("Single file upload error:", error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Single file upload failed",
      });
    }
  }
);

export default router;
