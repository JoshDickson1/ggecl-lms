// src/data/chatData.ts
// Shared types + seed data for the Classroom / Classgroup chat system.
// Replace with real API calls when backend is ready.

import type { LetterGrade, RubricCriterion } from "./academicData";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type ChatRole = "student" | "instructor" | "admin";

export type AttachmentType = "image" | "audio" | "video" | "document" | "pdf" | "zip" | "other";

export type ChatAttachment = {
  id: string;
  name: string;
  size: string;         // "2.4 MB"
  type: AttachmentType;
  url: string;          // blob / CDN URL (dummy "#" for now)
  thumbnailUrl?: string;
};

export type ChatReaction = {
  emoji: string;
  count: number;
  reactedByMe: boolean;
};

export type ChatMessage = {
  id: string;
  roomId: string;         // classroom or classgroup id
  senderId: string;
  senderName: string;
  senderAvatar: string;   // initials
  senderAvatarBg: string; // tailwind class
  senderRole: ChatRole;
  text: string;
  attachments: ChatAttachment[];
  reactions: ChatReaction[];
  replyTo?: {             // message being replied to
    id: string;
    senderName: string;
    text: string;
  };
  taggedUsers: string[];  // user ids
  createdAt: string;      // ISO
  editedAt?: string;
  isDeleted: boolean;
  isPinned: boolean;
};

export type ClassroomMember = {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  role: ChatRole;
  isOnline: boolean;
  joinedAt: string;
};

export type Classroom = {
  id: string;
  name: string;
  description: string;
  courseId: string;
  courseName: string;
  color: string;           // tailwind gradient e.g. "from-blue-600 to-indigo-700"
  icon: string;            // emoji
  createdBy: string;       // admin id
  createdAt: string;
  instructors: ClassroomMember[];
  students: ClassroomMember[];
  pinnedMessageIds: string[];
  isArchived: boolean;
  totalMessages: number;
};

export type ClassGroup = {
  id: string;
  classroomId: string;
  classroomName: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdBy: string;
  createdByRole: ChatRole;
  createdAt: string;
  members: ClassroomMember[];
  pinnedMessageIds: string[];
  isArchived: boolean;
  totalMessages: number;
  // grading
  grade?: LetterGrade;
  gradePercentage?: number;
  gradedBy?: string;
  gradedByRole?: ChatRole;
  gradedAt?: string;
  gradeFeedback?: string;
  gradeRubric?: RubricCriterion[];
  gradeStrengths?: string[];
  gradeImprovements?: string[];
  isAppealable?: boolean;
};

// ─── SEED MEMBERS ─────────────────────────────────────────────────────────────

export const ME: ClassroomMember = {
  id: "me",
  name: "You",
  avatar: "EO",
  avatarBg: "bg-blue-600",
  role: "student",
  isOnline: true,
  joinedAt: "2024-01-10T08:00:00Z",
};

