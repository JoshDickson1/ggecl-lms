import { Request, Response, NextFunction, RequestHandler } from "express";
import * as jwt from "jsonwebtoken";
import { verifyToken } from "../utils/tokenUtils.js";
import { UserRole } from "../utils/roleMappings.js";
import { AuthenticatedRequest } from "../types/express.js";

// Define the shape of the authenticated request locally

export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      res.status(401).json({ message: "No authentication token found" });
      return;
    }

    const decoded = verifyToken(token, "accessToken");

    // Cast the request to the extended type
    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      role: decoded.role as UserRole,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
    } else {
      res.status(500).json({ message: "Authentication failed", error });
    }
  }
};
