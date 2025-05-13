import * as z from "zod";

export const LoginResponseSchema = z.object({
  student: z.object({
    studentId: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    gender: z.string(),
  }),
  accessToken: z.string(),
});

export const SignupResponseSchema = LoginResponseSchema;
