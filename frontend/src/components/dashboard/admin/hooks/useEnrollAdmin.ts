<<<<<<< HEAD
import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useEnrollAdmin() {
  const queryClient = useQueryClient();
  const { mutate: enrollAdmin, isPending: isEnrolling } = useMutation(
    trpc.admin.enroll.mutationOptions({
      onSuccess: ({ admin }) => {
        toast.success(`Admin ${admin.fullName} has been enrolled successfully`);

        queryClient.invalidateQueries({
          queryKey: trpc.admin.getAll.queryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.admin.getById.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return { enrollAdmin, isEnrolling };
}
=======
import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useEnrollAdmin() {
  const queryClient = useQueryClient();
  const { mutate: enrollAdmin, isPending: isEnrolling } = useMutation(
    trpc.admin.enroll.mutationOptions({
      onSuccess: ({ admin }) => {
        toast.success(`Admin ${admin.fullName} has been enrolled successfully`);

        queryClient.invalidateQueries({
          queryKey: trpc.admin.getAll.queryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.admin.getById.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return { enrollAdmin, isEnrolling };
}
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
