import { toast } from "sonner";

export function toBase64(file: File, cb: (s: string) => void) {
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64String = reader.result as string;
    cb(base64String);
  };
  reader.onerror = () => {
    toast.error("Failed to convert image to base64.");
    console.error("Error reading file:", reader.error);
  };
  reader.readAsDataURL(file);
}
