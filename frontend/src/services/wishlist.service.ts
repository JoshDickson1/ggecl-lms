import { APIConfig } from "@/lib/api.config";

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
  addedAt: Date;
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
    const response = await APIConfig.fetch("/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    return response.json();
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