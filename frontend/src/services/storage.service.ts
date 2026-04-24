import { APIConfig } from "@/lib/api.config";

export type StorageFolder =
  | "avatars"
  | "course-images"
  | "course-videos"
  | "lesson-materials"
  | "assignments"
  | "course-badges"
  | "chat-attachments";

// Per-folder allowed MIME types (from API spec)
const FOLDER_ALLOWED_TYPES: Record<StorageFolder, string[]> = {
  "avatars":          ["image/jpeg", "image/png", "image/webp", "image/gif"],
  "course-images":    ["image/jpeg", "image/png", "image/webp"],
  "course-videos":    ["video/mp4", "video/webm", "video/quicktime"],
  "lesson-materials": ["application/pdf", "audio/mpeg", "audio/ogg", "audio/wav", "video/mp4"],
  "assignments":      ["application/pdf", "video/mp4", "image/jpeg", "image/png", "application/zip"],
  "course-badges":    ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  "chat-attachments": [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "application/pdf", "video/mp4", "video/webm",
    "audio/mpeg", "audio/ogg", "audio/wav",
    "application/zip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
};

/**
 * Pick the best folder for a given file based on its MIME type.
 * Falls back to "assignments" which has the broadest type support.
 */
export function pickFolder(file: File, preferred?: StorageFolder): StorageFolder {
  if (preferred) {
    const allowed = FOLDER_ALLOWED_TYPES[preferred];
    if (allowed.includes(file.type)) return preferred;
  }
  // Auto-select based on MIME type
  if (file.type.startsWith("video/")) return "course-videos";
  if (file.type.startsWith("image/")) return "course-images";
  if (file.type === "application/pdf") return "assignments";
  if (file.type.startsWith("audio/")) return "lesson-materials";
  return "assignments"; // broadest fallback
}

interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn?: number;
}

export default class StorageService {
  static async getPresignedUpload(
    folder: StorageFolder,
    file: File
  ): Promise<PresignedUploadResponse> {
    const response = await APIConfig.fetch("/storage/presigned-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder,
        fileName: file.name,
        contentType: file.type,
        contentLength: file.size,
      }),
    });
    return response.json();
  }

  static async uploadFile(uploadUrl: string, file: File): Promise<void> {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  }

  /**
   * Upload a file and return its public CDN URL.
   * Automatically picks the correct folder based on file type if not specified.
   */
  static async upload(folder: StorageFolder, file: File): Promise<string> {
    const resolvedFolder = pickFolder(file, folder);
    const { uploadUrl, publicUrl } = await this.getPresignedUpload(resolvedFolder, file);
    await this.uploadFile(uploadUrl, file);
    return publicUrl;
  }

  /**
   * Upload a file and return the R2 object key (for API submission payloads).
   * Automatically picks the correct folder based on file type if not specified.
   */
  static async uploadGetKey(folder: StorageFolder, file: File): Promise<string> {
    const resolvedFolder = pickFolder(file, folder);
    const { uploadUrl, key } = await this.getPresignedUpload(resolvedFolder, file);
    await this.uploadFile(uploadUrl, file);
    return key;
  }
}
