import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";

export function useCreateAssignmentCloudinarySig() {
  const { mutateAsync: createSignatureCloudinary } = useMutation(
    trpc.assignment.createCloudinarySignature.mutationOptions(),
  );
  return { createSignatureCloudinary };
}
