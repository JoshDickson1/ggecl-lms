import { z } from "zod";

export const InstructorLoginResponseSchema = z.object({
    instructor: z.object({
        instructorId: z.string(),
        email: z.string().email(),
        fullName: z.string(),
    }),
    accessToken: z.string(),
})