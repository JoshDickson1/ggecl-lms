/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Document, Types } from "mongoose";

// Important actions in the LMS
export enum AuditAction {
  // Course actions
  COURSE_CREATED = "COURSE_CREATED",
  COURSE_DELETED = "COURSE_DELETED",

  // Group actions
  CLASSROOM_GROUP_CREATED = "GROUP_CREATED",
  CLASSROOM_GROUP_DELETED = "GROUP_DELETED",

  // System actions
  LOGIN_FAILED = "LOGIN_FAILED",
  CONTENT_REPORTED = "CONTENT_REPORTED",
}

export enum EntityType {
  COURSE = "COURSE",
  CLASSROOM = "CLASSROOM",
  CLASSROOM_GROUP = "GROUP",
  USER = "USER",
}

export interface IAuditLog extends Document {
  action: AuditAction;
  userId: Types.ObjectId; // Who performed the action
  userRole: "admin" | "instructor" | "student";
  entityType: EntityType;
  entityId?: Types.ObjectId; // Affected course/classroom/group/assignment/user
  targetUserId?: Types.ObjectId; // If action affects another user
  metadata?: {
    ip?: string;
    userAgent?: string;
    changes?: any; // Track field changes (for updates)
    reason?: string;
  };
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, enum: Object.values(AuditAction), required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userRole: {
      type: String,
      required: true,
      enum: ["admin", "instructor", "student"],
    },
    entityType: { type: String, enum: Object.values(EntityType) },
    entityId: { type: Schema.Types.ObjectId },
    targetUserId: { type: Schema.Types.ObjectId, ref: "User" },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Index for faster querying
AuditLogSchema.index({ action: 1, entityType: 1, createdAt: -1 });

export default model<IAuditLog>("AuditLog", AuditLogSchema);
