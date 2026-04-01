// src/dashboards/student-dashboard/pages/StudentProfile.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Star, Users, BookOpen, Award, Globe, Mail,
  MapPin, Calendar, CheckCircle2, Edit3, Play, TrendingUp, ShoppingBag,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// ─── Dummy data — replace with useDashboardUser + real fetch ─────────────────
const STUDENT = {
  name: "Emeka Okonkwo",
  avatar: "EO",
  avatarBg: "bg-blue-500",
  title: "Software Engineering Student",
  bio: "Passionate about web development and machine learning. Currently working through a full-stack curriculum to transition from accounting into tech. Love building side projects and contributing to open source.",
  location: "Lagos, Nigeria",
  email: "emeka@ggecl.io",
  joined: "September 2023",
  website: "emekaokonkwo.dev",
  badges: ["Top Learner", "Certificate Holder"],
  rating: 4.8,   // avg course rating given
  reviews: 24,    // courses reviewed
  enrolled: 12,
  completed: 7,
  certificates: 4,
  totalSpent: 142.80,
  enrolledCourses: [
    { id: "dev-001", title: "The Complete React & TypeScript Bootcamp 2024", thumbnail: "from-blue-500 to-blue-400", progress: 78, instructor: "Sarah Mitchell", rating: 4.9 },
    { id: "dev-002", title: "Node.js, Express & MongoDB: Backend Masterclass", thumbnail: "from-green-500 to-emerald-400", progress: 45, instructor: "James Okafor", rating: 4.8 },
    { id: "mkt-001", title: "Digital Marketing Masterclass: SEO, Ads & Social", thumbnail: "from-violet-500 to-purple-400", progress: 100, instructor: "Amara Nwosu", rating: 4.8 },
    { id: "biz-001", title: "The Complete Entrepreneurship & Startup Playbook", thumbnail: "from-sky-500 to-blue-400", progress: 20, instructor: "Priya Sharma", rating: 4.9 },
  ],
};

