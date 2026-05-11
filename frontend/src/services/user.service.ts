import { APIConfig } from "@/lib/api.config";

// ==================== ENUMS ====================

export enum UserRole {
  ADMIN      = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR",
  STUDENT    = "STUDENT",
}

// ==================== TYPES ====================

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  /** Optional profile image URL */
  image?: string;
}

export interface InstructorProfilePayload {
  bio?: string;
  description?: string;
  tags?: string[];
  areasOfExpertise?: string[];
  teachingCategories?: string[];
  specialization?: string | null;
  website?: string | null;
  github?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  recognitions?: string[] | null;
}

interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  image?: string;
  role?: UserRole;
  bio?: string;
  phoneNumber?: string;
  location?: string;
  // Instructor fields at top level as per API spec
  instructorPhoneNumber?: string;
  professionalTitle?: string;
  professionalExperience?: string;
  specialization?: string;
  description?: string;
  tags?: string[];
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  areasOfExpertise?: string[];
  teachingCategories?: string[];
  instructorProfile?: InstructorProfilePayload;
}

/** Payload for PATCH /users/mine — updates the authenticated user's own profile */
export interface UpdateMinePayload {
  // User-level fields
  name?: string;
  gender?: string;
  status?: string;
  location?: string;
  image?: string;
  // Student profile fields
  phoneNumber?: string;
  matricNumber?: string;
  learningGoals?: string[];
  bio?: string;
  // Instructor profile fields
  department?: string;
  professionalTitle?: string;
  description?: string;
  tags?: string[];
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  areasOfExpertise?: string[];
  professionalExperience?: string;
  teachingCategories?: string[];
  specialization?: string;
}

export interface UserQuery {
  search?: string;
  role?: UserRole;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}

export interface StudentListQuery {
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
}

export interface InstructorListQuery {
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
}

export interface PublicUserListQuery {
  role?: UserRole;
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
}

export interface PublicUserListItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  gender: string | null;
  location: string | null;
  createdAt: string;
  instructorProfile?: {
    id: string;
    userId: string;
    courses?: { _count?: { enrollments: number } }[];
    [key: string]: unknown;
  } | null;
  studentProfile?: {
    id: string;
    userId: string;
    enrollments?: unknown[];
    [key: string]: unknown;
  } | null;
}

export interface PublicUserListResponse {
  data: PublicUserListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PublicInstructorUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  gender: string | null;
  location: string | null;
  createdAt: string;
}

export interface InstructorAssignment {
  id: string;
  title: string;
  maxScore: number;
  dueDate: string;
  allowLate: boolean;
  isPublished: boolean;
  createdAt: string;
  course: { id: string; title: string; img: string | null };
  _count: { submissions: number };
}

export interface InstructorReviewReply {
  id: string;
  comment: string;
  isEdited: boolean;
  createdAt: string;
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    course: { id: string; title: string; img: string | null };
    student: { id: string; user: { id: string; name: string; image: string | null } };
  };
}

export interface InstructorLiveSession {
  id: string;
  title: string;
  roomName: string;
  scheduledAt: string;
  endsAt: string;
  status: string;
  course: { id: string; title: string; img: string | null };
}

export interface PublicInstructorProfile {
  id: string;
  userId: string;
  department: string | null;
  bio: string | null;
  specialization: string | null;
  description: string | null;
  phoneNumber: string | null;
  professionalTitle: string | null;
  tags: string[];
  website: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  youtube: string | null;
  areasOfExpertise: string[];
  professionalExperience: string | null;
  teachingCategories: string[];
  courses?: Array<{
    id: string;
    title: string;
    img: string | null;
    price: number;
    level: string;
    status: string;
    certification: string;
    publishedAt: string | null;
    totalDuration: number;
    _count: {
      enrollments: number;
    };
    createdAt: string;
  }>;
  assignments?: InstructorAssignment[];
  reviewReplies?: InstructorReviewReply[];
  liveSessions?: InstructorLiveSession[];
  user: PublicInstructorUser;
}

