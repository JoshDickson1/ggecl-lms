// src/dashboards/admin-dashboard/pages/AdminHome.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, BookOpen, DollarSign, TrendingUp, GraduationCap,
  Shield, ChevronRight, ArrowUpRight, ArrowDownRight,
  UserPlus, AlertTriangle, CheckCircle2, Activity, MessageSquare, Bell,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

// const ADMIN = { name: "Emeka Osei", avatar: "EO" };
  
const PLATFORM_STATS = [
  { label: "Total Students",    value: "3,842",  sub: "+124 this week",  icon: GraduationCap, color: "from-blue-500 to-blue-600",    trend: "+3.3%",  trendUp: true },
  { label: "Active Instructors",value: "48",     sub: "2 pending review",icon: Users,         color: "from-violet-500 to-purple-600", trend: "+2",     trendUp: true },
  { label: "Total Courses",     value: "142",    sub: "18 in draft",     icon: BookOpen,      color: "from-emerald-500 to-teal-600",  trend: "+6",     trendUp: true },
  { label: "Monthly Revenue",   value: "$61k",   sub: "+32% vs last mo", icon: DollarSign,    color: "from-amber-400 to-orange-500",  trend: "+32%",   trendUp: true },
  { label: "Open Tickets",      value: "14",     sub: "3 high priority", icon: AlertTriangle, color: "from-rose-500 to-pink-600",    trend: "-2",     trendUp: true },
  { label: "Completion Rate",   value: "89%",    sub: "platform avg",    icon: TrendingUp,    color: "from-cyan-500 to-sky-600",     trend: "+1.4%",  trendUp: true },
];

const REVENUE_DATA = [
  { month: "Oct", revenue: 38000, students: 3200 },
  { month: "Nov", revenue: 41000, students: 3380 },
  { month: "Dec", revenue: 36500, students: 3410 },
  { month: "Jan", revenue: 49000, students: 3520 },
  { month: "Feb", revenue: 47200, students: 3680 },
  { month: "Mar", revenue: 61000, students: 3842 },
];

const ENROLLMENT_BY_COURSE = [
  { name: "React & TS",    students: 4200 },
  { name: "Node.js",       students: 2800 },
  { name: "Data Science",  students: 2400 },
  { name: "Marketing",     students: 1900 },
  { name: "TypeScript",    students: 1800 },
  { name: "UI/UX Design",  students: 1400 },
];

const RECENT_SIGNUPS = [
  { name: "Aisha Bello",     avatar: "AB", avatarBg: "bg-rose-500",    role: "student",    course: "React & TypeScript Bootcamp",  time: "5m ago" },
  { name: "Tunde Fashola",   avatar: "TF", avatarBg: "bg-blue-500",    role: "student",    course: "Python for Data Science",      time: "22m ago" },
  { name: "Grace Eze",       avatar: "GE", avatarBg: "bg-violet-500",  role: "instructor", course: "Pending course review",        time: "1h ago" },
  { name: "Kwame Boateng",   avatar: "KB", avatarBg: "bg-amber-500",   role: "student",    course: "Digital Marketing Masterclass",time: "2h ago" },
  { name: "Nkechi Okafor",   avatar: "NO", avatarBg: "bg-emerald-500", role: "student",    course: "Node.js Backend Masterclass",  time: "3h ago" },
];

const QUICK_ALERTS = [
  { type: "warning", text: "3 high-priority support tickets unresolved", to: "/admin/support" },
  { type: "info",    text: "Grace Eze submitted instructor application", to: "/admin/instructors" },
  { type: "success", text: "March revenue target exceeded by 22%", to: "/admin/transactions" },
  { type: "warning", text: "2 courses flagged for content review", to: "/admin/courses" },
];

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

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
      <p className="text-rose-500">Revenue: ${(payload[0]?.value / 1000).toFixed(1)}k</p>
      <p className="text-blue-500">Students: {payload[1]?.value?.toLocaleString()}</p>
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

const roleBadge = (role: string) => role === "instructor"
  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";

const alertIcon = (type: string) => ({
  warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />,
  info:    <Bell className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />,
  success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />,
})[type];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminHome() {
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
          {/* Quick action bar */}
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
          {PLATFORM_STATS.map(({ label, value, sub, icon: Ic, color, trend, trendUp }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.04 }}>
              <Card className="p-4">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2.5 shadow-sm`}>
                  <Ic className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
                <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{sub}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-tight">{label}</p>
                <span className={`flex items-center gap-0.5 text-[10px] font-bold mt-1.5 ${trendUp ? "text-emerald-500" : "text-rose-500"}`}>
                  {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{trend}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </Fade>

      {/* ── Charts row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* Revenue + students area chart */}
        <Fade delay={0.1}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-black text-base text-gray-900 dark:text-white">Revenue & Growth</h2>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                <ArrowUpRight className="w-3.5 h-3.5" />+32% this month
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-5">Revenue ($) and total student count — last 6 months</p>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="blueGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
                <Tooltip content={<RevenueTooltip />} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2} fill="url(#roseGrad)"
                  dot={{ r: 3, fill: "#f43f5e", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#f43f5e", strokeWidth: 0 }} />
                <Area yAxisId="right" type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} fill="url(#blueGradA)"
                  dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-rose-500 inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-blue-500 inline-block" />Students</span>
            </div>
          </Card>
        </Fade>

        {/* Enrollment by course */}
        <Fade delay={0.12}>
          <Card className="p-6">
            <h2 className="font-black text-base text-gray-900 dark:text-white mb-1">Top Enrollments</h2>
            <p className="text-xs text-gray-400 mb-5">Students per course category</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={ENROLLMENT_BY_COURSE} layout="vertical" margin={{ top: 0, right: 4, left: 4, bottom: 0 }} barSize={12}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<CourseTooltip />} />
                <Bar dataKey="students" fill="#f59e0b" radius={[0, 6, 6, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Fade>
      </div>

      {/* ── Bottom row: signups table + alerts + quick nav ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* Recent signups table */}
        <Fade delay={0.14}>
          <Card>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                <h2 className="font-black text-base text-gray-900 dark:text-white">Recent Signups</h2>
              </div>
              <Link to="/admin/students" className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {RECENT_SIGNUPS.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.17 + i * 0.04 }}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${s.avatarBg} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>{s.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.course}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize ${roleBadge(s.role)}`}>{s.role}</span>
                    <span className="text-[10px] text-gray-400">{s.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </Fade>

        {/* Right column: alerts + quick nav */}
        <div className="space-y-4">
          {/* Alerts */}
          <Fade delay={0.16}>
            <Card className="p-5">
              <h2 className="font-black text-sm text-gray-900 dark:text-white mb-3">Alerts</h2>
              <div className="space-y-2">
                {QUICK_ALERTS.map((a, i) => (
                  <Link key={i} to={a.to}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group">
                    {alertIcon(a.type)}
                    <p className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors leading-relaxed flex-1">{a.text}</p>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 flex-shrink-0 mt-0.5 transition-colors" />
                  </Link>
                ))}
              </div>
            </Card>
          </Fade>

          {/* Quick Navigation */}
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