import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface UpdateLessonProgressPayload {
  /** Current playback position in seconds */
  watchedSeconds: number;
  /** Total duration of the lesson in seconds */
  totalSeconds: number;
}

export interface TopCourseItem {
  id: string;
  title: string;
  img: string;
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
}

// ==================== SERVICE ====================

export default class ProgressService {
  // ─── STUDENT ─────────────────────────────────────────────────────────────────

  /**
   * Get the student's full learning dashboard —
   * enrolled courses, streak, weekly activity, stats.
   * STUDENT only.
   */
  static async getDashboard(): Promise<unknown> {
    const response = await APIConfig.fetch("/progress/dashboard");
    return response.json();
  }

  /**
   * Get enrolled courses sorted by relevance (in-progress first, then recent).
   * STUDENT only.
   */
  static async getTopCourses(): Promise<TopCourseItem[]> {
    const response = await APIConfig.fetch("/progress/top-courses");
    return response.json();
  }

  /**
   * Get the student's current XP total and level state.
   * STUDENT only.
   */
  static async getXP(): Promise<unknown> {
    const response = await APIConfig.fetch("/progress/xp");
    return response.json();
  }

  /**
   * Get the student's watch time analytics (by day / week / month).
   * STUDENT only.
   */
  static async getWatchTime(): Promise<unknown> {
    const response = await APIConfig.fetch("/progress/watch-time");
    return response.json();
  }

  /**
   * Get full progress detail for a specific course —
   * sections, lessons, completion percentages.
   * STUDENT only.
   * @param courseId - Course ID
   */
  static async getCourseProgress(courseId: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/progress/courses/${courseId}`);
    return response.json();
  }

  /**
   * Ping the backend with the student's current video playback position.
   * Called periodically by the video player.
   * STUDENT only.
   * @param lessonId - Lesson ID
   * @param payload  - Current watch position and total duration
   */
  static async updateLessonProgress(
    lessonId: string,
    payload: UpdateLessonProgressPayload
  ): Promise<unknown> {
    const response = await APIConfig.fetch(`/progress/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Manually mark a lesson as complete.
   * STUDENT only.
   * @param lessonId - Lesson ID
   */
  static async completeLesson(lessonId: string): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/progress/lessons/${lessonId}/complete`,
      { method: "POST" }
    );
    return response.json();
  }

  /**
   * Manually mark an entire course as complete.
   * STUDENT only.
   * @param courseId - Course ID
   */
  static async completeCourse(courseId: string): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/progress/courses/${courseId}/complete`,
      { method: "POST" }
    );
    return response.json();
  }

  // ─── INSTRUCTOR / ADMIN ───────────────────────────────────────────────────────

  /**
   * Get watch time analytics broken down by course and student.
   * INSTRUCTOR (own courses) / ADMIN (all courses).
   */
  static async getInstructorWatchTime(): Promise<unknown> {
    const response = await APIConfig.fetch("/progress/instructor/watch-time");
    return response.json();
  }
}