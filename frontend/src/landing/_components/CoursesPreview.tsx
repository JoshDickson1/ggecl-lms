import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  Clock,
  BookOpen,
  ShoppingCart,
  Users,
} from "lucide-react";
import { courses, type Course } from "@/data/courses";
import { Link } from "react-router-dom";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatStudents(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

function formatReviews(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function CourseBadge({ badge }: { badge: Course["badge"] }) {
  if (!badge) return null;
  const styles: Record<string, string> = {
    Bestseller:
      "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60",
    "Hot & New":
      "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60",
    New: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide ${styles[badge]}`}
    >
      {badge}
    </span>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, index }: { course: Course; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = course.icon;
  const discount = Math.round(
    ((course.originalPrice - course.price) / course.originalPrice) * 100
  );

  return (
    <div className="flex flex-col">
      {/* Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: index * 0.06, ease: "easeOut" }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="relative flex flex-col rounded-[22px] overflow-hidden cursor-pointer
          bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          transition-shadow duration-300"
        style={{
          boxShadow: hovered
            ? "0 0 0 1.5px rgba(59,130,246,0.42), 0 10px 44px rgba(59,130,246,0.16)"
            : "0 2px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Hover glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 rounded-[22px]"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.09) 0%, transparent 65%)",
          }}
        />

        {/* Thumbnail */}
        <div
          className={`relative w-full h-44 bg-gradient-to-br ${course.thumbnail} flex items-center justify-center overflow-hidden`}
        >
          <motion.div
            animate={hovered ? { scale: 1.12, rotate: 6 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <Icon className="w-8 h-8 text-white drop-shadow-lg" />
          </motion.div>

          {/* Badge overlay */}
          {course.badge && (
            <div className="absolute top-3 left-3">
              <CourseBadge badge={course.badge} />
            </div>
          )}

          {/* Discount pill */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-white text-[11px] font-bold">
            -{discount}%
          </div>

          {/* Level pill */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm text-white text-[11px] font-semibold">
            {course.level}
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-col gap-3 p-5">
          {/* Instructor */}
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0 ${course.instructor.avatarBg}`}
            >
              {course.instructor.avatar}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {course.instructor.name}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {course.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-800 dark:text-white">
              {course.rating}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({formatReviews(course.reviews)})
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.lectures} lectures
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatStudents(course.students)}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {course.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                  border border-gray-200 dark:border-white/[0.10]
                  text-gray-500 dark:text-gray-400
                  bg-gray-50 dark:bg-white/[0.03]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Price + Add button — OUTSIDE the card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: index * 0.06 + 0.1, ease: "easeOut" }}
        className="flex items-center justify-between px-1 pt-3 pb-1"
      >
        {/* Pricing */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-gray-900 dark:text-white">
            ${course.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
            ${course.originalPrice.toFixed(2)}
          </span>
        </div>

        {/* Add button */}
        <Link to={`/courses/${course.id}`}>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
              bg-blue-600 hover:bg-blue-500 text-white
              shadow-[0_4px_14px_rgba(59,130,246,0.35)]
              transition-colors duration-200"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
const PREVIEW_COUNT = 8;

export default function CoursesPreview() {
  const preview = courses.slice(0, PREVIEW_COUNT);

  return (
    <section className="py-20 bg-white dark:bg-[#080d18]">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-14">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              border border-blue-200 dark:border-blue-900/60
              bg-blue-50 dark:bg-blue-950/30 mb-4"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                Curated for you
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              Top{" "}
              <span className="text-blue-600 dark:text-blue-400">Courses</span>
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-sm">
              Hand-picked by our instructors to kickstart your learning journey.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/courses"
              className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-full
                bg-blue-600 hover:bg-blue-500
                text-white text-sm font-semibold
                shadow-[0_4px_20px_rgba(59,130,246,0.4)]
                transition-colors duration-200"
            >
              Browse all courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-6">
          {preview.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}