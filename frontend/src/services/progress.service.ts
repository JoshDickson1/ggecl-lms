import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface UpdateLessonProgressPayload {
  /** Current playback position in seconds (total seconds watched so far) */
  watchedSeconds: number;
}

export interface TopCourseItem {
  courseId: string;
  courseTitle: string;
  courseImg: string;
  instructor: {
    id: string;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  };
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  isCompleted: boolean;
  lastLessonId: string | null;
  lastLessonTitle: string | null;
  lastActivityAt: string | null;
}

export interface LastWatchedCourse {
  courseId: string;
  courseTitle: string;
  courseImg?: string;
  instructor: {
    id: string;
    user: {
      id: string;
      name: string;
      image?: string | null;
    };
  };
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  isCompleted: boolean;
  lastLessonId?: string | null;
  lastLessonTitle?: string | null;
  lastActivityAt: string;
}

export interface WatchTimeByCourse {
  courseId: string;
  courseTitle: string;
  totalMinutes: number;
}

export interface WatchTimeByStudent {
  studentId: string;
  studentName: string;
  totalMinutes: number;
}

export interface InstructorWatchTimeResponse {
  totalMinutes: number;
  period: string;
  byCourse: WatchTimeByCourse[];
  byStudent: WatchTimeByStudent[];
}

export interface InstructorCourseAnalyticsItem {
  courseId: string;
  courseTitle: string;
  courseImg: string | null;
  courseStatus: string;
  enrolledCount: number;
  completedCount: number;
  completionRate: number;
  inProgressCount: number;
  notStartedCount: number;
  avgCompletionPercent: number;
  totalWatchMinutes: number;
  avgWatchMinutesPerStudent: number;
}

export interface PlatformCompletionRate {
  avgCompletionPercent: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
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
   * Get the last watched course (most recent activity).
   * Returns the course the student most recently had activity on,
   * with full course details including instructor info, progress stats,
   * and the last lesson they were on. Returns null if no progress yet.
   * STUDENT only.
   */
  static async getLastWatchedCourse(): Promise<LastWatchedCourse | null> {
    const response = await APIConfig.fetch("/progress/last-watched-course");
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
      body: JSON.stringify({ watchedSeconds: payload.watchedSeconds }),
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
   * @param period - Time window: "daily" | "weekly" | "monthly" | "all" (default: "all")
   */
  static async getInstructorWatchTime(period: "daily" | "weekly" | "monthly" | "all" = "all"): Promise<InstructorWatchTimeResponse> {
    const response = await APIConfig.fetch(`/progress/instructor/watch-time?period=${period}`);
    return response.json();
  }

  /**
   * Get platform-wide completion rate across all enrolled students.
   * Returns avg completion %, total enrollments, completed enrollments, and overall rate.
   * ADMIN only.
   */
  static async getPlatformCompletionRate(): Promise<PlatformCompletionRate> {
    const response = await APIConfig.fetch("/progress/admin/platform/completion-rate");
    return response.json();
  }

  /**
   * Get course-wide analytics for the instructor's own courses.
   * Returns completion rate, in-progress/not-started counts, and watch time per course.
   * INSTRUCTOR only.
   */
  static async getInstructorCourseAnalytics(): Promise<InstructorCourseAnalyticsItem[]> {
    const response = await APIConfig.fetch("/progress/instructor/courses/analytics");
    const json = await response.json();
    if (Array.isArray(json)) return json as InstructorCourseAnalyticsItem[];
    if (Array.isArray((json as any)?.data)) return (json as any).data as InstructorCourseAnalyticsItem[];
    return [];
  }
}