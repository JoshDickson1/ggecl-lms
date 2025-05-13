import { z } from "zod";
import { Schema } from "mongoose";

export const CartZodSchema = z.object({
  _id: z.string(),
  title: z.string(),
  instructor: z.string(),
  totalRating: z.number().default(0),
  totalStar: z.number().default(0),
  duration: z.string(),
  lectures: z.number(),
  level: z.string(),
  price: z.number(),
  img: z.string(),
  badge: z.string().optional(),
});

export type ICart = z.infer<typeof CartZodSchema>;

export const CartSchema = new Schema<ICart>({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  totalRating: { type: Number, default: 0 },
  totalStar: { type: Number, default: 0 },
  duration: { type: String, required: true },
  lectures: { type: Number, required: true },
  level: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true },
  badge: String,
});
