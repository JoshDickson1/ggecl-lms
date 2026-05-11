// src/dashboards/admin-dashboard/pages/AdminLiveLobby.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock,
  Radio, BookOpen, Play, Settings, Loader2, AlertCircle, RefreshCw,
  Edit, Trash2, XCircle, MoreVertical, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import SchedulingService, { type LiveSession } from "@/services/scheduling.service";
import CoursesService, { type CourseResponse } from "@/services/course.service";

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
    LIVE:      { label: "Live Now",   cls: "bg-amber-500/15 border-amber-500/30 text-amber-500 dark:text-amber-400" },
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

// ─── Update Session Modal ─────────────────────────────────────────────────────

interface UpdateModalProps {
  session: LiveSession;
  sessions: LiveSession[];
  onClose: () => void;
  onUpdated: () => void;
}

function UpdateModal({ session, sessions, onClose, onUpdated }: UpdateModalProps) {
  const [step, setStep] = useState<"calendar" | "details">("details");
  const [selectedSlot, setSelectedSlot] = useState<Date>(() => new Date(session.scheduledAt));
  const [title, setTitle] = useState(session.title);
  const [courseId, setCourseId] = useState(session.courseId);
  const [instructorId, setInstructorId] = useState(session.instructorId);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [weekStart, setWeekStart] = useState(() => {
    const date = new Date(session.scheduledAt);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.getFullYear(), date.getMonth(), diff);
  });

  useEffect(() => {
    CoursesService.findAll<CourseResponse>({ limit: 100 })
      .then(res => setCourses(Array.isArray(res.items) ? res.items : []))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const timeSlots = useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => 8 + i);
  }, []);

  function isSlotOccupied(day: Date, hour: number): boolean {
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1);

    return sessions.some(s => {
      if (s.id === session.id) return false; // Exclude current session
      if (s.status === "CANCELLED" || s.status === "ENDED") return false;
      const sessionStart = new Date(s.scheduledAt);
      const sessionEnd = new Date(s.endsAt);
      return slotStart < sessionEnd && slotEnd > sessionStart;
    });
  }

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
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      await SchedulingService.updateSession(session.id, {
        title: title.trim(),
        scheduledAt: selectedSlot.toISOString(),
      });
      onUpdated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update session.");
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-5xl rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0d1829] border border-gray-200 dark:border-white/[0.08] shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                {step === "calendar" ? "Pick a New Time Slot" : "Update Session Details"}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-white/30">
                {step === "calendar" ? "Click an open slot to reschedule" : "Modify session information"}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors flex-shrink-0">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === "calendar" ? (
            <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
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
                    className="text-[10px] text-amber-500 dark:text-amber-400 font-bold hover:underline">
                    Today
                  </button>
                </div>
                <button onClick={goToNextWeek}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all">
                  Next<ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Calendar grid */}
              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] overflow-x-auto">
                {/* Day headers */}
                <div className="grid grid-cols-8 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/[0.07] min-w-[600px]">
                  <div className="p-1.5 sm:p-2 text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider"></div>
                  {weekDays.map((day, i) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div key={i} className="p-1.5 sm:p-2 text-center">
                        <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-amber-500 dark:text-amber-400" : "text-gray-500 dark:text-white/40"}`}>
                          {day.toLocaleDateString([], { weekday: "short" })}
                        </div>
                        <div className={`text-xs font-black ${isToday ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                {timeSlots.map(hour => (
                  <div key={hour} className="grid grid-cols-8 border-b border-gray-100 dark:border-white/[0.04] last:border-0 min-w-[600px]">
                    <div className="p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-white/30 text-right pr-2 sm:pr-3">
                      {hour}:00
                    </div>
                    {weekDays.map((day, i) => {
                      const occupied = isSlotOccupied(day, hour);
                      const past = isSlotPast(day, hour);
                      const disabled = occupied || past;
                      const isSelected = selectedSlot.getDate() === day.getDate() && 
                                        selectedSlot.getMonth() === day.getMonth() && 
                                        selectedSlot.getHours() === hour;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleSlotClick(day, hour)}
                          className={`p-1.5 sm:p-2 text-[9px] sm:text-[10px] font-semibold transition-all border-r border-gray-100 dark:border-white/[0.04] last:border-0 ${
                            isSelected
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-black"
                              : disabled
                              ? occupied
                                ? "bg-red-50 dark:bg-red-900/10 text-red-400 dark:text-red-400/60 cursor-not-allowed"
                                : "bg-gray-50 dark:bg-white/[0.02] text-gray-300 dark:text-white/10 cursor-not-allowed"
                              : "hover:bg-amber-50 dark:hover:bg-amber-900/10 text-gray-600 dark:text-white/50 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                          }`}
                        >
                          {isSelected ? "Selected" : occupied ? "Booked" : past ? "—" : "Open"}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-500/30"></div>
                  <span className="text-[10px] text-gray-500 dark:text-white/40">Selected</span>
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
            <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
              {/* Selected time */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 truncate">
                  {selectedSlot.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <button type="button" onClick={() => setStep("calendar")}
                  className="ml-auto text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline flex-shrink-0">
                  Change
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider">
                  Session Title
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to React — Live Q&A"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                />
              </div>

              {/* Course (read-only) */}
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider">
                  Course
                </label>
                {loadingCourses ? (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]">
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-400">Loading courses…</span>
                  </div>
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.08] text-xs sm:text-sm text-gray-500 dark:text-white/40">
                    {courses.find(c => c.id === courseId)?.title || courseId} (Cannot be changed)
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-500/25">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
                <button type="button" onClick={() => setStep("calendar")}
                  className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-600 dark:text-white/50 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.09] transition-all">
                  Change Time
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/20">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {submitting ? "Updating…" : "Update Session"}
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

function SessionCard({ session, onJoin, onUpdate, onDelete, onCancel }: {
  session: LiveSession;
  onJoin: (id: string) => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const joinable = canJoinSession(session);
  const isLive = session.status === "LIVE";
  const canModify = session.status === "SCHEDULED"; // Can only update/delete scheduled sessions
  const canCancel = session.status === "SCHEDULED"; // Can only cancel scheduled sessions

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden transition-all ${isLive
        ? "border-amber-500/30 bg-amber-500/[0.04] shadow-[0_0_24px_rgba(245,158,11,0.07)]"
        : "border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
      }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
        {/* Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StatusBadge status={session.status} />
            <span className="text-[10px] text-gray-400 dark:text-white/25 font-bold uppercase tracking-wider truncate">
              {session.courseId}
            </span>
          </div>
          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{session.title}</p>
          <div className="flex items-center gap-3 sm:gap-4 mt-1.5 text-xs text-gray-400 dark:text-white/30 flex-wrap">
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

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
          {/* Join/Status */}
          <div className="text-right">
            {joinable ? (
              <button onClick={() => onJoin(session.id)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/30">
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                {isLive ? "Join as Admin" : "Join Session"}
              </button>
            ) : session.status === "SCHEDULED" ? (
              <div className="flex flex-col items-end gap-0.5">
                <p className="text-xs font-black text-amber-500 dark:text-amber-400">
                  {formatCountdown(session.scheduledAt)}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-white/25">1h session</p>
              </div>
            ) : null}
          </div>

          {/* Admin Actions Menu */}
          {(canModify || canCancel) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  
                  {/* Menu */}
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-[#0d1829] border border-gray-200 dark:border-white/[0.1] shadow-xl overflow-hidden z-20">
                    {canModify && (
                      <button
                        onClick={() => { onUpdate(session.id); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Update Session
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => { onCancel(session.id); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors border-t border-gray-100 dark:border-white/[0.05]"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Session
                      </button>
                    )}
                    {canModify && (
                      <button
                        onClick={() => { onDelete(session.id); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-white/[0.05]"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Session
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
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

export default function AdminLiveLobby() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    navigate(`/admin/live/${sessionId}`);
  };

  const handleUpdate = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setShowUpdateModal(true);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      return;
    }

    try {
      await SchedulingService.deleteSession(sessionId);
      loadSessions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete session.");
    }
  };

  const handleCancel = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to cancel this session? Enrolled students will be notified.")) {
      return;
    }

    try {
      await SchedulingService.cancelSession(sessionId);
      loadSessions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel session.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#060d18] rounded-2xl transition-colors">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/[0.03] dark:bg-amber-800/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/20 flex-shrink-0">
                <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Live Sessions</h1>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-white/30">Monitor and join live classes as admin</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Settings
            </button>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* ── Session List ── */}
          <div className="space-y-4 sm:space-y-5">

            {/* Live NOW banner */}
            <AnimatePresence>
              {liveSessions.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/25 bg-amber-50 dark:bg-gradient-to-br dark:from-amber-950/80 dark:to-[#0d1829]">
                  <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 sm:pt-4 pb-2">
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] sm:text-xs font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest">Live Now</span>
                  </div>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
                    {liveSessions.map(s => (
                      <SessionCard 
                        key={s.id} 
                        session={s} 
                        onJoin={handleJoin}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onCancel={handleCancel}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-full sm:w-fit overflow-x-auto">
              {[
                { id: "upcoming" as const, label: `Upcoming (${upcomingSessions.length})` },
                { id: "past"     as const, label: `Past (${pastSessions.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${tab === t.id
                    ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60"
                  }`}>{t.label}
                </button>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            )}

            {/* Error */}
            {!loading && error && <ErrorState message={error} onRetry={loadSessions} />}

            {/* Session lists */}
            {!loading && !error && (
              <AnimatePresence mode="wait">
                {tab === "upcoming" && (
                  <motion.div key="up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 sm:space-y-3">
                    {upcomingSessions.length === 0
                      ? <EmptyState message="No upcoming sessions scheduled." />
                      : upcomingSessions.map(s => (
                          <SessionCard 
                            key={s.id} 
                            session={s} 
                            onJoin={handleJoin}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onCancel={handleCancel}
                          />
                        ))
                    }
                  </motion.div>
                )}
                {tab === "past" && (
                  <motion.div key="past" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 sm:space-y-3">
                    {pastSessions.length === 0
                      ? <EmptyState message="No past sessions yet." />
                      : pastSessions.map(s => (
                          <SessionCard 
                            key={s.id} 
                            session={s} 
                            onJoin={handleJoin}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onCancel={handleCancel}
                          />
                        ))
                    }
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {showUpdateModal && selectedSession && (
          <UpdateModal
            session={selectedSession}
            sessions={sessions}
            onClose={() => {
              setShowUpdateModal(false);
              setSelectedSession(null);
            }}
            onUpdated={() => {
              loadSessions();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
