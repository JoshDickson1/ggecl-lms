import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation, type Location } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, BookOpen, TrendingUp,
  Mail, Calendar, CheckCircle, Circle, Play,
  Award, MessageSquare, Send, ChevronDown,
  BarChart2, Loader2, Users,
} from "lucide-react";
import UserService from "@/services/user.service";
import EnrollmentService from "@/services/enrollment.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio?: string | null;
  createdAt?: string;
}

interface StudentEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  courseImg: string | null;
  enrolledAt: string;
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  status?: string;
  lastActiveAt?: string | null;
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeProfile(raw: unknown, id: string): StudentProfile {
  const r = (raw ?? {}) as any;
  return {
    id:        r.id        ?? id,
    name:      r.name      ?? r.displayName ?? r.fullName ?? "Unknown Student",
    email:     r.email     ?? "",
    image:     r.image     ?? r.avatar      ?? null,
    bio:       r.bio       ?? null,
    createdAt: r.createdAt ?? r.joinedAt    ?? null,
  };
}

function toList(raw: unknown): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const r = raw as any;
  return Array.isArray(r.data) ? r.data : Array.isArray(r.items) ? r.items : [];
}

function normalizeEnrollments(raw: unknown): StudentEnrollment[] {
  return toList(raw).map((e: any) => ({
    id:               e.id          ?? "",
    courseId:         e.courseId    ?? e.course?.id   ?? "",
    courseTitle:      e.courseTitle ?? e.course?.title ?? "Course",
    courseImg:        e.courseImg   ?? e.course?.img   ?? null,
    enrolledAt:       e.enrolledAt  ?? e.createdAt    ?? "",
    progress:         e.progress    ?? e.progressPercent ?? undefined,
    completedLessons: e.completedLessons ?? undefined,
    totalLessons:     e.totalLessons     ?? undefined,
    status:           e.status ?? "active",
    lastActiveAt:     e.lastActiveAt ?? e.lastActive ?? null,
  }));
}

