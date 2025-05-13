import { Schema } from "mongoose";
import { z } from "zod";

export const NotificationZodSchema = z.object({
  title: z.string(),
  content: z.string(),
  createdAt: z.date(),
  isRead: z.boolean(),
});

export type INotification = z.infer<typeof NotificationZodSchema>;

export const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});
