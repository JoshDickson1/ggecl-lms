import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation, type Location } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft, BookOpen, Mail, Calendar,
  Play, MessageSquare, Send, ChevronDown,
  Loader2, Users, Globe, MapPin, CheckCircle2,
} from "lucide-react";
import UserService from "@/services/user.service";
import EnrollmentService from "@/services/enrollment.service";
import ActivityService from "@/services/activity.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio?: string | null;
  createdAt?: string | null;
  location?: string | null;
}

interface CourseEnrollment {
  id: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    img: string | null;
    price: number;
    level: string;
    status: string;
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

function fmtPrice(price: number): string {
  if (price === 0) return "Free";
  return `$${price.toFixed(2)}`;
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

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER:     "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  INTERMEDIATE: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  ADVANCED:     "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
};

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

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ enrollment, defaultOpen }: {
  enrollment: CourseEnrollment;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const { course } = enrollment;
  const levelClass = LEVEL_COLORS[course.level] ?? "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400";

  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all text-left"
      >
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
          {course.img
            ? <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
            : <Play className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="flex-1 text-sm font-bold text-gray-900 dark:text-white truncate">{course.title}</span>
        <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold flex-shrink-0 ${levelClass}`}>
          {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 py-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Enrolled</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{fmtDate(enrollment.enrolledAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Price</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{fmtPrice(course.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Level</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${levelClass}`}>
                  {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Message Modal ────────────────────────────────────────────────────────────

function MessageModal({ student, studentId, courses, onClose }: {
  student: StudentProfile;
  studentId: string;
  courses: CourseEnrollment[];
  onClose: () => void;
}) {
  const [msg, setMsg]           = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.course.id ?? "");

  const { mutate: sendMessage, isPending, isSuccess, isError } = useMutation({
    mutationFn: () =>
      ActivityService.sendMessageToStudent({ studentId, courseId, message: msg.trim() }),
  });

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

        {isSuccess ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Message sent!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {student.name.split(" ")[0]} will receive your message shortly.
              </p>
            </div>
            <button onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 transition-all">
              Done
            </button>
          </motion.div>
        ) : (
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

            <div className="px-6 py-5 space-y-3">
              {/* Course selector — required by the API */}
              {courses.length > 1 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">
                    Send via course
                  </label>
                  <select
                    value={courseId}
                    onChange={e => setCourseId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all">
                    {courses.map(e => (
                      <option key={e.course.id} value={e.course.id}>{e.course.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <textarea
                  value={msg}
                  onChange={e => setMsg(e.target.value.slice(0, 500))}
                  placeholder={`Hi ${student.name.split(" ")[0]}, I wanted to check in on your progress…`}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all"
                />
                <div className="flex items-center justify-between mt-1">
                  {isError && (
                    <p className="text-xs text-rose-500">Failed to send. Please try again.</p>
                  )}
                  <p className="text-xs text-gray-400 ml-auto">{msg.length}/500</p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                Cancel
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!msg.trim() || !courseId || isPending}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                {isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </div>
          </>
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

  // ── Fetch enrollments scoped to instructor's courses ─────────────────────────
  const {
    data: enrollmentData,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
  } = useQuery({
    queryKey: ["instructor-student-enrollments", id],
    queryFn:  () => EnrollmentService.findByStudentForInstructor(id),
    enabled:  !!id,
    retry:    false,
    staleTime: 1000 * 60 * 5,
  });

  // ── Fetch public profile using userId from enrollment response ───────────────
  // The enrollment endpoint returns student.userId which we need for the public profile
  const userId = enrollmentData?.student?.userId;
  const { data: publicProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["student-public-profile", userId],
    queryFn:  () => UserService.findOnePublic(userId!) as Promise<any>,
    enabled:  !!userId && !navState?.name,
    retry:    false,
    staleTime: 1000 * 60 * 10,
  });

  // ── Resolve student identity ─────────────────────────────────────────────────
  // Priority: router nav state → enrollment response → public profile API
  const enrollmentStudent = enrollmentData?.student;
  const student: StudentProfile = {
    id:        id,
    name:      navState?.name      ?? enrollmentStudent?.name      ?? publicProfile?.name      ?? "Unknown Student",
    email:     navState?.email     ?? publicProfile?.email         ?? "",
    image:     navState?.image     ?? enrollmentStudent?.image     ?? publicProfile?.image     ?? null,
    bio:       publicProfile?.studentProfile?.bio                  ?? publicProfile?.bio       ?? null,
    createdAt: publicProfile?.createdAt                            ?? null,
    location:  publicProfile?.location                            ?? null,
  };

  const enrollments: CourseEnrollment[] = enrollmentData?.enrollments ?? [];
  const totalEnrollments = enrollmentData?.student?.totalEnrollments ?? enrollments.length;

  const isLoading = enrollmentsLoading || (!!userId && !navState?.name && profileLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (enrollmentsError) {
    return (
      <div className="max-w-[1150px] mx-auto pt-8">
        <Link to="/instructor/students"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to students
        </Link>
        <Card className="p-10 text-center">
          <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Student not found</p>
          <p className="text-xs text-gray-400 mt-1">This student may not be enrolled in any of your courses.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>{showMessage && <MessageModal student={student} studentId={id} courses={enrollments} onClose={() => setShowMessage(false)} />}</AnimatePresence>

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
                </div>

                <div className="flex-1 sm:pb-1 pt-20">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">{student.name}</h1>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                    {student.email && (
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-500" />{student.email}</span>
                    )}
                    {student.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-500" />{student.location}</span>
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
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30">
                  <BookOpen className="w-3.5 h-3.5" />{enrollments.length} course{enrollments.length !== 1 ? "s" : ""} with you
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border text-violet-600 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-900/30">
                  <Globe className="w-3.5 h-3.5" />{totalEnrollments} total platform enrollment{totalEnrollments !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Two-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* ── Left: Enrollments ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
            <Card className="p-5">
              <SectionLabel>Enrolled in Your Courses ({enrollments.length})</SectionLabel>
              {enrollments.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-3 text-center">
                  <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-400">No enrollments found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {enrollments.map((enr, i) => (
                    <CourseCard key={enr.id} enrollment={enr} defaultOpen={i === 0} />
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4">

            {/* Student info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
              <Card className="p-5">
                <SectionLabel>Student Info</SectionLabel>
                <div className="space-y-3">
                  {[
                    { icon: BookOpen, label: "Your courses",       value: String(enrollments.length)   },
                    { icon: Globe,    label: "Total enrollments",  value: String(totalEnrollments)     },
                    ...(student.createdAt ? [{ icon: Calendar, label: "Joined",  value: fmtDate(student.createdAt) }] : []),
                    ...(student.email    ? [{ icon: Mail,     label: "Email",   value: student.email }] : []),
                    ...(student.location ? [{ icon: MapPin,   label: "Location", value: student.location }] : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Icon className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white max-w-[140px] truncate text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Engagement nudge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <Card className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 border-0">
                <p className="text-blue-200 text-xs font-medium mb-1">Engagement tip</p>
                <h3 className="text-white font-black text-base leading-snug mb-3">
                  Send {student.name.split(" ")[0]} a message
                </h3>
                <p className="text-blue-200/80 text-xs leading-relaxed mb-4">
                  Students who receive instructor messages are 2× more likely to stay engaged.
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
