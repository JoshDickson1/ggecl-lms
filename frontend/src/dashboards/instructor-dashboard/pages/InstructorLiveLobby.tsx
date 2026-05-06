// src/dashboards/instructor-dashboard/pages/InstructorLiveLobby.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock,
  Radio, BookOpen, Play, Crown, Plus, X,
  AlertCircle, Loader2, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import SchedulingService, { type LiveSession } from "@/services/scheduling.service";
import CoursesService, { type CourseResponse } from "@/services/course.service";
import UserService from "@/services/user.service";
import { useDashboardUser } from "@/hooks/useDashboardUser";

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
function canJoinSession(session: LiveSession): boolean {
  if (session.status !== "SCHEDULED" && session.status !== "LIVE") return false;
  return Date.now() >= new Date(session.scheduledAt).getTime() - 5 * 60_000;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    SCHEDULED: { label: "Upcoming",   cls: "bg-blue-500/15 border-blue-500/30 text-blue-500 dark:text-blue-400" },
    LIVE:      { label: "Live Now",   cls: "bg-violet-500/15 border-violet-500/30 text-violet-500 dark:text-violet-400" },
    ENDED:     { label: "Ended",      cls: "bg-gray-200/60 border-gray-300/40 text-gray-500 dark:bg-white/[0.06] dark:border-white/[0.1] dark:text-white/30" },
    CANCELLED: { label: "Cancelled",  cls: "bg-red-500/10 border-red-400/30 text-red-500 dark:text-red-400" },
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

// ─── Calendar Schedule Modal ──────────────────────────────────────────────────

interface ScheduleModalProps {
  instructorProfileId: string;
  sessions: LiveSession[];
  onClose: () => void;
  onCreated: () => void;
}

function ScheduleModal({ instructorProfileId, sessions, onClose, onCreated }: ScheduleModalProps) {
  const [step, setStep] = useState<"calendar" | "details">("calendar");
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(now.getFullYear(), now.getMonth(), diff);
  });

  useEffect(() => {
    CoursesService.findAll<CourseResponse>({ limit: 100 })
      .then(res => setCourses(Array.isArray(res.items) ? res.items : []))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, []);

  // Generate week days (Mon-Sun)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // Time slots (8am - 8pm, hourly)
  const timeSlots = useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => 8 + i); // 8, 9, ..., 20
  }, []);

  // Check if a slot is occupied
  function isSlotOccupied(day: Date, hour: number): boolean {
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1);

    return sessions.some(s => {
      if (s.status === "CANCELLED" || s.status === "ENDED") return false;
      const sessionStart = new Date(s.scheduledAt);
      const sessionEnd = new Date(s.endsAt);
      // Check overlap
      return slotStart < sessionEnd && slotEnd > sessionStart;
    });
  }

  // Check if slot is in the past
  function isSlotPast(day: Date, hour: number): boolean {
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);
    return slotStart < new Date();
  }

  function handleSlotClick(day: Date, hour: number) {
    if (isSlotPast(day, hour) || isSlotOccupied(day, hour)) return;
    const slot = new Date(day);
    slot.setHours(hour, 0, 0, 0);
    setSelectedSlot(slot);
    setStep("details");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !courseId || !selectedSlot) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    try {
      await SchedulingService.scheduleSession({
        title: title.trim(),
        courseId,
        instructorId: instructorProfileId,
        scheduledAt: selectedSlot.toISOString(),
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to schedule session.");
    } finally {
      setSubmitting(false);
    }
  }

  function goToPrevWeek() {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  }

  function goToNextWeek() {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  }

  function goToThisWeek() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    setWeekStart(new Date(now.getFullYear(), now.getMonth(), diff));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-5xl rounded-3xl bg-white dark:bg-[#0d1829] border border-gray-200 dark:border-white/[0.08] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 dark:text-white">
                {step === "calendar" ? "Pick a Time Slot" : "Session Details"}
              </h2>
              <p className="text-[11px] text-gray-400 dark:text-white/30">
                {step === "calendar" ? "Click an open slot to schedule" : "Sessions are exactly 1 hour"}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === "calendar" ? (
            <div className="p-6 space-y-4">
              {/* Week navigation */}
              <div className="flex items-center justify-between">
                <button onClick={goToPrevWeek}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" />Prev
                </button>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    {weekDays[0].toLocaleDateString([], { month: "long", year: "numeric" })}
                  </span>
                  <button onClick={goToThisWeek}
                    className="text-[10px] text-violet-500 dark:text-violet-400 font-bold hover:underline">
                    Today
                  </button>
                </div>
                <button onClick={goToNextWeek}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all">
                  Next<ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Calendar grid */}
              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-8 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/[0.07]">
                  <div className="p-2 text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider"></div>
                  {weekDays.map((day, i) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div key={i} className="p-2 text-center">
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-violet-500 dark:text-violet-400" : "text-gray-500 dark:text-white/40"}`}>
                          {day.toLocaleDateString([], { weekday: "short" })}
                        </div>
                        <div className={`text-xs font-black ${isToday ? "text-violet-600 dark:text-violet-400" : "text-gray-900 dark:text-white"}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                {timeSlots.map(hour => (
                  <div key={hour} className="grid grid-cols-8 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                    {/* Time label */}
                    <div className="p-2 text-[11px] font-bold text-gray-400 dark:text-white/30 text-right pr-3">
                      {hour}:00
                    </div>
                    {/* Day cells */}
                    {weekDays.map((day, i) => {
                      const occupied = isSlotOccupied(day, hour);
                      const past = isSlotPast(day, hour);
                      const disabled = occupied || past;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleSlotClick(day, hour)}
                          className={`p-2 text-[10px] font-semibold transition-all border-r border-gray-100 dark:border-white/[0.04] last:border-0 ${
                            disabled
                              ? occupied
                                ? "bg-red-50 dark:bg-red-900/10 text-red-400 dark:text-red-400/60 cursor-not-allowed"
                                : "bg-gray-50 dark:bg-white/[0.02] text-gray-300 dark:text-white/10 cursor-not-allowed"
                              : "hover:bg-violet-50 dark:hover:bg-violet-900/10 text-gray-600 dark:text-white/50 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer"
                          }`}
                        >
                          {occupied ? "Booked" : past ? "—" : "Open"}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-violet-100 dark:bg-violet-900/20 border border-violet-300 dark:border-violet-500/30"></div>
                  <span className="text-[10px] text-gray-500 dark:text-white/40">Open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30"></div>
                  <span className="text-[10px] text-gray-500 dark:text-white/40">Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]"></div>
                  <span className="text-[10px] text-gray-500 dark:text-white/40">Past</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Selected time */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-500/20">
                <Clock className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
                  {selectedSlot?.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <button type="button" onClick={() => setStep("calendar")}
                  className="ml-auto text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline">
                  Change
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider">
                  Session Title
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to React — Live Q&A"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                />
              </div>

              {/* Course */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider">
                  Course
                </label>
                {loadingCourses ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Loading courses…</span>
                  </div>
                ) : (
                  <select
                    value={courseId}
                    onChange={e => setCourseId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                  >
                    <option value="">Select a course…</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-500/25">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep("calendar")}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-white/50 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.09] transition-all">
                  Back
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-900/20">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
                  {submitting ? "Scheduling…" : "Schedule Session"}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session, onJoin }: {
  session: LiveSession;
  onJoin: (id: string) => void;
}) {
  const joinable = canJoinSession(session);
  const isLive = session.status === "LIVE";

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden transition-all ${isLive
        ? "border-violet-500/30 bg-violet-500/[0.04] shadow-[0_0_24px_rgba(139,92,246,0.07)]"
        : "border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
      }`}>
      <div className="flex items-center gap-4 p-5">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Radio className="w-5 h-5 text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StatusBadge status={session.status} />
            <span className="text-[10px] text-gray-400 dark:text-white/25 font-bold uppercase tracking-wider truncate">
              {session.courseId}
            </span>
          </div>
          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{session.title}</p>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 dark:text-white/30 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />{formatDate(session.scheduledAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{formatTime(session.scheduledAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />ends {formatTime(session.endsAt)}
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="flex-shrink-0 text-right">
          {joinable ? (
            <button onClick={() => onJoin(session.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30">
              <Play className="w-4 h-4 fill-white" />
              {isLive ? "Join Live" : "Start Session"}
            </button>
          ) : session.status === "SCHEDULED" ? (
            <div className="flex flex-col items-end gap-0.5">
              <p className="text-xs font-black text-violet-500 dark:text-violet-400">
                {formatCountdown(session.scheduledAt)}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-white/25">1h session</p>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

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

// ─── Error State ──────────────────────────────────────────────────────────────

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

export default function InstructorLiveLobby() {
  const navigate = useNavigate();
  const { user: _user } = useDashboardUser();

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // InstructorProfile.id !== User.id — fetch it from /users/mine
  const [instructorProfileId, setInstructorProfileId] = useState("");

  useEffect(() => {
    UserService.getMe()
      .then((me) => {
        const profile = (me as { instructorProfile?: { id: string } }).instructorProfile;
        if (profile?.id) setInstructorProfileId(profile.id);
      })
      .catch(() => {
        // surface the real error at submit time rather than silently using wrong id
      });
  }, []);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await SchedulingService.listSessions({ limit: 100 });
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const liveSessions     = sessions.filter(s => s.status === "LIVE");
  const upcomingSessions = sessions.filter(s => s.status === "SCHEDULED");
  const pastSessions     = sessions.filter(s => s.status === "ENDED" || s.status === "CANCELLED");

  const handleJoin = (sessionId: string) => {
    navigate(`/instructor/live/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#060d18] rounded-2xl transition-colors">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-violet-500/[0.03] dark:bg-violet-800/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-900/20">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Live Sessions</h1>
                <p className="text-xs text-gray-400 dark:text-white/30">Schedule and host live classes with your students</p>
              </div>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/20">
              <Plus className="w-4 h-4" />Schedule Session
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ── Left: Session List ── */}
          <div className="space-y-5">

            {/* Live NOW banner */}
            <AnimatePresence>
              {liveSessions.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl overflow-hidden border border-violet-500/25 bg-violet-50 dark:bg-gradient-to-br dark:from-violet-950/80 dark:to-[#0d1829]">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-violet-500" />
                    <span className="text-xs font-black text-violet-500 dark:text-violet-400 uppercase tracking-widest">Live Now</span>
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

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            )}

            {/* Error */}
            {!loading && error && <ErrorState message={error} onRetry={loadSessions} />}

            {/* Session lists */}
            {!loading && !error && (
              <AnimatePresence mode="wait">
                {tab === "upcoming" && (
                  <motion.div key="up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {upcomingSessions.length === 0
                      ? <EmptyState message="No upcoming sessions. Click 'Schedule Session' to create one." />
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

          {/* ── Right: Next Up panel ── */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="space-y-4 lg:sticky lg:top-6">

            {/* Next joinable session */}
            {(() => {
              const next = [...liveSessions, ...upcomingSessions].find(s => canJoinSession(s));
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
                <div className="rounded-2xl bg-violet-50 dark:bg-violet-900/10 border border-violet-300/50 dark:border-violet-500/25 p-5 space-y-4">
                  <p className="text-xs font-black text-violet-500 dark:text-violet-400 uppercase tracking-widest">Ready to Join</p>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-900 dark:text-white">{next.title}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">
                      {new Date(next.scheduledAt).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoin(next.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/20"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    {next.status === "LIVE" ? "Join Live Now" : "Start Session"}
                  </button>
                </div>
              );
            })()}

            {/* Upcoming this week */}
            {upcomingSessions.length > 0 && (
              <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4 space-y-3">
                <p className="text-xs font-black text-gray-400 dark:text-white/25 uppercase tracking-widest">Upcoming This Week</p>
                <div className="space-y-2">
                  {upcomingSessions.slice(0, 4).map(s => (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
                        <Radio className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{s.title}</p>
                        <p className="text-[10px] text-gray-400 dark:text-white/30">
                          {new Date(s.scheduledAt).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {upcomingSessions.length > 4 && (
                    <p className="text-[10px] text-gray-400 dark:text-white/30 text-center pt-1">
                      +{upcomingSessions.length - 4} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Info callout */}
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-4 flex gap-3">
              <Crown className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300/70 leading-relaxed">
                You join as <span className="font-bold">host</span> with camera and mic on. Students join as listeners. Sessions end automatically after 1 hour.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <ScheduleModal
            instructorProfileId={instructorProfileId}
            sessions={sessions}
            onClose={() => setShowScheduleModal(false)}
            onCreated={loadSessions}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
