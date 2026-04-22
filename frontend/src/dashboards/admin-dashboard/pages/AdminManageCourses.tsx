// src/dashboards/admin-dashboard/pages/AdminManageCourses.tsx
// Route: /admin/courses

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus, Search, Eye, Edit3, Trash2, BookOpen,
  Users, Star, Globe, ChevronDown,
  Loader2, CheckCircle2, Clock, ArchiveIcon,
  AlertTriangle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CoursesService, { CourseStatus } from "@/services/course.service";
import AdminDashboardService from "@/services/admin-dashboard.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminCourse {
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
  instructor?: { id: string; name: string; image: string | null };
  _count?: { 
    sections?: number; 
    enrollments?: number; // Total enrollments
    // Note: Backend may provide role-specific counts, but for now use total enrollments
    // and filter client-side if needed
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

const STATUS_META = {
  PUBLISHED: { label: "Published", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/40", icon: CheckCircle2 },
  DRAFT:     { label: "Draft",     color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-900/20",    border: "border-amber-200 dark:border-amber-800/40",   icon: Clock       },
  ARCHIVED:  { label: "Archived",  color: "text-gray-500 dark:text-gray-400",      bg: "bg-gray-100 dark:bg-white/[0.05]",    border: "border-gray-200 dark:border-white/[0.08]",    icon: ArchiveIcon },
} as const;

const LEVEL_GRADIENTS: Record<string, string> = {
  BEGINNER:     "from-emerald-500 to-teal-600",
  INTERMEDIATE: "from-blue-500 to-indigo-600",
  ADVANCED:     "from-violet-500 to-purple-600",
};

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}
function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay, ease: "easeOut" }}>{children}</motion.div>;
}

