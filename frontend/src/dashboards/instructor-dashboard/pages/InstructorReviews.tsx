// src/dashboards/instructor/pages/InstructorReviews.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  Filter,
  ThumbsUp,
  MessageSquare,
  Send,
  X,
  TrendingUp,
  Award,
  BarChart2,
  ChevronDown,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const COURSES = [
  { id: "all", title: "All Courses" },
  { id: "c1", title: "Advanced React & System Design" },
  { id: "c2", title: "Backend Engineering with Node.js" },
  { id: "c3", title: "Mastering TypeScript for Scale" },
];

const REVIEWS = [
  {
    id: "r1",
    courseId: "c1",
    courseName: "Advanced React & System Design",
    student: { name: "Olusegun Adeyemi", avatar: "OA", color: "bg-gradient-to-br from-emerald-500 to-teal-600", location: "Lagos, NG" },
    rating: 5,
    text: "Exceptional teaching style. Clear explanations and practical projects that actually prepare you for real work. The system design module alone was worth every penny — I got two interview callbacks referencing exactly what I learned here.",
    date: "March 15, 2025",
    helpful: 24,
    replied: true,
    reply: "Thank you so much Olusegun! It's incredibly rewarding to hear the system design content helped you in interviews. Keep pushing — you're doing great work!",
    replyDate: "March 16, 2025",
  },
  {
    id: "r2",
    courseId: "c2",
    courseName: "Backend Engineering with Node.js",
    student: { name: "Mei-Ling Chen", avatar: "MC", color: "bg-gradient-to-br from-pink-500 to-rose-600", location: "Singapore" },
    rating: 5,
    text: "Best structured course I've ever taken. The progression from basics to advanced topics felt natural and I never felt lost. The exercises are perfectly designed — challenging but not overwhelming.",
    date: "February 28, 2025",
    helpful: 18,
    replied: false,
    reply: "",
    replyDate: "",
  },
  {
    id: "r3",
    courseId: "c3",
    courseName: "Mastering TypeScript for Scale",
    student: { name: "Tobias Richter", avatar: "TR", color: "bg-gradient-to-br from-violet-500 to-purple-600", location: "Berlin, DE" },
    rating: 4,
    text: "Excellent content throughout and highly practical. Would have loved a bit more depth on decorators and a few more real-world examples for advanced generics. But overall a fantastic resource I'd recommend to any serious engineer.",
    date: "February 10, 2025",
    helpful: 11,
    replied: true,
    reply: "Really appreciate the detailed feedback Tobias! Decorators are on my roadmap for the next module update — watch for it in the next few weeks.",
    replyDate: "February 11, 2025",
  },
  {
    id: "r4",
    courseId: "c1",
    courseName: "Advanced React & System Design",
    student: { name: "Priya Nair", avatar: "PN", color: "bg-gradient-to-br from-blue-500 to-indigo-600", location: "Mumbai, IN" },
    rating: 5,
    text: "I went from barely understanding hooks to building a complete production app. The way complex concepts are broken down is unmatched. My team lead was impressed with the patterns I brought back from this course.",
    date: "January 30, 2025",
    helpful: 31,
    replied: false,
    reply: "",
    replyDate: "",
  },
  {
    id: "r5",
    courseId: "c2",
    courseName: "Backend Engineering with Node.js",
    student: { name: "Carlos Mendez", avatar: "CM", color: "bg-gradient-to-br from-red-500 to-pink-600", location: "Mexico City, MX" },
    rating: 3,
    text: "Good content but some sections feel rushed. The database section could use more in-depth coverage of indexing strategies. The instructor is clearly knowledgeable — just needs more time on the trickier topics.",
    date: "January 18, 2025",
    helpful: 7,
    replied: true,
    reply: "Thanks for the honest feedback Carlos! I'm recording two new bonus lessons on indexing strategies that will drop next month. I'll make sure to notify you directly.",
    replyDate: "January 19, 2025",
  },
  {
    id: "r6",
    courseId: "c3",
    courseName: "Mastering TypeScript for Scale",
    student: { name: "Yuki Tanaka", avatar: "YT", color: "bg-gradient-to-br from-teal-500 to-cyan-600", location: "Tokyo, JP" },
    rating: 5,
    text: "Completed the entire course in three weeks and immediately refactored our codebase at work. The section on type utilities and mapped types saved us hundreds of hours of debugging. Absolutely essential.",
    date: "December 22, 2024",
    helpful: 42,
    replied: false,
    reply: "",
    replyDate: "",
  },
];