// Extract student identity embedded in an enrollment item (backend often includes it)
function extractStudentFromEnrollments(raw: unknown): Partial<StudentProfile> | null {
  const first = toList(raw)[0] as any;
  if (!first) return null;
  const s = first.student ?? first.user ?? first.studentInfo ?? null;
  if (!s && !first.studentName) return null;
  return {
    id:    s?.id    ?? first.studentId ?? "",
    name:  s?.name  ?? s?.fullName ?? first.studentName ?? null,
    email: s?.email ?? first.studentEmail ?? null,
    image: s?.image ?? s?.avatar  ?? first.studentAvatar ?? null,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase();
}

function fmtDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function timeAgo(dateStr?: string | null): string {
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

const AVATAR_GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
];

function avatarGradient(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
      {children}
    </p>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color =
    value === 100 ? "from-blue-500 to-indigo-600"
    : value >= 60  ? "from-emerald-500 to-teal-500"
    : value >= 30  ? "from-amber-400 to-orange-500"
    : "from-red-400 to-rose-500";
  return (
    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

// ─── Enrollment Section ───────────────────────────────────────────────────────

function EnrollmentSection({ enrollment, defaultOpen }: {
  enrollment: StudentEnrollment;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const progress = enrollment.progress ?? 0;

  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all text-left">
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="flex-1 text-sm font-bold text-gray-900 dark:text-white truncate">{enrollment.courseTitle}</span>
        <span className="text-xs font-bold text-gray-500 flex-shrink-0 mr-2">{progress}%</span>
        <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-white/[0.08] overflow-hidden flex-shrink-0">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${progress}%` }} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Enrolled {fmtDate(enrollment.enrolledAt)}</span>
                {enrollment.lastActiveAt && (
                  <span>Last active {timeAgo(enrollment.lastActiveAt)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300">{progress}% complete</span>
                  {enrollment.completedLessons !== undefined && enrollment.totalLessons !== undefined && (
                    <span className="text-gray-400">{enrollment.completedLessons}/{enrollment.totalLessons} lessons</span>
                  )}
                </div>
                <ProgressBar value={progress} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Message Modal ────────────────────────────────────────────────────────────

function MessageModal({ student, onClose }: { student: StudentProfile; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-md bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {!sent ? (
          <>
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black bg-gradient-to-br ${avatarGradient(student.id)} overflow-hidden`}>
                  {student.image
                    ? <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                    : initials(student.name)}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Message to</p>
                  <p className="font-bold text-gray-900 dark:text-white">{student.name}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <textarea value={msg} onChange={e => setMsg(e.target.value)}
                placeholder={`Hi ${student.name.split(" ")[0]}, I wanted to check in on your progress…`}
                rows={5}
                className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all" />
              <p className="text-right text-xs text-gray-400 mt-1">{msg.length}/500</p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                Cancel
              </button>
              <button onClick={() => msg.trim() && setSent(true)} disabled={!msg.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Message sent!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {student.name.split(" ")[0]} will receive your message shortly.
              </p>
            </div>
            <button onClick={onClose} className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 transition-all">
              Done
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface NavState { name?: string; email?: string; image?: string | null }

export default function InstructorStudentSingle() {
  const { id = "" } = useParams<{ id: string }>();
  const location     = useLocation() as Location<NavState | null>;
  const navState     = location.state;

  const [showMessage, setShowMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<"enrollments" | "stats">("enrollments");

  // ── Fetch student enrollments first (may embed student info) ────────────────
  const { data: enrollmentsRaw, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["student-enrollments", id],
    queryFn:  async () => {
      try { return await EnrollmentService.findByStudent(id); }
      catch { return []; }
    },
    enabled:   !!id,
    retry:     false,
    staleTime: 1000 * 60 * 2,
  });

  // Extract student identity embedded in enrollment items (if backend includes it)
  const enrollmentProfile = extractStudentFromEnrollments(enrollmentsRaw);

  // ── Fetch profile only if we still don't have a name ────────────────────────
  const needsProfileFetch = !!id && !navState?.name && !enrollmentProfile?.name;
  const { data: profileRaw, isLoading: profileLoading } = useQuery({
    queryKey: ["student-profile", id],
    queryFn:  async () => {
      // Try authenticated endpoint first (works if instructor has access), then public
      try { return await UserService.findOne(id); } catch { /* fall through */ }
      try { return await UserService.findOnePublic(id); } catch { return null; }
    },
    enabled:   needsProfileFetch,
    retry:     false,
    staleTime: 1000 * 60 * 5,
  });

  // Priority: router state → enrollment-embedded → API profile
  const profileSource = navState?.name
    ? { name: navState.name, email: navState.email ?? "", image: navState.image ?? null }
    : (enrollmentProfile?.name ? enrollmentProfile : profileRaw);

  const student     = normalizeProfile(profileSource, id);
  const enrollments = normalizeEnrollments(enrollmentsRaw);

  const isLoading = enrollmentsLoading || (needsProfileFetch && profileLoading);

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((a, e) => a + (e.progress ?? 0), 0) / enrollments.length)
    : 0;
  const completed = enrollments.filter(e => (e.progress ?? 0) >= 100).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }
 
  return (
    <>
      <AnimatePresence>{showMessage && <MessageModal student={student} onClose={() => setShowMessage(false)} />}</AnimatePresence>

      <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

        {/* ── Back ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/instructor/students"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to students
          </Link>
        </motion.div>

        {/* ── Hero card ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
          <Card>
            <div className={`h-24 rounded-t-[22px] bg-gradient-to-br ${avatarGradient(student.id)} relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            </div>

            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
                <div className="relative flex-shrink-0">
                  <div className={`w-20 h-20 rounded-[18px] ring-4 ring-white dark:ring-[#0f1623] shadow-lg flex items-center justify-center text-2xl font-black text-white bg-gradient-to-br ${avatarGradient(student.id)} overflow-hidden`}>
                    {student.image
                      ? <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                      : initials(student.name)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-[2.5px] border-white dark:border-[#0f1623]" />
                </div>

                <div className="flex-1 sm:pb-1 pt-20">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">{student.name}</h1>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                    {student.email && (
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-500" />{student.email}</span>
                    )}
                    {student.createdAt && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-500" />Joined {fmtDate(student.createdAt)}</span>
                    )}
                  </div>
                  {student.bio && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xl line-clamp-2">{student.bio}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setShowMessage(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 transition-all shadow-sm">
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </button>
                </div>
              </div>

              {/* Quick stats pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: BookOpen, label: `${enrollments.length} course${enrollments.length !== 1 ? "s" : ""}`, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30" },
                  { icon: Award,    label: `${completed} completed`, color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-900/30" },
                  { icon: BarChart2, label: `${avgProgress}% avg progress`, color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900/30" },
                ].map(({ icon: Icon, label, color }) => (
                  <span key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${color}`}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Two-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* ── Left ── */}
          <div className="space-y-5">

            {/* Tab bar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
                {([
                  { key: "enrollments", label: "Enrollments" },
                  { key: "stats",       label: "At a Glance"  },
                ] as const).map(({ key, label }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${
                      activeTab === key
                        ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === "enrollments" && (
                <motion.div key="enrollments"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  <Card className="p-5">
                    <SectionLabel>Enrolled Courses ({enrollments.length})</SectionLabel>
                    {enrollments.length === 0 ? (
                      <div className="py-10 flex flex-col items-center gap-3 text-center">
                        <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm text-gray-400">No enrollments found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {enrollments.map((enr, i) => (
                          <EnrollmentSection key={enr.id} enrollment={enr} defaultOpen={i === 0} />
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {activeTab === "stats" && (
                <motion.div key="stats"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  <Card className="p-5">
                    <SectionLabel>Overview</SectionLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: BookOpen,    label: "Total Courses",  value: enrollments.length },
                        { icon: Award,      label: "Completed",       value: completed },
                        { icon: TrendingUp, label: "Avg Progress",    value: `${avgProgress}%` },
                        { icon: Users,      label: "In Progress",     value: enrollments.length - completed },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-base font-black text-gray-900 dark:text-white leading-tight">{value}</p>
                            <p className="text-[10px] text-gray-400">{label}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {enrollments.length > 0 && (
                      <div className="mt-5">
                        <SectionLabel>Progress per Course</SectionLabel>
                        <div className="space-y-3">
                          {enrollments.map(enr => (
                            <div key={enr.id}>
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{enr.courseTitle}</p>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex-shrink-0 ml-2">{enr.progress ?? 0}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${enr.progress ?? 0}%` }}
                                  transition={{ duration: 0.7 }}
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4">

            {/* Quick info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
              <Card className="p-5">
                <SectionLabel>Student Info</SectionLabel>
                <div className="space-y-3">
                  {[
                    { icon: BookOpen, label: "Courses",      value: enrollments.length          },
                    { icon: Award,    label: "Completed",    value: completed                   },
                    { icon: TrendingUp, label: "Avg Progress", value: `${avgProgress}%`         },
                    ...(student.createdAt ? [{ icon: Calendar, label: "Joined", value: fmtDate(student.createdAt) }] : []),
                    ...(student.email    ? [{ icon: Mail,     label: "Email",   value: student.email }] : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Icon className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white max-w-[120px] truncate text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Recent courses mini list */}
            {enrollments.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <Card className="p-5">
                  <SectionLabel>Enrolled Courses</SectionLabel>
                  <div className="space-y-2">
                    {enrollments.slice(0, 4).map(enr => (
                      <div key={enr.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {enr.courseImg
                            ? <img src={enr.courseImg} alt={enr.courseTitle} className="w-full h-full object-cover" />
                            : <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{enr.courseTitle}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {(enr.progress ?? 0) >= 100
                              ? <CheckCircle className="w-3 h-3 text-emerald-500" />
                              : <Circle className="w-3 h-3 text-gray-300 dark:text-gray-600" />}
                            <span className="text-[10px] text-gray-400">{enr.progress ?? 0}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Reviews placeholder - show star count from enrollments */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 border-0">
                <p className="text-blue-200 text-xs font-medium mb-1">Engagement tip</p>
                <h3 className="text-white font-black text-base leading-snug mb-3">
                  Send {student.name.split(" ")[0]} a progress nudge
                </h3>
                <p className="text-blue-200/80 text-xs leading-relaxed mb-4">
                  Students who receive instructor messages are 2× more likely to complete their course.
                </p>
                <button onClick={() => setShowMessage(true)}
                  className="w-full py-2.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Message Student
                </button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
