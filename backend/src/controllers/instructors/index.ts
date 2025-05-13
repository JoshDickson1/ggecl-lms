import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose, { isValidObjectId } from "mongoose";
import Instructor from "../../models/instructorModel.js";
import { CACHE } from "../../utils/nodeCache.js";

export const getInstructorById = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid instructor ID" });
      return;
    }

    const cachedInstructor = CACHE.get(`instructor-${id}`);

    if (cachedInstructor) {
      res.json({ success: true, fromCache: true, data: cachedInstructor });
      return;
    }

    try {
      const instructor = await Instructor.findById(id)
        .populate<{ courses: { title: string; image: string } }>(
          "courses",
          "title image"
        )
        .populate<{ students: { name: string; email: string } }>(
          "students",
          "name email"
        )
        .lean()
        .exec();

      if (!instructor) {
        res.status(404).json({ message: "Instructor not found" });
        return;
      }

      CACHE.set(`instructor-${id}`, instructor);

      res.json({
        success: true,
        data: instructor,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof mongoose.Error.CastError) {
        res.status(400);
        throw new Error("Invalid instructor ID");
      }

      res.status(500);
      throw new Error("Something went wrong");
    }
  }
);
