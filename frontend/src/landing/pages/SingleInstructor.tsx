// src/landing/pages/SingleInstructor.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Globe,
  Briefcase, Mail, CheckCircle, Loader2,
} from "lucide-react";
import { PageHeroBg } from "@/landing/pages/SingleCategory";
import UserService from "@/services/user.service";
import CoursesService from "@/services/course.service";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
.font-syne { font-family: 'Syne', system-ui, sans-serif; }
.font-dm   { font-family: 'DM Sans', system-ui, sans-serif; }`;

// ─── API Types ────────────────────────────────────────────────────────────────

interface InstructorProfile {
  bio: string | null;
  description: string | null;
  tags: string[];
  areasOfExpertise: string[];
  teachingCategories: string[];
  specialization: string | null;
  website: string | null;
}

interface PublicInstructor {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  instructorProfile: InstructorProfile | null;
}

interface PublicCourse {
  id: string;
  title: string;
  img: string | null;
  price: number;
  level: string;
  tags: string[];
  averageRating: number;
  _count: { enrollments: number };
  totalLectures: number;
  instructor: {
    user: { id: string; name: string; image: string | null };
  };
}

interface PublicCoursesResponse {
  items: PublicCourse[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-rose-500",  "bg-amber-500",  "bg-cyan-500",
];

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

function initials(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

const COURSE_GRADIENTS = [
  "from-blue-500 to-blue-700", "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-700", "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-600",
];

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i + 1 <= Math.round(rating) ? "#FFC806" : "#374151"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Course snippet card ──────────────────────────────────────────────────────

function CourseSnippetCard({ course, index }: { course: PublicCourse; index: number }) {
  return (
    <motion.div whileHover={{ y: -2 }}
      className="flex gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04]
        border border-gray-100 dark:border-white/[0.07]
        hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-200 cursor-pointer">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${COURSE_GRADIENTS[index % COURSE_GRADIENTS.length]}
        flex items-center justify-center flex-shrink-0 overflow-hidden`}>
        {course.img
          ? <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
          : <span className="text-white font-black text-sm">{course.title.slice(0, 2).toUpperCase()}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <Link to={`/courses/${course.id}`}>
          <p className="text-xs font-bold text-gray-800 dark:text-white line-clamp-2 leading-snug
            hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {course.title}
          </p>
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <Stars rating={course.averageRating} size={10} />
          <span className="text-[10px] font-bold text-amber-500">
            {course.averageRating > 0 ? course.averageRating.toFixed(1) : "New"}
          </span>
          <span className="text-[10px] text-gray-400">{fmt(course._count?.enrollments ?? 0)} students</span>
        </div>
        <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-1">${course.price.toFixed(2)}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SingleInstructor() {
  const { id } = useParams<{ id: string }>();
  const [showAllExpertise, setShowAllExpertise] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showContact, setShowContact] = useState(false);

  // Fetch instructor public profile by user.id
  const { data: instructor, isLoading, isError } = useQuery<PublicInstructor>({
    queryKey: ["instructor-public", id],
    queryFn:  () => UserService.findOnePublic(id!) as Promise<PublicInstructor>,
    enabled:  !!id,
  });

  // Fetch all public courses, then filter by this instructor's user.id
  const { data: coursesData } = useQuery<PublicCoursesResponse>({
    queryKey: ["courses-public-all"],
    queryFn:  () => CoursesService.findAllPublic() as Promise<PublicCoursesResponse>,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError || !instructor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Instructor not found.</p>
        <Link to="/instructors" className="text-blue-500 hover:underline text-sm">Back to instructors</Link>
      </div>
    );
  }

  const profile        = instructor.instructorProfile;
  const bio            = profile?.bio ?? profile?.description ?? "";
  const expertise      = profile?.areasOfExpertise ?? [];
  const categories     = profile?.teachingCategories ?? [];
  const tags           = profile?.tags ?? [];
  const website        = profile?.website;
  const specialization = profile?.specialization ?? categories[0] ?? "Instructor";
  const visibleExpertise = showAllExpertise ? expertise : expertise.slice(0, 5);
  const avatarColor    = AVATAR_COLORS[0];
  const showPhoto      = !!instructor.image && !imgError;

  // Filter courses to only this instructor's — matched by user.id from the URL param
  const instructorCourses = (coursesData?.items ?? [])
    .filter(c => c.instructor?.user?.id === id)
    .slice(0, 4);

  return (
    <div className="font-dm min-h-screen bg-[#f8fafc] dark:bg-[#080c17]">
      <style>{FONTS}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white pt-18 md:pt-30 dark:bg-[#0a0c1c]">
        <PageHeroBg />
        <div className="relative max-w-[1120px] mx-auto px-6 pt-10 pb-14">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-[12.5px] text-gray-400 mb-8">
            <Link to="/" className="text-blue-500 hover:underline font-medium">Home</Link>
            <span className="opacity-40">›</span>
            <Link to="/instructors" className="text-blue-500 hover:underline font-medium">Instructors</Link>
            <span className="opacity-40">›</span>
            <span className="text-gray-500">{instructor.name}</span>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Avatar */}
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.05 }} className="relative flex-shrink-0">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[28px] overflow-hidden
                shadow-[0_8px_32px_rgba(59,130,246,0.22)] border-[3px] border-blue-400/25">
                <div className={`absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-white ${avatarColor}`}>
                  {initials(instructor.name)}
                </div>
                {showPhoto && (
                  <img src={instructor.image!} alt={instructor.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    onError={() => setImgError(true)} />
                )}
              </div>
              <span className="absolute bottom-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-400
                border-[2.5px] border-white dark:border-[#0a0c1c] shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }} className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">Verified Instructor</span>
              </div>

              <h1 className="font-syne text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight
                text-gray-900 dark:text-white mb-2">
                {instructor.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-light mb-5">{specialization}</p>

              {(categories.length > 0 || tags.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {[...categories, ...tags].slice(0, 4).map(t => (
                    <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold capitalize
                      bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40
                      text-blue-600 dark:text-blue-400">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2.5">
                <motion.button
                  onClick={() => setShowContact(true)}
                  whileHover={{ y: -2, boxShadow: "0 10px 28px rgba(59,130,246,0.5)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                    bg-gradient-to-br from-blue-500 to-blue-700 text-white
                    text-sm font-semibold shadow-[0_4px_18px_rgba(59,130,246,0.38)] transition-shadow">
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
                              {instructor.email ?? "No email on file"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {instructor.email ? (
                            <a href={`mailto:${instructor.email}`}
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
                {website && (
                  <motion.a href={website} target="_blank" rel="noopener noreferrer" whileHover={{ y: -1 }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full
                      border border-gray-200 dark:border-white/[0.10]
                      text-gray-600 dark:text-gray-300 text-sm font-medium
                      hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400
                      transition-all bg-white/50 dark:bg-white/[0.03]">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-blue-200/40 dark:via-blue-800/20 to-transparent" />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-[1120px] mx-auto px-6 py-12 pb-24
        grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">

        {/* ── Left ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-7">

          {/* About */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="rounded-[22px] p-7 bg-white dark:bg-[#0f1420]
              border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
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
            {bio ? (
              <p className="text-sm font-light leading-relaxed text-gray-500 dark:text-gray-400">{bio}</p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">No bio added yet.</p>
            )}
          </motion.div>

          {/* Expertise */}
          {expertise.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              className="rounded-[22px] p-7 bg-white dark:bg-[#0f1420]
                border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
                  <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
                </div>
                <h2 className="font-syne text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Areas of Expertise</h2>
              </div>
              <ul className="flex flex-col gap-2">
                <AnimatePresence>
                  {visibleExpertise.map((item, i) => (
                    <motion.li key={item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.04 }} whileHover={{ x: 4 }}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                        border border-blue-50 dark:border-blue-900/20
                        bg-blue-50/50 dark:bg-blue-950/10
                        text-sm text-gray-700 dark:text-gray-300
                        hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-default">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" strokeWidth={2} />
                      {item}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              {expertise.length > 5 && (
                <button onClick={() => setShowAllExpertise(p => !p)}
                  className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  {showAllExpertise ? "Show less" : `Show all ${expertise.length} skills`}
                  <motion.span animate={{ rotate: showAllExpertise ? 180 : 0 }} transition={{ duration: 0.22 }}>↓</motion.span>
                </button>
              )}
            </motion.div>
          )}

          {/* Courses — only shown if this instructor has courses */}
          {instructorCourses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-[22px] p-7 bg-white dark:bg-[#0f1420]
                border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
                  <Briefcase className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
                </div>
                <h2 className="font-syne text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Their Courses</h2>
              </div>
              <div className="flex flex-col gap-3">
                {instructorCourses.map((c, i) => <CourseSnippetCard key={c.id} course={c} index={i} />)}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Quick stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-[22px] p-5 bg-white dark:bg-[#0f1420]
              border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">At a Glance</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
              { n: instructorCourses.length.toString(), s: "", l: "Courses"   },
              { n: specialization,                      s: "", l: "Specialty" },
              ].map(({ n, s, l }) => (
              <div key={l} className="flex flex-col items-center py-3.5 rounded-2xl
                bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/20
                hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                <div className="font-syne text-lg font-extrabold text-gray-900 dark:text-white leading-none text-center px-2 truncate w-full">
                {n}<span className="text-blue-500 dark:text-blue-400">{s}</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{l}</div>
              </div>
              ))}
            </div>
            </motion.div>

          {/* Categories */}
          {categories.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="rounded-[22px] p-5 bg-white dark:bg-[#0f1420]
                border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">Teaching Areas</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <span key={c} className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize
                    bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40
                    text-blue-600 dark:text-blue-400">
                    {c}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Connect */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="rounded-[22px] p-5 bg-white dark:bg-[#0f1420]
              border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">Connect</p>
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
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full
                    border border-gray-100 dark:border-white/[0.07]
                    text-sm font-medium text-gray-600 dark:text-gray-300
                    hover:border-blue-200 dark:hover:border-blue-800/50
                    hover:bg-blue-50/40 dark:hover:bg-blue-950/20
                    hover:text-blue-600 dark:hover:text-blue-400 transition-all group">
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 bg-blue-50 dark:bg-blue-950/40
                    border border-blue-100 dark:border-blue-900/30
                    flex items-center justify-center text-blue-500 dark:text-blue-400">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  Website
                  <span className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">›</span>
                </a>
              )}
            </div>
          </motion.div>

          {/* All instructors link */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <Link to="/instructors"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl w-full
                border border-gray-200 dark:border-white/[0.08]
                text-sm font-semibold text-gray-600 dark:text-gray-300
                hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400
                transition-all">
              Browse all instructors <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}