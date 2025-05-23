// models/classroomModel.ts
import { Schema, model, Document, Types } from "mongoose";

interface IClassroomActivity {
  title: string;
  description?: string;
  files: {
    url: string;
    name: string;
    type: "video" | "pdf" | "document" | "audio" | "image";
  }[];
  createdAt: Date;
  createdBy: Types.ObjectId;
}

interface IClassroomAttendance {
  student: Types.ObjectId;
  duration: number; // in minutes
  date: Date;
}

interface IGroupAssignment {
  assignmentId: Types.ObjectId;
  grades: {
    student: Types.ObjectId;
    score: number;
    feedback?: string;
    gradedBy: Types.ObjectId;
    gradedAt: Date;
  }[];
}
interface IClassroomGroup {
  name: string;
  students: Types.ObjectId[];
  assignments: IGroupAssignment[]; // Updated to include grades
  createdAt: Date;
  createdBy: Types.ObjectId;
}

interface IClassroom extends Document {
  name: string;
  course: Types.ObjectId;
  instructors: Types.ObjectId[];
  students: Types.ObjectId[];
  activities: IClassroomActivity[];
  groups: IClassroomGroup[];
  attendance: IClassroomAttendance[];
  createdAt: Date;
  updatedAt: Date;
}

const classroomActivitySchema = new Schema<IClassroomActivity>({
  title: { type: String, required: true },
  description: { type: String },
  files: [
    {
      url: { type: String, required: true },
      name: { type: String, required: true },
      type: {
        type: String,
        enum: ["video", "pdf", "document", "audio", "image"],
        required: true,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const classroomAttendanceSchema = new Schema<IClassroomAttendance>({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  duration: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

const groupAssignmentSchema = new Schema<IGroupAssignment>({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  grades: [
    {
      student: { type: Schema.Types.ObjectId, ref: "User", required: true },
      score: { type: Number, required: true },
      feedback: { type: String },
      gradedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      gradedAt: { type: Date, default: Date.now },
    },
  ],
});
const classroomGroupSchema = new Schema<IClassroomGroup>({
  name: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "User" }],
  assignments: [groupAssignmentSchema], // Updated to use the new schema
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const classroomSchema = new Schema<IClassroom>(
  {
    name: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    instructors: [{ type: Schema.Types.ObjectId, ref: "User" }],
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
    activities: [classroomActivitySchema],
    groups: [classroomGroupSchema],
    attendance: [classroomAttendanceSchema],
  },
  { timestamps: true }
);

const ClassroomModel = model<IClassroom>("Classroom", classroomSchema);

export {
  ClassroomModel,
  IClassroom,
  IClassroomActivity,
  IClassroomGroup,
  IClassroomAttendance,
};