function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) {
  const m = STATUS_META[status] ?? STATUS_META.DRAFT;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${m.color} ${m.bg} ${m.border}`}>
      <Icon className="w-3 h-3" />{m.label}
    </span>
  );
}

// ─── Status changer dropdown ───────────────────────────────────────────────────

function StatusChanger({ course, onChangeStatus }: {
  course: AdminCourse;
  onChangeStatus: (id: string, status: CourseStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const options: { status: CourseStatus; label: string }[] = [
    { status: CourseStatus.PUBLISHED, label: "Publish" },
    { status: CourseStatus.DRAFT,     label: "Set to Draft" },
    { status: CourseStatus.ARCHIVED,  label: "Archive" },
  ];
  return (
    <div className="relative">
      <button onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors p-1">
        <ChevronDown className="w-3 h-3" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.14 }}
              className="absolute right-0 top-7 w-36 z-50 rounded-[14px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-1.5"
            >
              {options.filter(o => o.status !== course.status).map(o => (
                <button key={o.status} onClick={() => { onChangeStatus(course.id, o.status); setOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                  {o.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteModal({ course, onConfirm, onClose, isPending }: {
  course: AdminCourse;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Delete Course?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          "<span className="font-semibold text-gray-700 dark:text-gray-300">{course.title}</span>" will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Course row ───────────────────────────────────────────────────────────────

function CourseRow({ course, index, onChangeStatus, onDelete }: {
  course: AdminCourse;
  index: number;
  onChangeStatus: (id: string, status: CourseStatus) => void;
  onDelete: (course: AdminCourse) => void;
}) {
  const gradient = LEVEL_GRADIENTS[course.level] ?? "from-blue-500 to-indigo-600";
  const enrollments = course._count?.enrollments ?? 0;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
    >
      {/* Course */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {course.img ? (
            <img src={course.img} alt={course.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{course.title}</p>
            <p className="text-[10px] text-gray-400">{course.level.charAt(0) + course.level.slice(1).toLowerCase()}{course.badge ? ` · ${course.badge}` : ""}</p>
          </div>
        </div>
      </td>

      {/* Instructor */}
      <td className="px-4 py-4">
        {course.instructor ? (
          <div className="flex items-center gap-2">
            {course.instructor.image ? (
              <img src={course.instructor.image} alt={course.instructor.name} className="w-7 h-7 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-black text-white">
                  {course.instructor.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[100px]">{course.instructor.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Unassigned</span>
        )}
      </td>

      {/* Students */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-sm font-bold text-gray-800 dark:text-white">{fmt(enrollments)}</span>
        </div>
      </td>

      {/* Sections */}
      <td className="px-4 py-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {course._count?.sections ?? 0} sections
        </span>
      </td>

      {/* Price */}
      <td className="px-4 py-4">
        <span className="text-sm font-black text-gray-900 dark:text-white">${(course.price ?? 0).toFixed(0)}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <StatusBadge status={course.status} />
          <StatusChanger course={course} onChangeStatus={onChangeStatus} />
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <Link to={`/admin/courses/${course.id}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
            <Eye className="w-3 h-3" /> View
          </Link>
          <Link to={`/admin/courses/${course.id}/edit`}
            className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all">
            <Edit3 className="w-3 h-3" />
          </Link>
          <button onClick={() => onDelete(course)}
            className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminManageCourses() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusF]  = useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">("ALL");
  const [deleteTarget, setDeleteTarget] = useState<AdminCourse | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => CoursesService.findAll({ limit: 200 }) as Promise<{ items: AdminCourse[]; nextCursor: string | null }>,
    staleTime: 1000 * 60 * 2,
  });

  const courses = data?.items ?? [];

  const { data: courseStats } = useQuery({
    queryKey: ["admin-course-stats"],
    queryFn: () => AdminDashboardService.getCourses(),
    staleTime: 1000 * 60 * 2,
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CourseStatus }) => {
      if (status === CourseStatus.PUBLISHED) return CoursesService.publish(id);
      if (status === CourseStatus.ARCHIVED)  return CoursesService.archive(id);
      return CoursesService.update(id, { status });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => CoursesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      setDeleteTarget(null);
    },
  });

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = !search.trim() || c.title.toLowerCase().includes(search.toLowerCase()) || (c.instructor?.name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [courses, search, statusFilter]);

  const stats = useMemo(() => ({
    total:      courseStats?.total ?? courses.length,
    published: courseStats?.published ?? courses.filter(c => c.status === "PUBLISHED").length,
    draft:     courseStats?.draft     ?? courses.filter(c => c.status === "DRAFT").length,
    archived:  courseStats?.archived  ?? courses.filter(c => c.status === "ARCHIVED").length,
    // Use total enrollments for now - backend may need to provide role-specific counts
    students:  courses.reduce((a, c) => a + (c._count?.enrollments ?? 0), 0),
    revenue:   courses.reduce((a, c) => a + (c.price ?? 0) * (c._count?.enrollments ?? 0), 0),
  }), [courses, courseStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            course={deleteTarget}
            onConfirm={() => deleteCourse(deleteTarget.id)}
            onClose={() => setDeleteTarget(null)}
            isPending={isDeleting}
          />
        )}
      </AnimatePresence>

      <div className="max-w-[1200px] mx-auto space-y-6 pb-10">
        <Fade>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                Courses <span className="text-blue-600 dark:text-blue-400">Management</span>
              </h1>
              <p className="text-sm text-gray-400 mt-1">All courses across all instructors · Full admin control</p>
            </div>
            <Link to="/admin/courses/create">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all cursor-pointer">
                <Plus className="w-4 h-4" /> New Course
              </motion.div>
            </Link>
          </div>
        </Fade>

        {/* Stats */}
        <Fade delay={0.06}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: BookOpen,    label: "Total Courses",  value: String(stats.total),         sub: `${stats.archived} archived`,  color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40"       },
              { icon: Globe,      label: "Published",       value: String(stats.published),      sub: undefined,                     color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
              { icon: Clock,      label: "Draft",           value: String(stats.draft),          sub: undefined,                     color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"     },
              { icon: Users,      label: "Total Students",  value: fmt(stats.students),          sub: undefined,                     color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/40"   },
            ].map(({ icon: Icon, label, value, sub, color, bg }) => (
              <Card key={label} className="p-5 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
                <div>
                  <p className={cn("text-2xl font-black", color)}>{value}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                  {sub && <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>}
                </div>
              </Card>
            ))}
          </div>
        </Fade>

        {/* Filters */}
        <Fade delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses or instructors…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all" />
            </div>
            <div className="flex gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
              {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map(s => (
                <button key={s} onClick={() => setStatusF(s)}
                  className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                    statusFilter === s ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}>
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </Fade>

        {/* Table */}
        <Fade delay={0.14}>
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
              <p className="text-sm font-black text-gray-900 dark:text-white">
                All Courses <span className="text-gray-400 font-normal">({filtered.length})</span>
              </p>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs text-gray-400">Platform courses</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                    {["Course", "Instructor", "Students", "Sections", "Price", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap first:px-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((course, i) => (
                      <CourseRow
                        key={course.id}
                        course={course}
                        index={i}
                        onChangeStatus={(id, status) => changeStatus({ id, status })}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-20 text-center">
                  <BookOpen className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    {courses.length === 0 ? "No courses yet" : "No courses match your filter"}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Fade>
      </div>
    </>
  );
}
