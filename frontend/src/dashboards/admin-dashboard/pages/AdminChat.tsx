// src/dashboards/admin-dashboard/pages/AdminChat.tsx
// Admin chat — sees ALL rooms platform-wide, can create classrooms, pin/delete any message
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash, Users, Info, ChevronDown, MessageSquare, Plus, Shield,
  Loader2, AlertCircle, Pin, X, Send, Reply, Smile, Download,
  Paperclip, Image as ImageIcon, Film, FileText, CheckCircle2,
  Search,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ChatService, {
  type RoomSummaryItem, type ChatMessage, type RoomDetail,
  type MessageReaction, REACTION_EMOJI,
} from "@/services/chat.service";
import UserService, { UserRole } from "@/services/user.service";
import CoursesService from "@/services/course.service";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { APIConfig } from "@/lib/api.config";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ROOM_GRADIENTS_CLASSROOM = [
  "from-rose-500 to-pink-600",
  "from-red-500 to-rose-600",
  "from-orange-500 to-red-500",
  "from-pink-500 to-fuchsia-600",
];
const ROOM_GRADIENTS_GROUP = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
];

function roomGradient(type: string, index: number): string {
  const arr = type === "CLASSROOM" ? ROOM_GRADIENTS_CLASSROOM : ROOM_GRADIENTS_GROUP;
  return arr[index % arr.length];
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      {children}
    </motion.div>
  );
}

// ─── File upload ──────────────────────────────────────────────────────────────

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />;
  if (mimeType.startsWith("video/")) return <Film className="w-3.5 h-3.5 text-blue-500" />;
  if (mimeType === "application/pdf") return <FileText className="w-3.5 h-3.5 text-rose-500" />;
  return <Paperclip className="w-3.5 h-3.5 text-gray-400" />;
}

interface PendingFile {
  file: File;
  preview?: string;
  uploading: boolean;
  error?: string;
  result?: { key: string; url: string; fileName: string; mimeType: string; size: number };
}

async function uploadChatFile(file: File): Promise<{ key: string; url: string; fileName: string; mimeType: string; size: number }> {
  const res = await APIConfig.fetch("/storage/presigned-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "chat-attachments", fileName: file.name, contentType: file.type, contentLength: file.size }),
  });
  const { uploadUrl, key, publicUrl } = await res.json();
  await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  return { key, url: publicUrl, fileName: file.name, mimeType: file.type, size: file.size };
}

// ─── Room List Card ───────────────────────────────────────────────────────────

function RoomCard({ room, index, onClick }: { room: RoomSummaryItem; index: number; onClick: () => void }) {
  const gradient = roomGradient(room.type, index);
  return (
    <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.99 }} onClick={onClick} className="cursor-pointer">
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
            {room.type === "CLASSROOM" ? "🏫" : "👥"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{room.name}</h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 flex-shrink-0">
                {room.type === "CLASSROOM" ? "Classroom" : "Group"}
              </span>
              {room.grade && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                  {room.grade.resolvedGrade}%
                </span>
              )}
            </div>
            {room.description && <p className="text-xs text-gray-400 truncate mt-0.5">{room.description}</p>}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{room.memberCount}</span>
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{room.totalMessages}</span>
            </div>
          </div>
          <ChevronDown className="-rotate-90 w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Emoji Picker ─────────────────────────────────────────────────────────────

const REACTIONS = Object.entries(REACTION_EMOJI) as [MessageReaction, string][];

function EmojiPicker({ onPick, onClose }: { onPick: (r: MessageReaction) => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.12 }}
      className="absolute bottom-full mb-1 right-0 z-30 flex gap-1 p-2 rounded-2xl bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] shadow-xl">
      {REACTIONS.map(([key, emoji]) => (
        <button key={key} onClick={() => { onPick(key); onClose(); }} className="text-lg hover:scale-125 transition-transform" title={key}>
          {emoji}
        </button>
      ))}
    </motion.div>
  );
}

// ─── Message Bubble (admin: can pin + delete any) ─────────────────────────────

