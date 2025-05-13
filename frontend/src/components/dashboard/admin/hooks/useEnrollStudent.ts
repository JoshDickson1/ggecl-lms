import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useEnrollStudent() {
  const queryClient = useQueryClient();
  const { mutate: enrollStudent, isPending: isEnrolling } = useMutation(
    trpc.student.enroll.mutationOptions({
      onSuccess: ({ student }) => {
        toast.success(
          `Student ${student.fullName} has been enrolled successfully`,
        );

        queryClient.invalidateQueries({
          queryKey: trpc.cart.getAllItems.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.student.getAll.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.student.getById.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return { enrollStudent, isEnrolling };
}