export interface PublicInstructorListResponse {
  data: PublicInstructorProfile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface FullInstructorUser extends PublicInstructorUser {
  emailVerified: boolean;
  status: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  updatedAt: string;
  studentProfile: {
    id: string;
    userId: string;
    matricNumber: string | null;
    enrollmentDate: string | null;
    bio: string | null;
    phoneNumber: string | null;
    learningGoals: string[];
  } | null;
  instructorProfile: PublicInstructorProfile | null;
}

export interface FullInstructorProfile extends Omit<PublicInstructorProfile, "user"> {
  user: FullInstructorUser;
}

// ─── STUDENT PROFILE TYPES ───────────────────────────────────────────────────

export interface PublicStudentCourse {
  id: string;
  title: string;
  img: string | null;
  price: number;
  level: string;
  status: string;
  instructorId: string;
}

export interface PublicStudentEnrollment {
  id: string;
  enrolledAt: string;
  course: PublicStudentCourse;
}

export interface PublicStudentUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  gender: string | null;
  location: string | null;
  createdAt: string;
}

/** Shape returned by GET /api/users/students/public and GET /api/users/students/public/:studentId */
export interface PublicStudentProfile {
  id: string;
  userId: string;
  matricNumber: string | null;
  enrollmentDate: string | null;
  bio: string | null;
  learningGoals: string[];
  enrollments: PublicStudentEnrollment[];
  courseProgress: Array<{
    id: string;
    courseId: string;
    completedLessons: number;
    totalLessons: number;
    percentComplete: number;
    totalTimeSpent: number;
    isCompleted: boolean;
    completedAt: string | null;
    lastActivityAt: string | null;
    course: {
      id: string;
      title: string;
      img: string | null;
      level: string;
      status: string;
      totalDuration: number;
    };
  }>;
  submissions: Array<{
    id: string;
    isLate: boolean;
    submittedAt: string;
    assignment: {
      id: string;
      title: string;
      maxScore: number;
      dueDate: string;
      course: { id: string; title: string };
    };
    grade: {
      id: string;
      score: number;
      resolvedGrade: number;
      feedback: string | null;
      gradedAt: string;
    } | null;
  }>;
  certificates: Array<{
    id: string;
    fileUrl: string;
    issuedAt: string;
    course: {
      id: string;
      title: string;
      img: string | null;
      certification: string;
    };
  }>;
  quizAttempts: Array<{
    id: string;
    score: number;
    totalQuestions: number;
    resolvedGrade: number;
    passed: boolean;
    submittedAt: string;
    quiz: {
      id: string;
      title: string;
      passMark: number;
      section: {
        id: string;
        title: string;
        course: { id: string; title: string };
      };
    };
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    isEdited: boolean;
    createdAt: string;
    course: { id: string; title: string; img: string | null };
  }>;
  learningStreak: {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    lastActiveDate: string | null;
  } | null;
  xp: {
    totalXp: number;
    currentLevel: number;
    xpToNextLevel: number;
  } | null;
  user: PublicStudentUser;
}

export interface PublicStudentListResponse {
  data: PublicStudentProfile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** Full user shape nested inside the authenticated student profile response */
export interface FullStudentUser extends PublicStudentUser {
  emailVerified: boolean;
  status: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  updatedAt: string;
  studentProfile: {
    id: string;
    userId: string;
    matricNumber: string | null;
    enrollmentDate: string | null;
    bio: string | null;
    phoneNumber: string | null;
    learningGoals: string[];
    enrollments: PublicStudentEnrollment[];
  } | null;
  instructorProfile: PublicInstructorProfile | null;
}

/** Shape returned by GET /api/users/students/:studentId (authenticated) */
export interface FullStudentProfile extends Omit<PublicStudentProfile, "user"> {
  phoneNumber: string | null;
  user: FullStudentUser;
}

// ==================== SERVICE ====================

export default class UserService {
  // ─── PUBLIC (no auth required) ───────────────────────────────────────────────

