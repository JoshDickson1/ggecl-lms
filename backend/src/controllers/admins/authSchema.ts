import { z } from "zod";

export const AdminRegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["admin", "superadmin"]).default("admin"),
  permissions: z.array(z.string()).optional().default([]),
});

export const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const AdminUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  permissions: z.array(z.string()).optional(),
});
