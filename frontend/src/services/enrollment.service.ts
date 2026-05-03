import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface EnrollPayload {
  courseId: string;
}

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface MyEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    img: string;
    price: number;
    level: CourseLevel;
    instructorId: string;
  };
}

// ==================== SERVICE ====================

export default class EnrollmentService {
  // ─── STUDENT ─────────────────────────────────────────────────────────────────

  /**
   * Enroll the current student in a course.
   * STUDENT only.
   * @param courseId - Course ID to enroll in
   */
  static async enroll(courseId: string): Promise<unknown> {
    const response = await APIConfig.fetch("/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId } satisfies EnrollPayload),
    });
    return response.json();
  }

  /**
   * Unenroll the current student from a course.
   * STUDENT only.
   * @param courseId - Course ID to unenroll from
   */
  static async unenroll(courseId: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/enrollments/${courseId}`, {
      method: "DELETE",
    });
    return response.json();
  }

  /**
   * Get all courses the current student is enrolled in.
   * STUDENT only.
   */
  static async getMine(): Promise<MyEnrollment[]> {
    const response = await APIConfig.fetch("/enrollments/mine");
    return response.json();
  }

  /**
   * Get the public enrollment count for a course.
   * No auth required.
   */
  static async getCount(): Promise<unknown> {
    const response = await APIConfig.fetch("/enrollments/count");
    return response.json();
  }

  // ─── ADMIN / INSTRUCTOR ───────────────────────────────────────────────────────

  /**
   * List all enrollments across the platform.
   * ADMIN only.
   */
  static async findAll(): Promise<unknown> {
    const response = await APIConfig.fetch("/enrollments");
    return response.json();
  }

  /**
   * Get all enrollments for a specific course.
   * ADMIN or INSTRUCTOR (own courses only).
   * @param courseId - Course ID
   */
  static async findByCourse(courseId: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/enrollments/course/${courseId}`);
    return response.json();
  }

  /**
   * Bulk-enroll students into a course. ADMIN only.
   * Backend: POST /enrollments/admin/enroll/bulk
   * @param courseId   - Target course ID
   * @param studentIds - Array of studentProfile IDs to enroll
   */
  static async adminBulkEnroll(courseId: string, studentIds: string[]): Promise<unknown> {
    if (!courseId || !studentIds.length) {
      throw new Error("Course ID and student IDs are required for admin enrollment");
    }
    const response = await APIConfig.fetch("/enrollments/admin/enroll/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, studentIds }),
    });
    return response.json();
  }

  /**
   * Admin unenroll: Remove a student from a course. ADMIN only.
   * NOTE: This endpoint needs to be implemented on the backend.
   * Expected: DELETE /api/enrollments/admin/unenroll
   * Body: { courseId, studentId }
   * @param courseId - Course ID
   * @param studentId - Student profile ID to unenroll
   */
  static async adminUnenroll(courseId: string, studentId: string): Promise<unknown> {
    if (!courseId || !studentId) {
      throw new Error("Course ID and student ID are required for admin unenrollment");
    }
    const response = await APIConfig.fetch("/enrollments/admin/unenroll", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, studentId }),
    });
    return response.json();
  }

  // Instructor/Admin: get all enrollments for a specific student across courses
  static async findByStudent(studentId: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/enrollments/student/${studentId}`);
    return response.json();
  }
}