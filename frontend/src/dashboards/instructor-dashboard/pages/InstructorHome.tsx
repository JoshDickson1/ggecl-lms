// src/dashboards/instructor-dashboard/pages/InstructorHome.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, BookOpen, Star, TrendingUp,
  ChevronRight, Play, ClipboardList,
  MessageSquare, Award, Zap, Loader2,
  Bell, Clock,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import UserService from "@/services/user.service";
import InstructorDashboardService from "@/services/instructor-dashboard.service";
import { APIConfig } from "@/lib/api.config";
import { ApiErrorPage } from "@/components/ui/ApiError";
import { isValidImageUrl } from "@/lib/utils";

// ─── API Types ────────────────────────────────────────────────────────────────

interface MeResponse {
  id: string;
  name: string;
  image: string | null;
  instructorProfile: {
    specialization: string | null;
    areasOfExpertise: string[];
  } | null;
}

/** Shape from GET /api/dashboard/instructor/students/all */
// interface AllStudentsResponse {
//   students: StudentDetail[];
// }

interface StudentDetail {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  enrolledCourses: number;
  completedCourses: number;
  totalProgress: number;
  lastActiveAt: string | null;
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normalizeStudents(raw: unknown): StudentDetail[] {
  if (!raw) return [];

  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.students)) list = obj.students;
    else if (Array.isArray(obj.data))  list = obj.data;
    else if (Array.isArray(obj.items)) list = obj.items;
  }

  return list
    .filter(Boolean)
    .map((s: any) => ({
      // The API may nest the student under different key shapes
      studentId:       s.studentId    ?? s.id    ?? s.userId    ?? "",
      studentName:     s.studentName  ?? s.name  ?? s.fullName  ?? "Unknown",
      studentEmail:    s.studentEmail ?? s.email ?? "",
      studentAvatar:   s.studentAvatar ?? s.image ?? s.avatar ?? null,
      enrolledCourses: s.enrolledCourses  ?? s.totalCourses ?? 0,
      completedCourses:s.completedCourses ?? 0,
      totalProgress:   s.totalProgress   ?? s.progress ?? 0,
      lastActiveAt:    s.lastActiveAt    ?? s.lastActive ?? null,
    }))
    .filter(s => s.studentId); // drop rows with no ID
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}k`;
  return String(num);
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").map(p => p[0] ?? "").join("").slice(0, 2).toUpperCase();
}

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Safe seconds → "Xh Ym" — never produces NaN */
function fmtSeconds(seconds: number | null | undefined): string {
  const s = seconds ?? 0;
  if (!s || isNaN(s)) return "0h";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const COURSE_GRADIENTS = [
  "from-blue-600 to-indigo-700",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

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

// ─── Shared components ────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const Fade = ({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    className={className}>
    {children}
  </motion.div>
);

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
      ))}
    </div>
  );
}

function ActivityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="mt-0.5">
          {p.name}: {typeof p.value === "number" && p.dataKey === "revenue" ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Student Avatar Row ───────────────────────────────────────────────────────

function StudentAvatarRow({ student }: { student: StudentDetail }) {
  return (
    <Link
      to={`/instructor/students/${student.studentId}`}
      state={{ name: student.studentName, email: student.studentEmail, image: student.studentAvatar }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors group"
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black text-white bg-gradient-to-br ${avatarGradient(student.studentId)} overflow-hidden`}>
        {isValidImageUrl(student.studentAvatar)
          ? <img 
              src={student.studentAvatar!} 
              alt={student.studentName} 
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.textContent = initials(student.studentName);
              }}
            />
          : initials(student.studentName)
        }
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {student.studentName}
        </p>
        {student.lastActiveAt && (
          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-2.5 h-2.5" />
            {timeAgo(student.lastActiveAt)}
          </p>
        )}
      </div>

      {/* Progress pill */}
      <div className="flex-shrink-0 flex items-center gap-1.5">
        <div className="w-14 h-1 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
            style={{ width: `${Math.min(student.totalProgress ?? 0, 100)}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-gray-400 w-6 text-right">
          {student.totalProgress ?? 0}%
        </span>
      </div>

      <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
    </Link>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorHome() {
  const { data: me, isLoading: meLoading } = useQuery<MeResponse>({
    queryKey: ["user-mine"],
    queryFn:  () => UserService.getMe() as Promise<MeResponse>,
    staleTime: 1000 * 60 * 5,
  });

  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useQuery({
    queryKey: ["instructor-dashboard-summary"],
    queryFn:  () => InstructorDashboardService.getSummary(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["instructor-recent-reviews"],
    queryFn:  () => InstructorDashboardService.getRecentReviews(3),
    staleTime: 1000 * 60 * 5,
  });

  const { data: activity } = useQuery({
    queryKey: ["instructor-student-activity"],
    queryFn:  () => InstructorDashboardService.getTotalStudentActivity(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ["instructor-activities"],
    queryFn:  () => InstructorDashboardService.getActivities(5, true),
    staleTime: 1000 * 60 * 2,
  });

  /** All unique students — used for the student list in the Activity card */
  const { data: allStudentsRaw, isLoading: studentsLoading } = useQuery({
    queryKey: ["instructor-all-students"],
    queryFn:  async () => {
      const res = await APIConfig.fetch("/dashboard/instructor/students/all");
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
  const allStudents = normalizeStudents(allStudentsRaw);

  const loading = meLoading || summaryLoading;

  // ── Derived values ──────────────────────────────────────────────────────────
  const name           = me?.name ?? "Instructor";
  const image          = me?.image ?? null;
  const totalStudents  = summary?.totalStudents?.totalUniqueStudents ?? allStudents.length ?? 0;
  const totalCourses   = summary?.studentsPerCourse?.length ?? 0;
  const avgRating      = Number(summary?.avgReviews?.overallAverage) || 0;
  const totalReviews   = summary?.avgReviews?.totalReviews ?? 0;
  const completionRate = Number(summary?.completionRate?.overallRate) || 0;
  const topCourses     = summary?.topCourses ?? [];
  const perCourse      = summary?.studentsPerCourse ?? [];

  const pendingItems = activitiesData?.activities ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }
  if (summaryError) return <ApiErrorPage onRetry={refetchSummary} message="Failed to load dashboard data." />;

  return (
    <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

      {/* ── Hero header ─────────────────────────────────────────── */}
      <Fade>
        <Card className="p-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50/40 dark:from-blue-950/20 dark:via-transparent dark:to-indigo-950/10 pointer-events-none rounded-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex-shrink-0">
                  {isValidImageUrl(image) ? (
                    <img 
                      src={image!} 
                      alt={name} 
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement!;
                        parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-black text-white">${initials(name)}</div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-black text-white">
                      {initials(name)}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0f1623]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Welcome back,</p>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  {avgRating > 0 && (
                    <>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{(avgRating || 0).toFixed(1)}</span>
                      </div>
                      <span className="text-gray-300 dark:text-white/20 text-xs">·</span>
                    </>
                  )}
                  <span className="text-xs text-gray-400">{fmt(totalStudents)} students</span>
                  <span className="text-gray-300 dark:text-white/20 text-xs">·</span>
                  <span className="text-xs text-gray-400">{totalCourses} courses</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/instructor/reviews"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                <Star className="w-4 h-4 text-amber-400" /> Reviews
              </Link>
              <Link to="/instructor/assignments"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:opacity-90 transition-all shadow-md">
                <ClipboardList className="w-4 h-4" /> Assignments
              </Link>
            </div>
          </div>

          {/* KPI strip */}
          <div className="relative mt-5 pt-5 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Users,      label: "Total Students",  value: fmt(totalStudents),                                                            accent: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/30"    },
              { icon: BookOpen,   label: "Active Courses",  value: String(totalCourses),                                                          accent: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
              { icon: TrendingUp, label: "Completion Rate", value: completionRate > 0 ? `${(completionRate || 0).toFixed(0)}%` : "—",             accent: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
              { icon: Award,      label: "Avg Rating",      value: avgRating > 0 ? (avgRating || 0).toFixed(1) : "—",                            accent: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-100 dark:bg-amber-900/30"  },
            ].map(({ icon: Ic, label, value, accent, bg }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Ic className={`w-4 h-4 ${accent}`} />
                </div>
                <div>
                  <p className={`text-base font-black leading-none ${accent}`}>{value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Fade>

      {/* ── Charts row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Student Activity — now includes real student list */}
        <Fade delay={0.06}>
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-black text-base text-gray-900 dark:text-white">Student Activity</h2>
                <p className="text-xs text-gray-400 mt-0.5">Active students this period</p>
              </div>
              {activity && (
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900 dark:text-white">{fmt(activity.activeStudentsInPeriod ?? 0)}</p>
                  <p className="text-[10px] text-gray-400">active this period</p>
                </div>
              )}
            </div>

            {/* Metrics strip */}
            {activity && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Active Students",   value: fmt(activity.activeStudentsInPeriod ?? 0) },
                  { label: "Lessons Completed", value: fmt(activity.lessonsCompleted ?? 0)       },
                  { label: "Time Spent",        value: fmtSeconds(activity.totalTimeSpentSeconds) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 text-center">
                    <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Student list ── */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Students ({totalStudents})
              </p>
              <Link to="/instructor/students"
                className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
                See all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="h-[125px] overflow-y-scroll -mx-2 px-2">
              {studentsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            ) : allStudents.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Users className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                <p className="text-xs text-gray-400">No students enrolled yet</p>
              </div>
            ) : (
              <div className="space-y-0.5 -mx-1">
                {allStudents.slice(0, 6).map(student => (
                  <StudentAvatarRow key={student.studentId} student={student} />
                ))}
                {allStudents.length > 6 && (
                  <Link to="/instructor/students"
                    className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors">
                    +{allStudents.length - 6} more students <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            )}
            </div>
          </Card>
        </Fade>

        {/* Enrollment Trend */}
        <Fade delay={0.08}>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-black text-base text-gray-900 dark:text-white">Enrollment Trend</h2>
                <p className="text-xs text-gray-400 mt-0.5">Students per course</p>
              </div>
            </div>

            <div className="mt-3 mb-4">
              <p className="text-2xl font-black text-gray-900 dark:text-white">{fmt(totalStudents)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">total enrolled · all time</p>
            </div>

            {perCourse.length > 0 ? (
              <>
                <div className="space-y-3">
                  {perCourse.slice(0, 5).map((c) => {
                    const max = Math.max(...perCourse.map(x => x.studentCount || 0), 1);
                    const pct = Math.round(((c.studentCount || 0) / max) * 100) || 0;
                    return (
                      <div key={c.courseId}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{c.title}</p>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex-shrink-0 ml-2">{(c.studentCount ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {perCourse.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] text-gray-400 mb-2">Students per course (bar)</p>
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart
                        data={perCourse.slice(0, 6).map(c => ({ name: c.title.slice(0, 8) + "…", students: c.studentCount }))}
                        margin={{ top: 2, right: 4, left: -24, bottom: 0 }}
                        barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ActivityTooltip />} />
                        <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.85} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <BookOpen className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                <p className="text-xs text-gray-400 italic">No courses with enrollments yet</p>
              </div>
            )}
          </Card>
        </Fade>
      </div>

      {/* ── Main content row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

        {/* Top Courses */}
        <Fade delay={0.1}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-base text-gray-900 dark:text-white">Top Courses</h2>
                <p className="text-xs text-gray-400 mt-0.5">By enrollment · all time</p>
              </div>
              <Link to="/instructor/courses"
                className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
                All courses <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {topCourses.length > 0 ? (
              <>
                <div className="space-y-2">
                  {topCourses.map((c, i) => {
                    return (
                      <motion.div key={c.courseId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.13 + i * 0.06 }}>
                        <Link to={`/instructor/courses/${c.courseId}`}
                          className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent hover:border-gray-100 dark:hover:border-white/[0.05] transition-all group">
                          <div className={`w-14 h-12 rounded-xl overflow-hidden bg-gradient-to-br ${COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]} flex items-center justify-center flex-shrink-0`}>
                            {isValidImageUrl(c.img) ? (
                              <img 
                                src={c.img!} 
                                alt={c.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                                }}
                              />
                            ) : (
                              <Play className="w-4 h-4 text-white" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                              {c.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />{(c.enrollmentCount ?? 0).toLocaleString()}
                              </span>
                              {c.averageRating > 0 && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-400" />{(c.averageRating || 0).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.04]">
                  <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 text-center">
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {topCourses.reduce((a, c) => a + (c.enrollmentCount ?? 0), 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Total enrolled</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-sm text-gray-400">No courses published yet.</p>
                <Link to="/instructor/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                  Create your first course
                </Link>
              </div>
            )}
          </Card>
        </Fade>

        {/* Right column */}
        <div className="space-y-4">

          {/* Needs Attention */}
          <Fade delay={0.12}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="font-black text-sm text-gray-900 dark:text-white">Needs Attention</h2>
                {(activitiesData?.unreadCount ?? 0) > 0 && (
                  <span className="ml-auto text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
                    {activitiesData!.unreadCount} unread
                  </span>
                )}
              </div>

              {pendingItems.length > 0 ? (
                <div className="space-y-2">
                  {pendingItems.map(item => (
                    <div key={item.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                      <Bell className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.message}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(item.createdAt)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                  <Zap className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">All caught up — no pending items</p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-50 dark:border-white/[0.04] flex gap-2">
                <Link to="/instructor/discussions"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                  <MessageSquare className="w-3.5 h-3.5" />Discussions
                </Link>
                <Link to="/instructor/assignments"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all">
                  <ClipboardList className="w-3.5 h-3.5" />Assignments
                </Link>
              </div>
            </Card>
          </Fade>

          {/* Recent Reviews */}
          <Fade delay={0.14}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </div>
                <h2 className="font-black text-sm text-gray-900 dark:text-white">Recent Reviews</h2>
                {avgRating > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    {(avgRating || 0).toFixed(1)} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-gray-400 font-normal">({fmt(totalReviews)})</span>
                  </span>
                )}
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
              ) : recentReviews.length > 0 ? (
                <div className="space-y-3 h-50 overflow-scroll">
                  {recentReviews.map((r, i) => (
                    <motion.div key={r.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.17 + i * 0.06 }}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                          {r.student.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{r.student.name}</p>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <Stars rating={r.rating} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{r.comment}</p>
                      <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium mt-1.5">{r.course.title}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Award className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No reviews yet.</p>
                </div>
              )}

              <Link to="/instructor/reviews"
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/[0.07] hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-blue-500 transition-all">
                View all reviews <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          </Fade>
        </div>
      </div>
    </div>
  );
}