// src/dashboards/student-dashboard/pages/StudentCertificates.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  GraduationCap, Lock, Download, Share2, ExternalLink,
  Award, CheckCircle2, BookOpen, Search,
  Calendar, Star, ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  instructor: string;
  instructorBg: string;
  instructorAvatar: string;
  thumbnail: string;
  completedAt: string;
  credentialId: string;
  duration: string;
  lectures: number;
  grade?: string;
  skills: string[];
}

interface LockedCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  lectures: number;
  totalLectures: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const EARNED: Certificate[] = [
  {
    id: "cert-1",
    courseId: "mkt-001",
    courseTitle: "Digital Marketing Masterclass: SEO, Ads & Social",
    instructor: "Amara Nwosu",
    instructorBg: "bg-pink-500",
    instructorAvatar: "AN",
    thumbnail: "from-violet-500 to-purple-400",
    completedAt: "January 14, 2024",
    credentialId: "GGECL-2024-MKT-00142",
    duration: "31h 20m",
    lectures: 228,
    grade: "A",
    skills: ["SEO", "Google Ads", "Content Strategy", "Analytics", "Social Media"],
  },
  {
    id: "cert-2",
    courseId: "wri-001",
    courseTitle: "Creative Writing: From Blank Page to Published",
    instructor: "Luca Romano",
    instructorBg: "bg-blue-500",
    instructorAvatar: "LR",
    thumbnail: "from-amber-500 to-yellow-400",
    completedAt: "November 3, 2023",
    credentialId: "GGECL-2023-WRI-00089",
    duration: "14h 20m",
    lectures: 112,
    grade: "A+",
    skills: ["Storytelling", "Character Development", "Editing", "Plot Structure"],
  },
  {
    id: "cert-3",
    courseId: "biz-001",
    courseTitle: "The Complete Entrepreneurship & Startup Playbook",
    instructor: "Priya Sharma",
    instructorBg: "bg-rose-500",
    instructorAvatar: "PS",
    thumbnail: "from-sky-500 to-blue-400",
    completedAt: "September 28, 2023",
    credentialId: "GGECL-2023-BIZ-00067",
    duration: "44h 10m",
    lectures: 328,
    grade: "B+",
    skills: ["Business Strategy", "Fundraising", "Product", "Leadership", "Finance"],
  },
];

const LOCKED: LockedCourse[] = [
  {
    id: "dev-001",
    title: "The Complete React & TypeScript Bootcamp 2024",
    instructor: "Sarah Mitchell",
    thumbnail: "from-blue-500 to-blue-400",
    progress: 78,
    lectures: 244,
    totalLectures: 312,
  },
  {
    id: "dev-002",
    title: "Node.js, Express & MongoDB: Backend Masterclass",
    instructor: "James Okafor",
    thumbnail: "from-green-500 to-emerald-400",
    progress: 45,
    lectures: 119,
    totalLectures: 264,
  },
  {
    id: "biz-002",
    title: "Financial Modelling & Valuation Analyst (FMVA)",
    instructor: "Priya Sharma",
    thumbnail: "from-blue-600 to-indigo-400",
    progress: 20,
    lectures: 48,
    totalLectures: 242,
  },
];

const GRADE_COLOR: Record<string, string> = {
  "A+": "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50",
  "A":  "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50",
  "B+": "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50",
  "B":  "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50",
};

