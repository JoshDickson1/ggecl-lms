// src/services/AssignmentService.ts
// Real API integration for student and instructor assignments.

import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export type AssignmentStatus =
  | "pending"
  | "submitted"
  | "late"
  | "graded"
  | "returned"

export type LetterGrade =
  | "A+" | "A" | "A-"
  | "B+" | "B" | "B-"
  | "C+" | "C" | "C-"
  | "D" | "F";

// ─── Student-facing assignment list item ─────────────────────────────────────
// Matches GET /api/assignments/student/list → PaginatedStudentAssignmentsDto
export interface StudentAssignmentItem {
  id: string;
  title: string;
  description: string;
  instructions: string;
  courseId: string;
  courseName: string;
  dueDate: string;          // ISO
  createdAt: string;
  createdBy: "instructor" | "admin";
  creatorName: string;
  maxScore: number;
  allowLate: boolean;
  allowedFileTypes: string[];
  attachments: AssignmentAttachment[];
  // submission status fields (null if not yet submitted)
  status: AssignmentStatus;
  submittedAt?: string | null;
  isLate?: boolean;
  score?: number | null;
  grade?: LetterGrade | null;
  feedback?: string | null;
  submissionId?: string | null;
}

export interface AssignmentAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  mimeType?: string;
}

export interface PaginatedStudentAssignments {
  data: StudentAssignmentItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Student's own submission detail ─────────────────────────────────────────
// Matches GET /api/assignments/{id}/my-submission → SubmissionResponseDto
export interface MySubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  courseId: string;
  submittedAt: string;
  isLate: boolean;
  files: SubmissionFile[];
  status: AssignmentStatus;
  score?: number | null;
  grade?: LetterGrade | null;
  feedback?: string | null;
  rubric?: RubricCriterion[] | null;
  gradedBy?: "instructor" | "admin" | null;
  graderName?: string | null;
  gradedAt?: string | null;
  note?: string | null;       // student's submission note
}

export interface SubmissionFile {
  id: string;
  name: string;
  url: string;
  size?: string;
  mimeType?: string;
}

export interface RubricCriterion {
  id: string;
  label: string;
  maxScore: number;
  score: number;
}

// ─── Submit assignment payload ────────────────────────────────────────────────
// Matches POST /api/assignments/{id}/submit → SubmitAssignmentDto
export interface SubmitAssignmentPayload {
  fileKeys: string[];   // R2 object keys from StorageService.upload()
  note?: string;        // optional student note to instructor
}

// ─── Query params for student assignment list ─────────────────────────────────
export interface StudentAssignmentQuery {
  status?: AssignmentStatus;
  courseId?: string;
  page?: number;
  limit?: number;
}

// ==================== SERVICE ====================

export default class AssignmentService {

