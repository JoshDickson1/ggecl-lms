// src/services/AssignmentService.ts
// Real API integration for student and instructor assignments.

import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export type AssignmentStatus =
  | "pending"
  | "submitted"
  | "late"
  | "graded"

export type LetterGrade =
  | "A+" | "A" | "A-"
  | "B+" | "B" | "B-"
  | "C+" | "C" | "C-"
  | "D" | "F";

// ─── Raw API shapes (as returned by the server) ───────────────────────────────

/** Submission object embedded in the student list response */
export interface RawSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  attachments: string[];   // R2 public URLs
  note: string | null;
  isLate: boolean;
  submittedAt: string;
  grade: {
    id: string;
    score: number;
    resolvedGrade: number;
    feedback: unknown;
    gradedAt: string;
  } | null;
}

/** Raw assignment item as returned by GET /api/assignments/student/list */
export interface RawStudentAssignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  maxScore: number;
  dueDate: string;
  allowLate: boolean;
  attachments: string[];       // instructor/admin file URLs
  createdAt: string;
  submissions: RawSubmission[]; // all submissions (usually 0 or 1 for a student)
  status: "all" | "pending" | "submitted" | "graded";
  submission: RawSubmission | null; // the student's own submission (convenience field)
}

// ─── Normalised attachment object used throughout the UI ─────────────────────
export interface AssignmentAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  mimeType?: string;
}

// ─── Normalised submission used throughout the UI ─────────────────────────────
export interface NormalisedSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  files: AssignmentAttachment[];
  note: string | null;
  isLate: boolean;
  submittedAt: string;
  score: number | null;
  grade: LetterGrade | null;
  feedback: string | null;
  gradedAt: string | null;
}