  /**
   * List users publicly (e.g. instructors on the landing page).
   * No authentication required.
   * @param query - Optional filters and pagination
   */
  static async findAllPublic(query?: UserQuery): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/users/public${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Get a single user's public profile.
   * No authentication required.
   * @param id - User ID
   */
  static async findOnePublic(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/users/public/${id}`);
    return response.json();
  }

  /**
   * List users publicly with role filter — returns gender, profile counts, etc.
   * No authentication required. Use this instead of findAll when you need
   * enrollments (students) or course counts (instructors).
   * @param query - Optional role filter, pagination, and sort
   */
  static async findAllPublicUsers(
    query?: PublicUserListQuery
  ): Promise<PublicUserListResponse> {
    const params = new URLSearchParams();
    if (query?.role)              params.append("role",  query.role);
    if (query?.page !== undefined) params.append("page",  String(query.page));
    if (query?.limit !== undefined) params.append("limit", String(query.limit));
    if (query?.order)             params.append("order", query.order);
    const qs = params.toString();
    const response = await APIConfig.fetch(`/users/public${qs ? `?${qs}` : ""}`);
    return response.json();
  }

  // ─── INSTRUCTOR PUBLIC ────────────────────────────────────────────────────────

  /**
   * List all active instructor profiles publicly (no auth required).
   * Keyed by instructorProfile.id, not userId.
   * @param query - Optional pagination and sort options
   */
  static async findAllInstructorsPublic(
    query?: InstructorListQuery
  ): Promise<PublicInstructorListResponse> {
    const params = new URLSearchParams();
    if (query?.page !== undefined)  params.append("page",  String(query.page));
    if (query?.limit !== undefined) params.append("limit", String(query.limit));
    if (query?.order)               params.append("order", query.order);
    const qs = params.toString();
    const response = await APIConfig.fetch(
      `/users/instructors/public${qs ? `?${qs}` : ""}`
    );
    return response.json();
  }

  /**
   * Get a single instructor's public profile by instructorProfile.id (no auth required).
   * Only returns ACTIVE instructors.
   * @param instructorId - InstructorProfile ID (not userId)
   */
  static async findOneInstructorPublic(
    instructorId: string
  ): Promise<PublicInstructorProfile> {
    const response = await APIConfig.fetch(
      `/users/instructors/public/${instructorId}`
    );
    return response.json();
  }

  // ─── INSTRUCTOR AUTHENTICATED ─────────────────────────────────────────────────

  /**
   * Get a full instructor profile by instructorProfile.id (auth required).
   * ADMIN: any profile. INSTRUCTOR: own profile only. STUDENT: any active profile.
   * @param instructorId - InstructorProfile ID (not userId)
   */
  static async findOneInstructor(
    instructorId: string
  ): Promise<FullInstructorProfile> {
    const response = await APIConfig.fetch(
      `/users/instructors/${instructorId}`
    );
    return response.json();
  }

  // ─── STUDENT PUBLIC ───────────────────────────────────────────────────────────

  /**
   * List all active student profiles publicly (no auth required).
   * Keyed by studentProfile.id, not userId.
   * @param query - Optional pagination and sort options
   */
  static async findAllStudentsPublic(
    query?: StudentListQuery
  ): Promise<PublicStudentListResponse> {
    const params = new URLSearchParams();
    if (query?.page !== undefined)  params.append("page",  String(query.page));
    if (query?.limit !== undefined) params.append("limit", String(query.limit));
    if (query?.order)               params.append("order", query.order);
    const qs = params.toString();
    const response = await APIConfig.fetch(
      `/users/students/public${qs ? `?${qs}` : ""}`
    );
    return response.json();
  }

  /**
   * Get a single student's public profile by studentProfile.id (no auth required).
   * Only returns ACTIVE students.
   * @param studentId - StudentProfile ID (not userId)
   */
  static async findOneStudentPublic(
    studentId: string
  ): Promise<PublicStudentProfile> {
    const response = await APIConfig.fetch(
      `/users/students/public/${studentId}`
    );
    return response.json();
  }

  // ─── STUDENT AUTHENTICATED ────────────────────────────────────────────────────

  /**
   * Get a full student profile by studentProfile.id (auth required).
   * ADMIN: any profile. STUDENT: own profile only. INSTRUCTOR: any active profile.
   * @param studentId - StudentProfile ID (not userId)
   */
  static async findOneStudent(
    studentId: string
  ): Promise<FullStudentProfile> {
    const response = await APIConfig.fetch(
      `/users/students/${studentId}`
    );
    return response.json();
  }

  // ─── AUTHENTICATED (SELF) ─────────────────────────────────────────────────────

  /**
   * Get the currently authenticated user's own full profile.
   * Returns user + studentProfile + instructorProfile.
   * Works for all roles.
   */
  static async getMe(): Promise<unknown> {
    const response = await APIConfig.fetch("/users/mine");
    return response.json();
  }

  /**
   * Get the currently authenticated user's own full profile.
   * Alias for getMe() — use this for the /users/mine endpoint.
   */
  static async getMine(): Promise<unknown> {
    const response = await APIConfig.fetch("/users/mine");
    return response.json();
  }

  /**
   * Update the currently authenticated user's own profile.
   * Accepts both user-level and profile-level fields.
   * Student fields: name, gender, location, phoneNumber, matricNumber, learningGoals, bio
   * Instructor fields: department, professionalTitle, description, tags, website, github,
   *   twitter, linkedin, youtube, areasOfExpertise, professionalExperience, teachingCategories, specialization
   */
  static async updateMine(payload: UpdateMinePayload): Promise<unknown> {
    const response = await APIConfig.fetch("/users/mine", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Permanently delete the currently authenticated user's own account.
   * Cleans up BetterAuth sessions and accounts before removing the record.
   */
  static async deleteMine(): Promise<unknown> {
    const response = await APIConfig.fetch("/users/mine", {
      method: "DELETE",
    });
    return response.json();
  }

  /**
   * List users with full detail (ADMIN only).
   * ADMIN can fetch any user. Non-admins can only fetch their own.
   * NOTE: This endpoint excludes ADMIN accounts from results.
   * @param query - Optional filters and pagination
   */
  static async findAll(query?: UserQuery): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/users${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * List admin users specifically (ADMIN only).
   * Use this endpoint to get admin accounts since /users excludes them.
   * @param query - Optional filters and pagination
   */
  static async findAdmins(query?: UserQuery): Promise<unknown> {
    // Build search query specifically for admin role
    const params = new URLSearchParams();
    params.append("role", "ADMIN");
    
    if (query?.limit) params.append("limit", String(query.limit));
    if (query?.sortOrder) params.append("order", query.sortOrder);
    
    const queryString = params.toString();
    const response = await APIConfig.fetch(`/users/search?${queryString}`);
    return response.json();
  }

  /**
   * Get a single user by ID with full detail.
   * ADMIN can fetch any user. Users can fetch their own profile.
   * @param id - User ID
   */
  static async findOne(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/users/${id}`);
    return response.json();
  }

  /**
   * Create a new user.
   * Typically used by ADMIN to manually create accounts.
   * @param payload - User data
   */
  static async create(payload: CreateUserPayload): Promise<unknown> {
    const response = await APIConfig.fetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Update a user by ID.
   * ADMIN can update any user. Users can only update themselves.
   * @param id - User ID
   * @param payload - Fields to update
   */
  static async update(id: string, payload: UpdateUserPayload): Promise<unknown> {
    const response = await APIConfig.fetch(`/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Delete a user by ID.
   * ADMIN can delete any user. Users can delete their own account.
   * @param id - User ID
   */
  static async remove(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/users/${id}`, {
      method: "DELETE",
    });
    return response.json();
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private static toQueryString(query?: UserQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();

    if (query.search)                 params.append("search",    query.search);
    if (query.role)                   params.append("role",      query.role);
    if (query.cursor)                 params.append("cursor",    query.cursor);
    if (query.sortBy)                 params.append("sortBy",    query.sortBy);
    if (query.sortOrder)              params.append("sortOrder", query.sortOrder);
    if (query.limit !== undefined)    params.append("limit",     String(query.limit));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}