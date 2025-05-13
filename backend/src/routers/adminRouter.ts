import { z } from "zod";
import { protectedProcedure, router } from "../trpc.js";
import { FilterQuery, isValidObjectId } from "mongoose";
import { TRPCError } from "@trpc/server";
import adminModel, { IAdmin } from "../models/adminModel.js";
import { CACHE, wildcardDeleteCache } from "../utils/nodeCache.js";
import { generatePassword } from "../utils/genPassword.js";
import { adminService } from "../services/adminService.js";
import { frontEndLoginLink } from "../utils/feLoginLink.js";
import { sendMailToEmail } from "../services/sendMailToEmail.js";
import { enrollMail } from "../constants/emrollmentMailTemplate.js";
import {
  ENROLL_EMAIL_SUBJECT,
  ENROLL_EMAIL_TEXT,
} from "../constants/messages.js";
import { uploadImageIfNeeded } from "../utils/imageUploader.js";
import { PasswordUpdateZodSchema } from "../models/passwordUpdateSchema.js";

// Types
type IAdminSummary = Omit<
  IAdmin,
  | "password"
  | "refreshToken"
  | "emailVerificationExpires"
  | "emailVerificationToken"
  | "passwordUpdateToken"
  | "passwordUpdateTokenExpiry"
>;

interface IAdminListResponse {
  admins: IAdminSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Input validation
const GetAdminByIdZodSchema = z.object({
  id: z
    .string()
    .refine(isValidObjectId, { message: "Invalid MongoDB ObjectId" }),
});

const GetAdminsZodSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  search: z.string().optional(),
  sortBy: z
    .enum(["isVerified", "fullName", "email", "schRole"])
    .default("isVerified"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

const AdminEnrollmentSchema = z.object({
  email: z.string().email("Invalid email format"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  picture: z.string().url("Invalid URL format").optional(),
});

// Schema for fields that can be edited.
const AdminEditableSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  picture: z.string(),
});
// Schema for updating an instructor.
const AdminUpdateSchema = z.object({
  data: AdminEditableSchema.partial(),
  id: z.string().refine(isValidObjectId, { message: "Invalid instructor ID" }),
});

// Helpers

type TGetAdminsInput = z.infer<typeof GetAdminsZodSchema>;
type TAdminUpdatable = z.infer<typeof AdminEditableSchema>;

const getCacheKey = (input: TGetAdminsInput) => {
  const { page, limit, search, sortBy, order } = input;
  return `admins-${page}-${limit}-${search}-${sortBy}-${order}`;
};

export const adminRouter = router({
  enroll: protectedProcedure
    .input(AdminEnrollmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: adminId, role } = ctx.user;

      try {
        const adminExists = await adminModel.exists({ _id: adminId });

        if (!adminExists || role !== "admin") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Only admins can enroll admins",
          });
        }

        const adminToEnrollExists = await adminService.findAdminByEmail(
          input.email
        );

