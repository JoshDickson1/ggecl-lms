// src/dashboards/student-dashboard/pages/StudentCertificates.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap, Lock, Download, Share2, ExternalLink,
  Award, CheckCircle2, BookOpen, Search,
  Calendar, Star, ChevronRight, Clock,
} from "lucide-react";
import ProgressService from "@/services/progress.service";
import { useAuth } from "@/context/AuthProvider";
import { ApiErrorPage } from "@/components/ui/ApiError";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GRADIENTS = [
  "from-violet-500 to-purple-400",
  "from-amber-500 to-yellow-400",
  "from-sky-500 to-blue-400",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-pink-400",
  "from-indigo-500 to-blue-400",
  "from-orange-500 to-amber-400",
  "from-cyan-500 to-blue-400",
];

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-rose-500", "bg-amber-500", "bg-pink-500",
];

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function gradientFor(id: string) { return GRADIENTS[strHash(id) % GRADIENTS.length]; }
function avatarBgFor(name: string) { return AVATAR_COLORS[strHash(name) % AVATAR_COLORS.length]; }
function initialsOf(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }

function ratingToGrade(rating?: number): string | undefined {
  if (!rating) return undefined;
  if (rating >= 4.8) return "A+";
  if (rating >= 4.5) return "A";
  if (rating >= 4.0) return "A-";
  if (rating >= 3.7) return "B+";
  if (rating >= 3.3) return "B";
  return "B-";
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function credId(courseId: string, completedAt: string | null | undefined): string {
  const year = completedAt ? new Date(completedAt).getFullYear() : new Date().getFullYear();
  const slug = courseId.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase();
  return `GGECL-${year}-${slug}`;
}

function fmtMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  instructor: string;
  instructorBg: string;
  instructorAvatar: string;
  thumbnail: string;
  completedAt: string;
  credentialId: string;
  lectures: number;
  totalLectures: number;
  grade?: string;
}

interface LockedCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  lectures: number;
  totalLectures: number;
}

// ─── Grade styling ────────────────────────────────────────────────────────────

const GRADE_COLOR: Record<string, string> = {
  "A+": "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50",
  "A":  "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50",
  "A-": "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
  "B+": "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50",
  "B":  "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50",
  "B-": "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06] ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto pb-10 space-y-8">
      <Sk className="h-12 w-64" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Sk key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-64 rounded-[22px]" />)}
      </div>
    </div>
  );
}

// ─── Certificate card ─────────────────────────────────────────────────────────

