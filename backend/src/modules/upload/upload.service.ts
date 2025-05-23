/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { UploadCategory, uploadConfigs } from "./upload.types.js";

export class UploadService {
  static async uploadFile(
    buffer: Buffer,
    category: UploadCategory,
    fileName: string,
    userId: string
  ): Promise<UploadApiResponse> {
    const config = uploadConfigs[category];

    const publicId = `${config.folder}/${userId}_${Date.now()}_${fileName}`;

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: this.getResourceType(buffer),
            public_id: publicId,
            folder: config.folder,
          },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("Upload failed"));
            resolve(result);
          }
        )
        .end(buffer);
    });
  }

  static async uploadMultipleFiles(
    files: Array<{ buffer: Buffer; originalname: string }>,
    category: UploadCategory,
    userId: string
  ): Promise<UploadApiResponse[]> {
    return Promise.all(
      files.map((file) =>
        this.uploadFile(file.buffer, category, file.originalname, userId)
      )
    );
  }

  static async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  private static getResourceType(
    buffer: Buffer
  ): "image" | "video" | "raw" | "auto" {
    // Simple detection - in production you might want more robust detection
    const magicNumbers = {
      // JPEG
      ffd8ffe0: "image",
      // PNG
      "89504e47": "image",
      // PDF
      "25504446": "raw",
      // MP4
      "00000020": "video",
      // QuickTime
      "6d6f6f76": "video",
      // MP3
      "494433": "raw",
      // WAV
      "52494646": "raw",
    };

    const hex = buffer.toString("hex", 0, 4);
    return (magicNumbers as any)[hex] || "auto";
  }
}
