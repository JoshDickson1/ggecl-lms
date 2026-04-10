import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

// ─── LESSON PROGRESS ─────────────────────────────────────────────────────────

export interface LessonProgress {
  lessonId: string;
  watchedSeconds: number;
  duration: number;
  percentWatched: number;
  isCompleted: boolean;
  completedAt: Date | null;
  lastWatchedAt: Date;
}

// ─── COURSE PROGRESS ─────────────────────────────────────────────────────────

export interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  totalTimeSpent: number;
  isCompleted: boolean;
  completedAt: Date | null;
  lastActivityAt: Date;
  lastLessonId: string | null;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: Date | null;
}

export interface WeeklyActivityDay {
  date: string;
  label: string;
  minutes: number;
}

export interface WeeklyActivity {
  days: WeeklyActivityDay[];
  totalThisWeek: number;
  dailyAverage: number;
  mostActiveDay: string | null;
}

export interface DashboardStats {
  totalTimeSpentThisMonth: number;
  streak: LearningStreak;
  completedCourses: number;
  avgCompletionPercent: number;
  weeklyActivity: WeeklyActivity;
}

export interface InstructorSummary {
  name: string;
  image: string | null;
}

export interface CourseProgressSummary {
  courseId: string;
  courseTitle: string;
  courseImg: string;
  instructor: InstructorSummary;
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  totalTimeSpent: number;
  isCompleted: boolean;
  lastActivityAt: Date;
  lastLessonId: string | null;
  lastLessonTitle: string | null;
}

export interface FullDashboard {
  stats: DashboardStats;
  courses: CourseProgressSummary[];
}

// ==================== SERVICE ====================

export default class ProgressService {
  /**
   * Get the full student learning dashboard.
   * Includes monthly time stats, streak, weekly activity, and per-course progress.
   */
  static async getDashboard(): Promise<FullDashboard> {
    const response = await APIConfig.fetch("/progress/dashboard");
    return response.json();
  }

  /**
   * Get course progress detail with per-lesson progress state.
   * Used to render the course-player sidebar / lesson list.
   * @param courseId - Course ID
   */
  static async getCourseDetail(courseId: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/progress/courses/${courseId}`);
    return response.json();
  }

  /**
   * Update lesson watch progress (video-player ping).
   * Call every ~10–15 seconds with the current playback position.
   * Auto-completes the lesson when ≥ 80% is watched.
   * @param lessonId - Lesson ID
   * @param watchedSeconds - Current playback position in seconds
   */
  static async updateLessonProgress(
    lessonId: string,
    watchedSeconds: number
  ): Promise<LessonProgress> {
    const response = await APIConfig.fetch(`/progress/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, watchedSeconds }),
    });
    return response.json();
  }

  /**
   * Manually mark a lesson as complete.
   * Credits full duration as watched and recomputes course progress.
   * @param lessonId - Lesson ID
   */
  static async markLessonComplete(lessonId: string): Promise<LessonProgress> {
    const response = await APIConfig.fetch(
      `/progress/lessons/${lessonId}/complete`,
      { method: "POST" }
    );
    return response.json();
  }

  /**
   * Manually mark a course as complete.
   * Idempotency-safe — throws 400 if already marked complete.
   * @param courseId - Course ID
   */
  static async markCourseComplete(courseId: string): Promise<CourseProgress> {
    const response = await APIConfig.fetch(
      `/progress/courses/${courseId}/complete`,
      { method: "POST" }
    );
    return response.json();
  }
}