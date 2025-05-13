import { useState } from "react";
import { useUploadToCloud } from "./useUploadToCloud";
import { toast } from "sonner";

export function useUploadImage() {
  const { uploadToCloud } = useUploadToCloud();

  const [isImageUploading, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (
    imageFile: File,
    folder: string,
  ): Promise<string | undefined> => {
    if (!imageFile) return;
    try {
      setIsUploadingImage(true);
      const url = await uploadToCloud(imageFile, "image", folder, (progress) =>
        setUploadProgress(progress),
      );
      toast.success("Upload complete!");
      return url;
    } catch (err) {
      let message = "Failed to upload image. Please try again.";

      if (err instanceof Error) {
        message = err.message;
      }

      toast.error(message);
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };
  return { isImageUploading, uploadProgress, uploadImage };
}