function MessageBubble({
  msg, isMe, prevSenderId, currentUserId,
  onReply, onReact, onDelete, onPin,
}: {
  msg: ChatMessage; isMe: boolean; prevSenderId?: string; currentUserId: string;
  onReply: (m: ChatMessage) => void;
  onReact: (msgId: string, reaction: MessageReaction) => void;
  onDelete: (msgId: string) => void;
  onPin: (msgId: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const isGrouped = prevSenderId === msg.senderId;

  if (msg.isDeleted) {
    return (
      <div className="px-4 py-1">
        <span className="text-xs text-gray-400 italic">{msg.deletedLabel ?? "Message deleted"}</span>
      </div>
    );
  }

  const isSending = (msg as any)._sending === true;
  const isFailed  = (msg as any)._failed  === true;

  const initials = msg.senderName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      className={`group relative flex gap-3 px-4 ${isGrouped ? "mt-0.5" : "mt-4"} hover:bg-gray-50/60 dark:hover:bg-white/[0.02] rounded-xl transition-colors`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmoji(false); }}>

      <div className="w-9 flex-shrink-0 flex flex-col items-center pt-0.5">
        {!isGrouped ? (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-xs font-black overflow-hidden">
            {msg.senderImage ? <img src={msg.senderImage} alt="" className="w-full h-full object-cover" /> : initials}
          </div>
        ) : (
          <span className="text-[10px] text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 mt-1 w-9 text-center tabular-nums">
            {formatTime(msg.createdAt)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {!isGrouped && (
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${isMe ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-white"}`}>
              {msg.senderName}
            </span>
            {msg.senderIsElevated && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                {msg.senderPlatformRole}
              </span>
            )}
            <span className="text-[10px] text-gray-400">{timeAgo(msg.createdAt)}</span>
            {msg.isPinned && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-semibold">
                <Pin className="w-3 h-3" />Pinned
              </span>
            )}
          </div>
        )}

        {msg.replyToPreview && (
          <div className="mb-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border-l-[3px] border-rose-400 dark:border-rose-500">
            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-0.5">{msg.replyToPreview.senderName}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{msg.replyToPreview.content ?? "Message deleted"}</p>
          </div>
        )}

        {msg.content && (
          <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isSending ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"}`}>
            {msg.content}
          </p>
        )}

        {(isSending || isFailed) && (
          <div className={`flex items-center gap-1 mt-1 text-[10px] ${isFailed ? "text-rose-500" : "text-gray-400"}`}>
            {isSending && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
            {isSending ? "Sending…" : ((msg as any)._failReason ?? "Failed to send")}
          </div>
        )}

        {msg.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {msg.attachments.map((att) => (
              <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors max-w-[220px]">
                <Download className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{att.fileName}</p>
                  <p className="text-[10px] text-gray-400">{(att.size / 1024).toFixed(0)} KB</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {msg.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.reactions.map((r) => {
              const hasMe = r.userIds.includes(currentUserId);
              return (
                <button key={r.reaction} onClick={() => onReact(msg.id, r.reaction)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${hasMe ? "bg-rose-50 border-rose-300 dark:bg-rose-900/30 dark:border-rose-700" : "bg-gray-50 border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.08]"}`}>
                  <span>{REACTION_EMOJI[r.reaction]}</span>
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">{r.userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.1 }}
            className="absolute right-4 -top-4 flex items-center gap-0.5 px-2 py-1 rounded-xl bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] shadow-lg z-20">
            <button onClick={() => onReply(msg)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all" title="Reply">
              <Reply className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <button onClick={() => setShowEmoji((p) => !p)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" title="React">
                <Smile className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {showEmoji && <EmojiPicker onPick={(r) => onReact(msg.id, r)} onClose={() => setShowEmoji(false)} />}
              </AnimatePresence>
            </div>
            <button onClick={() => onPin(msg.id)}
              className={`p-1.5 rounded-lg transition-all ${msg.isPinned ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20" : "text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"}`}
              title={msg.isPinned ? "Unpin" : "Pin"}>
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(msg.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all" title="Delete">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Message Input ────────────────────────────────────────────────────────────

function MessageInput({
  replyTo, onCancelReply, onSend, disabled,
}: {
  replyTo: ChatMessage | null;
  onCancelReply: () => void;
  onSend: (content: string, attachments?: { key: string; url: string; fileName: string; mimeType: string; size: number }[]) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSend = (text.trim().length > 0 || pendingFiles.length > 0) && !disabled && !isUploading;

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles: PendingFile[] = Array.from(files).map((f) => ({
      file: f, preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined, uploading: true,
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
    setIsUploading(true);
    const results = await Promise.allSettled(newFiles.map((pf) => uploadChatFile(pf.file)));
    setPendingFiles((prev) => {
      const updated = [...prev];
      const startIdx = updated.length - newFiles.length;
      results.forEach((r, i) => {
        const idx = startIdx + i;
        if (r.status === "fulfilled") updated[idx] = { ...updated[idx], uploading: false, result: r.value };
        else updated[idx] = { ...updated[idx], uploading: false, error: "Upload failed" };
      });
      return updated;
    });
    setIsUploading(false);
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => {
      const f = prev[index];
      if (f.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const submit = () => {
    if (!canSend) return;
    const attachments = pendingFiles.filter((f) => f.result).map((f) => f.result!);
    onSend(text.trim(), attachments.length > 0 ? attachments : undefined);
    setText(""); setPendingFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "42px";
  };

  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0f1623] flex-shrink-0">
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30">
          <Reply className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-rose-600">{replyTo.senderName}</p>
            <p className="text-xs text-gray-500 truncate">{replyTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {pendingFiles.map((pf, i) => (
            <div key={i} className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] max-w-[180px]">
              {pf.preview
                ? <img src={pf.preview} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                : <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0">{getFileIcon(pf.file.type)}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{pf.file.name}</p>
                <p className="text-[10px] text-gray-400">
                  {pf.uploading ? <span className="flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 animate-spin" />Uploading…</span>
                    : pf.error ? <span className="text-rose-500">{pf.error}</span>
                    : `${(pf.file.size / 1024).toFixed(0)} KB`}
                </p>
              </div>
              <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-rose-500 transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button onClick={() => fileRef.current?.click()} disabled={disabled}
          className="p-2.5 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex-shrink-0 disabled:opacity-40" title="Attach file">
          <Paperclip className="w-4 h-4" />
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
          className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        <textarea ref={textareaRef} value={text}
          onChange={(e) => { setText(e.target.value); const el = e.target; el.style.height = "42px"; el.style.height = `${Math.min(el.scrollHeight, 128)}px`; }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Type a message… (Enter to send)"
          disabled={disabled}
          className="flex-1 px-4 py-2.5 rounded-2xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none transition-all disabled:opacity-50"
          style={{ minHeight: "42px", maxHeight: "128px" }} />
        <button onClick={submit} disabled={!canSend}
          className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md">
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Room Detail Panel ────────────────────────────────────────────────────────

function RoomDetailPanel({ detail, gradient, onClose }: { detail: RoomDetail; gradient: string; onClose: () => void }) {
  const [tab, setTab] = useState<"info" | "members" | "pinned" | "grade">("info");
  const tabs = [
    { id: "info",    label: "Info" },
    { id: "members", label: `Members (${detail.memberCount})` },
    { id: "pinned",  label: `Pinned (${detail.pinnedMessages.length})` },
    ...(detail.type === "GROUP" && detail.grade ? [{ id: "grade", label: "Grade" }] : []),
  ] as const;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden max-h-[85vh] flex flex-col">

        <div className={`px-6 py-5 bg-gradient-to-br ${gradient} relative`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"><X className="w-4 h-4" /></button>
          <div className="flex items-center gap-3 relative">
            <span className="text-4xl">{detail.type === "CLASSROOM" ? "🏫" : "👥"}</span>
            <div>
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{detail.type}</span>
              <h2 className="text-xl font-black text-white">{detail.name}</h2>
              {detail.description && <p className="text-white/70 text-xs mt-0.5">{detail.description}</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-1 p-2 border-b border-gray-100 dark:border-white/[0.07] bg-gray-50/60 dark:bg-white/[0.02]">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === t.id ? "bg-white dark:bg-[#0f1623] shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {tab === "info" && (
            <div className="grid grid-cols-3 gap-3 text-center">
              {[{ label: "Messages", value: detail.totalMessages }, { label: "Members", value: detail.memberCount }, { label: "Pinned", value: detail.pinnedMessages.length }].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                  <p className="font-black text-gray-900 dark:text-white text-lg">{value}</p>
                  <p className="text-[11px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "members" && (
            <div className="space-y-2">
              {detail.members.map((m) => {
                const initials = m.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div key={m.userId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-xs font-black overflow-hidden flex-shrink-0">
                      {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" /> : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.name}</p>
                      <p className="text-xs text-gray-400 truncate">{m.email}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400">{m.role}</span>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "pinned" && (
            <div className="space-y-3">
              {detail.pinnedMessages.length === 0
                ? <p className="text-sm text-gray-400 text-center py-8">No pinned messages</p>
                : detail.pinnedMessages.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Pin className="w-3 h-3 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{msg.senderName}</span>
                      <span className="text-[10px] text-gray-400">{timeAgo(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{msg.content}</p>
                  </div>
                ))
              }
            </div>
          )}

          {tab === "grade" && detail.grade && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                <div className="text-4xl font-black text-gray-900 dark:text-white">{detail.grade.resolvedGrade}%</div>
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Score: {detail.grade.score}</p>
                  <p className="text-xs text-gray-400">Graded {timeAgo(detail.grade.gradedAt)}</p>
                </div>
              </div>
              {detail.grade.feedback && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Feedback</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{detail.grade.feedback}</p>
                </div>
              )}
              {detail.grade.rubricItems.length > 0 && (
                <div className="space-y-3">
                  {detail.grade.rubricItems.map((r) => {
                    const pct = Math.round((r.score / r.maxScore) * 100);
                    return (
                      <div key={r.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">{r.label}</span>
                          <span className="font-bold text-gray-900 dark:text-white">{r.score}/{r.maxScore}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── User picker sub-component ────────────────────────────────────────────────

interface PickableUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

function UserPicker({
  users, selected, onToggle, loading, placeholder, accentColor,
}: {
  users: PickableUser[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  loading: boolean;
  placeholder: string;
  accentColor: "rose" | "blue";
}) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  const ring = accentColor === "rose" ? "bg-rose-600 border-rose-600" : "bg-blue-600 border-blue-600";
  const selectedBg = accentColor === "rose" ? "bg-rose-50 dark:bg-rose-900/20" : "bg-blue-50 dark:bg-blue-900/20";

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04]">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="px-3.5 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-sm text-gray-400 text-center">
        {placeholder}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
      {users.length > 4 && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-white/[0.06]">
          <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="flex-1 text-sm bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none" />
        </div>
      )}
      <div className="max-h-44 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
        {filtered.length === 0 ? (
          <p className="px-3.5 py-3 text-sm text-gray-400 text-center">No results</p>
        ) : (
          filtered.map((u) => {
            const isSelected = selected.has(u.id);
            const initials = u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <button key={u.id} onClick={() => onToggle(u.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${isSelected ? selectedBg : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"}`}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-black overflow-hidden flex-shrink-0">
                  {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? ring : "border-gray-300 dark:border-white/[0.2]"}`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Create Classroom Panel (slide-in from right) ─────────────────────────────

function CreateClassroomPanel({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<Set<string>>(new Set());
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch published courses for the dropdown
  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ["admin-courses-dropdown"],
    queryFn: async () => {
      const res = await CoursesService.findAll({ limit: 100, sortBy: "title", sortOrder: "asc" }) as any;
      return (res?.items ?? []) as { id: string; title: string }[];
    },
  });
  const courses = coursesData ?? [];

  // Fetch instructors
  const { data: instructorData, isLoading: loadingInstructors } = useQuery({
    queryKey: ["users-instructors"],
    queryFn: async () => {
      const res = await UserService.findAll({ role: UserRole.INSTRUCTOR, limit: 100 }) as any;
      return (res?.data ?? res?.items ?? []) as PickableUser[];
    },
    enabled: step >= 2,
  });

  // Fetch students
  const { data: studentData, isLoading: loadingStudents } = useQuery({
    queryKey: ["users-students"],
    queryFn: async () => {
      const res = await UserService.findAll({ role: UserRole.STUDENT, limit: 100 }) as any;
      return (res?.data ?? res?.items ?? []) as PickableUser[];
    },
    enabled: step >= 3,
  });

  const instructors = instructorData ?? [];
  const students = studentData ?? [];

  const createMutation = useMutation({
    mutationFn: () => {
      if (!name.trim()) throw new Error("Classroom name is required");
      if (selectedInstructors.size === 0) throw new Error("Assign at least 1 instructor");
      if (selectedStudents.size === 0) throw new Error("Add at least 1 student");
      return ChatService.createClassroom({
        name: name.trim(),
        description: description.trim() || undefined,
        courseId: courseId || undefined,
        studentUserIds: Array.from(selectedStudents),
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
      setTimeout(() => { onCreated(); onClose(); }, 1800);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create classroom.");
    },
  });

  const stepLabels = ["Details", "Instructors", "Students"];
  const canNext =
    step === 1 ? name.trim().length > 0 :
    step === 2 ? selectedInstructors.size > 0 :
    selectedStudents.size > 0;

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0f1623] border-l border-gray-100 dark:border-white/[0.08] shadow-2xl z-50 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-500" />
          <div>
            <h2 className="font-black text-gray-900 dark:text-white">Create Classroom</h2>
            <p className="text-xs text-gray-400 mt-0.5">Assign instructors and enroll students</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step indicator */}
      {!success && (
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-white/[0.07] flex-shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? "bg-rose-600 text-white" : "bg-gray-100 dark:bg-white/[0.07] text-gray-400"}`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-8 rounded transition-all ${step > s ? "bg-rose-600" : "bg-gray-200 dark:bg-white/[0.07]"}`} />}
            </div>
          ))}
          <span className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400">{stepLabels[step - 1]}</span>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {success ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-black text-gray-900 dark:text-white text-xl">Classroom created!</p>
            <p className="text-sm text-gray-400">
              {selectedInstructors.size} instructor{selectedInstructors.size !== 1 ? "s" : ""} assigned · {selectedStudents.size} student{selectedStudents.size !== 1 ? "s" : ""} enrolled
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* STEP 1: Details */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                    Classroom Name <span className="text-rose-500">*</span>
                  </label>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Advanced TypeScript — Cohort 3"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                    Description <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    placeholder="Describe this classroom…"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                    Linked Course <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  {loadingCourses ? (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04]">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-400">Loading courses…</span>
                    </div>
                  ) : (
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    >
                      <option value="">— No linked course —</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  )}
                  {courseId && (
                    <p className="text-[11px] text-gray-400 mt-1 font-mono truncate">{courseId}</p>
                  )}
                </div>
              </>
            )}

            {/* STEP 2: Instructors */}
            {step === 2 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Select instructors to assign <span className="text-rose-500">*</span>
                  </p>
                  {selectedInstructors.size > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
                      {selectedInstructors.size} selected
                    </span>
                  )}
                </div>
                <UserPicker
                  users={instructors}
                  selected={selectedInstructors}
                  onToggle={(id) => setSelectedInstructors((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                  loading={loadingInstructors}
                  placeholder="No instructors found"
                  accentColor="rose"
                />
              </>
            )}

            {/* STEP 3: Students */}
            {step === 3 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Enroll students <span className="text-rose-500">*</span>
                  </p>
                  <div className="flex items-center gap-2">
                    {selectedStudents.size > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
                        {selectedStudents.size} selected
                      </span>
                    )}
                    {students.length > 0 && (
                      <button
                        onClick={() => setSelectedStudents(
                          selectedStudents.size === students.length
                            ? new Set()
                            : new Set(students.map((s) => s.id))
                        )}
                        className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        {selectedStudents.size === students.length ? "Deselect all" : "Select all"}
                      </button>
                    )}
                  </div>
                </div>
                <UserPicker
                  users={students}
                  selected={selectedStudents}
                  onToggle={(id) => setSelectedStudents((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                  loading={loadingStudents}
                  placeholder="No students found"
                  accentColor="rose"
                />
              </>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 text-sm text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!success && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.07] flex gap-3 flex-shrink-0">
          {step > 1 && (
            <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep((s) => (s + 1) as 2 | 3)} disabled={!canNext}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-rose-600 to-pink-700 hover:opacity-90 disabled:opacity-40 transition-all shadow-md">
              Next →
            </button>
          ) : (
            <button onClick={() => createMutation.mutate()} disabled={!canNext || createMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-rose-600 to-pink-700 hover:opacity-90 disabled:opacity-40 transition-all shadow-md">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Classroom
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Chat View ────────────────────────────────────────────────────────────────

function ChatView({
  room, roomIndex, currentUserId, onBack,
}: {
  room: RoomSummaryItem; roomIndex: number; currentUserId: string; onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const gradient = roomGradient(room.type, roomIndex);

  const { isLoading: loadingMsgs, isError: msgsError, error: msgsErrorObj } = useQuery({
    queryKey: ["chat-messages", room.id],
    queryFn: async () => {
      const res = await ChatService.getMessages(room.id, { limit: 50 });
      setMessages([...res.data].reverse());
      return res;
    },
    retry: false, // don't retry 403s
  });

  const { data: roomDetail } = useQuery({
    queryKey: ["chat-room-detail", room.id],
    queryFn: () => ChatService.getRoomSummary(room.id),
    enabled: showDetail,
  });

  // ── Socket ────────────────────────────────────────────────────────────────

  const { joinRoom, leaveRoom } = useChatSocket({
    onMessageNew: useCallback((msg: ChatMessage) => {
      if (msg.roomId !== room.id) return;
      setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
    }, [room.id]),

    onMessageDeleted: useCallback((payload: import("@/hooks/useChatSocket").MessageDeletedPayload) => {
      const { messageId, deletedLabel } = payload;
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, isDeleted: true, content: null, deletedLabel } : m));
    }, []),

    onMessageReacted: useCallback((payload: import("@/hooks/useChatSocket").MessageReactedPayload) => {
      const { messageId, reaction, userId, toggled } = payload;
      setMessages((prev) => prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find((r) => r.reaction === reaction);
        let reactions = m.reactions;
        if (toggled === "added") {
          if (existing) reactions = reactions.map((r) => r.reaction === reaction ? { ...r, userIds: [...r.userIds, userId] } : r);
          else reactions = [...reactions, { reaction, userIds: [userId] }];
        } else {
          reactions = reactions.map((r) => r.reaction === reaction ? { ...r, userIds: r.userIds.filter((id) => id !== userId) } : r).filter((r) => r.userIds.length > 0);
        }
        return { ...m, reactions };
      }));
    }, []),

    onMessagePinned: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["chat-room-detail", room.id] });
      ChatService.getMessages(room.id, { limit: 50 }).then((res) => setMessages([...res.data].reverse()));
    }, [room.id, queryClient]),
  });

  useEffect(() => { joinRoom(room.id); return () => leaveRoom(room.id); }, [room.id, joinRoom, leaveRoom]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const sendMutation = useMutation({
    mutationFn: ({ content, attachments }: { content: string; attachments?: { key: string; url: string; fileName: string; mimeType: string; size: number }[] }) =>
      ChatService.sendMessage(room.id, { content, replyToId: replyTo?.id, attachments }),
    onMutate: ({ content, attachments }) => {
      setIsSending(true);
      const tempId = `temp-${Date.now()}`;
      const optimistic: ChatMessage & { _tempId: string; _sending: boolean } = {
        _tempId: tempId, _sending: true,
        id: tempId, roomId: room.id,
        senderId: currentUserId, senderName: "You",
        senderImage: null, senderIsElevated: true, senderPlatformRole: "ADMIN",
        content, replyToId: replyTo?.id ?? null,
        replyToPreview: replyTo ? { id: replyTo.id, senderName: replyTo.senderName, content: replyTo.content } : null,
        attachments: (attachments ?? []).map((a, i) => ({ id: `temp-att-${i}`, fileName: a.fileName, url: a.url, mimeType: a.mimeType, size: a.size })),
        reactions: [], mentionedUserIds: [],
        isDeleted: false, deletedLabel: null, isPinned: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      return { tempId };
    },
    onSuccess: (msg, _vars, ctx) => {
      setMessages((prev) => prev.map((m) => m.id === (ctx as any)?.tempId ? msg : m));
    },
    onError: (err: Error, _vars, ctx) => {
      const is403 = (err as any)?.code === "HTTP_403";
      setMessages((prev) => prev.map((m) =>
        m.id === (ctx as any)?.tempId
          ? { ...m, _failed: true, _sending: false, _failReason: is403 ? "Not a member of this room" : "Failed to send" } as any
          : m
      ));
    },
    onSettled: () => setIsSending(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => ChatService.deleteMessage(room.id, messageId),
    onMutate: (messageId) => setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, isDeleted: true, content: null } : m)),
  });

  const reactMutation = useMutation({
    mutationFn: ({ messageId, reaction }: { messageId: string; reaction: MessageReaction }) =>
      ChatService.reactToMessage(room.id, messageId, reaction),
  });

  const handleReact = (msgId: string, reaction: MessageReaction) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const existing = m.reactions.find((r) => r.reaction === reaction);
        const alreadyReacted = existing?.userIds.includes(currentUserId);
        let reactions = m.reactions;
        if (alreadyReacted) {
          reactions = reactions
            .map((r) => r.reaction === reaction ? { ...r, userIds: r.userIds.filter((id) => id !== currentUserId) } : r)
            .filter((r) => r.userIds.length > 0);
        } else if (existing) {
          reactions = reactions.map((r) => r.reaction === reaction ? { ...r, userIds: [...r.userIds, currentUserId] } : r);
        } else {
          reactions = [...reactions, { reaction, userIds: [currentUserId] }];
        }
        return { ...m, reactions };
      })
    );
    reactMutation.mutate({ messageId: msgId, reaction });
  };

  const pinMutation = useMutation({
    mutationFn: ({ messageId, isPinned }: { messageId: string; isPinned: boolean }) =>
      isPinned ? ChatService.unpinMessage(room.id, messageId) : ChatService.pinMessage(room.id, messageId),
    onMutate: ({ messageId, isPinned }) => {
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, isPinned: !isPinned } : m));
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0f1623] flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
          <ChevronDown className="w-4 h-4 rotate-90" />
        </button>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl flex-shrink-0`}>
          {room.type === "CLASSROOM" ? "🏫" : "👥"}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-gray-900 dark:text-white text-sm truncate">{room.name}</h2>
          <p className="text-xs text-gray-400">{room.memberCount} members · {room.type === "CLASSROOM" ? "Classroom" : "Group"}</p>
        </div>
        {room.grade && (
          <span className="px-2.5 py-1 rounded-xl text-sm font-black bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
            {room.grade.resolvedGrade}%
          </span>
        )}
        <button onClick={() => setShowDetail(true)} className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all" title="Room info">
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-rose-500 animate-spin" /></div>
        ) : msgsError ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {(msgsErrorObj as any)?.code === "HTTP_403"
                ? "Access denied — you may not be a member of this room"
                : "Couldn't load messages"}
            </p>
            <p className="text-xs text-gray-400">Try refreshing or contact the backend team to verify admin room access.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No messages yet</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === currentUserId}
              prevSenderId={i > 0 ? messages[i - 1].senderId : undefined}
              currentUserId={currentUserId}
              onReply={setReplyTo}
              onReact={(msgId, reaction) => handleReact(msgId, reaction)}
              onDelete={(msgId) => deleteMutation.mutate(msgId)}
              onPin={(msgId) => {
                const m = messages.find((x) => x.id === msgId);
                if (m) pinMutation.mutate({ messageId: msgId, isPinned: m.isPinned });
              }}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)}
        onSend={(content, attachments) => { sendMutation.mutate({ content, attachments }); setReplyTo(null); }}
        disabled={isSending} />

      <AnimatePresence>
        {showDetail && roomDetail && (
          <RoomDetailPanel detail={roomDetail} gradient={gradient} onClose={() => setShowDetail(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminChat() {
  const { user } = useDashboardUser();
  const currentUserId = user?.id ?? "";

  const [tab, setTab] = useState<"CLASSROOM" | "GROUP">("CLASSROOM");
  const [activeRoom, setActiveRoom] = useState<{ room: RoomSummaryItem; index: number } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Admin gets ALL rooms platform-wide
  const { data: roomsData, isLoading, isError } = useQuery({
    queryKey: ["chat-rooms"],
    queryFn: () => ChatService.getRooms({ limit: 200 }),
  });

  const allRooms = roomsData?.data ?? [];
  const classrooms = allRooms.filter((r) => r.type === "CLASSROOM");
  const groups     = allRooms.filter((r) => r.type === "GROUP");

  const displayed = (tab === "CLASSROOM" ? classrooms : groups).filter((r) =>
    !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { joinRooms } = useChatSocket({});
  useEffect(() => {
    if (allRooms.length > 0) joinRooms(allRooms.map((r) => r.id));
  }, [allRooms.length, joinRooms]);

  return (
    <>
      <div className="-mx-4 lg:-mx-6 -my-6 -mb-16 flex flex-col" style={{ height: "calc(100vh - 82px)" }}>
        {!activeRoom ? (
          <div className="flex-1 overflow-y-auto space-y-6 pb-10 px-4 lg:px-6 pt-6">
            <Fade>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-700 flex items-center justify-center shadow-md">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Chat Management</h1>
                    <p className="text-xs text-gray-400">
                      {isLoading ? "Loading…" : `${classrooms.length} classrooms · ${groups.length} groups`}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-rose-600 to-pink-700 hover:opacity-90 transition-all shadow-md">
                  <Plus className="w-4 h-4" />New Classroom
                </button>
              </div>
            </Fade>

            <Fade delay={0.04}>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05]">
                  {[
                    { id: "CLASSROOM" as const, label: `Classrooms (${classrooms.length})` },
                    { id: "GROUP"     as const, label: `Groups (${groups.length})` },
                  ].map((t) => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.id ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search rooms…"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1623] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30" />
                </div>
              </div>
            </Fade>

            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
              </div>
            )}

            {isError && (
              <div className="rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] p-10 text-center">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Couldn't load rooms</p>
              </div>
            )}

            {!isLoading && !isError && (
              <AnimatePresence mode="wait">
                <motion.div key={tab + searchQuery} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {displayed.length === 0 ? (
                    <div className="rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] p-10 text-center">
                      <Users className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">
                        {searchQuery ? `No rooms matching "${searchQuery}"` : tab === "CLASSROOM" ? "No classrooms yet." : "No groups yet."}
                      </p>
                    </div>
                  ) : (
                    displayed.map((room, i) => (
                      <Fade key={room.id} delay={i * 0.03}>
                        <RoomCard room={room} index={i} onClick={() => setActiveRoom({ room, index: i })} />
                      </Fade>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden border-t border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0f1623]">
            <ChatView
              room={activeRoom.room}
              roomIndex={activeRoom.index}
              currentUserId={currentUserId}
              onBack={() => setActiveRoom(null)}
            />
          </div>
        )}
      </div>

      {/* Create classroom slide-in */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowCreate(false)} />
            <CreateClassroomPanel
              onClose={() => setShowCreate(false)}
              onCreated={() => queryClient.invalidateQueries({ queryKey: ["chat-rooms"] })}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
