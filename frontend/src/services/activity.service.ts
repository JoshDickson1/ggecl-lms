import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export type ActivityType =
  | "STUDENT_ENROLLED"
  | "INSTRUCTOR_NEW_ENROLLMENT"
  | "COURSE_PUBLISHED"
  | "COURSE_UPDATED"
  | "COURSE_ARCHIVED"
  | "CART_ITEM_ADDED"
  | "WISHLIST_ITEM_ADDED"
  | "WISHLIST_TO_CART"
  | "ADMIN_ANNOUNCEMENT"
  | "LESSON_COMPLETED"
  | "COURSE_COMPLETED"
  | "STREAK_MILESTONE"
  | "ACHIEVEMENT_UNLOCKED"
  | "USER_WELCOME"
  | "ADMIN_NEW_USER_JOINED"
  | "REVIEW_RECEIVED"
  | "REVIEW_REPLIED"
  | "CHAT_ADDED_TO_ROOM"
  | "CHAT_REMOVED_FROM_ROOM"
  | "CHAT_MENTIONED"
  | "CHAT_GROUP_GRADED"
  | "CHAT_GROUP_ADMIN_ASSIGNED"
  | "INSTRUCTOR_MESSAGE_COURSE"
  | "INSTRUCTOR_MESSAGE_STUDENT";

export interface ActivityQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: ActivityType;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  courseId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityFeedMeta {
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export interface ActivityFeedResponse {
  data: ActivityItem[];
  meta: ActivityFeedMeta;
}

export interface SendStudentMessagePayload {
  studentId: string;
  courseId: string;
  message: string;
}

export interface SendStudentMessageResponse {
  message: string;
  recipientCount: number;
}

export interface SendAnnouncementPayload {
  title: string;
  message: string;
  /** Omit or leave empty to broadcast to all users */
  recipientUserIds?: string[];
}

export interface SendAnnouncementResponse {
  message: string;
  recipientCount: number;
}

// ==================== SERVICE ====================

export default class ActivityService {
  /**
   * Get the paginated activity/notification feed for the current user.
   * Works for all roles.
   * @param query - Optional cursor-based pagination
   */
  static async getFeed(query?: ActivityQuery): Promise<ActivityFeedResponse> {
    const response = await APIConfig.fetch(
      `/activities${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Get the count of unread activities (for navbar badge counters).
   * Works for all roles.
   */
  static async getUnreadCount(): Promise<unknown> {
    const response = await APIConfig.fetch("/activities/unread-count");
    return response.json();
  }

  /**
   * Get a single activity by ID.
   * @param id - Activity ID
   */
  static async findOne(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/activities/${id}`);
    return response.json();
  }

  /**
   * Mark a single activity as read.
   * @param id - Activity ID
   */
  static async markAsRead(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/activities/${id}/read`, {
      method: "PATCH",
    });
    return response.json();
  }

  /**
   * Mark all unread activities as read in one call.
   * Useful for "Mark all as read" button.
   */
  static async markAllAsRead(): Promise<unknown> {
    const response = await APIConfig.fetch("/activities/bulk/read", {
      method: "PATCH",
    });
    return response.json();
  }

  /**
   * Delete a single activity.
   * @param id - Activity ID
   */
  static async remove(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/activities/${id}`, {
      method: "DELETE",
    });
    return response.json();
  }

  /**
   * Delete all activities for the current user.
   * Useful for "Clear all notifications" button.
   */
  static async clearAll(): Promise<unknown> {
    const response = await APIConfig.fetch("/activities/bulk", {
      method: "DELETE",
    });
    return response.json();
  }

  /**
   * Send an admin announcement to all users or a specific set of users.
   * Broadcasts to everyone if recipientUserIds is omitted or empty. ADMIN only.
   * POST /api/activities/announcements
   * @param payload - title, message, and optional recipientUserIds
   */
  static async sendAnnouncement(
    payload: SendAnnouncementPayload
  ): Promise<SendAnnouncementResponse> {
    const response = await APIConfig.fetch("/activities/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Send a personal message to a single student as a notification.
   * The course must be owned by the requesting instructor and the student
   * must be enrolled in it. INSTRUCTOR only.
   * @param payload - studentId, courseId, and message text
   */
  static async sendMessageToStudent(
    payload: SendStudentMessagePayload
  ): Promise<SendStudentMessageResponse> {
    const response = await APIConfig.fetch("/activities/instructor/message/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private static toQueryString(query?: ActivityQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();

    if (query.page !== undefined)   params.append("page",   String(query.page));
    if (query.limit !== undefined)  params.append("limit",  String(query.limit));
    if (query.isRead !== undefined) params.append("isRead", String(query.isRead));
    if (query.type)                 params.append("type",   query.type);

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}