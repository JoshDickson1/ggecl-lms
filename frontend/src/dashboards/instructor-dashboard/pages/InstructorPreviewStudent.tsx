import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Search, ChevronRight, BookOpen,
  Clock, Filter, SlidersHorizontal, GraduationCap,
  Loader2, Activity, CheckCircle2,
} from "lucide-react";
import CoursesService from "@/services/course.service";
import EnrollmentService from "@/services/enrollment.service";
import InstructorDashboardService from "@/services/instructor-dashboard.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnrollmentStudent {
  id: string; 
  studentId: string;
  enrolledAt: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  lastActiveAt?: string | null;
  status?: "active" | "completed" | "at-risk" | string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeCourses(raw: unknown): { id: string; title: string; img?: string | null }[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as { id: string; title: string; img?: string | null }[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.items)) return r.items as { id: string; title: string; img?: string | null }[];
  if (Array.isArray(r.data))  return r.data  as { id: string; title: string; img?: string | null }[];
  return [];
}

function normalizeEnrollments(raw: unknown): EnrollmentStudent[] {
  if (!raw) return [];
  const list: unknown[] = Array.isArray(raw) ? raw
    : Array.isArray((raw as any)?.data) ? (raw as any).data
    : Array.isArray((raw as any)?.items) ? (raw as any).items
    : [];

  return list.map((e: any) => ({
    id:               e.id ?? "",
    studentId:        e.studentId ?? e.student?.id ?? e.userId ?? "",
    enrolledAt:       e.enrolledAt ?? e.createdAt ?? "",
    studentName:      e.studentName ?? e.student?.name ?? e.user?.name ?? "Unknown",
    studentEmail:     e.studentEmail ?? e.student?.email ?? e.user?.email ?? "",
    studentAvatar:    e.studentAvatar ?? e.student?.image ?? e.student?.avatar ?? e.user?.image ?? null,
    progress:         e.progress ?? e.progressPercent ?? undefined,
    completedLessons: e.completedLessons ?? undefined,
    totalLessons:     e.totalLessons ?? undefined,
    lastActiveAt:     e.lastActiveAt ?? e.lastActive ?? null,
    status:           e.status ?? "active",
  }));
}

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

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

