import { trpc } from "@/utils/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useCartItems() {
  const { data: cartItems } = useSuspenseQuery(
    trpc.cart.getAllItems.queryOptions(),
  );

  return { cartItems };
}
