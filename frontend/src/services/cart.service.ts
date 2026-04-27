import { APIConfig } from "@/lib/api.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ==================== TYPES ====================

export interface InstructorUser {
  id: string;
  name: string;
  image: string | null;
}

export interface CartCourseInstructor {
  id: string;
  department: string | null;
  specialization: string | null;
  user: InstructorUser;
}

export interface CartCourseSummary {
  id: string;
  title: string;
  description: string;
  img: string;
  price: number;
  level: string;
  status: string;
  certification: string;
  badge: string | null;
  totalRating: number;
  totalStar: number;
  instructor: CartCourseInstructor;
}

export interface CartCourse {
  id: string;
  addedAt: Date;
  course: CartCourseSummary;
}

export interface CartResponse {
  items: CartCourse[];
  totalItems: number;
  totalPrice: number;
}

export interface ClearCartResponse {
  deleted: number;
}

// ==================== SERVICE ====================

export default class CartService {
  /**
   * Get the current student's cart
   */
  static async getCart(): Promise<CartResponse> {
    const response = await APIConfig.fetch("/cart");
    return response.json();
  }

  /**
   * Add a course to the cart
   * @param courseId - The ID of the course to add
   */
  static async addToCart(courseId: string): Promise<CartCourse> {
    const response = await APIConfig.fetch("/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    return response.json();
  }

  /**
   * Remove a specific course from the cart
   * @param courseId - The ID of the course to remove
   */
  static async removeFromCart(courseId: string): Promise<void> {
    await APIConfig.fetch(`/cart/${courseId}`, { method: "DELETE" });
  }

  /**
   * Clear all items from the cart
   */
  static async clearCart(): Promise<ClearCartResponse> {
    const response = await APIConfig.fetch("/cart", { method: "DELETE" });
    return response.json();
  }

  /**
   * Move a course from the cart to the wishlist (atomic)
   * @param courseId - The ID of the course to move
   */
  static async moveToWishlist(courseId: string): Promise<CartCourse> {
    const response = await APIConfig.fetch("/cart/move-to-wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    return response.json();
  }
}

// ==================== HOOKS ====================

// Hook to get cart with optimistic updates
export function useCart() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: () => CartService.getCart(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add to cart with optimistic update
  const addToCartMutation = useMutation({
    mutationFn: CartService.addToCart,
    onMutate: async (courseId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      
      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(["cart"]) as CartResponse;
      
      // Optimistically update to the new value
      const newItem: CartCourse = {
        id: `temp_${Date.now()}`,
        addedAt: new Date(),
        course: {
          id: courseId,
          title: "Loading...",
          description: "",
          img: "",
          price: 0,
          level: "",
          status: "",
          certification: "",
          badge: null,
          totalRating: 0,
          totalStar: 0,
          instructor: {
            id: "",
            department: null,
            specialization: null,
            user: {
              id: "",
              name: "",
              image: null,
            },
          },
        },
      };
      
      queryClient.setQueryData(["cart"], {
        items: [newItem, ...(previousCart?.items || [])],
        totalItems: (previousCart?.totalItems || 0) + 1,
        totalPrice: (previousCart?.totalPrice || 0) + 0,
      });
      
      return { previousCart };
    },
    onError: (error, _courseId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      console.error('Failed to add to cart:', error);
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Remove from cart with optimistic update
  const removeFromCartMutation = useMutation({
    mutationFn: CartService.removeFromCart,
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]) as CartResponse;
      
      if (previousCart) {
        const itemToRemove = previousCart.items.find(item => item.course.id === courseId);
        const filteredItems = previousCart.items.filter(item => item.course.id !== courseId);
        queryClient.setQueryData(["cart"], {
          items: filteredItems,
          totalItems: filteredItems.length,
          totalPrice: (previousCart.totalPrice || 0) - (itemToRemove?.course.price || 0),
        });
      }
      
      return { previousCart };
    },
    onError: (error, _courseId, context) => {
      console.error('Failed to remove from cart:', error);
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Clear cart with optimistic update
  const clearCartMutation = useMutation({
    mutationFn: CartService.clearCart,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]) as CartResponse;
      
      queryClient.setQueryData(["cart"], {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
      
      return { previousCart };
    },
    onError: (error, _variables, context) => {
      console.error('Failed to clear cart:', error);
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Move to wishlist with optimistic update
  const moveToWishlistMutation = useMutation({
    mutationFn: CartService.moveToWishlist,
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      
      const previousCart = queryClient.getQueryData(["cart"]) as CartResponse;
      const previousWishlist = queryClient.getQueryData(["wishlist"]);
      
      // Remove from cart optimistically
      if (previousCart) {
        const cartItem = previousCart.items.find(item => item.course.id === courseId);
        if (cartItem) {
          const filteredItems = previousCart.items.filter(item => item.course.id !== courseId);
          queryClient.setQueryData(["cart"], {
            items: filteredItems,
            totalItems: filteredItems.length,
            totalPrice: (previousCart.totalPrice || 0) - cartItem.course.price,
          });
          
          // Add to wishlist optimistically
          const wishlistData = previousWishlist as any;
          if (wishlistData) {
            queryClient.setQueryData(["wishlist"], {
              ...wishlistData,
              items: [cartItem, ...(wishlistData.items || [])],
              totalItems: (wishlistData.totalItems || 0) + 1,
            });
          }
        }
      }
      
      return { previousCart, previousWishlist };
    },
    onError: (error, _courseId, context) => {
      console.error('Failed to move to wishlist:', error);
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    addToCart: addToCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    moveToWishlist: moveToWishlistMutation.mutate,
    isAdding: addToCartMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
    isMoving: moveToWishlistMutation.isPending,
  };
}