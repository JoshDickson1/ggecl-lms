import { APIConfig } from "@/lib/api.config";

// ==================== ENUMS ====================

export enum CourseLevel {
  BEGINNER     = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED     = "ADVANCED",
}

export enum CourseStatus {
  DRAFT     = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED  = "ARCHIVED",
}

export enum CertificationType {
  NORMAL       = "NORMAL",
  PROFESSIONAL = "PROFESSIONAL",
  ADVANCED     = "ADVANCED",
}

export enum MaterialType {
  VIDEO    = "VIDEO",
  DOCUMENT = "DOCUMENT",
  AUDIO    = "AUDIO",
  LINK     = "LINK",
}

// ==================== TYPES ====================

// ─── COURSE ───────────────────────────────────────────────────────────────────

export interface CreateCoursePayload {
  title: string;
  description: string;
  videoUrl?: string;
  img?: string;
  price: number;
  level: CourseLevel;
  status?: CourseStatus;
  certification?: CertificationType;
  syllabus?: string[];
  includes?: string[];
  tags?: string[];
  badge?: string;
  instructorId?: string;
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export interface CourseQuery {
  search?: string;
  level?: CourseLevel;
  status?: CourseStatus;
  certification?: CertificationType;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  instructorId?: string;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt" | "price" | "totalRating" | "publishedAt" | "title";
  sortOrder?: "asc" | "desc";
}

/** Query params for the public (unauthenticated) courses endpoint */
export interface PublicCourseQuery {
  search?: string;
  level?: CourseLevel;
  certification?: CertificationType;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt" | "price" | "totalRating" | "publishedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedCourses<T> {
  items: T[];
  nextCursor: string | null;
}

// ─── COURSE RESPONSE TYPES ───────────────────────────────────────────────────

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  img: string;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  certification: CertificationType;
  badge?: string;
  tags: string[];
  averageRating: number;
  reviewCount: number;
  publishedAt: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    enrollments: number;
  };
  sections?: CourseSection[] | string;
  totalLectures?: number;
  totalDuration?: number;
  isEnrolled?: boolean;
  videoUrl?: string;
  syllabus?: string[];
  includes?: string[];
}

export interface CourseSection {
  id: string;
  title: string;
  position: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  description?: string;
  position: number;
  duration?: number;
  isPreview?: boolean;
  materials?: CourseMaterial[];
}

export interface CourseMaterial {
  id: string;
  type: MaterialType;
  title: string;
  url: string;
  publicId?: string;
  fileName?: string;
  size?: number;
}

// ─── CURRICULUM ───────────────────────────────────────────────────────────────

export interface CreateSectionPayload {
  title: string;
  position: number;
}

export type UpdateSectionPayload = Partial<CreateSectionPayload>;

export interface CreateLessonPayload {
  title: string;
  position: number;
  description?: string;
  duration?: number;
  isPreview?: boolean;
}

export type UpdateLessonPayload = Partial<CreateLessonPayload>;

export interface AddMaterialPayload {
  type: MaterialType;
  title: string;
  url: string;
  publicId?: string;
  fileName?: string;
  size?: number;
}

// ==================== SERVICE ====================

export default class CoursesService {

  // ─── PUBLIC (no auth required) ───────────────────────────────────────────────

