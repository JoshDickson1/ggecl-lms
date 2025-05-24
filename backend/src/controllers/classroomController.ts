/* eslint-disable @typescript-eslint/no-explicit-any */
// controllers/classroomController.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import { ClassroomService } from "../services/classroomService.js";
import { AuthenticatedRequest } from "../types/express.js";

class ClassroomController {
  static async createClassroom(req: Request, res: Response) {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      const { name, courseId } = req.body;
      const classroom = await ClassroomService.createClassroom(
        name,
        new Types.ObjectId(courseId),
        new Types.ObjectId(user.id)
      );
      res.status(201).json(classroom);
    } catch (error) {
      res.status(500).json({ message: "Error creating classroom", error });
    }
  }

  static async addActivity(req: Request, res: Response) {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      const { classroomId } = req.params;
      const { title, description, files } = req.body;

      const classroom = await ClassroomService.addActivity(
        new Types.ObjectId(classroomId),
        { title, description, files },
        new Types.ObjectId(user.id)
      );

      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json({ message: "Error adding activity", error });
    }
  }

  static async createGroup(req: Request, res: Response) {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      const { classroomId } = req.params;
      const { name, studentIds } = req.body;

      const classroom = await ClassroomService.createGroup(
        new Types.ObjectId(classroomId),
        name,
        studentIds.map((id: string) => new Types.ObjectId(id)),
        new Types.ObjectId(user.id)
      );

      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json({ message: "Error creating group", error });
    }
  }

  static async getClassroom(req: Request, res: Response): Promise<void> {
    try {
      const { classroomId } = req.params;
      const classroom = await ClassroomService.getClassroomById(
        new Types.ObjectId(classroomId)
      );

      if (!classroom) {
        res.status(404).json({ message: "Classroom not found" });
        return;
      }

      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json({ message: "Error getting classroom", error });
    }
  }

  // In ClassroomController.ts
  static async addStudentToClassroom(req: Request, res: Response) {
    try {
      const { classroomId } = req.params;
      const { studentId } = req.body;
      const classroom = await ClassroomService.addStudentToClassroom(
        new Types.ObjectId(classroomId),
        new Types.ObjectId(studentId)
      );
      res.status(200).json(classroom);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding student to classroom", error });
    }
  }

  static async removeStudentFromClassroom(req: Request, res: Response) {
    try {
      const { classroomId, studentId } = req.params;
      const classroom = await ClassroomService.removeStudentFromClassroom(
        new Types.ObjectId(classroomId),
        new Types.ObjectId(studentId)
      );
      res.status(200).json(classroom);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error removing student from classroom", error });
    }
  }

  static async getClassroomsByCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const classrooms = await ClassroomService.getClassroomsByCourse(
        new Types.ObjectId(courseId)
      );
      res.status(200).json(classrooms);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error getting classrooms by course", error });
    }
  }
  static async recordAttendance(req: Request, res: Response) {
    try {
      const { classroomId, studentId } = req.params;
      const { duration } = req.body;

      const classroom = await ClassroomService.recordAttendance(
        new Types.ObjectId(classroomId),
        new Types.ObjectId(studentId),
        duration
      );

      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json({ message: "Error recording attendance", error });
    }
  }

  //Delete classroom group
  static async deleteGroup(req: Request, res: Response) {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      const { classroomId, groupName } = req.params;
      const classroom = await ClassroomService.deleteGroup(
        new Types.ObjectId(classroomId),
        groupName,
        new Types.ObjectId(user.id)
      );
      res.status(200).json(classroom);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Error deleting group", error });
    }
  }

  static async gradeGroupAssignment(req: Request, res: Response) {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      const { classroomId, groupName, assignmentId } = req.params;
      const { grades } = req.body;

      const classroom = await ClassroomService.gradeGroupAssignment(
        new Types.ObjectId(classroomId),
        groupName,
        new Types.ObjectId(assignmentId),
        grades.map((g: any) => ({
          ...g,
          studentId: new Types.ObjectId(g.studentId),
        })),
        new Types.ObjectId(user.id)
      );

      res.status(200).json(classroom);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Error grading assignment", error });
    }
  }

  static async addStudentsToGroup(req: Request, res: Response) {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      const { classroomId, groupName } = req.params;
      const { studentIds } = req.body;

      const classroom = await ClassroomService.addStudentsToGroup(
        new Types.ObjectId(classroomId),
        groupName,
        studentIds.map((id: string) => new Types.ObjectId(id)),
        new Types.ObjectId(user.id)
      );

      res.status(200).json(classroom);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Error adding students to group",
        error,
      });
    }
  }

  static async removeStudentsFromGroup(req: Request, res: Response) {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      const { classroomId, groupName } = req.params;
      const { studentIds } = req.body;

      const classroom = await ClassroomService.removeStudentsFromGroup(
        new Types.ObjectId(classroomId),
        groupName,
        studentIds.map((id: string) => new Types.ObjectId(id)),
        new Types.ObjectId(user.id)
      );

      res.status(200).json(classroom);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Error removing students from group",
        error,
      });
    }
  }

  static async getClassroomGroups(req: Request, res: Response) {
    try {
      const { classroomId } = req.params;
      const groups = await ClassroomService.getClassroomGroups(
        new Types.ObjectId(classroomId)
      );

      res.status(200).json(groups);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Error getting classroom groups",
        error,
      });
    }
  }
}

export { ClassroomController };
