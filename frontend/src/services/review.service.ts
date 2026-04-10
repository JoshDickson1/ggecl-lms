import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

// ─── SHARED ──────────────────────────────────────────────────────────────────

export interface UserSummary {
  id: string;
  name: string;
  image: string | null;
}

export interface InstructorSummary {
  id: string;
  user: UserSummary;
}

export interface StudentSummary {
  id: string;
  user: UserSummary;
}

// ─── REVIEW ──────────────────────────────────────────────────────────────────

export interface ReviewReply {
  id: string;
  comment: string;
  isEdited: boolean;
  instructor: InstructorSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  isEdited: boolean;
  student: StudentSummary;
  reply: ReviewReply | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewMeta {
  total: number;
  page: number;
  limit: number;
  averageRating: number;
  ratingBreakdown: Record<string, number>;
}

export interface PaginatedReviews {
  data: Review[];
  meta: ReviewMeta;
}

// ─── QUERY ───────────────────────────────────────────────────────────────────

export interface GetReviewsQuery {
  page?: number;
  limit?: number;
  rating?: number;
  sort?: "newest" | "oldest" | "highest" | "lowest";
}

// ─── PAYLOADS ─────────────────────────────────────────────────────────────────

export interface CreateReviewPayload {
  courseId: string;
  rating: number;
  comment: string;
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

// ==================== SERVICE ====================

export default class ReviewService {
  /**
   * Get paginated reviews for a course. Public endpoint.
   * @param courseId - Course ID
   * @param query - Optional filters: page, limit, rating, sort
   */
  static async getCourseReviews(
    courseId: string,
    query?: GetReviewsQuery
  ): Promise<PaginatedReviews> {
    const params = new URLSearchParams();
    if (query?.page !== undefined)   params.append("page",   String(query.page));
    if (query?.limit !== undefined)  params.append("limit",  String(query.limit));
    if (query?.rating !== undefined) params.append("rating", String(query.rating));
    if (query?.sort)                 params.append("sort",   query.sort);

    const qs = params.toString();
    const response = await APIConfig.fetch(
      `/reviews/courses/${courseId}${qs ? `?${qs}` : ""}`
    );
    return response.json();
  }

  /**
   * Get the current student's review for a course.
   * Returns null if the student hasn't reviewed yet.
   * @param courseId - Course ID
   */
  static async getMyReview(courseId: string): Promise<Review | null> {
    const response = await APIConfig.fetch(
      `/reviews/courses/${courseId}/my-review`
    );
    return response.json();
  }

  /**
   * Submit a new course review (STUDENT only).
   * One review per student per course.
   * @param payload - courseId, rating, comment
   */
  static async createReview(payload: CreateReviewPayload): Promise<Review> {
    const response = await APIConfig.fetch("/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Edit an existing review (STUDENT only).
   * @param reviewId - Review ID
   * @param payload - Updated rating and/or comment
   */
  static async updateReview(
    reviewId: string,
    payload: UpdateReviewPayload
  ): Promise<Review> {
    const response = await APIConfig.fetch(`/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Delete a review (STUDENT only).
   * Course aggregate ratings are recalculated automatically.
   * @param reviewId - Review ID
   */
  static async deleteReview(reviewId: string): Promise<void> {
    await APIConfig.fetch(`/reviews/${reviewId}`, { method: "DELETE" });
  }

  /**
   * Reply to a review (INSTRUCTOR only).
   * Only one reply per review is allowed.
   * @param reviewId - Review ID
   * @param payload - Reply comment
   */
  static async createReply(
    reviewId: string,
    payload: CreateReplyPayload
  ): Promise<ReviewReply> {
    const response = await APIConfig.fetch(`/reviews/${reviewId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Edit an existing reply (INSTRUCTOR only).
   * @param replyId - Reply ID
   * @param payload - Updated comment
   */
  static async updateReply(
    replyId: string,
    payload: UpdateReplyPayload
  ): Promise<ReviewReply> {
    const response = await APIConfig.fetch(`/reviews/replies/${replyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Delete a reply (INSTRUCTOR only).
   * @param replyId - Reply ID
   */
  static async deleteReply(replyId: string): Promise<void> {
    await APIConfig.fetch(`/reviews/replies/${replyId}`, { method: "DELETE" });
  }
}