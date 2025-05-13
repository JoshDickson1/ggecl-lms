import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateAdminPassword() {
  const { mutate: updateAdminPassword, isPending: isUpdatingAdminPassword } =
    useMutation(
      trpc.admin.updatePasswordWithOld.mutationOptions({
        onSuccess: (data) => {
          if (data.success) {
            toast.success("🎉 Password updated successfully!");
          }
        },
        onError: (err) => {
          toast.error(err.message);
        },
      }),
    );

  return { updateAdminPassword, isUpdatingAdminPassword };
}
