import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight, Star, Users, BookOpen,
  Globe, Mail, Award, CheckCircle,
  MessageSquare, X, Send, Loader2, Play,
  ChevronDown, ChevronUp,
} from "lucide-react";
import UserService from "@/services/user.service";
import CoursesService from "@/services/course.service";
import ReviewService from "@/services/review.service";
import EnrollmentService from "@/services/enrollment.service";
import { PageHeroBg } from "@/landing/pages/SingleCategory";
import { ApiErrorPage } from "@/components/ui/ApiError";

// ─── Font import ──────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
.font-syne { font-family: 'Syne', system-ui, sans-serif; }
.font-dm { font-family: 'DM Sans', system-ui, sans-serif; }`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-rose-500", "bg-amber-500", "bg-cyan-500",
];

function avatarBg(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 14, interactive = false, onRate }: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? (hovered || Math.round(rating)) : Math.round(rating);
  return (
    <span className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={size} height={size} viewBox="0 0 24 24"
          fill={i + 1 <= display ? "#FFC806" : "#374151"}
          className={interactive ? "cursor-pointer transition-transform hover:scale-110" : ""}
          onMouseEnter={() => interactive && setHovered(i + 1)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(i + 1)}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06] ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080c17]">
      <div className="h-64 bg-white dark:bg-[#0a0c1c] rounded-2xl mx-6 mt-6">
        <div className="max-w-[1120px] mx-auto px-6 pt-10 flex gap-8 items-start">
          <Sk className="w-44 h-44 rounded-[28px] flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-4">
            <Sk className="h-4 w-32" />
            <Sk className="h-10 w-64" />
            <Sk className="h-4 w-48" />
            <Sk className="h-10 w-48" />
          </div>
        </div>
      </div>
      <div className="max-w-[1120px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-5">
          <Sk className="h-48 rounded-[22px]" />
          <Sk className="h-64 rounded-[22px]" />
        </div>
        <div className="space-y-4">
          <Sk className="h-40 rounded-[22px]" />
          <Sk className="h-60 rounded-[22px]" />
        </div>
      </div>
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
interface ReviewModalProps {
  instructorName: string;
  courses: { id: string; title: string }[];
  onClose: () => void;
}

function ReviewModal({ instructorName, courses, onClose }: ReviewModalProps) {
  const qc = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id ?? "");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => ReviewService.create({ courseId: selectedCourse, rating, comment: comment.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-reviews-public"] });
      setDone(true);
    },
    onError: (err: any) => {
      setServerError(err?.message ?? "Could not submit review. Please try again.");
    },
  });

  function handleSubmit() {
    if (!selectedCourse || rating === 0 || isPending) return;
    setServerError("");
    mutate();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
      >
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white mb-1">Review submitted!</p>
            <p className="text-sm text-gray-400">Thanks for sharing your feedback.</p>
            <button onClick={onClose} className="mt-5 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white">Review {instructorName.split(" ")[0]}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">You need to be enrolled in one of this instructor's courses to leave a review.</p>
                <button onClick={onClose} className="mt-4 px-5 py-2 rounded-xl text-sm font-bold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <>
            {/* Course selector */}
            {courses.length > 1 && (
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Course</label>
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 dark:border-white/[0.10] bg-gray-50 dark:bg-white/[0.04] px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Rating */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block">Rating</label>
              <Stars rating={rating} size={28} interactive onRate={setRating} />
              {rating > 0 && (
                <span className="text-xs text-gray-400 mt-1.5 block">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                </span>
              )}
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience..."
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-white/[0.10] bg-gray-50 dark:bg-white/[0.04] px-3 py-2.5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            {serverError && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg px-3 py-2 mb-3">
                {serverError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || !selectedCourse || isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isPending ? "Submitting…" : "Submit Review"}
              </button>
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors">
                Cancel
              </button>
            </div>
              </>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SingleInstructor() {
  const { id } = useParams<{ id: string }>();
  const [showContact, setShowContact] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showAllExpertise, setShowAllExpertise] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: profileRaw, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ["public-user", id],
    queryFn: () => UserService.findOnePublic(id!),
    enabled: !!id,
  });

  const { data: coursesRaw } = useQuery({
    queryKey: ["instructor-courses-public", id],
    queryFn: () => CoursesService.findAll({ instructorId: id, limit: 6 }),
    enabled: !!id,
  });

  const { data: reviewsRaw } = useQuery({
    queryKey: ["instructor-reviews-public", id],
    queryFn: () => ReviewService.getInstructorReviews(id!),
    enabled: !!id,
  });

  const { data: enrollmentsRaw } = useQuery({
    queryKey: ["enrollments-mine"],
    queryFn: () => EnrollmentService.getMine(),
  });

  // ── Normalize ──────────────────────────────────────────────────────────────
  const profile = profileRaw as any;
  const name = profile?.name ?? "Instructor";
  const image = profile?.image ?? null;
  const ip = profile?.instructorProfile ?? {};
  const bio = ip.bio ?? ip.description ?? "";
  const specialization = ip.specialization ?? "";
  const expertise: string[] = ip.areasOfExpertise ?? [];
  const website: string | null = ip.website ?? null;
  const email: string | null = profile?.email ?? null;

  // Reviews — handle { overallAverage, totalReviews, perCourse } or { average, total, ... }
  const reviewsData = reviewsRaw as any;
  const overallRating: number =
    reviewsData?.overallAverage ?? reviewsData?.average ?? reviewsData?.avgRating ?? 0;
  const totalReviews: number =
    reviewsData?.totalReviews ?? reviewsData?.reviewCount ?? reviewsData?.total ?? reviewsData?.count ?? 0;
  const perCourseReviews: { courseId: string; title: string; reviewCount: number; averageRating: number }[] =
    reviewsData?.perCourse ?? [];

  // Courses from API (may be empty if backend doesn't filter by instructorId for students)
  const coursesData = coursesRaw as any;
  const apiCourses: any[] = coursesData?.items ?? (Array.isArray(coursesData) ? coursesData : []);

  // Enrolled courses by this instructor — used for review modal & as fallback display
  const allEnrollments: any[] = Array.isArray(enrollmentsRaw) ? enrollmentsRaw : [];
  const enrolledInstructorCourses = allEnrollments
    .filter((e: any) => e.course?.instructorId === id)
    .map((e: any) => e.course);

  // Prefer API course list if populated; fall back to enrolled
  const courses: any[] = apiCourses.length > 0 ? apiCourses : enrolledInstructorCourses;

  // Total students: from courses or profile stats
  const totalStudents: number =
    courses.reduce((s: number, c: any) => s + (c.enrollmentCount ?? 0), 0) ||
    (profile?.stats?.totalStudents ?? 0);

  const visibleExpertise = showAllExpertise ? expertise : expertise.slice(0, 5);

  // Courses the student can review (enrolled, by this instructor)
  const reviewCourses = enrolledInstructorCourses.length > 0
    ? enrolledInstructorCourses.map((c: any) => ({ id: c.id, title: c.title }))
    : courses.map((c: any) => ({ id: c.id, title: c.title }));

  if (profileLoading) return <PageSkeleton />;
  if (profileError) return <ApiErrorPage onRetry={refetchProfile} message="Failed to load instructor profile." />;

  return (
    <div className="font-dm min-h-screen bg-[#f8fafc] dark:bg-[#080c17]">
      <style>{FONTS}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white rounded-2xl dark:bg-[#0a0c1c]">
        <PageHeroBg />

        <div className="relative max-w-[1120px] mx-auto px-6 pt-10 pb-14">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-[12.5px] text-gray-400 mb-8"
          >
            <Link to="/" className="text-blue-500 hover:underline font-medium">Home</Link>
            <span className="opacity-40">›</span>
            <Link to="/student/instructors" className="text-blue-500 hover:underline font-medium">Instructors</Link>
            <span className="opacity-40">›</span>
            <span className="text-gray-500">{name}</span>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="relative flex-shrink-0"
            >
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[28px] overflow-hidden shadow-[0_8px_32px_rgba(59,130,246,0.22)] border-[3px] border-blue-400/25">
                {image ? (
                  <img src={image} alt={name} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-4xl font-extrabold text-white ${avatarBg(id ?? "0")}`}>
                    {initials(name)}
                  </div>
                )}
              </div>
              <span className="absolute bottom-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-400 border-[2.5px] border-white dark:border-[#0a0c1c] shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            </motion.div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="flex-1 min-w-0"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">Verified Instructor</span>
              </div>

              <h1 className="font-syne text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                {name}
              </h1>
              {specialization && (
                <p className="text-gray-500 dark:text-gray-400 text-sm font-light mb-5 leading-relaxed">{specialization}</p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap gap-5 mb-6">
                {[
                  { icon: Users, n: fmt(totalStudents), l: "Students" },
                  { icon: Star, n: String(totalReviews.toLocaleString()), l: "Reviews" },
                  { icon: BookOpen, n: String(courses.length), l: "Courses" },
                  { icon: Award, n: overallRating > 0 ? overallRating.toFixed(1) : "—", l: "Avg. Rating" },
                ].map(({ icon: Icon, n, l }) => (
                  <div key={l} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-syne text-lg font-extrabold text-gray-900 dark:text-white leading-none">{n}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{l}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2.5">
                <motion.button
                  onClick={() => setShowContact(true)}
                  whileHover={{ y: -2, boxShadow: "0 10px 28px rgba(59,130,246,0.5)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-semibold shadow-[0_4px_18px_rgba(59,130,246,0.38)] transition-shadow"
                >
                  <Mail className="w-3.5 h-3.5" /> Contact Instructor
                </motion.button>

                <motion.button
                  onClick={() => setShowReview(true)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 dark:border-white/[0.10] text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-all bg-white/50 dark:bg-white/[0.03]"
                >
                  <Star className="w-3.5 h-3.5" /> Write a Review
                </motion.button>

                {website && (
                  <motion.a
                    href={website} target="_blank" rel="noopener noreferrer"
                    whileHover={{ y: -1 }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 dark:border-white/[0.10] text-gray-600 dark:text-gray-300 text-sm font-medium capitalize hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-all bg-white/50 dark:bg-white/[0.03]"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-200/40 dark:via-blue-800/20 to-transparent" />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-[1120px] mx-auto px-6 py-12 pb-24 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">

        {/* ── Left: main ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-7">

          {/* About */}
          {bio && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="rounded-[22px] p-7 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="4" r="2.5" stroke="white" strokeWidth="1.4" />
                    <path d="M1.5 12c0-2.76 2.239-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="font-syne text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                  About {name.split(" ")[0]}
                </h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-gray-500 dark:text-gray-400">{bio}</p>
            </motion.div>
          )}

          {/* Expertise */}
          {expertise.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              className="rounded-[22px] p-7 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
                  <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
                </div>
                <h2 className="font-syne text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Areas of Expertise</h2>
              </div>
              <ul className="flex flex-col gap-2">
                <AnimatePresence>
                  {visibleExpertise.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-blue-50 dark:border-blue-900/20 bg-blue-50/50 dark:bg-blue-950/10 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-100 dark:hover:border-blue-800/40 transition-all cursor-default"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" strokeWidth={2} />
                      {item}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              {expertise.length > 5 && (
                <button
                  onClick={() => setShowAllExpertise(p => !p)}
                  className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {showAllExpertise ? (
                    <><ChevronUp className="w-4 h-4" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> Show all {expertise.length} skills</>
                  )}
                </button>
              )}
            </motion.div>
          )}

          {/* Per-course ratings */}
          {perCourseReviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-[22px] p-7 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <h2 className="font-syne text-lg font-extrabold text-gray-900 dark:text-white tracking-tight mb-5">Course Ratings</h2>
              <div className="flex flex-col gap-3">
                {perCourseReviews.map(c => (
                  <div key={c.courseId} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 min-w-0 truncate">{c.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Stars rating={c.averageRating} size={12} />
                      <span className="text-xs font-bold text-amber-500">{c.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({c.reviewCount})</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Right: sidebar ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-[22px] p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">At a Glance</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { n: fmt(totalStudents), s: "", l: "Students" },
                { n: totalReviews.toLocaleString(), s: "", l: "Reviews" },
                { n: String(courses.length), s: "", l: "Courses" },
                { n: overallRating > 0 ? overallRating.toFixed(1) : "—", s: overallRating > 0 ? "★" : "", l: "Rating" },
              ].map(({ n, s, l }) => (
                <div key={l} className="flex flex-col items-center py-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                  <div className="font-syne text-2xl font-extrabold text-gray-900 dark:text-white leading-none">
                    {n}<span className="text-blue-500 dark:text-blue-400">{s}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Overall rating */}
          {overallRating > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="rounded-[22px] p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">Student Rating</p>
              <div className="flex items-center gap-3">
                <span className="font-syne text-5xl font-extrabold text-gray-900 dark:text-white leading-none">
                  {overallRating.toFixed(1)}
                </span>
                <div>
                  <Stars rating={overallRating} size={15} />
                  <p className="text-[11px] text-gray-400 mt-1">Based on {totalReviews.toLocaleString()} reviews</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Courses */}
          {courses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="rounded-[22px] p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">Their Courses</p>
              <div className="flex flex-col gap-3">
                {courses.slice(0, 4).map((c: any) => (
                  <Link
                    key={c.id}
                    to={`/courses/${c.id}`}
                    className="flex gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07] hover:border-blue-200 dark:hover:border-blue-800/50 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {c.img ? (
                        <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {c.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {c.averageRating > 0 && (
                          <>
                            <Stars rating={c.averageRating} size={10} />
                            <span className="text-[10px] font-bold text-amber-500">{c.averageRating.toFixed(1)}</span>
                          </>
                        )}
                        {c.enrollmentCount > 0 && (
                          <span className="text-[10px] text-gray-400">{fmt(c.enrollmentCount)} students</span>
                        )}
                      </div>
                      <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-1">
                        {c.price === 0 ? "Free" : `$${c.price}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="rounded-[22px] p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">Connect</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowContact(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full border border-gray-100 dark:border-white/[0.07] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all group">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                Send Message
                <span className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">›</span>
              </button>
              <button onClick={() => setShowReview(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full border border-gray-100 dark:border-white/[0.07] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all group">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <Star className="w-3.5 h-3.5" />
                </div>
                Write a Review
                <span className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">›</span>
              </button>
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full border border-gray-100 dark:border-white/[0.07] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all group">
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  Website
                  <ArrowRight className="ml-auto w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowContact(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Email {name.split(" ")[0]}?</p>
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">{email ?? "No email on file"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {email ? (
                  <a href={`mailto:${email}`} onClick={() => setShowContact(false)}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                    Open Email
                  </a>
                ) : (
                  <span className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-white/[0.05] text-gray-400 cursor-not-allowed">
                    No email available
                  </span>
                )}
                <button onClick={() => setShowContact(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showReview && (
          <ReviewModal
            instructorName={name}
            courses={reviewCourses}
            onClose={() => setShowReview(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
