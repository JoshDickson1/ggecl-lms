import { envConfig } from "../config/envValidator.js";
import { UserRole } from "./roleMappings.js";

export const frontEndLoginLink = (role: UserRole) =>
  `${envConfig.FRONTEND_BASE_URL}${role === "student" ? "" : "/" + role}/login`;