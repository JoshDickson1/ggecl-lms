import { uploadToCloudinary } from "@/api/services/uploadToCloudinary";
import { useCreateCourseSignature } from "@/components/dashboard/admin/hooks/useCreateCourseSignature";

export function useUploadToCloud() {
  const { createSignatureCloudinary } = useCreateCourseSignature();

  async function uploadToCloud(
    file: File,
    resourceType: "image" | "video",
    folderName: string,
    progressCb: (n: number) => void,
  ) {
    const sig = await createSignatureCloudinary({
      originalFileName: file.name,
      folder: folderName,
    });

    const { apiKey, timestamp, folder, publicId, signature, cloudName } = sig;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("folder", folder);
    formData.append("public_id", publicId);
    formData.append("signature", signature);
    formData.append("resource_type", "image");

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    return uploadToCloudinary({
      cloudinaryUrl,
      formData,
      callback: progressCb,
    }).then((res) => {
      if (res.result.status >= 200 && res.result.status < 300)
        return res.result.data.secure_url;
      throw new Error(res.result.statusText);
    });
  }

  return { uploadToCloud };
}
