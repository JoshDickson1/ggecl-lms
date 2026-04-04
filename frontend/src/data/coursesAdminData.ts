// src/data/coursesAdminData.ts
// Extended course management data for admin + instructor dashboards.
// Replace with real API calls when backend is ready.

import type { LucideIcon } from "lucide-react";
import { Code2, Megaphone, Atom, Globe, BookOpen } from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type CourseStatus   = "published" | "draft" | "under_review" | "archived";
export type CourseLevel    = "Beginner" | "Intermediate" | "Advanced" | "All levels";
export type CourseBadge    = "Bestseller" | "Hot & New" | "New";
export type LessonType     = "video" | "reading" | "quiz" | "assignment";

export type Lesson = {
  id: string;
  title: string;
  type: LessonType;
  duration: string;    // "12:45"
  isFree: boolean;
  description?: string;
  videoUrl?: string;   // placeholder
};

export type Section = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type StudentProgress = {
  [x: string]: any;
  studentId: string;
  studentName: string;
  studentAvatar: string;   // initials
  studentAvatarBg: string; // tailwind bg class
  email: string;
  enrolledAt: string;      // ISO
  completedLessons: number;
  totalLessons: number;
  progressPct: number;     // 0-100
  lastActive: string;      // ISO
  certificateIssued: boolean;
  paymentRef: string;
};

export type ManagedCourse = {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  categoryId: string;
  categoryName: string;
  thumbnail: string;       // tailwind gradient
  icon: LucideIcon;
  price: number;
  originalPrice: number;
  level: CourseLevel;
  tags: string[];
  badge?: CourseBadge;
  status: CourseStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  certificate: boolean;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  instructorAvatarBg: string;
  // stats
  rating: number;
  reviews: number;
  students: number;
  revenue: number;         // total revenue USD
  // curriculum
  sections: Section[];
  // enrolled students
  enrolledStudents: StudentProgress[];
  // what you'll learn
  learningOutcomes: string[];
  // requirements
  requirements: string[];
};

// ─── DUMMY ENROLLED STUDENTS ──────────────────────────────────────────────────

const ENROLLED_DEV001: StudentProgress[] = [
  { studentId:"stu-001", studentName:"Zara Adeyemi",   studentAvatar:"ZA", studentAvatarBg:"bg-blue-500",   email:"zara@example.com",    enrolledAt:"2024-01-15T08:00:00Z", completedLessons:28, totalLessons:42, progressPct:67, lastActive:"2024-03-20T10:30:00Z", certificateIssued:false, paymentRef:"PAY-001" },
  { studentId:"stu-002", studentName:"Kofi Mensah",    studentAvatar:"KM", studentAvatarBg:"bg-emerald-500",email:"kofi@example.com",    enrolledAt:"2024-01-18T09:00:00Z", completedLessons:42, totalLessons:42, progressPct:100,lastActive:"2024-03-18T14:00:00Z", certificateIssued:true,  paymentRef:"PAY-002" },
  { studentId:"stu-003", studentName:"Priya Kumar",    studentAvatar:"PK", studentAvatarBg:"bg-pink-500",   email:"priya@example.com",   enrolledAt:"2024-02-01T07:00:00Z", completedLessons:12, totalLessons:42, progressPct:29, lastActive:"2024-03-22T09:15:00Z", certificateIssued:false, paymentRef:"PAY-003" },
  { studentId:"stu-004", studentName:"James Obi",      studentAvatar:"JO", studentAvatarBg:"bg-violet-500", email:"james@example.com",   enrolledAt:"2024-02-10T11:00:00Z", completedLessons:35, totalLessons:42, progressPct:83, lastActive:"2024-03-21T16:45:00Z", certificateIssued:false, paymentRef:"PAY-004" },
  { studentId:"stu-005", studentName:"Amara Diallo",   studentAvatar:"AD", studentAvatarBg:"bg-amber-500",  email:"amara@example.com",   enrolledAt:"2024-02-14T08:30:00Z", completedLessons:5,  totalLessons:42, progressPct:12, lastActive:"2024-03-10T11:00:00Z", certificateIssued:false, paymentRef:"PAY-005" },
  { studentId:"stu-006", studentName:"Chen Wei",       studentAvatar:"CW", studentAvatarBg:"bg-cyan-500",   email:"chen@example.com",    enrolledAt:"2024-02-20T10:00:00Z", completedLessons:42, totalLessons:42, progressPct:100,lastActive:"2024-03-19T12:00:00Z", certificateIssued:true,  paymentRef:"PAY-006" },
  { studentId:"stu-007", studentName:"Fatou Sow",      studentAvatar:"FS", studentAvatarBg:"bg-rose-500",   email:"fatou@example.com",   enrolledAt:"2024-03-01T09:00:00Z", completedLessons:8,  totalLessons:42, progressPct:19, lastActive:"2024-03-23T08:00:00Z", certificateIssued:false, paymentRef:"PAY-007" },
  { studentId:"stu-008", studentName:"Tobias Reiter",  studentAvatar:"TR", studentAvatarBg:"bg-teal-500",   email:"tobias@example.com",  enrolledAt:"2024-03-05T14:00:00Z", completedLessons:21, totalLessons:42, progressPct:50, lastActive:"2024-03-22T17:00:00Z", certificateIssued:false, paymentRef:"PAY-008" },
];

