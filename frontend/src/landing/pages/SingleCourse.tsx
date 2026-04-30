// src/landing/pages/SingleCourse.tsx
import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Star, Clock, BookOpen, Users, ShoppingCart,
  Heart, Share2, CheckCircle2, PlayCircle, ChevronDown,
  Globe, Award, Zap, BarChart3, TrendingUp, Lock, Play, Loader2, AlertCircle,
} from "lucide-react";
import CoursesService from "@/services/course.service";
import ReviewService from "@/services/review.service";
import CartService from "@/services/cart.service";
import WishlistService from "@/services/wishlist.service";
import { useAuth } from "@/context/AuthProvider";

// ─── API Types ────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  position: number;
  duration?: number;
  isPreview?: boolean;
}

interface Section {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface PublicCourse {
  id: string;
  title: string;
  description: string;
  img: string | null;
  price: number;
  level: string;
  certification: string;
  tags: string[];
  badge: string | null;
  totalDuration: number;
  instructorId: string;
  instructorName: string;
  syllabus: string[];
  includes: string[];
  _count: { enrollments: number };
  averageRating: number;
  reviewCount: number;
  sections: Section[];
  totalLectures: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    user: {
      id: string;
      name: string;
      image?: string | null;
    };
  };
  reply?: {
    id: string;
    comment: string;
    isEdited: boolean;
    instructor: {
      id: string;
      user: {
        id: string;
        name: string;
        image?: string | null;
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

interface ReviewsResponse {
  data: Review[];
  meta: { total: number; page: number; limit: number; averageRating: number; ratingBreakdown: Record<string, number> };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

function fmtDuration(s: number) {
  if (!s) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtLessonDuration(s?: number) {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function fmtRelative(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days < 7)  return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

const GRADIENTS = [
  "from-blue-500 to-blue-700", "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-700", "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-600",
];

const AVATAR_COLORS = ["bg-emerald-500","bg-pink-500","bg-violet-500","bg-amber-500","bg-cyan-500"];

function initials(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${sz} ${
          i <= Math.floor(rating) ? "text-amber-400 fill-amber-400"
          : i - rating < 1 ? "text-amber-400 fill-amber-200"
          : "text-gray-300 dark:text-gray-600"
        }`} />
      ))}
    </div>
  );
}

// ─── Curriculum Section ───────────────────────────────────────────────────────

function CurriculumSection({ section, index, open, onToggle }: {
  section: Section; index: number; open: boolean; onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07]">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4
          bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors duration-200">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white text-left">{section.title}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{section.lessons.length} lessons</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {section.lessons.length > 0 ? section.lessons.map(lesson => (
                <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 bg-gray-50/60 dark:bg-black/10">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
                    {lesson.isPreview
                      ? <Play className="w-3.5 h-3.5 text-blue-500" />
                      : <Lock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600" />
                    }
                  </div>
                  <span className={`flex-1 text-sm ${lesson.isPreview ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                    {lesson.title}
                    {lesson.isPreview && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">FREE</span>
                    )}
                  </span>
                  {lesson.duration && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">{fmtLessonDuration(lesson.duration)}</span>
                  )}
                </div>
              )) : (
                <div className="px-5 py-4 text-xs text-gray-400 dark:text-gray-500 italic bg-gray-50/60 dark:bg-black/10">
                  No lessons added yet.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Purchase Card ────────────────────────────────────────────────────────────

function PurchaseCard({ course }: { course: PublicCourse }) {
  const { isStudent, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [added, setAdded] = useState(false);

  const { data: wishlist } = useQuery({
    queryKey: ["wishlist"],
    queryFn: WishlistService.getWishlist,
    enabled: isAuthenticated && isStudent,
  });
  const wishlisted = wishlist?.items.some((i) => i.course.id === course.id) ?? false;

  const [cartError, setCartError] = useState<string | null>(null);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const cartMutation = useMutation({
    mutationFn: () => CartService.addToCart(course.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setCartError(null);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    },
    onError: (err: Error) => {
      setCartError(err.message);
      setTimeout(() => setCartError(null), 4000);
    },
  });

  const wishlistMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (wishlisted) {
        await WishlistService.removeFromWishlist(course.id);
      } else {
        await WishlistService.addToWishlist(course.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      setWishlistError(null);
    },
    onError: (err: Error) => {
      setWishlistError(err.message);
      setTimeout(() => setWishlistError(null), 4000);
    },
  });

  const guard = (fn: () => void) => {
    if (!isAuthenticated || !isStudent) { navigate("/login"); return; }
    fn();
  };

  const origPrice = Math.round(course.price * 1.4 * 100) / 100;
  const discount  = Math.round(((origPrice - course.price) / origPrice) * 100);
  const gradient  = GRADIENTS[0];

  return (
    <div className="rounded-[24px] overflow-hidden bg-white dark:bg-[#0d1a33]
      border border-gray-100 dark:border-white/[0.08] shadow-[0_8px_48px_rgba(0,0,0,0.12)]">
      <div className={`h-3 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-end gap-3">
          <span className="text-4xl font-black text-gray-900 dark:text-white">${course.price.toFixed(2)}</span>
          <div className="flex flex-col pb-1">
            <span className="text-sm text-gray-400 dark:text-gray-500 line-through">${origPrice.toFixed(2)}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{discount}% off</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => guard(() => cartMutation.mutate())}
            disabled={cartMutation.isPending}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
              bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm
              shadow-[0_6px_24px_rgba(59,130,246,0.45)] transition-colors duration-200
              disabled:opacity-70">
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span key="added" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Added to cart!
                </motion.span>
              ) : cartMutation.isPending ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding…
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Add to cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              onClick={() => guard(() => wishlistMutation.mutate())}
              disabled={wishlistMutation.isPending}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border transition-all duration-200 disabled:opacity-70 ${
                wishlisted ? "border-rose-300 dark:border-rose-700 text-rose-500 bg-rose-50 dark:bg-rose-950/30"
                : "border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700"
              }`}>
              {wishlistMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
              }
              {wishlisted ? "Wishlisted" : "Wishlist"}
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold
                border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300
                hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
              <Share2 className="w-4 h-4" /> Share
            </motion.button>
          </div>

          <AnimatePresence>
            {cartError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-xs text-red-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{cartError}
              </motion.p>
            )}
            {wishlistError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-xs text-red-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{wishlistError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

        <div>
          <p className="text-xs font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">This course includes</p>
          <ul className="flex flex-col gap-2.5">
            {[
              { icon: PlayCircle, text: `${fmtDuration(course.totalDuration)} on-demand video` },
              { icon: BookOpen,   text: `${course.totalLectures} lessons` },
              { icon: Globe,      text: "Full lifetime access" },
              { icon: Award,      text: "Certificate of completion" },
              { icon: Zap,        text: "Access on mobile & desktop" },
              ...(course.includes ?? [])
                .filter(inc => inc !== "Certificate of completion")
                .map(inc => ({ icon: CheckCircle2, text: inc })),
            ].map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />{text}
              </li>
            ))}
          </ul>
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { val: fmt(course._count.enrollments), label: "Students" },
            { val: course.averageRating > 0 ? course.averageRating.toFixed(1) : "New", label: "Rating" },
            { val: String(course.totalLectures), label: "Lessons" },
          ].map(({ val, label }) => (
            <div key={label} className="rounded-xl py-2.5 px-1 bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
              <p className="text-base font-black text-gray-900 dark:text-white">{val}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SingleCourse() {
  const { id } = useParams<{ id: string }>();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [openSections, setOpenSections] = useState<number[]>([0]);

  const { data: course, isLoading, isError } = useQuery<PublicCourse>({
    queryKey: ["course-public", id],
    queryFn:  () => CoursesService.findOnePublic(id!) as Promise<PublicCourse>,
    enabled:  !!id,
  });

  const { data: reviewsData } = useQuery<ReviewsResponse>({
    queryKey: ["course-reviews", id],
    queryFn:  () => ReviewService.getCourseReviews(id!, { limit: 5 }) as Promise<ReviewsResponse>,
    enabled:  !!id,
  });

  console.log('reviews data', reviewsData)

  const toggleSection = (i: number) =>
    setOpenSections(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Course not found.</p>
        <Link to="/courses" className="text-blue-500 hover:underline text-sm">Back to courses</Link>
      </div>
    );
  }

  const gradient   = GRADIENTS[0];
  const reviews    = reviewsData?.data ?? [];
  const sortedSections = [...course.sections].sort((a, b) => a.position - b.position);
  const totalLessons   = sortedSections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative overflow-hidden">
        <motion.div style={{ y: heroY }}
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        <motion.div style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-[1380px] mx-auto px-6 pt-32 pb-16">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link to="/courses"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to courses
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1 max-w-2xl">
              {/* Badge + level */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="flex items-center gap-2 mb-4">
                {course.badge && (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide backdrop-blur-sm
                    bg-blue-400/20 border border-blue-400/40 text-blue-200">
                    {course.badge}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide bg-white/15 border border-white/20 text-white/80 backdrop-blur-sm capitalize">
                  {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                {course.title}
              </motion.h1>

              {/* Description */}
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="text-white/75 text-base leading-relaxed mb-6">
                {course.description}
              </motion.p>

              {/* Rating row */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 mb-6">
                {course.averageRating > 0 ? (
                  <div className="flex items-center gap-2">
                    <Stars rating={course.averageRating} size="sm" />
                    <span className="text-amber-300 font-bold text-sm">{course.averageRating.toFixed(1)}</span>
                    <span className="text-white/60 text-sm">({fmt(course.reviewCount)} ratings)</span>
                  </div>
                ) : (
                  <span className="text-white/60 text-sm">No ratings yet</span>
                )}
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Users className="w-4 h-4" />{fmt(course._count.enrollments)} students
                </div>
              </motion.div>

              {/* Meta chips */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="flex flex-wrap gap-2 mb-8">
                {[
                  { icon: Clock,    text: fmtDuration(course.totalDuration) },
                  { icon: BookOpen, text: `${course.totalLectures} lessons` },
                  { icon: BarChart3, text: course.level.charAt(0) + course.level.slice(1).toLowerCase() },
                  { icon: Award,    text: course.certification },
                ].map(({ icon: Ic, text }) => (
                  <span key={text}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                      bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs font-medium">
                    <Ic className="w-3.5 h-3.5" />{text}
                  </span>
                ))}
              </motion.div>

              {/* Instructor mini */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-sm font-black text-white ring-2 ring-white/30 flex-shrink-0">
                  IN
                </div>
                <div>
                  <p className="text-white/60 text-xs">Instructor</p>
                  <Link to={`/instructors/${course.instructorId}`}
                    className="text-white font-bold text-sm hover:underline underline-offset-4 decoration-white/50">
                    {course.instructorName}
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="min-h-screen w-full relative overflow-hidden bg-gray-50/60 py-20 px-10 dark:bg-[#020618]">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59,130,246,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }} />

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Left */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">

            {/* What you'll learn */}
            {(course.syllabus?.length > 0) && (
              <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-[24px] p-7 bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_20px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">What you'll learn</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.syllabus.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Curriculum */}
            <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Course Curriculum</h2>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {totalLessons} lessons · {fmtDuration(course.totalDuration)} total
                </div>
              </div>
              {sortedSections.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {sortedSections.map((section, i) => (
                    <CurriculumSection
                      key={section.id} section={section} index={i}
                      open={openSections.includes(i)} onToggle={() => toggleSection(i)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-100 dark:border-white/[0.07] p-8 text-center text-sm text-gray-400">
                  Curriculum coming soon.
                </div>
              )}
            </motion.section>

            {/* Reviews */}
            <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-[24px] p-7 bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_20px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Student Reviews</h2>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-5xl font-black text-gray-900 dark:text-white leading-none">
                      {course.averageRating > 0 ? course.averageRating.toFixed(1) : "—"}
                    </p>
                    {course.averageRating > 0 && <Stars rating={course.averageRating} size="sm" />}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Course rating</p>
                  </div>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {reviews.map((review, i) => (
                    <motion.div key={review.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-2xl text-sm font-black text-white flex items-center justify-center flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                        {initials(review.student.user.name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{review.student.user.name}</span>
                          <Stars rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{fmtRelative(review.createdAt)}</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-400">No reviews yet. Be the first!</div>
              )}
            </motion.section>
          </div>

          {/* Right — sticky purchase card */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <PurchaseCard course={course} />
              </motion.div>

              {/* Tags */}
              {course.tags.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="mt-4 rounded-[20px] p-5 bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07]">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">Topics covered</p>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map(tag => (
                      <span key={tag}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold
                          border border-gray-200 dark:border-white/[0.10]
                          text-gray-600 dark:text-gray-300 bg-gray-50/80 dark:bg-white/[0.03]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}