import { Response, NextFunction } from "express";
import { UserRole } from "../utils/roleMappings.js";
import { AuthenticatedRequest } from "../types/express.js";

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Forbidden: Requires ${allowedRoles.join(" or ")} role`,
      });
      return;
    }

    next();
  };
};