const MEMBERS: ClassroomMember[] = [
  { id: "ins-001", name: "Sarah Mitchell",  avatar: "SM", avatarBg: "bg-gradient-to-br from-blue-600 to-indigo-600",   role: "instructor", isOnline: true,  joinedAt: "2024-01-01T08:00:00Z" },
  { id: "ins-002", name: "James Okafor",    avatar: "JO", avatarBg: "bg-gradient-to-br from-emerald-600 to-teal-600", role: "instructor", isOnline: false, joinedAt: "2024-01-01T08:00:00Z" },
  { id: "adm-001", name: "Emeka Osei",      avatar: "EO", avatarBg: "bg-gradient-to-br from-rose-600 to-pink-600",    role: "admin",      isOnline: true,  joinedAt: "2024-01-01T07:00:00Z" },
  { id: "stu-001", name: "Zara Adeyemi",    avatar: "ZA", avatarBg: "bg-blue-500",    role: "student", isOnline: true,  joinedAt: "2024-01-10T08:00:00Z" },
  { id: "stu-002", name: "Kofi Mensah",     avatar: "KM", avatarBg: "bg-emerald-500", role: "student", isOnline: false, joinedAt: "2024-01-10T08:00:00Z" },
  { id: "stu-003", name: "Priya Kumar",     avatar: "PK", avatarBg: "bg-pink-500",    role: "student", isOnline: true,  joinedAt: "2024-01-10T08:00:00Z" },
  { id: "stu-004", name: "James Obi",       avatar: "JO", avatarBg: "bg-violet-500",  role: "student", isOnline: false, joinedAt: "2024-01-10T08:00:00Z" },
  { id: "stu-005", name: "Amara Diallo",    avatar: "AD", avatarBg: "bg-amber-500",   role: "student", isOnline: true,  joinedAt: "2024-01-11T08:00:00Z" },
  { id: "stu-006", name: "Chen Wei",        avatar: "CW", avatarBg: "bg-cyan-500",    role: "student", isOnline: false, joinedAt: "2024-01-11T08:00:00Z" },
  { id: "stu-007", name: "Fatou Sow",       avatar: "FS", avatarBg: "bg-rose-500",    role: "student", isOnline: true,  joinedAt: "2024-01-12T08:00:00Z" },
  ME,
];

function member(id: string) { return MEMBERS.find(m => m.id === id)!; }

// ─── SEED CLASSROOMS ──────────────────────────────────────────────────────────

export const MOCK_CLASSROOMS: Classroom[] = [
  {
    id: "cls-001",
    name: "React & TypeScript — Cohort 4",
    description: "Main classroom for the React & TypeScript Bootcamp, Cohort 4. All announcements, Q&A, and resources here.",
    courseId: "dev-001",
    courseName: "React & TypeScript Bootcamp",
    color: "from-blue-600 to-indigo-700",
    icon: "⚛️",
    createdBy: "adm-001",
    createdAt: "2024-01-01T08:00:00Z",
    instructors: [member("ins-001"), member("ins-002")],
    students: [member("stu-001"), member("stu-002"), member("stu-003"), member("stu-004"), member("stu-005"), member("stu-006"), member("stu-007"), ME],
    pinnedMessageIds: ["msg-001"],
    isArchived: false,
    totalMessages: 142,
  },
  {
    id: "cls-002",
    name: "Digital Marketing — Cohort 2",
    description: "Official classroom for Digital Marketing Masterclass Cohort 2. Campaigns, resources and live session links.",
    courseId: "mkt-001",
    courseName: "Digital Marketing Masterclass",
    color: "from-violet-600 to-purple-700",
    icon: "📣",
    createdBy: "adm-001",
    createdAt: "2024-01-05T08:00:00Z",
    instructors: [member("ins-002")],
    students: [member("stu-001"), member("stu-005"), member("stu-007"), ME],
    pinnedMessageIds: [],
    isArchived: false,
    totalMessages: 87,
  },
];

// ─── SEED CLASSGROUPS ─────────────────────────────────────────────────────────