const ENROLLED_MKT001: StudentProgress[] = [
  { studentId:"stu-001", studentName:"Zara Adeyemi",   studentAvatar:"ZA", studentAvatarBg:"bg-blue-500",   email:"zara@example.com",    enrolledAt:"2024-01-20T08:00:00Z", completedLessons:18, totalLessons:28, progressPct:64, lastActive:"2024-03-20T10:00:00Z", certificateIssued:false, paymentRef:"PAY-009" },
  { studentId:"stu-009", studentName:"Yuki Tanaka",    studentAvatar:"YT", studentAvatarBg:"bg-purple-500", email:"yuki@example.com",    enrolledAt:"2024-02-01T10:00:00Z", completedLessons:28, totalLessons:28, progressPct:100,lastActive:"2024-03-15T09:00:00Z", certificateIssued:true,  paymentRef:"PAY-010" },
  { studentId:"stu-010", studentName:"Laila Hassan",   studentAvatar:"LH", studentAvatarBg:"bg-orange-500", email:"laila@example.com",   enrolledAt:"2024-02-15T11:00:00Z", completedLessons:10, totalLessons:28, progressPct:36, lastActive:"2024-03-21T14:00:00Z", certificateIssued:false, paymentRef:"PAY-011" },
];

// ─── DUMMY CURRICULUM ─────────────────────────────────────────────────────────

