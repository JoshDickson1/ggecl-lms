import { APIConfig } from "@/lib/api.config";

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