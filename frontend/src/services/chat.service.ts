import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export type RoomType = "CLASSROOM" | "GROUP";

export type MessageReaction =
  | "THUMBS_UP"
  | "LOVE"
  | "FIRE"
  | "CONFETTI"
  | "LAUGH"
  | "WOW"
  | "PRAY"
  | "HUNDRED";

export const REACTION_EMOJI: Record<MessageReaction, string> = {
  THUMBS_UP: "👍",
  LOVE:      "❤️",
  FIRE:      "🔥",
  CONFETTI:  "🎉",
  LAUGH:     "😂",
  WOW:       "😮",
  PRAY:      "🙏",
  HUNDRED:   "💯",
};

export interface RoomSummaryItem {
  id: string;
  type: RoomType;
  name: string;
  description: string | null;
  courseId: string | null;
  totalMessages: number;
  memberCount: number;
  grade: { score: number; resolvedGrade: number } | null;
}

export interface PaginatedRooms {
  data: RoomSummaryItem[];
  meta: { total: number; page: number; limit: number };
}

export interface RoomMember {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  joinedAt: string;
  isActive: boolean;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface ReactionEntry {
  reaction: MessageReaction;
  userIds: string[];
}

export interface ReplyPreview {
  id: string;
  senderName: string;
  content: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderImage: string | null;
  senderIsElevated: boolean;
  senderPlatformRole: string;
  content: string | null;
  replyToId: string | null;
  replyToPreview: ReplyPreview | null;
  attachments: MessageAttachment[];
  reactions: ReactionEntry[];
  mentionedUserIds: string[];
  isDeleted: boolean;
  deletedLabel: string | null;
  isPinned: boolean;
  createdAt: string;
}

export interface PaginatedMessages {
  data: ChatMessage[];
  meta: { total: number; page: number; limit: number };
}

export interface RoomDetail {
  id: string;
  type: RoomType;
  name: string;
  description: string | null;
  courseId: string | null;
  totalMessages: number;
  memberCount: number;
  members: RoomMember[];
  pinnedMessages: ChatMessage[];
  grade: RoomGrade | null;
}

export interface RoomGrade {
  id: string;
  roomId: string;
  score: number;
  resolvedGrade: number;
  feedback: string | null;
  strengths: string | null;
  improvements: string | null;
  rubricItems: { id: string; label: string; score: number; maxScore: number }[];
  gradedBy: string;
  gradedAt: string;
}

export interface SendMessagePayload {
  content: string;
  replyToId?: string;
  mentionedUserIds?: string[];
  attachments?: {
    key: string;
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
  }[];
}

// ==================== SERVICE ====================

export default class ChatService {
  // ─── ROOMS ───────────────────────────────────────────────────────────────────

  static async getRooms(params?: {
    type?: RoomType;
    courseId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedRooms> {
    const p = new URLSearchParams();
    if (params?.type)     p.append("type",     params.type);
    if (params?.courseId) p.append("courseId", params.courseId);
    if (params?.page)     p.append("page",     String(params.page));
    if (params?.limit)    p.append("limit",    String(params.limit));
    const qs = p.toString();
    const res = await APIConfig.fetch(`/chat/rooms${qs ? `?${qs}` : ""}`);
    return res.json();
  }

  static async getRoomSummary(roomId: string): Promise<RoomDetail> {
    const res = await APIConfig.fetch(`/chat/rooms/${roomId}/summary`);
    return res.json();
  }

  // ─── MESSAGES ────────────────────────────────────────────────────────────────

  static async getMessages(
    roomId: string,
    params?: { page?: number; limit?: number; before?: string }
  ): Promise<PaginatedMessages> {
    const p = new URLSearchParams();
    if (params?.page)   p.append("page",   String(params.page));
    if (params?.limit)  p.append("limit",  String(params.limit));
    if (params?.before) p.append("before", params.before);
    const qs = p.toString();
    const res = await APIConfig.fetch(`/chat/rooms/${roomId}/messages${qs ? `?${qs}` : ""}`);
    return res.json();
  }

  static async sendMessage(
    roomId: string,
    payload: SendMessagePayload
  ): Promise<ChatMessage> {
    const res = await APIConfig.fetch(`/chat/rooms/${roomId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  static async deleteMessage(roomId: string, messageId: string): Promise<void> {
    await APIConfig.fetch(`/chat/rooms/${roomId}/messages/${messageId}`, {
      method: "DELETE",
    });
  }

  static async reactToMessage(
    roomId: string,
    messageId: string,
    reaction: MessageReaction
  ): Promise<{ toggled: "added" | "removed" }> {
    const res = await APIConfig.fetch(
      `/chat/rooms/${roomId}/messages/${messageId}/react`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      }
    );
    return res.json();
  }

  // ─── PIN / UNPIN (instructor/admin) ──────────────────────────────────────────

  static async pinMessage(roomId: string, messageId: string): Promise<unknown> {
    const res = await APIConfig.fetch(`/chat/rooms/${roomId}/messages/${messageId}/pin`, { method: "POST" });
    return res.json();
  }

  static async unpinMessage(roomId: string, messageId: string): Promise<void> {
    await APIConfig.fetch(`/chat/rooms/${roomId}/messages/${messageId}/pin`, { method: "DELETE" });
  }

  // ─── CREATE ROOMS (instructor/admin) ─────────────────────────────────────────

  static async createClassroom(payload: {
    name: string;
    description?: string;
    courseId?: string;
    studentUserIds?: string[];
  }): Promise<unknown> {
    const res = await APIConfig.fetch("/chat/rooms/classroom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  static async createGroup(payload: {
    name: string;
    description?: string;
    courseId?: string;
    memberUserIds?: string[];
    groupAdminUserIds?: string[];
  }): Promise<unknown> {
    const res = await APIConfig.fetch("/chat/rooms/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  // ─── GRADE (instructor) ───────────────────────────────────────────────────────

  static async gradeRoom(
    roomId: string,
    payload: {
      score: number;
      feedback?: string;
      strengths?: string;
      improvements?: string;
      rubricItems?: { label: string; score: number; maxScore: number }[];
    }
  ): Promise<RoomGrade> {
    const res = await APIConfig.fetch(`/chat/rooms/${roomId}/grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  static async getRoomGrade(roomId: string): Promise<RoomGrade> {
    const res = await APIConfig.fetch(`/chat/rooms/${roomId}/grade`);
    return res.json();
  }
}