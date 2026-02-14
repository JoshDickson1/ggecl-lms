import { sendMailToEmail } from "./resendClient.js"; // ✅ Changed from "./sendMailToEmail.js"
import { z } from "zod";
import { combinedUserModel, UserRole } from "../utils/roleMappings.js";
import {
  constructVerificationLink,
  generateVerificationToken,
} from "./verification.js";
import { verifyEmailHtml } from "../constants/verifyEmailHtml.js";
import {
  VERIFY_EMAIL_SUBJECT,
  VERIFY_EMAIL_TEXT,
} from "../constants/messages.js";

// Schemas for validation
export const verifyEmailSchema = z.object({
  token: z
    .string()
    .length(128)
    .regex(/^[a-f0-9]+$/i),
  role: z.enum(["student", "instructor"]),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
  role: z.enum(["student", "instructor"]),
});

export const emailService = (role: UserRole) => {
  const UserModel = combinedUserModel(role);

  async function initiateEmailVerification(userId: string, email: string) {
    try {
      const { token, expires } = generateVerificationToken();
  
      const user = await UserModel.findByIdAndUpdate(
        userId,
        {
          emailVerificationToken: token,
          emailVerificationExpires: expires,
        },
        { new: true, runValidators: true, upsert: true }
      ).select("+emailVerificationToken +emailVerificationExpires");
  
      if (!user) {
        throw new Error("User not found");
      }
  
      const verificationLink = constructVerificationLink(token);
  
      let result;
  
      // ✅ Only send email if SENDMAIL=true explicitly
      if (process.env.SENDMAIL === "true") {
        result = await sendMailToEmail({
          toEmail: email,
          html: verifyEmailHtml(user.fullName, verificationLink),
          message: VERIFY_EMAIL_TEXT(verificationLink),
          subject: VERIFY_EMAIL_SUBJECT,
        });
      } else {
        console.log(
          "📧 Email sending skipped because SENDMAIL is not true",
          "Verification link:",
          verificationLink
        );
      }
  
      return result;
    } catch (error) {
      console.error(`Email verification initiation failed:`, error);
  
      // 🔥 Throw error only if email sending was intended
      if (process.env.SENDMAIL === "true") {
        throw error;
      }
  
      // In dev mode, just log and continue
      return {
        success: false,
        skipped: true,
      };
    }
  }
  

  async function verifyEmailToken(token: string): Promise<boolean> {
    try {
      const user = await UserModel.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      });

      if (!user) return false;

      await UserModel.findByIdAndUpdate(user._id, {
        $unset: {
          emailVerificationToken: 1,
          emailVerificationExpires: 1,
        },
        $set: { emailVerified: true },
      });

      return true;
    } catch (error) {
      console.error(`Email verification failed for ${role}:`, error);
      return false;
    }
  }

  return {
    initiateEmailVerification,
    verifyEmailToken,
  };
};