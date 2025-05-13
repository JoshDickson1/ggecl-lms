import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  const { mutate: updateAdmin, isPending: isUpdatingAdmin } = useMutation(
    trpc.admin.update.mutationOptions({
      onSuccess: () => {
        toast.success(
          "Your account information has been successfully updated!",
        );

        queryClient.invalidateQueries({
          queryKey: trpc.admin.getById.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getAll.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return { isUpdatingAdmin, updateAdmin };
}
