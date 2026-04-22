import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface AssignmentResponse {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  maxScore: number;
  dueDate: string;
  allowLate: boolean;
  attachments: string[];
  createdAt: string;
}

export interface CreateAssignmentDto {
  title: string;
  courseId: string;
  description: string;
  instructions: string;
  maxScore: number;
  dueDate: string;
  allowLate: boolean;
  attachments: string[];
}

export interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  instructions?: string;
  maxScore?: number;
  dueDate?: string;
  allowLate?: boolean;
  attachments?: string[];
}

export interface SubmissionResponse {
  id: string;
  assignmentId: string;
  studentId: string;
  attachments: string[];
  note: string;
  isLate: boolean;
  submittedAt: string;
  grade?: {
    id: string;
    score: number;
    resolvedGrade: number;
    feedback: Record<string, any>;
    gradedAt: string;
  };
}

export interface AssignmentStats {
  totalEnrolled: number;
  totalSubmissions: number;
  submissionRate: number;
  lateSubmissions: number;
  graded: number;
}

export interface GradeSubmissionDto {
  score: number;
  feedback: string;
}

export interface SubmitAssignmentDto {
  attachments: string[];
  note: string;
}

// ==================== SERVICE ====================

export default class AssignmentService {
  private static readonly base = "/assignments";

  /**
   * Create a new assignment
   */
  static async create(data: CreateAssignmentDto): Promise<AssignmentResponse> {
    const response = await APIConfig.fetch(this.base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * List assignments (instructor/admin)
   */
  static async list(params?: {
    page?: number;
    limit?: number;
    courseId?: string;
    status?: string;
  }): Promise<{ data: AssignmentResponse[]; meta: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.courseId) searchParams.append("courseId", params.courseId);
    if (params?.status) searchParams.append("status", params.status);

    const response = await APIConfig.fetch(`${this.base}?${searchParams.toString()}`);
    return response.json();
  }

  /**
   * Get a single assignment by ID
   */
  static async getById(id: string): Promise<AssignmentResponse> {
    const response = await APIConfig.fetch(`${this.base}/${id}`);
    return response.json();
  }

  /**
   * Update an assignment
   */
  static async update(id: string, data: UpdateAssignmentDto): Promise<AssignmentResponse> {
    const response = await APIConfig.fetch(`${this.base}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Delete an assignment
   */
  static async delete(id: string): Promise<void> {
    await APIConfig.fetch(`${this.base}/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Get all submissions for an assignment
   */
  static async getSubmissions(id: string, params?: {
    page?: number;
    limit?: number;
    lateOnly?: boolean;
  }): Promise<{ data: SubmissionResponse[]; meta: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.lateOnly) searchParams.append("lateOnly", "true");

    const response = await APIConfig.fetch(`${this.base}/${id}/submissions?${searchParams.toString()}`);
    return response.json();
  }

  /**
   * Get submission stats for an assignment
   */
  static async getStats(id: string): Promise<AssignmentStats> {
    const response = await APIConfig.fetch(`${this.base}/${id}/stats`);
    return response.json();
  }

  /**
   * Grade a student submission
   */
  static async gradeSubmission(submissionId: string, data: GradeSubmissionDto): Promise<any> {
    const response = await APIConfig.fetch(`${this.base}/submissions/${submissionId}/grade`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Submit an assignment (student)
   */
  static async submit(id: string, data: SubmitAssignmentDto): Promise<SubmissionResponse> {
    const response = await APIConfig.fetch(`${this.base}/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Get student's submission for an assignment
   */
  static async getMySubmission(id: string): Promise<SubmissionResponse> {
    const response = await APIConfig.fetch(`${this.base}/${id}/my-submission`);
    return response.json();
  }

  /**
   * List assignments for student (with submission status)
   */
  static async listForStudent(params?: {
    page?: number;
    limit?: number;
    courseId?: string;
    status?: string;
  }): Promise<{ data: any[]; meta: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.courseId) searchParams.append("courseId", params.courseId);
    if (params?.status) searchParams.append("status", params.status);

    const response = await APIConfig.fetch(`${this.base}/student/list?${searchParams.toString()}`);
    return response.json();
  }

  /**
   * Get instructor overview stats
   */
  static async getInstructorOverview(params?: {
    courseId?: string;
  }): Promise<{
    totalAssignments: number;
    totalSubmissions: number;
    totalGraded: number;
    gradingRate: number;
    courseBreakdown?: any[];
  }> {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.append("courseId", params.courseId);

    const response = await APIConfig.fetch(`${this.base}/overview/instructor?${searchParams.toString()}`);
    return response.json();
  }

  /**
   * Get admin overview stats
   */
  static async getAdminOverview(params?: {
    courseId?: string;
    instructorId?: string;
  }): Promise<{
    totalAssignments: number;
    totalSubmissions: number;
    totalGraded: number;
    gradingRate: number;
    instructorBreakdown?: any[];
  }> {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.append("courseId", params.courseId);
    if (params?.instructorId) searchParams.append("instructorId", params.instructorId);

    const response = await APIConfig.fetch(`${this.base}/overview/admin?${searchParams.toString()}`);
    return response.json();
  }
}
