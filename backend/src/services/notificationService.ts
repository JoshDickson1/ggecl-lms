import { combinedUserModel } from "../utils/roleMappings.js";
import { Types } from "mongoose";
import { ClassroomModel } from "../models/classroomModel.js";
import StudentModel from "../models/studentModel.js";
import instructorModel from "../models/instructorModel.js";
import coursesModel from "../models/coursesModel.js";
import adminModel from "../models/adminModel.js";

class NotificationService {
  static async createNotification(
    userId: Types.ObjectId,
    userRole: "admin" | "instructor" | "student",
    notification: {
      title: string;
      content: string;
    }
  ) {
    try {
      const UserModel = combinedUserModel(userRole);
      await UserModel.findByIdAndUpdate(userId, {
        $push: {
          notifications: {
            ...notification,
            createdAt: new Date(),
            isRead: false,
          },
        },
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }

  static async notifyAdmins(notification: { title: string; content: string }) {
    try {
      // Get all admin IDs
      const admins = await adminModel.find({}, { _id: 1 }).lean();
      const adminIds = admins.map((admin) => admin._id);

      // Send notification to all admins
      await adminModel.updateMany(
        { _id: { $in: adminIds } },
        {
          $push: {
            notifications: {
              ...notification,
              createdAt: new Date(),
              isRead: false,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error notifying admins:", error);
    }
  }

  static async notifyCourseStudents(
    courseId: Types.ObjectId,
    notification: {
      title: string;
      content: string;
    },
    classroomId?: Types.ObjectId
  ) {
    try {
      let studentIds: Types.ObjectId[] = [];

      if (classroomId) {
        const classroom = await ClassroomModel.findById(classroomId)
          .select("students")
          .lean();
        if (classroom) {
          studentIds = classroom.students;
        }
      } else {
        const students = await StudentModel.find(
          { enrolledCourses: courseId },
          { _id: 1 }
        ).lean();
        studentIds = students.map((s) => s._id);
      }

      await StudentModel.updateMany(
        { _id: { $in: studentIds } },
        {
          $push: {
            notifications: {
              ...notification,
              createdAt: new Date(),
              isRead: false,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error notifying course students:", error);
    }
  }

  static async notifyCourseInstructors(
    courseId: Types.ObjectId,
    notification: {
      title: string;
      content: string;
    }
  ) {
    try {
      const course = await coursesModel
        .findById(courseId)
        .populate("instructors")
        .lean();

      if (course && course.instructor) {
        await instructorModel.updateMany(
          { _id: { $in: course.instructor } },
          {
            $push: {
              notifications: {
                ...notification,
                createdAt: new Date(),
                isRead: false,
              },
            },
          }
        );
      }
    } catch (error) {
      console.error("Error notifying course instructors:", error);
    }
  }

  static async notifyStudents(
    studentIds: Types.ObjectId[],
    notification: {
      title: string;
      content: string;
    }
  ) {
    try {
      await StudentModel.updateMany(
        { _id: { $in: studentIds } },
        {
          $push: {
            notifications: {
              ...notification,
              createdAt: new Date(),
              isRead: false,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error notifying students:", error);
    }
  }

  static async cleanupAllOldNotifications() {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      await Promise.all([
        StudentModel.updateMany(
          {},
          { $pull: { notifications: { createdAt: { $lt: oneDayAgo } } } }
        ),
        instructorModel.updateMany(
          {},
          { $pull: { notifications: { createdAt: { $lt: oneDayAgo } } } }
        ),
        adminModel.updateMany(
          {},
          { $pull: { notifications: { createdAt: { $lt: oneDayAgo } } } }
        ),
      ]);

      console.log("Old notifications cleanup completed");
    } catch (error) {
      console.error("Error in scheduled notifications cleanup:", error);
    }
  }
}

export { NotificationService };
