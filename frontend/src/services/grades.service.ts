import { APIConfig } from "@/lib/api.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GradeComponent {
  type: "assignment" | "group" | string;
  sourceId: string;
  label: string;
  score: number;
  maxScore: number;
  resolvedGrade: number;       // 0–100 normalised score
  feedback: string | null;
  passed: boolean | null;
  gradedAt: string;
}

export interface CourseGrade {
  courseId: string;
  courseTitle: string;
  gradedComponents: number;
  totalComponents: number;
  averageGrade: number | null; // 0–100
  letterGrade: string | null;  // e.g. "A", "B+", "C-"
  components: GradeComponent[];
}

export interface CumulativeGradeReport {
  studentId: string;
  studentName: string;
  totalCourses: number;
  coursesWithGrades: number;
  overallGrade: number | null; // 0–100
  overallLetterGrade: string | null;
  courses: CourseGrade[];
}

export interface PaginatedGradeReports {
  data: CumulativeGradeReport[];
  meta: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: unknown;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export default class GradesService {
  /**
   * GET /grades/me
   * Returns the calling student's cumulative grade report.
   * Optionally narrow to a single course with courseId.
   */
  static async getMyGrades(courseId?: string): Promise<CumulativeGradeReport> {
    const qs = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
    const res = await APIConfig.fetch(`/grades/me${qs}`);
    return res.json();
  }

  /**
   * GET /grades/public/students/:studentId
   * Public — no auth required. Optionally narrow with courseId.
   */
  static async getPublicStudentGrades(
    studentId: string,
    courseId?: string,
  ): Promise<CumulativeGradeReport> {
    const qs = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
    const res = await APIConfig.fetch(`/grades/public/students/${studentId}${qs}`);
    return res.json();
  }

  /**
   * GET /grades/instructor
   * Paginated list of grade reports for students in the instructor's courses.
   */
  static async getInstructorGrades(params?: {
    courseId?: string;
    studentId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedGradeReports> {
    const qs = params ? `?${new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString()}` : "";
    const res = await APIConfig.fetch(`/grades/instructor${qs}`);
    return res.json();
  }

  /**
   * GET /grades/instructor/students/:studentId
   * Full grade report for a specific student scoped to the instructor's courses.
   */
  static async getInstructorStudentGrades(
    studentId: string,
    courseId?: string,
  ): Promise<CumulativeGradeReport> {
    const qs = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
    const res = await APIConfig.fetch(`/grades/instructor/students/${studentId}${qs}`);
    return res.json();
  }

  /**
   * GET /grades/admin
   * Platform-wide paginated grade reports (admin only).
   */
  static async getAdminGrades(params?: {
    courseId?: string;
    studentId?: string;
    instructorId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedGradeReports> {
    const qs = params ? `?${new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString()}` : "";
    const res = await APIConfig.fetch(`/grades/admin${qs}`);
    return res.json();
  }

  /**
   * GET /grades/admin/students/:studentId
   * Full grade report for any student (admin only).
   */
  static async getAdminStudentGrades(
    studentId: string,
    courseId?: string,
  ): Promise<CumulativeGradeReport> {
    const qs = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
    const res = await APIConfig.fetch(`/grades/admin/students/${studentId}${qs}`);
    return res.json();
  }
}