// ─── Student-facing assignment list item (normalised) ─────────────────────────
// Derived from RawStudentAssignment — ready for the UI to consume.
export interface StudentAssignmentItem {
  id: string;
  title: string;
  description: string;
  instructions: string;
  courseId: string;
  courseName: string;       // not in API — kept for UI; falls back to courseId
  dueDate: string;          // ISO
  createdAt: string;
  createdBy: "instructor" | "admin";
  creatorName: string;      // not in API — kept for UI; falls back to empty string
  maxScore: number;
  allowLate: boolean;
  allowedFileTypes: string[];
  attachments: AssignmentAttachment[];  // normalised from string[]
  // derived submission status
  status: AssignmentStatus;
  // the student's own submission (null if not yet submitted)
  submission: NormalisedSubmission | null;
  // convenience fields derived from submission
  submittedAt?: string | null;
  isLate?: boolean;
  score?: number | null;
  grade?: LetterGrade | null;
  feedback?: string | null;
  submissionId?: string | null;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive a filename from a URL (last path segment, decoded). */
function fileNameFromUrl(url: string): string {
  try {
    const decoded = decodeURIComponent(new URL(url).pathname);
    return decoded.split("/").filter(Boolean).pop() ?? url;
  } catch {
    return url.split("/").pop() ?? url;
  }
}

/** Convert a raw URL string into a display-friendly AttachmentAttachment object. */
function normaliseAttachment(url: string, index: number): AssignmentAttachment {
  return {
    id:   `att-${index}-${url.slice(-8)}`,
    name: fileNameFromUrl(url),
    url,
  };
}

/** Map the API status string to our internal AssignmentStatus. */
function deriveStatus(raw: RawStudentAssignment): AssignmentStatus {
  const sub = raw.submission;
  if (!sub) return "pending";
  if (sub.grade) return "graded";
  if (sub.isLate) return "late";
  return "submitted";
}

/** Normalise a RawSubmission into a NormalisedSubmission. */
function normaliseSubmission(raw: RawSubmission): NormalisedSubmission {
  return {
    id:           raw.id,
    assignmentId: raw.assignmentId,
    studentId:    raw.studentId,
    files:        (raw.attachments ?? []).map(normaliseAttachment),
    note:         raw.note,
    isLate:       raw.isLate,
    submittedAt:  raw.submittedAt,
    score:        raw.grade?.score ?? null,
    grade:        (raw.grade?.resolvedGrade != null
                    ? String(raw.grade.resolvedGrade)
                    : null) as LetterGrade | null,
    feedback:     raw.grade?.feedback != null
                    ? String(raw.grade.feedback)
                    : null,
    gradedAt:     raw.grade?.gradedAt ?? null,
  };
}

/** Normalise a raw API assignment into a UI-ready StudentAssignmentItem. */
function normaliseAssignment(raw: RawStudentAssignment): StudentAssignmentItem {
  const normSub = raw.submission ? normaliseSubmission(raw.submission) : null;
  const status  = deriveStatus(raw);

  return {
    id:              raw.id,
    title:           raw.title,
    description:     raw.description ?? "",
    instructions:    raw.instructions ?? "",
    courseId:        raw.courseId,
    courseName:      raw.courseId,   // API doesn't return courseName; use courseId as fallback
    dueDate:         raw.dueDate,
    createdAt:       raw.createdAt,
    createdBy:       "instructor",   // API doesn't return createdBy; default to instructor
    creatorName:     "",             // API doesn't return creatorName
    maxScore:        raw.maxScore,
    allowLate:       raw.allowLate,
    allowedFileTypes: [],            // API doesn't return allowedFileTypes in list
    attachments:     (raw.attachments ?? []).map(normaliseAttachment),
    status,
    submission:      normSub,
    submittedAt:     normSub?.submittedAt ?? null,
    isLate:          normSub?.isLate,
    score:           normSub?.score ?? null,
    grade:           normSub?.grade ?? null,
    feedback:        normSub?.feedback ?? null,
    submissionId:    normSub?.id ?? null,
  };
}

// ─── Submit assignment payload ────────────────────────────────────────────────
// Matches POST /api/assignments/{id}/submit
export interface SubmitAssignmentPayload {
  attachments: string[];  // public CDN URLs from StorageService.upload()
  note?: string;          // optional student note to instructor
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
   *
   * The raw API returns attachments as string[] (URLs) and embeds the
   * student's submission directly on each item. This method normalises
   * the response into the UI-ready StudentAssignmentItem shape.
   */
  static async getMyAssignments(
    query?: StudentAssignmentQuery,
  ): Promise<PaginatedStudentAssignments> {
    const qs = AssignmentService.toQueryString(query);
    const response = await APIConfig.fetch(`/assignments/student/list${qs}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        (err as { message?: string }).message ??
          `Failed to fetch assignments: ${response.status}`,
      );
    }
    const raw: { data: RawStudentAssignment[]; meta: PaginatedStudentAssignments["meta"] } =
      await response.json();
    return {
      data: (raw.data ?? []).map(normaliseAssignment),
      meta: raw.meta,
    };
  }

  // ─── STUDENT: submit an assignment ───────────────────────────────────────
  /**
   * POST /api/assignments/{id}/submit
   *
   * Upload files to R2 first via StorageService.upload() to get public CDN
   * URLs, then call this with those URLs.
   * One submission per student per assignment — resubmission is not supported.
   *
   * @example
   * const url = await StorageService.upload("assignments", file);
   * await AssignmentService.submit(assignmentId, { attachments: [url], note });
   */
  static async submit(
    assignmentId: string,
    payload: SubmitAssignmentPayload,
  ): Promise<NormalisedSubmission> {
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
    const raw: RawSubmission = await response.json();
    return normaliseSubmission(raw);
  }

  // ─── STUDENT: get their own submission for one assignment ─────────────────
  /**
   * GET /api/assignments/{id}/my-submission
   * Returns the student's submission (with grade if available).
   * Returns null if no submission exists yet (404).
   */
  static async getMySubmission(assignmentId: string): Promise<NormalisedSubmission | null> {
    const response = await APIConfig.fetch(
      `/assignments/${assignmentId}/my-submission`,
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Failed to fetch submission: ${response.status}`);
    }
    const raw: RawSubmission = await response.json();
    return normaliseSubmission(raw);
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