const RATING_BREAKDOWN = [
  { star: 5, count: 4, pct: 67 },
  { star: 4, count: 1, pct: 17 },
  { star: 3, count: 1, pct: 17 },
  { star: 2, count: 0, pct: 0 },
  { star: 1, count: 0, pct: 0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-6 h-6" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} className={`${sz} transition-colors ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
      ))}
    </div>
  );
}

// ─── Reply Modal ──────────────────────────────────────────────────────────────

function ReplyModal({
  review,
  onClose,
}: {
  review: typeof REVIEWS[0];
  onClose: () => void;
}) {
  const [text, setText] = useState(review.reply || "");
  const [submitted, setSubmitted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-lg bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.07]">
              <p className="text-xs text-gray-400 mb-0.5">{review.replied ? "Edit your reply" : "Reply to review"}</p>
              <h3 className="font-black text-gray-900 dark:text-white">{review.student.name}</h3>
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Original review (read-only) */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Stars rating={review.rating} />
                <span className="text-xs text-gray-400">{review.date}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{review.text}</p>
            </div>

            {/* Reply textarea */}
            <div className="px-6 py-5">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your reply</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Thank the student and address any feedback they mentioned…"
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{text.length}/600</p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                Cancel
              </button>
              <button
                onClick={() => text.trim() && setSubmitted(true)}
                disabled={!text.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {review.replied ? "Update Reply" : "Post Reply"}
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                {review.replied ? "Reply updated!" : "Reply posted!"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your response is now visible to all students.</p>
            </div>
            <button onClick={onClose} className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 transition-all">
              Done
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  index,
  onReply,
}: {
  review: typeof REVIEWS[0];
  index: number;
  onReply: (r: typeof REVIEWS[0]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text.length > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-5">
        {/* Student row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-11 h-11 rounded-2xl ${review.student.color} text-white flex items-center justify-center font-black text-sm flex-shrink-0`}>
            {review.student.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-gray-900 dark:text-white text-sm">{review.student.name}</p>
              <span className="text-[10px] text-gray-400">{review.student.location}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Stars rating={review.rating} />
              <span className="text-[11px] text-gray-400">{review.date}</span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/30 truncate max-w-[160px]">
                {review.courseName}
              </span>
            </div>
          </div>

          {/* Helpful count */}
          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            <ThumbsUp className="w-3.5 h-3.5" />
            {review.helpful}
          </div>
        </div>

        {/* Review text */}
        <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}>
          {review.text}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="mt-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            {expanded ? "Show less" : "Read more"}
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3 h-3" />
            </motion.span>
          </button>
        )}

        {/* Instructor reply */}
        {review.replied && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 ml-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800/50"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-black">ME</span>
              </div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Instructor · {review.replyDate}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{review.reply}</p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50 dark:border-white/[0.04]">
          <button
            onClick={() => onReply(review)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border
              text-blue-600 dark:text-blue-400
              border-blue-100 dark:border-blue-900/30
              bg-blue-50 dark:bg-blue-900/10
              hover:bg-blue-100 dark:hover:bg-blue-900/20"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {review.replied ? "Edit Reply" : "Reply"}
          </button>
          {!review.replied && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 px-2 py-1 rounded-lg font-bold">
              Awaiting reply
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorReviews() {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedRating, setSelectedRating] = useState(0);
  const [replyTarget, setReplyTarget] = useState<typeof REVIEWS[0] | null>(null);

  const avgRating = (REVIEWS.reduce((a, r) => a + r.rating, 0) / REVIEWS.length).toFixed(1);
  const unreplied = REVIEWS.filter((r) => !r.replied).length;
  const totalHelpful = REVIEWS.reduce((a, r) => a + r.helpful, 0);

  const filtered = useMemo(() => {
    return REVIEWS.filter((r) => {
      const matchSearch = !search || r.student.name.toLowerCase().includes(search.toLowerCase()) || r.text.toLowerCase().includes(search.toLowerCase());
      const matchCourse = selectedCourse === "all" || r.courseId === selectedCourse;
      const matchRating = selectedRating === 0 || r.rating === selectedRating;
      return matchSearch && matchCourse && matchRating;
    }).sort((a, b) => b.helpful - a.helpful);
  }, [search, selectedCourse, selectedRating]);

  return (
    <>
      <AnimatePresence>
        {replyTarget && (
          <ReplyModal review={replyTarget} onClose={() => setReplyTarget(null)} />
        )}
      </AnimatePresence>

      <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Reviews</h1>
          <p className="text-sm text-gray-400 mt-0.5">{REVIEWS.length} reviews across {COURSES.length - 1} courses</p>
        </motion.div>

        {/* ── Summary row ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Overall rating */}
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <p className="text-5xl font-black text-gray-900 dark:text-white leading-none">{avgRating}</p>
                  <div className="mt-2"><Stars rating={Math.round(Number(avgRating))} size="md" /></div>
                  <p className="text-xs text-gray-400 mt-1.5">{REVIEWS.length} total reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {RATING_BREAKDOWN.map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-2">{star}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: star * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 w-6 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Pending replies CTA */}
            <Card className={`p-5 ${unreplied > 0 ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900/30" : ""}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${unreplied > 0 ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-emerald-500 to-teal-600"}`}>
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{unreplied}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Awaiting your reply</p>
                </div>
              </div>
              {unreplied > 0 ? (
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  Replying to reviews builds trust with prospective students and boosts your course ranking.
                </p>
              ) : (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  All caught up! You've replied to every review. Great engagement.
                </p>
              )}
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: TrendingUp, value: `${avgRating}★`, label: "Avg Rating", color: "bg-gradient-to-br from-amber-400 to-orange-500" },
                { icon: ThumbsUp, value: totalHelpful, label: "Helpful votes", color: "bg-gradient-to-br from-blue-500 to-blue-600" },
                { icon: Award, value: REVIEWS.filter((r) => r.rating === 5).length, label: "5-star reviews", color: "bg-gradient-to-br from-emerald-500 to-teal-600" },
                { icon: BarChart2, value: `${Math.round((REVIEWS.filter((r) => r.replied).length / REVIEWS.length) * 100)}%`, label: "Reply rate", color: "bg-gradient-to-br from-violet-500 to-purple-600" },
              ].map(({ icon: Icon, value, label, color }) => (
                <Card key={label} className="p-3.5 flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900 dark:text-white leading-tight">{value}</p>
                    <p className="text-[10px] text-gray-400">{label}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student or keyword…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>

              {/* Course filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                >
                  {COURSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* Star filter */}
              <div className="flex gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
                <button
                  onClick={() => setSelectedRating(0)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedRating === 0 ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                >
                  All
                </button>
                {[5,4,3,2,1].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSelectedRating(n === selectedRating ? 0 : n)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-0.5 ${selectedRating === n ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                  >
                    {n}<Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Review list ── */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((review, i) => (
                <ReviewCard key={review.id} review={review} index={i} onReply={setReplyTarget} />
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="py-16 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                    <Star className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No reviews match your filters</p>
                  <p className="text-xs text-gray-400">Try clearing your search or adjusting the filters above.</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result count footer */}
        {filtered.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-400 text-center">
            Showing <span className="font-bold text-gray-600 dark:text-gray-300">{filtered.length}</span> of {REVIEWS.length} reviews
          </motion.p>
        )}
      </div>
    </>
  );
}