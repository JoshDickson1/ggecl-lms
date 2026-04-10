import { APIConfig } from "@/lib/api.config";

// ==================== ENUMS ====================

export enum ActivityType {
  // Mirror of backend ActivityType — keep in sync
  STUDENT_ENROLLED      = "STUDENT_ENROLLED",
  ACHIEVEMENT_UNLOCKED  = "ACHIEVEMENT_UNLOCKED",
  // Add remaining types from your backend activity.types.ts
}

// ==================== TYPES ====================

export interface ActivityResponse {
  id: string;
  type: ActivityType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: Date | null;
  courseId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface ActivityMeta {
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export interface PaginatedActivitiesResponse {
  data: ActivityResponse[];
  meta: ActivityMeta;
}

export interface GetActivitiesQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: ActivityType;
}

export interface UnreadCountResponse {
  count: number;
}

export interface BulkUpdateResult {
  updated: number;
}

export interface BulkDeleteResult {
  deleted: number;
}

// ==================== SERVICE ====================

export default class ActivityService {
  /**
   * Get paginated activity feed for the current user
   * @param query - Optional filters: page, limit, isRead, type
   */
  static async findAll(
    query?: GetActivitiesQuery
  ): Promise<PaginatedActivitiesResponse> {
    const params = new URLSearchParams();

    if (query?.page !== undefined)   params.append("page",   String(query.page));
    if (query?.limit !== undefined)  params.append("limit",  String(query.limit));
    if (query?.isRead !== undefined) params.append("isRead", String(query.isRead));
    if (query?.type)                 params.append("type",   query.type);

    const qs = params.toString();
    const response = await APIConfig.fetch(`/activities${qs ? `?${qs}` : ""}`);
    return response.json();
  }

  /**
   * Get the number of unread activities (for badge counters)
   */
  static async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await APIConfig.fetch("/activities/unread-count");
    return response.json();
  }

  /**
   * Get a single activity by ID
   * @param id - Activity ID
   */
  static async findOne(id: string): Promise<ActivityResponse> {
    const response = await APIConfig.fetch(`/activities/${id}`);
    return response.json();
  }

  /**
   * Mark a single activity as read
   * @param id - Activity ID
   */
  static async markAsRead(id: string): Promise<ActivityResponse> {
    const response = await APIConfig.fetch(`/activities/${id}/read`, {
      method: "PATCH",
    });
    return response.json();
  }

  /**
   * Mark all unread activities as read
   */
  static async markAllAsRead(): Promise<BulkUpdateResult> {
    const response = await APIConfig.fetch("/activities/bulk/read", {
      method: "PATCH",
    });
    return response.json();
  }

  /**
   * Delete a single activity
   * @param id - Activity ID
   */
  static async deleteOne(id: string): Promise<void> {
    await APIConfig.fetch(`/activities/${id}`, { method: "DELETE" });
  }

  /**
   * Delete all activities for the current user
   */
  static async deleteAll(): Promise<BulkDeleteResult> {
    const response = await APIConfig.fetch("/activities/bulk", {
      method: "DELETE",
    });
    return response.json();
  }
}