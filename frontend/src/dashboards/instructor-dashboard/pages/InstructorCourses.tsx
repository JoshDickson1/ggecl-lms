// InstructorMyCourses.tsx
// PAGE 0 of the instructor flow — the first page an instructor sees.
// Lists all assigned courses with upload status and quick actions.
// Light / dark mode via Tailwind's `dark:` prefix (respects system preference).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Upload, Eye, Clock, CheckCircle2,
  ChevronRight, Film, Layers, Users, Search, Filter,
  MoreHorizontal, Edit3, BarChart2, Sparkles,
} from "lucide-react";
import { ASSIGNED_COURSES, Course } from "@/data/courseTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadStatus = "not_started" | "video_uploaded" | "materials_added" | "published";

interface CourseWithStatus extends Course {
  uploadStatus: UploadStatus;
  lastUpdated?: string;
  completionPct: number;
}

// ─── Mock enriched data ───────────────────────────────────────────────────────

const COURSES_WITH_STATUS: CourseWithStatus[] = [
  {
    ...ASSIGNED_COURSES[0],
    uploadStatus: "materials_added",
    lastUpdated: "2 days ago",
    completionPct: 75,
  },
  {
    ...ASSIGNED_COURSES[1],
    uploadStatus: "video_uploaded",
    lastUpdated: "5 days ago",
    completionPct: 40,
  },
  {
    ...ASSIGNED_COURSES[2],
    uploadStatus: "not_started",
    lastUpdated: undefined,
    completionPct: 0,
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  UploadStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode; darkColor: string; darkBg: string }
> = {
  not_started: {
    label: "Not started",
    color: "text-slate-500",
    darkColor: "dark:text-slate-400",
    bg: "bg-slate-100",
    darkBg: "dark:bg-slate-800",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  video_uploaded: {
    label: "Video uploaded",
    color: "text-amber-600",
    darkColor: "dark:text-amber-400",
    bg: "bg-amber-50",
    darkBg: "dark:bg-amber-900/30",
    icon: <Film className="w-3.5 h-3.5" />,
  },
  materials_added: {
    label: "Materials added",
    color: "text-blue-600",
    darkColor: "dark:text-blue-400",
    bg: "bg-blue-50",
    darkBg: "dark:bg-blue-900/30",
    icon: <Layers className="w-3.5 h-3.5" />,
  },
  published: {
    label: "Published",
    color: "text-emerald-600",
    darkColor: "dark:text-emerald-400",
    bg: "bg-emerald-50",
    darkBg: "dark:bg-emerald-900/30",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: UploadStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        ${cfg.color} ${cfg.darkColor} ${cfg.bg} ${cfg.darkBg}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

// function ProgressRing({ pct, size = 44 }: { pct: number; size?: number }) {
//   const r = (size - 6) / 2;
//   const circ = 2 * Math.PI * r;
//   const offset = circ * (1 - pct / 100);
//   return (
//     <svg width={size} height={size} className="-rotate-90">
//       <circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         className="stroke-slate-200 dark:stroke-slate-700" strokeWidth={3} />
//       <circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke={pct === 100 ? "#10b981" : pct > 0 ? "#3b82f6" : "#e2e8f0"}
//         strokeWidth={3}
//         strokeDasharray={circ}
//         strokeDashoffset={offset}
//         strokeLinecap="round"
//       />
//     </svg>
//   );
// }

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  course, onUpload, onView,
}: {
  course: CourseWithStatus;
  onUpload: (id: string) => void;
  onView: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  // const cfg = STATUS_CONFIG[course.uploadStatus];

  const primaryAction =
    course.uploadStatus === "not_started"
      ? { label: "Start uploading", icon: <Upload className="w-4 h-4" />, fn: () => onUpload(course.id) }
      : course.uploadStatus === "published"
      ? { label: "View course", icon: <Eye className="w-4 h-4" />, fn: () => onView(course.id) }
      : { label: "Continue setup", icon: <Edit3 className="w-4 h-4" />, fn: () => onUpload(course.id) };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-[#0f1623] border border-slate-200/80 dark:border-white/[0.07]
        rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-white/[0.14]
        hover:shadow-md dark:hover:shadow-none transition-all duration-200"
    >
      {/* Top color strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${course.color}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color}
              flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}
          >
            {course.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
                  {course.code} · {course.subject}
                </p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {course.name}
                </h3>
              </div>
              {/* Menu */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setMenuOpen(p => !p)}
                  className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600
                    hover:text-slate-600 dark:hover:text-slate-300
                    hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1a2235]
                        border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-10"
                    >
                      {[
                        { label: "Edit video",     icon: <Film className="w-3.5 h-3.5" />,     fn: () => onUpload(course.id) },
                        { label: "Add materials",  icon: <Layers className="w-3.5 h-3.5" />,   fn: () => onUpload(course.id) },
                      ].map(item => (
                        <button
                          key={item.label}
                          onClick={() => { item.fn(); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5
                            text-xs font-medium text-slate-600 dark:text-slate-300
                            hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <span className="text-slate-400 dark:text-slate-500">{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {course.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Users className="w-3.5 h-3.5" />
            {course.totalStudents} enrolled
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <BarChart2 className="w-3.5 h-3.5" />
            {course.level}
          </span>
          {course.lastUpdated && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              Updated {course.lastUpdated}
            </span>
          )}
        </div>

        {/* Setup progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Setup progress
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {course.completionPct}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.completionPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                course.completionPct === 100
                  ? "bg-emerald-500"
                  : course.completionPct > 0
                  ? "bg-blue-500"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-1.5 mb-4">
          {(["not_started", "video_uploaded", "materials_added", "published"] as UploadStatus[]).map(
            (step, i) => {
              const stepIndex = ["not_started", "video_uploaded", "materials_added", "published"].indexOf(
                course.uploadStatus
              );
              const done = i <= stepIndex;
              return (
                <div
                  key={step}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    done ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              );
            }
          )}
        </div>

        {/* Status + CTA */}
        <div className="flex items-center justify-between">
          <StatusBadge status={course.uploadStatus} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={primaryAction.fn}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              course.uploadStatus === "not_started"
                ? "bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-700 dark:hover:bg-blue-500"
                : course.uploadStatus === "published"
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            {primaryAction.icon}
            {primaryAction.label}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex flex-col items-center gap-4 py-20"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
      </div>
      <div className="text-center">
        <p className="font-bold text-slate-400 dark:text-slate-500">No courses match your filter</p>
        <p className="text-sm text-slate-300 dark:text-slate-600 mt-1">Try adjusting the search or status filter</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorCourses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UploadStatus | "all">("all");

  const filtered = COURSES_WITH_STATUS.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.uploadStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: COURSES_WITH_STATUS.length,
    published: COURSES_WITH_STATUS.filter(c => c.uploadStatus === "published").length,
    inProgress: COURSES_WITH_STATUS.filter(c =>
      c.uploadStatus === "video_uploaded" || c.uploadStatus === "materials_added"
    ).length,
    notStarted: COURSES_WITH_STATUS.filter(c => c.uploadStatus === "not_started").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d18]">
      {/* Subtle bg detail */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full
          bg-blue-100/60 dark:bg-blue-900/10 blur-3xl" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 py-10">

        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-5">
            <span>Instructor Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">My Courses</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                My Courses
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Manage your assigned courses — upload videos, add materials, and publish for students.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/instructor/upload-video")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold
                text-white bg-gradient-to-br from-blue-600 to-blue-700
                hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900/40
                transition-all flex-shrink-0"
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats row ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Total Courses",  value: stats.total,       color: "text-slate-700 dark:text-slate-200",   bg: "bg-white dark:bg-[#0f1623]" },
            { label: "Published",      value: stats.published,   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-white dark:bg-[#0f1623]" },
            { label: "In Progress",    value: stats.inProgress,  color: "text-blue-600 dark:text-blue-400",     bg: "bg-white dark:bg-[#0f1623]" },
            { label: "Not Started",    value: stats.notStarted,  color: "text-amber-600 dark:text-amber-400",   bg: "bg-white dark:bg-[#0f1623]" },
          ].map(s => (
            <div
              key={s.label}
              className={`${s.bg} border border-slate-200 dark:border-white/[0.07] rounded-2xl p-4`}
            >
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Filter bar ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex items-center gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                bg-white dark:bg-[#0f1623]
                border border-slate-200 dark:border-white/[0.08]
                text-slate-700 dark:text-white
                placeholder:text-slate-300 dark:placeholder:text-slate-600
                focus:outline-none focus:border-blue-400 dark:focus:border-blue-500/60
                transition-colors"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "not_started", "video_uploaded", "materials_added", "published"] as const).map(
              status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                    transition-all ${
                    statusFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-[#0f1623] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  {status === "all" ? (
                    <>
                      <Filter className="w-3 h-3" /> All
                    </>
                  ) : (
                    <>
                      {STATUS_CONFIG[status].icon}
                      {STATUS_CONFIG[status].label}
                    </>
                  )}
                </button>
              )
            )}
          </div>
        </motion.div>

        {/* ── Course grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <CourseCard
                    course={course}
                    onUpload={() => navigate("/instructor/upload-video")}
                    onView={() => navigate("/instructor/course-materials")}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ── Help banner ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex items-center gap-4 px-6 py-4 rounded-2xl
            bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50
            flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
              New to uploading?
            </p>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/60">
              Select a course above to start the 2-step upload flow: first add your main lecture video
              and chapter markers, then add supplementary sections, files, and quizzes.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}