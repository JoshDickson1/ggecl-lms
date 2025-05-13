import { model, Schema, Types } from "mongoose";
import { z } from "zod";

export const AssignmentZodSchema = z.object({
  question: z.string(),
  title: z.string({ required_error: "Title is required" }),
  dueDate: z.date({ required_error: "Due date is required" }),
  grade: z.enum(["A", "B", "C", "D", "E", "F"]).optional(),
  status: z.enum(["pending", "submitted", "graded"]).default("pending"),
  remark: z.string().optional(),
  submissionDate: z.date().optional(),
  submissionPublicId: z.string().optional(),
  submissionFileUrl: z.string().url().optional(),
  submissionFileName: z.string().optional(),
  submissionFileSize: z.number().optional(),
  submissionFileType: z.string().optional(),
});

export type IStudentAssignment = z.infer<typeof AssignmentZodSchema> & {
  _id: Types.ObjectId;
  studentId?: Types.ObjectId;
  course: Types.ObjectId;
  instructorId: Types.ObjectId;
};

export const AssignmentSchema = new Schema<IStudentAssignment>(
  {
    instructorId: Types.ObjectId,
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "student",
    },
    title: { type: String, required: true },
    question: { type: String, required: true },
    course: {
      type: Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["submitted", "graded", "pending"],
      default: "pending",
      required: true,
    },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "E", "F"],
    },
    remark: String,
    submissionDate: Date,
    submissionFileUrl: String,
    submissionPublicId: String,
    submissionFileName: String,
    submissionFileType: String,
    submissionFileSize: Number,
  },
  {
    timestamps: true,
  }
);

const AssignmentModel = model<IStudentAssignment>(
  "assignment",
  AssignmentSchema
);

export default AssignmentModel;
