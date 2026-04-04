// src/dashboards/student-dashboard/pages/StudentHome.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play, BookOpen, Award, TrendingUp, Clock, CheckCircle2,
  Flame, Star, ChevronRight, BarChart3, Target, Zap,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STUDENT = {
  name: "Emeka Okonkwo",
  avatar: "EO",
  streak: 14,
  xp: 2840,
  level: 7,
  nextLevelXp: 3500,
};

const CONTINUE_COURSE = {
  id: "dev-001",
  title: "The Complete React & TypeScript Bootcamp 2024",
  instructor: "Sarah Mitchell",
  thumbnail: "from-blue-600 to-blue-700",
  progress: 78,
  nextLesson: "Module 9 — Custom Hooks Deep Dive",
  duration: "34 min",
};

const WEEKLY_PROGRESS = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 90 },
  { day: "Wed", minutes: 30 },
  { day: "Thu", minutes: 120 },
  { day: "Fri", minutes: 75 },
  { day: "Sat", minutes: 0 },
  { day: "Sun", minutes: 60 },
];

const ENROLLED_COURSES = [
  { id: "dev-001", title: "React & TypeScript Bootcamp", thumbnail: "from-blue-500 to-blue-600", progress: 78, instructor: "Sarah Mitchell" },
  { id: "ds-001",  title: "Python for Data Science",      thumbnail: "from-amber-500 to-orange-500", progress: 62, instructor: "Kwame Asante" },
  { id: "dev-002", title: "Node.js Backend Masterclass",  thumbnail: "from-emerald-500 to-teal-600", progress: 45, instructor: "James Okafor" },
];

const RECENT_ACTIVITY = [
  { icon: "🎯", text: "Completed quiz in React Bootcamp — 92%", time: "2h ago" },
  { icon: "📝", text: "Submitted Weather Dashboard assignment", time: "Yesterday" },
  { icon: "⭐", text: "Earned 'Consistent Learner' badge", time: "3 days ago" },
  { icon: "💬", text: "New reply from Sarah Mitchell in Alpha Squad", time: "3 days ago" },
];

const ANNOUNCEMENTS = [
  { title: "Live Q&A Session this Saturday 10am WAT", course: "React & TypeScript Bootcamp", color: "bg-blue-500" },
  { title: "Assignment 3 — Weather Dashboard is due April 5", course: "React & TypeScript Bootcamp", color: "bg-amber-500" },
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

function ProgressBar({ pct, color = "from-blue-500 to-blue-500" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`} />
    </div>
  );
}

// Custom tooltip for chart
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
  const xpPct = Math.round((STUDENT.xp / STUDENT.nextLevelXp) * 100);
  const totalMinutes = WEEKLY_PROGRESS.reduce((a, d) => a + d.minutes, 0);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-12">

      {/* ── Greeting hero ──────────────────────────────────────── */}
      <Fade>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 p-8">
          {/* Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-amber-300" />
                <span className="text-amber-200 text-sm font-bold">{STUDENT.streak}-day streak 🔥</span>
              </div>
              <h1 className="text-3xl font-black text-white leading-tight">
                Good morning,<br />{STUDENT.name.split(" ")[0]} 👋
              </h1>
              <p className="text-blue-200 text-sm mt-2">You're {100 - CONTINUE_COURSE.progress}% away from completing your top course.</p>

              {/* XP Bar */}
              <div className="mt-4 max-w-xs">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-blue-200 font-semibold">Level {STUDENT.level}</span>
                  <span className="text-blue-200">{STUDENT.xp.toLocaleString()} / {STUDENT.nextLevelXp.toLocaleString()} XP</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                </div>
              </div>
            </div>

            {/* Avatar + stats */}
            <div className="flex items-center md:justify-end justify-between gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                {STUDENT.avatar}
              </div>
              <div className="flex md:flex-col flex-row gap-2">
                {[
                  { label: "Courses", value: 6 },
                  { label: "Completed", value: 2 },
                  { label: "Certificates", value: 2 },
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
      <Fade delay={0.06}>
        <Card className="p-6 overflow-hidden relative">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-blue-500" />
            <h2 className="font-black text-base text-gray-900 dark:text-white">Continue Learning</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Thumbnail */}
            <div className={`w-full sm:w-36 h-20 rounded-2xl flex-shrink-0 bg-gradient-to-br ${CONTINUE_COURSE.thumbnail} flex items-center justify-center shadow-lg`}>
              <Play className="w-8 h-8 text-white drop-shadow" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{CONTINUE_COURSE.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">by {CONTINUE_COURSE.instructor}</p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="truncate">{CONTINUE_COURSE.nextLesson}</span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3" />{CONTINUE_COURSE.duration}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400">{CONTINUE_COURSE.progress}% complete</span>
                </div>
                <ProgressBar pct={CONTINUE_COURSE.progress} />
              </div>
            </div>
            <Link to={`/student/courses/${CONTINUE_COURSE.id}`}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:opacity-90 shadow-md transition-all">
              <Play className="w-4 h-4" />Resume
            </Link>
          </div>
        </Card>
      </Fade>

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
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={WEEKLY_PROGRESS} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                  fill="url(#blueGrad)" dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Fade>

        {/* Recent Activity */}
        <Fade delay={0.11}>
          <Card className="p-6">
            <h2 className="font-black text-base text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{a.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ENROLLED_COURSES.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 + i * 0.06 }}>
                <Link to={`/student/courses/${c.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow group cursor-pointer">
                    <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${c.thumbnail} flex items-center justify-center mb-3`}>
                      <Play className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors">{c.title}</h3>
                    <p className="text-[10px] text-gray-400 mb-2">by {c.instructor}</p>
                    <ProgressBar pct={c.progress} />
                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                      <span>{c.progress}%</span>
                      {c.progress === 100 && <span className="text-emerald-500 font-semibold flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />Done</span>}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Fade>

      {/* ── Bottom row: announcements + quick actions ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Announcements */}
        <Fade delay={0.16}>
          <Card className="p-6">
            <h2 className="font-black text-base text-gray-900 dark:text-white mb-4">Announcements</h2>
            <div className="space-y-3">
              {ANNOUNCEMENTS.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                  <span className={`w-2 h-2 rounded-full ${a.color} flex-shrink-0 mt-1.5`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{a.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{a.course}</p>
                  </div>
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
                { label: "Explore Courses", icon: BookOpen, to: "/student/explore", color: "from-blue-500 to-blue-600" },
                { label: "My Assignments", icon: Target, to: "/student/assignments", color: "from-violet-500 to-purple-600" },
                { label: "View Grades",    icon: Star,     to: "/student/grades",     color: "from-amber-500 to-orange-500" },
                { label: "My Certificates",icon: Award,    to: "/student/certificates",color: "from-emerald-500 to-teal-600" },
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