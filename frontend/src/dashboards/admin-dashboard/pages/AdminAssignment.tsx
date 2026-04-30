// src/pages/admin/AdminAssignment.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus, Search, FileText, Edit3, Trash2,
  BookOpen, Users, CheckCircle2, Clock, Loader2,
  AlertTriangle, Eye, X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AssignmentService from "@/services/assignment.service";
import CoursesService from "@/services/course.service";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay, ease: "easeOut" }}>{children}</motion.div>;
}

// Per-row submission count — each row fetches its own stats (React Query deduplicates + caches)
function SubmissionCount({ assignmentId }: { assignmentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["assignment-stats", assignmentId],
    queryFn: () => AssignmentService.getStats(assignmentId),
    staleTime: 1000 * 60 * 5,
  });
  if (isLoading) return <Loader2 className="w-3 h-3 animate-spin text-gray-400" />;
  if (!data) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-black text-gray-800 dark:text-white">{data.totalSubmissions}</span>
      <span className="text-[10px] text-gray-400">/ {data.totalEnrolled} enrolled</span>
    </div>
  );
}

// Delete confirmation modal
function DeleteModal({
  title, onConfirm, onCancel, isDeleting,
}: {
  title: string; onConfirm: () => void; onCancel: () => void; isDeleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.22)] p-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-black text-gray-900 dark:text-white text-center mb-1">Delete Assignment?</h2>
        <p className="text-sm text-gray-400 text-center mb-1">
          <span className="font-semibold text-gray-700 dark:text-gray-200">"{title}"</span>
        </p>
        <p className="text-xs text-gray-400 text-center mb-6">
          This will permanently delete the assignment and all its submissions and grades.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {isDeleting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</> : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminAssignment() {
  const [search, setSearch]           = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const qc = useQueryClient();

  // Courses list for name lookup + filter dropdown
  const { data: coursesData } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const res = await CoursesService.findAll({ limit: 200 });
      return res.items || [];
    },
    staleTime: 1000 * 60 * 10,
  });
  const courses: any[] = coursesData || [];
  const courseMap = new Map(courses.map((c: any) => [c.id, c.title as string]));

  // Assignments
  const { data: assignmentsData, isLoading, error } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const res = await AssignmentService.list({ limit: 100 });
      return res.data || [];
    },
  });

  // Admin overview stats
  const { data: adminStats } = useQuery({
    queryKey: ["admin-assignment-stats"],
    queryFn: () => AssignmentService.getAdminOverview(),
  });

  const { mutate: deleteAssignment, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => AssignmentService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["admin-assignment-stats"] });
      setDeleteTarget(null);
    },
  });

  const assignments: any[] = assignmentsData || [];

  // Unique courses that appear in assignments (for filter dropdown)
  const assignmentCourseIds = Array.from(new Set(assignments.map((a: any) => a.courseId).filter(Boolean)));

  const filtered = assignments.filter((a: any) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      a.title.toLowerCase().includes(q) ||
      (courseMap.get(a.courseId) ?? "").toLowerCase().includes(q);
    const matchCourse = courseFilter === "all" || a.courseId === courseFilter;
    return matchSearch && matchCourse;
  });

  const stats = adminStats;
  const totalAssignments  = stats?.totalAssignments  ?? assignments.length;
  const totalSubmissions  = stats?.totalSubmissions  ?? 0;
  const totalGraded       = stats?.totalGraded       ?? 0;
  const pendingSubs       = Math.max(0, totalSubmissions - totalGraded);

  if (error) {
    return (
      <div className="max-w-[1100px] mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-400 mb-4">Failed to load assignments</p>
          <button onClick={() => qc.invalidateQueries({ queryKey: ["assignments"] })}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <Fade>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Assignments <span className="text-blue-600 dark:text-blue-400">Admin</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">All assignments across all courses · Full admin control</p>
          </div>
          <Link to="/admin/assignments/create">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all cursor-pointer">
              <Plus className="w-4 h-4" /> New Assignment
            </motion.div>
          </Link>
        </div>
      </Fade>

      {/* Stats */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: FileText,     label: "Total",         value: totalAssignments, color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40"      },
            { icon: Users,        label: "Submissions",   value: totalSubmissions, color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/40"  },
            { icon: Clock,        label: "Needs Grading", value: pendingSubs,      color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"    },
            { icon: CheckCircle2, label: "Graded",        value: totalGraded,      color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label} className="p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] text-gray-400">{label}</p>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments or course…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all" />
          </div>
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
            <option value="all">All Courses</option>
            {assignmentCourseIds.map(id => (
              <option key={id} value={id}>{courseMap.get(id) ?? id}</option>
            ))}
          </select>
        </div>
      </Fade>

      {/* Table */}
      <Fade delay={0.14}>
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
            <p className="text-sm font-black text-gray-900 dark:text-white">
              All Assignments <span className="text-gray-400 font-normal">({filtered.length})</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-sm text-gray-400">Loading assignments…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">
                  {search || courseFilter !== "all" ? "No assignments match your filters" : "No assignments yet"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                    {["Title", "Course", "Due", "Submissions", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a: any, i) => {
                    const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
                    const isPast   = daysLeft < 0;
                    const isSoon   = !isPast && daysLeft <= 3;
                    const courseName = courseMap.get(a.courseId) ?? a.courseId ?? "—";

                    return (
                      <motion.tr key={a.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">

                        {/* Title */}
                        <td className="px-4 py-3.5">
                          <Link to={`/admin/assignments/${a.id}`}
                            className="text-sm font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors max-w-[200px] truncate block">
                            {a.title}
                          </Link>
                        </td>

                        {/* Course name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 max-w-[160px]">
                            <BookOpen className="w-3 h-3 text-blue-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{courseName}</span>
                          </div>
                        </td>

                        {/* Due */}
                        <td className="px-4 py-3.5">
                          <span className={cn("text-xs font-semibold",
                            isPast ? "text-red-500" : isSoon ? "text-amber-500" : "text-gray-500")}>
                            {isPast ? `${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? "Today" : `in ${daysLeft}d`}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(a.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </p>
                        </td>

                        {/* Submission count */}
                        <td className="px-4 py-3.5">
                          <SubmissionCount assignmentId={a.id} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border",
                            isPast
                              ? "bg-gray-50 dark:bg-white/[0.03] text-gray-500 border-gray-200 dark:border-white/[0.08]"
                              : isSoon
                              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800/40"
                              : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800/40"
                          )}>
                            {isPast ? "Closed" : isSoon ? "Due Soon" : "Open"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Link to={`/admin/assignments/${a.id}`}
                              className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all"
                              title="Preview">
                              <Eye className="w-3 h-3" />
                            </Link>
                            <Link to={`/admin/assignments/${a.id}/submissions`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                              title="Submissions">
                              <Users className="w-3 h-3" /> Submissions
                            </Link>
                            <Link to={`/admin/assignments/${a.id}/edit`}
                              className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all"
                              title="Edit">
                              <Edit3 className="w-3 h-3" />
                            </Link>
                            <button onClick={() => setDeleteTarget({ id: a.id, title: a.title })}
                              className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all"
                              title="Delete">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </Fade>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            title={deleteTarget.title}
            isDeleting={isDeleting}
            onConfirm={() => deleteAssignment(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
