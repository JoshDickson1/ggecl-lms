import { APIConfig } from "@/lib/api.config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ==================== TYPES ====================

export type LiveSessionStatus = "scheduled" | "live" | "ended";

export interface LiveSession {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  courseName?: string;
  instructorId: string;
  instructorName?: string;
  scheduledAt: string;
  durationMinutes: number;
  status: LiveSessionStatus;
  enrolledCount?: number;
  joinedCount?: number;
  recordingEnabled: boolean;
  createdBy: "admin" | "instructor";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  title: string;
  description?: string;
  courseId: string;
  scheduledAt: string;
  durationMinutes: number;
  recordingEnabled?: boolean;
}

export interface UpdateSessionRequest {
  title?: string;
  description?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  recordingEnabled?: boolean;
}

export interface JoinSessionResponse {
  token: string;
  url: string;
  roomName: string;
}

export interface EndSessionResponse {
  message: string;
}

export interface SessionsListResponse {
  sessions: LiveSession[];
  total: number;
}

// ==================== SERVICE ====================

export default class LiveService {
  private static readonly base = "/livekit";

  /**
   * Get all live sessions (Admin/Instructor)
   * @param status - Filter by status: 'scheduled', 'live', 'ended', or 'all'
   */
  static async getSessions(status: LiveSessionStatus | 'all' = 'all'): Promise<SessionsListResponse> {
    const params = status !== 'all' ? `?status=${status}` : '';
    const response = await APIConfig.fetch(`${this.base}/sessions${params}`);
    return response.json();
  }

  /**
   * Get a single live session by ID
   * @param sessionId - The LiveSession ID
   */
  static async getSession(sessionId: string): Promise<LiveSession> {
    const response = await APIConfig.fetch(`${this.base}/sessions/${sessionId}`);
    return response.json();
  }

  /**
   * Create a new live session (Admin/Instructor)
   * @param data - Session creation data
   */
  static async createSession(data: CreateSessionRequest): Promise<LiveSession> {
    const response = await APIConfig.fetch(`${this.base}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Update a live session (Admin/Instructor)
   * @param sessionId - The LiveSession ID
   * @param data - Session update data
   */
  static async updateSession(sessionId: string, data: UpdateSessionRequest): Promise<LiveSession> {
    const response = await APIConfig.fetch(`${this.base}/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Delete a live session (Admin/Instructor)
   * @param sessionId - The LiveSession ID
   */
  static async deleteSession(sessionId: string): Promise<{ message: string }> {
    const response = await APIConfig.fetch(`${this.base}/sessions/${sessionId}`, {
      method: "DELETE",
    });
    return response.json();
  }

  /**
   * Get a signed LiveKit JWT token to join a session.
   * - Instructors receive video + audio permissions.
   * - Students receive audio-only, muted by default.
   * - Admins receive full co-host permissions.
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

  /**
   * Start a scheduled session (Instructor or Admin only)
   * Changes status from 'scheduled' to 'live'
   * 
   * @param sessionId - The LiveSession ID to start
   */
  static async startSession(sessionId: string): Promise<LiveSession> {
    const response = await APIConfig.fetch(
      `${this.base}/start/${sessionId}`,
      { method: "POST" }
    );
    return response.json();
  }
}

// ==================== HOOKS ====================

/**
 * Hook to get all live sessions
 * @param status - Filter by status
 */
export function useLiveSessions(status: LiveSessionStatus | 'all' = 'all') {
  return useQuery({
    queryKey: ["live-sessions", status],
    queryFn: () => LiveService.getSessions(status),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: (query) => {
      // Auto-refresh every 30 seconds if there are live sessions
      const data = query.state.data;
      return data?.sessions.some(s => s.status === 'live') ? 30000 : false;
    },
  });
}

/**
 * Hook to get a single live session
 * @param sessionId - The session ID
 */
export function useLiveSession(sessionId: string | null) {
  return useQuery({
    queryKey: ["live-session", sessionId],
    queryFn: () => LiveService.getSession(sessionId!),
    enabled: !!sessionId,
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to create a live session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSessionRequest) => LiveService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
    },
  });
}

/**
 * Hook to update a live session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: UpdateSessionRequest }) => 
      LiveService.updateSession(sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["live-session", variables.sessionId] });
    },
  });
}

/**
 * Hook to delete a live session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => LiveService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
    },
  });
}

/**
 * Hook to join a live session
 */
export function useJoinSession() {
  return useMutation({
    mutationFn: (sessionId: string) => LiveService.joinSession(sessionId),
  });
}

/**
 * Hook to end a live session
 */
export function useEndSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => LiveService.endSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
    },
  });
}

/**
 * Hook to start a live session
 */
export function useStartSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => LiveService.startSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
    },
  });
}