export const MOCK_CLASSGROUPS: ClassGroup[] = [
  {
    id: "grp-001",
    classroomId: "cls-001",
    classroomName: "React & TypeScript — Cohort 4",
    name: "Alpha Squad",
    description: "Project group for the Todo App and Weather Dashboard assignments.",
    color: "from-blue-500 to-indigo-600",
    icon: "🔵",
    createdBy: "ins-001",
    createdByRole: "instructor",
    createdAt: "2024-01-15T09:00:00Z",
    members: [member("ins-001"), member("stu-001"), member("stu-002"), member("stu-003"), ME],
    pinnedMessageIds: ["gmsg-003"],
    isArchived: false,
    totalMessages: 68,
    grade: "A",
    gradePercentage: 89,
    gradedBy: "Sarah Mitchell",
    gradedByRole: "instructor",
    gradedAt: "2024-03-15T10:30:00Z",
    gradeFeedback: "Alpha Squad delivered an outstanding project. Excellent component architecture and rigorous TypeScript typing throughout.",
    gradeRubric: [
      { id: "r1", label: "Technical Accuracy", maxScore: 30, score: 27 },
      { id: "r2", label: "Code Quality",       maxScore: 25, score: 22 },
      { id: "r3", label: "Problem Solving",    maxScore: 20, score: 19 },
      { id: "r4", label: "Documentation",      maxScore: 15, score: 12 },
      { id: "r5", label: "Collaboration",      maxScore: 10, score: 9  },
    ],
    gradeStrengths: ["Excellent component design", "Strong TypeScript usage", "Clean Git history"],
    gradeImprovements: ["Increase test coverage to 80%+", "Add more JSDoc comments"],
    isAppealable: true,
  },
  {
    id: "grp-002",
    classroomId: "cls-001",
    classroomName: "React & TypeScript — Cohort 4",
    name: "Beta Force",
    description: "Group for stu-005, stu-006, stu-007 focused on the Backend integration tasks.",
    color: "from-emerald-500 to-teal-600",
    icon: "🟢",
    createdBy: "adm-001",
    createdByRole: "admin",
    createdAt: "2024-01-15T09:30:00Z",
    members: [member("ins-002"), member("stu-005"), member("stu-006"), member("stu-007")],
    pinnedMessageIds: [],
    isArchived: false,
    totalMessages: 41,
    grade: "B+",
    gradePercentage: 78,
    gradedBy: "Emeka Osei",
    gradedByRole: "admin",
    gradedAt: "2024-03-15T14:00:00Z",
    gradeFeedback: "Solid understanding but could benefit from more consistent patterns and better error handling.",
    gradeRubric: [
      { id: "r1", label: "Technical Accuracy", maxScore: 30, score: 23 },
      { id: "r2", label: "Code Quality",       maxScore: 25, score: 19 },
      { id: "r3", label: "Problem Solving",    maxScore: 20, score: 16 },
      { id: "r4", label: "Documentation",      maxScore: 15, score: 11 },
      { id: "r5", label: "Collaboration",      maxScore: 10, score: 9  },
    ],
    gradeStrengths: ["Functional application", "Good UI design", "Met all requirements"],
    gradeImprovements: ["Improve error handling", "Refactor repeated logic into hooks"],
    isAppealable: true,
  },
  {
    id: "grp-003",
    classroomId: "cls-002",
    classroomName: "Digital Marketing — Cohort 2",
    name: "Gamma Unit",
    description: "Campaign strategy group for the Digital Marketing course.",
    color: "from-violet-500 to-purple-600",
    icon: "🟣",
    createdBy: "ins-002",
    createdByRole: "instructor",
    createdAt: "2024-01-20T10:00:00Z",
    members: [member("ins-002"), member("stu-001"), member("stu-005"), ME],
    pinnedMessageIds: [],
    isArchived: false,
    totalMessages: 29,
  },
];

// ─── SEED MESSAGES — classroom cls-001 ───────────────────────────────────────

