// src/dashboards/admin-dashboard/pages/AdminHome.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, BookOpen, DollarSign, TrendingUp, GraduationCap,
  Shield, ChevronRight, ArrowUpRight,
  UserPlus, AlertTriangle, Activity, MessageSquare,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import AdminDashboardService, { type AdminActivityItem, type SignupDaySeries } from "@/services/admin-dashboard.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSignupSeries(
  series: SignupDaySeries[],
  totalStudents: number,
  totalInstructors: number,
) {
  const total = totalStudents + totalInstructors || 1;
  const sRatio = totalStudents / total;
  return series.map(({ date, count }) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    students:    Math.round(count * sRatio),
    instructors: count - Math.round(count * sRatio),
  }));
}

const AVATAR_COLORS = [
  "bg-rose-500", "bg-blue-500", "bg-violet-500",
  "bg-amber-500", "bg-emerald-500", "bg-cyan-500",
];

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function relativeTime(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const Fade = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay, ease: "easeOut" }} className={className}>
    {children}
  </motion.div>
);

function SignupAreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2.5 shadow-lg text-xs min-w-[130px]">
      <p className="font-bold text-gray-900 dark:text-white mb-1.5">{label}</p>
      <p className="text-blue-500 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
        Students: {(payload[0]?.value ?? 0).toLocaleString()}
      </p>
      <p className="text-violet-500 flex items-center gap-1.5 mt-0.5">
        <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
        Instructors: {(payload[1]?.value ?? 0).toLocaleString()}
      </p>
    </div>
  );
}

function UserBreakdownTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
      <p className="text-blue-500">Total: {(payload[0]?.value ?? 0).toLocaleString()}</p>
      <p className="text-emerald-500">Active: {(payload[1]?.value ?? 0).toLocaleString()}</p>
    </div>
  );
}

function CourseTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white">{label}</p>
      <p className="text-amber-500">{payload[0].value.toLocaleString()} students</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminHome() {
  const { data: summary } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: () => AdminDashboardService.getSummary(),
  });

  const totalStudents   = summary?.students?.total      ?? 0;
  const activeInstr     = summary?.instructors?.active  ?? 0;
  const totalCourses    = summary?.courses?.total        ?? 0;
  const draftCourses    = summary?.courses?.draft        ?? 0;
  const totalRevenue    = summary?.revenue?.total        ?? 0;
  const completionRate  = summary?.completionRate?.rate  ?? 0;

  const platformStats = [
    { label: "Total Students",    value: totalStudents.toLocaleString(),                                icon: GraduationCap, color: "from-blue-500 to-blue-600"    },
    { label: "Active Instructors",value: activeInstr.toString(),                                        icon: Users,         color: "from-violet-500 to-purple-600" },
    { label: "Total Courses",     value: totalCourses.toString(),        sub: `${draftCourses} in draft`, icon: BookOpen,      color: "from-emerald-500 to-teal-600"  },
    { label: "Total Revenue",     value: `$${(totalRevenue / 1000).toFixed(1)}k`,                       icon: DollarSign,    color: "from-amber-400 to-orange-500"  },
    { label: "New Signups",       value: (summary?.signups?.total ?? 0).toString(), sub: "all time",    icon: Users,         color: "from-rose-500 to-pink-600"     },
    { label: "Completion Rate",   value: `${Number(completionRate || 0).toFixed(1)}%`, sub: "platform avg", icon: TrendingUp, color: "from-cyan-500 to-sky-600"  },
  ];

  const enrollmentData = (summary?.topEnrollments ?? []).map(t => ({
    name: t.title.length > 14 ? t.title.slice(0, 14) + "…" : t.title,
    students: t.enrollmentCount,
  }));

  const { data: signupStats } = useQuery({
    queryKey: ["admin-signups"],
    queryFn: () => AdminDashboardService.getSignups(),
  });

  // Prefer dedicated signups call for richer series; fall back to summary's series
  const rawSeries =
    (signupStats?.series?.length ? signupStats.series : null) ??
    (summary?.signups?.series?.length ? summary.signups.series : null) ??
    [];
  const signupsMeta = signupStats ?? summary?.signups;

  const signupSeries = buildSignupSeries(
    rawSeries,
    signupsMeta?.students ?? 0,
    signupsMeta?.instructors ?? 0,
  );

  const { data: activities = [] } = useQuery<AdminActivityItem[]>({
    queryKey: ["admin-activities-home"],
    queryFn: () => AdminDashboardService.getRecentActivities(8),
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-5 pb-12">

      {/* ── Command bar header ──────────────────────────────────── */}
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Admin Console</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              Platform Overview
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {[
              { label: "New Classroom", to: "/admin/discussions", icon: MessageSquare, color: "from-blue-600 to-indigo-700" },
              { label: "Add User", to: "/admin/students", icon: UserPlus, color: "from-rose-600 to-pink-700" },
            ].map(({ label, to, icon: Ic, color }) => (
              <Link key={label} to={to}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br ${color} hover:opacity-90 transition-all shadow-md`}>
                <Ic className="w-4 h-4" />{label}
              </Link>
            ))}
          </div>
        </div>
      </Fade>

      {/* ── Stat grid ───────────────────────────────────────────── */}
      <Fade delay={0.04}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {platformStats.map(({ label, value, sub, icon: Ic, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.04 }}>
              <Card className="p-4">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2.5 shadow-sm`}>
                  <Ic className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
                {sub && <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{sub}</p>}
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-tight">{label}</p>
                <span className="flex items-center gap-0.5 text-[10px] font-bold mt-1.5 text-emerald-500">
                  <ArrowUpRight className="w-3 h-3" />live
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </Fade>

      {/* ── Charts row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* Users signup area chart / fallback bar chart */}
        <Fade delay={0.1}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-black text-base text-gray-900 dark:text-white">Users Overview</h2>
              <span className="flex items-center gap-1 text-xs font-bold text-blue-500">
                {(signupsMeta?.total ?? summary?.signups?.total ?? 0).toLocaleString()} total signups
              </span>
            </div>

            {signupSeries.length > 0 ? (
              <>
                <p className="text-xs text-gray-400 mb-1">Daily student &amp; instructor signups</p>
                <div className="flex items-center gap-5 mb-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-blue-500 inline-block" />Students</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-violet-400 inline-block" />Instructors</span>
                </div>
                <ResponsiveContainer width="100%" height={185}>
                  <AreaChart data={signupSeries} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.04} />
                      </linearGradient>
                      <linearGradient id="gradInstr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                      interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<SignupAreaTooltip />} />
                    <Area type="monotone" dataKey="students"    stroke="#3b82f6" strokeWidth={2}
                      fill="url(#gradStudents)"
                      dot={false} activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="instructors" stroke="#a78bfa" strokeWidth={2}
                      fill="url(#gradInstr)"
                      dot={false} activeDot={{ r: 4, fill: "#a78bfa", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-4">Students &amp; instructors — total vs active</p>
                <ResponsiveContainer width="100%" height={185}>
                  <BarChart
                    data={[
                      { name: "Students",    total: summary?.students?.total ?? 0,    active: summary?.students?.active ?? 0 },
                      { name: "Instructors", total: summary?.instructors?.total ?? 0, active: summary?.instructors?.active ?? 0 },
                      { name: "Courses",     total: summary?.courses?.total ?? 0,     active: summary?.courses?.published ?? 0 },
                    ]}
                    margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                    barSize={32}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<UserBreakdownTooltip />} />
                    <Bar dataKey="total"  fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.65} />
                    <Bar dataKey="active" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.9} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-5 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-blue-500/65 inline-block" />Total</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-emerald-500 inline-block" />Active</span>
                </div>
              </>
            )}
          </Card>
        </Fade>

        {/* Top enrolled courses */}
        <Fade delay={0.12}>
          <Card className="p-6">
            <h2 className="font-black text-base text-gray-900 dark:text-white mb-1">Top Enrollments</h2>
            <p className="text-xs text-gray-400 mb-5">Students per course</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={enrollmentData} layout="vertical" margin={{ top: 0, right: 4, left: 4, bottom: 0 }} barSize={12}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CourseTooltip />} />
                <Bar dataKey="students" fill="#f59e0b" radius={[0, 6, 6, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Fade>
      </div>

      {/* ── Bottom row: activity table + quick nav ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* Recent activity */}
        <Fade delay={0.14}>
          <Card>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                <h2 className="font-black text-base text-gray-900 dark:text-white">Recent Activity</h2>
              </div>
              <Link to="/admin/activities" className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {activities.slice(0, 5).map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.17 + i * 0.04 }}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                    {initials(a.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{a.title}</p>
                    <p className="text-xs text-gray-400 truncate">{a.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{relativeTime(a.createdAt)}</span>
                </motion.div>
              ))}
              {activities.length === 0 && (
                <p className="px-6 py-6 text-xs text-gray-400 text-center">No recent activity</p>
              )}
            </div>
          </Card>
        </Fade>

        {/* Right column: quick nav */}
        <div className="space-y-4">
          <Fade delay={0.18}>
            <Card className="p-5">
              <h2 className="font-black text-sm text-gray-900 dark:text-white mb-3">Quick Navigation</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Students",     to: "/admin/students",     icon: GraduationCap, color: "from-blue-500 to-blue-600" },
                  { label: "Instructors",  to: "/admin/instructors",  icon: Users,         color: "from-violet-500 to-purple-600" },
                  { label: "Courses",      to: "/admin/courses",      icon: BookOpen,      color: "from-emerald-500 to-teal-600" },
                  { label: "Transactions", to: "/admin/transactions", icon: DollarSign,    color: "from-amber-500 to-orange-500" },
                  { label: "Support",      to: "/admin/support",      icon: AlertTriangle, color: "from-rose-500 to-pink-600" },
                  { label: "Discussions",  to: "/admin/discussions",  icon: MessageSquare, color: "from-cyan-500 to-sky-600" },
                ].map(({ label, to, icon: Ic, color }) => (
                  <Link key={label} to={to}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-br ${color} hover:opacity-90 transition-all shadow-sm`}>
                    <Ic className="w-3.5 h-3.5" />{label}
                  </Link>
                ))}
              </div>
            </Card>
          </Fade>
        </div>
      </div>
    </div>
  );
}