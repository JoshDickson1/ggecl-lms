// src/data/Student.ts
// Shared Student type + seed data used by PreviewStudent, search pages, and management tables.

export type StudentStatus = "Active" | "Inactive" | "Suspended";
export type StudentBadge = "Top Learner" | "Certificate Holder" | "Early Adopter" | "Consistent" | "Rising Star";

export type StudentEnrolledCourse = {
  id: string;
  title: string;
  thumbnail: string;   // tailwind gradient classes
  progress: number;    // 0–100
  instructor: string;
  grade?: string;      // letter grade if graded
  completedAt?: string;
};

export type StudentGrade = {
  courseName: string;
  letterGrade: string;
  percentage: number;
  gradedAt: string;
};

export type StudentAssignment = {
  id: string;
  title: string;
  courseName: string;
  status: "pending" | "submitted" | "graded" | "late" | "missing";
  dueDate: string;
  score?: number;
  maxScore: number;
};

export type StudentActivity = {
  action: string;
  target: string;
  time: string;
  type: "lesson" | "quiz" | "assignment" | "review" | "certificate" | "enroll" | "message";
};

export type Student = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string;        // initials
  avatarBg: string;      // tailwind bg class
  title: string;
  bio: string;
  location: string;
  email: string;
  joined: string;        // e.g. "September 2023"
  website?: string;
  gender: "Male" | "Female" | "Other";
  status: StudentStatus;
  badges: StudentBadge[];
  // stats
  enrolled: number;
  completed: number;
  certificates: number;
  totalSpent: number;
  streak: number;        // day streak
  avgRatingGiven: number;
  reviewsGiven: number;
  // detail data
  enrolledCourses: StudentEnrolledCourse[];
  grades: StudentGrade[];
  assignments: StudentAssignment[];
  recentActivity: StudentActivity[];
  learningGoals: { label: string; done: boolean }[];
};

// ─── Seed data ────────────────────────────────────────────────────────────────

