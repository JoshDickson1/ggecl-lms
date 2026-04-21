// src/landing/_components/CoursesPreview.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Star, Clock, BookOpen, ShoppingCart, Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { type Course } from "@/data/courses";
import CoursesService from "@/services/course.service";
import { Code } from "lucide-react";

// ─── API DTOs (mirror backend shape exactly) ──────────────────────────────────

interface PublicCourseDto {
  id: string;
  title: string;
  description: string;
  img: string | null;
  price: number;
  level: string;
  tags: string[];
  badge: string | null;
  totalDuration: number;
  instructorId: string;
  _count: { enrollments: number };
  averageRating: number;
  reviewCount: number;
  totalLectures: number;
}

/**
 * The backend may return:
 *   (a) { items: PublicCourseDto[], nextCursor: string | null }
 *   (b) PublicCourseDto[]   ← plain array (older endpoint shape)
 *   (c) { data: PublicCourseDto[] } ← some backends wrap in data
 *
 * We normalize all of them in the queryFn so the component
 * only ever sees a clean PublicCourseDto[].
 */
type RawApiResponse =
  | { items: PublicCourseDto[]; nextCursor?: string | null }
  | { data: PublicCourseDto[] }
  | PublicCourseDto[];

function extractCourses(raw: RawApiResponse): PublicCourseDto[] {
  if (Array.isArray(raw)) return raw;
  if ("items" in raw && Array.isArray(raw.items)) return raw.items;
  if ("data"  in raw && Array.isArray(raw.data))  return raw.data;
  // Unexpected shape — fail loudly in dev, gracefully in prod
  console.error("[CoursesPreview] Unexpected API response shape:", raw);
  return [];
}

// ─── Domain model (what the UI consumes) ─────────────────────────────────────

// Re-use the existing Course type from your data layer — no duplication.

// ─── Mapping ──────────────────────────────────────────────────────────────────

const THUMBNAIL_GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-700",
  "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-indigo-500 to-blue-700",
  "from-fuchsia-500 to-purple-700",
];

function fmtDuration(seconds: number): string {
  if (!seconds) return "0h";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function mapDtoToCourse(dto: PublicCourseDto, index: number): Course {
  return {
    id:            dto.id,
    title:         dto.title,
    description:   dto.description,
    thumbnail:     THUMBNAIL_GRADIENTS[index % THUMBNAIL_GRADIENTS.length],
    icon:          Code,
    price:         dto.price,
    originalPrice: Math.round(dto.price * 1.4 * 100) / 100,
    badge:         (dto.badge as Course["badge"]) ?? undefined,
    level:         (dto.level.charAt(0) + dto.level.slice(1).toLowerCase()) as Course["level"],
    rating:        dto.averageRating > 0 ? Number(dto.averageRating.toFixed(1)) : 0,
    reviews:       dto.reviewCount,
    students:      dto._count.enrollments,
    duration:      fmtDuration(dto.totalDuration),
    lectures:      dto.totalLectures,
    lastUpdated:   "",
    categoryId:    "",
    tags:          dto.tags ?? [],
    instructor: {
      id:       dto.instructorId,
      name:     "Instructor",
      avatar:   "IN",
      avatarBg: "bg-blue-500",
      title:    "",
      rating:   0,
      students: 0,
      courses:  0,
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    Bestseller: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60",
    "Hot & New": "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60",
    Hot:        "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60",
    New:        "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60",
    Popular:    "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60",
  };
  const style = styles[badge] ?? "bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700/60";
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide ${style}`}>
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
          style={{ background: "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.09) 0%, transparent 65%)" }}
        />

        {/* Thumbnail */}
        <div className={`relative w-full h-44 bg-gradient-to-br ${course.thumbnail} flex items-center justify-center overflow-hidden`}>
          <motion.div
            animate={hovered ? { scale: 1.12, rotate: 6 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <Icon className="w-8 h-8 text-white drop-shadow-lg" />
          </motion.div>
          {course.badge && (
            <div className="absolute top-3 left-3">
              <CourseBadge badge={course.badge} />
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-white text-[11px] font-bold">
              -{discount}%
            </div>
          )}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm text-white text-[11px] font-semibold">
            {course.level}
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-col gap-3 p-5">
          {/* Instructor */}
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0 ${course.instructor.avatarBg}`}>
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
              {course.rating > 0 ? course.rating : "New"}
            </span>
            {course.reviews > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({formatReviews(course.reviews)})
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            {course.duration !== "0h" && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.duration}
              </span>
            )}
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
          {course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {course.tags.slice(0, 2).map((tag) => (
                <span key={tag}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                    border border-gray-200 dark:border-white/[0.10]
                    text-gray-500 dark:text-gray-400
                    bg-gray-50 dark:bg-white/[0.03]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Price + Add — OUTSIDE the card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: index * 0.06 + 0.1, ease: "easeOut" }}
        className="flex items-center justify-between px-1 pt-3 pb-1"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-gray-900 dark:text-white">
            ${course.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
            ${course.originalPrice.toFixed(2)}
          </span>
        </div>
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col gap-3">
      <div className="rounded-[22px] overflow-hidden bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07]">
        <div className="h-44 animate-pulse bg-gray-100 dark:bg-white/[0.06]" />
        <div className="p-5 space-y-3">
          <div className="h-4 w-4/5 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
          <div className="h-3 w-1/3 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
          <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
        </div>
      </div>
      <div className="flex justify-between px-1">
        <div className="h-5 w-16 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
        <div className="h-8 w-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06]" />
      </div>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const PREVIEW_COUNT = 8;

export default function CoursesPreview() {
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["courses-public-preview"],
    queryFn: async (): Promise<Course[]> => {
      // CoursesService.findAllPublic() may return several different shapes
      // depending on the backend version. We normalize before returning so
      // the component always gets a plain Course[].
      const raw = await CoursesService.findAllPublic() as RawApiResponse;
      return extractCourses(raw).slice(0, PREVIEW_COUNT).map(mapDtoToCourse);
    },
    staleTime: 1000 * 60 * 10,
  });

  return (
    <section className="py-20 bg-white dark:bg-[#080d18]">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              border border-blue-200 dark:border-blue-900/60
              bg-blue-50 dark:bg-blue-950/30 mb-4">
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
          {isLoading
            ? Array.from({ length: PREVIEW_COUNT }).map((_, i) => <CardSkeleton key={i} index={i} />)
            : courses.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)
          }
        </div>
      </div>
    </section>
  );
}