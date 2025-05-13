export const StudentWelcomeMessage: { title: string; content: string } = {
  title: `Welcome to GGECL! 🥳`,
  content: `We're thrilled to have you on board!. Need help? Visit our support page or reach out anytime. 🚀`,
};
export const InstructorWelcomeMessage: { title: string; content: string } = {
  title: `Welcome to GGECL! 🥳`,
  content: `We're thrilled to have you on board!. Need help? Visit our support page or reach out anytime. 🚀`,
};
export const VERIFY_EMAIL_TEXT = (link: string) =>
  `Click this link to verify your email: ${link}`;
export const ENROLL_EMAIL_TEXT = (
  link: string,
  email: string,
  password: string
) =>
  `Your email is ${email} and password is ${password}, follow this link to login to your account: ${link}`;
export const FORGOT_PASSWORD_EMAIL_TEXT = (link: string) =>
  `Click this link to verify your email: ${link}`;
export const FORGOT_PASSWORD_SUBJECT = "Verify Your Email Address";
export const VERIFY_EMAIL_SUBJECT = "Verify Your Email Address";
export const ENROLL_EMAIL_SUBJECT = "Email Verification";