  /**
   * Browse published courses — no auth required.
   * Used on the landing page, AllCourses page, and previews.
   * @param query - Optional filters and pagination
   */
  static async findAllPublic(query?: PublicCourseQuery): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/courses/public${this.toPublicQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Get a single published course landing page — no auth required.
   * @param id - Course ID
   */
  static async findOnePublic(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/courses/public/${id}`);
    return response.json();
  }

  // ─── COURSE CRUD ─────────────────────────────────────────────────────────────

  /**
   * Create a course.
   * ADMIN must supply instructorId. INSTRUCTOR has it derived from their session.
   */
  static async create(payload: CreateCoursePayload): Promise<unknown> {
    console.log('Creating course with payload:', payload);
    console.log('Instructor ID in payload:', payload.instructorId);
    
    try {
      const response = await APIConfig.fetch("/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Course creation successful:', result);
      return result;
    } catch (error) {
      console.error('Course creation failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Course creation endpoint not found. Please check if the API is correctly configured.');
        } else if (error.message.includes('403')) {
          throw new Error('You do not have permission to create courses. Admin access required.');
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to create courses.');
        } else if (error.message.includes('Instructor profile not found')) {
          throw new Error('The selected instructor does not have a complete profile. Please ask them to complete their instructor profile first.');
        }
      }
      
      throw error;
    }
  }

  /**
   * List / search courses with cursor-based pagination.
   * Visibility is role-scoped on the backend:
   * ADMIN sees all, INSTRUCTOR sees own, STUDENT sees PUBLISHED only.
   * @param query - Optional filters and pagination
   */
  static async findAll(query?: CourseQuery): Promise<PaginatedCourses<unknown>> {
    const response = await APIConfig.fetch(
      `/courses${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Get full course detail including sections → lessons → materials.
   * STUDENT must be enrolled.
   * @param id - Course ID
   */
  static async findOne(id: string): Promise<CourseResponse> {
    const response = await APIConfig.fetch(`/courses/${id}`);
    const data = await response.json();
    
    // Handle sections field that might come back as string from API
    if (typeof data.sections === 'string') {
      try {
        data.sections = JSON.parse(data.sections);
      } catch (error) {
        console.warn('Failed to parse sections field:', error);
        data.sections = [];
      }
    }
    
    return data;
  }

  /**
   * Update a course.
   * ADMIN can update any course. INSTRUCTOR can only update their own.
   * @param id - Course ID
   * @param payload - Fields to update
   */
  static async update(id: string, payload: UpdateCoursePayload): Promise<unknown> {
    const response = await APIConfig.fetch(`/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Delete a course.
   * ADMIN can delete any course. INSTRUCTOR can only delete their own DRAFT courses.
   * @param id - Course ID
   */
  static async remove(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/courses/${id}`, { method: "DELETE" });
    return response.json();
  }

  // ─── PUBLISH / ARCHIVE ───────────────────────────────────────────────────────

  /**
   * Publish a course (sets status to PUBLISHED).
   * @param id - Course ID
   */
  static async publish(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/courses/${id}/publish`, { method: "PATCH" });
    return response.json();
  }

  /**
   * Archive a course (sets status to ARCHIVED).
   * @param id - Course ID
   */
  static async archive(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/courses/${id}/archive`, { method: "PATCH" });
    return response.json();
  }

  // ─── SECTIONS ────────────────────────────────────────────────────────────────

  /**
   * Add a section to a course.
   */
  static async createSection(courseId: string, payload: CreateSectionPayload): Promise<unknown> {
    const response = await APIConfig.fetch(`/courses/${courseId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Update a section.
   */
  static async updateSection(courseId: string, sectionId: string, payload: UpdateSectionPayload): Promise<unknown> {
    const response = await APIConfig.fetch(`/courses/${courseId}/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Remove a section and all its lessons.
   */
  static async removeSection(courseId: string, sectionId: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/courses/${courseId}/sections/${sectionId}`, { method: "DELETE" });
    return response.json();
  }

  // ─── LESSONS ─────────────────────────────────────────────────────────────────

  /**
   * Add a lesson to a section.
   */
  static async createLesson(courseId: string, sectionId: string, payload: CreateLessonPayload): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/courses/${courseId}/sections/${sectionId}/lessons`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    return response.json();
  }

  /**
   * Update a lesson.
   */
  static async updateLesson(courseId: string, sectionId: string, lessonId: string, payload: UpdateLessonPayload): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    return response.json();
  }

  /**
   * Remove a lesson.
   */
  static async removeLesson(courseId: string, sectionId: string, lessonId: string): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      { method: "DELETE" }
    );
    return response.json();
  }

  // ─── MATERIALS ───────────────────────────────────────────────────────────────

  /**
   * Add a material to a lesson.
   */
  static async addMaterial(courseId: string, sectionId: string, lessonId: string, payload: AddMaterialPayload): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/materials`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    return response.json();
  }

  /**
   * Remove a material from a lesson.
   */
  static async removeMaterial(courseId: string, sectionId: string, lessonId: string, materialId: string): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/materials/${materialId}`,
      { method: "DELETE" }
    );
    return response.json();
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  /** Query string for the public endpoint (no status filter) */
  private static toPublicQueryString(query?: PublicCourseQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();

    if (query.search)        params.append("search",       query.search);
    if (query.level)         params.append("level",        query.level);
    if (query.certification) params.append("certification", query.certification);
    // if (query.instructorId)  params.append("instructorId",  (query as any).instructorId);
    if (query.cursor)        params.append("cursor",        query.cursor);
    if (query.sortBy)        params.append("sortBy",        query.sortBy);
    if (query.sortOrder)     params.append("sortOrder",     query.sortOrder);
    if (query.minPrice !== undefined) params.append("minPrice", String(query.minPrice));
    if (query.maxPrice !== undefined) params.append("maxPrice", String(query.maxPrice));
    if (query.limit !== undefined)    params.append("limit",    String(query.limit));
    if (query.tags?.length)
      query.tags.forEach(t => params.append("tags", t));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  /** Query string for the authenticated endpoint */
  private static toQueryString(query?: CourseQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();

    if (query.search)        params.append("search",       query.search);
    if (query.level)         params.append("level",        query.level);
    if (query.status)        params.append("status",       query.status);
    if (query.certification) params.append("certification", query.certification);
    if (query.instructorId)  params.append("instructorId",  query.instructorId);
    if (query.cursor)        params.append("cursor",        query.cursor);
    if (query.sortBy)        params.append("sortBy",        query.sortBy);
    if (query.sortOrder)     params.append("sortOrder",     query.sortOrder);
    if (query.minPrice !== undefined) params.append("minPrice", String(query.minPrice));
    if (query.maxPrice !== undefined) params.append("maxPrice", String(query.maxPrice));
    if (query.limit !== undefined)    params.append("limit",    String(query.limit));
    if (query.tags?.length)
      query.tags.forEach(t => params.append("tags", t));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}