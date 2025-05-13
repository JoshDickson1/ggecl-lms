import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const { mutate: updateStudent, isPending: isUpdatingStudent } = useMutation(
    trpc.student.update.mutationOptions({
      onSuccess: () => {
        toast.success(
          "Your account information has been successfully updated!",
        );

        queryClient.invalidateQueries({
          queryKey: trpc.student.getById.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.student.getAll.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return { isUpdatingStudent, updateStudent };
}
