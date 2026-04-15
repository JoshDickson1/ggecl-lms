// src/dashboards/student-dashboard/pages/StudentLiveClass.tsx
import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Users, BarChart2, X,
  Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff,
  Hand, PhoneOff, Radio, Clock, ChevronLeft,
  Send, Smile, Crown, MicOff as _MicOffIcon,
  VideoOff as _VideoOffIcon,
} from "lucide-react";
import {
  MOCK_SESSIONS, MOCK_PARTICIPANTS, MOCK_LIVE_CHAT, MOCK_POLL,
  type LiveChatMessage, type LiveParticipant, type LivePoll, type LiveSession,
} from "@/data/liveTypes";

const MY_ID = "me";
const QUICK_REACTIONS = ["👍", "🔥", "💡", "❓", "👏"];

// ─── Elapsed timer ────────────────────────────────────────────────────────────

import { useEffect } from "react";

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    setElapsed(Math.max(0, diff));
    const id = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, "0");
  const s = (elapsed % 60).toString().padStart(2, "0");
  return <span className="font-mono text-xs font-bold text-gray-700 dark:text-white">{h > 0 ? `${h}:` : ""}{m}:{s}</span>;
}

// ─── Meeting Header ───────────────────────────────────────────────────────────

function MeetingHeader({ session, participantCount, onLeave }: {
  session: LiveSession; participantCount: number; onLeave: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#0a1120] border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${session.courseColor} flex items-center justify-center text-sm flex-shrink-0`}>
          {session.courseIcon}
        </div>
        <div className="min-w-0 hidden sm:block">
          <p className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[200px]">{session.title}</p>
          <p className="text-[10px] text-gray-400 dark:text-white/30 truncate">{session.courseName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 dark:bg-red-500/15 border border-red-500/25 dark:border-red-500/30">
          <Radio className="w-3 h-3 text-red-500 dark:text-red-400" />
          <span className="text-[10px] font-black text-red-500 dark:text-red-400 uppercase tracking-wider">Live</span>
        </motion.div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.07]">
          <Clock className="w-3 h-3 text-gray-400 dark:text-white/40" />
          <ElapsedTimer startedAt={session.scheduledAt} />
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.07]">
          <Users className="w-3 h-3 text-gray-400 dark:text-white/40" />
          <span className="text-xs font-bold text-gray-600 dark:text-white/60">{participantCount}</span>
        </div>
      </div>

      <button onClick={onLeave}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-sm shadow-red-900/20">
        <ChevronLeft className="w-3.5 h-3.5" />Leave
      </button>
    </div>
  );
}

// ─── Participant Tile ─────────────────────────────────────────────────────────

