import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface EnrollPayload {
  courseId: string;
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
  static async getMine(): Promise<unknown> {
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
}