// src/dashboards/instructor/pages/InstructorStudentSingle.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  TrendingUp,
  Star,
  MapPin,
  Mail,
  Calendar,
  CheckCircle,
  Circle,
  Play,
  Award,
  MessageSquare,
  Send,
  ChevronDown,
  Flame,
  BarChart2,
  Lock,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STUDENT = {
  id: "s1",
  name: "Olusegun Adeyemi",
  avatar: "OA",
  avatarBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
  email: "olusegun.a@gmail.com",
  location: "Lagos, Nigeria",
  joinedAt: "January 12, 2025",
  lastActive: "2 hours ago",
  status: "active",
  streak: 12,
  totalXp: 3480,
  level: 7,
  totalWatchTime: "14h 32m",
  completedCourses: 1,
};

const ENROLLMENT = {
  courseId: "c1",
  courseTitle: "Advanced React & System Design",
  enrolledAt: "January 12, 2025",
  progress: 87,
  completedLessons: 34,
  totalLessons: 39,
  estimatedCompletion: "April 28, 2025",
  rating: 5,
  reviewText: "Exceptional teaching style. Clear explanations and practical projects that actually prepare you for real work.",
  reviewDate: "March 15, 2025",
};

const SECTIONS = [
  {
    id: "sec1",
    title: "Foundations & Architecture",
    lessons: [
      { id: "l1", title: "React mental model & component tree", done: true, duration: "18m" },
      { id: "l2", title: "State vs derived state", done: true, duration: "22m" },
      { id: "l3", title: "Custom hooks deep dive", done: true, duration: "34m" },
      { id: "l4", title: "Performance patterns", done: true, duration: "28m" },
    ],
  },
  {
    id: "sec2",
    title: "System Design Fundamentals",
    lessons: [
      { id: "l5", title: "Scalable folder structures", done: true, duration: "15m" },
      { id: "l6", title: "API layer design", done: true, duration: "26m" },
      { id: "l7", title: "State management at scale", done: true, duration: "41m" },
      { id: "l8", title: "Caching strategies", done: false, duration: "33m" },
    ],
  },
  {
    id: "sec3",
    title: "Advanced Patterns",
    lessons: [
      { id: "l9",  title: "Compound components", done: false, duration: "29m" },
      { id: "l10", title: "Render props & HOCs", done: false, duration: "22m" },
      { id: "l11", title: "Context performance pitfalls", done: false, duration: "18m" },
    ],
  },
];

const WEEKLY_ACTIVITY = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 80 },
  { day: "Wed", minutes: 30 },
  { day: "Thu", minutes: 95 },
  { day: "Fri", minutes: 60 },
  { day: "Sat", minutes: 15 },
  { day: "Sun", minutes: 70 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
      {children}
    </p>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color =
    value === 100 ? "from-blue-500 to-indigo-600"
    : value >= 60  ? "from-emerald-500 to-teal-500"
    : value >= 30  ? "from-amber-400 to-orange-500"
    : "from-red-400 to-rose-500";
  return (
    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
      ))}
    </div>
  );
}

// ─── Activity Bar Chart ───────────────────────────────────────────────────────