function makeSections(courseId: string): Section[] {
  return [
    {
      id: `${courseId}-s1`, title: "Getting Started",
      lessons: [
        { id:`${courseId}-s1-l1`, title:"Welcome & Course Overview",       type:"video",   duration:"5:22",  isFree:true  },
        { id:`${courseId}-s1-l2`, title:"Setting Up Your Environment",      type:"video",   duration:"12:10", isFree:true  },
        { id:`${courseId}-s1-l3`, title:"Core Concepts Introduction",       type:"reading", duration:"8:00",  isFree:false },
      ],
    },
    {
      id: `${courseId}-s2`, title: "Foundations",
      lessons: [
        { id:`${courseId}-s2-l1`, title:"Understanding the Basics",         type:"video",   duration:"22:30", isFree:false },
        { id:`${courseId}-s2-l2`, title:"Your First Project",               type:"video",   duration:"34:15", isFree:false },
        { id:`${courseId}-s2-l3`, title:"Common Patterns & Pitfalls",       type:"video",   duration:"28:00", isFree:false },
        { id:`${courseId}-s2-l4`, title:"Foundation Quiz",                  type:"quiz",    duration:"15:00", isFree:false },
      ],
    },
    {
      id: `${courseId}-s3`, title: "Intermediate Techniques",
      lessons: [
        { id:`${courseId}-s3-l1`, title:"Advanced Patterns",                type:"video",   duration:"41:20", isFree:false },
        { id:`${courseId}-s3-l2`, title:"Real-World Application",           type:"video",   duration:"55:00", isFree:false },
        { id:`${courseId}-s3-l3`, title:"Optimisation Strategies",          type:"video",   duration:"33:10", isFree:false },
        { id:`${courseId}-s3-l4`, title:"Practical Assignment",             type:"assignment",duration:"60:00",isFree:false },
      ],
    },
    {
      id: `${courseId}-s4`, title: "Building Real Projects",
      lessons: [
        { id:`${courseId}-s4-l1`, title:"Project Architecture",             type:"video",   duration:"48:30", isFree:false },
        { id:`${courseId}-s4-l2`, title:"Implementing Core Features",       type:"video",   duration:"62:15", isFree:false },
        { id:`${courseId}-s4-l3`, title:"Testing & Debugging",              type:"video",   duration:"37:45", isFree:false },
        { id:`${courseId}-s4-l4`, title:"Deployment & Beyond",              type:"video",   duration:"29:00", isFree:false },
      ],
    },
    {
      id: `${courseId}-s5`, title: "Mastery & Certification",
      lessons: [
        { id:`${courseId}-s5-l1`, title:"Expert Tips & Tricks",             type:"video",   duration:"44:00", isFree:false },
        { id:`${courseId}-s5-l2`, title:"Industry Best Practices",          type:"reading", duration:"20:00", isFree:false },
        { id:`${courseId}-s5-l3`, title:"Final Project Walkthrough",        type:"video",   duration:"58:10", isFree:false },
        { id:`${courseId}-s5-l4`, title:"Final Assessment",                 type:"quiz",    duration:"30:00", isFree:false },
        { id:`${courseId}-s5-l5`, title:"What's Next in Your Journey",      type:"video",   duration:"10:05", isFree:false },
      ],
    },
  ];
}

// ─── MANAGED COURSES ──────────────────────────────────────────────────────────

