import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateInstructor() {
  const queryClient = useQueryClient();
  const { mutate: updateInstructor, isPending: isUpdatingInstructor } =
    useMutation(
      trpc.instructor.update.mutationOptions({
        onSuccess: () => {
          toast.success(
            "Your account information has been successfully updated!",
          );

          queryClient.invalidateQueries({
            queryKey: trpc.instructor.getById.queryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.instructor.getAll.queryKey(),
          });
        },
        onError: (err) => {
          toast.error(err.message);
        },
      }),
    );

  return { isUpdatingInstructor, updateInstructor };
}
