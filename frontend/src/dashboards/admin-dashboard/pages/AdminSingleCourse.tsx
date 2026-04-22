// src/dashboards/admin-dashboard/pages/AdminSingleCourse.tsx
// Route: /admin/courses/:id

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Edit3, Trash2, Globe, Archive,
  Users, DollarSign, BookOpen,
  CheckCircle2, ChevronDown, Target, BarChart3,
  AlignLeft, Loader2, Clock, Info, Layers,
  AlertTriangle, Video, FileText, Music, Link2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CoursesService, { CourseStatus } from "@/services/course.service";
import EnrollmentService from "@/services/enrollment.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseMaterial {
  id: string;
  type: string;
  title: string;
  url: string;
  fileName: string | null;
  size: number | null;
}

interface CourseLesson {
  id: string;
  title: string;
  position: number;
  duration: number | null;
  isPreview: boolean;
  description: string | null;
  materials: CourseMaterial[];
}

interface CourseSection {
  id: string;
  title: string;
  position: number;
  lessons: CourseLesson[];
}

interface AdminCourseDetail {
  id: string;
  title: string;
  description: string;
  img: string | null;
  videoUrl: string | null;
  price: number;
  level: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  badge: string | null;
  tags: string[];
  syllabus: string[];
  includes: string[];
  certification: string | null;
  createdAt: string;
  updatedAt: string;
  instructorId: string | null;
  instructor?: { id: string; name: string; image: string | null; email: string };
  sections: CourseSection[];
  _count?: { enrollments?: number };
}

interface Enrollment {
  id: string;
  studentId: string;
  enrolledAt: string;
  student?: { id: string; name: string; image: string | null; email: string };
  // Student progress data from backend
  lessonsCompleted?: number;
  progressPercentage?: number;
  lastActiveAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}