export const MANAGED_COURSES: ManagedCourse[] = [
  {
    id: "dev-001",
    title: "The Complete React & TypeScript Bootcamp 2024",
    description: "Master React 18, TypeScript, Hooks, Context API, and build real-world projects from scratch.",
    longDescription: "This is the most comprehensive React & TypeScript course available online. Starting from absolute zero, you'll progressively build production-grade applications while mastering every modern React pattern and TypeScript feature used in top-tier software companies.",
    categoryId: "development", categoryName: "Development",
    thumbnail: "from-blue-500 to-cyan-400",
    icon: Code2,
    price: 14.99, originalPrice: 89.99,
    level: "All levels",
    tags: ["React", "TypeScript", "Hooks", "Context API", "Testing"],
    badge: "Bestseller",
    status: "published",
    publishedAt: "2024-01-10T08:00:00Z",
    createdAt: "2023-12-01T08:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z",
    language: "English",
    certificate: true,
    instructorId: "inst-1",
    instructorName: "Sarah Mitchell",
    instructorAvatar: "SM",
    instructorAvatarBg: "bg-blue-500",
    rating: 4.9, reviews: 12400, students: 54200,
    revenue: 812358,
    sections: makeSections("dev-001"),
    enrolledStudents: ENROLLED_DEV001,
    learningOutcomes: [
      "Build production-ready React apps from scratch",
      "Master TypeScript with advanced type patterns",
      "Implement state management with Zustand & Context API",
      "Write comprehensive tests with Vitest & Playwright",
      "Deploy applications to Vercel and AWS",
      "Apply industry patterns used at FAANG companies",
      "Build real-world projects for your portfolio",
      "Pass React technical interviews with confidence",
    ],
    requirements: [
      "Basic HTML, CSS and JavaScript knowledge",
      "Familiarity with ES6+ syntax (arrow functions, destructuring, modules)",
      "A computer with Node.js installed (instructions provided)",
      "No prior React or TypeScript experience needed",
    ],
  },
  {
    id: "mkt-001",
    title: "Digital Marketing Masterclass: SEO, Ads & Social",
    description: "A complete guide to growing any business online — from Google Ads to viral content strategy.",
    longDescription: "Master the full digital marketing stack. Learn the exact strategies used by growth teams at the world's fastest-growing companies — from technical SEO to paid acquisition, content marketing to social media virality.",
    categoryId: "marketing", categoryName: "Marketing",
    thumbnail: "from-violet-500 to-purple-400",
    icon: Megaphone,
    price: 11.99, originalPrice: 84.99,
    level: "All levels",
    tags: ["SEO", "Google Ads", "Content Marketing", "Social Media", "Analytics"],
    badge: "Bestseller",
    status: "published",
    publishedAt: "2024-01-20T08:00:00Z",
    createdAt: "2023-12-15T08:00:00Z",
    updatedAt: "2024-03-10T10:00:00Z",
    language: "English",
    certificate: true,
    instructorId: "inst-3",
    instructorName: "Amara Nwosu",
    instructorAvatar: "AN",
    instructorAvatarBg: "bg-pink-500",
    rating: 4.8, reviews: 9200, students: 41600,
    revenue: 498816,
    sections: makeSections("mkt-001"),
    enrolledStudents: ENROLLED_MKT001,
    learningOutcomes: [
      "Rank on Google page 1 with technical SEO",
      "Run profitable Google Ads and Meta Ads campaigns",
      "Build a content strategy that drives organic growth",
      "Create viral social media content consistently",
      "Track and analyse marketing performance with GA4",
      "Build and grow an email list from scratch",
      "Develop full-funnel marketing strategies",
      "Present data-driven marketing reports to clients",
    ],
    requirements: [
      "No prior marketing experience required",
      "A business or side-project idea is helpful but not mandatory",
      "Access to a computer and internet connection",
    ],
  },
  {
    id: "phy-001",
    title: "Quantum Mechanics: From Zero to Uncertainty",
    description: "Understand wave functions, operators, and the Schrödinger equation with crystal-clear intuition.",
    longDescription: "Quantum mechanics is the most successful scientific theory ever formulated. This course builds your intuition from the ground up — no hand-waving, no magic. You'll derive every major result and understand why the quantum world works the way it does.",
    categoryId: "physics", categoryName: "Physics",
    thumbnail: "from-rose-500 to-orange-400",
    icon: Atom,
    price: 15.99, originalPrice: 99.99,
    level: "Advanced",
    tags: ["Quantum Mechanics", "Physics", "Mathematics", "Schrödinger"],
    badge: "Bestseller",
    status: "published",
    publishedAt: "2024-01-05T08:00:00Z",
    createdAt: "2023-11-10T08:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    language: "English",
    certificate: true,
    instructorId: "inst-4",
    instructorName: "David Chen",
    instructorAvatar: "DC",
    instructorAvatarBg: "bg-violet-500",
    rating: 4.9, reviews: 3800, students: 14200,
    revenue: 226958,
    sections: makeSections("phy-001"),
    enrolledStudents: ENROLLED_DEV001.slice(0,4),
    learningOutcomes: [
      "Derive the Schrödinger equation from first principles",
      "Understand wave functions and probability amplitudes",
      "Work with Hilbert spaces and Dirac notation",
      "Solve the harmonic oscillator and hydrogen atom exactly",
      "Apply perturbation theory to real physical systems",
      "Understand entanglement and Bell's theorem",
    ],
    requirements: [
      "Solid knowledge of calculus (multivariable) and linear algebra",
      "Classical mechanics at university level",
      "Complex numbers and differential equations",
    ],
  },
  {
    id: "lan-001",
    title: "Spanish from Zero to Conversational in 60 Days",
    description: "A proven immersive method — vocabulary, grammar, and real conversation practice daily.",
    longDescription: "Using spaced repetition, contextual immersion, and deliberate conversation practice, this course rewires your brain to think in Spanish. Designed for busy professionals who need results fast.",
    categoryId: "languages", categoryName: "Languages",
    thumbnail: "from-cyan-500 to-teal-400",
    icon: Globe,
    price: 9.99, originalPrice: 54.99,
    level: "Beginner",
    tags: ["Spanish", "Language Learning", "Conversation", "Grammar"],
    badge: "Bestseller",
    status: "published",
    publishedAt: "2024-02-01T08:00:00Z",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
    language: "English",
    certificate: true,
    instructorId: "inst-3",
    instructorName: "Amara Nwosu",
    instructorAvatar: "AN",
    instructorAvatarBg: "bg-pink-500",
    rating: 4.8, reviews: 14600, students: 62300,
    revenue: 622377,
    sections: makeSections("lan-001"),
    enrolledStudents: ENROLLED_MKT001,
    learningOutcomes: [
      "Hold real conversations in Spanish in 60 days",
      "Master the 1000 most-used Spanish words",
      "Understand native speakers at natural speed",
      "Read and write Spanish with confidence",
      "Navigate travel, work, and social situations",
      "Build a sustainable daily practice habit",
    ],
    requirements: [
      "Zero Spanish required — start from absolute scratch",
      "30 minutes per day commitment recommended",
    ],
  },
  {
    id: "dev-draft",
    title: "Advanced Node.js: Microservices & Kubernetes",
    description: "Design, build and deploy production microservices with Node.js, Docker and Kubernetes.",
    longDescription: "Go beyond basic Node.js. This course teaches you to architect systems that scale to millions of users, using battle-tested patterns from Netflix, Uber, and Airbnb.",
    categoryId: "development", categoryName: "Development",
    thumbnail: "from-green-500 to-emerald-400",
    icon: BookOpen,
    price: 18.99, originalPrice: 129.99,
    level: "Advanced",
    tags: ["Node.js", "Microservices", "Kubernetes", "Docker", "DevOps"],
    status: "draft",
    createdAt: "2024-03-01T08:00:00Z",
    updatedAt: "2024-03-25T10:00:00Z",
    language: "English",
    certificate: true,
    instructorId: "inst-2",
    instructorName: "James Okafor",
    instructorAvatar: "JO",
    instructorAvatarBg: "bg-emerald-500",
    rating: 0, reviews: 0, students: 0,
    revenue: 0,
    sections: makeSections("dev-draft"),
    enrolledStudents: [],
    learningOutcomes: [
      "Architect microservices from scratch",
      "Containerise apps with Docker",
      "Orchestrate with Kubernetes",
      "Implement service mesh with Istio",
      "Build CI/CD pipelines with GitHub Actions",
    ],
    requirements: [
      "Solid Node.js & Express knowledge",
      "Familiarity with REST APIs",
      "Basic understanding of Linux CLI",
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getManagedCourse(id: string): ManagedCourse | undefined {
  return MANAGED_COURSES.find(c => c.id === id);
}

export function getInstructorCourses(instructorId: string): ManagedCourse[] {
  return MANAGED_COURSES.filter(c => c.instructorId === instructorId);
}

export function totalLessons(course: ManagedCourse): number {
  return course.sections.reduce((s, sec) => s + sec.lessons.length, 0);
}

export function totalDuration(course: ManagedCourse): string {
  const mins = course.sections.reduce((s, sec) =>
    s + sec.lessons.reduce((ls, l) => {
      const [m, sec2] = l.duration.split(":").map(Number);
      return ls + m + (sec2 ?? 0) / 60;
    }, 0), 0);
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}

export const STATUS_META: Record<CourseStatus, { label: string; color: string; bg: string; border: string }> = {
  published:    { label: "Published",    color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/50" },
  draft:        { label: "Draft",        color: "text-gray-600 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-white/[0.05]",     border: "border-gray-200 dark:border-white/[0.08]"      },
  under_review: { label: "Under Review", color: "text-amber-700 dark:text-amber-300",     bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800/40"     },
  archived:     { label: "Archived",     color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-200 dark:border-red-800/40"         },
};

export const LESSON_TYPE_META: Record<LessonType, { icon: string; label: string; color: string }> = {
  video:      { icon: "▶️", label: "Video",      color: "text-blue-600 dark:text-blue-400"    },
  reading:    { icon: "📖", label: "Reading",    color: "text-indigo-600 dark:text-indigo-400" },
  quiz:       { icon: "✅", label: "Quiz",       color: "text-emerald-600 dark:text-emerald-400"},
  assignment: { icon: "📝", label: "Assignment", color: "text-amber-600 dark:text-amber-400"  },
};

export function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function fmtRevenue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n}`;
}