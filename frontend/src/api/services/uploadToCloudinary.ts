import axios from "axios";

interface IUploadtoCloudinaryParams {
  cloudinaryUrl: string;
  formData: FormData;
  callback: (number: number) => void;
}

export async function uploadToCloudinary({
  cloudinaryUrl,
  formData,
  callback,
}: IUploadtoCloudinaryParams) {
  const result = await axios.post(cloudinaryUrl, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        callback(percentCompleted);
      } else {
        callback(5);
      }
    },
  });
  return { result };
}
