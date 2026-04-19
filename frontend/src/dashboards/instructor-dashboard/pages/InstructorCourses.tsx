// src/dashboards/instructor-dashboard/pages/InstructorCourses.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Eye, Clock, CheckCircle2, ArchiveIcon,
  Layers, Users, Search, MoreHorizontal, Edit3,
  BarChart2, Upload, Loader2, Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CoursesService from "@/services/course.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  img: string | null;
  price: number;
  level: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  badge: string | null;
  tags: string[];
  createdAt: string;
  _count?: { sections?: number; enrollments?: number };
}

type StatusFilter = "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800/40",
    icon: Clock,
  },
  PUBLISHED: {
    label: "Published",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800/40",
    icon: CheckCircle2,
  },
  ARCHIVED: {
    label: "Archived",
    color: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-white/[0.05]",
    border: "border-gray-200 dark:border-white/[0.08]",
    icon: ArchiveIcon,
  },
} as const;

const LEVEL_GRADIENTS: Record<string, string> = {
  BEGINNER:     "from-emerald-500 to-teal-600",
  INTERMEDIATE: "from-blue-500 to-indigo-600",
  ADVANCED:     "from-violet-500 to-purple-600",
};

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ course, index }: { course: InstructorCourse; index: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = STATUS_CONFIG[course.status] ?? STATUS_CONFIG.DRAFT;
  const StatusIcon = cfg.icon;
  const gradient = LEVEL_GRADIENTS[course.level] ?? "from-blue-500 to-indigo-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white dark:bg-[#0f1623]
        border border-slate-200/80 dark:border-white/[0.07] rounded-2xl overflow-hidden
        hover:border-blue-300/60 dark:hover:border-blue-700/40 hover:shadow-md transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden flex-shrink-0">
        {course.img ? (
          <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <BookOpen className="w-12 h-12 text-white/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>
        {course.badge && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/90 backdrop-blur-sm text-white">
              {course.badge}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-2 right-2 text-white font-black text-lg">
          ${(course.price ?? 0).toFixed(0)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 flex-1">
            {course.title}
          </h3>
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
                  className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#1a2235]
                    border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-20"
                >
                  {[
                    { label: "View course",    icon: Eye,    to: `/instructor/courses/${course.id}` },
                    { label: "Manage content", icon: Edit3,  to: `/instructor/courses/${course.id}/manage` },
                    { label: "Upload videos",  icon: Upload, to: `/instructor/upload-video?courseId=${course.id}` },
                  ].map(({ label, icon: Icon, to }) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium
                        text-slate-600 dark:text-slate-300
                        hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      {label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {course.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course._count?.enrollments ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {course._count?.sections ?? 0} sections
          </span>
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5" />
            {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/instructor/courses/${course.id}/manage`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
              text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Manage Content
          </Link>
          <Link
            to={`/instructor/courses/${course.id}`}
            className="py-2 px-3 rounded-xl text-xs font-bold
              border border-slate-200 dark:border-white/[0.08]
              text-slate-500 dark:text-slate-400
              hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorCourses() {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () =>
      CoursesService.findAll() as Promise<{ items: InstructorCourse[]; nextCursor: string | null }>,
    staleTime: 1000 * 60 * 5,
  });

  const courses = data?.items ?? [];

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const matchSearch  = !search.trim() || c.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus  = statusFilter === "ALL" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [courses, search, statusFilter]);

  const stats = {
    total:     courses.length,
    published: courses.filter(c => c.status === "PUBLISHED").length,
    draft:     courses.filter(c => c.status === "DRAFT").length,
    archived:  courses.filter(c => c.status === "ARCHIVED").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Courses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage content for courses assigned to you by an admin.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40
          text-xs text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0">
          <Info className="w-3.5 h-3.5" />
          Courses are created and assigned by admin
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Courses", value: stats.total,     color: "text-slate-700 dark:text-slate-200"     },
          { label: "Published",     value: stats.published, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Drafts",        value: stats.draft,     color: "text-amber-600 dark:text-amber-400"     },
          { label: "Archived",      value: stats.archived,  color: "text-gray-500 dark:text-gray-400"       },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-white/[0.07] rounded-2xl p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
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
              focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-[#0f1623] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.07] hover:border-slate-300"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <div>
            <p className="font-bold text-slate-500 dark:text-slate-400">
              {courses.length === 0 ? "No courses assigned yet" : "No courses match your filter"}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {courses.length === 0
                ? "An admin will assign courses to you."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
