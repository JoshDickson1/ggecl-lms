import { z } from "zod";

export const AdminLoginResponseSchema = z.object({
    admin: z.object({
        adminId: z.string(),
        email: z.string().email(),
        fullName: z.string(),
    }),
    accessToken: z.string(),
})