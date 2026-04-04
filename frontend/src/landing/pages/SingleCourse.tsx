import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  BookOpen,
  Users,
  ShoppingCart,
  Heart,
  Share2,
  CheckCircle2,
  PlayCircle,
  ChevronDown,
  Globe,
  Award,
  Zap,
  BarChart3,
  Calendar,
  TrendingUp,
  Lock,
  Play,
} from "lucide-react";
import { courses } from "@/data/courses";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatStudents(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}
function formatReviews(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

// ─── Mock curriculum (generated from course data) ─────────────────────────────
function generateCurriculum(_lectures: number, _title: string) {
  const sections = [
    {
      title: "Getting Started",
      lessons: [
        { title: "Welcome & Course Overview", duration: "5:22", free: true },
        { title: "Setting Up Your Environment", duration: "12:10", free: true },
        { title: "Core Concepts Introduction", duration: "18:45", free: false },
      ],
    },
    {
      title: "Foundations",
      lessons: [
        { title: "Understanding the Basics", duration: "22:30", free: false },
        { title: "Your First Project", duration: "34:15", free: false },
        { title: "Common Patterns & Pitfalls", duration: "28:00", free: false },
        { title: "Practice Exercise", duration: "15:40", free: false },
      ],
    },
    {
      title: "Intermediate Techniques",
      lessons: [
        { title: "Advanced Patterns", duration: "41:20", free: false },
        { title: "Real-World Application", duration: "55:00", free: false },
        { title: "Optimisation Strategies", duration: "33:10", free: false },
      ],
    },
    {
      title: "Building Real Projects",
      lessons: [
        { title: "Project Architecture", duration: "48:30", free: false },
        { title: "Implementing Core Features", duration: "62:15", free: false },
        { title: "Testing & Debugging", duration: "37:45", free: false },
        { title: "Deployment & Beyond", duration: "29:00", free: false },
      ],
    },
    {
      title: "Mastery & Beyond",
      lessons: [
        { title: "Expert Tips & Tricks", duration: "44:00", free: false },
        { title: "Industry Best Practices", duration: "31:20", free: false },
        { title: "Final Project Walkthrough", duration: "58:10", free: false },
        { title: "What's Next in Your Journey", duration: "10:05", free: false },
      ],
    },
  ];
  return sections;
}

// Mock what you'll learn
const LEARN_ITEMS = [
  "Build production-ready projects from scratch",
  "Master core concepts with hands-on exercises",
  "Understand real-world industry patterns",
  "Debug and optimise with confidence",
  "Deploy and maintain your work professionally",
  "Apply best practices used at top companies",
  "Write clean, maintainable, scalable code",
  "Pass technical interviews with ease",
];

// Mock reviews
const MOCK_REVIEWS = [
  {
    name: "Olusegun A.",
    avatar: "OA",
    bg: "bg-emerald-500",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely transformed how I approach this subject. The projects are practical and the explanations are crystal clear. Worth every penny.",
  },
  {
    name: "Mei-Ling C.",
    avatar: "ML",
    bg: "bg-pink-500",
    rating: 5,
    date: "1 month ago",
    text: "I've taken many online courses and this is by far the most well-structured one. The instructor has a gift for making complex ideas simple.",
  },
  {
    name: "Tobias R.",
    avatar: "TR",
    bg: "bg-violet-500",
    rating: 4,
    date: "1 month ago",
    text: "Really solid content. A few sections could be trimmed but overall an excellent investment. Highly recommended for anyone serious about levelling up.",
  },
];

// ─── Star renderer ─────────────────────────────────────────────────────────────
function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} ${
            i <= Math.floor(rating)
              ? "text-amber-400 fill-amber-400"
              : i - rating < 1
              ? "text-amber-400 fill-amber-200"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Curriculum Section ───────────────────────────────────────────────────────
function CurriculumSection({
  section,
  index,
  open,
  onToggle,
}: {
  section: ReturnType<typeof generateCurriculum>[0];
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4
          bg-white dark:bg-white/[0.03]
          hover:bg-gray-50 dark:hover:bg-white/[0.05]
          transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white text-left">
            {section.title}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {section.lessons.length} lessons
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {section.lessons.map((lesson, li) => (
                <div
                  key={li}
                  className="flex items-center gap-3 px-5 py-3
                    bg-gray-50/60 dark:bg-black/10"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
                    {lesson.free ? (
                      <Play className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600" />
                    )}
                  </div>
                  <span
                    className={`flex-1 text-sm ${
                      lesson.free
                        ? "text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {lesson.title}
                    {lesson.free && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                        FREE
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                    {lesson.duration}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sticky Purchase Card ─────────────────────────────────────────────────────
function PurchaseCard({ course }: { course: (typeof courses)[0] }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = Math.round(
    ((course.originalPrice - course.price) / course.originalPrice) * 100
  );

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="rounded-[24px] overflow-hidden
      bg-white dark:bg-[#0d1a33]
      border border-gray-100 dark:border-white/[0.08]
      shadow-[0_8px_48px_rgba(0,0,0,0.12)]"
    >
      {/* Gradient preview strip */}
      <div
        className={`h-3 w-full bg-gradient-to-r ${course.thumbnail}`}
      />

      <div className="p-6 flex flex-col gap-5">
        {/* Price block */}
        <div className="flex items-end gap-3">
          <span className="text-4xl font-black text-gray-900 dark:text-white">
            ${course.price.toFixed(2)}
          </span>
          <div className="flex flex-col pb-1">
            <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
              ${course.originalPrice.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {discount}% off
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            className="relative w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
              bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm
              shadow-[0_6px_24px_rgba(59,130,246,0.45)]
              transition-colors duration-200 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Added to cart!
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setWishlisted((p) => !p)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold
                border transition-all duration-200
                ${
                  wishlisted
                    ? "border-rose-300 dark:border-rose-700 text-rose-500 bg-rose-50 dark:bg-rose-950/30"
                    : "border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
            >
              <Heart
                className={`w-4 h-4 transition-all ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`}
              />
              {wishlisted ? "Wishlisted" : "Wishlist"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold
                border border-gray-200 dark:border-white/[0.08]
                text-gray-600 dark:text-gray-300
                hover:border-blue-300 dark:hover:border-blue-700
                transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

        {/* Includes */}
        <div>
          <p className="text-xs font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">
            This course includes
          </p>
          <ul className="flex flex-col gap-2.5">
            {[
              { icon: PlayCircle, text: `${course.duration} on-demand video` },
              { icon: BookOpen, text: `${course.lectures} lectures` },
              { icon: Globe, text: "Full lifetime access" },
              { icon: Award, text: "Certificate of completion" },
              { icon: Zap, text: "Access on mobile & desktop" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { val: formatStudents(course.students), label: "Students" },
            { val: course.rating.toString(), label: "Rating" },
            { val: `${course.lectures}`, label: "Lectures" },
          ].map(({ val, label }) => (
            <div
              key={label}
              className="rounded-xl py-2.5 px-1
                bg-gray-50/80 dark:bg-white/[0.03]
                border border-gray-100 dark:border-white/[0.06]"
            >
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
  const course = courses.find((c) => c.id === id) ?? courses[0];
  const Icon = course.icon;

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [openSections, setOpenSections] = useState<number[]>([0]);
  const curriculum = generateCurriculum(course.lectures, course.title);
//   const discount = Math.round(
//     ((course.originalPrice - course.price) / course.originalPrice) * 100
//   );

  const toggleSection = (i: number) =>
    setOpenSections((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative overflow-hidden">
        {/* Parallax background */}
        <motion.div
          style={{ y: heroY }}
          className={`absolute inset-0 bg-gradient-to-br ${course.thumbnail} opacity-90`}
        />
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />
        {/* Dark gradient bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-[1380px] mx-auto px-6 pt-32 pb-16"
        >
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to courses
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left: info */}
            <div className="flex-1 max-w-2xl">
              {/* Badge + category */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="flex items-center gap-2 mb-4"
              >
                {course.badge && (
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide backdrop-blur-sm
                    ${
                      course.badge === "Bestseller"
                        ? "bg-amber-400/20 border border-amber-400/40 text-amber-200"
                        : course.badge === "Hot & New"
                        ? "bg-rose-400/20 border border-rose-400/40 text-rose-200"
                        : "bg-emerald-400/20 border border-emerald-400/40 text-emerald-200"
                    }`}
                  >
                    {course.badge}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide bg-white/15 border border-white/20 text-white/80 backdrop-blur-sm capitalize">
                  {course.categoryId}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-5xl font-black text-white leading-tight mb-4"
              >
                {course.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="text-white/75 text-base leading-relaxed mb-6"
              >
                {course.description}
              </motion.p>

              {/* Rating row */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 mb-6"
              >
                <div className="flex items-center gap-2">
                  <Stars rating={course.rating} size="sm" />
                  <span className="text-amber-300 font-bold text-sm">{course.rating}</span>
                  <span className="text-white/60 text-sm">
                    ({formatReviews(course.reviews)} ratings)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Users className="w-4 h-4" />
                  {formatStudents(course.students)} students enrolled
                </div>
              </motion.div>

              {/* Meta chips */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="flex flex-wrap gap-2 mb-8"
              >
                {[
                  { icon: Clock, text: course.duration },
                  { icon: BookOpen, text: `${course.lectures} lectures` },
                  { icon: BarChart3, text: course.level },
                  { icon: Calendar, text: `Updated ${course.lastUpdated}` },
                ].map(({ icon: Ic, text }) => (
                  <span
                    key={text}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                      bg-white/10 backdrop-blur-sm border border-white/15
                      text-white/80 text-xs font-medium"
                  >
                    <Ic className="w-3.5 h-3.5" />
                    {text}
                  </span>
                ))}
              </motion.div>

              {/* Instructor */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <span
                  className={`w-10 h-10 rounded-full text-sm font-black text-white flex items-center justify-center flex-shrink-0 ${course.instructor.avatarBg} ring-2 ring-white/30`}
                >
                  {course.instructor.avatar}
                </span>
                <div>
                  <p className="text-white/60 text-xs">Instructor</p>
                  {/* make underline to be white */}
                  <Link to={`/instructor/${course.instructor.id}`} className="hover:underline transition-colors duration-200 underline-offset-4 decoration-white/50">
                    <p className="text-white font-bold text-sm">{course.instructor.name}</p>
                  </Link>
                  <p className="text-white/55 text-xs">{course.instructor.title}</p>
                </div>
              </motion.div>
            </div>

            {/* Right: big icon orb — desktop only */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 120 }}
              className="hidden lg:flex absolute right-[10%] items-center justify-center flex-shrink-0"
            >
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-[40px] bg-white/10 blur-2xl scale-110" />
                <div
                  className="relative w-52 h-52 rounded-[40px] bg-white/15 backdrop-blur-xl
                  border border-white/25 flex items-center justify-center
                  shadow-[0_32px_80px_rgba(0,0,0,0.35)]"
                >
                  <Icon className="w-24 h-24 text-white drop-shadow-2xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="min-h-screen w-full relative overflow-hidden bg-gray-50/60 py-20 px-10 dark:bg-[#020618]">
  {/* subtle blue grid + glow background */}
  <div
    className="absolute inset-0 z-0 pointer-events-none"
    style={{
      backgroundImage: `
        linear-gradient(to right, rgba(59,130,246,0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(59,130,246,0.035) 1px, transparent 1px),
        radial-gradient(circle 600px at 0% 10%, rgba(59,130,246,0.08), transparent 60%),
        radial-gradient(circle 500px at 100% 0%, rgba(96,165,250,0.07), transparent 55%)
      `,
      backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
    }}
  />
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Left column: content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">

            {/* What you'll learn */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-[24px] p-7
                bg-white dark:bg-white/[0.04]
                border border-gray-100 dark:border-white/[0.07]
                shadow-[0_2px_20px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  What you'll learn
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LEARN_ITEMS.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 + i * 0.05 }}
                    className="flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Instructor card */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-[24px] p-7
                bg-white dark:bg-white/[0.04]
                border border-gray-100 dark:border-white/[0.07]
                shadow-[0_2px_20px_rgba(0,0,0,0.05)]"
            >
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                Your Instructor
              </h2>
              <div className="flex items-start gap-5">
                <span
                  className={`w-16 h-16 rounded-2xl text-lg font-black text-white flex items-center justify-center flex-shrink-0 ${course.instructor.avatarBg}`}
                >
                  {course.instructor.avatar}
                </span>
                <div className="flex-1">
                    <Link to={`/instructor/${course.instructor.id}`} className="hover:underline transition-colors duration-200 underline-offset-4 decoration-black/50 dark:decoration-white/50">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white">
                        {course.instructor.name}
                      </h3>
                    </Link>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
                    {course.instructor.title}
                  </p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {[
                      { icon: Star, val: course.instructor.rating, label: "Rating" },
                      { icon: Users, val: formatStudents(course.instructor.students), label: "Students" },
                      { icon: BookOpen, val: course.instructor.courses, label: "Courses" },
                    ].map(({ icon: Ic, val, label }) => (
                      <div key={label} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <Ic className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-bold text-gray-800 dark:text-white">{val}</span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    A world-class educator with years of industry experience, passionate about making
                    complex subjects accessible to everyone. Known for clear explanations, practical
                    projects, and real-world context that helps students land jobs and build things
                    they're proud of.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Curriculum */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Course Curriculum
                </h2>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {curriculum.reduce((acc, s) => acc + s.lessons.length, 0)} lessons ·{" "}
                  {course.duration} total
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {curriculum.map((section, i) => (
                  <CurriculumSection
                    key={i}
                    section={section}
                    index={i}
                    open={openSections.includes(i)}
                    onToggle={() => toggleSection(i)}
                  />
                ))}
              </div>
            </motion.section>

            {/* Reviews */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="rounded-[24px] p-7
                bg-white dark:bg-white/[0.04]
                border border-gray-100 dark:border-white/[0.07]
                shadow-[0_2px_20px_rgba(0,0,0,0.05)]"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Student Reviews
                </h2>
                {/* Summary */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-5xl font-black text-gray-900 dark:text-white leading-none">
                      {course.rating}
                    </p>
                    <Stars rating={course.rating} size="sm" />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Course rating
                    </p>
                  </div>
                  {/* Bar chart */}
                  <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const pct = n === 5 ? 72 : n === 4 ? 18 : n === 3 ? 7 : n === 2 ? 2 : 1;
                      return (
                        <div key={n} className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, delay: 0.3 + (5 - n) * 0.07 }}
                              className="h-full rounded-full bg-amber-400"
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 w-5 text-right tabular-nums">
                            {n}★
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Review cards */}
              <div className="flex flex-col gap-5">
                {MOCK_REVIEWS.map((review, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 + i * 0.08 }}
                    className="flex gap-4"
                  >
                    <span
                      className={`w-10 h-10 rounded-2xl text-sm font-black text-white flex items-center justify-center flex-shrink-0 ${review.bg}`}
                    >
                      {review.avatar}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {review.name}
                        </span>
                        <Stars rating={review.rating} size="sm" />
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                          {review.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {review.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* ── Right column: sticky purchase card ───────────────────────── */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <PurchaseCard course={course} />
              </motion.div>

              {/* Related tags */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
                className="mt-4 rounded-[20px] p-5
                  bg-white dark:bg-white/[0.04]
                  border border-gray-100 dark:border-white/[0.07]"
              >
                <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">
                  Topics covered
                </p>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold
                        border border-gray-200 dark:border-white/[0.10]
                        text-gray-600 dark:text-gray-300
                        bg-gray-50/80 dark:bg-white/[0.03]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}