function ParticipantTile({ p }: {
  p: LiveParticipant; onPin?: (id: string) => void; canPin?: boolean;
}) {
  const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-[#0d1829] border transition-all h-full ${
      p.isSpeaking
        ? "border-blue-500/60 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]"
        : "border-gray-200 dark:border-white/[0.07]"
    }`}>
      <div className="w-full h-full flex items-center justify-center overflow-hidden relative min-h-[80px]">
        {p.media.video ? (
          <div className={`absolute inset-0 bg-gradient-to-br from-gray-200 dark:from-gray-800 to-gray-300 dark:to-gray-900 flex items-center justify-center`}>
            <div className={`w-10 h-10 rounded-full ${p.avatarBg} flex items-center justify-center text-white text-sm font-black`}>
              {initials}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-100 dark:bg-[#0a1120] flex items-center justify-center">
            <div className={`w-9 h-9 rounded-full ${p.avatarBg} flex items-center justify-center text-white text-xs font-black`}>
              {initials}
            </div>
          </div>
        )}

        {p.isSpeaking && (
          <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute inset-0 rounded-xl border-2 border-blue-500/40 pointer-events-none" />
        )}

        {p.role !== "student" && (
          <div className={`absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
            p.role === "instructor" ? "bg-violet-600/90 text-white" : "bg-amber-500/90 text-white"
          }`}>
            <Crown className="w-2 h-2" />
            {p.role === "instructor" ? "Host" : "Admin"}
          </div>
        )}

        {p.media.hand && (
          <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-xs">
            ✋
          </motion.div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2 py-1 bg-black/30 dark:bg-black/50 backdrop-blur-sm">
        <span className="text-[9px] font-bold text-white truncate max-w-[70px]">{p.name}</span>
        <div className="flex items-center gap-1">
          {!p.media.audio && <MicOff className="w-2.5 h-2.5 text-red-400" />}
          {!p.media.video && <VideoOff className="w-2.5 h-2.5 text-red-400" />}
        </div>
      </div>
    </div>
  );
}

function ParticipantsGrid({ participants, onPin }: {
  participants: LiveParticipant[]; onPin: (id: string) => void;
}) {
  const pinned = participants.find(p => p.isPinned);
  const rest   = participants.filter(p => !p.isPinned);

  if (pinned) {
    return (
      <div className="flex-1 flex flex-col gap-2 p-2 overflow-hidden">
        <div className="flex-1 min-h-0">
          <ParticipantTile p={pinned} canPin onPin={onPin} />
        </div>
        <div className="flex gap-2 h-20 flex-shrink-0 overflow-x-auto">
          {rest.map(p => (
            <div key={p.id} className="w-28 flex-shrink-0 h-full">
              <ParticipantTile p={p} canPin onPin={onPin} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 p-2 grid gap-2 overflow-hidden content-start ${
      participants.length === 1 ? "grid-cols-1" :
      participants.length === 2 ? "grid-cols-2" :
      participants.length <= 4 ? "grid-cols-2" :
      "grid-cols-3"
    }`} style={{ gridAutoRows: "1fr" }}>
      {participants.map(p => (
        <ParticipantTile key={p.id} p={p} canPin onPin={onPin} />
      ))}
    </div>
  );
}

