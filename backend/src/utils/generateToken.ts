import jwt, { Secret } from "jsonwebtoken";
import { envConfig } from "../config/envValidator.js";
import { TOKEN_EXPIRY } from "../constants/auth.js";
import { UserRole } from "./roleMappings.js";

interface GenerateTokenType {
  id: string;
  type: "accessToken" | "refreshToken";
  role: UserRole;
}

export function generateToken({ id, type, role }: GenerateTokenType) {
  return jwt.sign({ id, role }, envConfig[type] as Secret, {
    expiresIn: TOKEN_EXPIRY[type],
  });
}
