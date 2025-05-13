export const TO_BYTE = 1024 * 1024;

export type TAllowedFileTypes = "video" | "image" | "pdf";

const fileTypes: Record<TAllowedFileTypes, string[]> = {
  video: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-flv",
    "video/x-ms-wmv",
  ],
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/svg+xml",
    "image/tiff",
  ],
  pdf: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ],
};

const maxSizes: Record<TAllowedFileTypes, number> = {
  video: 2000 * TO_BYTE,
  pdf: 22 * TO_BYTE,
  image: 2 * TO_BYTE,
};

export function getAllowedMimeTypes(type: TAllowedFileTypes): string[] {
  return fileTypes[type];
}

export function maxFileSize(type: TAllowedFileTypes): number {
  return maxSizes[type];
}

export function validateFile(
  file: File | undefined,
  type: TAllowedFileTypes,
): { valid: boolean; error?: string } {
  if (!file)
    return {
      valid: false,
      error: `Please select a ${type} file to proceed.`,
    };

  const maxSize = maxFileSize(type);
  const allowedTypes = getAllowedMimeTypes(type);

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format. Please select a ${type} file.`,
    };
  }
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxSize / TO_BYTE}MB.`,
    };
  }
  return { valid: true };
}
