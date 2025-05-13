import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";

export function useCreateCourseSignature() {
  const { mutateAsync: createSignatureCloudinary } = useMutation(
    trpc.course.createCloudinarySignature.mutationOptions(),
  );
  return { createSignatureCloudinary };
}
