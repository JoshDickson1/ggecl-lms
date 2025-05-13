import jwt from "jsonwebtoken";
import { envConfig } from "../config/envValidator.js";

type TokenType = "accessToken" | "refreshToken";

const TOKEN_CONFIG = {
  accessToken: {
    secret: envConfig.accessToken,
    expiresIn: "15m", // Short-lived
  },
  refreshToken: {
    secret: envConfig.refreshToken,
    expiresIn: "7d", // Long-lived
  },
} as const;

export function verifyToken(token: string, type: TokenType) {
  return jwt.verify(token, TOKEN_CONFIG[type].secret) as {
    id: string;
    role: string;
  };
}