const STATUS_META: Record<string, { label: string; className: string }> = {
  active:    { label: "Active",    className: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
  completed: { label: "Completed", className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"           },
  "at-risk": { label: "At Risk",   className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"        },
};

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

function StudentRow({ student, courseTitle, index }: {
  student: EnrollmentStudent;
  courseTitle: string;
  index: number;
}) {
  const statusMeta = STATUS_META[student.status ?? "active"] ?? STATUS_META["active"];
  const progress = student.progress ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link to={`/instructor/students/${student.studentId}`} state={{
        name:   student.studentName,
        email:  student.studentEmail,
        image:  student.studentAvatar,
      }}>
        <div className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all border border-transparent hover:border-gray-100 dark:hover:border-white/[0.06] cursor-pointer">
          <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black text-white bg-gradient-to-br ${avatarGradient(student.studentId)} overflow-hidden`}>
            {student.studentAvatar
              ? <img src={student.studentAvatar} alt={student.studentName} className="w-full h-full object-cover" />
              : initials(student.studentName)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {student.studentName}
              </p>
              <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold flex-shrink-0 ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5">{student.studentEmail}</p>
          </div>

          <div className="hidden md:block flex-shrink-0 w-44">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{courseTitle}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Enrolled {fmtDate(student.enrolledAt)}</p>
          </div>

          <div className="hidden sm:flex flex-col gap-1.5 flex-shrink-0 w-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{progress}%</span>
              {student.completedLessons !== undefined && student.totalLessons !== undefined && (
                <span className="text-[10px] text-gray-400">{student.completedLessons}/{student.totalLessons}</span>
              )}
            </div>
            <ProgressBar value={progress} size="sm" />
          </div>

          <div className="hidden lg:block flex-shrink-0 text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(student.lastActiveAt)}</p>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorStudentPreview() {
  const [search, setSearch]             = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters]   = useState(false);

  // ── Courses ─────────────────────────────────────────────────────────────────
  const { data: coursesRaw, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-courses-students"],
    queryFn:  () => CoursesService.findAll({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });
  const courses = useMemo(() => normalizeCourses(coursesRaw), [coursesRaw]);

  // ── Dashboard summary (for course-level progress/completion stats) ───────────
  const { data: summary } = useQuery({
    queryKey: ["instructor-dashboard-summary"],
    queryFn:  () => InstructorDashboardService.getSummary(),
    staleTime: 1000 * 60 * 5,
  });

  const completionMap = Object.fromEntries(
    (summary?.completionRate?.perCourse ?? []).map(c => [c.courseId, c])
  );

  // ── Enrollments for selected course ─────────────────────────────────────────
  const activeCourseId = selectedCourse === "all" ? "" : selectedCourse;
  const { data: enrollmentsRaw, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["instructor-course-enrollments", activeCourseId],
    queryFn:  async () => {
      if (!activeCourseId) return [];
      try { return await EnrollmentService.findByCourse(activeCourseId); }
      catch { return []; }
    },
    enabled:  !!activeCourseId,
    retry:    false,
    staleTime: 1000 * 60 * 2,
  });
  const enrollments = useMemo(() => normalizeEnrollments(enrollmentsRaw), [enrollmentsRaw]);

  // ── "All" view: aggregate from studentsPerCourse + fake list ────────────────
  // When "All courses" is selected we show a course-level breakdown (no individual student rows)
  const showAllCourses = selectedCourse === "all";

  // ── Filter enrolled students ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (showAllCourses) return [];
    return enrollments.filter(s => {
      const matchSearch = !search
        || s.studentName.toLowerCase().includes(search.toLowerCase())
        || s.studentEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus = selectedStatus === "all" || s.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [enrollments, search, selectedStatus, showAllCourses]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalStudents   = summary?.totalStudents?.totalUniqueStudents ?? 0;
  const overallCompletion = summary?.completionRate?.overallRate ?? 0;
  const perCourse       = summary?.studentsPerCourse ?? [];

  const isLoading = coursesLoading || (!!activeCourseId && enrollmentsLoading);

  return (
    <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

      {/* ── Page header ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students</h1>
          <p className="text-sm text-gray-400 mt-0.5">{totalStudents} students across {courses.length} courses</p>
        </div>
      </motion.div>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users,        value: totalStudents,                                             label: "Total Students",  color: "bg-gradient-to-br from-blue-500 to-blue-600"     },
          { icon: BookOpen,     value: courses.length,                                            label: "Courses",         color: "bg-gradient-to-br from-indigo-500 to-violet-600" },
          { icon: CheckCircle2, value: overallCompletion > 0 ? `${overallCompletion.toFixed(0)}%` : "—", label: "Completion Rate", color: "bg-gradient-to-br from-emerald-500 to-teal-600"  },
          { icon: Activity,     value: activeCourseId ? enrollments.length : totalStudents,       label: activeCourseId ? "Enrolled" : "All Students",  color: "bg-gradient-to-br from-amber-400 to-orange-500" },
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
              <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSearch(""); }}
                className="px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all">
                <option value="all">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {!showAllCourses && (
              <div className="hidden sm:flex gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
                {(["all", "active", "completed", "at-risk"] as const).map(s => (
                  <button key={s} onClick={() => setSelectedStatus(s)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-150 ${
                      selectedStatus === s
                        ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}>
                    {s === "all" ? "All" : s === "at-risk" ? "At Risk" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden sm:hidden">
                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-white/[0.06] flex flex-col gap-2.5">
                  <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 focus:outline-none">
                    <option value="all">All Courses</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {showAllCourses ? (
          /* All courses view: per-course breakdown cards */
          <motion.div key="all-courses"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coursesLoading ? (
              <div className="col-span-3 flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
              </div>
            ) : perCourse.length === 0 ? (
              <div className="col-span-3 py-16 flex flex-col items-center gap-3">
                <GraduationCap className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400">No course data yet</p>
              </div>
            ) : perCourse.map((course, i) => {
              const comp = completionMap[course.courseId];
              return (
                <motion.div key={course.courseId}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                        {course.img
                          ? <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
                          : <BookOpen className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />{course.studentCount}
                        </span>
                        <button
                          onClick={() => setSelectedCourse(course.courseId)}
                          className="text-[10px] font-bold text-blue-500 hover:underline">
                          View
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 leading-snug">
                      {course.title}
                    </p>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-gray-400">Completion rate</span>
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                        {comp ? `${comp.completionRate.toFixed(0)}%` : "—"}
                      </span>
                    </div>
                    <ProgressBar value={comp?.completionRate ?? 0} size="sm" />
                    {comp && (
                      <p className="text-[10px] text-gray-400 mt-2">
                        {comp.completedEnrollments}/{comp.totalEnrollments} completed
                      </p>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Course-specific student list */
          <motion.div key={activeCourseId}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card>
              <div className="hidden sm:flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                <div className="w-11 flex-shrink-0" />
                <p className="flex-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">Student</p>
                <p className="hidden md:block w-44 text-[11px] font-bold uppercase tracking-widest text-gray-400">Course</p>
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
                      filtered.map((s, i) => (
                        <StudentRow
                          key={s.id}
                          student={s}
                          courseTitle={courses.find(c => c.id === activeCourseId)?.title ?? ""}
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
                          {search || selectedStatus !== "all"
                            ? "Try adjusting your search or filters"
                            : "No enrollments for this course yet"}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>

              {!isLoading && filtered.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Showing <span className="font-bold text-gray-700 dark:text-gray-300">{filtered.length}</span> students
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Course breakdown (bottom, always visible) ─────────────── */}
      {!showAllCourses && perCourse.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {perCourse.slice(0, 6).map((course, i) => {
            const comp = completionMap[course.courseId];
            return (
              <Card key={course.courseId} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]} flex items-center justify-center flex-shrink-0`}>
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />{course.studentCount}
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 leading-snug">
                  {course.title}
                </p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-gray-400">Completion</span>
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                    {comp ? `${comp.completionRate.toFixed(0)}%` : "—"}
                  </span>
                </div>
                <ProgressBar value={comp?.completionRate ?? 0} size="sm" />
              </Card>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
