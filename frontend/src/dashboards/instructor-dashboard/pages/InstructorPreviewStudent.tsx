// src/dashboards/instructor/pages/InstructorStudentPreview.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Clock,
  Award,
  Filter,
  SlidersHorizontal,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const COURSES = [
  { id: "c1", title: "Advanced React & System Design" },
  { id: "c2", title: "Backend Engineering with Node.js" },
  { id: "c3", title: "Mastering TypeScript for Scale" },
];

const STUDENTS = [
  {
    id: "s1",
    name: "Olusegun Adeyemi",
    avatar: "OA",
    avatarBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    email: "olusegun.a@gmail.com",
    location: "Lagos, Nigeria",
    courseId: "c1",
    progress: 87,
    completedLessons: 34,
    totalLessons: 39,
    watchTime: "14h 32m",
    lastActive: "2 hours ago",
    rating: 5,
    joinedAt: "Jan 12, 2025",
    status: "active",
  },
  {
    id: "s2",
    name: "Mei-Ling Chen",
    avatar: "MC",
    avatarBg: "bg-gradient-to-br from-pink-500 to-rose-600",
    email: "meiling.c@outlook.com",
    location: "Singapore",
    courseId: "c2",
    progress: 62,
    completedLessons: 18,
    totalLessons: 29,
    watchTime: "9h 15m",
    lastActive: "Yesterday",
    rating: 5,
    joinedAt: "Feb 3, 2025",
    status: "active",
  },
  {
    id: "s3",
    name: "Tobias Richter",
    avatar: "TR",
    avatarBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    email: "tobias.r@web.de",
    location: "Berlin, Germany",
    courseId: "c3",
    progress: 100,
    completedLessons: 22,
    totalLessons: 22,
    watchTime: "11h 48m",
    lastActive: "3 days ago",
    rating: 4,
    joinedAt: "Dec 19, 2024",
    status: "completed",
  },
  {
    id: "s4",
    name: "Amara Okonkwo",
    avatar: "AO",
    avatarBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    email: "amara.o@yahoo.com",
    location: "Abuja, Nigeria",
    courseId: "c1",
    progress: 41,
    completedLessons: 16,
    totalLessons: 39,
    watchTime: "6h 04m",
    lastActive: "1 week ago",
    rating: 0,
    joinedAt: "Mar 1, 2025",
    status: "at-risk",
  },
  {
    id: "s5",
    name: "Priya Nair",
    avatar: "PN",
    avatarBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    email: "priya.n@gmail.com",
    location: "Mumbai, India",
    courseId: "c2",
    progress: 78,
    completedLessons: 22,
    totalLessons: 29,
    watchTime: "12h 20m",
    lastActive: "4 hours ago",
    rating: 5,
    joinedAt: "Jan 28, 2025",
    status: "active",
  },
  {
    id: "s6",
    name: "Carlos Mendez",
    avatar: "CM",
    avatarBg: "bg-gradient-to-br from-red-500 to-pink-600",
    email: "carlos.m@proton.me",
    location: "Mexico City, Mexico",
    courseId: "c3",
    progress: 55,
    completedLessons: 12,
    totalLessons: 22,
    watchTime: "7h 33m",
    lastActive: "2 days ago",
    rating: 0,
    joinedAt: "Feb 14, 2025",
    status: "active",
  },
  {
    id: "s7",
    name: "Yuki Tanaka",
    avatar: "YT",
    avatarBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
    email: "yuki.t@icloud.com",
    location: "Tokyo, Japan",
    courseId: "c1",
    progress: 100,
    completedLessons: 39,
    totalLessons: 39,
    watchTime: "18h 11m",
    lastActive: "5 days ago",
    rating: 5,
    joinedAt: "Nov 30, 2024",
    status: "completed",
  },
  {
    id: "s8",
    name: "Fatoumata Diallo",
    avatar: "FD",
    avatarBg: "bg-gradient-to-br from-lime-500 to-green-600",
    email: "fatoumata.d@gmail.com",
    location: "Dakar, Senegal",
    courseId: "c2",
    progress: 22,
    completedLessons: 6,
    totalLessons: 29,
    watchTime: "2h 50m",
    lastActive: "2 weeks ago",
    rating: 0,
    joinedAt: "Mar 10, 2025",
    status: "at-risk",
  },
];

