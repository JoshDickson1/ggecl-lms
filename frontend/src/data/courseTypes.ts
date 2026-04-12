// ─── courseTypes.ts ────────────────────────────────────────────────────────────
// Central data model. All pages import from here.
// API layer will replace mock data without touching page components.

// ─── Enums & primitives ────────────────────────────────────────────────────────

export type FileType = "video" | "doc" | "image" | "apk" | "other";
export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

// ─── Core models ──────────────────────────────────────────────────────────────

export interface VideoChapter {
  id: string;
  title: string;
  timestamp: string;       // display string  e.g. "1:24:05"
  timestampSeconds: number; // for seek / progress comparison
}

export interface CourseFile {
  id: string;
  name: string;
  type: FileType;
  size: string;           // human-readable  "4.2 MB"
  url: string;
  uploadedAt: string;     // ISO date string
  duration?: string;      // videos only  "18:42"
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface InlineQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  isPublished: boolean;
  passMark: number; // 0–100 percent
}

export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  videos: CourseFile[];
  files: CourseFile[];
  quizzes: InlineQuiz[];
}

// The main video object attached to a course
export interface CourseMainVideo {
  id: string;
  name: string;
  url: string;           // signed URL in production
  size: string;
  durationLabel: string; // "14:22:08"
  durationSeconds: number;
  uploadedAt: string;
  chapters: VideoChapter[];
}

// Full course record — created by admin, enriched by instructor
export interface Course {
  id: string;
  name: string;
  code: string;
  subject: string;
  color: string;          // Tailwind gradient classes
  icon: string;           // emoji
  level: DifficultyLevel;
  description: string;    // set by admin; instructor can append
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  totalStudents: number;
  isPublished: boolean;

  // Instructor fills these in:
  mainVideo?: CourseMainVideo;
  sections: Section[];
}

// ─── Student-side models ──────────────────────────────────────────────────────

export interface StudentNote {
  id: string;
  timestampSeconds: number;
  timestampLabel: string;
  text: string;
  createdAt: string;
}

export interface StudentProgress {
  courseId: string;
  mainVideoProgressSeconds: number; // last known playhead
  watchedChapterIds: string[];
  completedSectionIds: string[];
  quizScores: Record<string, number>; // quizId → score %
  notes: StudentNote[];
  lastAccessedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "mov", "webm", "avi", "mkv"].includes(ext)) return "video";
  if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt"].includes(ext)) return "doc";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) return "image";
  if (["apk", "zip", "rar", "tar", "gz", "7z"].includes(ext)) return "apk";
  return "other";
}

export function secondsToLabel(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function labelToSeconds(label: string): number {
  const parts = label.trim().split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

/**
 * Parse raw text into VideoChapter[]
 * Supports three formats:
 *   Plain:    "0:00 Introduction"  or  "0:00 - Introduction"
 *   CSV:      "0:00,Introduction"
 *   YouTube:  "0:00 Introduction\n0:18:42 Chapter 2" (same as Plain)
 */
export function parseChaptersFromText(raw: string): VideoChapter[] {
  const lines = raw
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  return lines
    .map((line, i) => {
      // Match timestamp at start: optional leading dot/dash noise
      const match = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—,]?\s*(.+)$/);
      if (!match) return null;
      const [, ts, title] = match;
      return {
        id: `ch-import-${i}-${Date.now()}`,
        timestamp: ts,
        timestampSeconds: labelToSeconds(ts),
        title: title.trim(),
      } satisfies VideoChapter;
    })
    .filter((c): c is VideoChapter => c !== null);
}

// ─── Mock data ────────────────────────────────────────────────────────────────

// Courses that the admin has created and assigned to this instructor.
// The instructor cannot edit name/code/icon/level — only upload content.
export const ASSIGNED_COURSES: Course[] = [
  {
    id: "crs-001",
    name: "Advanced React Patterns",
    code: "WEB-401",
    subject: "Web Development",
    color: "from-blue-500 to-blue-700",
    icon: "⚛️",
    level: "Advanced",
    description:
      "A comprehensive deep-dive into professional React architecture — compound components, render props, custom hooks, and performance patterns used at scale.",
    instructor: { id: "inst-1", name: "Dr. Amara Osei" },
    totalStudents: 124,
    isPublished: false,
    sections: [],
  },
  {
    id: "crs-002",
    name: "Python Data Science",
    code: "DS-301",
    subject: "Data Science",
    color: "from-emerald-500 to-teal-600",
    icon: "🐍",
    level: "Intermediate",
    description:
      "End-to-end data science workflow with Python: data wrangling, visualization, statistical analysis, and machine learning fundamentals.",
    instructor: { id: "inst-1", name: "Dr. Amara Osei" },
    totalStudents: 87,
    isPublished: false,
    sections: [],
  },
  {
    id: "crs-003",
    name: "UI/UX Foundations",
    code: "DES-201",
    subject: "Design",
    color: "from-violet-500 to-purple-700",
    icon: "🎨",
    level: "Beginner",
    description:
      "Core principles of user interface and experience design. From research and wireframing to high-fidelity prototyping.",
    instructor: { id: "inst-1", name: "Dr. Amara Osei" },
    totalStudents: 210,
    isPublished: false,
    sections: [],
  },
];