function ActivityChart() {
  const max = Math.max(...WEEKLY_ACTIVITY.map((d) => d.minutes));
  return (
    <div className="flex items-end gap-2 h-24">
      {WEEKLY_ACTIVITY.map((d) => {
        const pct = (d.minutes / max) * 100;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full rounded-lg bg-gradient-to-t from-blue-600 to-blue-400 min-h-[4px]"
              style={{ height: `${pct}%` }}
            />
            <span className="text-[10px] text-gray-400">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Curriculum Section ───────────────────────────────────────────────────────

function CurriculumSection({ section }: { section: typeof SECTIONS[0] }) {
  const [open, setOpen] = useState(section.id === "sec1");
  const done = section.lessons.filter((l) => l.done).length;

  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all text-left"
      >
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
        <span className="flex-1 text-sm font-bold text-gray-900 dark:text-white">{section.title}</span>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {done}/{section.lessons.length} done
        </span>
        <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-white/[0.08] overflow-hidden flex-shrink-0">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
            style={{ width: `${(done / section.lessons.length) * 100}%` }}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {section.lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-3 px-4 py-2.5">
                  {lesson.done ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  )}
                  <div className={`flex-1 flex items-center gap-2 ${!lesson.done ? "opacity-50" : ""}`}>
                    <Play className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{lesson.title}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">{lesson.duration}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Message Modal ────────────────────────────────────────────────────────────

function MessageModal({ onClose }: { onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

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
        className="w-full max-w-md bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {!sent ? (
          <>
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black ${STUDENT.avatarBg}`}>
                  {STUDENT.avatar}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Message to</p>
                  <p className="font-bold text-gray-900 dark:text-white">{STUDENT.name}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder={`Hi ${STUDENT.name.split(" ")[0]}, I wanted to check in on your progress…`}
                rows={5}
                className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{msg.length}/500</p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                Cancel
              </button>
              <button
                onClick={() => msg.trim() && setSent(true)}
                disabled={!msg.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Message sent!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {STUDENT.name.split(" ")[0]} will receive your message shortly.
              </p>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorStudentSingle() {
  useParams(); // id available here when wired to real API
  const [showMessage, setShowMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<"progress" | "activity" | "review">("progress");

  const s = STUDENT;
  const e = ENROLLMENT;

  return (
    <>
      <AnimatePresence>{showMessage && <MessageModal onClose={() => setShowMessage(false)} />}</AnimatePresence>

      <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

        {/* ── Back + Header ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/instructor/students"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to students
          </Link>
        </motion.div>

        {/* ── Hero card ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
          <Card>
            {/* Strip */}
            <div className="h-24 rounded-t-[22px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            </div>

            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-20 h-20 rounded-[18px] ring-4 ring-white dark:ring-[#0f1623] shadow-lg flex items-center justify-center text-2xl font-black text-white ${s.avatarBg}`}>
                    {s.avatar}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-[2.5px] border-white dark:border-[#0f1623]" />
                </div>

                {/* Info */}
                <div className="flex-1 sm:pb-1 pt-20">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">{s.name}</h1>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-500" />{s.location}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-500" />{s.email}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-500" />Joined {s.joinedAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowMessage(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 transition-all shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </button>
                </div>
              </div>

              {/* Quick XP pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Flame, label: `${s.streak} day streak`, color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30" },
                  { icon: Award, label: `Level ${s.level}`, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30" },
                  { icon: BarChart2, label: `${s.totalXp.toLocaleString()} XP`, color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-900/30" },
                  { icon: Clock, label: `${s.totalWatchTime} watched`, color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900/30" },
                ].map(({ icon: Icon, label, color }) => (
                  <span key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${color}`}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Two-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* ── Left ── */}
          <div className="space-y-5">

            {/* Enrollment card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
              <Card className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 dark:text-white text-sm">{e.courseTitle}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Enrolled {e.enrolledAt} · Est. completion {e.estimatedCompletion}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{e.progress}% complete</span>
                  <span className="text-xs text-gray-400">{e.completedLessons} of {e.totalLessons} lessons</span>
                </div>
                <ProgressBar value={e.progress} />
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
                {(["progress", "activity", "review"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {/* PROGRESS */}
              {activeTab === "progress" && (
                <motion.div key="progress" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  <Card className="p-5">
                    <SectionLabel>Curriculum Progress</SectionLabel>
                    <div className="space-y-2">
                      {SECTIONS.map((sec) => (
                        <CurriculumSection key={sec.id} section={sec} />
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ACTIVITY */}
              {activeTab === "activity" && (
                <motion.div key="activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  <Card className="p-5">
                    <SectionLabel>Weekly Watch Time</SectionLabel>
                    <ActivityChart />
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      {[
                        { label: "This week", value: "6h 35m" },
                        { label: "Daily avg", value: "56m" },
                        { label: "Most active", value: "Thursday" },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] p-3 text-center">
                          <p className="text-base font-black text-gray-900 dark:text-white">{value}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* REVIEW */}
              {activeTab === "review" && (
                <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  <Card className="p-5">
                    <SectionLabel>Student Review</SectionLabel>
                    {e.rating ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 ${s.avatarBg}`}>
                            {s.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{s.name}</p>
                              <Stars rating={e.rating} />
                            </div>
                            <p className="text-[11px] text-gray-400">{e.reviewDate}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-[52px]">
                          {e.reviewText}
                        </p>
                      </div>
                    ) : (
                      <div className="py-10 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                          <Star className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No review yet</p>
                        <p className="text-xs text-gray-400">This student hasn't left a review for this course yet.</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4">

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
              <Card className="p-5">
                <SectionLabel>At a Glance</SectionLabel>
                <div className="space-y-3">
                  {[
                    { icon: TrendingUp, label: "Course Progress", value: `${e.progress}%` },
                    { icon: CheckCircle, label: "Lessons Done", value: `${e.completedLessons}/${e.totalLessons}` },
                    { icon: Clock, label: "Total Watch Time", value: s.totalWatchTime },
                    { icon: Calendar, label: "Last Active", value: s.lastActive },
                    { icon: BookOpen, label: "Courses Completed", value: s.completedCourses },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Icon className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Upcoming lessons */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
              <Card className="p-5">
                <SectionLabel>Up Next</SectionLabel>
                <div className="space-y-2">
                  {SECTIONS.flatMap((s) => s.lessons).filter((l) => !l.done).slice(0, 3).map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{lesson.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{lesson.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Send nudge CTA */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
              <Card className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 border-0">
                <p className="text-blue-200 text-xs font-medium mb-1">Engagement tip</p>
                <h3 className="text-white font-black text-base leading-snug mb-3">
                  Send {s.name.split(" ")[0]} a progress nudge
                </h3>
                <p className="text-blue-200/80 text-xs leading-relaxed mb-4">
                  Students who receive instructor messages are 2× more likely to complete their course.
                </p>
                <button
                  onClick={() => setShowMessage(true)}
                  className="w-full py-2.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Message Student
                </button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}