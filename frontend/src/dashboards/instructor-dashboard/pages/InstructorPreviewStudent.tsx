import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Search, ChevronRight, BookOpen,
  Clock, Filter, SlidersHorizontal,
  Loader2, Activity, CheckCircle2, TrendingUp,
} from "lucide-react";
import InstructorDashboardService, {
  type StudentDashboardItem,
  type StudentDashboardCourse,
} from "@/services/instructor-dashboard.service";
import ProgressService from "@/services/progress.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase();
}

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-blue-500",
  "from-pink-500 to-rose-600",
  "from-teal-500 to-emerald-600",
];

function avatarGradient(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const COURSE_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function ProgressBar({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const color =
    value === 100 ? "from-blue-500 to-indigo-600"
    : value >= 60 ? "from-emerald-500 to-teal-500"
    : value >= 30 ? "from-amber-400 to-orange-500"
    : "from-red-400 to-rose-500";
  return (
    <div className={`w-full ${size === "sm" ? "h-1" : "h-1.5"} rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

// ─── Student Row ──────────────────────────────────────────────────────────────

function StudentRow({ item, courseFilter, index }: {
  item: StudentDashboardItem;
  courseFilter: string;
  index: number;
}) {
  const { student, stats, courses } = item;

  // When a specific course is selected, show that course's progress; otherwise use avg
  const activeCourse: StudentDashboardCourse | undefined =
    courseFilter !== "all"
      ? courses.find(c => c.courseId === courseFilter)
      : undefined;

  const progress = activeCourse
    ? Math.round(activeCourse.percentComplete)
    : Math.round(stats.avgCompletionPercent);

  const completedLessons = activeCourse?.completedLessons;
  const totalLessons = activeCourse?.totalLessons;

  const lastActive = activeCourse?.lastActivityAt ?? stats.streak.lastActiveDate;

  const courseLabel = activeCourse
    ? activeCourse.courseTitle
    : `${courses.length} course${courses.length !== 1 ? "s" : ""}`;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link
        to={`/instructor/students/${student.studentId}`}
        state={{ name: student.studentName, email: student.studentEmail, image: student.studentImage }}
      >
        <div className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all border border-transparent hover:border-gray-100 dark:hover:border-white/[0.06] cursor-pointer">
          {/* Avatar */}
          <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black text-white bg-gradient-to-br ${avatarGradient(student.studentId)} overflow-hidden`}>
            {student.studentImage
              ? <img src={student.studentImage} alt={student.studentName} className="w-full h-full object-cover" />
              : initials(student.studentName)}
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {student.studentName}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{student.studentEmail}</p>
          </div>

          {/* Course / streak */}
          <div className="hidden md:block flex-shrink-0 w-44">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{courseLabel}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
              🔥 {stats.streak.currentStreak}d streak
            </p>
          </div>

          {/* Progress */}
          <div className="hidden sm:flex flex-col gap-1.5 flex-shrink-0 w-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{progress}%</span>
              {completedLessons !== undefined && totalLessons !== undefined && (
                <span className="text-[10px] text-gray-400">{completedLessons}/{totalLessons}</span>
              )}
            </div>
            <ProgressBar value={progress} size="sm" />
          </div>

          {/* Last active */}
          <div className="hidden lg:block flex-shrink-0 text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(lastActive)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />Last active
            </p>
          </div>

          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Course breakdown card (derived from student dashboards) ──────────────────

interface CourseSummary {
  courseId: string;
  title: string;
  img: string | null;
  studentCount: number;
  avgCompletion: number;
}

function buildCourseSummaries(data: StudentDashboardItem[]): CourseSummary[] {
  const map = new Map<string, { title: string; img: string | null; students: number; totalPct: number }>();
  for (const item of data) {
    for (const c of item.courses) {
      const existing = map.get(c.courseId);
      if (existing) {
        existing.students++;
        existing.totalPct += c.percentComplete;
      } else {
        map.set(c.courseId, { title: c.courseTitle, img: c.courseImg, students: 1, totalPct: c.percentComplete });
      }
    }
  }
  return Array.from(map.entries()).map(([courseId, v]) => ({
    courseId,
    title: v.title,
    img: v.img,
    studentCount: v.students,
    avgCompletion: v.students > 0 ? v.totalPct / v.students : 0,
  }));
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorStudentPreview() {
  const [search, setSearch]                 = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [showFilters, setShowFilters]       = useState(false);

  // ── Fetch all student dashboards ────────────────────────────────────────────
  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ["instructor-student-dashboards"],
    queryFn:  () => InstructorDashboardService.getStudentDashboards(),
    staleTime: 1000 * 60 * 5,
  });

  
  // ── Course analytics for accurate completion rate ────────────────────────────
  const { data: courseAnalytics = [] } = useQuery({
    queryKey: ["instructor-course-analytics"],
    queryFn:  () => ProgressService.getInstructorCourseAnalytics(),
    staleTime: 1000 * 60 * 5,
  });

  // ── Derived course list for the filter dropdown ──────────────────────────────
  const courseSummaries = useMemo(() => buildCourseSummaries(dashboards), [dashboards]);

  // ── Filter students ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return dashboards.filter(item => {
      // Course filter: student must be enrolled in the selected course
      if (selectedCourse !== "all") {
        const inCourse = item.courses.some(c => c.courseId === selectedCourse);
        if (!inCourse) return false;
      }

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const match =
          item.student.studentName.toLowerCase().includes(q) ||
          item.student.studentEmail.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [dashboards, selectedCourse, search]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalStudents = dashboards.length;
  const totalCourses  = courseSummaries.length;

  // Overall completion rate: weighted average from analytics endpoint
  const overallCompletionRate = useMemo(() => {
    if (courseAnalytics.length === 0) return 0;
    const totalEnrolled   = courseAnalytics.reduce((s, c) => s + c.enrolledCount, 0);
    const totalCompleted  = courseAnalytics.reduce((s, c) => s + c.completedCount, 0);
    return totalEnrolled > 0 ? (totalCompleted / totalEnrolled) * 100 : 0;
  }, [courseAnalytics]);

  const activeThisWeek = dashboards.filter(d => {
    const last = d.stats.streak.lastActiveDate;
    if (!last) return false;
    return (Date.now() - new Date(last).getTime()) / 86_400_000 <= 7;
  }).length;

  return (
    <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

      {/* ── Page header ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students</h1>
          <p className="text-sm text-gray-400 mt-0.5">{totalStudents} students across {totalCourses} courses</p>
        </div>
      </motion.div>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users,        value: totalStudents,                                    label: "Total Students",   color: "bg-gradient-to-br from-blue-500 to-blue-600"     },
          { icon: BookOpen,     value: totalCourses,                                     label: "Courses",          color: "bg-gradient-to-br from-indigo-500 to-violet-600" },
          { icon: CheckCircle2, value: overallCompletionRate > 0 ? `${overallCompletionRate.toFixed(0)}%` : "—", label: "Completion Rate", color: "bg-gradient-to-br from-emerald-500 to-teal-600"  },
          { icon: Activity,     value: activeThisWeek,                                   label: "Active This Week", color: "bg-gradient-to-br from-amber-400 to-orange-500"  },
        ].map(({ icon: Ic, value, label, color }) => (
          <Card key={label} className="p-4 flex items-center gap-3.5">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Ic className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">{value}</p>
              <p className="text-[11px] text-gray-400">{label}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* ── Search + Filters ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                  bg-gray-50 dark:bg-white/[0.04]
                  border border-gray-200 dark:border-white/[0.08]
                  text-gray-800 dark:text-gray-200
                  placeholder:text-gray-400 dark:placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            <button onClick={() => setShowFilters(p => !p)}
              className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 transition-all">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={selectedCourse}
                onChange={e => { setSelectedCourse(e.target.value); setSearch(""); }}
                className="px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all">
                <option value="all">All Courses</option>
                {courseSummaries.map(c => <option key={c.courseId} value={c.courseId}>{c.title}</option>)}
              </select>
            </div>


          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden sm:hidden">
                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-white/[0.06] flex flex-col gap-2.5">
                  <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 focus:outline-none">
                    <option value="all">All Courses</option>
                    {courseSummaries.map(c => <option key={c.courseId} value={c.courseId}>{c.title}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ── Student list ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <Card>
          <div className="hidden sm:flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
            <div className="w-11 flex-shrink-0" />
            <p className="flex-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">Student</p>
            <p className="hidden md:block w-44 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              {selectedCourse === "all" ? "Courses / Streak" : "Course / Streak"}
            </p>
            <p className="hidden sm:block w-28 text-[11px] font-bold uppercase tracking-widest text-gray-400">Progress</p>
            <p className="hidden lg:block text-right text-[11px] font-bold uppercase tracking-widest text-gray-400">Activity</p>
            <div className="w-4 flex-shrink-0" />
          </div>

          <div className="divide-y divide-gray-50 dark:divide-white/[0.04] p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.length > 0 ? (
                  filtered.map((item, i) => (
                    <StudentRow
                      key={item.student.studentId}
                      item={item}
                      courseFilter={selectedCourse}
                      index={i}
                    />
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="py-16 flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No students found</p>
                    <p className="text-xs text-gray-400">
                      {search
                        ? "Try adjusting your search or filters"
                        : "No students enrolled yet"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing <span className="font-bold text-gray-700 dark:text-gray-300">{filtered.length}</span> of{" "}
                <span className="font-bold text-gray-700 dark:text-gray-300">{totalStudents}</span> students
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Course breakdown ─────────────────────────────────────── */}
      {!isLoading && courseSummaries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courseSummaries.slice(0, 6).map((course, i) => (
            <Card key={course.courseId} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                  {course.img
                    ? <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
                    : <BookOpen className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />{course.studentCount}
                  </span>
                  <button
                    onClick={() => setSelectedCourse(
                      selectedCourse === course.courseId ? "all" : course.courseId
                    )}
                    className="text-[10px] font-bold text-blue-500 hover:underline">
                    {selectedCourse === course.courseId ? "Clear" : "Filter"}
                  </button>
                </div>
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 leading-snug">
                {course.title}
              </p>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Avg completion
                </span>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                  {course.avgCompletion.toFixed(0)}%
                </span>
              </div>
              <ProgressBar value={course.avgCompletion} size="sm" />
              <p className="text-[10px] text-gray-400 mt-2">
                {fmtMinutes(0)} · {course.studentCount} enrolled
              </p>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}