export const CLASSROOM_MESSAGES: Record<string, ChatMessage[]> = {
  "cls-001": [
    {
      id: "msg-001", roomId: "cls-001",
      senderId: "ins-001", senderName: "Sarah Mitchell", senderAvatar: "SM", senderAvatarBg: "bg-gradient-to-br from-blue-600 to-indigo-600", senderRole: "instructor",
      text: "Welcome everyone to React & TypeScript Cohort 4! 🎉 Please introduce yourself below. We start live sessions this Saturday at 10am WAT.",
      attachments: [], reactions: [{ emoji: "🎉", count: 8, reactedByMe: true }, { emoji: "🔥", count: 5, reactedByMe: false }],
      taggedUsers: [], createdAt: "2024-01-10T09:00:00Z", isDeleted: false, isPinned: true,
    },
    {
      id: "msg-002", roomId: "cls-001",
      senderId: "stu-001", senderName: "Zara Adeyemi", senderAvatar: "ZA", senderAvatarBg: "bg-blue-500", senderRole: "student",
      text: "Hi! I'm Zara from Lagos. Excited to be here — I've been learning React for 6 months and ready to level up with TypeScript 💪",
      attachments: [], reactions: [{ emoji: "👋", count: 4, reactedByMe: false }],
      taggedUsers: [], createdAt: "2024-01-10T09:15:00Z", isDeleted: false, isPinned: false,
    },
    {
      id: "msg-003", roomId: "cls-001",
      senderId: "me", senderName: "You", senderAvatar: "EO", senderAvatarBg: "bg-blue-600", senderRole: "student",
      text: "Hey everyone! Emeka here from Abuja. Transitioning from accounting to software dev — this bootcamp is the leap I needed!",
      attachments: [], reactions: [{ emoji: "💪", count: 6, reactedByMe: false }, { emoji: "❤️", count: 3, reactedByMe: false }],
      taggedUsers: [], createdAt: "2024-01-10T09:22:00Z", isDeleted: false, isPinned: false,
    },
    {
      id: "msg-004", roomId: "cls-001",
      senderId: "ins-001", senderName: "Sarah Mitchell", senderAvatar: "SM", senderAvatarBg: "bg-gradient-to-br from-blue-600 to-indigo-600", senderRole: "instructor",
      text: "Assignment 1 is now live. Build a Todo App using React + TypeScript. See the full brief attached. Due March 20th.",
      attachments: [
        { id: "a1", name: "Assignment_1_Brief.pdf", size: "240 KB", type: "pdf", url: "#" },
        { id: "a2", name: "Starter_Template.zip",  size: "1.2 MB", type: "zip", url: "#" },
      ],
      reactions: [{ emoji: "👀", count: 12, reactedByMe: true }],
      taggedUsers: [], createdAt: "2024-03-06T08:05:00Z", isDeleted: false, isPinned: false,
    },
    {
      id: "msg-005", roomId: "cls-001",
      senderId: "stu-002", senderName: "Kofi Mensah", senderAvatar: "KM", senderAvatarBg: "bg-emerald-500", senderRole: "student",
      text: "Quick question @Sarah Mitchell — can we use Zustand for state management or must it be useState only?",
      attachments: [], reactions: [],
      replyTo: { id: "msg-004", senderName: "Sarah Mitchell", text: "Assignment 1 is now live..." },
      taggedUsers: ["ins-001"], createdAt: "2024-03-06T09:30:00Z", isDeleted: false, isPinned: false,
    },
    {
      id: "msg-006", roomId: "cls-001",
      senderId: "ins-001", senderName: "Sarah Mitchell", senderAvatar: "SM", senderAvatarBg: "bg-gradient-to-br from-blue-600 to-indigo-600", senderRole: "instructor",
      text: "@Kofi Mensah useState only for this one — the goal is to master the fundamentals first. We'll cover Zustand in week 6.",
      attachments: [], reactions: [{ emoji: "👍", count: 7, reactedByMe: false }],
      replyTo: { id: "msg-005", senderName: "Kofi Mensah", text: "Quick question @Sarah Mitchell..." },
      taggedUsers: ["stu-002"], createdAt: "2024-03-06T09:45:00Z", isDeleted: false, isPinned: false,
    },
    {
      id: "msg-007", roomId: "cls-001",
      senderId: "me", senderName: "You", senderAvatar: "EO", senderAvatarBg: "bg-blue-600", senderRole: "student",
      text: "Just submitted assignment 1! Really enjoyed the challenge 🎯",
      attachments: [], reactions: [{ emoji: "🎯", count: 3, reactedByMe: false }],
      taggedUsers: [], createdAt: "2024-03-19T22:20:00Z", isDeleted: false, isPinned: false,
    },
  ],
  "cls-002": [
    {
      id: "msg-c2-001", roomId: "cls-002",
      senderId: "ins-002", senderName: "James Okafor", senderAvatar: "JO", senderAvatarBg: "bg-gradient-to-br from-emerald-600 to-teal-600", senderRole: "instructor",
      text: "Welcome to Digital Marketing Cohort 2! 📣 This classroom is your hub for all campaign resources, live session links, and Q&A.",
      attachments: [], reactions: [{ emoji: "📣", count: 5, reactedByMe: true }],
      taggedUsers: [], createdAt: "2024-01-05T09:00:00Z", isDeleted: false, isPinned: false,
    },
    {
      id: "msg-c2-002", roomId: "cls-002",
      senderId: "me", senderName: "You", senderAvatar: "EO", senderAvatarBg: "bg-blue-600", senderRole: "student",
      text: "Looking forward to the SEO module! Any recommended tools to get started with keyword research before we get there?",
      attachments: [], reactions: [],
      taggedUsers: [], createdAt: "2024-01-05T10:00:00Z", isDeleted: false, isPinned: false,
    },
  ],
};