        if (adminToEnrollExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Admin with email ${input.email} has already been registered`,
          });
        }

        const adminPassword = generatePassword(8);

        const adminEnrollmentData = {
          ...input,
          isVerified: true,
          password: adminPassword,
        };

        const admin = await adminService.createAdmin(adminEnrollmentData);

        const adminEmail = admin.email;
        const adminLoginLink = frontEndLoginLink("admin");

        await sendMailToEmail({
          toEmail: adminEmail,
          html: enrollMail({
            email: adminEmail,
            link: adminLoginLink,
            password: adminPassword,
            role: "admin",
            username: admin.fullName,
          }),
          message: ENROLL_EMAIL_TEXT(adminLoginLink, adminEmail, adminPassword),
          subject: ENROLL_EMAIL_SUBJECT,
        });

        return { success: true, admin };
      } catch (error) {
        console.error("An Error occured while trying to enroll admin");
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occured",
        });
      }
    }),

  getById: protectedProcedure
    .input(GetAdminByIdZodSchema)
    .query(async ({ ctx, input }) => {
      const { id: adminId } = input;
      const { role } = ctx.user;

      const cacheKey = `admin-${adminId}`;
      const cachedAdmin = CACHE.get<IAdminSummary>(cacheKey);

      if (cachedAdmin) {
        console.log(`[CACHE] Hit for ${cacheKey}`);
        return cachedAdmin;
      }

      console.log(`[CACHE] Miss for ${cacheKey}`);

      try {
        if (role !== "admin") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Only admins can view admin information.",
          });
        }

        const admin = await adminModel
          .findById(adminId)
          .select(
            "-password -refreshToken -emailVerificationExpires -emailVerificationToken -passwordUpdateToken -passwordUpdateTokenExpiry"
          )
          .lean()
          .exec();

        if (!admin) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Admin with id ${adminId} was not found`,
          });
        }

        CACHE.set(cacheKey, admin);
        console.log(`[CACHE] Set for ${cacheKey}`);

        return admin as IAdminSummary;
      } catch (error) {
        console.error(`[ERROR] Failed to get admin (${adminId}):`, error);
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred. Please try again later.",
        });
      }
    }),

  getAll: protectedProcedure
    .input(GetAdminsZodSchema)
    .query(async ({ input, ctx }) => {
      const { role } = ctx.user;

      if (role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can view all admins.",
        });
      }

      const cacheKey = getCacheKey(input);
      const cachedData = CACHE.get<IAdminListResponse>(cacheKey);

      if (cachedData) {
        console.log(`[CACHE] Hit for ${cacheKey}`);
        return cachedData;
      }
      console.log(`[CACHE] Miss for ${cacheKey}`);

      const { page, limit, search, sortBy, order } = input;

      const skip = (page - 1) * limit;
      const sortOrder = order === "asc" ? 1 : -1;

      const searchQuery: FilterQuery<IAdminSummary> = {};
      if (search) {
        searchQuery.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder };

      try {
        const [admins, total] = await Promise.all([
          adminModel
            .find(searchQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .select(
              "-password -refreshToken -passwordUpdateToken -passwordUpdateTokenExpiry"
            )
            .lean(),
          adminModel.countDocuments(searchQuery),
        ]);

        const response = {
          admins,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };

        CACHE.set(cacheKey, response);
        console.log(`[CACHE] Set for ${cacheKey}`);

        return response;
      } catch (error) {
        console.error("[ERROR] Fetching admins failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch admins",
        });
      }
    }),

  update: protectedProcedure
    .input(AdminUpdateSchema)
    .mutation(async ({ input }) => {
      const { id: adminId, data } = input;

      const imageUrl = await uploadImageIfNeeded(data.picture);

      const updatePayload: Partial<TAdminUpdatable> = {
        ...data,
        ...(imageUrl && { picture: imageUrl }),
      };

      try {
        const updatedAdmin = await adminModel.findByIdAndUpdate(
          adminId,
          updatePayload,
          {
            new: true,
            runValidators: true,
          }
        );

        if (!updatedAdmin) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No admin found with id "${adminId}"`,
          });
        }

        CACHE.del(`admin-${adminId}`);
        wildcardDeleteCache("admins-");

        return updatedAdmin;
      } catch (dbErr) {
        console.error("[ERROR] Database update failed:", dbErr);
        if (dbErr instanceof TRPCError) throw dbErr;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not update admin record",
          cause: dbErr,
        });
      }
    }),

  updatePasswordWithOld: protectedProcedure
    .input(PasswordUpdateZodSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: adminId, role } = ctx.user;
      const { currentPassword, newPassword } = input;

      if (role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Admin role required",
        });
      }

      try {
        const admin = await adminModel.findById(adminId);
        if (!admin) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Admin user not found",
          });
        }

        const isPasswordMatch = await admin.comparePassword(currentPassword);

        if (!isPasswordMatch) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Incorrect credentials",
          });
        }

        const newHashedPassword = await adminService.hashPassword(newPassword);

        admin.password = newHashedPassword;

        await admin.save();

        return { success: true };
      } catch (error) {
        console.error(
          "An error occured while trying to update admin password: ",
          error instanceof Error ? error.message : error
        );

        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not update password",
        });
      }
    }),
});
