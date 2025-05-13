import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useEditCourse = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: editCourse } = useMutation(
    trpc.course.update.mutationOptions({
      onSuccess: () => {
        toast.success("Course updated successfully!");

        queryClient.invalidateQueries({
          queryKey: trpc.course.getAll.queryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.course.getById.queryKey(),
        });
      },

      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return { editCourse };
};
