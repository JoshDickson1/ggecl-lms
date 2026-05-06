import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BookOpen, CheckCircle2, Clock,
  Edit3, Plus, X, Save, Loader2,
  BarChart3, MessageSquare, ChevronDown, GraduationCap,
  TrendingUp, Activity, Timer, Star,
} from "lucide-react";
import CoursesService from "@/services/course.service";
import InstructorDashboardService from "@/services/instructor-dashboard.service";
import ProgressService from "@/services/progress.service";
import ChatService, { type RoomSummaryItem } from "@/services/chat.service";

// ─── Constants ────────────────────────────────────────────────────────────────

const COURSE_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function normalizeCourses(raw: unknown): { id: string; title: string }[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as { id: string; title: string }[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.items)) return r.items as { id: string; title: string }[];
  if (Array.isArray(r.data))  return r.data  as { id: string; title: string }[];
  return [];
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] bg-white dark:bg-[#0f1623]
      border border-gray-100 dark:border-white/[0.07]
      shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

// ─── Grade Room Modal (for ChatService rooms) ─────────────────────────────────

function GradeRoomModal({
  room, onClose, onSave, saving,
}: {
  room: RoomSummaryItem;
  onClose: () => void;
  onSave: (payload: Parameters<typeof ChatService.gradeRoom>[1]) => void;
  saving: boolean;
}) {
  const [score,    setScore]    = useState(room.grade?.resolvedGrade ?? 75);
  const [feedback, setFeedback] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px]
          bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10">

        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4
          bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur
          border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              {room.grade?.isGraded ? "Re-grade" : "Grade"} Group
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{room.name}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center hover:bg-gray-200 transition-all">
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Score */}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Score (0–100)</p>
            <div className="relative">
              <input type="number" min={0} max={100} value={score}
                onChange={e => setScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full px-4 py-3 pr-8 rounded-xl text-xl font-black
                  bg-gray-50 dark:bg-white/[0.04]
                  border border-gray-200 dark:border-white/[0.08]
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                  text-gray-900 dark:text-white outline-none transition-all" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">pts</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
              <motion.div animate={{ width: `${score}%` }} transition={{ duration: 0.3 }}
                className={cn("h-full rounded-full",
                  score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
                )} />
            </div>
          </div>

          {/* Feedback */}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Feedback</p>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
              placeholder="Write feedback for this group…"
              className="w-full px-4 py-3 rounded-xl text-sm resize-none
                bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08]
                focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-600 mb-2">Strengths</p>
              <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={3}
                placeholder={"Strong design\nGood collaboration"}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none
                  bg-emerald-50/60 dark:bg-emerald-950/15
                  border border-emerald-100 dark:border-emerald-900/20
                  focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/15
                  text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none transition-all" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 mb-2">Improvements</p>
              <textarea value={improvements} onChange={e => setImprovements(e.target.value)} rows={3}
                placeholder={"Add more tests\nImprove error handling"}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none
                  bg-amber-50/60 dark:bg-amber-950/15
                  border border-amber-100 dark:border-amber-900/20
                  focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15
                  text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none transition-all" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold
                border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
                hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              Cancel
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onSave({
                score,
                feedback:     feedback.trim() || undefined,
                strengths:    strengths.trim() || undefined,
                improvements: improvements.trim() || undefined,
              })}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                saving
                  ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]",
              )}>
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> {room.grade?.isGraded ? "Update Grade" : "Submit Grade"}</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Course Selector ──────────────────────────────────────────────────────────

