// src/modules/upload/upload.types.ts
export enum UploadCategory {
  ASSIGNMENT = "assignment",
  SUBMISSION = "submission",
  CLASS_MATERIAL = "classMaterial",
  PROFILE = "profile",
  GROUP_DISCUSSION = "groupDiscussion",
}

export interface UploadConfig {
  maxCount: number;
  maxSize: number; // in bytes
  allowedMimeTypes: string[];
  folder: string;
}

export type UploadConfigMap = Record<UploadCategory, UploadConfig>;

export const uploadConfigs: UploadConfigMap = {
  [UploadCategory.ASSIGNMENT]: {
    maxCount: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ],
    folder: "assignments",
  },
  [UploadCategory.SUBMISSION]: {
    maxCount: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    folder: "submissions",
  },
  [UploadCategory.CLASS_MATERIAL]: {
    maxCount: 10,
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
      "audio/mpeg",
      "audio/wav",
    ],
    folder: "class_materials",
  },
  [UploadCategory.PROFILE]: {
    maxCount: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/png"],
    folder: "profiles",
  },
  [UploadCategory.GROUP_DISCUSSION]: {
    maxCount: 5,
    maxSize: 200 * 1024 * 1024, // 200MB
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
    ],
    folder: "group_discussions",
  },
};
