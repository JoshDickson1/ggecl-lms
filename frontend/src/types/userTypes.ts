import {
  GetAdminOutput,
  GetInstructorOutput,
  GetStudentOutput,
} from "@/utils/trpc";
import z from "zod";

export type UserRole = "student" | "instructor" | "admin";

// ==================== Shared Schemas ====================
const NotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  createdAt: z.string().optional(),
  isRead: z.boolean().optional().default(false),
});

const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewer: z.string().min(1, "Reviewer name is required"),
  date: z.string(),
  comment: z.string().min(1, "Comment is required"),
  image: z.string().url("Invalid image URL"),
  stars: z.number().min(0).max(5),
});

// ============= Student schema ========== //
const StudentSchemaNotificationSchema = NotificationSchema;

export const StudentSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  gender: z.enum(["male", "female", "other"]).default("other"),
  picture: z.string(),
  username: z.string(),
  googleSignIn: z.boolean(),
  emailVerified: z.boolean(),
  isVerified: z.boolean(),
  email: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  notifications: z.array(StudentSchemaNotificationSchema),
});

// ==================== Instructor Schema ====================
const InstructorNotificationSchema = NotificationSchema;
const InstructorTopicsSchema = z.array(z.string().min(1));

export const InstructorSchema = z.object({
  fullName: z.string(),
  gender: z.enum(["male", "female", "other"]).default("other"),
  picture: z.string().url(),
  username: z.string(),
  googleSignIn: z.boolean(),
  emailVerified: z.boolean(),
  isVerified: z.boolean(),
  email: z.string().email(),

  notifications: z.array(InstructorNotificationSchema).default([]),

  reviews: z.array(ReviewSchema).default([]),
  students: z.array(z.string()).default([]),
  courses: z.array(z.string()).default([]),
  bio: z.string().default(""),
  topics: InstructorTopicsSchema.default([]),
});

// ==================== Utility Types ====================
export type Student = GetStudentOutput;
export type Instructor = GetInstructorOutput;
export type Admin = GetAdminOutput;

export type Review = z.infer<typeof ReviewSchema>;

export type TUser = Student | Instructor | Admin | null;
