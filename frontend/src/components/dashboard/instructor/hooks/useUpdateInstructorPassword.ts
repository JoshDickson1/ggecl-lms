import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateInstructorPassword() {
  const {
    mutate: updateInstructorPassword,
    isPending: isUpdatingInstructorPassword,
  } = useMutation(
    trpc.instructor.updatePasswordWithOld.mutationOptions({
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

  return { updateInstructorPassword, isUpdatingInstructorPassword };
}
