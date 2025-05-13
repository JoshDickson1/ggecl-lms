import { TRPCError } from "@trpc/server";
import { cloudinary } from "../cloudinary.js";

export async function uploadImageIfNeeded(
  picture?: string
): Promise<string | undefined> {
  
  if (!picture) return undefined;

  if (picture.startsWith("http")) {
    return picture;
  }

  try {
    const { secure_url } = await cloudinary.uploader.upload(picture);
    return secure_url;
  } catch (uploadErr) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to upload image",
      cause: uploadErr,
    });
  }
}