const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}>
    {children}
  </motion.div>
);

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] bg-white dark:bg-[#0f1623]
      border border-gray-100 dark:border-white/[0.07]
      shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function StatTile({ icon: Icon, value, label, sub, color = "blue" }: {
  icon: React.ElementType; value: string; label: string; sub?: string; color?: "blue" | "blue" | "emerald" | "amber";
}) {
  const palette: Record<string, string> = {
    blue: "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 [&_div]:bg-blue-100 dark:[&_div]:bg-blue-900/40 [&_svg]:text-blue-600 dark:[&_svg]:text-blue-400",
    emerald: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 [&_div]:bg-emerald-100 dark:[&_div]:bg-emerald-900/40 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400",
    amber: "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 [&_div]:bg-amber-100 dark:[&_div]:bg-amber-900/40 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400",
  };
  return (
    <div className={`flex flex-col items-center py-5 px-3 rounded-2xl border transition-colors ${palette[color]}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2">
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-[9px] font-bold mt-0.5 text-current opacity-70">{sub}</p>}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{label}</p>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
      ))}
    </div>
  );
}

function SectionHead({ icon: Icon, title, color = "blue" }: {
  icon: React.ElementType; title: string; color?: "blue" | "blue";
}) {
  const grad = color === "blue" ? "from-blue-500 to-blue-500" : "from-blue-500 to-blue-700";
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h2 className="text-base font-black text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "from-emerald-500 to-emerald-400" : "from-blue-500 to-blue-400";
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentProfile() {
  const [activeTab, setActiveTab] = useState<"about" | "courses" | "review">("about");
  const st = STUDENT;

  const TABS = [
    { id: "about", label: "About" },
    { id: "courses", label: "My Courses" },
    { id: "review", label: "Drop a Review" },
  ] as const;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <Fade>
        <Card>
          {/* Banner */}
          <div className="h-32 rounded-t-[22px] bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(circle 400px at 20% 50%, rgba(103,232,249,0.25), transparent 70%)" }} />
            <Link to="/student/settings"
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold
                hover:bg-white/30 transition-all">
              <Edit3 className="w-3 h-3" /> Edit Profile
            </Link>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-[20px] overflow-hidden
                  ring-4 ring-white dark:ring-[#0f1623]
                  shadow-[0_8px_32px_rgba(6,182,212,0.3)]">
                  <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${st.avatarBg}`}>
                    {st.avatar}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400
                  border-[3px] border-white dark:border-[#0f1623]
                  shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>

              {/* Name + badges */}
              <div className="flex-1 mt-0 md:mt-20 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {st.badges.map(b => (
                    <span key={b} className="px-2.5 py-1 rounded-lg text-[10px] font-bold
                      bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300
                      border border-blue-200 dark:border-blue-800/50">
                      {b}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{st.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{st.title}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-5">
              {[
                { icon: MapPin, text: st.location },
                { icon: Mail, text: st.email },
                { icon: Calendar, text: `Joined ${st.joined}` },
                { icon: Globe, text: st.website },
              ].map(({ icon: Ic, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Ic className="w-3.5 h-3.5 text-blue-500" />{text}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </Fade>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile icon={BookOpen} color="blue" value={String(st.enrolled)} label="Enrolled Courses" />
          <StatTile icon={CheckCircle2} color="emerald" value={String(st.completed)} label="Completed" sub="courses finished" />
          <StatTile icon={ShoppingBag} color="blue" value={`$${st.totalSpent.toFixed(0)}`} label="Total Invested" sub="in your education" />
        </div>
      </Fade>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <Fade delay={0.1}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === tab.id
                  ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </Fade>

      {/* ── ABOUT tab ─────────────────────────────────────────────────── */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="flex flex-col gap-5">
            <Fade delay={0.12}>
              <Card className="p-7">
                <SectionHead icon={Users} title="About Me" color="blue" />
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{st.bio}</p>
              </Card>
            </Fade>

            {/* Learning goals */}
            <Fade delay={0.16}>
              <Card className="p-7">
                <SectionHead icon={TrendingUp} title="Learning Goals" color="blue" />
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Complete React & TypeScript Bootcamp", done: false },
                    { label: "Earn Full-Stack Development Certificate", done: false },
                    { label: "Build & deploy 3 portfolio projects", done: false },
                    { label: "Complete Digital Marketing course", done: true },
                    { label: "Master Python fundamentals", done: true },
                  ].map((goal, i) => (
                    <motion.div key={goal.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + i * 0.04 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                        border transition-colors ${goal.done
                          ? "bg-emerald-50/60 dark:bg-emerald-950/15 border-emerald-100/60 dark:border-emerald-900/20"
                          : "bg-gray-50/60 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.06]"
                        }`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${goal.done ? "text-emerald-500" : "text-gray-300 dark:text-gray-600"}`} />
                      <span className={`text-xs font-medium ${goal.done ? "text-emerald-700 dark:text-emerald-400 line-through opacity-60" : "text-gray-700 dark:text-gray-300"}`}>
                        {goal.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </Fade>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Ratings given */}
            <Fade delay={0.14}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">Reviews Given</p>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-5xl font-black text-gray-900 dark:text-white leading-none">{st.rating.toFixed(1)}</span>
                  <div>
                    <Stars rating={st.rating} />
                    <p className="text-[11px] text-gray-400 mt-1">{st.reviews} courses reviewed</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Average rating you've given to courses</p>
              </Card>
            </Fade>

            {/* Badges */}
            <Fade delay={0.18}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">Achievements</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Top Learner", desc: "Top 5% of students this month" },
                    { label: "Consistent", desc: "14-day learning streak" },
                    { label: "Early Adopter", desc: "Joined in first cohort" },
                  ].map((b, i) => (
                    <motion.div key={b.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/50 dark:border-blue-900/20">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                        <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-white">{b.label}</p>
                        <p className="text-[10px] text-gray-400">{b.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </Fade>
          </div>
        </div>
      )}

      {/* ── COURSES tab ───────────────────────────────────────────────── */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-4">
          {st.enrolledCourses.map((c, i) => (
            <Fade key={c.id} delay={i * 0.05}>
              <Card className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Thumbnail */}
                  <div className={`w-full sm:w-28 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br ${c.thumbnail} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "10px 10px" }} />
                    <Play className="w-6 h-6 text-white" />
                    {c.progress === 100 && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/courses/${c.id}`}>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1
                        hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{c.title}</h3>
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">by {c.instructor}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <ProgressBar pct={c.progress} />
                      <span className={`text-[11px] font-bold flex-shrink-0 ${c.progress === 100 ? "text-emerald-500" : "text-blue-500"}`}>
                        {c.progress}%
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0">
                    {c.progress === 100 ? (
                      <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                        bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400
                        border border-emerald-200 dark:border-emerald-800/50">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <Link to={`/courses/${c.id}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                          bg-blue-600 hover:bg-blue-500 text-white
                          shadow-[0_3px_10px_rgba(6,182,212,0.35)] transition-all">
                        <Play className="w-3 h-3" /> Continue
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            </Fade>
          ))}
        </div>
      )}

      {/* ── Review tab ──────────────────────────────────────────── */}
      {activeTab === "review" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Left summary */}
          <div className="xl:col-span-1">
            <div className="rounded-[28px] border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0f172a] p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-5">
                Review Context
              </p>

              <div className="space-y-4">
                {/* Instructor dropdown */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">
                    Select Instructor
                  </label>
                  <Select>
                    <SelectTrigger
                      className="h-12 rounded-2xl border-gray-200 dark:border-white/[0.06]
                bg-gray-50 dark:bg-white/[0.03]
                hover:bg-gray-100 dark:hover:bg-white/[0.05]
                transition-all duration-200
                focus:ring-2 focus:ring-blue-500/20"
                    >
                      <SelectValue placeholder="Choose instructor" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="sarah">Sarah Mitchell</SelectItem>
                      <SelectItem value="daniel">Daniel James</SelectItem>
                      <SelectItem value="grace">Grace Okafor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Course dropdown */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">
                    Select Course
                  </label>
                  <Select>
                    <SelectTrigger
                      className="h-12 rounded-2xl border-gray-200 dark:border-white/[0.06]
                bg-gray-50 dark:bg-white/[0.03]
                hover:bg-gray-100 dark:hover:bg-white/[0.05]
                transition-all duration-200
                focus:ring-2 focus:ring-blue-500/20"
                    >
                      <SelectValue placeholder="Choose course" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="react">Advanced React</SelectItem>
                      <SelectItem value="system-design">System Design</SelectItem>
                      <SelectItem value="typescript">Mastering TypeScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Progress */}
                <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] p-4 mt-4">
                  <p className="text-xs text-gray-400 mb-1">Completion Status</p>
                  <p className="text-sm font-semibold text-emerald-600">
                    Eligible to review
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Review form */}
          <div className="xl:col-span-2">
            <div className="rounded-[28px] border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0f172a] p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-5">
                Leave a Review
              </p>

              {/* Rating */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-3">
                  Your Rating
                </label>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="w-11 h-11 rounded-2xl border border-amber-200 dark:border-amber-500/20
                bg-amber-50 dark:bg-amber-500/10
                hover:bg-amber-100 dark:hover:bg-amber-500/20
                active:scale-95 hover:scale-105
                flex items-center justify-center transition-all duration-200"
                    >
                      <Star
                        className={`w-5 h-5 ${star <= 4
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200 dark:text-gray-700"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  placeholder="Summarize your experience"
                  className="w-full h-12 rounded-2xl border border-gray-200 dark:border-white/[0.06]
            bg-gray-50 dark:bg-white/[0.03]
            px-4 text-sm outline-none
            hover:bg-gray-100 dark:hover:bg-white/[0.05]
            focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Feedback */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">
                  Detailed Feedback
                </label>
                <textarea
                  rows={6}
                  placeholder="Tell others what made this instructor helpful..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/[0.06]
            bg-gray-50 dark:bg-white/[0.03]
            px-4 py-3 text-sm outline-none resize-none
            hover:bg-gray-100 dark:hover:bg-white/[0.05]
            focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Recommend */}
              <div className="mb-6 flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-white/[0.03] p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Would you recommend this instructor?
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Your feedback helps others
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 active:scale-95 text-emerald-700 text-sm font-semibold transition-all">
                    Yes
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 active:scale-95 text-red-600 text-sm font-semibold transition-all">
                    No
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700
          hover:from-blue-700 hover:to-indigo-800
          active:scale-[0.99]
          text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}