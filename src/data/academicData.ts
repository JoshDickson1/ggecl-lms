// src/data/academicData.ts
// Shared dummy data + types for Grades and Assignments systems.
// Replace these with real API calls when backend is ready.

// ─── SHARED TYPES ─────────────────────────────────────────────────────────────

export type LetterGrade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";
export type GradeStatus = "graded" | "pending" | "under_review";
export type GradedBy   = "instructor" | "admin";
export type AssignmentStatus = "pending" | "submitted" | "late" | "graded" | "returned" | "missing";
export type FileType = "image" | "audio" | "video" | "document" | "pdf" | "zip" | "other";

// ─── GRADE TYPES ──────────────────────────────────────────────────────────────

export type RubricCriterion = {
  id: string;
  label: string;      // e.g. "Technical Accuracy"
  maxScore: number;
  score: number;
};

export type Grade = {
  id: string;
  groupId: string;
  groupName: string;
  courseId: string;
  courseName: string;
  letterGrade: LetterGrade;
  percentage: number;
  gpa: number;            // 0.0 – 4.0
  status: GradeStatus;
  gradedBy: GradedBy;
  graderName: string;
  gradedAt: string;       // ISO date
  feedback: string;
  strengths: string[];
  improvements: string[];
  rubric: RubricCriterion[];
  isAppealable: boolean;
  appealDeadline?: string;
};

export type StudentGroup = {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  members: { id: string; name: string; avatar: string; avatarBg: string }[];
};

// ─── ASSIGNMENT TYPES ─────────────────────────────────────────────────────────

export type AssignmentFile = {
  id: string;
  name: string;
  size: string;       // e.g. "2.4 MB"
  type: FileType;
  url: string;        // dummy download URL
};

export type Assignment = {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  description: string;
  instructions: string;
  dueDate: string;    // ISO
  createdAt: string;
  createdBy: GradedBy;
  creatorName: string;
  maxScore: number;
  attachments: AssignmentFile[];
  status: AssignmentStatus;       // from student's perspective
  submittedAt?: string;
  submissionFiles?: AssignmentFile[];
  grade?: LetterGrade;
  score?: number;
  feedback?: string;
  allowedFileTypes: string[];     // e.g. ["image/*", ".pdf", ".docx"]
  allowLate: boolean;
};

export type Submission = {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentAvatarBg: string;
  courseId: string;
  courseName: string;
  submittedAt: string;
  isLate: boolean;
  files: AssignmentFile[];
  status: AssignmentStatus;
  grade?: LetterGrade;
  score?: number;
  maxScore: number;
  feedback?: string;
  rubric?: RubricCriterion[];
  gradedBy?: GradedBy;
  graderName?: string;
  gradedAt?: string;
};

// ─── GRADE HELPERS ────────────────────────────────────────────────────────────