function ParticipantList({ participants }: { participants: LiveParticipant[] }) {
  const instructors = participants.filter(p => p.role !== "student");
  const students    = participants.filter(p => p.role === "student");

  const Row = ({ p }: { p: LiveParticipant }) => {
    const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (
      <div className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors rounded-xl">
        <div className="relative flex-shrink-0">
          <div className={`w-7 h-7 rounded-full ${p.avatarBg} flex items-center justify-center text-white text-[10px] font-black`}>{initials}</div>
          {p.isSpeaking && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-[#0f1623]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 dark:text-white/80 truncate">{p.name}</p>
          <p className="text-[9px] text-gray-400 dark:text-white/25 capitalize">{p.role}</p>
        </div>
        <div className="flex items-center gap-1">
          {p.media.hand && <span className="text-xs">✋</span>}
          {!p.media.audio && <MicOff className="w-3 h-3 text-red-400/70" />}
          {!p.media.video && <VideoOff className="w-3 h-3 text-red-400/70" />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {instructors.length > 0 && (
        <div className="mb-1">
          <p className="px-4 py-1 text-[9px] font-black text-gray-400 dark:text-white/25 uppercase tracking-widest">Host</p>
          {instructors.map(p => <Row key={p.id} p={p} />)}
        </div>
      )}
      <div>
        <p className="px-4 py-1 text-[9px] font-black text-gray-400 dark:text-white/25 uppercase tracking-widest">Students ({students.length})</p>
        {students.map(p => <Row key={p.id} p={p} />)}
      </div>
    </div>
  );
}

// ─── Live Chat ────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatBubble({ msg, onReact }: { msg: LiveChatMessage; onReact: (id: string, emoji: string) => void }) {
  const isMe = msg.senderId === MY_ID;
  const [showPicker, setShowPicker] = useState(false);
  const initials = msg.senderName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className={`flex gap-2 px-3 py-1 group ${isMe ? "flex-row-reverse" : ""}`}>
      {!isMe && (
        <div className={`w-6 h-6 rounded-full ${msg.senderAvatarBg} flex items-center justify-center text-white text-[9px] font-black flex-shrink-0 mt-1`}>
          {initials}
        </div>
      )}
      <div className={`flex flex-col gap-0.5 max-w-[78%] ${isMe ? "items-end" : ""}`}>
        {!isMe && (
          <div className="flex items-center gap-1">
            <span className={`text-[9px] font-black ${
              msg.senderRole === "instructor" ? "text-violet-500 dark:text-violet-400" : "text-gray-400 dark:text-white/40"
            }`}>{msg.senderName}</span>
            <span className="text-[8px] text-gray-300 dark:text-white/20">{formatTime(msg.createdAt)}</span>
          </div>
        )}
        <div className="relative">
          <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
            isMe
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-gray-100 dark:bg-white/[0.07] text-gray-800 dark:text-white/80 rounded-tl-sm"
          }`}>
            {msg.text}
          </div>
          <div className={`absolute ${isMe ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} top-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
            <button onClick={() => setShowPicker(p => !p)}
              className="p-1 rounded-md bg-gray-100 dark:bg-white/[0.08] hover:bg-gray-200 dark:hover:bg-white/[0.14] transition-colors">
              <Smile className="w-3 h-3 text-gray-400 dark:text-white/40" />
            </button>
          </div>
          <AnimatePresence>
            {showPicker && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute top-7 ${isMe ? "right-0" : "left-0"} z-10 flex gap-1 p-1.5 rounded-xl bg-white dark:bg-[#0a1120] border border-gray-200 dark:border-white/[0.1] shadow-xl`}>
                {QUICK_REACTIONS.map(e => (
                  <button key={e} onClick={() => { onReact(msg.id, e); setShowPicker(false); }}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.1] text-sm transition-colors">
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {msg.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.reactions.map(r => (
              <button key={r.emoji} onClick={() => onReact(msg.id, r.emoji)}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-all ${
                  r.reactedByMe
                    ? "bg-blue-100 dark:bg-blue-600/20 border-blue-400/40 text-blue-600 dark:text-blue-300"
                    : "bg-gray-100 dark:bg-white/[0.05] border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/50"
                }`}>
                {r.emoji} <span className="font-bold">{r.count}</span>
              </button>
            ))}
          </div>
        )}
        {isMe && <span className="text-[8px] text-gray-300 dark:text-white/20">{formatTime(msg.createdAt)}</span>}
      </div>
    </div>
  );
}

function LiveChat({ messages, onSend, onReact }: {
  messages: LiveChatMessage[]; onSend: (t: string) => void;
  onReact: (id: string, e: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = () => { if (!draft.trim()) return; onSend(draft.trim()); setDraft(""); };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-2">
        {messages.map(msg => <ChatBubble key={msg.id} msg={msg} onReact={onReact} />)}
        <div ref={bottomRef} />
      </div>
      <div className="flex-shrink-0 px-3 py-2 border-t border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] focus-within:border-blue-400 dark:focus-within:border-blue-500/40 transition-colors">
          <input value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message everyone…"
            className="flex-1 bg-transparent text-xs text-gray-700 dark:text-white/80 placeholder:text-gray-400 dark:placeholder:text-white/25 focus:outline-none" />
          <button onClick={send} disabled={!draft.trim()}
            className="p-1 rounded-md text-blue-500 hover:text-blue-400 disabled:opacity-30 transition-all">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Poll widget ──────────────────────────────────────────────────────────────

function PollWidget({ poll, onVote }: { poll: LivePoll; onVote: (optionId: string) => void }) {
  const totalVotes = poll.options.reduce((a, o) => a + o.votes, 0);
  const hasVoted   = poll.options.some(o => o.votedByMe);

  return (
    <div className="mx-3 mb-2 rounded-xl bg-gray-50 dark:bg-[#0d1829] border border-gray-200 dark:border-white/[0.07] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5">
        <BarChart2 className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
        <span className="text-[10px] font-black text-gray-500 dark:text-white/50 uppercase tracking-wider">Live Poll</span>
      </div>
      <div className="px-3 pb-3 space-y-1.5">
        <p className="text-xs font-bold text-gray-800 dark:text-white/80">{poll.question}</p>
        {poll.options.map(opt => {
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          return (
            <button key={opt.id} onClick={() => !hasVoted && onVote(opt.id)} disabled={hasVoted}
              className={`w-full relative rounded-lg border text-left overflow-hidden transition-all ${
                opt.votedByMe
                  ? "border-violet-400/50 bg-violet-50 dark:bg-violet-500/10"
                  : hasVoted
                  ? "border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] opacity-70"
                  : "border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:border-gray-300 dark:hover:border-white/20"
              }`}>
              {hasVoted && <div className="absolute inset-y-0 left-0 bg-violet-100 dark:bg-violet-500/10" style={{ width: `${pct}%` }} />}
              <div className="relative flex items-center justify-between px-3 py-2">
                <span className="text-xs text-gray-700 dark:text-white/70 font-semibold">{opt.text}</span>
                {hasVoted && <span className="text-[10px] font-black text-gray-400 dark:text-white/40">{pct}%</span>}
              </div>
            </button>
          );
        })}
        <p className="text-[9px] text-gray-400 dark:text-white/20 text-right">{totalVotes} votes</p>
      </div>
    </div>
  );
}

// ─── Controls ─────────────────────────────────────────────────────────────────

function ControlBtn({ onClick, active, danger, off, children, label, badge }: {
  onClick: () => void; active?: boolean; danger?: boolean; off?: boolean;
  children: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <div className="relative flex flex-col items-center gap-1">
      <button onClick={onClick}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
          danger
            ? "bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-900/30"
            : off
            ? "bg-red-500/10 dark:bg-red-500/15 border border-red-400/30 text-red-500 dark:text-red-400 hover:bg-red-500/20"
            : active
            ? "bg-blue-600 text-white shadow-sm shadow-blue-900/20"
            : "bg-gray-100 dark:bg-white/[0.07] border border-gray-200 dark:border-white/[0.1] text-gray-500 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/[0.12] hover:text-gray-700 dark:hover:text-white"
        }`}>
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 text-white text-[8px] font-black flex items-center justify-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
      <span className="text-[9px] text-gray-400 dark:text-white/30 font-semibold">{label}</span>
    </div>
  );
}

function Controls({ audio, video, screen, hand, onToggleAudio, onToggleVideo, onToggleScreen,
  onToggleHand, onLeave, onOpenChat, onOpenParticipants, chatUnread }: {
  audio: boolean; video: boolean; screen: boolean; hand: boolean;
  onToggleAudio: () => void; onToggleVideo: () => void; onToggleScreen: () => void;
  onToggleHand: () => void; onLeave: () => void; onOpenChat: () => void;
  onOpenParticipants: () => void; chatUnread?: number;
}) {

  return (
    <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0a1120] border-t border-gray-200 dark:border-white/[0.06] flex-shrink-0">
      <ControlBtn onClick={onToggleAudio} off={!audio} label={audio ? "Mute" : "Unmute"}>
        {audio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </ControlBtn>
      <ControlBtn onClick={onToggleVideo} off={!video} label={video ? "Stop" : "Start"}>
        {video ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
      </ControlBtn>
      <ControlBtn onClick={onToggleScreen} active={screen} label={screen ? "Stop" : "Share"}>
        {screen ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
      </ControlBtn>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/[0.08] mx-0.5" />

      <ControlBtn onClick={onToggleHand} active={hand} label={hand ? "Lower" : "Hand"}>
        <Hand className="w-4 h-4" />
      </ControlBtn>
      <ControlBtn onClick={onOpenChat} label="Chat" badge={chatUnread}>
        <MessageSquare className="w-4 h-4" />
      </ControlBtn>
      <ControlBtn onClick={onOpenParticipants} label="People">
        <Users className="w-4 h-4" />
      </ControlBtn>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/[0.08] mx-0.5" />

      <ControlBtn onClick={onLeave} danger label="Leave">
        <PhoneOff className="w-4 h-4" />
      </ControlBtn>
    </div>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────────

import { useRef } from "react";

type PanelType = "chat" | "participants" | null;

function RightPanel({ type, onClose, chatMessages, participants, poll, onSendChat, onReactChat, onVotePoll }: {
  type: PanelType; onClose: () => void;
  chatMessages: LiveChatMessage[]; participants: LiveParticipant[];
  poll: LivePoll | null; onSendChat: (t: string) => void;
  onReactChat: (id: string, e: string) => void; onVotePoll: (optId: string) => void;
}) {
  if (!type) return null;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
      className="flex-shrink-0 flex flex-col border-l border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0a1120] overflow-hidden"
      style={{ minWidth: 0 }}>
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          {type === "chat"         && <MessageSquare className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />}
          {type === "participants" && <Users className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />}
          <span className="text-xs font-black text-gray-900 dark:text-white capitalize">{type}</span>
          {type === "participants" && (
            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] text-[9px] font-black text-gray-400 dark:text-white/40">
              {participants.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {type === "chat" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {poll && <PollWidget poll={poll} onVote={onVotePoll} />}
          <LiveChat messages={chatMessages} onSend={onSendChat} onReact={onReactChat} />
        </div>
      )}
      {type === "participants" && <ParticipantList participants={participants} />}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentLiveClass() {
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();
  const location  = useLocation();
  const state     = location.state as { audio?: boolean; video?: boolean } | null;

  const SESSION = MOCK_SESSIONS.find(s => s.id === id && s.status === "live")
    ?? MOCK_SESSIONS.find(s => s.status === "live")
    ?? MOCK_SESSIONS[0];

  const [audio, setAudio]   = useState(state?.audio ?? true);
  const [video, setVideo]   = useState(state?.video ?? true);
  const [screen, setScreen] = useState(false);
  const [hand, setHand]     = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>("chat");
  const [chatUnread, setChatUnread]   = useState(0);
  const [participants, setParticipants] = useState<LiveParticipant[]>(MOCK_PARTICIPANTS);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>(MOCK_LIVE_CHAT);
  const [poll, setPoll] = useState<LivePoll | null>(MOCK_POLL);

  const openPanel = (p: PanelType) => {
    setActivePanel(prev => prev === p ? null : p);
    if (p === "chat") setChatUnread(0);
  };

  const handleLeave = () => navigate("/student/live");

  const handleSendChat = (text: string) => {
    setChatMessages(p => [...p, {
      id: `lc-${Date.now()}`, senderId: MY_ID, senderName: "You",
      senderAvatarBg: "bg-blue-600", senderRole: "student",
      text, createdAt: new Date().toISOString(), reactions: [],
    }]);
  };

  const handleReactChat = (msgId: string, emoji: string) => {
    setChatMessages(p => p.map(m => m.id !== msgId ? m : {
      ...m,
      reactions: m.reactions.some(r => r.emoji === emoji)
        ? m.reactions.map(r => r.emoji === emoji
            ? { ...r, count: r.reactedByMe ? r.count - 1 : r.count + 1, reactedByMe: !r.reactedByMe }
            : r).filter(r => r.count > 0)
        : [...m.reactions, { emoji, count: 1, reactedByMe: true }],
    }));
  };

  const handleVotePoll = (optId: string) => {
    setPoll(p => p ? {
      ...p, options: p.options.map(o => o.id === optId ? { ...o, votes: o.votes + 1, votedByMe: true } : o),
    } : null);
  };

  const handlePin = (id: string) => {
    setParticipants(p => p.map(pp => ({ ...pp, isPinned: pp.id === id ? !pp.isPinned : false })));
  };

  return (
    // 80dvh — sits inside student layout which has the navbar
    <div className="flex flex-col bg-gray-50 dark:bg-[#060d18] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/[0.07]"
      style={{ height: "80dvh" }}>

      <MeetingHeader session={SESSION} participantCount={participants.length} onLeave={handleLeave} />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <ParticipantsGrid participants={participants} onPin={handlePin} />
        </div>

        <AnimatePresence>
          {activePanel && (
            <RightPanel
              type={activePanel}
              onClose={() => setActivePanel(null)}
              chatMessages={chatMessages}
              participants={participants}
              poll={poll}
              onSendChat={handleSendChat}
              onReactChat={handleReactChat}
              onVotePoll={handleVotePoll}
            />
          )}
        </AnimatePresence>
      </div>

      <Controls
        audio={audio} video={video} screen={screen} hand={hand}
        onToggleAudio={() => setAudio(p => !p)}
        onToggleVideo={() => setVideo(p => !p)}
        onToggleScreen={() => setScreen(p => !p)}
        onToggleHand={() => setHand(p => !p)}
        onLeave={handleLeave}
        onOpenChat={() => openPanel("chat")}
        onOpenParticipants={() => openPanel("participants")}
        chatUnread={chatUnread}
      />
    </div>
  );
}