function CourseSelector({
  courses, selected, onSelect,
}: {
  courses: { id: string; title: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  if (courses.length === 0) return null;
  if (courses.length <= 4) {
    return (
      <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit flex-wrap">
        {courses.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              selected === c.id
                ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
            )}>
            {c.title.length > 22 ? c.title.slice(0, 22) + "…" : c.title}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="relative w-fit">
      <select value={selected} onChange={e => onSelect(e.target.value)}
        className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm font-semibold
          bg-white dark:bg-[#0f1623]
          border border-gray-200 dark:border-white/[0.08]
          text-gray-800 dark:text-white outline-none cursor-pointer
          focus:border-blue-400 transition-all">
        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ─── Progress Tab ─────────────────────────────────────────────────────────────

function ProgressTab() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["instructor-dashboard-summary"],
    queryFn:  () => InstructorDashboardService.getSummary(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: courseAnalytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ["instructor-course-analytics"],
    queryFn:  () => ProgressService.getInstructorCourseAnalytics(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: dashboards = [], isLoading: dashboardsLoading } = useQuery({
    queryKey: ["instructor-student-dashboards"],
    queryFn:  () => InstructorDashboardService.getStudentDashboards(),
    staleTime: 1000 * 60 * 5,
  });

  const reviewsMap = Object.fromEntries(
    (summary?.avgReviews?.perCourse ?? []).map(r => [r.courseId, r])
  );

  // Completion rate: weighted from analytics endpoint
  const overallCompletion = useMemo(() => {
    if (courseAnalytics.length === 0) return summary?.completionRate?.overallRate ?? 0;
    const totalEnrolled  = courseAnalytics.reduce((s, c) => s + c.enrolledCount, 0);
    const totalCompleted = courseAnalytics.reduce((s, c) => s + c.completedCount, 0);
    return totalEnrolled > 0 ? (totalCompleted / totalEnrolled) * 100 : 0;
  }, [courseAnalytics, summary]);

  const totalStudents = dashboards.length;
  const avgRating     = summary?.avgReviews?.overallAverage ?? 0;

  const isLoading = analyticsLoading || dashboardsLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <Fade delay={0.04}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users,      label: "Total Students", value: String(totalStudents),                                                   accent: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/40"    },
            { icon: BookOpen,   label: "Courses",        value: String(courseAnalytics.length),                                          accent: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
            { icon: TrendingUp, label: "Completion Rate",value: overallCompletion > 0 ? `${overallCompletion.toFixed(0)}%` : "—",        accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
            { icon: Star,       label: "Avg Rating",     value: avgRating > 0 ? avgRating.toFixed(1) : "—",                             accent: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/40"  },
          ].map(({ icon: Ic, label, value, accent, bg }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                  <Ic className={`w-4 h-4 ${accent}`} />
                </div>
                <div>
                  <p className={`text-xl font-black leading-none ${accent}`}>{value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Per-course cards */}
      {courseAnalytics.length === 0 ? (
        <Fade delay={0.08}>
          <Card className="p-12 text-center">
            <GraduationCap className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No course data yet. Publish a course to see progress.</p>
          </Card>
        </Fade>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courseAnalytics.map((course, i) => {
            const reviews    = reviewsMap[course.courseId];
            const completion = course.completionRate;
            const avgProgress = course.avgCompletionPercent;

            return (
              <Fade key={course.courseId} delay={0.06 + i * 0.04}>
                <Card className="p-5">
                  {/* Course header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br ${COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]} flex items-center justify-center`}>
                      {course.courseImg
                        ? <img src={course.courseImg} alt={course.courseTitle} className="w-full h-full object-cover" />
                        : <BookOpen className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{course.courseTitle}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Users className="w-2.5 h-2.5" />{course.enrolledCount} students
                        </span>
                        {reviews && reviews.reviewCount > 0 && (
                          <span className="text-[10px] text-amber-500 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />{reviews.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    {/* Avg Completion % */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Activity className="w-3 h-3" />Avg Progress
                        </span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {avgProgress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${avgProgress}%` }}
                          transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />Completion
                        </span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {completion.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completion}%` }}
                          transition={{ duration: 0.8, delay: 0.15 + i * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom stats */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {course.inProgressCount}
                      </p>
                      <p className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
                        <Activity className="w-2.5 h-2.5" />In Progress
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {course.completedCount}/{course.enrolledCount}
                      </p>
                      <p className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />Finished
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {course.totalWatchMinutes >= 60
                          ? `${(course.totalWatchMinutes / 60).toFixed(1)}h`
                          : `${course.totalWatchMinutes}m`}
                      </p>
                      <p className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
                        <Timer className="w-2.5 h-2.5" />Watch Time
                      </p>
                    </div>
                  </div>
                </Card>
              </Fade>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Group Grades Tab ─────────────────────────────────────────────────────────

function GroupGradesTab() {
  const qc = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [gradingRoom, setGradingRoom] = useState<RoomSummaryItem | null>(null);
  const [filter, setFilter] = useState<"all" | "graded" | "pending">("all");

  const { data: coursesRaw, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-courses-for-grading"],
    queryFn:  () => CoursesService.findAll({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  const courses      = useMemo(() => normalizeCourses(coursesRaw), [coursesRaw]);
  const activeCourseId = selectedCourseId || courses[0]?.id || "";

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ["instructor-group-rooms", activeCourseId],
    queryFn:  () => ChatService.getCourseRooms(activeCourseId, { type: "GROUP", limit: 100 }),
    enabled:  !!activeCourseId,
    retry:    false,
    staleTime: 1000 * 60 * 2,
  });

  const rooms        = roomsData?.data ?? [];
  const gradedRooms  = rooms.filter(r => r.grade?.isGraded);
  const pendingRooms = rooms.filter(r => !r.grade?.isGraded);
  const avgScore     = gradedRooms.length
    ? Math.round(gradedRooms.reduce((s, r) => s + (r.grade?.resolvedGrade ?? 0), 0) / gradedRooms.length)
    : 0;

  const gradeMutation = useMutation({
    mutationFn: ({ roomId, isRegrading, payload }: {
      roomId: string;
      isRegrading: boolean;
      payload: Parameters<typeof ChatService.gradeRoom>[1];
    }) => isRegrading
      ? ChatService.updateRoomGrade(roomId, payload)
      : ChatService.gradeRoom(roomId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-group-rooms", activeCourseId] });
      setGradingRoom(null);
    },
  });

  const isLoading = coursesLoading || roomsLoading;

  return (
    <div className="space-y-5">
      {/* Course selector */}
      {courses.length > 0 && (
        <Fade delay={0.04}>
          <CourseSelector
            courses={courses}
            selected={activeCourseId}
            onSelect={id => { setSelectedCourseId(id); setFilter("all"); }}
          />
        </Fade>
      )}

      {/* Stats */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users,        label: "Total Groups",  value: isLoading ? "—" : String(rooms.length)        },
            { icon: CheckCircle2, label: "Graded",        value: isLoading ? "—" : String(gradedRooms.length)  },
            { icon: Clock,        label: "Pending",       value: isLoading ? "—" : String(pendingRooms.length) },
            { icon: BarChart3,    label: "Avg Score",     value: isLoading ? "—" : gradedRooms.length > 0 ? `${avgScore}` : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Filter tabs */}
      <Fade delay={0.1}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
          {(["all", "graded", "pending"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize",
                filter === f
                  ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
              )}>
              {f}
            </button>
          ))}
        </div>
      </Fade>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {!isLoading && !activeCourseId && (
        <Fade delay={0.12}>
          <Card className="p-12 text-center">
            <GraduationCap className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No courses found. Create a course to get started.</p>
          </Card>
        </Fade>
      )}

      {!isLoading && activeCourseId && rooms.length === 0 && (
        <Fade delay={0.12}>
          <Card className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No group rooms yet</p>
            <p className="text-xs text-gray-400 mt-1">Group rooms will appear here once they are created for this course.</p>
          </Card>
        </Fade>
      )}

      {/* Pending rooms */}
      {!isLoading && (filter === "all" || filter === "pending") && pendingRooms.length > 0 && (
        <Fade delay={0.12}>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-amber-600 uppercase mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Awaiting Grades ({pendingRooms.length})
            </p>
            <div className="flex flex-col gap-3">
              {pendingRooms.map(room => (
                <Card key={room.id} className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{room.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3 h-3" />{room.memberCount} members
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <MessageSquare className="w-3 h-3" />{room.totalMessages} messages
                    </p>
                  </div>
                  <button
                    onClick={() => setGradingRoom(room)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                      bg-blue-600 hover:bg-blue-500 text-white
                      shadow-[0_3px_10px_rgba(59,130,246,0.35)] transition-all flex-shrink-0">
                    <Plus className="w-3.5 h-3.5" /> Grade
                  </button>
                </Card>
              ))}
            </div>
          </div>
        </Fade>
      )}

      {/* Graded rooms */}
      {!isLoading && (filter === "all" || filter === "graded") && gradedRooms.length > 0 && (
        <Fade delay={0.15}>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Graded ({gradedRooms.length})
            </p>
            <div className="flex flex-col gap-3">
              {gradedRooms.map(room => (
                <Card key={room.id} className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{room.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Users className="w-3 h-3" />{room.memberCount} members
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <MessageSquare className="w-3 h-3" />{room.totalMessages} messages
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                          {room.grade!.resolvedGrade}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">score</p>
                      </div>
                      <button
                        onClick={() => setGradingRoom(room)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                          border border-blue-200 dark:border-blue-800/50
                          text-blue-600 dark:text-blue-400
                          hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                        <Edit3 className="w-3.5 h-3.5" /> Re-grade
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Fade>
      )}

      {/* Grade modal — uses ChatService.gradeRoom */}
      <AnimatePresence>
        {gradingRoom && (
          <GradeRoomModal
            room={gradingRoom}
            onClose={() => setGradingRoom(null)}
            saving={gradeMutation.isPending}
            onSave={payload => gradeMutation.mutate({
              roomId: gradingRoom.id,
              isRegrading: !!gradingRoom.grade?.isGraded,
              payload,
            })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorGrades() {
  const [tab, setTab] = useState<"progress" | "groups">("progress");

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">
      <Fade>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Grades <span className="text-blue-600 dark:text-blue-400">&amp; Progress</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">Track student progress and grade group work</p>
          </div>

          <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05]">
            {([
              { key: "progress", label: "Progress Overview", icon: TrendingUp },
              { key: "groups",   label: "Group Grades",      icon: GraduationCap },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  tab === key
                    ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                )}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <AnimatePresence mode="wait">
        {tab === "progress" ? (
          <motion.div key="progress"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <ProgressTab />
          </motion.div>
        ) : (
          <motion.div key="groups"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <GroupGradesTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
