<<<<<<< HEAD
import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddCourse = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: addCourse } = useMutation(
    trpc.course.create.mutationOptions({
      onSuccess: () => {
        toast.success("Course added successfully!");

        queryClient.invalidateQueries({
          queryKey: trpc.course.getAll.queryKey(),
        });
      },

      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return { addCourse };
};
=======
import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddCourse = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: addCourse } = useMutation(
    trpc.course.create.mutationOptions({
      onSuccess: () => {
        toast.success("Course added successfully!");

        queryClient.invalidateQueries({
          queryKey: trpc.course.getAll.queryKey(),
        });
      },

      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return { addCourse };
};
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