// ─── SEED MESSAGES — classgroups ──────────────────────────────────────────────

export const CLASSGROUP_MESSAGES: Record<string, ChatMessage[]> = {
  "grp-001": [
    {
      id: "gmsg-001", roomId: "grp-001",
      senderId: "ins-001", senderName: "Sarah Mitchell", senderAvatar: "SM", senderAvatarBg: "bg-gradient-to-br from-blue-600 to-indigo-600", senderRole: "instructor",
      text: "Welcome Alpha Squad! This is your dedicated group space. Use it to collaborate, share code snippets, and ask me questions specific to your group.",
      attachments: [], reactions: [{ emoji: "🚀", count: 4, reactedByMe: true }],
      taggedUsers: [], createdAt: "2024-01-15T09:05:00Z", isDeleted: false, isPinned: false,
    },
    {
      id: "gmsg-002", roomId: "grp-001",
      senderId: "stu-001", senderName: "Zara Adeyemi", senderAvatar: "ZA", senderAvatarBg: "bg-blue-500", senderRole: "student",
      text: "I've set up the GitHub repo for our Todo App. Everyone request access so we can start pushing code.",
      attachments: [
        { id: "ga1", name: "repo-access-guide.pdf", size: "90 KB", type: "pdf", url: "#" },
      ],
      reactions: [{ emoji: "🔗", count: 3, reactedByMe: false }],
      taggedUsers: [], createdAt: "2024-01-16T10:00:00Z", isDeleted: false, isPinned: false,
    },
    {
      id: "gmsg-003", roomId: "grp-001",
      senderId: "me", senderName: "You", senderAvatar: "EO", senderAvatarBg: "bg-blue-600", senderRole: "student",
      text: "Here's the design mockup I put together. Thoughts? @Zara Adeyemi @Priya Kumar",
      attachments: [
        { id: "ga2", name: "todo-app-mockup.png", size: "480 KB", type: "image", url: "#" },
      ],
      reactions: [{ emoji: "🔥", count: 3, reactedByMe: false }, { emoji: "❤️", count: 2, reactedByMe: false }],
      taggedUsers: ["stu-001", "stu-003"],
      replyTo: undefined,
      createdAt: "2024-01-17T14:00:00Z", isDeleted: false, isPinned: true,
    },
    {
      id: "gmsg-004", roomId: "grp-001",
      senderId: "stu-003", senderName: "Priya Kumar", senderAvatar: "PK", senderAvatarBg: "bg-pink-500", senderRole: "student",
      text: "Love the mockup! Can we make the completed tasks section collapsible? Also @Kofi Mensah have you started on the filter logic?",
      attachments: [], reactions: [],
      replyTo: { id: "gmsg-003", senderName: "You", text: "Here's the design mockup I put together..." },
      taggedUsers: ["stu-002"],
      createdAt: "2024-01-17T14:30:00Z", isDeleted: false, isPinned: false,
    },
    {
      id: "gmsg-005", roomId: "grp-001",
      senderId: "ins-001", senderName: "Sarah Mitchell", senderAvatar: "SM", senderAvatarBg: "bg-gradient-to-br from-blue-600 to-indigo-600", senderRole: "instructor",
      text: "Just reviewed your progress — you're on a great track! One tip: make sure your TypeScript interfaces are in a separate `types.ts` file for cleanliness.",
      attachments: [], reactions: [{ emoji: "🙏", count: 4, reactedByMe: true }],
      taggedUsers: [], createdAt: "2024-01-18T11:00:00Z", isDeleted: false, isPinned: false,
    },
  ],
  "grp-002": [
    {
      id: "gmsg-b1", roomId: "grp-002",
      senderId: "ins-002", senderName: "James Okafor", senderAvatar: "JO", senderAvatarBg: "bg-gradient-to-br from-emerald-600 to-teal-600", senderRole: "instructor",
      text: "Welcome Beta Force! Let's make this group count. Your focus will be the Backend integration tasks.",
      attachments: [], reactions: [{ emoji: "💪", count: 3, reactedByMe: false }],
      taggedUsers: [], createdAt: "2024-01-15T09:30:00Z", isDeleted: false, isPinned: false,
    },
  ],
  "grp-003": [
    {
      id: "gmsg-g1", roomId: "grp-003",
      senderId: "ins-002", senderName: "James Okafor", senderAvatar: "JO", senderAvatarBg: "bg-gradient-to-br from-emerald-600 to-teal-600", senderRole: "instructor",
      text: "Gamma Unit — your brief is to develop a full content marketing strategy for a SaaS product. Let's begin brainstorming!",
      attachments: [
        { id: "gg1", name: "strategy-template.docx", size: "145 KB", type: "document", url: "#" },
      ],
      reactions: [], taggedUsers: [], createdAt: "2024-01-20T10:05:00Z", isDeleted: false, isPinned: false,
    },
    {
      id: "gmsg-g2", roomId: "grp-003",
      senderId: "me", senderName: "You", senderAvatar: "EO", senderAvatarBg: "bg-blue-600", senderRole: "student",
      text: "How about we do a SaaS for freelance invoicing? Lots of data and competitor analysis we can pull from.",
      attachments: [], reactions: [{ emoji: "💡", count: 2, reactedByMe: false }],
      taggedUsers: [], createdAt: "2024-01-20T10:30:00Z", isDeleted: false, isPinned: false,
    },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days < 7)    return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export const ATTACHMENT_META: Record<AttachmentType, { icon: string; color: string; bg: string }> = {
  image:    { icon: "🖼️", color: "text-pink-600",    bg: "bg-pink-50 dark:bg-pink-950/30"    },
  audio:    { icon: "🎵", color: "text-purple-600",  bg: "bg-purple-50 dark:bg-purple-950/30"},
  video:    { icon: "🎬", color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30"    },
  document: { icon: "📄", color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/30"},
  pdf:      { icon: "📕", color: "text-red-600",     bg: "bg-red-50 dark:bg-red-950/30"      },
  zip:      { icon: "🗜️", color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30"  },
  other:    { icon: "📎", color: "text-gray-600",    bg: "bg-gray-50 dark:bg-gray-100/50"    },
};

export function getAttachmentType(name: string): AttachmentType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return "image";
  if (["mp3","wav","ogg","aac"].includes(ext)) return "audio";
  if (["mp4","mov","avi","mkv","webm"].includes(ext)) return "video";
  if (["doc","docx","txt","ppt","pptx","xls","xlsx"].includes(ext)) return "document";
  if (ext === "pdf") return "pdf";
  if (["zip","rar","7z","tar","gz"].includes(ext)) return "zip";
  return "other";
}

export const EMOJI_REACTIONS = ["👍", "❤️", "🔥", "🎉", "😂", "😮", "🙏", "💯"];