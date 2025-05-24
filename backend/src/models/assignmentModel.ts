import { Document, Schema, model, Types } from "mongoose";
import { z } from "zod";

export const AssignmentFileSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  size: z.number(),
});

export type IAssignmentFile = z.infer<typeof AssignmentFileSchema>;

export const AssignmentZodSchema = z.object({
  title: z.string({ required_error: "Title is required" }),
  description: z.string().optional(),
  dueDate: z.date({ required_error: "Due date is required" }),
  grade: z.enum(["A", "B", "C", "D", "E", "F"]).optional(),
  status: z
    .enum(["draft", "published", "submitted", "graded"])
    .default("draft"),
  remark: z.string().optional(),
  submissionDate: z.date().optional(),
  files: z.array(AssignmentFileSchema).optional(),
  submissionFiles: z.array(AssignmentFileSchema).optional(),
  studentId: z.instanceof(Types.ObjectId).optional(),
  course: z.instanceof(Types.ObjectId),
  instructorId: z.instanceof(Types.ObjectId),
  instructorModel: z.enum(["Admin", "Instructor"]),
  classroomId: z.instanceof(Types.ObjectId).optional(),
  groupId: z.instanceof(Types.ObjectId).optional(),
  isMarked: z.boolean().default(false),
});

export type IAssignment = z.infer<typeof AssignmentZodSchema> & Document;

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    description: String,
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: "Classroom" },
    groupId: { type: Schema.Types.ObjectId, ref: "Group" },
    instructorId: {
      type: Schema.Types.ObjectId,
      refPath: "instructorModel",
      required: true,
    },
    instructorModel: {
      type: String,
      required: true,
      enum: ["Admin", "Instructor"],
    },
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "submitted", "graded"],
      default: "draft",
    },
    grade: { type: String, enum: ["A", "B", "C", "D", "E", "F"] },
    remark: String,
    submissionDate: Date,
    files: [
      {
        url: String,
        publicId: String,
        fileName: String,
        fileType: String,
        size: Number,
      },
    ],
    submissionFiles: [
      {
        url: String,
        publicId: String,
        fileName: String,
        fileType: String,
        size: Number,
      },
    ],
    isMarked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for better query performance
AssignmentSchema.index({ course: 1, status: 1 });
AssignmentSchema.index({ instructorId: 1 });
AssignmentSchema.index({ studentId: 1 });
AssignmentSchema.index({ dueDate: 1 });
AssignmentSchema.index({ classroomId: 1 });
AssignmentSchema.index({ groupId: 1 });

export default model<IAssignment>("Assignment", AssignmentSchema);
