import { Schema, model, Types } from "mongoose";
import { type Review, ReviewSchema } from "./reviewSchema.js";

export interface ICourse {
  _id: Types.ObjectId;
  title: string;
  instructor: Types.ObjectId;
  students: Types.ObjectId[];
  description: string;
  videoUrl: string;
  certification: string;
  syllabus: string[];
  reviews: Review[];
  totalRating: number;
  totalStar: number;
  duration: string;
  lectures: number;
  level: string;
  price: number;
  img: string;
  badge?: string;
}

export const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true, unique: true },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: "instructor",
    required: true,
  },
  students: {
    type: [Schema.Types.ObjectId],
    ref: "student",
  },
  videoUrl: {
    type: String,
    required: true,
  },
  description: { type: String, required: true },
  certification: { type: String, defualt: "Normal" },
  syllabus: { type: [String], default: [] },
  reviews: { type: [ReviewSchema], default: [] },
  totalRating: { type: Number },
  totalStar: { type: Number },
  duration: { type: String, required: true },
  lectures: { type: Number, required: true },
  level: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true },
  badge: String,
});

export default model<ICourse>("course", CourseSchema);
