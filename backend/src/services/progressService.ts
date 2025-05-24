import { Types } from "mongoose";
import studentModel from "../models/studentModel.js";

export class ProgressService {
  static async addDailyProgressToAllStudents(): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await studentModel.updateMany(
        {
          $or: [
            { lastDailyProgress: { $lt: yesterday } },
            { lastDailyProgress: { $exists: false } },
          ],
        },
        {
          $inc: { progressScore: 0.2 },
          $set: { lastDailyProgress: new Date() },
          $max: { progressScore: 100 }, // Ensure it doesn't exceed 100
        }
      );
    } catch (error) {
      console.error("Error in daily progress update:", error);
      throw error;
    }
  }

  static async addLoginProgress(studentId: Types.ObjectId): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updatedStudent = await studentModel.findOneAndUpdate(
        {
          _id: studentId,
          $or: [
            { lastLoginProgress: { $lt: today } },
            { lastLoginProgress: { $exists: false } },
          ],
        },
        {
          $inc: { progressScore: 0.1 },
          $set: { lastLoginProgress: new Date() },
          $max: { progressScore: 100 },
        },
        { new: true }
      );

      return updatedStudent?.progressScore || 0;
    } catch (error) {
      console.error("Error adding login progress:", error);
      throw error;
    }
  }
}