// ─── Certificate card ─────────────────────────────────────────────────────────
function CertificateCard({ cert, index }: { cert: Certificate; index: number }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06 }}
        className="rounded-[22px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_4px_24px_rgba(0,0,0,0.05)]
          hover:shadow-[0_0_0_1.5px_rgba(59,130,246,0.3),0_8px_32px_rgba(59,130,246,0.1)]
          transition-all duration-300 overflow-hidden group cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        {/* Top gradient band */}
        <div className={`h-2 w-full bg-gradient-to-r ${cert.thumbnail}`} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cert.thumbnail}
              flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.15)] flex-shrink-0`}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {cert.grade && (
                <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${GRADE_COLOR[cert.grade] ?? GRADE_COLOR["B"]}`}>
                  {cert.grade}
                </span>
              )}
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold
                bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400
                border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-black text-gray-900 dark:text-white leading-snug mb-1
            group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {cert.courseTitle}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-1.5 mb-4">
            <span className={`w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0 ${cert.instructorBg}`}>
              {cert.instructorAvatar}
            </span>
            <span className="text-xs text-gray-400">{cert.instructor}</span>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {cert.skills.slice(0, 3).map(s => (
              <span key={s} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold
                bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]
                text-gray-500 dark:text-gray-400">
                {s}
              </span>
            ))}
            {cert.skills.length > 3 && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-gray-400">
                +{cert.skills.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {cert.completedAt}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={e => { e.stopPropagation(); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center
                  bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]
                  text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all">
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center
                  bg-blue-600 hover:bg-blue-500 text-white
                  shadow-[0_3px_10px_rgba(59,130,246,0.35)] transition-all">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detail modal */}
      <AnimatePresence>
        {showDetail && (
          <CertificateModal cert={cert} onClose={() => setShowDetail(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Certificate detail modal ─────────────────────────────────────────────────
function CertificateModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden"
      >
        {/* Certificate preview */}
        <div className={`relative h-52 bg-gradient-to-br ${cert.thumbnail} flex flex-col items-center justify-center p-6`}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-xl">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Certificate of Completion</p>
            <p className="text-white text-lg font-black leading-tight px-4">{cert.courseTitle}</p>
            <p className="text-white/70 text-xs mt-2">Awarded to: Emeka Okonkwo</p>
          </div>
          {/* GGECL watermark */}
          <div className="absolute bottom-4 right-4 opacity-30">
            <p className="text-white text-[10px] font-black tracking-widest">GGECL LMS</p>
          </div>
        </div>

        <div className="p-6">
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Issued",         value: cert.completedAt          },
              { label: "Credential ID",  value: cert.credentialId         },
              { label: "Duration",       value: cert.duration             },
              { label: "Lectures",       value: String(cert.lectures)     },
              { label: "Instructor",     value: cert.instructor           },
              { label: "Grade",          value: cert.grade ?? "Pass"      },
            ].map(({ label, value }) => (
              <div key={label} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="mb-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Skills Certified</p>
            <div className="flex flex-wrap gap-1.5">
              {cert.skills.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold
                  bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300
                  border border-blue-200 dark:border-blue-800/50">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold
              bg-blue-600 hover:bg-blue-500 text-white
              shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
              border border-gray-200 dark:border-white/[0.08]
              text-gray-600 dark:text-gray-400
              hover:border-blue-200 hover:text-blue-600 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
              border border-gray-200 dark:border-white/[0.08]
              text-gray-600 dark:text-gray-400
              hover:border-blue-200 hover:text-blue-600 transition-all">
              <ExternalLink className="w-4 h-4" /> Verify
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Locked course card ───────────────────────────────────────────────────────
function LockedCard({ course, index }: { course: LockedCourse; index: number }) {
  const remaining = course.totalLectures - course.lectures;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 rounded-[18px]
        bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
    >
      {/* Thumbnail */}
      <div className={`relative w-14 h-14 rounded-2xl flex-shrink-0 bg-gradient-to-br ${course.thumbnail} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Lock className="w-5 h-5 text-white/80" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/courses/${course.id}`}
          className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1
            hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {course.title}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">{course.instructor}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.07] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
            />
          </div>
          <span className="text-[11px] font-bold text-blue-500 flex-shrink-0">{course.progress}%</span>
        </div>
      </div>

      {/* Remaining */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{remaining}</p>
        <p className="text-[10px] text-gray-400">lectures left</p>
        <Link to={`/student/courses/${course.id}/watch`}
          className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
          Continue <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StudentCertificates() {
  const [search, setSearch] = useState("");

  const filtered = EARNED.filter(c =>
    !search || c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1100px] mx-auto pb-10 space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          My <span className="text-blue-600 dark:text-blue-400">Certificates</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {EARNED.length} certificate{EARNED.length !== 1 ? "s" : ""} earned · {LOCKED.length} in progress
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Award,        value: String(EARNED.length),  label: "Earned",       color: "emerald" },
          { icon: Lock,         value: String(LOCKED.length),  label: "In Progress",  color: "blue"    },
          { icon: Star,         value: "A",                    label: "Avg Grade",    color: "amber"   },
          { icon: BookOpen,     value: "57h",                  label: "Total Study",  color: "blue"    },
        ].map(({ icon: Icon, value, label, color }) => {
          const palette: Record<string, string> = {
            emerald: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/20 [&_div]:bg-emerald-100 dark:[&_div]:bg-emerald-900/40 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400",
            blue:    "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/20 [&_div]:bg-blue-100 dark:[&_div]:bg-blue-900/40 [&_svg]:text-blue-600 dark:[&_svg]:text-blue-400",
            amber:   "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/20 [&_div]:bg-amber-100 dark:[&_div]:bg-amber-900/40 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400",
            cyan:    "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/20 [&_div]:bg-blue-100 dark:[&_div]:bg-blue-900/40 [&_svg]:text-blue-600 dark:[&_svg]:text-blue-400",
          };
          return (
            <div key={label} className={`flex flex-col items-center py-5 px-3 rounded-2xl border transition-colors ${palette[color]}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center">{label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search certificates…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
            bg-white dark:bg-[#0f1623]
            border border-gray-200 dark:border-white/[0.08]
            text-gray-800 dark:text-white placeholder:text-gray-400
            outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all
            shadow-[0_2px_8px_rgba(0,0,0,0.04)]" />
      </motion.div>

      {/* Earned certificates */}
      <section>
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-500" />
          Earned Certificates
        </h2>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((cert, i) => (
              <CertificateCard key={cert.id} cert={cert} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08]">
            <p className="text-sm text-gray-400">No certificates match your search.</p>
          </div>
        )}
      </section>

      {/* Locked / in progress */}
      <section>
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" />
          In Progress
          <span className="text-sm font-medium text-gray-400">— complete the course to unlock your certificate</span>
        </h2>
        <div className="flex flex-col gap-3 mt-4">
          {LOCKED.map((course, i) => (
            <LockedCard key={course.id} course={course} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}