import { APIConfig } from "@/lib/api.config";

export type StorageFolder =
  | "avatars"
  | "course-images"
  | "course-videos"
  | "lesson-materials"
  | "assignments"
  | "course-badges";

interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
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

  /** Upload a file and return its public CDN URL. */
  static async upload(folder: StorageFolder, file: File): Promise<string> {
    const { uploadUrl, publicUrl } = await this.getPresignedUpload(folder, file);
    await this.uploadFile(uploadUrl, file);
    return publicUrl;
  }

  /** Upload a file and return the R2 object key (for API submission payloads). */
  static async uploadGetKey(folder: StorageFolder, file: File): Promise<string> {
    const { uploadUrl, key } = await this.getPresignedUpload(folder, file);
    await this.uploadFile(uploadUrl, file);
    return key;
  }
}
