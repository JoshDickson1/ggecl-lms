import { APIConfig } from "@/lib/api.config";

// ==================== ENUMS ====================

export enum AchievementKey {
  // Student achievements
  GOAL_CRUSHER      = "GOAL_CRUSHER",       // completed all learning goals
  OVERACHIEVER      = "OVERACHIEVER",        // completed more courses than average
  FIRST_STEP        = "FIRST_STEP",          // completed first lesson
  COURSE_COLLECTOR  = "COURSE_COLLECTOR",    // enrolled in 5+ courses
  STREAK_CHAMPION   = "STREAK_CHAMPION",     // reached a 30-day streak
  QUICK_LEARNER     = "QUICK_LEARNER",       // completed a course in under 7 days
  DEDICATED_LEARNER = "DEDICATED_LEARNER",   // 100 total lessons completed
  REVIEW_WRITER     = "REVIEW_WRITER",       // submitted first review
  // Instructor achievements
  GRADUATION_MAKER  = "GRADUATION_MAKER",    // first student completed their course
  FAN_FAVORITE      = "FAN_FAVORITE",        // course reached 4.5+ avg rating with 10+ reviews
  PROLIFIC_CREATOR  = "PROLIFIC_CREATOR",    // published 5+ courses
  MENTOR            = "MENTOR",              // 50+ students enrolled across all courses
  TOP_RATED         = "TOP_RATED",           // received 10+ five-star reviews
}

// ==================== TYPES ====================

export interface Achievement {
  id: string;
  key: AchievementKey;
  name: string;
  description: string;
  icon?: string | null;
  targetRole: string;
}

export interface AchievementResponse {
  id: string;
  key: AchievementKey;
  name: string;
  description: string;
  icon?: string | null;
  targetRole: string;
  count: number;
  awardedAt: Date;
}

export interface UserAchievementsResponse {
  achievements: AchievementResponse[];
  total: number;
}

export interface GrantAchievementPayload {
  userId: string;
  key: AchievementKey;
}

export interface GrantAchievementResponse {
  message: string;
}

// ==================== SERVICE ====================

export default class AchievementService {
  /**
   * Get the full achievement catalogue (all defined achievements)
   */
  static async findAll(): Promise<Achievement[]> {
    const response = await APIConfig.fetch("/achievements");
    return response.json();
  }

  /**
   * Get all achievements earned by a specific user
   * @param userId - The user's ID
   */
  static async findForUser(userId: string): Promise<UserAchievementsResponse> {
    const response = await APIConfig.fetch(`/achievements/user/${userId}`);
    return response.json();
  }

  /**
   * Admin only: manually grant an achievement to a user
   * @param payload - userId and achievement key
   */
  static async adminGrant(
    payload: GrantAchievementPayload
  ): Promise<GrantAchievementResponse> {
    const response = await APIConfig.fetch("/achievements/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }
}