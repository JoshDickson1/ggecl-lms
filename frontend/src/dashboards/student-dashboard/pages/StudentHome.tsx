// src/dashboards/student-dashboard/pages/StudentHome.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Play, BookOpen, Award, TrendingUp, Clock, CheckCircle2,
  Flame, Star, ChevronRight, BarChart3, Target, Zap, Bell,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import ProgressService from "@/services/progress.service";
import ActivityService from "@/services/activity.service";
import EnrollmentService from "@/services/enrollment.service";
import { useAuth } from "@/context/AuthProvider";
import { ApiErrorPage } from "@/components/ui/ApiError";

// ─── API Response Types ───────────────────────────────────────────────────────

interface WeeklyDay {
  date: string;
  label: string;
  minutes: number;
}

interface WeeklyActivity {
  days: WeeklyDay[];
  totalThisWeek: number;
  dailyAverage: number;
  mostActiveDay: string | null;
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
}

interface DashboardStats {
  totalTimeSpentThisMonth: number;
  streak: Streak;
  completedCourses: number;
  avgCompletionPercent: number;
  weeklyActivity: WeeklyActivity;
}

interface DashboardCourse {
  courseId: string;
  title: string;
  img?: string;
  instructor: { name: string; image?: string | null };
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt?: string;
  lastLessonTitle?: string;
  completed: boolean;
  myRating?: number;
}

interface DashboardResponse {
  stats: DashboardStats;
  courses: DashboardCourse[];
}

interface XPResponse {
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  xpIntoCurrentLevel: number;
  currentLevelSpan: number;
  maxLevel: number;
  recentAwards: unknown[];
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  courseId?: string;
  createdAt: string;
}

interface ActivityResponse {
  data: ActivityItem[];
  meta: { total: number; unreadCount: number };
}

interface EnrollmentCourse {
  id: string;
  title: string;
  img: string;
  price: number;
  level: string;
  instructorId: string;
  instructor?: {
    id: string;
    name: string;
    image?: string | null;
  };
}

