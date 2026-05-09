import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, BookOpen,
  Globe, Mail, CheckCircle,
  Play,
  ChevronDown, ChevronUp,
} from "lucide-react";
import UserService, { type PublicInstructorProfile } from "@/services/user.service";
import CoursesService from "@/services/course.service";
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SingleInstructor() {
  const { id } = useParams<{ id: string }>();
  const [showContact, setShowContact] = useState(false);
  const [showAllExpertise, setShowAllExpertise] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: profileRaw, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useQuery<PublicInstructorProfile>({
    queryKey: ["instructor-public", id],
    queryFn: () => UserService.findOneInstructorPublic(id!),
    enabled: !!id,
    retry: 1,
  });

  const { data: coursesRaw } = useQuery({
    queryKey: ["instructor-courses-public", id],
    queryFn: () => CoursesService.findAll({ instructorId: id, limit: 6 }),
    enabled: !!id,
  });



  const { data: enrollmentsRaw } = useQuery({
    queryKey: ["enrollments-mine"],
    queryFn: () => EnrollmentService.getMine(),
  });

  // ── Normalize ──────────────────────────────────────────────────────────────
  const profile = profileRaw;
  const name = profile?.user?.name ?? "Instructor";
  const image = profile?.user?.image ?? null;
  const bio = profile?.bio ?? profile?.description ?? "";
  const specialization = profile?.specialization ?? "";
  const expertise: string[] = profile?.areasOfExpertise ?? [];
  const website: string | null = profile?.website ?? null;
  const email: string | null = profile?.user?.email ?? null;



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

  const visibleExpertise = showAllExpertise ? expertise : expertise.slice(0, 5);

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
                  { icon: BookOpen, n: String(courses.length), l: "Courses" },
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

                {website && (
                  <motion.a
                    href={website.startsWith('http://') || website.startsWith('https://') ? website : `https://${website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
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


        </div>

        {/* ── Right: sidebar ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-[22px] p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">At a Glance</p>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { n: String(courses.length), s: "", l: "Courses" },
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
              {website && (
                <a href={website.startsWith('http://') || website.startsWith('https://') ? website : `https://${website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
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


      </AnimatePresence>
    </div>
  );
}
