import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Star, Users, BookOpen,
  Clock, TrendingUp, Play, ChevronDown, LayoutGrid,
  List, X, Search, SlidersHorizontal,
} from "lucide-react";
import { categories } from "@/data/categories";
import {
  getCoursesByCategory,
  getInstructorsByCategory,
  type Course,
  type Instructor,
} from "@/data/courses";

// ─── Shared Hero BG — reuse this on every page ────────────────────────────────
export function PageHeroBg({ color = "from-blue-500 to-cyan-400" }: { color?: string }) {
  return (
    <>
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
        style={{
          backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Category color wash */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.07] dark:opacity-[0.13]`} />
      {/* Blue glow ball — top right */}
      <div className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full bg-blue-500/[0.09] dark:bg-blue-500/[0.18] blur-[100px]" />
      {/* Secondary glow — bottom left */}
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-indigo-400/[0.06] dark:bg-indigo-400/[0.12] blur-[80px]" />
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced", "All levels"] as const;

const badgeStyle: Record<string, string> = {
  Bestseller: "bg-amber-400 text-amber-900",
  "Hot & New": "bg-rose-500 text-white",
  New: "bg-emerald-500 text-white",
};

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i + 1 <= Math.round(rating) ? "#FFC806" : "#374151"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Course Card Grid ─────────────────────────────────────────────────────────
function CourseCardGrid({ course, index }: { course: Course; index: number }) {
  const Icon = course.icon;
  const [hovered, setHovered] = useState(false);
  const discount = Math.round((1 - course.price / course.originalPrice) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex flex-col rounded-[20px] overflow-hidden
        bg-white dark:bg-[#0f1420]
        border border-gray-100 dark:border-white/[0.07]
        transition-all duration-300"
      style={{
        boxShadow: hovered
          ? "0 0 0 1.5px rgba(59,130,246,0.4), 0 16px 48px rgba(59,130,246,0.13)"
          : "0 2px 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* Thumbnail */}
      <Link to={`/courses/${course.id}`} className="block flex-shrink-0">
        <div className={`relative h-48 bg-gradient-to-br ${course.thumbnail} overflow-hidden`}>
          {/* Dot overlay */}
          <div className="absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}
          />
          {/* Icon */}
          <motion.div
            animate={hovered ? { scale: 1.12, rotate: 6 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          {/* Play overlay */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/28 backdrop-blur-[2px] flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: hovered ? 1 : 0.75 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-2xl"
            >
              <Play className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" />
            </motion.div>
          </motion.div>
          {/* Badge */}
          {course.badge && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10.5px] font-bold tracking-wide ${badgeStyle[course.badge]}`}>
              {course.badge}
            </span>
          )}
          {/* Level */}
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-black/35 text-white backdrop-blur-sm">
            {course.level}
          </span>
          {/* Updated */}
          <span className="absolute bottom-3 left-3 text-[10px] text-white/65 font-medium">
            Updated {course.lastUpdated}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col gap-2.5 p-5 flex-1">
        <Link to={`/courses/${course.id}`}>
          <h3 className="font-bold text-[14.5px] leading-snug text-gray-900 dark:text-white line-clamp-2
            hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {course.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Instructor */}
        <Link to={`/instructors/${course.instructor.id}`} className="flex items-center gap-2 group w-fit">
          <span className={`w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0 ${course.instructor.avatarBg}`}>
            {course.instructor.avatar}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate">
            {course.instructor.name}
          </span>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Stars rating={course.rating} />
          <span className="text-xs font-bold text-amber-500">{course.rating}</span>
          <span className="text-xs text-gray-400">({fmt(course.reviews)} reviews)</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500 flex-wrap">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lectures} lectures</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{fmt(course.students)}</span>
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/[0.06] mt-1" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">${course.price}</span>
            <span className="text-xs text-gray-400 line-through">${course.originalPrice}</span>
            <span className="text-[10px] font-bold text-emerald-500">{discount}% off</span>
          </div>
          <Link to={`/courses/${course.id}`}>
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500
                text-white text-xs font-bold transition-colors shadow-[0_3px_12px_rgba(59,130,246,0.35)]"
            >
              Enroll <ArrowRight className="w-3 h-3" />
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Course Card List ─────────────────────────────────────────────────────────
function CourseCardList({ course, index }: { course: Course; index: number }) {
  const Icon = course.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.26, delay: index * 0.03 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex md:flex-row flex-col gap-4 rounded-[18px] overflow-hidden p-3
        bg-white dark:bg-[#0f1420]
        border border-gray-100 dark:border-white/[0.07]
        transition-all duration-300"
      style={{
        boxShadow: hovered
          ? "0 0 0 1.5px rgba(59,130,246,0.35), 0 8px 32px rgba(59,130,246,0.12)"
          : "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Thumbnail */}
      <Link to={`/courses/${course.id}`} className="flex-shrink-0">
        <div className={`relative w-full md:w-36 h-[100px] rounded-xl bg-gradient-to-br ${course.thumbnail} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "14px 14px" }}
          />
          <motion.div animate={hovered ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.28 }}>
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          {course.badge && (
            <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${badgeStyle[course.badge]}`}>
              {course.badge}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 gap-1.5 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/courses/${course.id}`}>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1
              hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {course.title}
            </h3>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md
            bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400 flex-shrink-0">
            {course.level}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1">{course.description}</p>
        <Link to={`/instructors/${course.instructor.id}`} className="flex items-center gap-1.5 group w-fit">
          <span className={`w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0 ${course.instructor.avatarBg}`}>
            {course.instructor.avatar}
          </span>
          <span className="text-[11px] text-gray-400 group-hover:text-blue-500 transition-colors">
            {course.instructor.name}
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Stars rating={course.rating} size={11} />
          <span className="text-[11px] font-bold text-amber-500">{course.rating}</span>
          <span className="text-[10px] text-gray-400">({fmt(course.reviews)})</span>
        </div>
        <div className="flex items-center gap-3 text-[10.5px] text-gray-400 flex-wrap">
          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{course.duration}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" />{course.lectures} lectures</span>
          <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{fmt(course.students)}</span>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex flex-col items-end justify-between flex-shrink-0 py-1 pl-2 md:-mt-0 -mt-20">
        <div className="text-right">
          <div className="text-lg font-extrabold text-gray-900 dark:text-white">${course.price}</div>
          <div className="text-[11px] text-gray-400 line-through">${course.originalPrice}</div>
          <div className="text-[10px] font-bold text-emerald-500">
            {Math.round((1 - course.price / course.originalPrice) * 100)}% off
          </div>
        </div>
        <Link to={`/courses/${course.id}`}>
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500
              text-white text-xs font-bold transition-colors shadow-[0_3px_10px_rgba(59,130,246,0.3)]"
          >
            Enroll <ArrowRight className="w-3 h-3" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Instructor Card ──────────────────────────────────────────────────────────
function InstructorCard({ instructor, index }: { instructor: Instructor; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
    >
      <Link
        to={`/instructors/${instructor.id}`}
        className="flex items-center gap-4 p-5 rounded-[20px]
          bg-white dark:bg-[#0f1420]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_2px_16px_rgba(0,0,0,0.05)]
          hover:shadow-[0_0_0_1.5px_rgba(59,130,246,0.35),0_8px_32px_rgba(59,130,246,0.11)]
          hover:-translate-y-0.5
          transition-all duration-300 group block"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-extrabold text-white flex-shrink-0 shadow-lg ${instructor.avatarBg}`}>
          {instructor.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate
            group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {instructor.name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{instructor.title}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Stars rating={instructor.rating} size={11} />
            <span className="text-[11px] font-bold text-amber-500">{instructor.rating}</span>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Users className="w-3 h-3" />{fmt(instructor.students)}
          </span>
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />{instructor.courses} courses
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl
      bg-white/80 dark:bg-white/[0.05]
      backdrop-blur-xl
      border border-white dark:border-white/[0.08]
      shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mb-0.5">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <span className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</span>
      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{label}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SingleCategory() {
  const { id } = useParams();
  const categoryId = id ?? "development";
  const category = categories.find((c) => c.id === categoryId) ?? categories[0];
  const Icon = category.icon;

  const categoryCourses = getCoursesByCategory(category.id);
  const categoryInstructors = getInstructorsByCategory(category.id);

  const [levelFilter, setLevelFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState("rating");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAllInstructors, setShowAllInstructors] = useState(false);

  const totalStudents = categoryCourses.reduce((a, c) => a + c.students, 0);
  const avgRating = categoryCourses.reduce((a, c) => a + c.rating, 0) / (categoryCourses.length || 1);

  const filteredCourses = useMemo(() => {
    let result = [...categoryCourses];
    if (levelFilter !== "All") result = result.filter((c) => c.level === levelFilter);
    if (search.trim()) result = result.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.name.toLowerCase().includes(search.toLowerCase())
    );
    switch (sortBy) {
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "students": result.sort((a, b) => b.students - a.students); break;
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "newest": result.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)); break;
    }
    return result;
  }, [categoryCourses, levelFilter, sortBy, search]);

  const visibleInstructors = showAllInstructors ? categoryInstructors : categoryInstructors.slice(0, 3);
  const hasFilters = levelFilter !== "All" || search.trim() !== "" || sortBy !== "rating";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080c17]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-20 md:pt-34 bg-white dark:bg-[#0a0c1c]">
        <PageHeroBg color={category.color} />

        <div className="relative max-w-[1280px] mx-auto px-6 pt-10 pb-14">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400
              hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to all categories
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center gap-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42 }}
              className="flex-1"
            >
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-6 shadow-[0_10px_40px_rgba(59,130,246,0.25)]`}>
                <Icon className="w-10 h-10 text-white" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                border border-blue-200 dark:border-blue-900/60
                bg-blue-50 dark:bg-blue-950/30 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                  Category
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                {category.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base max-w-lg leading-relaxed">
                Explore our curated {category.title.toLowerCase()} courses — from beginner fundamentals to advanced mastery, taught by world-class instructors.
              </p>

              <div className="flex flex-wrap gap-2 mt-5">
                {category.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold
                    border border-gray-200 dark:border-white/[0.10]
                    text-gray-600 dark:text-gray-300
                    bg-white/80 dark:bg-white/[0.04]">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3"
            >
              <StatPill icon={BookOpen} label="Courses" value={String(category.courses)} />
              <StatPill icon={Users} label="Students" value={fmt(totalStudents)} />
              <StatPill icon={Star} label="Avg Rating" value={avgRating.toFixed(1)} />
              <StatPill icon={TrendingUp} label="Popularity" value={`${category.popularity}%`} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 pb-24 pt-10">

        {/* ── Courses ─────────────────────────────────────────────────────── */}
        <section className="mb-16">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Courses in{" "}
                <span className="text-blue-600 dark:text-blue-400">{category.title}</span>
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} found
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses..."
                  className="pl-9 pr-8 py-2 rounded-xl text-sm w-44
                    bg-white dark:bg-white/[0.05]
                    border border-gray-200 dark:border-white/[0.08]
                    text-gray-800 dark:text-white
                    placeholder:text-gray-400
                    outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400
                    transition-all"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-semibold
                    bg-white dark:bg-white/[0.05]
                    border border-gray-200 dark:border-white/[0.08]
                    text-gray-700 dark:text-gray-300
                    outline-none cursor-pointer
                    focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400"
                >
                  <option value="rating">Top Rated</option>
                  <option value="students">Most Students</option>
                  <option value="price-low">Price ↑</option>
                  <option value="price-high">Price ↓</option>
                  <option value="newest">Newest</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Grid / List toggle */}
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-white/[0.04]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Level filter pills */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                  ${levelFilter === lvl
                    ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                    : "bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600"
                  }`}
              >
                {lvl}
              </button>
            ))}

            <AnimatePresence>
              {hasFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={() => { setLevelFilter("All"); setSearch(""); setSortBy("rating"); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold
                    border border-red-200 dark:border-red-900/50
                    text-red-500 dark:text-red-400
                    bg-red-50 dark:bg-red-950/20
                    hover:bg-red-100 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Courses */}
          <AnimatePresence mode="wait">
            {filteredCourses.length > 0 ? (
              viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredCourses.map((c, i) => <CourseCardGrid key={c.id} course={c} index={i} />)}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredCourses.map((c, i) => <CourseCardList key={c.id} course={c} index={i} />)}
                  </AnimatePresence>
                </motion.div>
              )
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1">No courses found</h3>
                <p className="text-sm text-gray-400 mb-5">Try adjusting your filters</p>
                <button
                  onClick={() => { setLevelFilter("All"); setSearch(""); setSortBy("rating"); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Instructors ────────────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Meet the{" "}
              <span className="text-blue-600 dark:text-blue-400">Instructors</span>
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {categoryInstructors.length} instructor{categoryInstructors.length !== 1 ? "s" : ""} in this category
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {visibleInstructors.map((inst, i) => (
                <InstructorCard key={inst.id} instructor={inst} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {categoryInstructors.length > 3 && (
            <motion.button
              onClick={() => setShowAllInstructors((p) => !p)}
              className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mx-auto"
            >
              {showAllInstructors ? "Show less" : `Show all ${categoryInstructors.length} instructors`}
              <motion.span animate={{ rotate: showAllInstructors ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </motion.button>
          )}
        </section>

        {/* ── Related categories ─────────────────────────────────────────── */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Related{" "}
              <span className="text-blue-600 dark:text-blue-400">Categories</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories
              .filter((c) => c.id !== category.id)
              .slice(0, 4)
              .map((cat, i) => {
                const CatIcon = cat.icon;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -3 }}
                  >
                    <Link
                      to={`/categories/${cat.id}`}
                      className="flex items-center gap-3 p-4 rounded-2xl
                        bg-white dark:bg-[#0f1420]
                        border border-gray-100 dark:border-white/[0.07]
                        shadow-[0_2px_12px_rgba(0,0,0,0.05)]
                        hover:shadow-[0_0_0_1.5px_rgba(59,130,246,0.3),0_8px_24px_rgba(59,130,246,0.1)]
                        transition-all duration-300 group block"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                        <CatIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate
                          group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {cat.title}
                        </p>
                        <p className="text-xs text-gray-400">{cat.courses} courses</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
}