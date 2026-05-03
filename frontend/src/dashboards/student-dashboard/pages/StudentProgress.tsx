// src/dashboards/student-dashboard/pages/StudentProgress.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock, CheckCircle2, Play, Flame, Target, BarChart3,
  Calendar, ChevronRight, Star, Zap, Loader2,
} from "lucide-react";
import ProgressService from "@/services/progress.service";

// ─── API Types (exact backend shape) ─────────────────────────────────────────

interface WeeklyDay {
  date: string;
  label: string;
  minutes: number;
}

interface WeeklyActivity {
  days: WeeklyDay[];
  totalThisWeek: number;
  dailyAverage: number;
  mostActiveDay: string | null;
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
}

interface DashboardStats {
  totalTimeSpentThisMonth: number;
  streak: Streak;
  completedCourses: number;
  avgCompletionPercent: number;
  weeklyActivity: WeeklyActivity;
}

interface DashboardCourse {
  courseId: string;
  courseTitle?: string;
  courseImg?: string;
  title?: string;
  img?: string;
  instructor: { name: string; image?: string | null };
  // API returns percentComplete, but some versions return progressPercent
  percentComplete?: number;
  progressPercent?: number;
  completedLessons: number;
  totalLessons: number;
  // API returns totalTimeSpent (seconds), some versions return watchTimeSeconds
  totalTimeSpent?: number;
  watchTimeSeconds?: number;
  lastActivityAt?: string;
  lastAccessedAt?: string;
  lastLessonTitle?: string;
  lastLessonId?: string | null;
  isCompleted?: boolean;
  completed?: boolean;
  myRating?: number;
}

