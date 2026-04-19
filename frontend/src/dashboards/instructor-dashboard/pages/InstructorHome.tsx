// src/dashboards/instructor-dashboard/pages/InstructorHome.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, BookOpen, Star, TrendingUp,
  ChevronRight, Play, ClipboardList,
  MessageSquare, Award, Zap, Loader2,
  Bell,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import UserService from "@/services/user.service";
import InstructorDashboardService from "@/services/instructor-dashboard.service";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function initials(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const COURSE_GRADIENTS = [
  "from-blue-600 to-indigo-700",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorHome() {
  const { data: me, isLoading: meLoading } = useQuery<MeResponse>({
    queryKey: ["user-mine"],
    queryFn:  () => UserService.getMe() as Promise<MeResponse>,
    staleTime: 1000 * 60 * 5,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
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

  const { data: revenueTimeline = [] } = useQuery({
    queryKey: ["instructor-revenue-timeline"],
    queryFn:  () => InstructorDashboardService.getRevenueTimeline({ granularity: "week" }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ["instructor-activities"],
    queryFn:  () => InstructorDashboardService.getActivities(5, true),
    staleTime: 1000 * 60 * 2,
  });

  const loading = meLoading || summaryLoading;

  // Derived values
  const name           = me?.name ?? "Instructor";
  const image          = me?.image ?? null;
  const totalStudents  = summary?.totalStudents?.totalUniqueStudents ?? 0;
  const totalCourses   = summary?.studentsPerCourse?.length ?? 0;
  const avgRating      = summary?.avgReviews?.overallAverage ?? 0;
  const totalReviews   = summary?.avgReviews?.totalReviews ?? 0;
  const completionRate = summary?.completionRate?.overallRate ?? 0;
  const topCourses     = summary?.topCourses ?? [];
  const perCourse      = summary?.studentsPerCourse ?? [];
  const completionMap  = Object.fromEntries(
    (summary?.completionRate?.perCourse ?? []).map(c => [c.courseId, c.completionRate])
  );

  // Revenue timeline chart data
  const timelineChartData = revenueTimeline.map(item => ({
    label: new Date(item.period).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: item.revenue,
    enrollments: item.enrollments,
  }));

  const pendingItems = activitiesData?.activities ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

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
                  {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover object-top" />
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
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{avgRating.toFixed(1)}</span>
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
              { icon: Users,      label: "Total Students",  value: fmt(totalStudents),                    accent: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/30"    },
              { icon: BookOpen,   label: "Active Courses",  value: String(totalCourses),                  accent: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
              { icon: TrendingUp, label: "Completion Rate", value: completionRate > 0 ? `${completionRate.toFixed(0)}%` : "—", accent: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
              { icon: Award,      label: "Avg Rating",      value: avgRating > 0 ? avgRating.toFixed(1) : "—", accent: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
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

        {/* Student Activity + Revenue Timeline */}
        <Fade delay={0.06}>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-black text-base text-gray-900 dark:text-white">Student Activity</h2>
                <p className="text-xs text-gray-400 mt-0.5">Active students this period</p>
              </div>
              {activity && (
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900 dark:text-white">{fmt(activity.activeStudentsInPeriod)}</p>
                  <p className="text-[10px] text-gray-400">active this period</p>
                </div>
              )}
            </div>

            {activity && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Active Students", value: fmt(activity.activeStudentsInPeriod) },
                  { label: "Lessons Completed", value: fmt(activity.lessonsCompleted) },
                  { label: "Time Spent", value: `${Math.round(activity.totalTimeSpentSeconds / 3600)}h` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 text-center">
                    <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {timelineChartData.length > 0 ? (
              <>
                <p className="text-[10px] text-gray-400 mb-2">Revenue & enrollments over time</p>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={timelineChartData} margin={{ top: 2, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ActivityTooltip />} />
                    <Area dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <TrendingUp className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                <p className="text-xs text-gray-400 italic">No revenue timeline data yet</p>
              </div>
            )}
          </Card>
        </Fade>

        {/* Enrollment Trend — real data from studentsPerCourse */}
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
                    const max = Math.max(...perCourse.map(x => x.studentCount), 1);
                    const pct = Math.round((c.studentCount / max) * 100);
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
                    const completion = completionMap[c.courseId] ?? 0;
                    return (
                      <motion.div key={c.courseId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.13 + i * 0.06 }}>
                        <Link to={`/instructor/courses/${c.courseId}`}
                          className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent hover:border-gray-100 dark:hover:border-white/[0.05] transition-all group">
                          <div className={`w-14 h-12 rounded-xl overflow-hidden bg-gradient-to-br ${COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]} flex items-center justify-center flex-shrink-0`}>
                            {c.img ? (
                              <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
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
                                  <Star className="w-3 h-3 text-amber-400" />{c.averageRating.toFixed(1)}
                                </span>
                              )}
                              <span className="text-emerald-500 font-semibold">${(c.revenue ?? 0).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            {completion > 0 ? (
                              <>
                                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{completion.toFixed(0)}%</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">completion</p>
                                <div className="w-16 h-1 rounded-full bg-gray-100 dark:bg-white/[0.08] mt-1.5 overflow-hidden">
                                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completion}%` }} />
                                </div>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">no data</span>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.04] grid grid-cols-2 gap-3">
                  {[
                    { label: "Total enrolled", value: topCourses.reduce((a, c) => a + (c.enrollmentCount ?? 0), 0).toLocaleString() },
                    { label: "Total revenue",  value: `$${topCourses.reduce((a, c) => a + (c.revenue ?? 0), 0).toLocaleString()}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 text-center">
                      <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                    </div>
                  ))}
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

          {/* Needs Attention — real notifications */}
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

          {/* Recent Reviews — real data */}
          <Fade delay={0.14}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </div>
                <h2 className="font-black text-sm text-gray-900 dark:text-white">Recent Reviews</h2>
                {avgRating > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    {avgRating.toFixed(1)} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-gray-400 font-normal">({fmt(totalReviews)})</span>
                  </span>
                )}
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
              ) : recentReviews.length > 0 ? (
                <div className="space-y-3">
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
