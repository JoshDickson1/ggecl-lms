import { APIConfig } from "@/lib/api.config";

export class FileUploadService {
  /**
   * Upload a file and return the URL
   * @param file - File to upload
   * @returns Promise<string> - URL of the uploaded file
   */
  static async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await APIConfig.fetch('/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData - browser sets it automatically with boundary
    });

    const result = await response.json();
    return result.url;
  }

  /**
   * Validate file type and size
   * @param file - File to validate
   * @returns boolean - True if file is valid
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 10MB'
      };
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Please upload images, PDFs, or text documents'
      };
    }

    return { valid: true };
  }
}
