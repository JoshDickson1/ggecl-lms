// src/dashboards/student/pages/StudentCourses.tsx
// Student's "My Courses" dashboard — enrolled courses with progress, filters, and continue buttons
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Play, CheckCircle2, TrendingUp, Clock,
  Search, X, Filter, Award, BarChart3,
} from "lucide-react";

// ─── Mock enrolled courses — replace with real API ────────────────────────────
const ENROLLED = [
  {
    id: "dev-001",
    title: "The Complete React & TypeScript Bootcamp 2024",
    thumbnail: "from-blue-500 to-indigo-600",
    progress: 78,
    instructor: "Sarah Mitchell",
    instructorAvatar: "SM",
    instructorAvatarBg: "bg-blue-500",
    duration: "42h",
    lectures: 186,
    rating: 4.9,
    category: "Development",
    lastAccessed: "2 hours ago",
    certificate: false,
  },
  {
    id: "dev-002",
    title: "Node.js, Express & MongoDB: Backend Masterclass",
    thumbnail: "from-emerald-500 to-teal-600",
    progress: 45,
    instructor: "James Okafor",
    instructorAvatar: "JO",
    instructorAvatarBg: "bg-emerald-500",
    duration: "38h",
    lectures: 142,
    rating: 4.8,
    category: "Development",
    lastAccessed: "3 days ago",
    certificate: false,
  },
  {
    id: "mkt-001",
    title: "Digital Marketing Masterclass: SEO, Ads & Social",
    thumbnail: "from-violet-500 to-purple-600",
    progress: 100,
    instructor: "Amara Nwosu",
    instructorAvatar: "AN",
    instructorAvatarBg: "bg-violet-500",
    duration: "28h",
    lectures: 98,
    rating: 4.8,
    category: "Marketing",
    lastAccessed: "1 week ago",
    certificate: true,
  },
  {
    id: "biz-001",
    title: "The Complete Entrepreneurship & Startup Playbook",
    thumbnail: "from-sky-500 to-blue-500",
    progress: 20,
    instructor: "Priya Sharma",
    instructorAvatar: "PS",
    instructorAvatarBg: "bg-sky-500",
    duration: "22h",
    lectures: 84,
    rating: 4.9,
    category: "Business",
    lastAccessed: "5 days ago",
    certificate: false,
  },
  {
    id: "ds-001",
    title: "Python for Data Science & Machine Learning",
    thumbnail: "from-amber-500 to-orange-500",
    progress: 62,
    instructor: "Kwame Asante",
    instructorAvatar: "KA",
    instructorAvatarBg: "bg-amber-500",
    duration: "55h",
    lectures: 220,
    rating: 4.9,
    category: "Data Science",
    lastAccessed: "Yesterday",
    certificate: false,
  },
  {
    id: "design-001",
    title: "UI/UX Design Fundamentals with Figma",
    thumbnail: "from-rose-500 to-pink-600",
    progress: 100,
    instructor: "Tolu Adeyemi",
    instructorAvatar: "TA",
    instructorAvatarBg: "bg-rose-500",
    duration: "18h",
    lectures: 72,
    rating: 4.7,
    category: "Design",
    lastAccessed: "2 weeks ago",
    certificate: true,
  },
];

const ALL_CATEGORIES = ["All", ...Array.from(new Set(ENROLLED.map(c => c.category)))];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ProgressBar({ pct, size = "md" }: { pct: number; size?: "sm" | "md" }) {
  const color = pct === 100 ? "from-emerald-500 to-emerald-400" : "from-blue-500 to-blue-400";
  const h = size === "sm" ? "h-1" : "h-1.5";
  return (
    <div className={`${h} w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden`}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`} />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, index }: { course: typeof ENROLLED[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      layout
    >
      <Card className="overflow-hidden group hover:shadow-md transition-shadow">
        {/* Thumbnail */}
        <div className={`relative h-40 bg-gradient-to-br ${course.thumbnail} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "14px 14px" }} />
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-7 h-7 text-white drop-shadow" />
          </div>
          {course.progress === 100 && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 drop-shadow-lg" />
                <span className="text-white text-xs font-bold">Completed</span>
              </div>
            </div>
          )}
          {/* Last accessed badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm">
            <Clock className="w-3 h-3 text-white/80" />
            <span className="text-white/90 text-[10px] font-medium">{course.lastAccessed}</span>
          </div>
          {course.certificate && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm">
              <Award className="w-3 h-3 text-white" />
              <span className="text-white text-[10px] font-bold">Certificate</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Instructor */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-5 h-5 rounded-full ${course.instructorAvatarBg} flex items-center justify-center text-white text-[9px] font-black flex-shrink-0`}>
              {course.instructorAvatar}
            </div>
            <span className="text-xs text-gray-400 truncate">{course.instructor}</span>
          </div>

          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-blue-500 transition-colors">
            {course.title}
          </h3>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400">{course.progress}% complete</span>
              <span className="text-gray-400">{course.lectures} lectures</span>
            </div>
            <ProgressBar pct={course.progress} />
          </div>

          {/* CTA */}
          {course.progress === 100 ? (
            <div className="flex gap-2">
              <Link to={`/courses/${course.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-200 dark:hover:bg-emerald-950/60 transition-all">
                <CheckCircle2 className="w-3.5 h-3.5" />Review Course
              </Link>
              {course.certificate && (
                <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30 hover:bg-amber-200 transition-all" title="Download certificate">
                  <Award className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <Link to={`/courses/${course.id}`} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition-all">
              <Play className="w-3.5 h-3.5" />
              Continue Learning
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentCourses() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">("all");

  const filtered = useMemo(() => {
    let list = [...ENROLLED];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q));
    }
    if (category !== "All") list = list.filter(c => c.category === category);
    if (filter === "in-progress") list = list.filter(c => c.progress < 100);
    if (filter === "completed") list = list.filter(c => c.progress === 100);
    return list;
  }, [search, category, filter]);

  const stats = {
    total: ENROLLED.length,
    inProgress: ENROLLED.filter(c => c.progress > 0 && c.progress < 100).length,
    completed: ENROLLED.filter(c => c.progress === 100).length,
    avgProgress: Math.round(ENROLLED.reduce((a, c) => a + c.progress, 0) / ENROLLED.length),
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Courses</h1>
            <p className="text-xs text-gray-400">{stats.total} enrolled</p>
          </div>
        </div>
        <Link to="/student/explore" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:opacity-90 transition-all shadow-md">
          Explore More
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, value: stats.total, label: "Total Enrolled", color: "from-blue-500 to-blue-600" },
            { icon: TrendingUp, value: stats.inProgress, label: "In Progress", color: "from-amber-400 to-orange-500" },
            { icon: CheckCircle2, value: stats.completed, label: "Completed", color: "from-emerald-500 to-teal-600" },
            { icon: BarChart3, value: `${stats.avgProgress}%`, label: "Avg Progress", color: "from-violet-500 to-purple-600" },
          ].map(({ icon: Ic, value, label, color }) => (
            <Card key={label} className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Ic className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-[11px] text-gray-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your courses..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0f1623] border-gray-200 dark:border-white/[0.07] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
        </div>

        {/* Status filter */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
          {[
            { id: "all", label: "All" },
            { id: "in-progress", label: "In Progress" },
            { id: "completed", label: "Completed" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f.id ? "bg-white dark:bg-[#0f1623] shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Category */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          {ALL_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${category === c ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {c}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-blue-400" />
            </div>
            <p className="font-bold text-gray-700 dark:text-white mb-1">No courses found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}