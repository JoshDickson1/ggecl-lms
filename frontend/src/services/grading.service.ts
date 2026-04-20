import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface ApiGroupMember {
  id: string;       // membership record id
  userId: string;   // actual user id
  name: string;
  avatar?: string | null;
  email?: string;
}

export interface ApiGroupGrade {
  id: string;
  letterGrade: string;
  percentage: number;
  gpa: number;
  status: "graded" | "pending" | "under_review";
  gradedBy: "instructor" | "admin";
  graderName: string;
  gradedAt: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  rubric: { id: string; label: string; maxScore: number; score: number }[];
  isAppealable: boolean;
  appealDeadline?: string;
}

export interface ApiGroup {
  id: string;
  name: string;
  courseId: string;
  courseName?: string;
  members: ApiGroupMember[];
  grade?: ApiGroupGrade | null;
  createdAt?: string;
}

export interface GroupQuery {
  courseId?: string;
  limit?: number;
  cursor?: string;
}

export interface GradeGroupPayload {
  letterGrade: string;
  percentage: number;
  gpa?: number;
  feedback: string;
  rubric?: { label: string; maxScore: number; score: number }[];
  strengths?: string[];
  improvements?: string[];
  isAppealable?: boolean;
}

export interface GradeSubmissionPayload {
  score: number;
  feedback: string;
  letterGrade?: string;
}

// ==================== SERVICE ====================

export default class GradingService {

  // ─── GROUPS ──────────────────────────────────────────────────────────────────

  /**
   * List groups. ADMIN sees all, INSTRUCTOR sees own-course groups.
   * @param query - Optional courseId filter + pagination
   */
  static async getGroups(query?: GroupQuery): Promise<unknown> {
    const response = await APIConfig.fetch(`/groups${this.toQueryString(query)}`);
    return response.json();
  }

  /**
   * Get a single group with members.
   * @param id - Group ID
   */
  static async getGroup(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/groups/${id}`);
    return response.json();
  }

  // ─── GROUP GRADES ────────────────────────────────────────────────────────────

  /**
   * Get all grades for a specific group.
   * @param groupId - Group ID
   */
  static async getGroupGrades(groupId: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/groups/${groupId}/grades`);
    return response.json();
  }

  /**
   * Grade a group for the first time.
   * INSTRUCTOR grades own-course groups; ADMIN grades any.
   * @param groupId - Group ID
   * @param payload - Grade details
   */
  static async gradeGroup(groupId: string, payload: GradeGroupPayload): Promise<unknown> {
    const response = await APIConfig.fetch(`/groups/${groupId}/grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Update (re-grade) an existing group grade.
   * @param groupId - Group ID
   * @param gradeId - Existing grade ID
   * @param payload - Updated grade details
   */
  static async updateGroupGrade(
    groupId: string,
    gradeId: string,
    payload: GradeGroupPayload,
  ): Promise<unknown> {
    const response = await APIConfig.fetch(`/groups/${groupId}/grades/${gradeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  // ─── ASSIGNMENT SUBMISSION GRADING ────────────────────────────────────────────

  /**
   * Grade an individual student's submission for an assignment.
   * INSTRUCTOR or ADMIN only.
   * @param submissionId - Submission ID
   * @param payload - Score, feedback, optional letter grade
   */
  static async gradeSubmission(
    submissionId: string,
    payload: GradeSubmissionPayload,
  ): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/assignments/submissions/${submissionId}/grade`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    return response.json();
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private static toQueryString(query?: GroupQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();
    if (query.courseId) params.append("courseId", query.courseId);
    if (query.limit !== undefined) params.append("limit", String(query.limit));
    if (query.cursor) params.append("cursor", query.cursor);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}
