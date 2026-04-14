import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface ActivityQuery {
  cursor?: string;
  limit?: number;
}

// ==================== SERVICE ====================

export default class ActivityService {
  /**
   * Get the paginated activity/notification feed for the current user.
   * Works for all roles.
   * @param query - Optional cursor-based pagination
   */
  static async getFeed(query?: ActivityQuery): Promise<unknown> {
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

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private static toQueryString(query?: ActivityQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();

    if (query.cursor)              params.append("cursor", query.cursor);
    if (query.limit !== undefined) params.append("limit",  String(query.limit));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}