import { APIConfig } from "@/lib/api.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ==================== TYPES ====================

export interface WishlistInstructorUser {
  id: string;
  name: string;
  image: string | null;
}

export interface WishlistInstructor {
  id: string;
  department: string | null;
  specialization: string | null;
  user: WishlistInstructorUser;
}

export interface WishlistCourseDetail {
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
  instructor: WishlistInstructor;
}

export interface WishlistCourse {
  id: string;
  addedAt: string;
  course: WishlistCourseDetail;
}

export interface WishlistResponse {
  items: WishlistCourse[];
  totalItems: number;
}

export interface ClearWishlistResponse {
  deleted: number;
}

// ==================== SERVICE ====================

export default class WishlistService {
  /**
   * Get the current student's wishlist, ordered by most recently added.
   */
  static async getWishlist(): Promise<WishlistResponse> {
    const response = await APIConfig.fetch("/wishlist");
    return response.json();
  }

  /**
   * Add a published course to the wishlist.
   * @param courseId - Course ID
   */
  static async addToWishlist(courseId: string): Promise<WishlistCourse> {
    try {
      const response = await APIConfig.fetch("/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      return response.json();
    } catch (error) {
      console.error('WishlistService.addToWishlist error:', error);
      throw error;
    }
  }

  /**
   * Remove a specific course from the wishlist.
   * @param courseId - Course ID
   */
  static async removeFromWishlist(courseId: string): Promise<void> {
    await APIConfig.fetch(`/wishlist/${courseId}`, { method: "DELETE" });
  }

  /**
   * Clear all courses from the wishlist.
   */
  static async clearWishlist(): Promise<ClearWishlistResponse> {
    const response = await APIConfig.fetch("/wishlist", { method: "DELETE" });
    return response.json();
  }

  /**
   * Atomically move a course from the wishlist to the cart.
   * @param courseId - Course ID
   */
  static async moveToCart(courseId: string): Promise<WishlistCourse> {
    const response = await APIConfig.fetch("/wishlist/move-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    return response.json();
  }
}

// ==================== HOOKS ====================

// Hook to get wishlist with optimistic updates
export function useWishlist() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => WishlistService.getWishlist(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add to wishlist with optimistic update
  const addToWishlistMutation = useMutation({
    mutationFn: WishlistService.addToWishlist,
    onMutate: async (courseId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      
      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(["wishlist"]) as WishlistResponse;
      
      // Optimistically update to the new value
      const newItem: WishlistCourse = {
        id: `temp_${Date.now()}`,
        addedAt: new Date().toISOString(),
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
      
      queryClient.setQueryData(["wishlist"], {
        items: [newItem, ...(previousWishlist?.items || [])],
        totalItems: (previousWishlist?.totalItems || 0) + 1,
      });
      
      return { previousWishlist };
    },
    onError: (error, _courseId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      console.error('Failed to add to wishlist:', error);
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  // Remove from wishlist with optimistic update
  const removeFromWishlistMutation = useMutation({
    mutationFn: WishlistService.removeFromWishlist,
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]) as WishlistResponse;
      
      if (previousWishlist) {
        const filteredItems = previousWishlist.items.filter(item => item.course.id !== courseId);
        queryClient.setQueryData(["wishlist"], {
          items: filteredItems,
          totalItems: filteredItems.length,
        });
      }
      
      return { previousWishlist };
    },
    onError: (error, courseId, context) => {
      console.error('Failed to remove from wishlist:', error);
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  // Clear wishlist with optimistic update
  const clearWishlistMutation = useMutation({
    mutationFn: WishlistService.clearWishlist,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]) as WishlistResponse;
      
      queryClient.setQueryData(["wishlist"], {
        items: [],
        totalItems: 0,
      });
      
      return { previousWishlist };
    },
    onError: (error, variables, context) => {
      console.error('Failed to clear wishlist:', error);
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  // Move to cart with optimistic update
  const moveToCartMutation = useMutation({
    mutationFn: WishlistService.moveToCart,
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      
      const previousWishlist = queryClient.getQueryData(["wishlist"]) as WishlistResponse;
      const previousCart = queryClient.getQueryData(["cart"]);
      
      // Remove from wishlist optimistically
      if (previousWishlist) {
        const wishlistItem = previousWishlist.items.find(item => item.course.id === courseId);
        if (wishlistItem) {
          const filteredItems = previousWishlist.items.filter(item => item.course.id !== courseId);
          queryClient.setQueryData(["wishlist"], {
            items: filteredItems,
            totalItems: filteredItems.length,
          });
          
          // Add to cart optimistically
          const cartData = previousCart as any;
          if (cartData) {
            queryClient.setQueryData(["cart"], {
              ...cartData,
              items: [wishlistItem, ...(cartData.items || [])],
              totalItems: (cartData.totalItems || 0) + 1,
              totalPrice: (cartData.totalPrice || 0) + wishlistItem.course.price,
            });
          }
        }
      }
      
      return { previousWishlist, previousCart };
    },
    onError: (error, courseId, context) => {
      console.error('Failed to move to cart:', error);
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    clearWishlist: clearWishlistMutation.mutate,
    moveToCart: moveToCartMutation.mutate,
    isAdding: addToWishlistMutation.isPending,
    isRemoving: removeFromWishlistMutation.isPending,
    isClearing: clearWishlistMutation.isPending,
    isMoving: moveToCartMutation.isPending,
  };
}