export const GRADE_META: Record<LetterGrade, { color: string; bg: string; border: string; gpa: number; label: string }> = {
  "A+": { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/50", gpa: 4.0, label: "Outstanding"    },
  "A":  { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/50", gpa: 4.0, label: "Excellent"      },
  "A-": { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800/40", gpa: 3.7, label: "Excellent"      },
  "B+": { color: "text-blue-700 dark:text-blue-300",    bg: "bg-blue-50 dark:bg-blue-950/40",    border: "border-blue-200 dark:border-blue-800/50",    gpa: 3.3, label: "Very Good"     },
  "B":  { color: "text-blue-700 dark:text-blue-300",    bg: "bg-blue-50 dark:bg-blue-950/40",    border: "border-blue-200 dark:border-blue-800/50",    gpa: 3.0, label: "Good"          },
  "B-": { color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/30",    border: "border-blue-200 dark:border-blue-800/40",    gpa: 2.7, label: "Good"          },
  "C+": { color: "text-amber-700 dark:text-amber-300",  bg: "bg-amber-50 dark:bg-amber-950/40",  border: "border-amber-200 dark:border-amber-800/50",  gpa: 2.3, label: "Satisfactory"  },
  "C":  { color: "text-amber-700 dark:text-amber-300",  bg: "bg-amber-50 dark:bg-amber-950/40",  border: "border-amber-200 dark:border-amber-800/50",  gpa: 2.0, label: "Satisfactory"  },
  "C-": { color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/30",  border: "border-amber-200 dark:border-amber-800/40",  gpa: 1.7, label: "Satisfactory"  },
  "D":  { color: "text-orange-700 dark:text-orange-300",bg: "bg-orange-50 dark:bg-orange-950/40",border: "border-orange-200 dark:border-orange-800/50", gpa: 1.0, label: "Below Average" },
  "F":  { color: "text-red-700 dark:text-red-300",      bg: "bg-red-50 dark:bg-red-950/40",      border: "border-red-200 dark:border-red-800/50",      gpa: 0.0, label: "Fail"          },
};

export const FILE_META: Record<FileType, { icon: string; color: string; bg: string }> = {
  image:    { icon: "🖼️", color: "text-pink-600 dark:text-pink-400",   bg: "bg-pink-50 dark:bg-pink-950/30"   },
  audio:    { icon: "🎵", color: "text-purple-600 dark:text-purple-400",bg: "bg-purple-50 dark:bg-purple-950/30"},
  video:    { icon: "🎬", color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/30"   },
  document: { icon: "📄", color: "text-indigo-600 dark:text-indigo-400",bg: "bg-indigo-50 dark:bg-indigo-950/30"},
  pdf:      { icon: "📕", color: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-950/30"     },
  zip:      { icon: "🗜️", color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/30" },
  other:    { icon: "📎", color: "text-gray-600 dark:text-gray-400",    bg: "bg-gray-50 dark:bg-gray-100/50"   },
};

export function getFileType(name: string): FileType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return "image";
  if (["mp3","wav","ogg","aac","flac"].includes(ext)) return "audio";
  if (["mp4","mov","avi","mkv","webm"].includes(ext)) return "video";
  if (["doc","docx","txt","rtf","odt","ppt","pptx","xls","xlsx"].includes(ext)) return "document";
  if (ext === "pdf") return "pdf";
  if (["zip","rar","7z","tar","gz"].includes(ext)) return "zip";
  return "other";
}

// ─── DUMMY GRADES ─────────────────────────────────────────────────────────────

export const MOCK_GROUPS: StudentGroup[] = [
  {
    id: "grp-001", name: "Alpha Squad", courseId: "dev-001", courseName: "React & TypeScript Bootcamp",
    members: [
      { id: "stu-001", name: "Zara Adeyemi",    avatar: "ZA", avatarBg: "bg-blue-500"   },
      { id: "stu-002", name: "Kofi Mensah",     avatar: "KM", avatarBg: "bg-emerald-500"},
      { id: "stu-003", name: "Priya Kumar",     avatar: "PK", avatarBg: "bg-pink-500"   },
      { id: "stu-004", name: "James Obi",       avatar: "JO", avatarBg: "bg-violet-500" },
    ],
  },
  {
    id: "grp-002", name: "Beta Force", courseId: "dev-001", courseName: "React & TypeScript Bootcamp",
    members: [
      { id: "stu-005", name: "Amara Diallo",    avatar: "AD", avatarBg: "bg-amber-500"  },
      { id: "stu-006", name: "Chen Wei",        avatar: "CW", avatarBg: "bg-cyan-500"   },
      { id: "stu-007", name: "Fatou Sow",       avatar: "FS", avatarBg: "bg-rose-500"   },
    ],
  },
  {
    id: "grp-003", name: "Gamma Unit", courseId: "mkt-001", courseName: "Digital Marketing Masterclass",
    members: [
      { id: "stu-001", name: "Zara Adeyemi",    avatar: "ZA", avatarBg: "bg-blue-500"   },
      { id: "stu-008", name: "Tobias Reiter",   avatar: "TR", avatarBg: "bg-teal-500"   },
      { id: "stu-009", name: "Yuki Tanaka",     avatar: "YT", avatarBg: "bg-purple-500" },
      { id: "stu-010", name: "Laila Hassan",    avatar: "LH", avatarBg: "bg-orange-500" },
    ],
  },
];

const RUBRIC_REACT: RubricCriterion[] = [
  { id: "r1", label: "Technical Accuracy",    maxScore: 30, score: 27 },
  { id: "r2", label: "Code Quality",          maxScore: 25, score: 22 },
  { id: "r3", label: "Problem Solving",       maxScore: 20, score: 19 },
  { id: "r4", label: "Documentation",         maxScore: 15, score: 12 },
  { id: "r5", label: "Collaboration",         maxScore: 10, score: 9  },
];

export const MOCK_GRADES: Grade[] = [
  {
    id: "grd-001",
    groupId: "grp-001", groupName: "Alpha Squad",
    courseId: "dev-001", courseName: "React & TypeScript Bootcamp",
    letterGrade: "A", percentage: 89, gpa: 4.0,
    status: "graded", gradedBy: "instructor", graderName: "Sarah Mitchell",
    gradedAt: "2024-03-15T10:30:00Z",
    feedback: "Alpha Squad delivered an outstanding project. The component architecture was exceptionally well thought out, and the TypeScript typing was rigorous throughout. Minor improvements could be made to the test coverage.",
    strengths: ["Excellent component design", "Strong TypeScript usage", "Clean Git history", "Great team coordination"],
    improvements: ["Increase test coverage to 80%+", "Add more JSDoc comments"],
    rubric: RUBRIC_REACT,
    isAppealable: true, appealDeadline: "2024-03-29T23:59:59Z",
  },
  {
    id: "grd-002",
    groupId: "grp-002", groupName: "Beta Force",
    courseId: "dev-001", courseName: "React & TypeScript Bootcamp",
    letterGrade: "B+", percentage: 78, gpa: 3.3,
    status: "graded", gradedBy: "admin", graderName: "Emeka Osei",
    gradedAt: "2024-03-15T14:00:00Z",
    feedback: "Beta Force showed solid understanding of React concepts. The application was functional but the code could benefit from more consistent patterns and better error handling.",
    strengths: ["Functional application", "Good UI design", "Met all requirements"],
    improvements: ["Improve error handling", "Refactor repeated logic into hooks", "More consistent naming"],
    rubric: [
      { id: "r1", label: "Technical Accuracy",    maxScore: 30, score: 23 },
      { id: "r2", label: "Code Quality",          maxScore: 25, score: 19 },
      { id: "r3", label: "Problem Solving",       maxScore: 20, score: 16 },
      { id: "r4", label: "Documentation",         maxScore: 15, score: 11 },
      { id: "r5", label: "Collaboration",         maxScore: 10, score: 9  },
    ],
    isAppealable: true, appealDeadline: "2024-03-29T23:59:59Z",
  },
  {
    id: "grd-003",
    groupId: "grp-003", groupName: "Gamma Unit",
    courseId: "mkt-001", courseName: "Digital Marketing Masterclass",
    letterGrade: "A-", percentage: 91, gpa: 3.7,
    status: "graded", gradedBy: "instructor", graderName: "Amara Nwosu",
    gradedAt: "2024-03-10T09:00:00Z",
    feedback: "Excellent marketing campaign strategy. The group demonstrated deep understanding of SEO principles and the content calendar was highly professional.",
    strengths: ["Professional presentation", "Data-driven decisions", "Creative concepts", "Thorough research"],
    improvements: ["Include more A/B testing rationale", "Expand social media section"],
    rubric: [
      { id: "r1", label: "Strategy Quality",       maxScore: 30, score: 28 },
      { id: "r2", label: "Research Depth",         maxScore: 25, score: 23 },
      { id: "r3", label: "Creativity",             maxScore: 20, score: 19 },
      { id: "r4", label: "Presentation",           maxScore: 15, score: 14 },
      { id: "r5", label: "Implementation Plan",    maxScore: 10, score: 7  },
    ],
    isAppealable: false,
  },
];

// ─── DUMMY ASSIGNMENTS ────────────────────────────────────────────────────────

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-001",
    title: "Build a Todo App with React & TypeScript",
    courseId: "dev-001", courseName: "React & TypeScript Bootcamp",
    description: "Create a fully functional Todo application demonstrating your understanding of React hooks, TypeScript interfaces, and state management.",
    instructions: "1. Use functional components only\n2. Implement full TypeScript typing\n3. Include add, edit, delete, and filter functionality\n4. Write at least 5 unit tests\n5. Deploy to Vercel or Netlify and include the live URL in your submission\n6. Submit your GitHub repository link as a .txt file",
    dueDate: "2024-03-20T23:59:00Z",
    createdAt: "2024-03-06T08:00:00Z",
    createdBy: "instructor", creatorName: "Sarah Mitchell",
    maxScore: 100,
    attachments: [
      { id: "f1", name: "Assignment Brief.pdf",    size: "240 KB", type: "pdf",      url: "#" },
      { id: "f2", name: "Starter Template.zip",   size: "1.2 MB", type: "zip",      url: "#" },
      { id: "f3", name: "Grading Rubric.docx",    size: "85 KB",  type: "document", url: "#" },
    ],
    status: "graded",
    submittedAt: "2024-03-19T22:14:00Z",
    submissionFiles: [
      { id: "sf1", name: "todo-app-submission.zip",  size: "4.2 MB", type: "zip",   url: "#" },
      { id: "sf2", name: "live-url.txt",             size: "0.1 KB", type: "other", url: "#" },
    ],
    grade: "A", score: 91, feedback: "Excellent work! Clean code, all requirements met.",
    allowedFileTypes: [".zip", ".txt", ".pdf", "image/*"],
    allowLate: false,
  },
  {
    id: "asg-002",
    title: "API Integration — Weather Dashboard",
    courseId: "dev-001", courseName: "React & TypeScript Bootcamp",
    description: "Integrate a public weather API and build a responsive dashboard showing current weather and a 5-day forecast.",
    instructions: "1. Use the OpenWeatherMap free API\n2. Implement geolocation and city search\n3. Show temperature in both Celsius and Fahrenheit\n4. Handle loading states and errors gracefully\n5. Make it fully responsive",
    dueDate: "2024-04-05T23:59:00Z",
    createdAt: "2024-03-22T08:00:00Z",
    createdBy: "admin", creatorName: "Emeka Osei",
    maxScore: 100,
    attachments: [
      { id: "f4", name: "API Documentation.pdf", size: "380 KB", type: "pdf", url: "#" },
      { id: "f5", name: "Design Mockup.png",     size: "920 KB", type: "image", url: "#" },
    ],
    status: "submitted",
    submittedAt: "2024-04-03T18:30:00Z",
    submissionFiles: [
      { id: "sf3", name: "weather-dashboard.zip",size: "6.8 MB", type: "zip",   url: "#" },
      { id: "sf4", name: "demo-video.mp4",       size: "28 MB",  type: "video", url: "#" },
    ],
    allowedFileTypes: [".zip", "image/*", "video/*", ".txt"],
    allowLate: true,
  },
  {
    id: "asg-003",
    title: "Content Marketing Strategy Report",
    courseId: "mkt-001", courseName: "Digital Marketing Masterclass",
    description: "Write a comprehensive content marketing strategy for a fictional SaaS product of your choice.",
    instructions: "1. Define your target audience personas\n2. Audit 3 competitor content strategies\n3. Create a 3-month content calendar\n4. Include SEO keyword research\n5. Propose KPIs and measurement methods\n6. Submit as PDF or Word document",
    dueDate: "2024-03-28T23:59:00Z",
    createdAt: "2024-03-14T10:00:00Z",
    createdBy: "instructor", creatorName: "Amara Nwosu",
    maxScore: 100,
    attachments: [
      { id: "f6", name: "Strategy Template.docx", size: "145 KB", type: "document", url: "#" },
      { id: "f7", name: "Keyword Research Guide.pdf", size: "290 KB", type: "pdf", url: "#" },
    ],
    status: "pending",
    allowedFileTypes: [".pdf", ".docx", ".doc"],
    allowLate: false,
  },
  {
    id: "asg-004",
    title: "Recorded Pitch Presentation",
    courseId: "mkt-001", courseName: "Digital Marketing Masterclass",
    description: "Record a 5–7 minute video pitch for your marketing strategy. Present as if pitching to a real client.",
    instructions: "1. Keep it between 5 and 7 minutes\n2. Use slides (include the slide deck)\n3. Speak clearly — no heavy background noise\n4. Submit as MP4, MOV, or a YouTube link (.txt)\n5. Include a written summary (max 200 words)",
    dueDate: "2024-04-10T23:59:00Z",
    createdAt: "2024-03-29T08:00:00Z",
    createdBy: "instructor", creatorName: "Amara Nwosu",
    maxScore: 100,
    attachments: [],
    status: "missing",
    allowedFileTypes: ["video/*", ".txt", ".pdf", ".pptx"],
    allowLate: true,
  },
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "sub-001", assignmentId: "asg-001", assignmentTitle: "Build a Todo App with React & TypeScript",
    studentId: "stu-001", studentName: "Zara Adeyemi", studentAvatar: "ZA", studentAvatarBg: "bg-blue-500",
    courseId: "dev-001", courseName: "React & TypeScript Bootcamp",
    submittedAt: "2024-03-19T22:14:00Z", isLate: false,
    files: [
      { id: "sf1", name: "todo-app.zip",  size: "4.2 MB", type: "zip",   url: "#" },
      { id: "sf2", name: "live-url.txt",  size: "0.1 KB", type: "other", url: "#" },
    ],
    status: "graded", grade: "A", score: 91, maxScore: 100,
    feedback: "Clean code, excellent TypeScript typing. All requirements met. Minor: test coverage could be higher.",
    rubric: [
      { id: "r1", label: "Functionality",    maxScore: 40, score: 37 },
      { id: "r2", label: "Code Quality",     maxScore: 30, score: 27 },
      { id: "r3", label: "TypeScript",       maxScore: 20, score: 19 },
      { id: "r4", label: "Testing",          maxScore: 10, score: 8  },
    ],
    gradedBy: "instructor", graderName: "Sarah Mitchell", gradedAt: "2024-03-22T09:00:00Z",
  },
  {
    id: "sub-002", assignmentId: "asg-001", assignmentTitle: "Build a Todo App with React & TypeScript",
    studentId: "stu-002", studentName: "Kofi Mensah", studentAvatar: "KM", studentAvatarBg: "bg-emerald-500",
    courseId: "dev-001", courseName: "React & TypeScript Bootcamp",
    submittedAt: "2024-03-21T01:30:00Z", isLate: true,
    files: [
      { id: "sf3", name: "kofi-todo.zip",   size: "3.1 MB", type: "zip",   url: "#" },
      { id: "sf4", name: "screenshot.png",  size: "420 KB", type: "image", url: "#" },
    ],
    status: "submitted", maxScore: 100,
  },
  {
    id: "sub-003", assignmentId: "asg-001", assignmentTitle: "Build a Todo App with React & TypeScript",
    studentId: "stu-003", studentName: "Priya Kumar", studentAvatar: "PK", studentAvatarBg: "bg-pink-500",
    courseId: "dev-001", courseName: "React & TypeScript Bootcamp",
    submittedAt: "2024-03-20T15:00:00Z", isLate: false,
    files: [
      { id: "sf5", name: "priya-todo-app.zip", size: "5.6 MB", type: "zip", url: "#" },
    ],
    status: "graded", grade: "B+", score: 78, maxScore: 100,
    feedback: "Good functional application. Improve error handling and add more tests.",
    rubric: [
      { id: "r1", label: "Functionality",    maxScore: 40, score: 32 },
      { id: "r2", label: "Code Quality",     maxScore: 30, score: 22 },
      { id: "r3", label: "TypeScript",       maxScore: 20, score: 16 },
      { id: "r4", label: "Testing",          maxScore: 10, score: 8  },
    ],
    gradedBy: "admin", graderName: "Emeka Osei", gradedAt: "2024-03-22T11:00:00Z",
  },
  {
    id: "sub-004", assignmentId: "asg-002", assignmentTitle: "API Integration — Weather Dashboard",
    studentId: "stu-001", studentName: "Zara Adeyemi", studentAvatar: "ZA", studentAvatarBg: "bg-blue-500",
    courseId: "dev-001", courseName: "React & TypeScript Bootcamp",
    submittedAt: "2024-04-03T18:30:00Z", isLate: false,
    files: [
      { id: "sf6", name: "weather-dashboard.zip", size: "6.8 MB", type: "zip",   url: "#" },
      { id: "sf7", name: "demo-video.mp4",        size: "28 MB",  type: "video", url: "#" },
    ],
    status: "submitted", maxScore: 100,
  },
];

// ─── COMPUTED HELPERS ─────────────────────────────────────────────────────────

export function getStudentGrades(studentId: string): Grade[] {
  const studentGroups = MOCK_GROUPS.filter(g => g.members.some(m => m.id === studentId));
  return MOCK_GRADES.filter(g => studentGroups.some(sg => sg.id === g.groupId));
}

export function getGroupGrades(groupId: string): Grade[] {
  return MOCK_GRADES.filter(g => g.groupId === groupId);
}

export function getStudentAssignments(_studentId: string): Assignment[] {
  return MOCK_ASSIGNMENTS; // all assignments for now; filter by enrolled courses in prod
}

export function getStudentSubmissions(studentId: string): Submission[] {
  return MOCK_SUBMISSIONS.filter(s => s.studentId === studentId);
}

export function getSubmissionsForAssignment(assignmentId: string): Submission[] {
  return MOCK_SUBMISSIONS.filter(s => s.assignmentId === assignmentId);
}

export function calcGPA(grades: Grade[]): number {
  if (!grades.length) return 0;
  return parseFloat((grades.reduce((s, g) => s + g.gpa, 0) / grades.length).toFixed(2));
}

export function rubricTotal(rubric: RubricCriterion[]): { score: number; max: number; pct: number } {
  const score = rubric.reduce((s, r) => s + r.score, 0);
  const max   = rubric.reduce((s, r) => s + r.maxScore, 0);
  return { score, max, pct: Math.round((score / max) * 100) };
}