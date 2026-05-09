// src/dashboards/student/pages/StudentCourses.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Play, CheckCircle2, TrendingUp,
  Search, X, Filter, BarChart3, AlertCircle, Award,
} from "lucide-react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { type CourseLevel } from "@/services/course.service";
import EnrollmentService, { MyEnrollment } from "@/services/enrollment.service";
import ProgressService from "@/services/progress.service";

// ─── Dashboard types (shared with StudentProgress) ───────────────────────────

interface DashboardStats {
  completedCourses: number;
  avgCompletionPercent: number;
  totalTimeSpentThisMonth: number;
  streak: { currentStreak: number };
  weeklyActivity: { totalThisWeek: number; dailyAverage: number; mostActiveDay: string | null; days: unknown[] };
}

interface DashboardResponse {
  stats: DashboardStats;
  courses: { courseId: string; isCompleted?: boolean; completed?: boolean }[];
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseProgressData {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  totalTimeSpent: number;
  isCompleted: boolean;
  completedAt: string | null;
  lastActivityAt: string | null;
  lastLessonId: string | null;
}

interface CourseProgressResponse {
  courseProgress: CourseProgressData;
}

interface MyCourse {
  id: string;
  title: string;
  img: string;
  level: CourseLevel | null;
  enrolledAt: string;
  // progress fields — undefined until the per-course query resolves
  percentComplete: number | undefined;
  isCompleted: boolean | undefined;
  completedAt: string | null | undefined;
  lastLessonId: string | null | undefined;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_LABEL: Record<CourseLevel, string> = {
  BEGINNER:     "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED:     "Advanced",
};

const LEVEL_COLOR: Record<CourseLevel, string> = {
  BEGINNER:     "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
  INTERMEDIATE: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
  ADVANCED:     "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30",
};

const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-sky-500 to-blue-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
];
function gradientFor(id: string | undefined) {
  if (!id) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "from-emerald-500 to-emerald-400" : "from-blue-500 to-blue-400";
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CourseSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-100 dark:bg-white/[0.06]" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/3 rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
        <div className="h-4 w-full rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
        <div className="h-4 w-2/3 rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06]" />
        <div className="h-9 w-full rounded-xl bg-gray-100 dark:bg-white/[0.06]" />
        <div className="h-8 w-full rounded-xl bg-gray-100 dark:bg-white/[0.06]" />
      </div>
    </Card>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ course, index }: { course: MyCourse; index: number }) {
  const gradient = gradientFor(course.id);
  const pct = course.percentComplete ?? 0;
  const progressLoaded = course.percentComplete !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      layout
      className="h-full"
    >
      <Card className="overflow-hidden group hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-40 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-white/[0.04]">
          {course.img ? (
            <img
              src={course.img}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "14px 14px" }} />
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-7 h-7 text-white drop-shadow" />
              </div>
            </div>
          )}

          {course.isCompleted && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 drop-shadow-lg" />
                <span className="text-white text-xs font-bold">Completed</span>
              </div>
            </div>
          )}

          {course.level && (
            <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${LEVEL_COLOR[course.level]}`}>
              {LEVEL_LABEL[course.level]}
            </div>
          )}
        </div>

        {/* Body — flex-col + flex-1 so all cards stretch to the same height */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-blue-500 transition-colors">
            {course.title}
          </h3>

          {/* Progress */}
          <div className="mb-4">
            {progressLoaded ? (
              <>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400">{pct}% complete</span>
                  {course.completedAt && (
                    <span className="text-emerald-500 font-medium text-[11px]">
                      Done {new Date(course.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
                <ProgressBar pct={pct} />
              </>
            ) : (
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
            )}
          </div>

          {/* Buttons — pushed to the bottom of the card */}
          <div className="mt-auto flex flex-col gap-2">
            {/* Primary CTA — always present */}
            <Link
              to={`/student/courses/${course.id}/watch${course.lastLessonId ? `/${course.lastLessonId}` : ""}`}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              {pct > 0 ? "Continue Learning" : "Start Learning"}
            </Link>

            {/* Get Certificate — only shown when completed */}
            {course.isCompleted && (
              <Link
                to="/student/certificates"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-all"
              >
                <Award className="w-3.5 h-3.5" /> Get Certificate
              </Link>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentCourses() {
  const [search, setSearch] = useState("");
  const [level, setLevel]   = useState<CourseLevel | "All">("All");
  const [filter, setFilter] = useState<"all" | "in-progress" | "not-started" | "completed">("all");

  // Step 1: fetch enrollments — source of truth for which courses the student has
  const {
    data: enrollments = [],
    isLoading: enrollmentsLoading,
    isError,
  } = useQuery<MyEnrollment[]>({
    queryKey: ["enrollments-mine"],
    queryFn: () => EnrollmentService.getMine(),
  });

  // Step 2: reuse the same dashboard cache as StudentProgress for aggregate stats
  const { data: dashboard } = useQuery<DashboardResponse>({
    queryKey: ["progress-dashboard"],
    queryFn: () => ProgressService.getDashboard() as Promise<DashboardResponse>,
  });

  // Step 3: fire one progress query per enrolled course, in parallel
  // Each resolves independently so cards update as data arrives
  const progressQueries = useQueries({
    queries: enrollments.map((enr) => ({
      queryKey: ["course-progress", enr.course.id],
      queryFn: () =>
        ProgressService.getCourseProgress(enr.course.id) as Promise<CourseProgressResponse>,
      enabled: !!enr.course.id,
    })),
  });

  // Build a map of courseId → progress for easy lookup
  const progressMap = useMemo(() => {
    const map = new Map<string, CourseProgressData>();
    progressQueries.forEach((q) => {
      if (q.data) {
        const p = (q.data as CourseProgressResponse).courseProgress;
        if (p?.courseId) map.set(p.courseId, p);
      }
    });
    return map;
  }, [progressQueries]);

  // Merge enrollments + progress
  const courses: MyCourse[] = useMemo(() => {
    return enrollments.map((enr) => {
      const prog = progressMap.get(enr.course.id);
      return {
        id:              enr.course.id,
        title:           enr.course.title,
        img:             enr.course.img,
        level:           (enr.course.level as CourseLevel) || null,
        enrolledAt:      enr.enrolledAt,
        percentComplete: prog?.percentComplete,
        isCompleted:     prog?.isCompleted,
        completedAt:     prog?.completedAt,
        lastLessonId:    prog?.lastLessonId,
      };
    });
  }, [enrollments, progressMap]);

  const levels = useMemo(() => {
    return Array.from(new Set(courses.map(c => c.level).filter(Boolean))) as CourseLevel[];
  }, [courses]);

  const filtered = useMemo(() => {
    let list = [...courses];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q));
    }
    if (level !== "All") list = list.filter(c => c.level === level);
    if (filter === "in-progress")  list = list.filter(c => (c.percentComplete ?? 0) > 0 && !c.isCompleted);
    if (filter === "not-started")  list = list.filter(c => !c.percentComplete);
    if (filter === "completed")    list = list.filter(c => c.isCompleted);
    return list;
  }, [courses, search, level, filter]);

  // Stats — completed + avgProgress come from the shared dashboard cache (same
  // key as StudentProgress), so no extra network request when navigating between pages.
  // inProgress is derived locally since the dashboard courses list may lag enrollments.
  const stats = useMemo(() => {
    const loaded = courses.filter(c => c.percentComplete !== undefined);
    const dashStats = dashboard?.stats;
    return {
      total:       courses.length,
      inProgress:  loaded.filter(c => (c.percentComplete ?? 0) > 0 && !c.isCompleted).length,
      completed:   dashStats?.completedCourses ?? loaded.filter(c => c.isCompleted).length,
      avgProgress: dashStats
        ? Math.round(Number(dashStats.avgCompletionPercent) || 0)
        : loaded.length
          ? Math.round(loaded.reduce((a, c) => a + (c.percentComplete ?? 0), 0) / loaded.length)
          : 0,
    };
  }, [courses, dashboard]);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Courses</h1>
            <p className="text-xs text-gray-400">
              {enrollmentsLoading ? "Loading…" : `${stats.total} enrolled`}
            </p>
          </div>
        </div>
        <Link
          to="/student/explore"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:opacity-90 transition-all shadow-md"
        >
          Explore More
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: BookOpen,     value: enrollmentsLoading ? "—" : stats.total,            label: "Total Enrolled", color: "from-blue-500 to-blue-600"     },
            { icon: TrendingUp,   value: enrollmentsLoading ? "—" : stats.inProgress,        label: "In Progress",    color: "from-amber-400 to-orange-500"  },
            { icon: CheckCircle2, value: enrollmentsLoading ? "—" : stats.completed,         label: "Completed",      color: "from-emerald-500 to-teal-600"  },
            { icon: BarChart3,    value: enrollmentsLoading ? "—" : `${stats.avgProgress}%`, label: "Avg Progress",   color: "from-violet-500 to-purple-600" },
          ].map(({ icon: Ic, value, label, color }) => (
            <Card key={label} className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Ic className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-[11px] text-gray-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your courses…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0f1623] border-gray-200 dark:border-white/[0.07] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
          {(["all", "in-progress", "not-started", "completed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f
                  ? "bg-white dark:bg-[#0f1623] shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {f === "all" ? "All" : f === "in-progress" ? "In Progress" : f === "not-started" ? "Not Started" : "Completed"}
            </button>
          ))}
        </div>

        {/* Level filter */}
        {levels.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            {(["All", ...levels] as (CourseLevel | "All")[]).map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  level === l ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {l === "All" ? "All" : LEVEL_LABEL[l]}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Error */}
      {isError && !enrollmentsLoading && (
        <Card className="p-10 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Couldn't load courses</p>
          <p className="text-xs text-gray-400">Check your connection and refresh the page.</p>
        </Card>
      )}

      {/* Loading skeletons */}
      {enrollmentsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => <CourseSkeleton key={i} />)}
        </div>
      )}

      {/* Grid */}
      {!enrollmentsLoading && !isError && (
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-4">
                {courses.length === 0
                  ? <BookOpen className="w-7 h-7 text-blue-400" />
                  : <Search className="w-7 h-7 text-blue-400" />
                }
              </div>
              <p className="font-bold text-gray-700 dark:text-white mb-1">
                {courses.length === 0 ? "No courses yet" : "No courses found"}
              </p>
              <p className="text-sm text-gray-400">
                {courses.length === 0
                  ? "Enroll in a course to get started."
                  : "Try adjusting your filters."}
              </p>
              {courses.length === 0 && (
                <Link to="/student/explore" className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all">
                  Explore Courses
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
              <AnimatePresence mode="popLayout">
                {filtered.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
