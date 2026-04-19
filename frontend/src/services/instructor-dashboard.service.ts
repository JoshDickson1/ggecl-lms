import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export type PeriodGranularity = "day" | "week" | "month";

export interface InstructorDashboardQuery {
  from?: string;
  to?: string;
  granularity?: PeriodGranularity;
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export interface TotalStudents {
  totalUniqueStudents: number;
}

export interface StudentsPerCourseItem {
  courseId: string;
  title: string;
  status: string;
  img: string | null;
  studentCount: number;
}

// ─── REVENUE ─────────────────────────────────────────────────────────────────

export interface TotalRevenue {
  total: number;
  enrollmentCount: number;
  averageOrderValue: number;
}

export interface RevenuePerCourseItem {
  courseId: string;
  title: string;
  status: string;
  pricePerSeat: number;
  enrollmentCount: number;
  revenue: number;
}

export interface RevenueTimelineItem {
  period: Date;
  revenue: number;
  enrollments: number;
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

export interface ReviewsPerCourseItem {
  courseId: string;
  title: string;
  reviewCount: number;
  averageRating: number;
}

export interface AverageReviews {
  overallAverage: number;
  totalReviews: number;
  perCourse: ReviewsPerCourseItem[];
}

export interface ReviewReply {
  id: string;
  comment: string;
  isEdited: boolean;
  createdAt: Date;
}

export interface RecentReviewItem {
  id: string;
  rating: number;
  comment: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  course: { id: string; title: string; img: string | null };
  student: { name: string; avatar: string | null };
  reply: ReviewReply | null;
}

// ─── COMPLETION RATE ─────────────────────────────────────────────────────────

export interface CompletionRatePerCourseItem {
  courseId: string;
  title: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
}

export interface CompletionRate {
  overallRate: number;
  totalEnrollments: number;
  completedEnrollments: number;
  perCourse: CompletionRatePerCourseItem[];
}

// ─── ACTIVITY ─────────────────────────────────────────────────────────────────

export interface ActivityPerCourseItem {
  courseId: string;
  title: string;
  activeStudents: number;
  averageProgressPercent: number;
  totalTimeSpentSeconds: number;
}

export interface TotalStudentActivity {
  activeStudentsInPeriod: number;
  lessonsCompleted: number;
  totalTimeSpentSeconds: number;
}

// ─── TOP COURSES ──────────────────────────────────────────────────────────────

export interface TopCourseItem {
  courseId: string;
  title: string;
  img: string | null;
  price: number;
  status: string;
  enrollmentCount: number;
  revenue: number;
  averageRating: number;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export interface ActivityCourseRef {
  id: string;
  title: string;
  img: string | null;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  course: ActivityCourseRef | null;
  metadata: Record<string, unknown>;
}

export interface ActivitiesResponse {
  unreadCount: number;
  activities: ActivityItem[];
}

// ─── SUMMARY ──────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalStudents: TotalStudents;
  studentsPerCourse: StudentsPerCourseItem[];
  totalRevenue: TotalRevenue;
  revenuePerCourse: RevenuePerCourseItem[];
  avgReviews: AverageReviews;
  completionRate: CompletionRate;
  topCourses: TopCourseItem[];
}

// ==================== SERVICE ====================

export default class InstructorDashboardService {
  private static readonly base = "/dashboard/instructor";

  /**
   * Full dashboard snapshot — all key metrics in one request.
   * @param query - Optional date range and granularity
   */
  static async getSummary(query?: InstructorDashboardQuery): Promise<DashboardSummary> {
    const response = await APIConfig.fetch(
      `${this.base}/summary${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Total unique students enrolled across all courses
   */
  static async getTotalStudents(): Promise<TotalStudents> {
    const response = await APIConfig.fetch(`${this.base}/students`);
    return response.json();
  }

  /**
   * Enrollment count per course, sorted by popularity
   */
  static async getStudentsPerCourse(): Promise<StudentsPerCourseItem[]> {
    const response = await APIConfig.fetch(`${this.base}/students/per-course`);
    return response.json();
  }

  /**
   * Aggregate revenue for a date range
   * @param query - Optional date range
   */
  static async getTotalRevenue(query?: InstructorDashboardQuery): Promise<TotalRevenue> {
    const response = await APIConfig.fetch(
      `${this.base}/revenue${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Revenue and enrollment count broken down per course
   * @param query - Optional date range
   */
  static async getRevenuePerCourse(
    query?: InstructorDashboardQuery
  ): Promise<RevenuePerCourseItem[]> {
    const response = await APIConfig.fetch(
      `${this.base}/revenue/per-course${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Revenue time-series for chart rendering, grouped by day/week/month
   * @param query - Optional date range and granularity
   */
  static async getRevenueTimeline(
    query?: InstructorDashboardQuery
  ): Promise<RevenueTimelineItem[]> {
    const response = await APIConfig.fetch(
      `${this.base}/revenue/timeline${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Overall and per-course average ratings
   */
  static async getAverageReviews(): Promise<AverageReviews> {
    const response = await APIConfig.fetch(`${this.base}/reviews`);
    return response.json();
  }

  /**
   * Most recent reviews left on the instructor's courses
   * @param limit - Max reviews to return (default: 10)
   */
  static async getRecentReviews(limit = 10): Promise<RecentReviewItem[]> {
    const response = await APIConfig.fetch(
      `${this.base}/reviews/recent?limit=${limit}`
    );
    return response.json();
  }

  /**
   * Overall and per-course completion rates
   */
  static async getCompletionRate(): Promise<CompletionRate> {
    const response = await APIConfig.fetch(`${this.base}/completion-rate`);
    return response.json();
  }

  /**
   * Aggregate student activity across all courses for a period
   * @param query - Optional date range
   */
  static async getTotalStudentActivity(
    query?: InstructorDashboardQuery
  ): Promise<TotalStudentActivity> {
    const response = await APIConfig.fetch(
      `${this.base}/activity${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Active students, avg progress, and time spent broken down per course
   * @param query - Optional date range
   */
  static async getStudentActivityPerCourse(
    query?: InstructorDashboardQuery
  ): Promise<ActivityPerCourseItem[]> {
    const response = await APIConfig.fetch(
      `${this.base}/activity/per-course${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Top N courses ranked by enrollment, with revenue and rating
   * @param limit - Number of courses to return (default: 5)
   */
  static async getTopCourses(limit = 5): Promise<TopCourseItem[]> {
    const response = await APIConfig.fetch(
      `${this.base}/top-courses?limit=${limit}`
    );
    return response.json();
  }

  /**
   * Post or update a reply to a student review
   * @param reviewId - The review ID to reply to
   * @param comment  - Reply text
   */
  static async postReply(reviewId: string, comment: string): Promise<unknown> {
    const response = await APIConfig.fetch(
      `${this.base}/reviews/${reviewId}/reply`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      }
    );
    return response.json();
  }

  /**
   * Instructor activity feed / notifications
   * @param limit - Max notifications to return (default: 20)
   * @param onlyUnread - If true, returns only unread notifications
   */
  static async getActivities(
    limit = 20,
    onlyUnread = false
  ): Promise<ActivitiesResponse> {
    const response = await APIConfig.fetch(
      `${this.base}/notifications?limit=${limit}&onlyUnread=${onlyUnread}`
    );
    return response.json();
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  private static toQueryString(query?: InstructorDashboardQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();
    if (query.from)        params.append("from",        query.from);
    if (query.to)          params.append("to",          query.to);
    if (query.granularity) params.append("granularity", query.granularity);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}