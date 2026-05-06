import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export type LiveSessionStatus = "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";

// ─── REQUEST BODIES ───────────────────────────────────────────────────────────

export interface ScheduleSessionPayload {
  title: string;
  courseId: string;
  instructorId: string;
  scheduledAt: string; // ISO 8601
}

export interface UpdateSessionPayload {
  title?: string;
  scheduledAt?: string; // ISO 8601
  instructorId?: string;
}

// ─── RESPONSE SHAPES ─────────────────────────────────────────────────────────

export interface LiveSession {
  id: string;
  title: string;
  roomName: string;
  scheduledAt: string;
  endsAt: string;
  status: LiveSessionStatus;
  courseId: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSessions {
  data: LiveSession[];
  total: number;
  page: number;
  limit: number;
}

export interface ListSessionsQuery {
  page?: number;
  limit?: number;
}

// ==================== SERVICE ====================

export default class SchedulingService {
  private static readonly base = "/scheduling";

  /**
   * Schedule a new live session.
   * Returns 400 if scheduledAt is in the past, 409 on time-slot conflict.
   */
  static async scheduleSession(payload: ScheduleSessionPayload): Promise<LiveSession> {
    const response = await APIConfig.fetch(this.base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * List all live sessions with optional pagination.
   */
  static async listSessions(query?: ListSessionsQuery): Promise<PaginatedSessions> {
    const response = await APIConfig.fetch(
      `${this.base}${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Get a single live session by ID.
   * Returns 404 if not found.
   */
  static async getSession(id: string): Promise<LiveSession> {
    const response = await APIConfig.fetch(`${this.base}/${id}`);
    return response.json();
  }

  /**
   * Update a scheduled session (Admin only).
   * Returns 400 if the session is not in "scheduled" status.
   */
  static async updateSession(
    id: string,
    payload: UpdateSessionPayload
  ): Promise<LiveSession> {
    const response = await APIConfig.fetch(`${this.base}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Delete a session (Admin only).
   * Returns 400 if the session is currently live.
   * Returns 204 No Content on success.
   */
  static async deleteSession(id: string): Promise<void> {
    await APIConfig.fetch(`${this.base}/${id}`, { method: "DELETE" });
  }

  /**
   * Cancel a scheduled session (Admin only).
   */
  static async cancelSession(id: string): Promise<LiveSession> {
    const response = await APIConfig.fetch(`${this.base}/${id}/cancel`, {
      method: "PATCH",
    });
    return response.json();
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  private static toQueryString(query?: ListSessionsQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();
    if (query.page  != null) params.append("page",  String(query.page));
    if (query.limit != null) params.append("limit", String(query.limit));
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}
