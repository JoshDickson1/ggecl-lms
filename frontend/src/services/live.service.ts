import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface JoinSessionResponse {
  token: string;
  url: string;
  roomName: string;
}

export interface EndSessionResponse {
  message: string;
}

// ==================== SERVICE ====================

export default class LiveService {
  private static readonly base = "/api/livekit";

  /**
   * Get a signed LiveKit JWT token to join a session.
   * - Instructors receive video + audio permissions.
   * - Students receive audio-only, muted by default.
   *
   * Returns 400 if the session hasn't started or has already ended.
   * Returns 403 if the user is not enrolled in the course.
   * Returns 404 if the session doesn't exist.
   *
   * @param sessionId - The LiveSession ID to join
   */
  static async joinSession(sessionId: string): Promise<JoinSessionResponse> {
    const response = await APIConfig.fetch(
      `${this.base}/join/${sessionId}`,
      { method: "POST" }
    );
    return response.json();
  }

  /**
   * End a live session and close the room (Instructor or Admin only).
   * Kicks all participants and marks the session as ENDED.
   *
   * Returns 403 if the caller is neither the session instructor nor an admin.
   *
   * @param sessionId - The LiveSession ID to end
   */
  static async endSession(sessionId: string): Promise<EndSessionResponse> {
    const response = await APIConfig.fetch(
      `${this.base}/end/${sessionId}`,
      { method: "POST" }
    );
    return response.json();
  }
}