interface Enrollment {
  id: string;
  enrolledAt: string;
  course: EnrollmentCourse;
  progress?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const THUMBNAIL_GRADIENTS = [
  "from-blue-500 to-blue-600",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-500",
];

function gradientFor(index: number) {
  return THUMBNAIL_GRADIENTS[index % THUMBNAIL_GRADIENTS.length];
}

/** Activity type → emoji */
function activityIcon(type: string): string {
  const map: Record<string, string> = {
    LESSON_COMPLETED:   "🎯",
    COURSE_COMPLETED:   "🏆",
    WISHLIST_ITEM_ADDED:"❤️",
    WISHLIST_TO_CART:   "🛒",
    CART_ITEM_ADDED:    "🛒",
    ENROLLED:           "📚",
    REVIEW_SUBMITTED:   "⭐",
    ACHIEVEMENT_EARNED: "🏅",
  };
  return map[type] ?? "🔔";
}

/** ISO → relative label */
function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  === 1) return "Yesterday";
  if (days  < 7)   return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Get time-of-day greeting */
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06] ${className}`} />;
}

function HomeSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-12">
      <Sk className="h-52 rounded-3xl" />
      <Sk className="h-32 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <Sk className="h-56 rounded-2xl" />
        <Sk className="h-56 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Sk className="h-40 rounded-2xl" />
        <Sk className="h-40 rounded-2xl" />
        <Sk className="h-40 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const Fade = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

function ProgressBar({ pct, color = "from-blue-500 to-blue-600" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white">{label}</p>
      <p className="text-blue-500">{payload[0].value} min</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentHome() {
  const { user } = useAuth();

  const { data: dashboard, isLoading: dashLoading, isError: dashError, refetch: refetchDash } = useQuery<DashboardResponse>({
    queryKey: ["progress-dashboard"],
    queryFn: () => ProgressService.getDashboard() as Promise<DashboardResponse>,
  });

  const { data: xp, isLoading: xpLoading } = useQuery<XPResponse>({
    queryKey: ["progress-xp"],
    queryFn: () => ProgressService.getXP() as Promise<XPResponse>,
  });

  const { data: activityRes, isLoading: activityLoading } = useQuery<ActivityResponse>({
    queryKey: ["activities", 5],
    queryFn: () => ActivityService.getFeed({ limit: 5 }) as Promise<ActivityResponse>,
  });

  const { data: enrollments, isLoading: enrollLoading } = useQuery<Enrollment[]>({
    queryKey: ["enrollments-mine"],
    queryFn: () => EnrollmentService.getMine() as Promise<Enrollment[]>,
  });

  const isLoading = dashLoading || xpLoading || activityLoading || enrollLoading;
  if (isLoading) return <HomeSkeleton />;
  if (dashError) return <ApiErrorPage onRetry={refetchDash} message="Failed to load your dashboard." />;

  // ── Derived values ──────────────────────────────────────────────────────────

  const stats        = dashboard?.stats;
  const courses      = dashboard?.courses ?? [];
  const weeklyDays   = stats?.weeklyActivity.days ?? [];
  const totalMinutes = stats?.weeklyActivity.totalThisWeek ?? 0;
  const dailyAvg     = Number(stats?.weeklyActivity.dailyAverage) || 0;
  const mostActive   = stats?.weeklyActivity.mostActiveDay ?? "—";
  const streak       = stats?.streak.currentStreak ?? 0;
  const completed    = stats?.completedCourses ?? 0;

  // Merge enrollment data with dashboard progress data for complete course info
  const enrichedCourses = (enrollments ?? []).map(enrollment => {
    // Find matching progress data from dashboard (which has instructor info)
    const progressData = courses.find(c => c.courseId === enrollment.course.id);
    
    return {
      courseId: enrollment.course.id,
      title: enrollment.course.title || progressData?.title || "Untitled Course",
      img: enrollment.course.img || progressData?.img,
      instructor: progressData?.instructor || enrollment.course.instructor || { 
        name: "Instructor",
        image: null 
      },
      progressPercent: progressData?.progressPercent ?? enrollment.progress ?? 0,
      completedLessons: progressData?.completedLessons ?? 0,
      totalLessons: progressData?.totalLessons ?? 0,
      lastAccessedAt: progressData?.lastAccessedAt,
      lastLessonTitle: progressData?.lastLessonTitle,
      completed: progressData?.completed ?? false,
      myRating: progressData?.myRating,
    };
  });

  // Top in-progress course for "Continue Learning" - use enriched data
  const topCourse = enrichedCourses.find(c => !c.completed && c.progressPercent > 0) 
    ?? enrichedCourses.find(c => !c.completed) 
    ?? enrichedCourses[0];

  // XP
  const xpTotal     = xp?.totalXp ?? 0;
  const xpNext      = xp?.xpToNextLevel ?? 450;
  const xpLevel     = xp?.currentLevel ?? 0;
  const xpSpan      = xp?.currentLevelSpan ?? 450;
  const xpInto      = xp?.xpIntoCurrentLevel ?? 0;
  const xpPct       = xpSpan > 0 ? Math.round(((xpInto || 0) / xpSpan) * 100) || 0 : 0;

  // Activities
  const activities   = activityRes?.data ?? [];

  // Enrolled courses (top 3 for "My Courses")
  const myEnrollments = (enrollments ?? []).slice(0, 3);

  // Avatar initials
  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const firstName = user?.name?.split(" ")[0] ?? "there";

  // Chart data: map to { day, minutes }
  const chartData = weeklyDays.map(d => ({ day: d.label, minutes: d.minutes }));

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-12">

      {/* ── Greeting hero ──────────────────────────────────────── */}
      <Fade>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 p-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-amber-300" />
                <span className="text-amber-200 text-sm font-bold">
                  {streak > 0 ? `${streak}-day streak 🔥` : "Start your streak today! 🔥"}
                </span>
              </div>
              <h1 className="text-3xl font-black text-white leading-tight">
                {greeting()},<br />{firstName} 👋
              </h1>
              <p className="text-blue-200 text-sm mt-2">
                {topCourse
                  ? `You're ${Math.round(100 - (topCourse.progressPercent || 0)) || 0}% away from completing your top course.`
                  : "Explore courses and start learning today."}
              </p>

              {/* XP Bar */}
              <div className="mt-4 max-w-xs">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-blue-200 font-semibold">Level {xpLevel}</span>
                  <span className="text-blue-200">{xpTotal.toLocaleString()} XP · Next: {xpNext.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPct}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  />
                </div>
              </div>
            </div>

            {/* Avatar + stats */}
            <div className="flex items-center md:justify-end justify-between gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                {initials}
              </div>
              <div className="flex md:flex-col flex-row gap-2">
                {[
                  { label: "Enrolled",   value: enrollments?.length ?? 0 },
                  { label: "Completed",  value: completed },
                  { label: "Streak",     value: `${streak}d` },
                ].map(s => (
                  <div key={s.label} className="text-center px-3 py-1 rounded-xl bg-white/15 border border-white/20">
                    <p className="text-white font-black text-sm leading-none">{s.value}</p>
                    <p className="text-blue-200 text-[10px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Fade>

      {/* ── Continue Learning ──────────────────────────────────── */}
      {topCourse ? (
        <Fade delay={0.06}>
          <Card className="p-6 overflow-hidden relative">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-blue-500" />
              <h2 className="font-black text-base text-gray-900 dark:text-white">Continue Learning</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Course Thumbnail */}
              <div className={`w-full sm:w-44 h-28 rounded-2xl flex-shrink-0 bg-gradient-to-br ${gradientFor(0)} flex items-center justify-center shadow-lg overflow-hidden relative group`}>
                {topCourse.img ? (
                  <img src={topCourse.img} alt={topCourse.title} className="w-full h-full object-cover" />
                ) : (
                  <Play className="w-8 h-8 text-white drop-shadow" />
                )}
                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-blue-600 ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                {/* Course Title - Make it very prominent */}
                <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight mb-2">
                  {topCourse.title || "Untitled Course"}
                </h3>
                
                {/* Instructor info with avatar */}
                <div className="flex items-center gap-2">
                  {topCourse.instructor.image ? (
                    <img 
                      src={topCourse.instructor.image} 
                      alt={topCourse.instructor.name}
                      className="w-6 h-6 rounded-lg object-cover border border-gray-200 dark:border-white/[0.1]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement!;
                        const initials = topCourse.instructor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                        const avatarDiv = document.createElement('div');
                        avatarDiv.className = 'w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-black border border-gray-200 dark:border-white/[0.1]';
                        avatarDiv.textContent = initials;
                        parent.insertBefore(avatarDiv, parent.firstChild);
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-black border border-gray-200 dark:border-white/[0.1]">
                      {topCourse.instructor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{topCourse.instructor.name}</span>
                  </p>
                </div>

                {/* Last lesson */}
                {topCourse.lastLessonTitle && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-700 dark:text-blue-300 truncate font-medium">Last: {topCourse.lastLessonTitle}</span>
                  </div>
                )}

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">{Math.round(topCourse.progressPercent || 0)}% complete</span>
                    <span className="text-gray-500 dark:text-gray-400">{topCourse.completedLessons || 0} of {topCourse.totalLessons || 0} lessons</span>
                  </div>
                  <ProgressBar pct={Math.round(topCourse.progressPercent || 0)} />
                </div>
              </div>

              {/* Resume button */}
              <Link
                to={`/student/courses/${topCourse.courseId}/watch`}
                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all"
              >
                <Play className="w-4 h-4" />Resume
              </Link>
            </div>
          </Card>
        </Fade>
      ) : (
        <Fade delay={0.06}>
          <Card className="p-6 flex flex-col items-center gap-3 text-center py-10">
            <BookOpen className="w-8 h-8 text-blue-400 opacity-60" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">You're not enrolled in any courses yet.</p>
            <Link to="/student/explore"
              className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
              Explore courses <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </Fade>
      )}

      {/* ── Middle row: chart + activity ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Weekly Learning Chart */}
        <Fade delay={0.09}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <h2 className="font-black text-base text-gray-900 dark:text-white">This Week</h2>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{totalMinutes} min total</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-5">Daily learning time (minutes)</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2.5}
                    fill="url(#blueGrad)"
                    dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-gray-400">No activity this week yet.</div>
            )}
            {/* Legend */}
            <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
              {[
                { label: "Daily avg",    value: `${dailyAvg || 0} min` },
                { label: "Most active",  value: mostActive },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{label}</p>
                  <p className="text-sm font-black text-gray-800 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </Fade>

        {/* Recent Activity */}
        <Fade delay={0.11}>
          <Card className="p-6 h-[338px] overflow-y-scroll">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-base text-gray-900 dark:text-white">Recent Activity</h2>
              {(activityRes?.meta.unreadCount ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                  <Bell className="w-3 h-3" />{activityRes?.meta.unreadCount} new
                </span>
              )}
            </div>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{activityIcon(a.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{a.message}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{fmtRelative(a.createdAt)}</p>
                    </div>
                    {!a.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center gap-2 text-gray-400">
                <Bell className="w-6 h-6 opacity-30" />
                <p className="text-xs">No recent activity yet.</p>
              </div>
            )}
            {activities.length > 0 && (
              <Link to="/student/notifications"
                className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-blue-500 hover:underline">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </Card>
        </Fade>
      </div>

      {/* ── My Courses ──────────────────────────────────────────── */}
      <Fade delay={0.13}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-base text-gray-900 dark:text-white">My Courses</h2>
            <Link to="/student/courses" className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {myEnrollments.map((enr, i) => {
                // Find matching progress from dashboard courses
                const prog = courses.find(c => c.courseId === enr.course.id);
                const pct  = Math.round(prog?.progressPercent ?? 0);
                return (
                  <motion.div
                    key={enr.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 + i * 0.06 }}
                  >
                    <Link to={`/student/courses/${enr.course.id}/watch`}>
                      <Card className="p-4 hover:shadow-md transition-shadow group cursor-pointer">
                        <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${gradientFor(i)} flex items-center justify-center mb-3 overflow-hidden`}>
                          {enr.course.img ? (
                            <img src={enr.course.img} alt={enr.course.title} className="w-full h-full object-cover" />
                          ) : (
                            <Play className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors">
                          {enr.course.title}
                        </h3>
                        <p className="text-[10px] text-gray-400 mb-2 capitalize">{enr.course.level.toLowerCase()}</p>
                        <ProgressBar pct={pct} />
                        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                          <span>{pct}%</span>
                          {pct === 100 && (
                            <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />Done
                            </span>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 flex flex-col items-center gap-3 text-center">
              <BookOpen className="w-8 h-8 text-blue-400 opacity-40" />
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400">No courses enrolled yet.</p>
              <Link to="/student/explore" className="text-xs font-bold text-blue-500 hover:underline">
                Browse courses →
              </Link>
            </Card>
          )}
        </div>
      </Fade>

      {/* ── Bottom row: stats + quick actions ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Learning stats summary */}
        <Fade delay={0.16}>
          <Card className="p-6">
            <h2 className="font-black text-base text-gray-900 dark:text-white mb-4">Learning Stats</h2>
            <div className="space-y-3">
              {[
                { icon: Clock,        label: "Time this month",  value: `${stats?.totalTimeSpentThisMonth ?? 0} min`,       color: "text-blue-500"    },
                { icon: Flame,        label: "Current streak",   value: `${streak} day${streak !== 1 ? "s" : ""}`,          color: "text-amber-500"   },
                { icon: CheckCircle2, label: "Courses completed", value: String(completed),                                  color: "text-emerald-500" },
                { icon: Star,         label: "Avg completion",   value: `${Math.round(Number(stats?.avgCompletionPercent) || 0)}%`, color: "text-violet-500"  },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Fade>

        {/* Quick actions */}
        <Fade delay={0.18}>
          <Card className="p-6">
            <h2 className="font-black text-base text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Explore Courses",  icon: BookOpen, to: "/student/explore",      color: "from-blue-500 to-blue-600"     },
                { label: "My Assignments",   icon: Target,   to: "/student/assignments",  color: "from-violet-500 to-purple-600" },
                { label: "View Grades",      icon: Star,     to: "/student/grades",        color: "from-amber-500 to-orange-500"  },
                { label: "My Certificates",  icon: Award,    to: "/student/certificates",  color: "from-emerald-500 to-teal-600"  },
              ].map(({ label, icon: Ic, to, color }) => (
                <Link key={label} to={to}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${color} text-white hover:opacity-90 transition-all shadow-md group`}>
                  <Ic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </Fade>
      </div>
    </div>
  );
}