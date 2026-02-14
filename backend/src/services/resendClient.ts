import { Resend } from 'resend';
import { envConfig } from "../config/envValidator.js";

const resend = new Resend(envConfig.resendApiKey);

interface SendMailParams {
  toEmail: string;
  html?: string;
  message: string;
  subject: string;
}

export async function sendMailToEmail({
  toEmail,
  html,
  message,
  subject,
}: SendMailParams) {
  try {
    const result = await resend.emails.send({
      from: envConfig.fromEmail,
      to: toEmail,
      subject,
      html: html || message,
      text: message,
    });

    console.log(`✅ Email sent to ${toEmail}`, result);
    return result;
  } catch (error) {
    console.error(`❌ Error sending email to ${toEmail}:`, error);
    throw error;
  }
}