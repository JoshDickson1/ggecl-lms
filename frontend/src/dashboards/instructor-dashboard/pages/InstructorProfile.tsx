// src/pages/instructor/InstructorProfile.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Star, Users, BookOpen, Award, Globe, Mail,
  MapPin, Calendar, TrendingUp, CheckCircle2,
  Edit3, BarChart3,
  ExternalLink,
} from "lucide-react";
import { instructors } from "@/data/Instructors";

// ─── Dummy data — replace with useDashboardUser + real fetch ─────────────────
const INSTRUCTOR = instructors[0]; // Sarah Mitchell

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] bg-white dark:bg-[#0f1623]
      border border-gray-100 dark:border-white/[0.07]
      shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ icon: Icon, value, label, sub }: {
  icon: React.ElementType; value: string; label: string; sub?: string;
}) {
  return (
    <div className="flex flex-col items-center py-5 px-3 rounded-2xl
      bg-blue-50/60 dark:bg-blue-950/20
      border border-blue-100/60 dark:border-blue-900/20
      hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-2">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-[9px] text-blue-500 font-bold mt-0.5">{sub}</p>}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{label}</p>
    </div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${
          i <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"
        }`} />
      ))}
    </div>
  );
}

// ─── Rating bar ───────────────────────────────────────────────────────────────
function RatingBar({ star, pct }: { star: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-500 w-3 flex-shrink-0">{star}</span>
      <div className="flex-1 h-[5px] rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: star * 0.06, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300"
        />
      </div>
      <span className="text-[11px] text-gray-400 w-7 text-right">{pct}%</span>
    </div>
  );
}

// ─── Social button ────────────────────────────────────────────────────────────
const SOCIAL_ICONS: Record<string, React.ElementType> = {
  website:  Globe,
//   github:   Github,
//   twitter:  Twitter,
//   linkedin: Linkedin,
//   youtube:  Youtube,
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InstructorProfile() {
  const inst = INSTRUCTOR;
  const [activeTab, setActiveTab] = useState<"about" | "courses" | "reviews">("about");

  const TABS = [
    { id: "about",   label: "About"   },
    { id: "courses", label: "Courses" },
    { id: "reviews", label: "Reviews" },
  ] as const;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

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
                  {inst.avatar ? (
                    <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${inst.avatarBg}`}>
                      {inst.avatar}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl font-black text-white">
                      {inst.name[0]}
                    </div>
                  )}
                </div>
                {/* Online */}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400
                  border-[3px] border-white dark:border-[#0f1623]
                  shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>

              {/* Name + badges */}
              <div className="flex-1 mt-0 md:mt-20 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {inst.badges.map(b => (
                    <span key={b} className="px-2.5 py-1 rounded-lg text-[10px] font-bold
                      bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300
                      border border-blue-200 dark:border-blue-800/50">
                      {b}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{inst.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{inst.title}</p>
              </div>

              {/* Rating pill */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
                bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-lg font-black text-gray-900 dark:text-white">{inst.rating}</span>
                <span className="text-xs text-gray-400">({fmt(inst.reviews)})</span>
              </div>
            </div>

            {/* Quick meta row */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-5">
              {[
                { icon: MapPin,    text: "Lagos, Nigeria"         },
                { icon: Mail,      text: "sarah@ggecl.io" },
                { icon: Calendar,  text: "Joined March 2022"      },
                { icon: Globe,     text: "ggecl.io"           },
              ].map(({ icon: Ic, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Ic className="w-3.5 h-3.5 text-blue-500" />{text}
                </span>
              ))}
            </div>

            {/* Socials */}
            <div className="flex flex-wrap gap-2">
              {inst.socials.map(s => {
                const Icon = SOCIAL_ICONS[s.platform] ?? Globe;
                return (
                  <a key={s.platform} href={s.url}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize
                      border border-gray-200 dark:border-white/[0.08]
                      text-gray-600 dark:text-gray-400
                      hover:border-blue-300 dark:hover:border-blue-700
                      hover:text-blue-600 dark:hover:text-blue-400
                      transition-all group">
                    <Icon className="w-3.5 h-3.5" />
                    {s.platform}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </div>
        </Card>
      </Fade>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile icon={Users}     value={fmt(inst.students)} label="Total Students" sub="+12% this month" />
          <StatTile icon={BookOpen}  value={String(inst.courses)} label="Published Courses" />
          <StatTile icon={Star}      value={inst.rating.toFixed(1)} label="Avg. Rating" sub="★ Score" />
          <StatTile icon={BarChart3} value={fmt(inst.reviews)} label="Total Reviews" />
        </div>
      </Fade>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <Fade delay={0.1}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </Fade>

      {/* ── Tab content ───────────────────────────────────────────────── */}

      {/* ABOUT */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="flex flex-col gap-5">
            {/* Bio */}
            <Fade delay={0.12}>
              <Card className="p-7">
                <SectionHead icon={Users} title={`About ${inst.name.split(" ")[0]}`} />
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{inst.bio}</p>
                {inst.bio2 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-4">{inst.bio2}</p>
                )}
              </Card>
            </Fade>

            {/* Expertise */}
            <Fade delay={0.16}>
              <Card className="p-7">
                <SectionHead icon={CheckCircle2} title="Areas of Expertise" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inst.expertise.map((item, i) => (
                    <motion.div key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + i * 0.04 }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                        bg-blue-50/60 dark:bg-blue-950/15
                        border border-blue-100/60 dark:border-blue-900/20
                        hover:bg-blue-50 dark:hover:bg-blue-950/25 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </Fade>

            {/* Experience */}
            <Fade delay={0.2}>
              <Card className="p-7">
                <SectionHead icon={TrendingUp} title="Professional Experience" />
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{inst.experience}</p>
                {inst.experience2 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-4">{inst.experience2}</p>
                )}
              </Card>
            </Fade>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-5">
            {/* Rating breakdown */}
            <Fade delay={0.14}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
                  Rating Breakdown
                </p>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-5xl font-black text-gray-900 dark:text-white leading-none">
                    {inst.rating.toFixed(1)}
                  </span>
                  <div>
                    <Stars rating={inst.rating} />
                    <p className="text-[11px] text-gray-400 mt-1">
                      {inst.reviews.toLocaleString()} reviews
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {inst.ratingBreakdown.map(({ star, pct }) => (
                    <RatingBar key={star} star={star} pct={pct} />
                  ))}
                </div>
              </Card>
            </Fade>

            {/* Recognition */}
            {inst.badges.length > 0 && (
              <Fade delay={0.18}>
                <Card className="p-5">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">
                    Recognition
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {inst.badges.map(b => (
                      <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                        bg-gradient-to-r from-blue-50 to-indigo-50
                        dark:from-blue-950/40 dark:to-indigo-950/40
                        border border-blue-200 dark:border-blue-800/50
                        text-blue-700 dark:text-blue-300">
                        <Award className="w-3 h-3" />{b}
                      </span>
                    ))}
                  </div>
                </Card>
              </Fade>
            )}

            {/* Category tags */}
            <Fade delay={0.22}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">
                  Teaching Categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {inst.categoryIds.map(c => (
                    <span key={c} className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize
                      border border-gray-200 dark:border-white/[0.08]
                      text-gray-600 dark:text-gray-400
                      bg-gray-50 dark:bg-white/[0.03]">
                      {c}
                    </span>
                  ))}
                </div>
              </Card>
            </Fade>
          </div>
        </div>
      )}

      {/* COURSES */}
      {activeTab === "courses" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {inst.courseSnippets.map((c, i) => {
            const Icon = c.icon;
            return (
              <Fade key={c.id} delay={i * 0.06}>
                <Link to={`/courses/${c.id}`}>
                  <div className="rounded-[22px] overflow-hidden bg-white dark:bg-[#0f1623]
                    border border-gray-100 dark:border-white/[0.07]
                    shadow-[0_4px_24px_rgba(0,0,0,0.05)]
                    hover:shadow-[0_0_0_1.5px_rgba(59,130,246,0.4),0_8px_32px_rgba(59,130,246,0.12)]
                    transition-all duration-300 group">
                    <div className={`h-36 bg-gradient-to-br ${c.thumbnail} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "14px 14px" }} />
                      <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                        <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                      </motion.div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug
                        group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                        {c.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Stars rating={c.rating} />
                          <span className="text-xs font-bold text-amber-500">{c.rating}</span>
                        </div>
                        <span className="text-base font-black text-gray-900 dark:text-white">
                          ${c.price}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{fmt(c.students)} students</p>
                    </div>
                  </div>
                </Link>
              </Fade>
            );
          })}
        </div>
      )}

      {/* REVIEWS */}
      {activeTab === "reviews" && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Summary */}
          <Fade delay={0.06}>
            <Card className="p-5 h-fit">
              <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
                Overall Rating
              </p>
              <div className="text-center mb-5">
                <p className="text-6xl font-black text-gray-900 dark:text-white">{inst.rating.toFixed(1)}</p>
                <Stars rating={inst.rating} />
                <p className="text-xs text-gray-400 mt-2">{inst.reviews.toLocaleString()} reviews</p>
              </div>
              <div className="flex flex-col gap-2">
                {inst.ratingBreakdown.map(({ star, pct }) => (
                  <RatingBar key={star} star={star} pct={pct} />
                ))}
              </div>
            </Card>
          </Fade>

          {/* Mock reviews */}
          <div className="flex flex-col gap-4">
            {[
              { name: "Olusegun A.", bg: "bg-emerald-500", rating: 5, date: "2 weeks ago",
                text: "Sarah's teaching style is exceptional. The projects are real-world and the explanations are crystal clear. Worth every penny and more." },
              { name: "Mei-Ling C.", bg: "bg-pink-500", rating: 5, date: "1 month ago",
                text: "Best structured course I've ever taken. Sarah breaks down complexity brilliantly. I landed my first dev role after completing this." },
              { name: "Tobias R.", bg: "bg-violet-500", rating: 4, date: "1 month ago",
                text: "Solid content throughout. A few sections could be tightened but overall an excellent investment in your career. Highly recommended." },
              { name: "Fatou D.", bg: "bg-amber-500", rating: 5, date: "2 months ago",
                text: "I've taken courses on every major platform. This is genuinely the best one. Sarah clearly cares about her students' outcomes." },
            ].map((r, i) => (
              <Fade key={r.name} delay={i * 0.07}>
                <Card className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 ${r.bg}`}>
                      {r.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{r.name}</span>
                          <Stars rating={r.rating} />
                        </div>
                        <span className="text-xs text-gray-400">{r.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                </Card>
              </Fade>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
        flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h2 className="text-base font-black text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}