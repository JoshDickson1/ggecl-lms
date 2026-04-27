// src/dashboards/instructor-dashboard/pages/InstructorReviews.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Search, Filter, MessageSquare, Send, X,
  TrendingUp, Award, BarChart2, ChevronDown, Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import InstructorDashboardService, {
  type RecentReviewItem,
} from "@/services/instructor-dashboard.service";
import ReviewService from "@/services/review.service";
import { useDashboardUser } from "@/hooks/useDashboardUser";

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
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sz} transition-colors ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
      ))}
    </div>
  );
}

function avatar(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-red-500 to-pink-600",
  "from-teal-500 to-cyan-600",
  "from-amber-500 to-orange-600",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// ─── Reply Modal ──────────────────────────────────────────────────────────────

function ReplyModal({ review, onClose }: { review: RecentReviewItem; onClose: () => void }) {
  const qc = useQueryClient();
  const [text, setText] = useState(review.reply?.comment ?? "");
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const hasReply = !!review.reply;

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      hasReply
        ? ReviewService.updateReply(review.reply!.id, { comment: text.trim() })
        : InstructorDashboardService.postReply(review.id, text.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-reviews"] });
      qc.invalidateQueries({ queryKey: ["instructor-recent-reviews"] });
      setServerError(null);
      setDone(true);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setServerError(msg);
    },
  });

  const handleSubmit = () => {
    if (!text.trim() || isPending) return;
    setServerError(null);
    mutate();
  };

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
        {!done ? (
          <>
            <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.07]">
              <p className="text-xs text-gray-400 mb-0.5">{hasReply ? "Edit your reply" : "Reply to review"}</p>
              <h3 className="font-black text-gray-900 dark:text-white">{review.student.name}</h3>
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Stars rating={review.rating} />
                <span className="text-xs text-gray-400">{fmtDate(review.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{review.comment}</p>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your reply</p>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setServerError(null); }}
                placeholder="Thank the student and address any feedback they mentioned…"
                rows={4}
                maxLength={600}
                className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{text.length}/600</p>

              {serverError && (
                <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                  <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{serverError}</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || isPending}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {hasReply ? "Update Reply" : "Post Reply"}
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">{hasReply ? "Reply updated!" : "Reply posted!"}</h3>
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

function ReviewCard({ review, index, onReply, instructorName, instructorAvatar }: { 
  review: RecentReviewItem; 
  index: number; 
  onReply: (r: RecentReviewItem) => void;
  instructorName: string;
  instructorAvatar?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.comment.length > 200;
  const color = avatarColor(review.student.name);
  const initials = review.student.avatar ? undefined : avatar(review.student.name);
  const instructorInitials = avatar(instructorName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-3">
          {review.student.avatar ? (
            <img src={review.student.avatar} alt={review.student.name} className="w-11 h-11 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center font-black text-sm flex-shrink-0`}>
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm">{review.student.name}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Stars rating={review.rating} />
              <span className="text-[11px] text-gray-400">{fmtDate(review.createdAt)}</span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/30 truncate max-w-[180px]">
                {review.course.title}
              </span>
            </div>
          </div>
        </div>

        <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}>
          {review.comment}
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

        {review.reply && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 ml-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800/50"
          >
            <div className="flex items-center gap-2 mb-1.5">
              {instructorAvatar ? (
                <img src={instructorAvatar} alt={instructorName} className="w-6 h-6 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">{instructorInitials}</span>
                </div>
              )}
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {instructorName} · {fmtDate(review.reply.createdAt)}
                {review.reply.isEdited && <span className="ml-1 font-normal text-gray-400">(edited)</span>}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{review.reply.comment}</p>
          </motion.div>
        )}

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50 dark:border-white/[0.04]">
          <button
            onClick={() => onReply(review)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {review.reply ? "Edit Reply" : "Reply"}
          </button>
          {!review.reply && (
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
  const { user } = useDashboardUser();
  const [search, setSearch]             = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedRating, setSelectedRating] = useState(0);
  const [replyTarget, setReplyTarget]   = useState<RecentReviewItem | null>(null);

  const instructorName = user ? `${user.firstName} ${user.lastName}` : "Instructor";
  const instructorAvatar = user?.avatarUrl;

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["instructor-reviews"],
    queryFn: () => InstructorDashboardService.getRecentReviews(100),
    staleTime: 1000 * 60 * 2,
  });

  const { data: summary } = useQuery({
    queryKey: ["instructor-summary"],
    queryFn: () => InstructorDashboardService.getSummary(),
    staleTime: 1000 * 60 * 5,
  });

  const avgReviews = summary?.avgReviews;
  const overallAvg = ((Number(avgReviews?.overallAverage) || 0)).toFixed(1);
  const totalReviews = avgReviews?.totalReviews ?? reviews.length;

  const ratingBreakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => r.rating === star).length;
      const pct = reviews.length > 0 ? Math.round(((count || 0) / reviews.length) * 100) || 0 : 0;
      return { star, count, pct };
    });
  }, [reviews]);

  const unreplied = reviews.filter((r) => !r.reply).length;
  const fiveStar  = reviews.filter((r) => r.rating === 5).length;
  const replyRate = reviews.length > 0
    ? Math.round(((reviews.filter((r) => r.reply).length || 0) / reviews.length) * 100) || 0
    : 0;

  const courses = useMemo(() => {
    const seen = new Map<string, string>();
    reviews.forEach((r) => seen.set(r.course.id, r.course.title));
    return [{ id: "all", title: "All Courses" }, ...Array.from(seen, ([id, title]) => ({ id, title }))];
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch  = !search || r.student.name.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase());
      const matchCourse  = selectedCourse === "all" || r.course.id === selectedCourse;
      const matchRating  = selectedRating === 0 || r.rating === selectedRating;
      return matchSearch && matchCourse && matchRating;
    });
  }, [reviews, search, selectedCourse, selectedRating]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {replyTarget && (
          <ReplyModal review={replyTarget} onClose={() => setReplyTarget(null)} />
        )}
      </AnimatePresence>

      <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Reviews</h1>
          <p className="text-sm text-gray-400 mt-0.5">{totalReviews} reviews across {courses.length - 1} courses</p>
        </motion.div>

        {/* Summary row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Overall rating */}
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <p className="text-5xl font-black text-gray-900 dark:text-white leading-none">{overallAvg}</p>
                  <div className="mt-2"><Stars rating={Math.round(Number(overallAvg))} size="md" /></div>
                  <p className="text-xs text-gray-400 mt-1.5">{totalReviews} total reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingBreakdown.map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-2">{star}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: (6 - star) * 0.06 }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 w-6 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Pending replies */}
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
                  All caught up! You've replied to every review.
                </p>
              )}
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: TrendingUp, value: `${overallAvg}★`,  label: "Avg Rating",    color: "bg-gradient-to-br from-amber-400 to-orange-500"   },
                { icon: MessageSquare, value: `${replyRate}%`, label: "Reply rate",    color: "bg-gradient-to-br from-blue-500 to-blue-600"       },
                { icon: Award, value: fiveStar,                label: "5-star reviews", color: "bg-gradient-to-br from-emerald-500 to-teal-600"   },
                { icon: BarChart2, value: totalReviews,        label: "Total reviews", color: "bg-gradient-to-br from-violet-500 to-purple-600"   },
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

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
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

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
                <button
                  onClick={() => setSelectedRating(0)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedRating === 0 ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((n) => (
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

        {/* Review list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((review, i) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  index={i} 
                  onReply={setReplyTarget}
                  instructorName={instructorName}
                  instructorAvatar={instructorAvatar}
                />
              ))
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="py-16 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                    <Star className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {reviews.length === 0 ? "No reviews yet" : "No reviews match your filters"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {reviews.length === 0
                      ? "Reviews will appear here once students rate your courses."
                      : "Try clearing your search or adjusting the filters above."}
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filtered.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-400 text-center">
            Showing <span className="font-bold text-gray-600 dark:text-gray-300">{filtered.length}</span> of {reviews.length} reviews
          </motion.p>
        )}
      </div>
    </>
  );
}