const STATUS_META = {
  active: { label: "Active", className: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
  completed: { label: "Completed", className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  "at-risk": { label: "At Risk", className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function ProgressBar({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const color =
    value === 100
      ? "from-blue-500 to-indigo-600"
      : value >= 60
      ? "from-emerald-500 to-teal-500"
      : value >= 30
      ? "from-amber-400 to-orange-500"
      : "from-red-400 to-rose-500";
  const h = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className={`w-full ${h} rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ElementType; value: string | number; label: string; color: string;
}) {
  return (
    <Card className="p-4 flex items-center gap-3.5">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">{value}</p>
        <p className="text-[11px] text-gray-400">{label}</p>
      </div>
    </Card>
  );
}

// ─── Student Row ──────────────────────────────────────────────────────────────

function StudentRow({ student, index }: { student: typeof STUDENTS[0]; index: number }) {
  const course = COURSES.find((c) => c.id === student.courseId);
  const status = STATUS_META[student.status as keyof typeof STATUS_META];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link to={`/instructor/students/${student.id}`}>
        <div className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all border border-transparent hover:border-gray-100 dark:hover:border-white/[0.06] cursor-pointer">
          {/* Avatar */}
          <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black text-white ${student.avatarBg}`}>
            {student.avatar}
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {student.name}
              </p>
              <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold flex-shrink-0 ${status.className}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5">{student.email}</p>
          </div>

          {/* Course */}
          <div className="hidden md:block flex-shrink-0 w-44">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{course?.title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Enrolled {student.joinedAt}</p>
          </div>

          {/* Progress */}
          <div className="hidden sm:flex flex-col gap-1.5 flex-shrink-0 w-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{student.progress}%</span>
              <span className="text-[10px] text-gray-400">{student.completedLessons}/{student.totalLessons}</span>
            </div>
            <ProgressBar value={student.progress} size="sm" />
          </div>

          {/* Last active */}
          <div className="hidden lg:block flex-shrink-0 text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">{student.lastActive}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />{student.watchTime}
            </p>
          </div>

          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorStudentPreview() {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return STUDENTS.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchCourse = selectedCourse === "all" || s.courseId === selectedCourse;
      const matchStatus = selectedStatus === "all" || s.status === selectedStatus;
      return matchSearch && matchCourse && matchStatus;
    });
  }, [search, selectedCourse, selectedStatus]);

  const stats = {
    total: STUDENTS.length,
    active: STUDENTS.filter((s) => s.status === "active").length,
    completed: STUDENTS.filter((s) => s.status === "completed").length,
    atRisk: STUDENTS.filter((s) => s.status === "at-risk").length,
  };

  const avgProgress = Math.round(STUDENTS.reduce((a, s) => a + s.progress, 0) / STUDENTS.length);

  return (
    <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students</h1>
          <p className="text-sm text-gray-400 mt-0.5">{STUDENTS.length} students across {COURSES.length} courses</p>
        </div>
        <Link
          to="/instructor/students/all"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 transition-all shadow-sm"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          View All
        </Link>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatCard icon={Users} value={stats.total} label="Total Students" color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard icon={TrendingUp} value={stats.active} label="Active" color="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard icon={GraduationCap} value={stats.completed} label="Completed" color="bg-gradient-to-br from-violet-500 to-purple-600" />
        <StatCard icon={Award} value={`${avgProgress}%`} label="Avg Progress" color="bg-gradient-to-br from-amber-400 to-orange-500" />
      </motion.div>

      {/* ── Search + Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                  bg-gray-50 dark:bg-white/[0.04]
                  border border-gray-200 dark:border-white/[0.08]
                  text-gray-800 dark:text-gray-200
                  placeholder:text-gray-400 dark:placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            {/* Course filter */}
            <div className="hidden sm:flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              >
                <option value="all">All Courses</option>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="hidden sm:flex gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
              {(["all", "active", "completed", "at-risk"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-150 ${
                    selectedStatus === s
                      ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {s === "all" ? "All" : s === "at-risk" ? "At Risk" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden sm:hidden"
              >
                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-white/[0.06] flex flex-col gap-2.5">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 focus:outline-none"
                  >
                    <option value="all">All Courses</option>
                    {COURSES.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <div className="flex gap-1.5 flex-wrap">
                    {(["all", "active", "completed", "at-risk"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedStatus(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          selectedStatus === s
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-white/[0.06] text-gray-500"
                        }`}
                      >
                        {s === "all" ? "All" : s === "at-risk" ? "At Risk" : s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ── Student List ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <Card>
          {/* Table header */}
          <div className="hidden sm:flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
            <div className="w-11 flex-shrink-0" />
            <p className="flex-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">Student</p>
            <p className="hidden md:block w-44 text-[11px] font-bold uppercase tracking-widest text-gray-400">Course</p>
            <p className="hidden sm:block w-28 text-[11px] font-bold uppercase tracking-widest text-gray-400">Progress</p>
            <p className="hidden lg:block text-right text-[11px] font-bold uppercase tracking-widest text-gray-400">Activity</p>
            <div className="w-4 flex-shrink-0" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50 dark:divide-white/[0.04] p-2">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((s, i) => (
                  <StudentRow key={s.id} student={s} index={i} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 flex flex-col items-center gap-3 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No students found</p>
                  <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing <span className="font-bold text-gray-700 dark:text-gray-300">{filtered.length}</span> of {STUDENTS.length} students
              </p>
              <Link
                to="/instructor/students/all"
                className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Course breakdown mini cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {COURSES.map((course) => {
          const courseStudents = STUDENTS.filter((s) => s.courseId === course.id);
          const avgProg = Math.round(courseStudents.reduce((a, s) => a + s.progress, 0) / courseStudents.length);
          return (
            <Card key={course.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />{courseStudents.length}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 leading-snug">
                {course.title}
              </p>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-gray-400">Avg. progress</span>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{avgProg}%</span>
              </div>
              <ProgressBar value={avgProg} size="sm" />
            </Card>
          );
        })}
      </motion.div>
    </div>
  );
}