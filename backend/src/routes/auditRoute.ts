/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { AuthenticatedRequest } from "../types/express.js";
import auditLogModel from "../models/auditLogModel.js";

const router = express.Router();

router.get(
  "/audit-logs",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { page = 1, limit = 50, action, entityType } = req.query;

      // Build filter
      const filter: any = {};
      if (action) filter.action = action;
      if (entityType) filter.entityType = entityType;

      // Get logs with pagination
      const logs = await auditLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate("userId", "email fullName")
        .populate("targetUserId", "email fullName");

      res.status(200).json(logs);
    } catch (error: any) {
      console.error("Audit log fetch error:", error);
      res.status(500).json({
        message: "Failed to fetch audit logs",
      });
    }
  }
);

export default router;
