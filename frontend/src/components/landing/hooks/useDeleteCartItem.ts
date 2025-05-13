import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteCartItem() {
  const queryClient = useQueryClient();
  const { mutate: deleteItem, isPending: isDeleting } = useMutation(
    trpc.cart.deleteItem.mutationOptions({
      onSuccess() {
        toast.success("Item removed from cart successfully!");

        queryClient.invalidateQueries({
          queryKey: trpc.cart.getAllItems.queryKey(),
        });
      },
      onError() {
        toast.error("Failed to remove item from cart. Please try again.");
      },
    }),
  );

  return { deleteItem, isDeleting };
}
