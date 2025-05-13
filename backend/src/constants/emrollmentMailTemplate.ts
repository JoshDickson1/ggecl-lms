import { UserRole } from "../utils/roleMappings.js";

type EnrollmentProps<T> = {
  username: T;
  link: T;
  password: T;
  email: T;
  role: UserRole;
};

export function enrollMail<T>({
  username,
  link,
  password,
  email,
  role,
}: EnrollmentProps<T>) {
  const styles = {
    container: `
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    `,
    header: `
      text-align: center;
      color: #123354;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
      font-weight: 600;
      letter-spacing: -0.5px;
    `,
    text: `
      line-height: 1.6;
      font-size: 1.05rem;
      color: #424242;
      margin: 1rem 0;
    `,
    buttonContainer: `
      text-align: center;
      margin: 2rem 0;
    `,
    button: `
      display: inline-block;
      background-color: #123354;
      color: #ffffff;
      text-decoration: none;
      padding: 0.8rem 2rem;
      border-radius: 8px;
      font-weight: 500;
      transition: transform 0.1s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `,
    footer: `
      text-align: center;
      font-size: 0.9rem;
      color: #757575;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eeeeee;
    `,
  };

  const roleFormatted = role.charAt(0).toUpperCase() + role.slice(1);
  const article = /^[aeiou]/i.test(roleFormatted) ? "an" : "a";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0.5rem; background: #f5f5f5;">
  <div style="${styles.container}">
    <header>
      <h2 style="${styles.header}">Hello ${username}, Welcome to GGECL</h2>
    </header>
    <main style="padding: 0 1rem;">
      <p style="${styles.text}">
        You have been enrolled in GGECL as ${article} ${roleFormatted}. Below are your login credentials:
      </p>
      <p style="${styles.text}">
        Email: ${email}<br>
        Password: ${password}
      </p>
      <div style="${styles.buttonContainer}">
        <a href="${link}" 
           style="${styles.button}"
           role="button"
           aria-label="Login">
          Login
        </a>
      </div>
      <p style="${styles.text}; font-size: 0.95rem;">
        You can update your password after logging in.
      </p>
    </main>
    <footer style="${styles.footer}">
      <p style="margin: 0;">
        &copy; ${new Date().getFullYear()} GGECL. All rights reserved.<br>
        <small>This is an automated message, please do not reply.</small>
      </p>
    </footer>
  </div>
</body>
</html>
  `.trim();
}
