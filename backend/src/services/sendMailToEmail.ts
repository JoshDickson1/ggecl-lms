import { envConfig } from "../config/envValidator.js";
import { transporter } from "./mailer.js";

interface SendMailToEmailParams {
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
}: SendMailToEmailParams) {
  const mailOptions = {
    from: envConfig.emailAddr,
    to: toEmail,
    subject,
    html,
    text: message,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${toEmail}`);
    return result;
  } catch (error) {
    console.error(`Error sending verification email to ${toEmail}:`, error);
    throw error;
  }
}
