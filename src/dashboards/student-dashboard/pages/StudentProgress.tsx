// src/dashboards/student-dashboard/pages/StudentProgress.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, CheckCircle2,
  Play, Flame, Target, BarChart3, Calendar,
  ChevronRight, Star, Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CourseProgress {
  id: string;
  title: string;
  instructor: string;
  instructorBg: string;
  thumbnail: string;
  progress: number;
  lecturesCompleted: number;
  totalLectures: number;
  timeSpent: string;
  totalDuration: string;
  lastWatched: string;
  lastLecture: string;
  rating?: number;
  completed: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const COURSES: CourseProgress[] = [
  {
    id: "dev-001",
    title: "The Complete React & TypeScript Bootcamp 2024",
    instructor: "Sarah Mitchell",
    instructorBg: "bg-blue-500",
    thumbnail: "from-blue-500 to-cyan-400",
    progress: 78,
    lecturesCompleted: 244,
    totalLectures: 312,
    timeSpent: "32h 15m",
    totalDuration: "42h 15m",
    lastWatched: "Today, 2h ago",
    lastLecture: "Lesson 47: React Query v5 Deep Dive",
    completed: false,
  },
  {
    id: "mkt-001",
    title: "Digital Marketing Masterclass: SEO, Ads & Social",
    instructor: "Amara Nwosu",
    instructorBg: "bg-pink-500",
    thumbnail: "from-violet-500 to-purple-400",
    progress: 100,
    lecturesCompleted: 228,
    totalLectures: 228,
    timeSpent: "31h 20m",
    totalDuration: "31h 20m",
    lastWatched: "Jan 14, 2024",
    lastLecture: "Course completed!",
    rating: 5,
    completed: true,
  },
  {
    id: "dev-002",
    title: "Node.js, Express & MongoDB: Backend Masterclass",
    instructor: "James Okafor",
    instructorBg: "bg-emerald-500",
    thumbnail: "from-green-500 to-emerald-400",
    progress: 45,
    lecturesCompleted: 119,
    totalLectures: 264,
    timeSpent: "16h 40m",
    totalDuration: "36h 40m",
    lastWatched: "Yesterday",
    lastLecture: "Lesson 28: JWT Authentication",
    completed: false,
  },
  {
    id: "biz-001",
    title: "The Complete Entrepreneurship & Startup Playbook",
    instructor: "Priya Sharma",
    instructorBg: "bg-rose-500",
    thumbnail: "from-sky-500 to-blue-400",
    progress: 20,
    lecturesCompleted: 66,
    totalLectures: 328,
    timeSpent: "8h 50m",
    totalDuration: "44h 10m",
    lastWatched: "3 days ago",
    lastLecture: "Lesson 12: Validating Your Idea",
    completed: false,
  },
];

// Weekly activity data (minutes per day)
const WEEKLY_ACTIVITY = [
  { day: "Mon", minutes: 45  },
  { day: "Tue", minutes: 90  },
  { day: "Wed", minutes: 0   },
  { day: "Thu", minutes: 120 },
  { day: "Fri", minutes: 60  },
  { day: "Sat", minutes: 75  },
  { day: "Sun", minutes: 30  },
];

const MAX_MINUTES = Math.max(...WEEKLY_ACTIVITY.map(d => d.minutes));

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

// ─── Course row card ──────────────────────────────────────────────────────────
function CourseProgressCard({ course, index }: { course: CourseProgress; index: number }) {
  const remaining = course.totalLectures - course.lecturesCompleted;

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
          animate={{ width: `${course.progress}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: index * 0.06 }}
          className={`h-full bg-gradient-to-r ${course.completed ? "from-emerald-500 to-emerald-400" : "from-blue-500 to-cyan-400"}`}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${course.thumbnail}
            flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.12)]`}>
            {course.completed ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            )}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <Link to={`/courses/${course.id}`}
                className="text-sm font-black text-gray-900 dark:text-white line-clamp-1
                  hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {course.title}
              </Link>
              <span className={`flex-shrink-0 text-xs font-black px-2.5 py-1 rounded-xl
                ${course.completed
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                }`}>
                {course.progress}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-3">
              <span className={`w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0 ${course.instructorBg}`}>
                {course.instructor[0]}
              </span>
              <span className="text-xs text-gray-400">{course.instructor}</span>
            </div>

            <ProgressBar pct={course.progress} color={course.completed ? "emerald" : "blue"} />

            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-gray-400">
                {course.lecturesCompleted}/{course.totalLectures} lectures
              </span>
              {!course.completed && (
                <span className="text-[11px] text-gray-400">
                  {remaining} remaining
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Time Spent</span>
            <span className="text-xs font-black text-gray-800 dark:text-white flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />{course.timeSpent}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Last Watched</span>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-500" />{course.lastWatched}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-end text-right">
            {course.completed && course.rating ? (
              <>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Your Rating</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: course.rating }, (_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Continue</span>
                <Link to={`/courses/${course.id}`}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Resume <ChevronRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Last lecture */}
        {!course.completed && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
            <p className="text-[11px] text-gray-400 font-medium">
              <span className="font-bold text-gray-600 dark:text-gray-300">Last: </span>
              {course.lastLecture}
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

  const totalTime  = "57h 25m";
  const streak     = 14;
  const completed  = COURSES.filter(c => c.completed).length;
  const inProgress = COURSES.filter(c => !c.completed).length;
  const avgProgress = Math.round(COURSES.reduce((a, c) => a + c.progress, 0) / COURSES.length);

  const filtered = COURSES.filter(c => {
    if (filter === "active")    return !c.completed;
    if (filter === "completed") return c.completed;
    return true;
  }).sort((a, b) => {
    // completed last, then by progress desc
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.progress - a.progress;
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Clock,        value: totalTime,            label: "Total Time Spent",  sub: "this month",     color: "blue"    },
          { icon: Flame,        value: `${streak}d`,         label: "Learning Streak",   sub: "keep it going!", color: "amber"   },
          { icon: CheckCircle2, value: String(completed),    label: "Completed",         sub: "courses",        color: "emerald" },
          { icon: Target,       value: `${avgProgress}%`,    label: "Avg Completion",    sub: "across courses", color: "cyan"    },
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
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
          {WEEKLY_ACTIVITY.map((day, i) => {
            const pct = MAX_MINUTES > 0 ? (day.minutes / MAX_MINUTES) * 100 : 0;
            const isToday = day.day === "Sun"; // mock
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
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
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
          {[
            { label: "Total this week",  value: `${WEEKLY_ACTIVITY.reduce((a, d) => a + d.minutes, 0)} min` },
            { label: "Daily average",    value: `${Math.round(WEEKLY_ACTIVITY.reduce((a, d) => a + d.minutes, 0) / 7)} min` },
            { label: "Most active",      value: "Thursday" },
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
            {(["all","active","completed"] as const).map(f => (
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

        <div className="flex flex-col gap-4">
          {filtered.map((course, i) => (
            <CourseProgressCard key={course.id} course={course} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}