export const students: Student[] = [
  {
    id: "stu-001",
    name: "Emeka Okonkwo",
    firstName: "Emeka",
    lastName: "Okonkwo",
    avatar: "EO",
    avatarBg: "bg-blue-500",
    title: "Software Engineering Student",
    bio: "Passionate about web development and machine learning. Transitioning from accounting into tech. Love building side projects and contributing to open source.",
    location: "Lagos, Nigeria",
    email: "emeka@ggecl.io",
    joined: "September 2023",
    website: "emekaokonkwo.dev",
    gender: "Male",
    status: "Active",
    badges: ["Top Learner", "Certificate Holder"],
    enrolled: 6, completed: 2, certificates: 2, totalSpent: 142.80, streak: 14,
    avgRatingGiven: 4.8, reviewsGiven: 12,
    enrolledCourses: [
      { id: "dev-001", title: "React & TypeScript Bootcamp 2024",       thumbnail: "from-blue-500 to-indigo-600",  progress: 78,  instructor: "Sarah Mitchell", grade: undefined },
      { id: "ds-001",  title: "Python for Data Science & ML",           thumbnail: "from-amber-500 to-orange-500", progress: 62,  instructor: "Kwame Asante" },
      { id: "dev-002", title: "Node.js, Express & MongoDB",             thumbnail: "from-emerald-500 to-teal-600", progress: 45,  instructor: "James Okafor" },
      { id: "mkt-001", title: "Digital Marketing Masterclass",          thumbnail: "from-violet-500 to-purple-600",progress: 100, instructor: "Amara Nwosu",  grade: "A", completedAt: "2024-02-14" },
      { id: "biz-001", title: "Entrepreneurship & Startup Playbook",    thumbnail: "from-sky-500 to-blue-500",     progress: 20,  instructor: "Priya Sharma" },
      { id: "design-001", title: "UI/UX Design Fundamentals with Figma",thumbnail: "from-rose-500 to-pink-600",   progress: 100, instructor: "Tolu Adeyemi", grade: "A-", completedAt: "2024-01-28" },
    ],
    grades: [
      { courseName: "Digital Marketing Masterclass",  letterGrade: "A",  percentage: 91, gradedAt: "2024-02-14" },
      { courseName: "UI/UX Design Fundamentals",      letterGrade: "A-", percentage: 88, gradedAt: "2024-01-28" },
    ],
    assignments: [
      { id: "asg-001", title: "Build a Todo App with React & TypeScript",    courseName: "React & TypeScript Bootcamp", status: "graded",  dueDate: "2024-03-20", score: 91, maxScore: 100 },
      { id: "asg-002", title: "API Integration — Weather Dashboard",          courseName: "React & TypeScript Bootcamp", status: "submitted",dueDate: "2024-04-05", maxScore: 100 },
      { id: "asg-003", title: "Content Marketing Strategy Report",            courseName: "Digital Marketing Masterclass",status: "graded",  dueDate: "2024-03-28", score: 88, maxScore: 100 },
      { id: "asg-004", title: "Recorded Pitch Presentation",                  courseName: "Digital Marketing Masterclass",status: "missing", dueDate: "2024-04-10", maxScore: 100 },
    ],
    recentActivity: [
      { action: "Completed module 8", target: "React Bootcamp",      time: "2h ago",   type: "lesson" },
      { action: "Scored 92% on quiz", target: "TypeScript Quiz 3",   time: "1d ago",   type: "quiz" },
      { action: "Submitted assignment", target: "Weather Dashboard", time: "2d ago",   type: "assignment" },
      { action: "Left 5-star review", target: "Sarah Mitchell",      time: "3d ago",   type: "review" },
      { action: "Earned certificate", target: "UI/UX Design",        time: "1 week ago", type: "certificate" },
    ],
    learningGoals: [
      { label: "Complete React & TypeScript Bootcamp", done: false },
      { label: "Earn Full-Stack Development Certificate", done: false },
      { label: "Build & deploy 3 portfolio projects", done: false },
      { label: "Complete Digital Marketing course", done: true },
      { label: "Master Python fundamentals", done: false },
    ],
  },
  {
    id: "stu-002",
    name: "Zara Adeyemi",
    firstName: "Zara",
    lastName: "Adeyemi",
    avatar: "ZA",
    avatarBg: "bg-emerald-500",
    title: "Frontend Developer in Training",
    bio: "Fresh graduate exploring the intersection of design and code. Passionate about creating beautiful, accessible interfaces.",
    location: "Ibadan, Nigeria",
    email: "zara@ggecl.io",
    joined: "October 2023",
    gender: "Female",
    status: "Active",
    badges: ["Rising Star", "Early Adopter"],
    enrolled: 4, completed: 1, certificates: 1, totalSpent: 78.50, streak: 7,
    avgRatingGiven: 4.6, reviewsGiven: 5,
    enrolledCourses: [
      { id: "dev-001", title: "React & TypeScript Bootcamp 2024", thumbnail: "from-blue-500 to-indigo-600",  progress: 55, instructor: "Sarah Mitchell" },
      { id: "design-001", title: "UI/UX Design Fundamentals",    thumbnail: "from-rose-500 to-pink-600",   progress: 100, instructor: "Tolu Adeyemi", grade: "B+", completedAt: "2024-02-01" },
    ],
    grades: [
      { courseName: "UI/UX Design Fundamentals", letterGrade: "B+", percentage: 82, gradedAt: "2024-02-01" },
    ],
    assignments: [
      { id: "asg-001", title: "Build a Todo App", courseName: "React & TypeScript Bootcamp", status: "submitted", dueDate: "2024-03-20", maxScore: 100 },
    ],
    recentActivity: [
      { action: "Enrolled in course", target: "React & TypeScript Bootcamp", time: "1d ago", type: "enroll" },
      { action: "Completed module 5", target: "UI/UX Design",                time: "3d ago", type: "lesson" },
    ],
    learningGoals: [
      { label: "Finish React Bootcamp", done: false },
      { label: "Land first frontend internship", done: false },
      { label: "Complete UI/UX course", done: true },
    ],
  },
  {
    id: "stu-003",
    name: "Kofi Mensah",
    firstName: "Kofi",
    lastName: "Mensah",
    avatar: "KM",
    avatarBg: "bg-violet-500",
    title: "Backend Engineering Student",
    bio: "Systems thinker interested in distributed systems and databases. Building toward a career in backend infrastructure.",
    location: "Accra, Ghana",
    email: "kofi@ggecl.io",
    joined: "August 2023",
    gender: "Male",
    status: "Active",
    badges: ["Consistent", "Certificate Holder"],
    enrolled: 5, completed: 3, certificates: 3, totalSpent: 192.00, streak: 21,
    avgRatingGiven: 4.9, reviewsGiven: 18,
    enrolledCourses: [
      { id: "dev-002", title: "Node.js, Express & MongoDB", thumbnail: "from-emerald-500 to-teal-600",  progress: 88,  instructor: "James Okafor" },
      { id: "dev-001", title: "React & TypeScript Bootcamp", thumbnail: "from-blue-500 to-indigo-600", progress: 100, instructor: "Sarah Mitchell", grade: "A", completedAt: "2024-02-28" },
    ],
    grades: [
      { courseName: "React & TypeScript Bootcamp", letterGrade: "A", percentage: 94, gradedAt: "2024-02-28" },
    ],
    assignments: [
      { id: "asg-001", title: "Build a Todo App", courseName: "React & TypeScript Bootcamp", status: "graded", dueDate: "2024-03-20", score: 94, maxScore: 100 },
    ],
    recentActivity: [
      { action: "Completed module 12", target: "Node.js Masterclass", time: "5h ago",  type: "lesson" },
      { action: "Scored 98% on quiz",  target: "Async/Await deep dive",time: "1d ago",  type: "quiz" },
    ],
    learningGoals: [
      { label: "Finish Node.js Masterclass", done: false },
      { label: "Build a full REST API project", done: false },
      { label: "Complete React Bootcamp", done: true },
    ],
  },
  {
    id: "stu-004",
    name: "Priya Kumar",
    firstName: "Priya",
    lastName: "Kumar",
    avatar: "PK",
    avatarBg: "bg-pink-500",
    title: "Data Science Enthusiast",
    bio: "Mathematics graduate pivoting into data science and AI. Fascinated by how data shapes business decisions.",
    location: "Mumbai, India",
    email: "priya@ggecl.io",
    joined: "November 2023",
    gender: "Female",
    status: "Active",
    badges: ["Rising Star"],
    enrolled: 3, completed: 0, certificates: 0, totalSpent: 54.00, streak: 5,
    avgRatingGiven: 4.7, reviewsGiven: 3,
    enrolledCourses: [
      { id: "ds-001", title: "Python for Data Science & ML", thumbnail: "from-amber-500 to-orange-500", progress: 38, instructor: "Kwame Asante" },
    ],
    grades: [],
    assignments: [
      { id: "asg-005", title: "EDA on Titanic dataset", courseName: "Python for Data Science", status: "pending", dueDate: "2024-04-15", maxScore: 100 },
    ],
    recentActivity: [
      { action: "Started module 4", target: "Python for Data Science", time: "3h ago", type: "lesson" },
    ],
    learningGoals: [
      { label: "Complete Python for Data Science", done: false },
      { label: "Enter a Kaggle competition", done: false },
    ],
  },
  {
    id: "stu-005",
    name: "Amara Diallo",
    firstName: "Amara",
    lastName: "Diallo",
    avatar: "AD",
    avatarBg: "bg-amber-500",
    title: "Marketing & Business Student",
    bio: "Entrepreneurship student building her first e-commerce brand while studying digital marketing fundamentals.",
    location: "Dakar, Senegal",
    email: "amara@ggecl.io",
    joined: "December 2023",
    gender: "Female",
    status: "Inactive",
    badges: ["Early Adopter"],
    enrolled: 2, completed: 0, certificates: 0, totalSpent: 26.00, streak: 0,
    avgRatingGiven: 4.5, reviewsGiven: 2,
    enrolledCourses: [
      { id: "mkt-001", title: "Digital Marketing Masterclass", thumbnail: "from-violet-500 to-purple-600", progress: 12, instructor: "Amara Nwosu" },
      { id: "biz-001", title: "Entrepreneurship & Startup Playbook", thumbnail: "from-sky-500 to-blue-500", progress: 8, instructor: "Priya Sharma" },
    ],
    grades: [],
    assignments: [],
    recentActivity: [
      { action: "Last login", target: "14 days ago", time: "14d ago", type: "lesson" },
    ],
    learningGoals: [
      { label: "Complete Digital Marketing course", done: false },
      { label: "Launch first product campaign", done: false },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStudentById(id: string): Student | undefined {
  return students.find(s => s.id === id);
}

export function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export const STATUS_STYLES: Record<string, string> = {
  Active:    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
  Inactive:  "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/20",
  Suspended: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
};

export const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
  graded:    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
  submitted: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
  pending:   "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-700/30",
  late:      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30",
  missing:   "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30",
};