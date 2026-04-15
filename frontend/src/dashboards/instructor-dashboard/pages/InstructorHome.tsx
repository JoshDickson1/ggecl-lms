// src/dashboards/instructor-dashboard/pages/InstructorHome.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, BookOpen, Star, TrendingUp,
  ChevronRight, Play, ClipboardList, ArrowUpRight,
  MessageSquare, Award, Zap,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const INSTRUCTOR = {
  name: "Sarah Mitchell",
  avatar: "SM",
  title: "Senior Fullstack Engineering Instructor",
  rating: 4.9,
  totalStudents: 18420,
  totalCourses: 12,
  completionRate: 92,
};

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
  {
    id: "react-001", title: "Advanced React & System Design",
    students: 4200, rating: 4.9,
    thumbnail: "from-blue-600 to-indigo-700", completionRate: 87,
  },
  {
    id: "node-001", title: "Backend Engineering with Node.js",
    students: 2800, rating: 4.8,
    thumbnail: "from-emerald-500 to-teal-600", completionRate: 91,
  },
  {
    id: "ts-001", title: "Mastering TypeScript for Scale",
    students: 1800, rating: 4.9,
    thumbnail: "from-violet-500 to-purple-600", completionRate: 94,
  },
];

const PENDING_TASKS = [
  { text: "12 submissions pending review",          to: "/instructor/assignments", urgent: true  },
  { text: "3 unread messages in Alpha Squad",       to: "/instructor/discussions", urgent: false },
  { text: "Beta Force group grade not submitted",   to: "/instructor/grades",      urgent: true  },
];

const RECENT_REVIEWS = [
  {
    name: "Olusegun A.", avatar: "OA", avatarBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    rating: 5, text: "Exceptional teaching — crystal clear explanations and practical projects.",
    course: "React & System Design", time: "2h ago",
  },
  {
    name: "Mei-Ling C.", avatar: "MC", avatarBg: "bg-gradient-to-br from-pink-500 to-rose-600",
    rating: 5, text: "Best structured course I've taken. The progression felt perfectly natural.",
    course: "TypeScript for Scale", time: "Yesterday",
  },
  {
    name: "Tobias R.", avatar: "TR", avatarBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    rating: 4, text: "Excellent content, would love more real-world examples for generics.",
    course: "TypeScript for Scale", time: "2d ago",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const Fade = ({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
      ))}
    </div>
  );
}

function ActivityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white">{label}</p>
      <p className="text-emerald-500 mt-0.5">{payload[0].value} active students</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorHome() {
  const weeklyActiveTotal = STUDENT_ACTIVITY.reduce((a, d) => a + d.active, 0);
  const peakDay = STUDENT_ACTIVITY.reduce((a, d) => d.active > a.active ? d : a);

  return (
    <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

      {/* ── Hero header ───────────────────────────────────────── */}
      <Fade>
        <Card className="p-6 overflow-hidden relative">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50/40 dark:from-blue-950/20 dark:via-transparent dark:to-indigo-950/10 pointer-events-none rounded-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                  {INSTRUCTOR.avatar}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0f1623]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Welcome back,</p>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{INSTRUCTOR.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{INSTRUCTOR.rating}</span>
                  </div>
                  <span className="text-gray-300 dark:text-white/20 text-xs">·</span>
                  <span className="text-xs text-gray-400">{INSTRUCTOR.totalStudents.toLocaleString()} students</span>
                  <span className="text-gray-300 dark:text-white/20 text-xs">·</span>
                  <span className="text-xs text-gray-400">{INSTRUCTOR.totalCourses} courses</span>
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

          {/* Mini KPI strip */}
          <div className="relative mt-5 pt-5 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Users,      label: "Total Students",   value: INSTRUCTOR.totalStudents.toLocaleString(), accent: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/30" },
              { icon: BookOpen,   label: "Active Courses",    value: String(INSTRUCTOR.totalCourses),           accent: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
              { icon: TrendingUp, label: "Completion Rate",   value: `${INSTRUCTOR.completionRate}%`,           accent: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
              { icon: Award,      label: "Avg Rating",        value: String(INSTRUCTOR.rating),                 accent: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-900/30" },
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

        {/* Student activity bar chart */}
        <Fade delay={0.06}>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-black text-base text-gray-900 dark:text-white">Student Activity</h2>
                <p className="text-xs text-gray-400 mt-0.5">Daily active students this week</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-gray-900 dark:text-white">{weeklyActiveTotal.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">this week · peak {peakDay.day}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 mb-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Active students
              </span>
            </div>

            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={STUDENT_ACTIVITY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ActivityTooltip />} />
                <Bar dataKey="active" fill="#10b981" radius={[6, 6, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Fade>

        {/* Enrollment trend */}
        <Fade delay={0.08}>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-black text-base text-gray-900 dark:text-white">Enrollment Trend</h2>
                <p className="text-xs text-gray-400 mt-0.5">New students joining your courses</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                <ArrowUpRight className="w-3.5 h-3.5" />+8% this month
              </span>
            </div>

            <div className="mt-3 mb-4">
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {INSTRUCTOR.totalStudents.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">total enrolled · all time</p>
            </div>

            <div className="space-y-3">
              {TOP_COURSES.map((c) => {
                const pct = Math.round((c.students / INSTRUCTOR.totalStudents) * 100);
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{c.title}</p>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex-shrink-0 ml-2">{c.students.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${c.thumbnail}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Fade>
      </div>

      {/* ── Main content row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

        {/* Left: Top Courses (full card) */}
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

            <div className="space-y-2">
              {TOP_COURSES.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.13 + i * 0.06 }}
                >
                  <Link to={`/instructor/courses/${c.id}`}
                    className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent hover:border-gray-100 dark:hover:border-white/[0.05] transition-all group">
                    {/* Thumbnail */}
                    <div className={`w-14 h-12 rounded-xl bg-gradient-to-br ${c.thumbnail} flex items-center justify-center flex-shrink-0`}>
                      <Play className="w-4 h-4 text-white" />
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                        {c.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />{c.students.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400" />{c.rating}
                        </span>
                      </div>
                    </div>

                    {/* Completion rate */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{c.completionRate}%</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">completion</p>
                      {/* Mini bar */}
                      <div className="w-16 h-1 rounded-full bg-gray-100 dark:bg-white/[0.08] mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${c.completionRate}%` }} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Aggregate footer */}
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.04] grid grid-cols-2 gap-3">
              {[
                { label: "Total enrolled", value: TOP_COURSES.reduce((a, c) => a + c.students, 0).toLocaleString() },
                { label: "Avg completion", value: `${Math.round(TOP_COURSES.reduce((a, c) => a + c.completionRate, 0) / TOP_COURSES.length)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 text-center">
                  <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        </Fade>

        {/* Right column: Tasks + Reviews */}
        <div className="space-y-4">

          {/* Needs Attention */}
          <Fade delay={0.12}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="font-black text-sm text-gray-900 dark:text-white">Needs Attention</h2>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  {PENDING_TASKS.filter(t => t.urgent).length} urgent
                </span>
              </div>
              <div className="space-y-1.5">
                {PENDING_TASKS.map((t, i) => (
                  <Link key={i} to={t.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent hover:border-gray-100 dark:hover:border-white/[0.05] transition-all group">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.urgent ? "bg-rose-500" : "bg-amber-400"}`} />
                    <p className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors leading-relaxed flex-1">
                      {t.text}
                    </p>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>

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
                <span className="ml-auto flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  {INSTRUCTOR.rating} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
              </div>

              <div className="space-y-3">
                {RECENT_REVIEWS.map((r, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.17 + i * 0.06 }}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-8 h-8 rounded-xl ${r.avatarBg} text-white flex items-center justify-center text-xs font-black flex-shrink-0`}>
                        {r.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{r.name}</p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{r.time}</span>
                        </div>
                        <Stars rating={r.rating} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{r.text}</p>
                    <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium mt-1.5">{r.course}</p>
                  </motion.div>
                ))}
              </div>

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