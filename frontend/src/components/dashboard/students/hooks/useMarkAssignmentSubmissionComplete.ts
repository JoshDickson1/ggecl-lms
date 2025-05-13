import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkAssignmentSubmissionComplete() {
  const queryClient = useQueryClient();
  const { mutateAsync: markSubmissionComplete } = useMutation(
    trpc.assignment.markSubmissionComplete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.assignment.getAllForStudent.queryKey(),
        });
      },
    }),
  );
  return { markSubmissionComplete };
}
