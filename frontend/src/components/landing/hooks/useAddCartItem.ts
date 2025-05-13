import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAddCartItem(courseTitle: string) {
  const queryClient = useQueryClient();
  const { mutate: addItemMutate, isPending: isAdding } = useMutation(
    trpc.cart.addItem.mutationOptions({
      onSuccess: () => {
        toast.success(`"${courseTitle}" added to cart!`);
        queryClient.invalidateQueries({
          queryKey: trpc.cart.getAllItems.queryKey(),
        });
      },

      onError: (error) => {
        toast.error(error.message || "Failed to add course to cart.");
        console.error("Add to cart error:", error);
      },
    }),
  );

  return { addItemMutate, isAdding };
}
