// src/dashboards/shared/PreviewInstructor.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Globe,
  Mail,
  Play,
  X,
  Send,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  ChevronRight,
  Link,
  Edit3,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import UserService from "@/services/user.service";

interface ApiUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  createdAt: string;
  instructorProfile?: {
    bio?: string | null;
    description?: string | null;
    specialization?: string | null;
    website?: string | null;
    areasOfExpertise?: string[];
  } | null;
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── (data loaded dynamically below) ─────────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────────────────────

const Fade = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_2px_16px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function Stars({
  rating,
  interactive = false,
  onRate,
  size = "sm",
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "lg" ? "w-7 h-7" : size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  const active = interactive ? hovered || rating : rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} transition-colors ${
            interactive ? "cursor-pointer" : ""
          } ${
            i <= active
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 dark:text-gray-700"
          }`}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(i)}
        />
      ))}
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

function ReviewModal({ onClose, name, avatar }: { onClose: () => void; name: string; avatar: string }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!rating || !text.trim()) return;
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-md bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {!submitted ? (
            <>
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.07]">
                <div className="flex items-center gap-3">
                  {/* Instructor mini-avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Reviewing</p>
                    <p className="font-bold text-gray-900 dark:text-white leading-tight">
                      {name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center
                    text-gray-400 hover:text-gray-700 dark:hover:text-white
                    bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1]
                    transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {/* Star rating */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your rating
                  </p>
                  <Stars rating={rating} interactive onRate={setRating} size="lg" />
                  {rating > 0 && (
                    <p className="mt-1.5 text-xs text-blue-500 font-medium">
                      {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
                    </p>
                  )}
                </div>

                {/* Text area */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your review
                  </p>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your experience with this instructor..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm
                      bg-gray-50 dark:bg-white/[0.04]
                      border border-gray-200 dark:border-white/[0.08]
                      text-gray-800 dark:text-gray-200
                      placeholder:text-gray-400 dark:placeholder:text-gray-600
                      focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                      resize-none transition-all"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {text.length}/500
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08]
                    text-sm font-semibold text-gray-600 dark:text-gray-400
                    hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!rating || !text.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white
                    bg-gradient-to-br from-blue-600 to-indigo-700
                    hover:from-blue-500 hover:to-indigo-600
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Review
                </button>
              </div>
            </>
          ) : (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 py-10 flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Review submitted!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Thanks for sharing your feedback with the community.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white
                  bg-gradient-to-br from-blue-600 to-indigo-700
                  hover:from-blue-500 hover:to-indigo-600 transition-all"
              >
                Done
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-black text-gray-900 dark:text-white leading-tight">
          {typeof value === "number" && value > 9999
            ? (value / 1000).toFixed(1) + "k"
            : value}
        </p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PreviewInstructor() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"about" | "courses" | "reviews">("about");
  const [showModal, setShowModal] = useState(false);

  const { data: apiUser, isLoading } = useQuery<ApiUser>({
    queryKey: ["user", id],
    queryFn: async () => UserService.findOne(id!) as Promise<ApiUser>,
    enabled: !!id,
  });

  const profile = apiUser?.instructorProfile;
  const ins = {
    name:           apiUser?.name ?? "Instructor",
    avatar:         initials(apiUser?.name ?? "I"),
    avatarBg:       "bg-gradient-to-br from-blue-600 to-indigo-700",
    title:          profile?.specialization ?? "Instructor",
    bio:            profile?.bio ?? profile?.description ?? apiUser?.bio ?? "No bio provided.",
    location:       "—",
    email:          apiUser?.email ?? "",
    website:        profile?.website ?? undefined as string | undefined,
    badges:         [] as string[],
    rating:         0,
    totalReviews:   0,
    students:       0,
    courses:        0,
    completionRate: 0,
    courseList:     [] as { id: string; title: string; thumbnail: string; students: number; rating: number }[],
    reviews:        [] as { name: string; avatar: string; color: string; text: string; time: string; rating: number }[],
  };

  const tabs = [
    { id: "about",   label: "About"               },
    { id: "courses", label: `Courses (${ins.courses})` },
    { id: "reviews", label: "Reviews"              },
  ] as const;

  if (isLoading && id) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );

  return (
    <>
      {showModal && <ReviewModal onClose={() => setShowModal(false)} name={ins.name} avatar={ins.avatar} />}

      <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

        {/* ── Hero card ─────────────────────────────────────────────────── */}
      <Fade>
        <Card>
          {/* Top gradient strip */}
          <div className="h-32 rounded-t-[22px] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }} />
            <div className="absolute inset-0"
              style={{
                background: "radial-gradient(circle 400px at 80% 50%, rgba(96,165,250,0.3), transparent 70%)",
              }} />
            {/* Edit button */}
            <Link to="/instructor/settings"
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold
                hover:bg-white/30 transition-all">
              <Edit3 className="w-3 h-3" /> Edit Profile
            </Link>
          </div>

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-[20px] overflow-hidden
                  ring-4 ring-white dark:ring-[#0f1623]
                  shadow-[0_8px_32px_rgba(59,130,246,0.3)]">
                  {apiUser?.image
                    ? <img src={apiUser.image} alt={ins.name} className="w-full h-full object-cover" />
                    : <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${ins.avatarBg}`}>{ins.avatar}</div>
                  }
                </div>
                {/* Online */}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400
                  border-[3px] border-white dark:border-[#0f1623]
                  shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>

              {/* Name + badges */}
              <div className="flex-1 mt-0 md:mt-20 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {ins.badges.map(b => (
                    <span key={b} className="px-2.5 py-1 rounded-lg text-[10px] font-bold
                      bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300
                      border border-blue-200 dark:border-blue-800/50">
                      {b}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{ins.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{ins.title}</p>
              </div>

              {/* Rating pill */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
                bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-lg font-black text-gray-900 dark:text-white">{ins.rating}</span>
                <span className="text-xs text-gray-400">({fmt(ins.totalReviews)})</span>
              </div>
            </div>

            {/* Quick meta row */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-5">
              {ins.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" />{ins.email}</span>}
              {ins.website && <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-500" />{ins.website}</span>}
            </div>
          </div>
        </Card>
      </Fade>

        {/* ── Stats ── */}
        <Fade delay={0.05}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              value={ins.students}
              label="Students"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              icon={BookOpen}
              value={ins.courses}
              label="Courses"
              color="bg-gradient-to-br from-violet-500 to-purple-600"
            />
            <StatCard
              icon={Award}
              value={ins.rating}
              label="Avg Rating"
              color="bg-gradient-to-br from-amber-400 to-orange-500"
            />
            <StatCard
              icon={TrendingUp}
              value={`${ins.completionRate}%`}
              label="Completion"
              color="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
          </div>
        </Fade>

        {/* ── Tabs ── */}
        <Fade delay={0.08}>
          <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Fade>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* ABOUT */}
          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6">
                <h2 className="font-black text-lg text-gray-900 dark:text-white mb-3">
                  About Instructor
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {ins.bio}
                </p>
              </Card>
            </motion.div>
          )}

          {/* COURSES */}
          {activeTab === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {ins.courseList.length === 0 && (
                <div className="rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] p-10 text-center text-gray-400 text-sm">
                  No courses yet.
                </div>
              )}
              {ins.courseList.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-24 h-14 rounded-xl bg-gradient-to-br ${course.thumbnail}
                          flex items-center justify-center flex-shrink-0`}
                      >
                        <Play className="w-5 h-5 text-white drop-shadow" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {course.students.toLocaleString()} students enrolled
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Stars rating={Math.round(course.rating)} />
                          <span className="text-xs font-semibold text-amber-500">
                            {course.rating}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* REVIEWS */}
          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Rating summary + CTA row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Overall score */}
                <Card className="p-6 flex flex-col justify-center">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">
                    Overall Rating
                  </p>
                  <p className="text-6xl font-black text-gray-900 dark:text-white leading-none">
                    {ins.rating}
                  </p>
                  <div className="mt-2">
                    <Stars rating={5} size="md" />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {ins.totalReviews.toLocaleString()} reviews
                  </p>
                </Card>

                {/* Drop a review CTA */}
                <Card className="sm:col-span-2 p-6 flex flex-col justify-between bg-gradient-to-br from-blue-600 to-indigo-700 border-0">
                  <div>
                    <p className="text-blue-200 text-sm font-medium mb-1">
                      Enjoyed learning from {ins.name}?
                    </p>
                    <h3 className="text-white font-black text-xl leading-tight">
                      Share your experience with other students
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 self-start flex items-center gap-2 px-5 py-2.5 rounded-xl
                      bg-white text-blue-700 font-bold text-sm
                      hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
                  >
                    <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
                    Drop a Review
                  </button>
                </Card>
              </div>

              {/* Individual reviews */}
              <div className="space-y-3">
                {ins.reviews.map((r, i) => (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Card className="p-5">
                      <div className="flex gap-4">
                        <div
                          className={`w-11 h-11 rounded-2xl ${r.color} text-white
                            flex items-center justify-center font-black text-sm flex-shrink-0`}
                        >
                          {r.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                {r.name}
                              </h3>
                              <Stars rating={r.rating} />
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {r.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {r.text}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}