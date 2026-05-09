// src/dashboards/student-dashboard/pages/StudentLiveLobby.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Radio, BookOpen, Play,
  Headphones, AlertCircle, RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SchedulingService, { type LiveSession } from "@/services/scheduling.service";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06] ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
      {/* Left column */}
      <div className="space-y-5">
        {/* Tab bar */}
        <Sk className="h-10 w-56 rounded-2xl" />
        {/* Session cards */}
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] p-5 flex items-center gap-4">
            <Sk className="w-12 h-12 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Sk className="h-3 w-20 rounded-lg" />
              <Sk className="h-4 w-3/4 rounded-lg" />
              <Sk className="h-3 w-1/2 rounded-lg" />
            </div>
            <Sk className="h-9 w-24 rounded-2xl flex-shrink-0" />
          </div>
        ))}
      </div>
      {/* Right column */}
      <div className="space-y-4">
        <Sk className="h-44 rounded-2xl" />
        <Sk className="h-16 rounded-2xl" />
      </div>
    </div>
  );
}

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

/** Backend allows joining 5 minutes before scheduledAt */
function canJoin(session: LiveSession): boolean {
  if (session.status !== "SCHEDULED" && session.status !== "LIVE") return false;
  return Date.now() >= new Date(session.scheduledAt).getTime() - 5 * 60_000;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    SCHEDULED: { label: "Upcoming",  cls: "bg-blue-500/15 border-blue-500/30 text-blue-500 dark:text-blue-400" },
    LIVE:      { label: "Live Now",  cls: "bg-red-500/15 border-red-500/30 text-red-500 dark:text-red-400" },
    ENDED:     { label: "Ended",     cls: "bg-gray-200/60 border-gray-300/40 text-gray-500 dark:bg-white/[0.06] dark:border-white/[0.1] dark:text-white/30" },
    CANCELLED: { label: "Cancelled", cls: "bg-red-500/10 border-red-400/30 text-red-500 dark:text-red-400" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-gray-100 border-gray-200 text-gray-500" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${cls}`}>
      {status === "LIVE" && (
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {label}
    </span>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session, onJoin }: { session: LiveSession; onJoin: (id: string) => void }) {
  const joinable = canJoin(session);
  const isLive = session.status === "LIVE";

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden transition-all ${isLive
        ? "border-red-500/30 bg-red-500/[0.04] shadow-[0_0_24px_rgba(239,68,68,0.07)]"
        : "border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
      }`}>
      <div className="flex items-center gap-4 p-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StatusBadge status={session.status} />
          </div>
          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{session.title}</p>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 dark:text-white/30 flex-wrap">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(session.scheduledAt)}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(session.scheduledAt)}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />ends {formatTime(session.endsAt)}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          {joinable ? (
            <button onClick={() => onJoin(session.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-900/30">
              <Play className="w-4 h-4 fill-white" />
              {isLive ? "Join Now" : "Join Early"}
            </button>
          ) : session.status === "SCHEDULED" ? (
            <div className="flex flex-col items-end gap-0.5">
              <p className="text-xs font-black text-blue-600 dark:text-blue-400">{formatCountdown(session.scheduledAt)}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/25">1h session</p>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty / Error states ─────────────────────────────────────────────────────

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

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-900/10">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-sm text-red-600 dark:text-red-400 text-center max-w-[280px]">{message}</p>
      <button onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all">
        <RefreshCw className="w-3.5 h-3.5" />Try again
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentLiveLobby() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const {
    data,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["live-sessions"],
    queryFn: () => SchedulingService.listSessions({ limit: 100 }),
    // Live sessions change frequently — keep stale time short so the list
    // stays fresh when the student navigates back to this page.
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // poll every minute for status changes
  });

  const sessions = Array.isArray(data?.data) ? data.data : [];
  const error = isError ? (queryError instanceof Error ? queryError.message : "Failed to load sessions.") : "";

  const liveSessions     = sessions.filter(s => s.status === "LIVE");
  const upcomingSessions = sessions.filter(s => s.status === "SCHEDULED");
  const pastSessions     = sessions.filter(s => s.status === "ENDED" || s.status === "CANCELLED");

  const handleJoin = (sessionId: string) => navigate(`/student/live/${sessionId}`);

  return (
    <div className="min-h-screen bg-white dark:bg-[#060d18] rounded-2xl transition-colors">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-red-500/[0.03] dark:bg-red-800/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-900/20">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Live Classes</h1>
                <p className="text-xs text-gray-400 dark:text-white/30">Join your instructor's live sessions</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* ── Skeleton while loading ── */}
          {loading && <PageSkeleton />}

          {/* ── Left: Session list ── */}
          {!loading && (
          <div className="space-y-5">

            {/* Live NOW banner */}
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
                { id: "upcoming" as const, label: `Upcoming (${upcomingSessions.length})` },
                { id: "past"     as const, label: `Past (${pastSessions.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.id
                    ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60"
                  }`}>{t.label}
                </button>
              ))}
            </div>

            {error && <ErrorState message={error} onRetry={refetch} />}

            {!error && (
              <AnimatePresence mode="wait">
                {tab === "upcoming" && (
                  <motion.div key="up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {upcomingSessions.length === 0
                      ? <EmptyState message="No upcoming sessions scheduled yet. Check back soon." />
                      : upcomingSessions.map(s => <SessionCard key={s.id} session={s} onJoin={handleJoin} />)
                    }
                  </motion.div>
                )}
                {tab === "past" && (
                  <motion.div key="past" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {pastSessions.length === 0
                      ? <EmptyState message="No past sessions yet." />
                      : pastSessions.map(s => <SessionCard key={s.id} session={s} onJoin={handleJoin} />)
                    }
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
          )}

          {/* ── Right: Info panel ── */}
          {!loading && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="space-y-4 lg:sticky lg:top-6">

            {/* Next joinable */}
            {(() => {
              const next = [...liveSessions, ...upcomingSessions].find(s => canJoin(s));
              if (!next) return (
                <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-5 space-y-3">
                  <p className="text-xs font-black text-gray-400 dark:text-white/25 uppercase tracking-widest">Next Session</p>
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center">
                      <Radio className="w-6 h-6 text-gray-300 dark:text-white/20" />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-white/30 text-center">No sessions ready to join right now</p>
                  </div>
                </div>
              );
              return (
                <div className="rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-300/50 dark:border-red-500/25 p-5 space-y-4">
                  <p className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-widest">Ready to Join</p>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-900 dark:text-white">{next.title}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">
                      {new Date(next.scheduledAt).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button onClick={() => handleJoin(next.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-900/20">
                    <Play className="w-4 h-4 fill-white" />
                    {next.status === "LIVE" ? "Join Now" : "Join Early"}
                  </button>
                </div>
              );
            })()}

            {/* Listener info */}
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-4 flex gap-3">
              <Headphones className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300/70 leading-relaxed">
                You join as a <span className="font-bold">listener</span> — mic muted by default, no camera. You can unmute, raise your hand, and chat freely.
              </p>
            </div>
          </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