function CertificateCard({ cert, index, studentName }: {
  cert: Certificate;
  index: number;
  studentName: string;
}) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06 }}
        className="rounded-[22px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_4px_24px_rgba(0,0,0,0.05)]
          hover:shadow-[0_0_0_1.5px_rgba(59,130,246,0.3),0_8px_32px_rgba(59,130,246,0.1)]
          transition-all duration-300 overflow-hidden group cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        <div className={`h-2 w-full bg-gradient-to-r ${cert.thumbnail}`} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cert.thumbnail}
              flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.15)] flex-shrink-0`}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {cert.grade && (
                <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${GRADE_COLOR[cert.grade] ?? GRADE_COLOR["B"]}`}>
                  {cert.grade}
                </span>
              )}
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold
                bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400
                border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            </div>
          </div>

          <h3 className="text-sm font-black text-gray-900 dark:text-white leading-snug mb-1
            group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {cert.courseTitle}
          </h3>

          <div className="flex items-center gap-1.5 mb-4">
            <span className={`w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0 ${cert.instructorBg}`}>
              {cert.instructorAvatar}
            </span>
            <span className="text-xs text-gray-400">{cert.instructor}</span>
          </div>

          <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {cert.lectures}/{cert.totalLectures} lessons
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {cert.completedAt}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={e => e.stopPropagation()}
                className="w-8 h-8 rounded-xl flex items-center justify-center
                  bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]
                  text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all">
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={e => e.stopPropagation()}
                className="w-8 h-8 rounded-xl flex items-center justify-center
                  bg-blue-600 hover:bg-blue-500 text-white
                  shadow-[0_3px_10px_rgba(59,130,246,0.35)] transition-all">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetail && (
          <CertificateModal cert={cert} studentName={studentName} onClose={() => setShowDetail(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Certificate detail modal ─────────────────────────────────────────────────

function CertificateModal({ cert, studentName, onClose }: {
  cert: Certificate;
  studentName: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden"
      >
        {/* Certificate preview */}
        <div className={`relative h-52 bg-gradient-to-br ${cert.thumbnail} flex flex-col items-center justify-center p-6`}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-xl">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Certificate of Completion</p>
            <p className="text-white text-lg font-black leading-tight px-4">{cert.courseTitle}</p>
            <p className="text-white/70 text-xs mt-2">Awarded to: {studentName}</p>
          </div>
          <div className="absolute bottom-4 right-4 opacity-30">
            <p className="text-white text-[10px] font-black tracking-widest">GGECL LMS</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Issued",        value: cert.completedAt                    },
              { label: "Credential ID", value: cert.credentialId                   },
              { label: "Lessons",       value: `${cert.lectures}/${cert.totalLectures}` },
              { label: "Instructor",    value: cert.instructor                     },
              { label: "Grade",         value: cert.grade ?? "Pass"                },
            ].map(({ label, value }) => (
              <div key={label} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold
              bg-blue-600 hover:bg-blue-500 text-white
              shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
              border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
              hover:border-blue-200 hover:text-blue-600 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
              border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
              hover:border-blue-200 hover:text-blue-600 transition-all">
              <ExternalLink className="w-4 h-4" /> Verify
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Locked course card ───────────────────────────────────────────────────────

function LockedCard({ course, index }: { course: LockedCourse; index: number }) {
  const remaining = course.totalLectures - course.lectures;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 rounded-[18px]
        bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
    >
      <div className={`relative w-14 h-14 rounded-2xl flex-shrink-0 bg-gradient-to-br ${course.thumbnail} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Lock className="w-5 h-5 text-white/80" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <Link to={`/student/courses/${course.id}/watch`}
          className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1
            hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {course.title}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">{course.instructor}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.07] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
            />
          </div>
          <span className="text-[11px] font-bold text-blue-500 flex-shrink-0">{course.progress}%</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{remaining}</p>
        <p className="text-[10px] text-gray-400">lessons left</p>
        <Link to={`/student/courses/${course.id}/watch`}
          className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
          Continue <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentCertificates() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: dashRaw, isLoading: dashLoading, isError: dashError, refetch: refetchDash } = useQuery({
    queryKey: ["progress-dashboard"],
    queryFn: () => ProgressService.getDashboard() as Promise<any>,
  });

  const { data: topRaw, isLoading: topLoading } = useQuery({
    queryKey: ["progress-top-courses"],
    queryFn: () => ProgressService.getTopCourses(),
  });

  const isLoading = dashLoading || topLoading;
  if (isLoading) return <PageSkeleton />;
  if (dashError) return <ApiErrorPage onRetry={refetchDash} message="Failed to load certificates." />;

  // ── Build data ────────────────────────────────────────────────────────────

  const allCourses: any[] = dashRaw?.courses ?? [];
  const stats = dashRaw?.stats;

  // Map of courseId → completedAt from getTopCourses
  const completedAtMap: Record<string, string | null> = {};
  for (const t of (topRaw ?? [])) {
    completedAtMap[t.id] = t.completedAt;
  }

  const earned: Certificate[] = allCourses
    .filter(c => c.completed)
    .map(c => ({
      id: `cert-${c.courseId}`,
      courseId: c.courseId,
      courseTitle: c.title,
      instructor: c.instructor?.name ?? "Instructor",
      instructorBg: avatarBgFor(c.instructor?.name ?? c.courseId),
      instructorAvatar: initialsOf(c.instructor?.name ?? "IN"),
      thumbnail: gradientFor(c.courseId),
      completedAt: fmtDate(completedAtMap[c.courseId] ?? (c as any).completedAt ?? null),
      credentialId: credId(c.courseId, completedAtMap[c.courseId] ?? (c as any).completedAt),
      lectures: c.completedLessons ?? 0,
      totalLectures: c.totalLessons ?? 0,
      grade: ratingToGrade(c.myRating),
    }));

  const inProgress: LockedCourse[] = allCourses
    .filter(c => !c.completed)
    .map(c => ({
      id: c.courseId,
      title: c.title,
      instructor: c.instructor?.name ?? "Instructor",
      thumbnail: gradientFor(c.courseId),
      progress: Math.round(c.progressPercent ?? 0),
      lectures: c.completedLessons ?? 0,
      totalLectures: c.totalLessons ?? 0,
    }));

  // Stats
  const totalStudyMins: number = stats?.totalTimeSpentThisMonth ?? 0;
  const avgGrade = earned.length > 0
    ? earned.filter(c => c.grade).map(c => c.grade!)[0] ?? "—"
    : "—";

  // Search filter
  const filtered = earned.filter(c =>
    !search ||
    c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  const studentName = user?.name ?? "Student";

  return (
    <div className="max-w-[1100px] mx-auto pb-10 space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          My <span className="text-blue-600 dark:text-blue-400">Certificates</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {earned.length} certificate{earned.length !== 1 ? "s" : ""} earned · {inProgress.length} in progress
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { icon: Award,    value: String(earned.length),           label: "Earned",      color: "emerald" },
          { icon: Lock,     value: String(inProgress.length),       label: "In Progress", color: "blue"    },
          { icon: Star,     value: avgGrade,                        label: "Avg Grade",   color: "amber"   },
          { icon: Clock,    value: fmtMinutes(totalStudyMins),      label: "Study Time",  color: "blue"    },
        ].map(({ icon: Icon, value, label, color }) => {
          const palette: Record<string, string> = {
            emerald: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/20 [&_div]:bg-emerald-100 dark:[&_div]:bg-emerald-900/40 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400",
            blue:    "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/20 [&_div]:bg-blue-100 dark:[&_div]:bg-blue-900/40 [&_svg]:text-blue-600 dark:[&_svg]:text-blue-400",
            amber:   "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/20 [&_div]:bg-amber-100 dark:[&_div]:bg-amber-900/40 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400",
          };
          return (
            <div key={label} className={`flex flex-col items-center py-5 px-3 rounded-2xl border transition-colors ${palette[color]}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center">{label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search certificates…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
            bg-white dark:bg-[#0f1623]
            border border-gray-200 dark:border-white/[0.08]
            text-gray-800 dark:text-white placeholder:text-gray-400
            outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all
            shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        />
      </motion.div>

      {/* Earned certificates */}
      <section>
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-500" />
          Earned Certificates
        </h2>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((cert, i) => (
              <CertificateCard key={cert.id} cert={cert} index={i} studentName={studentName} />
            ))}
          </div>
        ) : earned.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08]">
            <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No certificates yet.</p>
            <p className="text-xs text-gray-400 mt-1">Complete a course to earn your first certificate.</p>
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08]">
            <p className="text-sm text-gray-400">No certificates match your search.</p>
          </div>
        )}
      </section>

      {/* In progress */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-400" />
            In Progress
            <span className="text-sm font-medium text-gray-400">— complete the course to unlock your certificate</span>
          </h2>
          <div className="flex flex-col gap-3 mt-4">
            {inProgress.map((course, i) => (
              <LockedCard key={course.id} course={course} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