  // ─── STUDENT: list their assignments (with submission status) ─────────────
  /**
   * GET /api/assignments/student/list
   * Returns all assignments for the calling student's enrolled courses,
   * each decorated with their submission status, grade, score, etc.
   */
  static async getMyAssignments(
    query?: StudentAssignmentQuery,
  ): Promise<PaginatedStudentAssignments> {
    const qs = AssignmentService.toQueryString(query);
    const response = await APIConfig.fetch(`/assignments/student/list${qs}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch assignments: ${response.status}`);
    }
    return response.json();
  }

  // ─── STUDENT: get their own submission for one assignment ─────────────────
  /**
   * GET /api/assignments/{id}/my-submission
   * Fetches the calling student's submission detail for a specific assignment.
   * Returns null (404) if they haven't submitted yet.
   */
  static async getMySubmission(assignmentId: string): Promise<MySubmission | null> {
    const response = await APIConfig.fetch(
      `/assignments/${assignmentId}/my-submission`,
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Failed to fetch submission: ${response.status}`);
    }
    return response.json();
  }

  // ─── STUDENT: submit (or resubmit) an assignment ──────────────────────────
  /**
   * POST /api/assignments/{id}/submit
   *
   * Upload files to R2 first via StorageService, then call this with the
   * returned object keys.
   *
   * @example
   * const key = await StorageService.upload("assignments", file);
   * await AssignmentService.submit(assignmentId, { fileKeys: [key], note });
   */
  static async submit(
    assignmentId: string,
    payload: SubmitAssignmentPayload,
  ): Promise<MySubmission> {
    const response = await APIConfig.fetch(`/assignments/${assignmentId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        (err as { message?: string }).message ??
          `Submit failed: ${response.status}`,
      );
    }
    return response.json();
  }

  // ─── STUDENT: get a single assignment by ID ───────────────────────────────
  /**
   * GET /api/assignments/{id}
   * Useful for fetching full instructions/attachments on demand.
   */
  static async getAssignment(id: string): Promise<StudentAssignmentItem> {
    const response = await APIConfig.fetch(`/assignments/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch assignment: ${response.status}`);
    }
    return response.json();
  }

  // ─── INSTRUCTOR: list assignments they created ────────────────────────────
  static async getInstructorAssignments(query?: {
    courseId?: string; page?: number; limit?: number;
  }): Promise<InstructorAssignmentListResponse> {
    const params = new URLSearchParams();
    if (query?.courseId) params.append("courseId", query.courseId);
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.limit !== undefined) params.append("limit", String(query.limit));
    const qs = params.toString();
    const response = await APIConfig.fetch(`/assignments/${qs ? `?${qs}` : ""}`);
    return response.json();
  }

  // ─── INSTRUCTOR: create assignment ────────────────────────────────────────
  static async createAssignment(payload: CreateAssignmentPayload): Promise<InstructorAssignmentItem> {
    const response = await APIConfig.fetch("/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  // ─── INSTRUCTOR: update assignment ────────────────────────────────────────
  static async updateAssignment(id: string, payload: Partial<CreateAssignmentPayload>): Promise<InstructorAssignmentItem> {
    const response = await APIConfig.fetch(`/assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  // ─── INSTRUCTOR: delete assignment ────────────────────────────────────────
  static async deleteAssignment(id: string): Promise<void> {
    await APIConfig.fetch(`/assignments/${id}`, { method: "DELETE" });
  }

  // ─── INSTRUCTOR: list submissions for an assignment ───────────────────────
  static async getSubmissions(assignmentId: string, query?: {
    page?: number; limit?: number; status?: string;
  }): Promise<InstructorSubmissionsResponse> {
    const params = new URLSearchParams();
    if (query?.page !== undefined) params.append("page", String(query.page));
    if (query?.limit !== undefined) params.append("limit", String(query.limit));
    if (query?.status) params.append("status", query.status);
    const qs = params.toString();
    const response = await APIConfig.fetch(`/assignments/${assignmentId}/submissions${qs ? `?${qs}` : ""}`);
    return response.json();
  }

  // ─── INSTRUCTOR: grade a submission ──────────────────────────────────────
  static async gradeSubmission(
    submissionId: string,
    payload: GradeSubmissionPayload,
  ): Promise<InstructorSubmission> {
    const response = await APIConfig.fetch(
      `/assignments/submissions/${submissionId}/grade`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        (err as { message?: string }).message ?? `Grade failed: ${response.status}`,
      );
    }
    return response.json();
  }

  // ─── INSTRUCTOR: get a single assignment (instructor view) ────────────────
  static async getInstructorAssignment(id: string): Promise<InstructorAssignmentItem> {
    const response = await APIConfig.fetch(`/assignments/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch assignment: ${response.status}`);
    return response.json();
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  private static toQueryString(query?: StudentAssignmentQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();
    if (query.status)   params.append("status",   query.status);
    if (query.courseId) params.append("courseId", query.courseId);
    if (query.page !== undefined)  params.append("page",  String(query.page));
    if (query.limit !== undefined) params.append("limit", String(query.limit));
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}

// ─── Instructor-facing types ──────────────────────────────────────────────────

export interface InstructorAssignmentItem {
  id: string;
  title: string;
  description: string;
  instructions: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  createdAt: string;
  maxScore: number;
  allowLate: boolean;
  allowedFileTypes: string[];
  attachments: AssignmentAttachment[];
  _count?: { submissions?: number };
  submissionStats?: { total: number; graded: number; pending: number };
}

export interface InstructorAssignmentListResponse {
  data: InstructorAssignmentItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface InstructorSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentAvatar?: string | null;
  submittedAt: string;
  isLate: boolean;
  status: AssignmentStatus;
  score?: number | null;
  grade?: LetterGrade | null;
  feedback?: string | null;
  files: AssignmentAttachment[];
  note?: string | null;
}

export interface InstructorSubmissionsResponse {
  data: InstructorSubmission[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  instructions?: string;
  courseId: string;
  dueDate: string;
  maxScore?: number;
  allowLate?: boolean;
  allowedFileTypes?: string[];
  attachmentKeys?: string[];
}

export interface GradeSubmissionPayload {
  score: number;
  grade: LetterGrade;
  feedback: string;
  rubric?: { id: string; label: string; maxScore: number; score: number }[];
}

// ─── INSTRUCTOR: grade a submission ──────────────────────────────────────────
// Exposed on the class below — appended here to keep types co-located.