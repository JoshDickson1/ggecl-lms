// src/dashboards/shared/chat/ChatShared.tsx
// Shared components: ChatBubble, AttachmentPreview, GradePanel, RoomDetailDialog, QuickGradePanel
// Used by StudentChat, InstructorChat, AdminChat

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, X, Pin, Reply, Smile,
  CheckCircle2, Award, TrendingUp, Users, BookOpen, AlertCircle, Send, Shield,
} from "lucide-react";
import type {
  ChatMessage, ChatAttachment, ClassGroup, Classroom,
  ChatRole, ClassroomMember,
} from "@/data/chatData";
import {
  ATTACHMENT_META, EMOJI_REACTIONS, formatTime, timeAgo, getAttachmentType,
} from "@/data/chatData";
import { GRADE_META, type LetterGrade, type RubricCriterion } from "@/data/academicData";

// ─── CARD ─────────────────────────────────────────────────────────────────────

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

// ─── ROLE BADGE ───────────────────────────────────────────────────────────────

export function RoleBadge({ role }: { role: ChatRole }) {
  const styles: Record<ChatRole, string> = {
    instructor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    admin:      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    student:    "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400",
  };
  const labels: Record<ChatRole, string> = { instructor: "Instructor", admin: "Admin", student: "Student" };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${styles[role]}`}>
      {labels[role]}
    </span>
  );
}

// ─── ONLINE DOT ───────────────────────────────────────────────────────────────

export function OnlineDot({ online }: { online: boolean }) {
  return (
    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${online ? "bg-emerald-400" : "bg-gray-300 dark:bg-gray-600"}`} />
  );
}

// ─── ATTACHMENT CHIP ──────────────────────────────────────────────────────────

export function AttachmentChip({ file }: { file: ChatAttachment }) {
  const type = getAttachmentType(file.name);
  const meta = ATTACHMENT_META[type];
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] ${meta.bg} max-w-[220px]`}>
      <span className="text-base">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate ${meta.color}`}>{file.name}</p>
        <p className="text-[10px] text-gray-400">{file.size}</p>
      </div>
      <a href={file.url} className="text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0">
        <Download className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ─── EMOJI PICKER ─────────────────────────────────────────────────────────────

function EmojiPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.12 }}
      className="absolute bottom-full mb-1 right-0 z-30 flex gap-1 p-2 rounded-2xl bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] shadow-xl">
      {EMOJI_REACTIONS.map(e => (
        <button key={e} onClick={() => { onPick(e); onClose(); }}
          className="text-lg hover:scale-125 transition-transform">{e}</button>
      ))}
    </motion.div>
  );
}

// ─── CHAT BUBBLE ─────────────────────────────────────────────────────────────

