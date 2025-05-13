import { z } from "zod";

export const PasswordUpdateZodSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 8 characters long." }),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Old password cannot be same as new password",
  });