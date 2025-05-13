import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateStudentPassword() {
  const {
    mutate: updateStudentPassword,
    isPending: isUpdatingStudentPassword,
  } = useMutation(
    trpc.student.updatePasswordWithOld.mutationOptions({
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

  return { updateStudentPassword, isUpdatingStudentPassword };
}
