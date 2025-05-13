import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useEnrollStudentsToCourse() {
  const queryClient = useQueryClient();
  const { mutate: enrollStudents, isPending: isEnrolling } = useMutation(
    trpc.student.enrollToCourse.mutationOptions({
      onSuccess: ({ newlyEnrolledCount }) => {
        toast.success(
          `${newlyEnrolledCount} students has successfully been enrolled to a course`,
        );

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

  return { enrollStudents, isEnrolling };
}