// The "active" course used in both instructor Material pages & student view.
// In prod this comes from the route param.
export const MOCK_ACTIVE_COURSE: Course = {
  id: "crs-001",
  name: "Advanced React Patterns",
  code: "WEB-401",
  subject: "Web Development",
  color: "from-blue-500 to-blue-700",
  icon: "⚛️",
  level: "Advanced",
  description:
    "A comprehensive deep-dive into professional React architecture — compound components, render props, custom hooks, and performance patterns used at scale.",
  instructor: { id: "inst-1", name: "Dr. Amara Osei" },
  totalStudents: 124,
  isPublished: true,
  mainVideo: {
    id: "mv-001",
    name: "Advanced React Patterns — Full Course.mp4",
    url: "#",
    size: "2.4 GB",
    durationLabel: "14:22:08",
    durationSeconds: 51728,
    uploadedAt: "2024-03-10",
    chapters: [
      { id: "ch-1", title: "Introduction & Course Overview",      timestamp: "0:00",    timestampSeconds: 0 },
      { id: "ch-2", title: "Compound Component Pattern",          timestamp: "18:42",   timestampSeconds: 1122 },
      { id: "ch-3", title: "Render Props Deep Dive",              timestamp: "45:10",   timestampSeconds: 2710 },
      { id: "ch-4", title: "Custom Hooks Architecture",           timestamp: "1:12:30", timestampSeconds: 4350 },
      { id: "ch-5", title: "Context API at Scale",                timestamp: "1:48:05", timestampSeconds: 6485 },
      { id: "ch-6", title: "Zustand State Management",            timestamp: "2:20:44", timestampSeconds: 8444 },
      { id: "ch-7", title: "Performance Optimization",            timestamp: "3:05:18", timestampSeconds: 11118 },
      { id: "ch-8", title: "Testing Patterns",                    timestamp: "3:52:00", timestampSeconds: 13920 },
      { id: "ch-9", title: "Real-world Project Build",            timestamp: "4:30:00", timestampSeconds: 16200 },
    ],
  },
  sections: [
    {
      id: "sec-001",
      title: "Module 1: Foundations & Setup",
      description: "Core concepts and environment configuration",
      order: 1,
      isPublished: true,
      videos: [
        { id: "v-001", name: "Intro to Advanced Patterns.mp4", type: "video", size: "248 MB", url: "#", uploadedAt: "2024-03-10", duration: "18:42" },
        { id: "v-002", name: "Dev Environment Setup.mp4",       type: "video", size: "182 MB", url: "#", uploadedAt: "2024-03-10", duration: "12:15" },
      ],
      files: [
        { id: "f-001", name: "Module 1 Slides.pdf",       type: "doc",   size: "4.2 MB", url: "#", uploadedAt: "2024-03-10" },
        { id: "f-002", name: "Starter Code.zip",          type: "apk",   size: "1.8 MB", url: "#", uploadedAt: "2024-03-10" },
        { id: "f-003", name: "Architecture Diagram.png",  type: "image", size: "540 KB", url: "#", uploadedAt: "2024-03-10" },
      ],
      quizzes: [
        {
          id: "q-001",
          title: "Module 1 Knowledge Check",
          passMark: 70,
          isPublished: true,
          questions: [
            {
              id: "qq-001",
              question: "Which hook is best suited for memoizing expensive computations?",
              options: [
                { id: "o-1", text: "useState" },
                { id: "o-2", text: "useMemo" },
                { id: "o-3", text: "useCallback" },
                { id: "o-4", text: "useRef" },
              ],
              correctOptionId: "o-2",
              explanation: "useMemo caches the result of a computation between re-renders, making it ideal for expensive calculations.",
            },
            {
              id: "qq-002",
              question: "What does the Context API primarily solve?",
              options: [
                { id: "o-1", text: "Async data fetching" },
                { id: "o-2", text: "Performance optimization" },
                { id: "o-3", text: "Prop drilling" },
                { id: "o-4", text: "Global state mutation" },
              ],
              correctOptionId: "o-3",
              explanation: "Context avoids the need to pass props through many intermediate components.",
            },
          ],
        },
      ],
    },
    {
      id: "sec-002",
      title: "Module 2: Compound Components",
      description: "Building flexible, composable UI components",
      order: 2,
      isPublished: true,
      videos: [
        { id: "v-003", name: "Compound Component Pattern.mp4", type: "video", size: "310 MB", url: "#", uploadedAt: "2024-03-15", duration: "24:08" },
      ],
      files: [
        { id: "f-004", name: "Compound Components Cheatsheet.pdf", type: "doc", size: "2.1 MB", url: "#", uploadedAt: "2024-03-15" },
      ],
      quizzes: [],
    },
    {
      id: "sec-003",
      title: "Module 3: State Management",
      description: "Zustand, Jotai, and custom solutions",
      order: 3,
      isPublished: false,
      videos: [],
      files: [
        { id: "f-005", name: "State Management Comparison.xlsx", type: "doc", size: "890 KB", url: "#", uploadedAt: "2024-03-18" },
      ],
      quizzes: [],
    },
  ],
};

export const MOCK_STUDENT_PROGRESS: StudentProgress = {
  courseId: "crs-001",
  mainVideoProgressSeconds: 2710, // paused at Render Props Deep Dive
  watchedChapterIds: ["ch-1", "ch-2", "ch-3"],
  completedSectionIds: ["sec-001"],
  quizScores: { "q-001": 85 },
  notes: [
    { id: "n-1", timestampSeconds: 1122, timestampLabel: "18:42", text: "Compound pattern shines for things like <Select> / <Select.Option>", createdAt: "2024-03-11" },
    { id: "n-2", timestampSeconds: 2710, timestampLabel: "45:10", text: "Render props have mostly been replaced by hooks but still useful for cross-cutting concerns", createdAt: "2024-03-12" },
  ],
  lastAccessedAt: "2024-04-01",
};