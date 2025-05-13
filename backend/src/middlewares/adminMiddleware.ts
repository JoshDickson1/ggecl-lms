/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from "express";
import Admin from "../models/adminModel.js";
import { createErrorResponse } from "../utils/responseUtils.js";
import { verifyToken } from "../utils/tokenUtils.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "admin" | "superadmin";
        permissions: string[];
      };
    }
  }
}

export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return createErrorResponse(res, 401, "Authorization token required", [
        { message: "MISSING_AUTH_TOKEN" },
      ]);
    }

    // Verify token using your centralized token utility
    let decoded;
    try {
      decoded = verifyToken(token, "accessToken");
    } catch (error) {
      return createErrorResponse(res, 401, "Invalid or expired token", [
        {
          message: "INVALID_TOKEN",
          details: error instanceof Error ? error.message : String(error),
        },
      ]);
    }

    if (!decoded.id || !decoded.role) {
      return createErrorResponse(res, 401, "Invalid token payload", [
        { code: "INVALID_TOKEN_PAYLOAD" },
      ]);
    }

    const admin = await Admin.findById(decoded.id)
      .select("-password -refreshToken -__v")
      .lean();

    if (!admin) {
      return createErrorResponse(res, 401, "Admin account not found", [
        { message: "ADMIN_NOT_FOUND" },
      ]);
    }

    if (admin.role !== "admin" && admin.role !== "superadmin") {
      return createErrorResponse(res, 403, "Invalid admin role", [
        { message: "INVALID_ADMIN_ROLE" },
      ]);
    }

    req.user = {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    };

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    createErrorResponse(res, 500, "Internal authentication error", [
      {
        message: "AUTH_INTERNAL_ERROR",
        details: error instanceof Error ? error.message : String(error),
      },
    ]);
  }
};

export const superAdminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await adminAuth(req, res, () => {
    try {
      if (!req.user) {
        return createErrorResponse(res, 403, "Authentication required", [
          { message: "AUTHENTICATION_REQUIRED" },
        ]);
      }

      if (req.user.role !== "superadmin") {
        return createErrorResponse(res, 403, "Superadmin privileges required", [
          {
            message: "SUPERADMIN_REQUIRED",
            requiredRole: "superadmin",
            currentRole: req.user.role,
          },
        ]);
      }

      next();
    } catch (error) {
      console.error("Superadmin auth error:", error);
      createErrorResponse(res, 500, "Internal authorization error", [
        {
          message: "AUTH_INTERNAL_ERROR",
          details: error instanceof Error ? error.message : String(error),
        },
      ]);
    }
  });
};

export const checkPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return createErrorResponse(res, 403, "Authentication required", [
          { message: "AUTHENTICATION_REQUIRED" },
        ]);
      }

      if (req.user.role === "superadmin") {
        return next();
      }

      if (!req.user.permissions.includes(requiredPermission)) {
        return createErrorResponse(res, 403, "Insufficient permissions", [
          {
            message: "INSUFFICIENT_PERMISSIONS",
            requiredPermission,
            userPermissions: req.user.permissions,
          },
        ]);
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      createErrorResponse(res, 500, "Internal permission check error", [
        {
          message: "PERMISSION_CHECK_ERROR",
          details: error instanceof Error ? error.message : String(error),
        },
      ]);
    }
  };
};
