import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
 ArrowRight, Star, Users, BookOpen,
  Globe, Briefcase, Mail, Award, CheckCircle,
//   Youtube, Linkedin, Twitter, Github, Play,
} from "lucide-react";
import { getInstructorById, instructors, fmt, type Instructor } from "@/data/Instructors";
import { PageHeroBg } from "@/landing/pages/SingleCategory";

// ─── Font import (kept as CSS per your request) ───────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
.font-syne { font-family: 'Syne', system-ui, sans-serif; }
.font-dm { font-family: 'DM Sans', system-ui, sans-serif; }`;
// Deterministic placeholder photos from UI Faces / DiceBear
const PHOTO_MAP: Record<string, string> = {
  "inst-1": "https://i.pinimg.com/736x/b5/ca/9b/b5ca9b6c98616c7d8465aae596917c76.jpg",
  "inst-2": "https://i.pinimg.com/736x/49/c3/65/49c365435c2566ef0c937d8290a8c034.jpg",
  "inst-3": "https://i.pinimg.com/736x/c2/4d/0d/c24d0d7542ee6be66bf4270123c15df4.jpg",
  "inst-4": "https://api.dicebear.com/9.x/personas/svg?seed=DavidChen&backgroundColor=d1d4f9",
  "inst-5": "https://api.dicebear.com/9.x/personas/svg?seed=FatimaAlHassan&backgroundColor=ffdfbf",
  "inst-6": "https://api.dicebear.com/9.x/personas/svg?seed=LucaRomano&backgroundColor=b6e3f4",
  "inst-7": "https://api.dicebear.com/9.x/personas/svg?seed=PriyaSharma&backgroundColor=ffd5dc",
  "inst-8": "https://api.dicebear.com/9.x/personas/svg?seed=MarcusThompson&backgroundColor=c0f0e0",
};
// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i + 1 <= Math.round(rating) ? "#FFC806" : "#374151"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Social icon map ──────────────────────────────────────────────────────────
function SocialIcon({ platform }: { platform: string }) {
  const cls = "w-3.5 h-3.5";
  switch (platform) {
    case "website": return <Globe className={cls} />;
    // case "linkedin": return <Linkedin className={cls} />;
    // case "twitter": return <Twitter className={cls} />;
    // case "github": return <Github className={cls} />;
    // case "youtube": return <Youtube className={cls} />;
    default: return <Globe className={cls} />;
  }
}

// ─── Course snippet card ──────────────────────────────────────────────────────
function CourseSnippetCard({ course }: { course: Instructor["courseSnippets"][0] }) {
  const Icon = course.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -2 }}
      className="flex gap-3 p-3 rounded-2xl
        bg-gray-50 dark:bg-white/[0.04]
        border border-gray-100 dark:border-white/[0.07]
        hover:border-blue-200 dark:hover:border-blue-800/50
        transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${course.thumbnail} flex items-center justify-center flex-shrink-0 overflow-hidden relative`}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "10px 10px" }}
        />
        <motion.div animate={hovered ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.25 }}>
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      <div className="flex-1 min-w-0">
        <Link to={`/courses/${course.id}`}>
          <p className="text-xs font-bold text-gray-800 dark:text-white line-clamp-2 leading-snug
            hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {course.title}
          </p>
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <Stars rating={course.rating} size={10} />
          <span className="text-[10px] font-bold text-amber-500">{course.rating}</span>
          <span className="text-[10px] text-gray-400">{fmt(course.students)}</span>
        </div>
        <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-1">${course.price}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SingleInstructor() {
  const { id } = useParams();
  const instructor = getInstructorById(id ?? "") ?? instructors[0];

  const [showAllExpertise, setShowAllExpertise] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const instructorEmail = (instructor as any).email as string | undefined;
  const visibleExpertise = showAllExpertise ? instructor.expertise : instructor.expertise.slice(0, 5);

  // Related instructors (same category, exclude current)
  const related = instructors
    .filter((i) => i.id !== instructor.id && i.categoryIds.some((c) => instructor.categoryIds.includes(c)))
    .slice(0, 3);

  return (
    <div className="font-dm min-h-screen bg-[#f8fafc] dark:bg-[#080c17]">
      <style>{FONTS}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white rounded-2xl dark:bg-[#0a0c1c]">
        <PageHeroBg />

        <div className="relative max-w-[1120px] mx-auto px-6 pt-10 pb-14">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-[12.5px] text-gray-400 mb-8"
          >
            <Link to="/" className="text-blue-500 hover:underline font-medium">Home</Link>
            <span className="opacity-40">›</span>
            <Link to="/student/instructors" className="text-blue-500 hover:underline font-medium">Instructors</Link>
            <span className="opacity-40">›</span>
            <span className="text-gray-500">{instructor.name}</span>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="relative flex-shrink-0"
            >
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[28px] overflow-hidden
  shadow-[0_8px_32px_rgba(59,130,246,0.22)]
  border-[3px] border-blue-400/25">
  {(instructor.photo ?? PHOTO_MAP[instructor.id]) ? (
    <img
      src={instructor.photo ?? PHOTO_MAP[instructor.id]}
      alt={instructor.name}
      className="w-full h-full object-cover object-top"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  ) : null}
  {/* Initials fallback */}
  <div className={`absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-white ${instructor.avatarBg}`}
    style={{ zIndex: -1 }}>
    {instructor.avatar}
  </div>
</div>
              {/* Online dot */}
              <span className="absolute bottom-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-400
                border-[2.5px] border-white dark:border-[#0a0c1c]
                shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            </motion.div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="flex-1 min-w-0"
            >
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                border border-blue-200 dark:border-blue-900/60
                bg-blue-50 dark:bg-blue-950/30 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                  Verified Instructor
                </span>
              </div>

              <h1 className="font-syne text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight
                text-gray-900 dark:text-white mb-2">
                {instructor.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-light mb-5 leading-relaxed">
                {instructor.title}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-5 mb-6">
                {[
                  { icon: Users, n: fmt(instructor.students), l: "Students" },
                  { icon: Star, n: String(instructor.reviews.toLocaleString()), l: "Reviews" },
                  { icon: BookOpen, n: String(instructor.courses), l: "Courses" },
                  { icon: Award, n: instructor.rating.toFixed(1), l: "Avg. Rating" },
                ].map(({ icon: Icon, n, l }) => (
                  <div key={l} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex-shrink-0
                      bg-blue-50 dark:bg-blue-950/40
                      border border-blue-100 dark:border-blue-900/40
                      flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-syne text-lg font-extrabold text-gray-900 dark:text-white leading-none">
                        {n}
                      </div>
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                    bg-gradient-to-br from-blue-500 to-blue-700 text-white
                    text-sm font-semibold shadow-[0_4px_18px_rgba(59,130,246,0.38)]
                    transition-shadow"
                >
                  <Mail className="w-3.5 h-3.5" /> Contact Instructor
                </motion.button>

                <AnimatePresence>
                  {showContact && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4
                        bg-black/40 backdrop-blur-sm"
                      onClick={() => setShowContact(false)}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ duration: 0.2 }}
                        onClick={e => e.stopPropagation()}
                        className="w-full max-w-sm rounded-2xl p-6
                          bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.08]
                          shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40
                            flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              Email {instructor.name.split(" ")[0]}?
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                              {instructorEmail ?? "No email on file"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {instructorEmail ? (
                            <a href={`mailto:${instructorEmail}`}
                              onClick={() => setShowContact(false)}
                              className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold
                                bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                              Go
                            </a>
                          ) : (
                            <span className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold
                              bg-gray-100 dark:bg-white/[0.05] text-gray-400 cursor-not-allowed">
                              No email available
                            </span>
                          )}
                          <button onClick={() => setShowContact(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold
                              bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400
                              hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors">
                            No thanks
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {instructor.socials.map((s) => (
                  <motion.a
                    key={s.platform}
                    href={s.url}
                    whileHover={{ y: -1 }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full
                      border border-gray-200 dark:border-white/[0.10]
                      text-gray-600 dark:text-gray-300 text-sm font-medium capitalize
                      hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400
                      transition-all bg-white/50 dark:bg-white/[0.03]"
                  >
                    <SocialIcon platform={s.platform} />
                    {s.platform}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-200/40 dark:via-blue-800/20 to-transparent" />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-[1120px] mx-auto px-6 py-12 pb-24
        grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">

        {/* ── Left: main ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-7">

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[22px] p-7
              bg-white dark:bg-[#0f1420]
              border border-gray-100 dark:border-white/[0.07]
              shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="4" r="2.5" stroke="white" strokeWidth="1.4"/>
                  <path d="M1.5 12c0-2.76 2.239-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="font-syne text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                About {instructor.name.split(" ")[0]}
              </h2>
            </div>
            <p className="text-sm font-light leading-relaxed text-gray-500 dark:text-gray-400">
              {instructor.bio}
            </p>
            {instructor.bio2 && (
              <p className="text-sm font-light leading-relaxed text-gray-500 dark:text-gray-400 mt-4">
                {instructor.bio2}
              </p>
            )}
          </motion.div>

          {/* Expertise */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="rounded-[22px] p-7
              bg-white dark:bg-[#0f1420]
              border border-gray-100 dark:border-white/[0.07]
              shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
                <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
              </div>
              <h2 className="font-syne text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                Areas of Expertise
              </h2>
            </div>

            <ul className="flex flex-col gap-2">
              <AnimatePresence>
                {visibleExpertise.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                      border border-blue-50 dark:border-blue-900/20
                      bg-blue-50/50 dark:bg-blue-950/10
                      text-sm text-gray-700 dark:text-gray-300
                      hover:bg-blue-50 dark:hover:bg-blue-950/20
                      hover:border-blue-100 dark:hover:border-blue-800/40
                      transition-all cursor-default"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" strokeWidth={2} />
                    {item}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {instructor.expertise.length > 5 && (
              <button
                onClick={() => setShowAllExpertise((p) => !p)}
                className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {showAllExpertise ? "Show less" : `Show all ${instructor.expertise.length} skills`}
                <motion.span animate={{ rotate: showAllExpertise ? 180 : 0 }} transition={{ duration: 0.22 }}>
                  ↓
                </motion.span>
              </button>
            )}
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[22px] p-7
              bg-white dark:bg-[#0f1420]
              border border-gray-100 dark:border-white/[0.07]
              shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
                <Briefcase className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
              </div>
              <h2 className="font-syne text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                Professional Experience
              </h2>
            </div>
            <p className="text-sm font-light leading-relaxed text-gray-500 dark:text-gray-400">
              {instructor.experience}
            </p>
            {instructor.experience2 && (
              <p className="text-sm font-light leading-relaxed text-gray-500 dark:text-gray-400 mt-4">
                {instructor.experience2}
              </p>
            )}
          </motion.div>

          {/* Related instructors */}
          {related.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="rounded-[22px] p-7
                bg-white dark:bg-[#0f1420]
                border border-gray-100 dark:border-white/[0.07]
                shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <h2 className="font-syne text-lg font-extrabold text-gray-900 dark:text-white tracking-tight mb-5">
                Similar Instructors
              </h2>
              <div className="flex flex-col gap-3">
                {related.map((rel) => (
                  <Link key={rel.id} to={`/student/instructors/${rel.id}`}
                    className="flex items-center gap-4 p-3 rounded-2xl
                      border border-gray-100 dark:border-white/[0.07]
                      hover:border-blue-200 dark:hover:border-blue-800/50
                      hover:bg-blue-50/30 dark:hover:bg-blue-950/10
                      transition-all group"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0 ${rel.avatarBg}`}>
                      {rel.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {rel.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{rel.title}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Right: sidebar ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[22px] p-5
              bg-white dark:bg-[#0f1420]
              border border-gray-100 dark:border-white/[0.07]
              shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
              At a Glance
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { n: fmt(instructor.students), s: "", l: "Students" },
                { n: instructor.reviews.toLocaleString(), s: "", l: "Reviews" },
                { n: String(instructor.courses), s: "", l: "Courses" },
                { n: instructor.rating.toFixed(1), s: "★", l: "Rating" },
              ].map(({ n, s, l }) => (
                <div key={l} className="flex flex-col items-center py-3.5 rounded-2xl
                  bg-blue-50/60 dark:bg-blue-950/20
                  border border-blue-100/60 dark:border-blue-900/20
                  hover:bg-blue-50 dark:hover:bg-blue-950/30
                  transition-colors">
                  <div className="font-syne text-2xl font-extrabold text-gray-900 dark:text-white leading-none">
                    {n}<span className="text-blue-500 dark:text-blue-400">{s}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Rating breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-[22px] p-5
              bg-white dark:bg-[#0f1420]
              border border-gray-100 dark:border-white/[0.07]
              shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
              Student Rating
            </p>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-syne text-5xl font-extrabold text-gray-900 dark:text-white leading-none">
                {instructor.rating.toFixed(1)}
              </span>
              <div>
                <Stars rating={instructor.rating} size={15} />
                <p className="text-[11px] text-gray-400 mt-1">Based on {instructor.reviews.toLocaleString()} reviews</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {instructor.ratingBreakdown.map(({ star, pct }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 w-2 flex-shrink-0">{star}</span>
                  <div className="flex-1 h-[5px] rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: star * 0.05, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 w-7 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Courses */}
          {instructor.courseSnippets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="rounded-[22px] p-5
                bg-white dark:bg-[#0f1420]
                border border-gray-100 dark:border-white/[0.07]
                shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
                Their Courses
              </p>
              <div className="flex flex-col gap-3">
                {instructor.courseSnippets.map((c) => (
                  <CourseSnippetCard key={c.id} course={c} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="rounded-[22px] p-5
              bg-white dark:bg-[#0f1420]
              border border-gray-100 dark:border-white/[0.07]
              shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
              Connect
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowContact(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full
                  border border-gray-100 dark:border-white/[0.07]
                  text-sm font-medium text-gray-600 dark:text-gray-300
                  hover:border-blue-200 dark:hover:border-blue-800/50
                  hover:bg-blue-50/40 dark:hover:bg-blue-950/20
                  hover:text-blue-600 dark:hover:text-blue-400 transition-all group">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 bg-blue-50 dark:bg-blue-950/40
                  border border-blue-100 dark:border-blue-900/30
                  flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                Send Message
                <span className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">›</span>
              </button>
              {instructor.socials.map((s) => (
                <a key={s.platform} href={s.url}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full
                    border border-gray-100 dark:border-white/[0.07]
                    text-sm font-medium text-gray-600 dark:text-gray-300
                    hover:border-blue-200 dark:hover:border-blue-800/50
                    hover:bg-blue-50/40 dark:hover:bg-blue-950/20
                    hover:text-blue-600 dark:hover:text-blue-400 transition-all group">
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 bg-blue-50 dark:bg-blue-950/40
                    border border-blue-100 dark:border-blue-900/30
                    flex items-center justify-center text-blue-500 dark:text-blue-400">
                    <SocialIcon platform={s.platform} />
                  </div>
                  {s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}
                  <span className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">›</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Badges */}
          {instructor.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="rounded-[22px] p-5
                bg-white dark:bg-[#0f1420]
                border border-gray-100 dark:border-white/[0.07]
                shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">
                Recognition
              </p>
              <div className="flex flex-wrap gap-2">
                {instructor.badges.map((b) => (
                  <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                    bg-gradient-to-r from-blue-50 to-indigo-50
                    dark:from-blue-950/40 dark:to-indigo-950/40
                    border border-blue-200 dark:border-blue-800/50
                    text-blue-600 dark:text-blue-400">
                    <Award className="w-3 h-3" /> {b}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}