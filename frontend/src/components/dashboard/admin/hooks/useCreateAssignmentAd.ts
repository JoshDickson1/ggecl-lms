import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateAssignmentAd() {
  const queryClient = useQueryClient();
  const { mutate: createAssignmentAd, isPending: isCreatingAssignmentAd } =
    useMutation(
      trpc.assignment.create.mutationOptions({
        onError: (err) => {
          toast.error(err.message);
        },

        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.assignment.getAllForInstructor.queryKey(),
          });

          queryClient.invalidateQueries({
            queryKey: trpc.assignment.getAllSubmitted.queryKey(),
          });
        },
      }),
    );
  return { createAssignmentAd, isCreatingAssignmentAd };
}
