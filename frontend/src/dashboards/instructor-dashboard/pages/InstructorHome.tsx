// src/dashboards/instructor-dashboard/pages/InstructorHome.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, BookOpen, Star, TrendingUp, DollarSign,
  ChevronRight, Play, ClipboardList, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const INSTRUCTOR = {
  name: "Sarah Mitchell",
  avatar: "SM",
  title: "Senior Fullstack Engineering Instructor",
  rating: 4.9,
  totalStudents: 18420,
  totalRevenue: 48200,
  totalCourses: 12,
  completionRate: 92,
};

const MONTHLY_REVENUE = [
  { month: "Oct", revenue: 3200 },
  { month: "Nov", revenue: 4100 },
  { month: "Dec", revenue: 3800 },
  { month: "Jan", revenue: 5200 },
  { month: "Feb", revenue: 4600 },
  { month: "Mar", revenue: 6100 },
];

const STUDENT_ACTIVITY = [
  { day: "Mon", active: 420 },
  { day: "Tue", active: 680 },
  { day: "Wed", active: 510 },
  { day: "Thu", active: 790 },
  { day: "Fri", active: 620 },
  { day: "Sat", active: 280 },
  { day: "Sun", active: 340 },
];

const TOP_COURSES = [
  { id: "react-001", title: "Advanced React & System Design", students: 4200, rating: 4.9, revenue: 18900, thumbnail: "from-blue-600 to-indigo-700", completionRate: 87 },
  { id: "node-001", title: "Backend Engineering with Node.js", students: 2800, rating: 4.8, revenue: 12600, thumbnail: "from-emerald-500 to-teal-600", completionRate: 91 },
  { id: "ts-001",   title: "Mastering TypeScript for Scale",   students: 1800, rating: 4.9, revenue: 8100,  thumbnail: "from-violet-500 to-purple-600", completionRate: 94 },
];

const PENDING_TASKS = [
  { type: "assignment", text: "12 submissions pending review", to: "/instructor/assignments", urgent: true },
  { type: "message",    text: "3 unread messages in Alpha Squad", to: "/instructor/discussions", urgent: false },
  { type: "grade",      text: "Beta Force group grade not submitted", to: "/instructor/grades", urgent: true },
];

const RECENT_REVIEWS = [
  { name: "Olusegun A.", avatar: "OA", avatarBg: "bg-emerald-500", rating: 5, text: "Exceptional teaching — crystal clear explanations.", course: "React & System Design" },
  { name: "Mei-Ling C.", avatar: "ML", avatarBg: "bg-pink-500",    rating: 5, text: "Best structured course I've taken.", course: "TypeScript for Scale" },
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
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay, ease: "easeOut" }} className={className}>
    {children}
  </motion.div>
);

function StatCard({ label, value, sub, icon: Icon, color, trend, trendUp }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-bold ${trendUp ? "text-emerald-500" : "text-rose-500"}`}>
            {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </Card>
  );
}

function CustomRevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white">{label}</p>
      <p className="text-violet-500">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

function CustomActivityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white">{label}</p>
      <p className="text-emerald-500">{payload[0].value} students</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorHome() {
  const currentMonthRevenue = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].revenue;
  const prevMonthRevenue = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2].revenue;
  const revenueTrend = `${Math.abs(Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100))}%`;
  const revenueUp = currentMonthRevenue > prevMonthRevenue;

  return (
    <div className="max-w-[1150px] mx-auto space-y-6 pb-12">

      {/* ── Header strip ───────────────────────────────────────── */}
      <Fade>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xl font-black text-white shadow-lg">
              {INSTRUCTOR.avatar}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Welcome back,</p>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{INSTRUCTOR.name}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{INSTRUCTOR.rating}</span>
                <span className="text-xs text-gray-400">avg rating · {INSTRUCTOR.totalStudents.toLocaleString()} students</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/instructor/courses" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              <BookOpen className="w-4 h-4" />My Courses
            </Link>
            <Link to="/instructor/assignments" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:opacity-90 transition-all shadow-md">
              <ClipboardList className="w-4 h-4" />Assignments
            </Link>
          </div>
        </div>
      </Fade>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <Fade delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={INSTRUCTOR.totalStudents.toLocaleString()} sub="+124 this month"
            icon={Users} color="from-blue-500 to-blue-600" trend="+8%" trendUp />
          <StatCard label="Avg Rating" value={String(INSTRUCTOR.rating)} sub="across all courses"
            icon={Star} color="from-amber-400 to-orange-500" />
          <StatCard label="Completion Rate" value={`${INSTRUCTOR.completionRate}%`} sub="student avg"
            icon={TrendingUp} color="from-emerald-500 to-teal-600" trend="+3%" trendUp />
        </div>
      </Fade>

      {/* ── Charts row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Revenue chart */}
        <Fade delay={0.08}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-black text-base text-gray-900 dark:text-white">Monthly Revenue</h2>
              <span className={`flex items-center gap-1 text-xs font-bold ${revenueUp ? "text-emerald-500" : "text-rose-500"}`}>
                {revenueUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {revenueTrend} vs last month
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-5">Last 6 months earnings ($)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomRevenueTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5}
                  dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Fade>

        {/* Student activity */}
        <Fade delay={0.1}>
          <Card className="p-6">
            <h2 className="font-black text-base text-gray-900 dark:text-white mb-1">Student Activity</h2>
            <p className="text-xs text-gray-400 mb-5">Active students this week</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={STUDENT_ACTIVITY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={18}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomActivityTooltip />} />
                <Bar dataKey="active" fill="#10b981" radius={[6, 6, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Fade>
      </div>

      {/* ── Bottom row: courses + tasks + reviews ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

        {/* Top Courses */}
        <Fade delay={0.12}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-base text-gray-900 dark:text-white">Top Courses</h2>
              <Link to="/instructor/courses" className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
                All courses <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {TOP_COURSES.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                  <Link to={`/instructor/courses/${c.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group">
                    <div className={`w-12 h-10 rounded-xl bg-gradient-to-br ${c.thumbnail} flex items-center justify-center flex-shrink-0`}>
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">{c.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.students.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{c.rating}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-500" />${c.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-emerald-500">{c.completionRate}%</p>
                      <p className="text-[10px] text-gray-400">completion</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Card>
        </Fade>

        {/* Right column: tasks + reviews */}
        <div className="space-y-4">
          {/* Pending tasks */}
          <Fade delay={0.14}>
            <Card className="p-5">
              <h2 className="font-black text-sm text-gray-900 dark:text-white mb-3">Needs Attention</h2>
              <div className="space-y-2">
                {PENDING_TASKS.map((t, i) => (
                  <Link key={i} to={t.to}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${t.urgent ? "bg-rose-500" : "bg-amber-400"}`} />
                    <p className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors leading-relaxed">{t.text}</p>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-0.5 ml-auto" />
                  </Link>
                ))}
              </div>
            </Card>
          </Fade>

          {/* Recent Reviews */}
          <Fade delay={0.16}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-sm text-gray-900 dark:text-white">Recent Reviews</h2>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-amber-500">{INSTRUCTOR.rating}</span>
                </div>
              </div>
              <div className="space-y-3">
                {RECENT_REVIEWS.map((r, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${r.avatarBg} text-white flex items-center justify-center text-xs font-black flex-shrink-0`}>{r.avatar}</div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{r.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{r.text}</p>
                      <p className="text-[9px] text-gray-300 dark:text-gray-600 mt-0.5">{r.course}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Fade>
        </div>
      </div>
    </div>
  );
}