import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface AdminDashboardQuery {
  from?: string; // ISO 8601 date, e.g. "2024-01-01"
  to?: string;   // ISO 8601 date, e.g. "2024-12-31"
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
}

export interface InstructorStats {
  total: number;
  active: number;
  withPublishedCourse: number;
}

export interface CourseStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface RevenueStats {
  total: number;
  /** Summary uses `orderCount`, dedicated revenue endpoint uses `enrollmentCount` */
  orderCount?: number;
  enrollmentCount?: number;
  averageOrderValue: number;
  byGateway?: { gateway: string; revenue: number; count: number }[];
  daily?: { date: string; revenue: number }[];
}

export interface EnrollmentStats {
  total: number;
  daily?: { date: string; count: number }[];
}

export interface EnrollmentsByCategory {
  categories: { tag: string; enrollments: number; courseCount: number }[];
}

export interface CourseCompletionEntry {
  id: string;
  title: string;
  img: string | null;
  avgCompletionRate: number;
  enrolledCount: number;
  completedCount: number;
}

export interface CoursesByCompletionRate {
  courses: CourseCompletionEntry[];
}

export interface CompletionSummary {
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
}

export interface TopEnrolledCourse {
  id: string;
  title: string;
  img?: string | null;
  price?: number;
  level?: string;
  enrollmentCount: number;
  averageRating?: number;
  instructor?: string;
  instructorAvatar?: string | null;
}

export interface SignupDaySeries {
  date: string;
  count: number;
}

export interface SignupStats {
  total: number;
  byRole: { students: number; instructors: number; admins: number };
  daily: SignupDaySeries[];
  /** Legacy compat — dedicated signups endpoint may return these flat */
  students?: number;
  instructors?: number;
  series?: SignupDaySeries[];
}

export interface AdminActivityItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AdminSummary {
  students: StudentStats;
  instructors: InstructorStats;
  courses: CourseStats;
  revenue: RevenueStats;
  enrollments: EnrollmentStats;
  enrollmentsByCategory: EnrollmentsByCategory;
  coursesByCompletionRate: CoursesByCompletionRate;
  completion: CompletionSummary;
  topEnrollments: TopEnrolledCourse[];
  signups: SignupStats;
  recentActivities?: AdminActivityItem[];
  /** Legacy compat — dedicated completion endpoint */
  completionRate?: { rate?: number; overallRate?: number };
}

// ==================== SERVICE ====================

export default class AdminDashboardService {
  private static readonly base = "/dashboard/admin";

  /**
   * Full dashboard snapshot — all key metrics in one request.
   * Ideal for the main dashboard page load.
   * @param query - Optional date range (from, to)
   */
  static async getSummary(query?: AdminDashboardQuery): Promise<AdminSummary> {
    const response = await APIConfig.fetch(
      `${this.base}/summary${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Student counts: total, active, and inactive
   */
  static async getStudents(): Promise<StudentStats> {
    const response = await APIConfig.fetch(`${this.base}/students`);
    return response.json();
  }

  /**
   * Instructor counts: total, active, and those with a published course
   */
  static async getInstructors(): Promise<InstructorStats> {
    const response = await APIConfig.fetch(`${this.base}/instructors`);
    return response.json();
  }

  /**
   * Course counts broken down by status: published, draft, archived
   */
  static async getCourses(): Promise<CourseStats> {
    const response = await APIConfig.fetch(`${this.base}/courses`);
    return response.json();
  }

  /**
   * Revenue stats for a date range: total, order count, avg order value.
   * Defaults to last 30 days if no range is provided.
   * @param query - Optional date range (from, to)
   */
  static async getRevenue(query?: AdminDashboardQuery): Promise<RevenueStats> {
    const response = await APIConfig.fetch(
      `${this.base}/revenue${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Platform-wide course completion rate
   */
  static async getCompletionRate(): Promise<CompletionSummary> {
    const response = await APIConfig.fetch(`${this.base}/completion-rate`);
    return response.json();
  }

  /**
   * Top N most enrolled published courses
   * @param limit - Number of courses to return (default: 10)
   */
  static async getTopEnrollments(limit = 10): Promise<TopEnrolledCourse[]> {
    const response = await APIConfig.fetch(
      `${this.base}/top-enrollments?limit=${limit}`
    );
    return response.json();
  }

  /**
   * New user signups for a date range, broken down by role with a daily series
   * @param query - Optional date range (from, to)
   */
  static async getSignups(query?: AdminDashboardQuery): Promise<SignupStats> {
    const response = await APIConfig.fetch(
      `${this.base}/signups${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Recent platform-wide activity feed entries across all users
   * @param limit - Number of activities to return (default: 20)
   * @param onlyUnread - If true, returns only unread activities
   */
  static async getRecentActivities(
    limit = 20,
    onlyUnread = false
  ): Promise<AdminActivityItem[]> {
    const response = await APIConfig.fetch(
      `${this.base}/activities?limit=${limit}&onlyUnread=${onlyUnread}`
    );
    return response.json();
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  private static toQueryString(query?: AdminDashboardQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();
    if (query.from) params.append("from", query.from);
    if (query.to)   params.append("to",   query.to);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}