export function ChatBubble({
  message, isMe, prevSenderId, canPin, canDelete,
  onReply, onReact, onPin, onDelete,
}: {
  message: ChatMessage;
  isMe: boolean;
  prevSenderId?: string;
  canPin?: boolean;
  canDelete?: boolean;
  onReply?: (m: ChatMessage) => void;
  onReact?: (msgId: string, emoji: string) => void;
  onPin?: (msgId: string) => void;
  onDelete?: (msgId: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const isGrouped = prevSenderId === message.senderId;

  if (message.isDeleted) {
    return (
      <div className="px-4 py-1">
        <span className="text-xs text-gray-400 italic">Message deleted</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex gap-3 px-4 ${isGrouped ? "mt-0.5" : "mt-4"} hover:bg-gray-50/60 dark:hover:bg-white/[0.02] rounded-xl transition-colors`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmoji(false); }}
    >
      {/* Avatar column */}
      <div className="w-9 flex-shrink-0 flex flex-col items-center pt-0.5">
        {!isGrouped ? (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black ${message.senderAvatarBg}`}>
            {message.senderAvatar}
          </div>
        ) : (
          <span className="text-[10px] text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 mt-1 w-9 text-center tabular-nums">
            {formatTime(message.createdAt)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        {!isGrouped && (
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${isMe ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
              {message.senderName}
            </span>
            <RoleBadge role={message.senderRole} />
            <span className="text-[10px] text-gray-400">{timeAgo(message.createdAt)}</span>
            {message.isPinned && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-semibold">
                <Pin className="w-3 h-3" />Pinned
              </span>
            )}
          </div>
        )}

        {/* Reply-to context */}
        {message.replyTo && (
          <div className="mb-1.5 pl-3 border-l-2 border-blue-400 dark:border-blue-600">
            <p className="text-[11px] font-semibold text-blue-500">{message.replyTo.senderName}</p>
            <p className="text-[11px] text-gray-400 truncate">{message.replyTo.text}</p>
          </div>
        )}

        {/* Text */}
        {message.text && (
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
            {message.text.split(/(@\w+[\w\s]*)/).map((part, i) =>
              part.startsWith("@") ? (
                <span key={i} className="text-blue-500 font-semibold">{part}</span>
              ) : part
            )}
          </p>
        )}

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.attachments.map(f => <AttachmentChip key={f.id} file={f} />)}
          </div>
        )}

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.reactions.map(r => (
              <button key={r.emoji} onClick={() => onReact?.(message.id, r.emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${r.reactedByMe ? "bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700" : "bg-gray-50 border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.08]"}`}>
                <span>{r.emoji}</span>
                <span className="text-gray-600 dark:text-gray-400 font-semibold">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action toolbar — appears on hover */}
      <AnimatePresence>
        {showActions && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.1 }}
            className="absolute right-4 -top-4 flex items-center gap-0.5 px-2 py-1 rounded-xl bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] shadow-lg z-20">
            <button onClick={() => onReply?.(message)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" title="Reply">
              <Reply className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <button onClick={() => setShowEmoji(p => !p)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" title="React">
                <Smile className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {showEmoji && <EmojiPicker onPick={e => onReact?.(message.id, e)} onClose={() => setShowEmoji(false)} />}
              </AnimatePresence>
            </div>
            {canPin && (
              <button onClick={() => onPin?.(message.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" title="Pin">
                <Pin className="w-3.5 h-3.5" />
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete?.(message.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all" title="Delete">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── GRADE BADGE ──────────────────────────────────────────────────────────────

export function GradeBadge({ grade }: { grade: LetterGrade }) {
  const meta = GRADE_META[grade];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-sm font-black border ${meta.color} ${meta.bg} ${meta.border}`}>
      {grade}
    </span>
  );
}

// ─── RUBRIC BAR ───────────────────────────────────────────────────────────────

function RubricBar({ criterion }: { criterion: RubricCriterion }) {
  const pct = Math.round((criterion.score / criterion.maxScore) * 100);
  const color = pct >= 80 ? "from-emerald-500 to-emerald-400" : pct >= 60 ? "from-blue-500 to-blue-400" : "from-amber-500 to-amber-400";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400 font-medium">{criterion.label}</span>
        <span className="font-bold text-gray-900 dark:text-white">{criterion.score}/{criterion.maxScore}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`} />
      </div>
    </div>
  );
}

// ─── GRADE PANEL (full, inside detail dialog) ────────────────────────────────

export function GradePanel({ group }: { group: ClassGroup }) {
  if (!group.grade) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-3">
          <Award className="w-7 h-7 text-gray-400" />
        </div>
        <p className="font-bold text-gray-700 dark:text-white mb-1">Not graded yet</p>
        <p className="text-sm text-gray-400">The grade will appear here once submitted.</p>
      </div>
    );
  }

  const rubricTotal = group.gradeRubric ? group.gradeRubric.reduce((a, r) => a + r.score, 0) : 0;
  const rubricMax   = group.gradeRubric ? group.gradeRubric.reduce((a, r) => a + r.maxScore, 0) : 0;

  return (
    <div className="space-y-5">
      {/* Score hero */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
        <GradeBadge grade={group.grade} />
        <div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{group.gradePercentage}%</p>
          <p className="text-xs text-gray-400 mt-0.5">Graded by <span className="font-semibold text-gray-600 dark:text-gray-300">{group.gradedBy}</span> · {group.gradedAt ? timeAgo(group.gradedAt) : ""}</p>
        </div>
        {group.isAppealable && (
          <span className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
            <AlertCircle className="w-3.5 h-3.5" />Appeal available
          </span>
        )}
      </div>

      {/* Feedback */}
      {group.gradeFeedback && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Feedback</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{group.gradeFeedback}</p>
        </div>
      )}

      {/* Strengths + improvements */}
      <div className="grid grid-cols-2 gap-4">
        {group.gradeStrengths && group.gradeStrengths.length > 0 && (
          <div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Strengths</p>
            <ul className="space-y-1.5">
              {group.gradeStrengths.map(s => (
                <li key={s} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {group.gradeImprovements && group.gradeImprovements.length > 0 && (
          <div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">Improvements</p>
            <ul className="space-y-1.5">
              {group.gradeImprovements.map(s => (
                <li key={s} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />{s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Rubric */}
      {group.gradeRubric && group.gradeRubric.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rubric</p>
            <span className="text-xs font-bold text-gray-700 dark:text-white">{rubricTotal}/{rubricMax}</span>
          </div>
          <div className="space-y-3">
            {group.gradeRubric.map(r => <RubricBar key={r.id} criterion={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QUICK GRADE PANEL (inline from chat) ─────────────────────────────────────

export function QuickGradePanel({
  group, onGrade, onClose,
}: {
  group: ClassGroup;
  onGrade: (grade: LetterGrade, feedback: string, rubric: RubricCriterion[]) => void;
  onClose: () => void;
}) {
  const [selectedGrade, setSelectedGrade] = useState<LetterGrade | null>(group.grade ?? null);
  const [feedback,      setFeedback]      = useState(group.gradeFeedback ?? "");
  const [rubric,        setRubric]        = useState<RubricCriterion[]>(
    group.gradeRubric ?? [
      { id: "r1", label: "Technical Accuracy", maxScore: 30, score: 0 },
      { id: "r2", label: "Code Quality",        maxScore: 25, score: 0 },
      { id: "r3", label: "Problem Solving",     maxScore: 20, score: 0 },
      { id: "r4", label: "Documentation",       maxScore: 15, score: 0 },
      { id: "r5", label: "Collaboration",       maxScore: 10, score: 0 },
    ]
  );
  const [strengths,    setStrengths]    = useState<string[]>(group.gradeStrengths    ?? [""]);
  const [improvements, setImprovements] = useState<string[]>(group.gradeImprovements ?? [""]);
  const [tab, setTab] = useState<"grade" | "rubric" | "feedback">("grade");
 
  const GRADES: LetterGrade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
 
  const rubricTotal = rubric.reduce((s, r) => s + r.score, 0);
  const rubricMax   = rubric.reduce((s, r) => s + r.maxScore, 0);
  const rubricPct   = rubricMax > 0 ? Math.round((rubricTotal / rubricMax) * 100) : 0;
 
  const updateRubricScore = (id: string, score: number) =>
    setRubric(prev => prev.map(r => r.id === id ? { ...r, score: Math.min(score, r.maxScore) } : r));
 
  const updateListItem = (
    list: string[], setList: (v: string[]) => void, i: number, val: string
  ) => { const next = [...list]; next[i] = val; setList(next); };
 
  const addListItem    = (list: string[], setList: (v: string[]) => void) => setList([...list, ""]);
  const removeListItem = (list: string[], setList: (v: string[]) => void, i: number) =>
    setList(list.filter((_, j) => j !== i));
 
  const TABS = [
    { id: "grade",    label: "Grade"    },
    { id: "rubric",   label: "Rubric"   },
    { id: "feedback", label: "Feedback" },
  ] as const;
 
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.22 }}
      // ── WIDTH: w-72 reduced to w-[272px] (~5% smaller than w-80/320px baseline)
      // to prevent overflow in the sidebar layout. Edit this value if needed. ──
      className="w-[272px] flex-shrink-0 border-l border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0f1623] flex flex-col"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-white/[0.07]">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="font-black text-sm text-gray-900 dark:text-white">
            {group.grade ? "Update Grade" : "Grade Group"}
          </h3>
        </div>
        <button onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white
            hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>
 
      {/* ── Group meta ── */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02]">
        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{group.name}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{group.classroomName}</p>
        {selectedGrade && (
          <div className="flex items-center gap-2 mt-2">
            <GradeBadge grade={selectedGrade} />
            {rubricMax > 0 && (
              <span className="text-xs text-gray-400 font-semibold">
                {rubricTotal}/{rubricMax} pts · {rubricPct}%
              </span>
            )}
          </div>
        )}
      </div>
 
      {/* ── Tab pills ── */}
      <div className="flex gap-1 p-2 border-b border-gray-100 dark:border-white/[0.06]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all
              ${tab === t.id
                ? "bg-amber-500 text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
              }`}>
            {t.label}
          </button>
        ))}
      </div>
 
      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
 
        {/* ════ GRADE TAB ════ */}
        {tab === "grade" && (
          <>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                Letter Grade
              </p>
              {/* 3-col grid fits the narrower panel better than 4-col */}
              <div className="grid grid-cols-3 gap-1.5">
                {GRADES.map(g => {
                  const meta = GRADE_META[g];
                  return (
                    <button key={g} onClick={() => setSelectedGrade(g)}
                      className={`py-2 rounded-xl text-sm font-black border transition-all
                        ${selectedGrade === g
                          ? `${meta.color} ${meta.bg} ${meta.border} scale-105 shadow-sm`
                          : "border-gray-200 dark:border-white/[0.07] text-gray-500 dark:text-gray-400 hover:border-gray-300"
                        }`}>
                      {g}
                    </button>
                  );
                })}
              </div>
              {selectedGrade && (
                <p className="text-[11px] text-gray-400 mt-2 text-center">
                  {GRADE_META[selectedGrade].label} · GPA {GRADE_META[selectedGrade].gpa.toFixed(1)}
                </p>
              )}
            </div>
 
            {/* Appeal toggle */}
            {group.isAppealable !== undefined && (
              <div className="flex items-center justify-between p-3 rounded-xl
                bg-amber-50 dark:bg-amber-950/20
                border border-amber-100 dark:border-amber-800/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Allow appeal
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                  ${group.isAppealable
                    ? "bg-amber-200 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                    : "bg-gray-100 dark:bg-white/[0.06] text-gray-400"
                  }`}>
                  {group.isAppealable ? "Yes" : "No"}
                </span>
              </div>
            )}
          </>
        )}
 
        {/* ════ RUBRIC TAB ════ */}
        {tab === "rubric" && (
          <>
            {/* Rubric total bar */}
            <div className="flex items-center gap-2 p-3 rounded-xl
              bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
              <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-white/[0.08] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rubricPct}%` }}
                  transition={{ duration: 0.4 }}
                  className={`h-full rounded-full bg-gradient-to-r ${
                    rubricPct >= 80 ? "from-emerald-500 to-emerald-400"
                    : rubricPct >= 60 ? "from-blue-500 to-blue-400"
                    : "from-amber-500 to-amber-400"
                  }`}
                />
              </div>
              <span className="text-xs font-black text-gray-700 dark:text-white flex-shrink-0">
                {rubricTotal}/{rubricMax}
              </span>
            </div>
 
            {/* Per-criterion sliders */}
            <div className="space-y-4">
              {rubric.map(r => {
                const pct = r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0;
                return (
                  <div key={r.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {r.label}
                      </span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        {r.score}
                        <span className="text-gray-400 font-normal">/{r.maxScore}</span>
                      </span>
                    </div>
                    <input
                      type="range" min={0} max={r.maxScore} step={1} value={r.score}
                      onChange={e => updateRubricScore(r.id, parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                        bg-gray-200 dark:bg-white/[0.08]
                        accent-blue-600"
                    />
                    <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden mt-1">
                      <motion.div
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.2 }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          pct >= 80 ? "from-emerald-500 to-emerald-400"
                          : pct >= 60 ? "from-blue-500 to-blue-400"
                          : "from-amber-500 to-amber-400"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
 
        {/* ════ FEEDBACK TAB ════ */}
        {tab === "feedback" && (
          <>
            {/* Written feedback */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Written Feedback
              </p>
              <textarea
                value={feedback} onChange={e => setFeedback(e.target.value)} rows={4}
                placeholder="Overall feedback for the group…"
                className="w-full px-3 py-2.5 rounded-xl text-sm
                  border border-gray-200 dark:border-white/[0.08]
                  bg-gray-50 dark:bg-white/[0.04]
                  text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-amber-500/25
                  resize-none transition-all"
              />
            </div>
 
            {/* Strengths */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Strengths
                </p>
                <button onClick={() => addListItem(strengths, setStrengths)}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  + Add
                </button>
              </div>
              <div className="space-y-1.5">
                {strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <input
                      value={s}
                      onChange={e => updateListItem(strengths, setStrengths, i, e.target.value)}
                      placeholder="e.g. Clean component design"
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg text-xs
                        border border-gray-200 dark:border-white/[0.08]
                        bg-gray-50 dark:bg-white/[0.04]
                        text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {strengths.length > 1 && (
                      <button onClick={() => removeListItem(strengths, setStrengths, i)}
                        className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
 
            {/* Improvements */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                  Improvements
                </p>
                <button onClick={() => addListItem(improvements, setImprovements)}
                  className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  + Add
                </button>
              </div>
              <div className="space-y-1.5">
                {improvements.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <input
                      value={s}
                      onChange={e => updateListItem(improvements, setImprovements, i, e.target.value)}
                      placeholder="e.g. Add more unit tests"
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg text-xs
                        border border-gray-200 dark:border-white/[0.08]
                        bg-gray-50 dark:bg-white/[0.04]
                        text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                    {improvements.length > 1 && (
                      <button onClick={() => removeListItem(improvements, setImprovements, i)}
                        className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
 
      {/* ── Submit footer ── */}
      <div className="px-4 py-3.5 border-t border-gray-100 dark:border-white/[0.07] space-y-2">
        {/* Mini rubric summary shown on non-rubric tabs */}
        {tab !== "rubric" && rubricMax > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
              <div style={{ width: `${rubricPct}%` }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
            </div>
            <span className="flex-shrink-0">{rubricTotal}/{rubricMax} rubric</span>
          </div>
        )}
        <button
          onClick={() => selectedGrade && onGrade(selectedGrade, feedback, rubric)}
          disabled={!selectedGrade}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold
            text-white bg-gradient-to-br from-amber-500 to-orange-600
            hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
            transition-all shadow-md">
          <Award className="w-4 h-4" />
          {group.grade ? "Update Grade" : "Submit Grade"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── ROOM DETAIL DIALOG ───────────────────────────────────────────────────────

export function RoomDetailDialog({
  room, type, canGrade, onClose, onGrade,
}: {
  room: Classroom | ClassGroup;
  type: "classroom" | "classgroup";
  canGrade?: boolean;
  onClose: () => void;
  onGrade?: (grade: LetterGrade, feedback: string) => void;
}) {
  const [tab, setTab] = useState<"info" | "members" | "grade">("info");
  const isGroup = type === "classgroup";
  const group = isGroup ? room as ClassGroup : null;
  const classroom = !isGroup ? room as Classroom : null;

  const allMembers: ClassroomMember[] = isGroup
    ? (group!.members)
    : [...(classroom!.instructors), ...(classroom!.students)];

  const TABS = [
    { id: "info", label: "Info" },
    { id: "members", label: `Members (${allMembers.length})` },
    ...(isGroup ? [{ id: "grade", label: "Grade" }] : []),
  ] as const;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.22 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className={`px-6 py-5 bg-gradient-to-br ${room.color} relative`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"><X className="w-4 h-4" /></button>
          <div className="flex items-center gap-3 relative">
            <span className="text-4xl">{room.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{isGroup ? "Classgroup" : "Classroom"}</span>
                {isGroup && group?.grade && <GradeBadge grade={group.grade} />}
              </div>
              <h2 className="text-xl font-black text-white">{room.name}</h2>
              <p className="text-white/70 text-xs mt-0.5">{isGroup ? (group!.classroomName) : (classroom!.courseName)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-gray-100 dark:border-white/[0.07] bg-gray-50/60 dark:bg-white/[0.02]">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === t.id ? "bg-white dark:bg-[#0f1623] shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* INFO */}
          {tab === "info" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{room.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Messages", value: room.totalMessages, icon: BookOpen },
                  { label: "Members", value: allMembers.length, icon: Users },
                  { label: "Pinned", value: room.pinnedMessageIds.length, icon: Pin },
                ].map(({ label, value, icon: Ic }) => (
                  <div key={label} className="rounded-xl p-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                    <Ic className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="font-black text-gray-900 dark:text-white text-lg">{value}</p>
                    <p className="text-[11px] text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
              {isGroup && group && (
                <div className="text-xs text-gray-400">
                  Created by <span className="font-semibold text-gray-600 dark:text-gray-300">{group.createdBy}</span> ({group.createdByRole})
                </div>
              )}
            </div>
          )}

          {/* MEMBERS */}
          {tab === "members" && (
            <div className="space-y-2">
              {allMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black ${m.avatarBg}`}>{m.avatar}</div>
                    <OnlineDot online={m.isOnline} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.name}</p>
                  </div>
                  <RoleBadge role={m.role} />
                </div>
              ))}
            </div>
          )}

          {/* GRADE (classgroup only) */}
          {tab === "grade" && isGroup && group && (
            <div className="space-y-5">
              <GradePanel group={group} />
              {canGrade && onGrade && (
                <div className="pt-4 border-t border-gray-100 dark:border-white/[0.07]">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />{group.grade ? "Update Grade" : "Submit Grade"}
                  </p>
                  <QuickGradeInline group={group} onGrade={onGrade} />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── INLINE GRADE FORM (inside detail dialog) ────────────────────────────────

function QuickGradeInline({ group, onGrade }: { group: ClassGroup; onGrade: (grade: LetterGrade, feedback: string) => void }) {
  const [selectedGrade, setSelectedGrade] = useState<LetterGrade | null>(group.grade ?? null);
  const [feedback, setFeedback] = useState(group.gradeFeedback ?? "");
  const GRADES: LetterGrade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1.5">
        {GRADES.map(g => {
          const meta = GRADE_META[g];
          return (
            <button key={g} onClick={() => setSelectedGrade(g)}
              className={`py-2 rounded-xl text-sm font-black border transition-all ${selectedGrade === g ? `${meta.color} ${meta.bg} ${meta.border} scale-105` : "border-gray-200 dark:border-white/[0.07] text-gray-500 hover:border-gray-300"}`}>
              {g}
            </button>
          );
        })}
      </div>
      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
        placeholder="Feedback for the group..."
        className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none transition-all" />
      <button onClick={() => selectedGrade && onGrade(selectedGrade, feedback)} disabled={!selectedGrade}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md">
        <Award className="w-4 h-4" />{group.grade ? "Update Grade" : "Submit Grade"}
      </button>
    </div>
  );
}

// ─── MESSAGE INPUT ─────────────────────────────────────────────────────────────

export function MessageInput({
  replyTo, onCancelReply, onSend, members = [],
}: {
  replyTo?: ChatMessage | null;
  onCancelReply?: () => void;
  onSend: (text: string, attachments: File[]) => void;
  members?: ClassroomMember[];
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(mentionQuery.toLowerCase()) && m.id !== "me"
  );

  const handleText = (v: string) => {
    setText(v);
    const match = v.match(/@(\w*)$/);
    if (match) { setMentionQuery(match[1]); setShowMentions(true); }
    else setShowMentions(false);
  };

  const insertMention = (name: string) => {
    setText(prev => prev.replace(/@\w*$/, `@${name} `));
    setShowMentions(false);
  };

  const submit = () => {
    if (!text.trim() && files.length === 0) return;
    onSend(text, files);
    setText(""); setFiles([]);
  };

  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0f1623]">
      {/* Reply strip */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
          <Reply className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-blue-600">{replyTo.senderName}</p>
            <p className="text-xs text-gray-500 truncate">{replyTo.text}</p>
          </div>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-xs text-gray-600 dark:text-gray-400">
              <span>{f.name}</span>
              <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-rose-500"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Mention dropdown */}
      <AnimatePresence>
        {showMentions && filteredMembers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="mb-2 rounded-2xl bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] shadow-lg overflow-hidden max-h-40 overflow-y-auto">
            {filteredMembers.map(m => (
              <button key={m.id} onClick={() => insertMention(m.name)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black ${m.avatarBg}`}>{m.avatar}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.name}</p>
                  <RoleBadge role={m.role} />
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <button onClick={() => fileRef.current?.click()} className="p-2.5 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex-shrink-0" title="Attach file">
          ＋
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])} />
        <textarea
          value={text}
          onChange={e => handleText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Type a message... (@ to mention, Enter to send)"
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-2xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all max-h-32 overflow-y-auto"
          style={{ minHeight: "42px" }}
        />
        <button onClick={submit} disabled={!text.trim() && files.length === 0}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Re-export Pin for use in other files without extra imports
export { Pin };