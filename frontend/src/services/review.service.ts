import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface CreateReviewPayload {
  courseId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

export interface CreateReplyPayload {
  comment: string;
}

export interface UpdateReplyPayload {
  comment: string;
}

export interface ReviewQuery {
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
}

// ==================== SERVICE ====================

export default class ReviewService {
  // ─── COURSE REVIEWS ───────────────────────────────────────────────────────────

  /**
   * Get paginated reviews for a course.
   * @param courseId - Course ID
   * @param query    - Optional pagination and sort options
   */
  static async getCourseReviews(
    courseId: string,
    query?: ReviewQuery
  ): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/reviews/courses/${courseId}${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Get the current student's review for a specific course.
   * STUDENT only.
   * @param courseId - Course ID
   */
  static async getMyReview(courseId: string): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/reviews/courses/${courseId}/my-review`
    );
    return response.json();
  }

  /**
   * Get aggregated review stats for an instructor (overall + per-course ratings).
   * @param instructorUserId - Instructor's user ID
   */
  static async getInstructorReviews(
    instructorUserId: string,
    query?: ReviewQuery
  ): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/reviews/instructors/${instructorUserId}${this.toQueryString(query)}`
    );
    return response.json();
  }

  // ─── STUDENT CRUD ────────────────────────────────────────────────────────────

  /**
   * Submit a new review for a course.
   * STUDENT only. Must be enrolled and not already reviewed.
   * @param payload - Review data
   */
  static async create(payload: CreateReviewPayload): Promise<unknown> {
    const response = await APIConfig.fetch("/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Edit an existing review.
   * STUDENT (own review) only.
   * @param reviewId - Review ID
   * @param payload  - Fields to update
   */
  static async update(
    reviewId: string,
    payload: UpdateReviewPayload
  ): Promise<unknown> {
    const response = await APIConfig.fetch(`/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Delete a review.
   * STUDENT (own review) or ADMIN.
   * @param reviewId - Review ID
   */
  static async remove(reviewId: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/reviews/${reviewId}`, {
      method: "DELETE",
    });
    return response.json();
  }

  // ─── REPLIES (INSTRUCTOR) ────────────────────────────────────────────────────

  /**
   * Reply to a review.
   * INSTRUCTOR (own course reviews) only.
   * @param reviewId - Review ID to reply to
   * @param payload  - Reply content
   */
  static async createReply(
    reviewId: string,
    payload: CreateReplyPayload
  ): Promise<unknown> {
    const response = await APIConfig.fetch(`/reviews/${reviewId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Edit an existing reply.
   * INSTRUCTOR (own reply) only.
   * @param replyId - Reply ID
   * @param payload - Updated reply content
   */
  static async updateReply(
    replyId: string,
    payload: UpdateReplyPayload
  ): Promise<unknown> {
    const response = await APIConfig.fetch(`/reviews/replies/${replyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Delete a reply.
   * INSTRUCTOR (own reply) or ADMIN.
   * @param replyId - Reply ID
   */
  static async removeReply(replyId: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/reviews/replies/${replyId}`, {
      method: "DELETE",
    });
    return response.json();
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private static toQueryString(query?: ReviewQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();

    if (query.cursor)              params.append("cursor",    query.cursor);
    if (query.sortBy)              params.append("sortBy",    query.sortBy);
    if (query.sortOrder)           params.append("sortOrder", query.sortOrder);
    if (query.limit !== undefined) params.append("limit",     String(query.limit));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}