import { Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Student from "../../models/studentModel.js";

import { AuthenticatedRequest } from "../../types/express.js";
import { CACHE } from "../../utils/nodeCache.js";

export const getStudentById = asyncHandler(
  async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
    const id = req.params.id;
    const studentId = req.user.id;

    const cachedStudent = CACHE.get(`student-${studentId}`);

    if (cachedStudent) {
      res.json({ success: true, fromCache: true, data: cachedStudent });
      return;
    }

    if (id !== studentId) {
      res.status(403).json({ message: "Not authorized to view this student" });
      return;
    }

    try {
      const student = await Student.findById(id)
        .select(
          "-password -refreshToken -emailVerificationExpires -emailVerificationToken"
        )
        .lean()
        .exec();

      if (!student) {
        res.status(404).json({ message: "Student not found" });
        return;
      }

      CACHE.set(`student-${id}`, student);

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof mongoose.Error.CastError) {
        res.status(400);
        throw new Error("Invalid student ID");
      }

      res.status(500);
      throw new Error("Something went wrong");
    }
  }
);
