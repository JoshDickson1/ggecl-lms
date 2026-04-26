// Course API Types based on OpenAPI specification
export interface CourseSectionDto {
  id: string;
  title: string;
  position: number;
  lessons: CourseLessonDto[];
}

export interface CourseLessonDto {
  id: string;
  title: string;
  position: number;
  duration?: number;
  isPreview?: boolean;
  description?: string;
}

export interface CourseMaterialDto {
  id: string;
  type: "VIDEO" | "PDF" | "AUDIO" | "LINK" | "QUIZ";
  title: string;
  url: string;
  publicId?: string;
  fileName?: string;
  size?: number;
}

export interface CreateCourseSectionDto {
  title: string;
  position: number;
}

export interface UpdateCourseSectionDto {
  title?: string;
  position?: number;
}

export interface CreateLessonDto {
  title: string;
  description?: string;
  position: number;
  duration?: number;
  isPreview?: boolean;
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  position?: number;
  duration?: number;
  isPreview?: boolean;
}

export interface AddCourseMaterialDto {
  type: "VIDEO" | "PDF" | "AUDIO" | "LINK" | "QUIZ";
  title: string;
  url: string;
  publicId?: string;
  fileName?: string;
  size?: number;
}

// Course detail types for different API responses
export interface PublicCourseDetailDto {
  id: string;
  title: string;
  description: string;
  img: string;
  price: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: "PUBLISHED";
  certification: "NORMAL" | "PROFESSIONAL" | "ADVANCED";
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
  videoUrl?: string;
  syllabus: string[];
  includes: string[];
  sections: CourseSectionDto[];
  totalLectures: number;
}

export interface CourseDetailDto extends PublicCourseDetailDto {
  sections: CourseSectionDto[]; // Always array per API spec
  totalDuration?: number;
  isEnrolled: boolean;
}

export interface CourseListItemDto {
  id: string;
  title: string;
  description: string;
  img: string;
  price: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  certification: "NORMAL" | "PROFESSIONAL" | "ADVANCED";
  badge?: string;
  tags: string[];
  averageRating: number;
  reviewCount: number;
  publishedAt?: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    enrollments: number;
  };
  sections: CourseSectionDto[];
  totalLectures: number;
}

export interface PaginatedCoursesDto {
  items: CourseListItemDto[];
  nextCursor?: string;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  videoUrl?: string;
  img?: string;
  price: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status?: "DRAFT" | "PUBLISHED";
  certification?: "NORMAL" | "PROFESSIONAL" | "ADVANCED";
  syllabus?: string[];
  includes?: string[];
  tags: string[];
  badge?: string;
  instructorId?: string;
}
