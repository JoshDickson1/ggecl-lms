// src/shared/live/liveTypes.ts

export type LiveSessionStatus = "scheduled" | "live" | "ended";
export type ParticipantRole = "admin" | "instructor" | "student";
export type ParticipantMediaState = {
  audio: boolean;
  video: boolean;
  screen: boolean;
  hand: boolean;
};

export interface LiveParticipant {
  id: string;
  name: string;
  avatar?: string;
  avatarBg: string;
  role: ParticipantRole;
  media: ParticipantMediaState;
  joinedAt: string;
  isSpeaking?: boolean;
  isPinned?: boolean;
}

export interface LiveSession {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  courseName: string;
  courseIcon: string;
  courseColor: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  instructorAvatarBg: string;
  scheduledAt: string;         // ISO string
  durationMinutes: number;
  status: LiveSessionStatus;
  enrolledCount: number;
  joinedCount: number;
  recordingEnabled: boolean;
  createdBy: "admin" | "instructor";
}

export interface LiveChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarBg: string;
  senderRole: ParticipantRole;
  text: string;
  createdAt: string;
  reactions: { emoji: string; count: number; reactedByMe: boolean }[];
}

export interface PollOption { id: string; text: string; votes: number; votedByMe: boolean }
export interface LivePoll {
  id: string;
  question: string;
  options: PollOption[];
  isOpen: boolean;
  createdAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_SESSIONS: LiveSession[] = [
  {
    id: "sess-1",
    title: "React Hooks Deep Dive — Live Q&A",
    description: "We'll cover useCallback, useMemo, custom hooks, and answer all your questions live.",
    courseId: "c-1",
    courseName: "React Bootcamp",
    courseIcon: "⚛️",
    courseColor: "from-blue-600 to-cyan-500",
    instructorId: "inst-1",
    instructorName: "Dr. Amara Nwosu",
    instructorAvatarBg: "bg-violet-600",
    scheduledAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 min from now
    durationMinutes: 90,
    status: "scheduled",
    enrolledCount: 84,
    joinedCount: 0,
    recordingEnabled: true,
    createdBy: "instructor",
  },
  {
    id: "sess-2",
    title: "TypeScript Generics Masterclass",
    description: "Live coding session — build a type-safe API client from scratch.",
    courseId: "c-2",
    courseName: "TypeScript Mastery",
    courseIcon: "🔷",
    courseColor: "from-blue-700 to-indigo-600",
    instructorId: "inst-2",
    instructorName: "Kofi Mensah",
    instructorAvatarBg: "bg-emerald-600",
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2h from now
    durationMinutes: 60,
    status: "scheduled",
    enrolledCount: 62,
    joinedCount: 0,
    recordingEnabled: true,
    createdBy: "admin",
  },
  {
    id: "sess-3",
    title: "Node.js Performance Tuning",
    description: "Profiling, clustering, caching strategies — all live.",
    courseId: "c-3",
    courseName: "Node.js Masterclass",
    courseIcon: "🟢",
    courseColor: "from-emerald-600 to-teal-500",
    instructorId: "inst-3",
    instructorName: "Sarah Okafor",
    instructorAvatarBg: "bg-pink-600",
    scheduledAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // started 30 min ago
    durationMinutes: 120,
    status: "live",
    enrolledCount: 110,
    joinedCount: 47,
    recordingEnabled: true,
    createdBy: "admin",
  },
];

export const MOCK_PARTICIPANTS: LiveParticipant[] = [
  {
    id: "me",
    name: "You",
    avatarBg: "bg-blue-600",
    role: "student",
    media: { audio: true, video: true, screen: false, hand: false },
    joinedAt: new Date().toISOString(),
    isSpeaking: false,
  },
  {
    id: "inst-1",
    name: "Dr. Amara Nwosu",
    avatarBg: "bg-violet-600",
    role: "instructor",
    media: { audio: true, video: true, screen: false, hand: false },
    joinedAt: new Date().toISOString(),
    isSpeaking: true,
    isPinned: true,
  },
  {
    id: "s-2",
    name: "Kofi A.",
    avatarBg: "bg-emerald-600",
    role: "student",
    media: { audio: false, video: true, screen: false, hand: true },
    joinedAt: new Date().toISOString(),
  },
  {
    id: "s-3",
    name: "Zara M.",
    avatarBg: "bg-pink-600",
    role: "student",
    media: { audio: true, video: false, screen: false, hand: false },
    joinedAt: new Date().toISOString(),
  },
  {
    id: "s-4",
    name: "Emeka O.",
    avatarBg: "bg-amber-600",
    role: "student",
    media: { audio: false, video: false, screen: false, hand: false },
    joinedAt: new Date().toISOString(),
  },
  {
    id: "s-5",
    name: "Priya K.",
    avatarBg: "bg-cyan-600",
    role: "student",
    media: { audio: true, video: true, screen: false, hand: false },
    joinedAt: new Date().toISOString(),
    isSpeaking: false,
  },
];

export const MOCK_LIVE_CHAT: LiveChatMessage[] = [
  {
    id: "lc-1", senderId: "inst-1", senderName: "Dr. Amara Nwosu",
    senderAvatarBg: "bg-violet-600", senderRole: "instructor",
    text: "Welcome everyone! We'll start in just a moment. Feel free to drop questions in the chat.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), reactions: [],
  },
  {
    id: "lc-2", senderId: "s-2", senderName: "Kofi A.",
    senderAvatarBg: "bg-emerald-600", senderRole: "student",
    text: "Can we cover useCallback vs useMemo differences today?",
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    reactions: [{ emoji: "👍", count: 4, reactedByMe: false }],
  },
  {
    id: "lc-3", senderId: "inst-1", senderName: "Dr. Amara Nwosu",
    senderAvatarBg: "bg-violet-600", senderRole: "instructor",
    text: "Absolutely Kofi! That's on the agenda 🎯",
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(), reactions: [],
  },
  {
    id: "lc-4", senderId: "me", senderName: "You",
    senderAvatarBg: "bg-blue-600", senderRole: "student",
    text: "Looking forward to the custom hooks section!",
    createdAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    reactions: [{ emoji: "🔥", count: 2, reactedByMe: false }],
  },
];

export const MOCK_POLL: LivePoll = {
  id: "poll-1",
  question: "Which hook do you find most confusing?",
  options: [
    { id: "o1", text: "useCallback", votes: 14, votedByMe: false },
    { id: "o2", text: "useMemo", votes: 9, votedByMe: false },
    { id: "o3", text: "useReducer", votes: 11, votedByMe: false },
    { id: "o4", text: "useRef", votes: 5, votedByMe: false },
  ],
  isOpen: true,
  createdAt: new Date().toISOString(),
};

// ─── Recordings mock ──────────────────────────────────────────────────────────

export interface Recording {
  id: string;
  sessionTitle: string;
  courseName: string;
  courseIcon: string;
  courseColor: string;
  instructorName: string;
  recordedAt: string;
  durationMinutes: number;
  viewCount: number;
  thumbnailGradient: string;
}

export const MOCK_RECORDINGS: Recording[] = [
  {
    id: "rec-1", sessionTitle: "React Hooks Deep Dive — Part 1",
    courseName: "React Bootcamp", courseIcon: "⚛️", courseColor: "from-blue-600 to-cyan-500",
    instructorName: "Dr. Amara Nwosu", recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    durationMinutes: 87, viewCount: 42, thumbnailGradient: "from-blue-900 via-[#060d18] to-cyan-900",
  },
  {
    id: "rec-2", sessionTitle: "TypeScript Utility Types Workshop",
    courseName: "TypeScript Mastery", courseIcon: "🔷", courseColor: "from-blue-700 to-indigo-600",
    instructorName: "Kofi Mensah", recordedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    durationMinutes: 62, viewCount: 28, thumbnailGradient: "from-indigo-900 via-[#060d18] to-blue-900",
  },
  {
    id: "rec-3", sessionTitle: "Node.js Streams Explained",
    courseName: "Node.js Masterclass", courseIcon: "🟢", courseColor: "from-emerald-600 to-teal-500",
    instructorName: "Sarah Okafor", recordedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    durationMinutes: 114, viewCount: 67, thumbnailGradient: "from-emerald-900 via-[#060d18] to-teal-900",
  },
];