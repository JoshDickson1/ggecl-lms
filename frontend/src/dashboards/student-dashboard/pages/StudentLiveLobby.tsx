// src/dashboards/student-dashboard/pages/StudentLiveLobby.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, Calendar, Clock,
  Users, Radio, BookOpen, Play,
} from "lucide-react";
import { MOCK_SESSIONS } from "@/data/liveTypes";
import type { LiveSession } from "@/data/liveTypes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCountdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Starting now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}


// ─── Camera preview card ──────────────────────────────────────────────────────

function DevicePreview({
  audio, video, onToggleAudio, onToggleVideo, name,
}: {
  audio: boolean; video: boolean; name: string;
  onToggleAudio: () => void; onToggleVideo: () => void;
}) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="rounded-3xl overflow-hidden bg-gray-900 dark:bg-[#0d1829] border border-gray-700 dark:border-white/[0.07] shadow-2xl">
      {/* Video area */}
      <div className="aspect-video relative bg-gradient-to-br from-gray-800 dark:from-[#0a1120] to-gray-900 dark:to-[#060d18] flex items-center justify-center">
        {video ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-indigo-900/20">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-xl">
              {initials}
            </div>
            <p className="absolute bottom-3 left-4 text-[10px] text-white/30 font-bold">CAMERA PREVIEW</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-white/25" />
            </div>
            <p className="text-sm text-white/30 font-semibold">Camera is off</p>
          </div>
        )}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/50 backdrop-blur-sm border border-white/[0.08]">
          <span className="text-xs font-bold text-white/70">{name}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-6 py-5">
        <button onClick={onToggleAudio}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${audio
              ? "bg-white/[0.07] border border-white/[0.1] text-white/70 hover:bg-white/[0.12]"
              : "bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25"
            }`}>
          {audio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          {audio ? "Mute" : "Unmute"}
        </button>
        <button onClick={onToggleVideo}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${video
              ? "bg-white/[0.07] border border-white/[0.1] text-white/70 hover:bg-white/[0.12]"
              : "bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25"
            }`}>
          {video ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          {video ? "Stop Video" : "Start Video"}
        </button>
      </div>
    </div>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session, onJoin }: { session: LiveSession; onJoin: (id: string) => void }) {
  const isLive = session.status === "live";
  const initials = session.instructorName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden transition-all ${isLive
          ? "border-red-500/30 bg-red-500/[0.04] dark:bg-red-500/[0.04] shadow-[0_0_24px_rgba(239,68,68,0.07)]"
          : "border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
        }`}>
      <div className="flex items-center gap-4 p-5">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${session.courseColor} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
          {session.courseIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isLive && (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/15 border border-red-500/30 text-[10px] font-black text-red-500 dark:text-red-400 uppercase tracking-wider">
                <Radio className="w-2.5 h-2.5" /> Live
              </motion.span>
            )}
            <span className="text-[10px] text-gray-400 dark:text-white/25 font-bold uppercase tracking-wider">{session.courseName}</span>
          </div>
          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{session.title}</p>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 dark:text-white/30">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(session.scheduledAt)}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(session.scheduledAt)}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{session.enrolledCount} enrolled</span>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className={`w-9 h-9 rounded-full ${session.instructorAvatarBg} flex items-center justify-center text-white text-xs font-black`}>{initials}</div>
          <span className="text-[10px] text-gray-400 dark:text-white/30 text-center max-w-[72px] truncate">{session.instructorName.split(" ")[0]}</span>
        </div>
        <div className="flex-shrink-0">
          {isLive ? (
            <button onClick={() => onJoin(session.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-900/30">
              <Play className="w-4 h-4 fill-white" />Join Now
            </button>
          ) : (
            <div className="text-right">
              <p className="text-xs font-black text-blue-600 dark:text-blue-400">{formatCountdown(session.scheduledAt)}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/25">{session.durationMinutes}m session</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.07]">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center">
        <BookOpen className="w-7 h-7 text-gray-300 dark:text-white/20" />
      </div>
      <p className="text-sm text-gray-400 dark:text-white/30 text-center max-w-[240px]">{message}</p>
    </div>
  );
}


// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentLiveLobby() {
  const navigate = useNavigate();
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "recordings">("upcoming");

  const liveSessions = MOCK_SESSIONS.filter(s => s.status === "live");
  const upcomingSessions = MOCK_SESSIONS.filter(s => s.status === "scheduled");

  const handleJoin = (sessionId: string) => {
    // Navigate to live room, passing media prefs via state
    navigate(`/student/live/${sessionId}`, { state: { audio, video } });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#060d18] rounded-2xl transition-colors">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-500/[0.03] dark:bg-blue-800/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-900/20">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Live Classes</h1>
              <p className="text-xs text-gray-400 dark:text-white/30">Check your device, then join</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* Left */}
          <div className="space-y-5">

            {/* Live NOW */}
            <AnimatePresence>
              {liveSessions.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl overflow-hidden border border-red-500/25 bg-red-50 dark:bg-gradient-to-br dark:from-red-950/80 dark:to-[#0d1829]">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-widest">Happening Now</span>
                  </div>
                  <div className="px-4 pb-4 space-y-3">
                    {liveSessions.map(s => <SessionCard key={s.id} session={s} onJoin={handleJoin} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
              {[
                { id: "upcoming", label: `Upcoming (${upcomingSessions.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.id
                      ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60"
                    }`}>{t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "upcoming" && (
                <motion.div key="up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {upcomingSessions.length === 0
                    ? <EmptyState message="No upcoming sessions scheduled yet. Check back soon." />
                    : upcomingSessions.map(s => <SessionCard key={s.id} session={s} onJoin={handleJoin} />)
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right — device check */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="space-y-4 lg:sticky lg:top-6">
            <p className="text-xs font-black text-gray-400 dark:text-white/25 uppercase tracking-widest px-1">Device Check</p>
            <DevicePreview
              audio={audio} video={video} name="You"
              onToggleAudio={() => setAudio(p => !p)}
              onToggleVideo={() => setVideo(p => !p)}
            />
            <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.05] p-4 space-y-2.5">
              {[
                { label: "Microphone", ok: audio, hint: audio ? "Ready" : "Off" },
                { label: "Camera", ok: video, hint: video ? "Ready" : "Off" },
                { label: "Connection", ok: true, hint: "Good" },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-white/40">{r.label}</span>
                  <span className={`text-xs font-bold ${r.ok ? "text-emerald-500" : "text-amber-400"}`}>{r.hint}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}