function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay }}>{children}</motion.div>;
}
function SHead({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

const STATUS_META = {
  PUBLISHED: { label: "Published", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/40" },
  DRAFT:     { label: "Draft",     color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-900/20",    border: "border-amber-200 dark:border-amber-800/40"   },
  ARCHIVED:  { label: "Archived",  color: "text-gray-500 dark:text-gray-400",      bg: "bg-gray-100 dark:bg-white/[0.05]",    border: "border-gray-200 dark:border-white/[0.08]"    },
} as const;

const LEVEL_GRADIENTS: Record<string, string> = {
  BEGINNER:     "from-emerald-500 to-teal-600",
  INTERMEDIATE: "from-blue-500 to-indigo-600",
  ADVANCED:     "from-violet-500 to-purple-600",
};

const MATERIAL_ICONS: Record<string, React.ElementType> = {
  VIDEO:    Video,
  DOCUMENT: FileText,
  AUDIO:    Music,
  LINK:     Link2,
};

function fmtDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function avatarInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "from-emerald-500 to-teal-600", "from-pink-500 to-rose-600",
  "from-violet-500 to-purple-600", "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-600",
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({ title, onConfirm, onClose, isPending }: {
  title: string; onConfirm: () => void; onClose: () => void; isPending: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.25)] p-8 max-w-sm w-full text-center"
        onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Delete Course?</h3>
        <p className="text-sm text-gray-400 mb-6">
          <strong className="text-gray-700 dark:text-gray-300">"{title}"</strong> and all its content will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Curriculum tab ───────────────────────────────────────────────────────────

function CurriculumTab({ sections }: { sections: CourseSection[] }) {
  const [openSections, setOpen] = useState<string[]>([sections[0]?.id ?? ""]);
  const toggle = (id: string) => setOpen(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const totalLessons = sections.reduce((a, s) => a + s.lessons.length, 0);

  if (sections.length === 0) {
    return (
      <div className="p-6 py-16 text-center flex flex-col items-center gap-3">
        <Layers className="w-10 h-10 text-gray-200 dark:text-gray-700" />
        <p className="text-sm text-gray-400">No curriculum yet. The instructor will add sections and lessons.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <p className="text-xs text-gray-400 mb-4">{sections.length} sections · {totalLessons} lessons</p>
      {sections.sort((a, b) => a.position - b.position).map((sec, si) => {
        const isOpen = openSections.includes(sec.id);
        const lessonCount = sec.lessons.length;
        return (
          <div key={sec.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
            <button onClick={() => toggle(sec.id)}
              className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50/80 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors text-left">
              <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center flex-shrink-0">{si + 1}</span>
              <span className="flex-1 text-sm font-bold text-gray-900 dark:text-white">{sec.title}</span>
              <span className="text-xs text-gray-400">{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</span>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                  <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                    {sec.lessons.sort((a, b) => a.position - b.position).map(lesson => {
                      const mat = lesson.materials?.[0];
                      const MatIcon = mat ? (MATERIAL_ICONS[mat.type] ?? FileText) : Video;
                      const dur = fmtDuration(lesson.duration);
                      return (
                        <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-transparent">
                          <MatIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className={cn("flex-1 text-sm", lesson.isPreview ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-400")}>
                            {lesson.title}
                            {lesson.isPreview && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600">FREE</span>}
                          </span>
                          {lesson.materials.length > 0 && (
                            <span className="text-[10px] text-gray-400">{lesson.materials.length} file{lesson.materials.length !== 1 ? "s" : ""}</span>
                          )}
                          {dur && <span className="text-xs text-gray-400 tabular-nums">{dur}</span>}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Students tab ─────────────────────────────────────────────────────────────

function StudentsTab({ courseId }: { courseId: string }) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-course-enrollments", courseId],
    queryFn: () => EnrollmentService.findByCourse(courseId) as Promise<Enrollment[] | { data?: Enrollment[] }>,
    staleTime: 1000 * 60 * 2,
  });

  const enrollments: Enrollment[] = Array.isArray(data) ? data : ((data as { data?: Enrollment[] })?.data ?? []);

  const filtered = enrollments.filter(e =>
    !search.trim() ||
    (e.student?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (e.student?.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="relative">
        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search enrolled students…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{enrollments.length === 0 ? "No enrolled students yet" : "No students match your search"}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((e, i) => {
            const name = e.student?.name ?? `Student ${e.studentId.slice(0, 6)}`;
            const email = e.student?.email ?? "";
            const color = avatarColor(name);
            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.07] hover:border-blue-200 dark:hover:border-blue-800/40 transition-all">
                {e.student?.image ? (
                  <img src={e.student.image} alt={name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center font-black text-sm flex-shrink-0`}>
                    {avatarInitials(name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{name}</p>
                  {email && <p className="text-[10px] text-gray-400">{email}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    {e.lessonsCompleted != null && (
                      <p className="text-xs text-gray-400">
                        <span className="font-medium">{e.lessonsCompleted}</span> lessons completed
                      </p>
                    )}
                    {e.lastActiveAt && (
                      <p className="text-xs text-gray-400">
                        Last active: {formatRelativeTime(e.lastActiveAt)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {e.progressPercentage != null && (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                          style={{ width: `${Math.min(e.progressPercentage, 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{e.progressPercentage}%</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(e.enrolledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminSingleCourse() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const qc         = useQueryClient();
  const [tab, setTab]               = useState<"overview" | "students" | "curriculum" | "analytics">("overview");
  const [deleteModal, setDeleteModal] = useState(false);
  const [toastMsg, setToastMsg]     = useState("");

  const { data: course, isLoading } = useQuery<AdminCourseDetail>({
    queryKey: ["admin-course", id],
    queryFn: () => CoursesService.findOne(id!) as Promise<AdminCourseDetail>,
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: (status: CourseStatus) => {
      if (status === CourseStatus.PUBLISHED) return CoursesService.publish(id!);
      if (status === CourseStatus.ARCHIVED)  return CoursesService.archive(id!);
      return CoursesService.update(id!, { status });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-course", id] });
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast("Status updated");
    },
  });

  const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
    mutationFn: () => CoursesService.remove(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      navigate("/admin/courses");
    },
  });

  const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-7 h-7 text-blue-500 animate-spin" /></div>;
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <BookOpen className="w-10 h-10 text-gray-300" />
        <p className="text-gray-500">Course not found.</p>
        <Link to="/admin/courses" className="text-sm text-blue-600 hover:underline">Back to courses</Link>
      </div>
    );
  }

  const gradient    = LEVEL_GRADIENTS[course.level] ?? "from-blue-500 to-indigo-600";
  const statusMeta  = STATUS_META[course.status] ?? STATUS_META.DRAFT;
  const enrollments = course._count?.enrollments ?? 0;
  const totalLessons = course.sections?.reduce((a, s) => a + s.lessons.length, 0) ?? 0;
  const revenue = (course.price ?? 0) * enrollments;

  const TABS = [
    { id: "overview",   label: "Overview" },
    { id: "curriculum", label: `Curriculum (${totalLessons})` },
    { id: "students",   label: `Students (${enrollments})` },
    { id: "analytics",  label: "Analytics" },
  ] as const;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* Back */}
      <Fade>
        <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>

        {/* Hero card */}
        <Card>
          {/* Banner */}
          {course.img ? (
            <div className="h-28 rounded-t-[22px] overflow-hidden relative">
              <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Link to={`/admin/courses/${course.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold hover:bg-white/30 transition-all">
                  <Edit3 className="w-3 h-3" /> Edit
                </Link>
                <button onClick={() => setDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/30 backdrop-blur-sm border border-red-400/40 text-white text-xs font-bold hover:bg-red-500/50 transition-all">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className={`h-28 rounded-t-[22px] bg-gradient-to-br ${gradient} relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Link to={`/admin/courses/${course.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold hover:bg-white/30 transition-all">
                  <Edit3 className="w-3 h-3" /> Edit
                </Link>
                <button onClick={() => setDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/30 backdrop-blur-sm border border-red-400/40 text-white text-xs font-bold hover:bg-red-500/50 transition-all">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          )}

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mt-4 mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold border", statusMeta.color, statusMeta.bg, statusMeta.border)}>
                    {statusMeta.label}
                  </span>
                  {course.badge && (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                      {course.badge}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400">
                    {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{course.title}</h1>
                {course.tags.length > 0 && (
                  <p className="text-sm text-gray-400 mt-0.5">{course.tags.join(" · ")}</p>
                )}
              </div>
              <div className="flex-shrink-0 text-right px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${revenue.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">Est. Revenue</p>
              </div>
            </div>

            {/* Instructor row */}
            {course.instructor && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
                {course.instructor.image ? (
                  <img src={course.instructor.image} alt={course.instructor.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-black text-white">{avatarInitials(course.instructor.name)}</span>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">Instructor</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{course.instructor.name}</p>
                </div>
              </div>
            )}

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Users,      val: String(enrollments),  sub: "Students"  },
                { icon: DollarSign, val: `$${(course.price ?? 0).toFixed(2)}`,   sub: "Price"     },
                { icon: BookOpen,   val: String(totalLessons), sub: "Lessons"   },
                { icon: Layers,     val: String(course.sections?.length ?? 0),   sub: "Sections"  },
              ].map(({ icon: Icon, val, sub }) => (
                <div key={sub} className="flex flex-col items-center py-4 px-3 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-center">
                  <Icon className="w-4 h-4 text-blue-500 mb-1.5" />
                  <p className="text-base font-black text-gray-900 dark:text-white">{val}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Fade>

      {/* Tabs */}
      <Fade delay={0.06}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("px-5 py-2 rounded-xl text-sm font-bold transition-all",
                tab === t.id ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}>{t.label}</button>
          ))}
        </div>
      </Fade>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-5">
            <Fade delay={0.08}>
              <Card>
                <SHead icon={AlignLeft} title="Course Description" />
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{course.description}</p>
                </div>
              </Card>
            </Fade>

            {course.syllabus?.filter(Boolean).length > 0 && (
              <Fade delay={0.11}>
                <Card>
                  <SHead icon={Target} title="What Students Will Learn" />
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {course.syllabus.filter(Boolean).map((o, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{o}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </Fade>
            )}

            {course.includes?.filter(Boolean).length > 0 && (
              <Fade delay={0.14}>
                <Card>
                  <SHead icon={BookOpen} title="Requirements" />
                  <div className="p-6 flex flex-col gap-2">
                    {course.includes.filter(Boolean).map((r, i) => (
                      <p key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {r}
                      </p>
                    ))}
                  </div>
                </Card>
              </Fade>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            <Fade delay={0.1}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">Quick Actions</p>
                <div className="flex flex-col gap-2">
                  <Link to={`/admin/courses/${course.id}/edit`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600 transition-all">
                    <Edit3 className="w-4 h-4 flex-shrink-0" /> Edit Course
                  </Link>
                  {course.status !== "PUBLISHED" && (
                    <button onClick={() => changeStatus(CourseStatus.PUBLISHED)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                      <Globe className="w-4 h-4 flex-shrink-0" /> Publish Course
                    </button>
                  )}
                  {course.status !== "ARCHIVED" && (
                    <button onClick={() => changeStatus(CourseStatus.ARCHIVED)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all">
                      <Archive className="w-4 h-4 flex-shrink-0" /> Archive
                    </button>
                  )}
                  {course.status !== "DRAFT" && (
                    <button onClick={() => changeStatus(CourseStatus.DRAFT)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                      <Clock className="w-4 h-4 flex-shrink-0" /> Set to Draft
                    </button>
                  )}
                  <button onClick={() => setDeleteModal(true)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                    <Trash2 className="w-4 h-4 flex-shrink-0" /> Delete Course
                  </button>
                </div>
              </Card>
            </Fade>

            {course.tags.length > 0 && (
              <Fade delay={0.14}>
                <Card className="p-5">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map(t => (
                      <span key={t} className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03]">{t}</span>
                    ))}
                  </div>
                </Card>
              </Fade>
            )}

            <Fade delay={0.17}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Details</p>
                {[
                  { label: "Created", val: new Date(course.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
                  { label: "Updated", val: new Date(course.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
                  { label: "Certificate", val: course.certification ?? "None" },
                  { label: "Video URL", val: course.videoUrl ? "Set" : "Not set" },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{val}</span>
                  </div>
                ))}
              </Card>
            </Fade>
          </div>
        </div>
      )}

      {/* ── Curriculum ── */}
      {tab === "curriculum" && (
        <Fade delay={0.08}>
          <Card>
            <SHead icon={BookOpen} title="Course Curriculum" />
            <CurriculumTab sections={course.sections ?? []} />
          </Card>
        </Fade>
      )}

      {/* ── Students ── */}
      {tab === "students" && (
        <Fade delay={0.08}>
          <Card>
            <SHead icon={Users} title={`Enrolled Students (${enrollments})`} />
            <StudentsTab courseId={course.id} />
          </Card>
        </Fade>
      )}

      {/* ── Analytics ── */}
      {tab === "analytics" && (
        <Fade delay={0.08}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "Total Students",  val: String(enrollments),            sub: "enrolled",       color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40"      },
              { label: "Est. Revenue",    val: `$${revenue.toLocaleString()}`, sub: "price × enrolled", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
              { label: "Sections",        val: String(course.sections?.length ?? 0), sub: "created",  color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/40"  },
              { label: "Lessons",         val: String(totalLessons),           sub: "total",          color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"    },
              { label: "Price",           val: `$${(course.price ?? 0).toFixed(2)}`, sub: "per seat", color: "text-purple-600",  bg: "bg-purple-50 dark:bg-purple-950/40"  },
              { label: "Status",          val: statusMeta.label,               sub: "current",        color: "text-teal-600",    bg: "bg-teal-50 dark:bg-teal-950/40"      },
            ].map(({ label, val, sub, color, bg }) => (
              <Card key={label} className="p-6 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", bg)}>
                  <BarChart3 className={cn("w-6 h-6", color)} />
                </div>
                <div>
                  <p className={cn("text-2xl font-black", color)}>{val}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </Card>
            ))}
            <div className="sm:col-span-2">
              <div className="flex gap-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Detailed analytics (completion rate, rating breakdown, revenue timeline) require a dedicated backend endpoint:
                  {" "}<code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 rounded">GET /dashboard/admin/courses/:id/analytics</code>.
                </p>
              </div>
            </div>
          </div>
        </Fade>
      )}

      {/* Delete modal */}
      <AnimatePresence>
        {deleteModal && (
          <ConfirmDeleteModal
            title={course.title}
            onConfirm={() => deleteCourse()}
            onClose={() => setDeleteModal(false)}
            isPending={isDeleting}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-semibold">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
