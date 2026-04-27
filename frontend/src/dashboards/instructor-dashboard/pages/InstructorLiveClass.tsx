// src/dashboards/instructor-dashboard/pages/InstructorLiveClass.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Users,
  Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff,
  PhoneOff, Radio, Clock, ChevronLeft,
  Crown, Settings,
} from "lucide-react";
import {
  MOCK_SESSIONS, MOCK_PARTICIPANTS,
  type LiveParticipant, type LiveSession,
} from "@/data/liveTypes";

// const MY_ID = "instructor-1"; // Unused for now
// const QUICK_REACTIONS = ["👍", "🔥", "💡", "❓", "👏"]; // Unused for now

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

// ─── Elapsed timer ────────────────────────────────────────────────────────────

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

function MeetingHeader({ session, participantCount, onLeave, onEndForAll }: {
  session: LiveSession; participantCount: number; onLeave: () => void; onEndForAll: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

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
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/25 dark:border-violet-500/30">
          <Radio className="w-3 h-3 text-violet-500 dark:text-violet-400" />
          <span className="text-[10px] font-black text-violet-500 dark:text-violet-400 uppercase tracking-wider">Hosting</span>
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

      <div className="relative">
        <button onClick={() => setShowMenu(p => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-sm shadow-red-900/20">
          <ChevronLeft className="w-3.5 h-3.5" />End
        </button>
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-[#0d1829] border border-gray-200 dark:border-white/[0.1] shadow-2xl overflow-hidden z-50">
              <button onClick={onLeave}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors">
                Leave (students continue)
              </button>
              <button onClick={onEndForAll}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-white/[0.05]">
                End for everyone
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Instructor Stage (same as student but shows "You") ───────────────────────

function InstructorStage({
  video, audio, screen, floatingReactions, session,
}: {
  video: boolean; audio: boolean; screen: boolean;
  floatingReactions: FloatingReaction[];
  session: LiveSession;
}) {
  const initials = "You";

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#0a1525] to-gray-950 dark:from-[#060d18] dark:via-[#080f1e] dark:to-[#030810]" />
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "24px 24px" }} />
      <div className={`absolute top-0 right-0 w-96 h-80 bg-gradient-to-br ${session.courseColor} opacity-[0.06] blur-3xl pointer-events-none`} />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {screen ? (
          <div className="flex flex-col items-center gap-5">
            <div className="w-64 h-40 rounded-2xl border border-violet-500/25 bg-violet-500/[0.05] flex flex-col items-center justify-center gap-3 shadow-2xl">
              <MonitorUp className="w-10 h-10 text-violet-400/60" />
              <span className="text-xs text-violet-300/50 font-semibold">Sharing screen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px] font-black">{initials}</div>
              <span className="text-white/80 text-sm font-bold">You (Host)</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            {audio && [1, 2, 3].map(i => (
              <motion.div key={i}
                animate={{ scale: [1, 1.2 + i * 0.15], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
                className="absolute w-48 h-48 rounded-full border border-violet-500/25"
              />
            ))}

            <div className="relative z-10">
              <div className="w-32 h-32 rounded-full bg-violet-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                {initials}
              </div>
              {audio && (
                <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.3, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-violet-500/50" />
              )}
              {audio && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-violet-500 border-2 border-[#060d18] flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {!audio && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 border-2 border-[#060d18] flex items-center justify-center">
                  <MicOff className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 z-10">
              <span className="text-white text-xl font-black tracking-tight">You (Host)</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold text-white bg-violet-600/80">
                <Crown className="w-2.5 h-2.5" />Instructor
              </div>
            </div>

            {!video && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <VideoOff className="w-8 h-8 text-white" />
                  <span className="text-xs text-white font-semibold">Camera Off</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {floatingReactions.map(r => (
          <motion.div key={r.id}
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -180, opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute bottom-8 pointer-events-none z-30 text-3xl select-none"
            style={{ left: `${r.x}%` }}>
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Student Roster (reuse from student page) ─────────────────────────────────

function StudentTile({ p }: { p: LiveParticipant }) {
  const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all flex-shrink-0 w-[72px] ${
      p.isSpeaking
        ? "border-blue-500/40 bg-blue-500/[0.06] shadow-[0_0_12px_rgba(59,130,246,0.1)]"
        : "border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02]"
    }`}>
      <div className="relative">
        <div className={`w-9 h-9 rounded-full ${p.avatarBg} flex items-center justify-center text-white text-[10px] font-black`}>
          {initials}
        </div>
        {p.isSpeaking && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-[#0a1120]" />
        )}
        {p.media.hand && (
          <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.9, repeat: Infinity }}
            className="absolute -top-1.5 -right-1.5 text-sm leading-none">✋</motion.span>
        )}
      </div>
      <span className="text-[9px] font-bold text-gray-600 dark:text-white/50 truncate w-full text-center">
        {p.name.split(" ")[0]}
      </span>
      {!p.media.audio && (
        <MicOff className="w-2.5 h-2.5 text-red-400 absolute top-1.5 left-1.5" />
      )}
    </div>
  );
}

function StudentRoster({ students }: { students: LiveParticipant[] }) {
  return (
    <div className="flex-shrink-0 border-t border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-[#08111f] px-4 py-2.5">
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest flex-shrink-0 whitespace-nowrap">
          Attendees · {students.length}
        </span>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {students.map(p => (
            <StudentTile key={p.id} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Controls (Instructor — has video/screen share) ────────────────────────────

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
            ? "bg-violet-600 text-white shadow-sm shadow-violet-900/20"
            : "bg-gray-100 dark:bg-white/[0.07] border border-gray-200 dark:border-white/[0.1] text-gray-500 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/[0.12] hover:text-gray-700 dark:hover:text-white"
        }`}>
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-violet-500 text-white text-[8px] font-black flex items-center justify-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
      <span className="text-[9px] text-gray-400 dark:text-white/30 font-semibold">{label}</span>
    </div>
  );
}

function Controls({ audio, video, screen, onToggleAudio, onToggleVideo, onToggleScreen, onLeave,
  onOpenChat, onOpenParticipants, chatUnread }: {
  audio: boolean; video: boolean; screen: boolean;
  onToggleAudio: () => void; onToggleVideo: () => void; onToggleScreen: () => void; onLeave: () => void;
  onOpenChat: () => void; onOpenParticipants: () => void;
  chatUnread?: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0a1120] border-t border-gray-200 dark:border-white/[0.06] flex-shrink-0">
      <ControlBtn onClick={onToggleAudio} off={!audio} label={audio ? "Mute" : "Unmute"}>
        {audio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </ControlBtn>
      <ControlBtn onClick={onToggleVideo} off={!video} label={video ? "Stop" : "Video"}>
        {video ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
      </ControlBtn>
      <ControlBtn onClick={onToggleScreen} active={screen} label={screen ? "Stop" : "Share"}>
        {screen ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
      </ControlBtn>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/[0.08] mx-0.5" />

      <ControlBtn onClick={onOpenChat} label="Chat" badge={chatUnread}>
        <MessageSquare className="w-4 h-4" />
      </ControlBtn>
      <ControlBtn onClick={onOpenParticipants} label="People">
        <Users className="w-4 h-4" />
      </ControlBtn>
      <ControlBtn onClick={() => {}} label="Settings">
        <Settings className="w-4 h-4" />
      </ControlBtn>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/[0.08] mx-0.5" />

      <ControlBtn onClick={onLeave} danger label="End">
        <PhoneOff className="w-4 h-4" />
      </ControlBtn>
    </div>
  );
}

// ─── Right Panel (Chat/Participants - reuse from student) ─────────────────────

// [Reuse LiveChat, PollWidget, ParticipantList components from student page]
// For brevity, I'll import them conceptually

type PanelType = "chat" | "participants" | null;

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorLiveClass() {
  const navigate = useNavigate();
  const { id: sessionId } = useParams();
  const location = useLocation();

  const [audio, setAudio] = useState(location.state?.audio ?? true);
  const [video, setVideo] = useState(location.state?.video ?? false);
  const [screen, setScreen] = useState(false);
  const [panel, setPanel] = useState<PanelType>(null);
  const [floatingReactions] = useState<FloatingReaction[]>([]);

  const session = MOCK_SESSIONS.find(s => s.id === sessionId) || MOCK_SESSIONS[0];
  const students = MOCK_PARTICIPANTS.filter(p => p.role === "student");

  const handleLeave = () => {
    navigate("/instructor/live");
  };

  const handleEndForAll = () => {
    // Mock: end session for everyone
    navigate("/instructor/live");
  };

  // const sendReaction = (emoji: string) => {
  //   const id = `${Date.now()}-${Math.random()}`;
  //   const x = 20 + Math.random() * 60;
  //   setFloatingReactions(p => [...p, { id, emoji, x }]);
  //   setTimeout(() => setFloatingReactions(p => p.filter(r => r.id !== id)), 2500);
  // };

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-[#0a1120]">
      <MeetingHeader 
        session={session} 
        participantCount={students.length + 1} 
        onLeave={handleLeave}
        onEndForAll={handleEndForAll}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <InstructorStage
            video={video}
            audio={audio}
            screen={screen}
            floatingReactions={floatingReactions}
            session={session}
          />
          <StudentRoster students={students} />
          <Controls
            audio={audio}
            video={video}
            screen={screen}
            onToggleAudio={() => setAudio((p: boolean) => !p)}
            onToggleVideo={() => setVideo((p: boolean) => !p)}
            onToggleScreen={() => setScreen(p => !p)}
            onLeave={handleLeave}
            onOpenChat={() => setPanel(p => p === "chat" ? null : "chat")}
            onOpenParticipants={() => setPanel(p => p === "participants" ? null : "participants")}
          />
        </div>

        {/* Right panel placeholder */}
        {panel && (
          <div className="w-80 border-l border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[#0a1120]">
            <div className="p-4">
              <p className="text-sm text-gray-500">Panel: {panel}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