interface DashboardResponse {
  stats: DashboardStats;
  courses: DashboardCourse[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INSTRUCTOR_COLORS = [
  "bg-blue-500", "bg-pink-500", "bg-emerald-500",
  "bg-rose-500",  "bg-violet-500", "bg-amber-500",
];

const THUMBNAIL_GRADIENTS = [
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-green-500 to-emerald-400",
  "from-sky-500 to-blue-400",
  "from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400",
];

function colorFor<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

// totalTimeSpentThisMonth comes back as minutes from the API
function fmtMinutes(min: number): string {
  if (!min || isNaN(min)) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// totalTimeSpent on a course comes back as seconds
function fmtSeconds(sec: number): string {
  if (!sec || isNaN(sec)) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function fmtRelative(iso?: string): string {
  if (!iso) return "—";
  const diff  = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return "Just now";
  if (hours < 24) return `Today, ${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7)   return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const todayAbbr = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06] ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto pb-10 space-y-8">
      <div className="space-y-2">
        <Sk className="h-9 w-64" />
        <Sk className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Sk key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Sk className="h-56 rounded-[22px]" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-44 rounded-[20px]" />)}
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct, color = "blue" }: { pct: number; color?: "blue" | "emerald" | "cyan" }) {
  const gradients: Record<string, string> = {
    blue:    "from-blue-500 to-cyan-400",
    emerald: "from-emerald-500 to-emerald-400",
    cyan:    "from-cyan-500 to-blue-400",
  };
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/[0.07] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${gradients[color]}`}
      />
    </div>
  );
}

// ─── Course card ──────────────────────────────────────────────────────────────

function CourseProgressCard({ course, index }: { course: DashboardCourse; index: number }) {
  // Normalise field names — API may return percentComplete or progressPercent
  const pct       = Math.round(course.percentComplete ?? course.progressPercent ?? 0);
  const isCompleted = course.isCompleted ?? course.completed ?? false;
  const watchSecs   = course.totalTimeSpent ?? course.watchTimeSeconds ?? 0;
  const lastAccess  = course.lastActivityAt ?? course.lastAccessedAt;
  const courseTitle = course.courseTitle ?? course.title ?? "Untitled Course";
  const courseImg   = course.courseImg ?? course.img;
  const remaining = course.totalLessons - course.completedLessons;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="rounded-[20px] bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_2px_16px_rgba(0,0,0,0.05)]
        hover:shadow-[0_0_0_1.5px_rgba(59,130,246,0.25),0_8px_24px_rgba(59,130,246,0.08)]
        transition-all duration-300 overflow-hidden"
    >
      {/* Progress strip */}
      <div className="h-1 w-full bg-gray-100 dark:bg-white/[0.07]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: index * 0.06 }}
          className={`h-full bg-gradient-to-r ${isCompleted ? "from-emerald-500 to-emerald-400" : "from-blue-500 to-cyan-400"}`}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${colorFor(THUMBNAIL_GRADIENTS, index)}
            flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.12)] overflow-hidden`}>
            {courseImg
              ? <img src={courseImg} alt={courseTitle} className="w-full h-full object-cover" />
              : isCompleted
                ? <CheckCircle2 className="w-6 h-6 text-white" />
                : <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            }
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <Link
                to={`/student/courses/${course.courseId}/watch`}
                className="text-sm font-black text-gray-900 dark:text-white line-clamp-1
                  hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {courseTitle}
              </Link>
              <span className={`flex-shrink-0 text-xs font-black px-2.5 py-1 rounded-xl
                ${isCompleted
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                }`}>
                {pct}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-3">
              {/* Instructor avatar — image or initial fallback */}
              {course.instructor?.image ? (
                <img
                  src={course.instructor.image}
                  alt={course.instructor.name}
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200 dark:ring-white/10"
                  onError={e => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <span className={`w-5 h-5 rounded-full text-[9px] font-bold text-white
                  flex items-center justify-center flex-shrink-0 ${colorFor(INSTRUCTOR_COLORS, index)}`}>
                  {(course.instructor?.name ?? "?")[0].toUpperCase()}
                </span>
              )}
              <span className="text-xs text-gray-400">{course.instructor?.name ?? "Instructor"}</span>
            </div>

            <ProgressBar pct={pct} color={isCompleted ? "emerald" : "blue"} />

            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-gray-400">
                {course.completedLessons}/{course.totalLessons} lessons
              </span>
              {!isCompleted && (
                <span className="text-[11px] text-gray-400">{remaining} remaining</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Time Spent</span>
            <span className="text-xs font-black text-gray-800 dark:text-white flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              {fmtSeconds(watchSecs)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Last Watched</span>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-500" />
              {fmtRelative(lastAccess)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-end text-right">
            {isCompleted && course.myRating ? (
              <>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Your Rating</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: course.myRating }, (_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Continue</span>
                <Link
                  to={`/student/courses/${course.courseId}/watch`}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Resume <ChevronRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Last lesson */}
        {!isCompleted && course.lastLessonTitle && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
            <p className="text-[11px] text-gray-400 font-medium">
              <span className="font-bold text-gray-600 dark:text-gray-300">Last: </span>
              {course.lastLessonTitle}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentProgress() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const { data: dashboard, isLoading, isError } = useQuery<DashboardResponse>({
    queryKey: ["progress-dashboard"],
    queryFn:  () => ProgressService.getDashboard() as Promise<DashboardResponse>,
  });

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="max-w-[1100px] mx-auto py-20 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-400">Failed to load progress data. Please try again.</p>
      </div>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  const stats      = dashboard?.stats;
  const courses    = dashboard?.courses ?? [];
  const weeklyDays = stats?.weeklyActivity.days ?? [];
  const maxMinutes = Math.max(...weeklyDays.map(d => d.minutes), 1);
  const streak     = stats?.streak?.currentStreak ?? 0;
  const completed  = stats?.completedCourses ?? 0;
  const inProgress = courses.filter(c => !(c.isCompleted ?? c.completed)).length;
  const avgProgress = Math.round(Number(stats?.avgCompletionPercent) || 0);
  // totalTimeSpentThisMonth is in minutes from the API
  const totalTime  = fmtMinutes(stats?.totalTimeSpentThisMonth ?? 0);
  const weekTotal  = stats?.weeklyActivity.totalThisWeek ?? 0;
  const dailyAvg   = stats?.weeklyActivity.dailyAverage ?? 0;
  const mostActive = stats?.weeklyActivity.mostActiveDay ?? "—";

  const filtered = courses
    .filter(c => {
      const done = c.isCompleted ?? c.completed ?? false;
      if (filter === "active")    return !done;
      if (filter === "completed") return done;
      return true;
    })
    .sort((a, b) => {
      const aDone = a.isCompleted ?? a.completed ?? false;
      const bDone = b.isCompleted ?? b.completed ?? false;
      if (aDone !== bDone) return aDone ? 1 : -1;
      const aPct = a.percentComplete ?? a.progressPercent ?? 0;
      const bPct = b.percentComplete ?? b.progressPercent ?? 0;
      return bPct - aPct;
    });

  return (
    <div className="max-w-[1100px] mx-auto pb-10 space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Learning <span className="text-blue-600 dark:text-blue-400">Progress</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Track your journey across all enrolled courses</p>
      </motion.div>

      {/* Top stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Clock,        value: totalTime,          label: "Total Time Spent", sub: "this month",     color: "blue"    },
          { icon: Flame,        value: streak > 0 ? `${streak}d` : "0d",  label: "Learning Streak",  sub: streak > 0 ? "keep it going! 🔥" : "start today!", color: "amber"   },
          { icon: CheckCircle2, value: String(completed),  label: "Completed",        sub: "courses",        color: "emerald" },
          { icon: Target,       value: `${avgProgress}%`,  label: "Avg Completion",   sub: "across courses", color: "cyan"    },
        ].map(({ icon: Icon, value, label, sub, color }) => {
          const palette: Record<string, string> = {
            blue:    "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/20 [&_div]:bg-blue-100 dark:[&_div]:bg-blue-900/40 [&_svg]:text-blue-600 dark:[&_svg]:text-blue-400",
            amber:   "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/20 [&_div]:bg-amber-100 dark:[&_div]:bg-amber-900/40 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400",
            emerald: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/20 [&_div]:bg-emerald-100 dark:[&_div]:bg-emerald-900/40 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400",
            cyan:    "bg-cyan-50/60 dark:bg-cyan-950/20 border-cyan-100/60 dark:border-cyan-900/20 [&_div]:bg-cyan-100 dark:[&_div]:bg-cyan-900/40 [&_svg]:text-cyan-600 dark:[&_svg]:text-cyan-400",
          };
          return (
            <div key={label} className={`flex flex-col items-center py-5 px-3 rounded-2xl border transition-colors ${palette[color]}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
              {sub && <p className="text-[9px] font-bold mt-0.5 text-current opacity-60">{sub}</p>}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Weekly activity chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-[22px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
              flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 dark:text-white">This Week's Activity</h2>
              <p className="text-xs text-gray-400">Time spent learning per day (minutes)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
            bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">{streak} day streak</span>
          </div>
        </div>

        <div className="flex items-end gap-3 h-28">
          {weeklyDays.map((day, i) => {
            const pct     = (day.minutes / maxMinutes) * 100;
            const isToday = day.label === todayAbbr;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
                  {day.minutes > 0 ? (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                      className={`w-full rounded-xl ${
                        isToday
                          ? "bg-gradient-to-t from-blue-600 to-blue-400"
                          : "bg-gradient-to-t from-blue-200 to-blue-100 dark:from-blue-900/60 dark:to-blue-800/30"
                      }`}
                    />
                  ) : (
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.05]" />
                  )}
                </div>
                <span className={`text-[10px] font-bold ${isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
          {[
            { label: "Total this week", value: `${weekTotal} min` },
            { label: "Daily average",   value: `${dailyAvg} min`  },
            { label: "Most active",     value: mostActive          },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{label}</p>
              <p className="text-sm font-black text-gray-800 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Course filter + list */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Course Progress
          </h2>
          <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05]">
            {(["all", "active", "completed"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-200
                  ${filter === f
                    ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}>
                {f}
                {f === "active"    && ` (${inProgress})`}
                {f === "completed" && ` (${completed})`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
            <CheckCircle2 className="w-8 h-8 opacity-30" />
            <p className="text-sm font-medium">
              {filter === "completed" ? "No completed courses yet." : "No courses in progress."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((course, i) => (
              <CourseProgressCard key={course.courseId} course={course} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}