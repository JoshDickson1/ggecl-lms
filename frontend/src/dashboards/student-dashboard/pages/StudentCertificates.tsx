// src/dashboards/student-dashboard/pages/StudentCertificates.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap, Lock, Download, Share2, ExternalLink,
  Award, CheckCircle2, BookOpen, Search,
  Calendar, Star, ChevronRight, Loader2, Sparkles,
} from "lucide-react";
import CertificateService, {
  type GeneratedCertificate,
  type EligibleCourse,
  type IneligibleCourse,
} from "@/services/certificate.service";
import { useAuth } from "@/context/AuthProvider";
import { ApiErrorPage } from "@/components/ui/ApiError";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GRADIENTS = [
  "from-violet-500 to-purple-400",
  "from-amber-500 to-yellow-400",
  "from-sky-500 to-blue-400",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-pink-400",
  "from-indigo-500 to-blue-400",
  "from-orange-500 to-amber-400",
  "from-cyan-500 to-blue-400",
];

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function gradientFor(id: string) { return GRADIENTS[strHash(id) % GRADIENTS.length]; }

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06] ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto pb-10 space-y-8">
      <Sk className="h-12 w-64" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Sk key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-64 rounded-[22px]" />)}
      </div>
    </div>
  );
}

// ─── Certificate card ─────────────────────────────────────────────────────────

function CertificateCard({ cert, index, studentName }: {
  cert: GeneratedCertificate;
  index: number;
  studentName: string;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const gradient = gradientFor(cert.courseId);

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
        <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient}
              flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.15)] flex-shrink-0`}>
              {cert.courseImg ? (
                <img src={cert.courseImg} alt={cert.courseTitle}
                  className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <GraduationCap className="w-6 h-6 text-white" />
              )}
            </div>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold
              bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400
              border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 className="w-3 h-3" /> Issued
            </span>
          </div>

          <h3 className="text-sm font-black text-gray-900 dark:text-white leading-snug mb-1
            group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {cert.courseTitle}
          </h3>

          <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Certificate ID: {cert.id.slice(-8).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {fmtDate(cert.issuedAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(cert.fileUrl); }}
                title="Copy link"
                className="w-8 h-8 rounded-xl flex items-center justify-center
                  bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]
                  text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all">
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <a
                href={cert.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="w-8 h-8 rounded-xl flex items-center justify-center
                  bg-blue-600 hover:bg-blue-500 text-white
                  shadow-[0_3px_10px_rgba(59,130,246,0.35)] transition-all">
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetail && (
          <CertificateModal cert={cert} studentName={studentName} onClose={() => setShowDetail(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Certificate detail modal ─────────────────────────────────────────────────

function CertificateModal({ cert, studentName, onClose }: {
  cert: GeneratedCertificate;
  studentName: string;
  onClose: () => void;
}) {
  const gradient = gradientFor(cert.courseId);

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
        <div className={`relative h-52 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-6`}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-xl overflow-hidden">
              {cert.courseImg
                ? <img src={cert.courseImg} alt={cert.courseTitle} className="w-full h-full object-cover" />
                : <GraduationCap className="w-7 h-7 text-white" />
              }
            </div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Certificate of Completion</p>
            <p className="text-white text-lg font-black leading-tight px-4">{cert.courseTitle}</p>
            <p className="text-white/70 text-xs mt-2">Awarded to: {studentName}</p>
          </div>
          <div className="absolute bottom-4 right-4 opacity-30">
            <p className="text-white text-[10px] font-black tracking-widest">GGECL LMS</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Issued",        value: fmtDate(cert.issuedAt)              },
              { label: "Certificate ID", value: cert.id.slice(-12).toUpperCase()   },
              { label: "Course ID",     value: cert.courseId.slice(-8).toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <a
              href={cert.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold
                bg-blue-600 hover:bg-blue-500 text-white
                shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all">
              <Download className="w-4 h-4" /> Download PDF
            </a>
            <button
              onClick={() => navigator.clipboard?.writeText(cert.fileUrl)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
                hover:border-blue-200 hover:text-blue-600 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <a
              href={cert.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
                hover:border-blue-200 hover:text-blue-600 transition-all">
              <ExternalLink className="w-4 h-4" /> View
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Eligible course card (claim certificate) ─────────────────────────────────

function EligibleCard({ course, index, onClaim, isClaiming }: {
  course: EligibleCourse;
  index: number;
  onClaim: (courseId: string) => void;
  isClaiming: boolean;
}) {
  const gradient = gradientFor(course.courseId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 rounded-[18px]
        bg-white dark:bg-[#0f1623]
        border border-emerald-100 dark:border-emerald-900/30
        shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
    >
      <div className={`relative w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden`}>
        {course.courseImg
          ? <img src={course.courseImg} alt={course.courseTitle} className="w-full h-full object-cover" />
          : <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">
          {course.courseTitle}
        </p>
        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold
          text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3 h-3" /> Course completed
        </span>
      </div>

      <button
        disabled={isClaiming}
        onClick={() => onClaim(course.courseId)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
          bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed
          text-white shadow-[0_3px_10px_rgba(16,185,129,0.3)] transition-all flex-shrink-0">
        {isClaiming
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Sparkles className="w-3.5 h-3.5" />
        }
        {isClaiming ? "Generating…" : "Claim"}
      </button>
    </motion.div>
  );
}

// ─── Ineligible (in-progress) course card ────────────────────────────────────

function IneligibleCard({ course, index }: { course: IneligibleCourse; index: number }) {
  const gradient = gradientFor(course.courseId);

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
      <div className={`relative w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden`}>
        {course.courseImg
          ? <img src={course.courseImg} alt={course.courseTitle} className="w-full h-full object-cover" />
          : <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
        }
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Lock className="w-5 h-5 text-white/80" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">
          {course.courseTitle}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Complete this course to earn a certificate</p>
      </div>

      <Link
        to={`/student/courses/${course.courseId}/watch`}
        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0">
        Continue <ChevronRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentCertificates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["certificates-dashboard"],
    queryFn: () => CertificateService.getDashboard(),
  });

  const generateMutation = useMutation({
    mutationFn: (courseId: string) => CertificateService.generate(courseId),
    onMutate: (courseId) => setClaimingId(courseId),
    onSettled: () => setClaimingId(null),
    onSuccess: () => {
      // Refresh the dashboard so the new cert moves from eligible → generated
      queryClient.invalidateQueries({ queryKey: ["certificates-dashboard"] });
    },
  });

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ApiErrorPage onRetry={refetch} message="Failed to load certificates." />;

  const generated = data?.generated ?? [];
  const eligible  = data?.eligible  ?? [];
  const ineligible = data?.ineligible ?? [];

  const studentName = user?.name ?? "Student";

  // Search filter on generated certs
  const filtered = generated.filter(c =>
    !search || c.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1100px] mx-auto pb-10 space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          My <span className="text-blue-600 dark:text-blue-400">Certificates</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {generated.length} certificate{generated.length !== 1 ? "s" : ""} earned
          {eligible.length > 0 && ` · ${eligible.length} ready to claim`}
          {ineligible.length > 0 && ` · ${ineligible.length} in progress`}
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { icon: Award,    value: String(generated.length),  label: "Earned",       color: "emerald" },
          { icon: Sparkles, value: String(eligible.length),   label: "Ready to Claim", color: "amber"  },
          { icon: Lock,     value: String(ineligible.length), label: "In Progress",  color: "blue"    },
          { icon: Star,     value: generated.length > 0 ? "Pass" : "—", label: "Status", color: "blue" },
        ].map(({ icon: Icon, value, label, color }) => {
          const palette: Record<string, string> = {
            emerald: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/20 [&_div]:bg-emerald-100 dark:[&_div]:bg-emerald-900/40 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400",
            blue:    "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/20 [&_div]:bg-blue-100 dark:[&_div]:bg-blue-900/40 [&_svg]:text-blue-600 dark:[&_svg]:text-blue-400",
            amber:   "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/20 [&_div]:bg-amber-100 dark:[&_div]:bg-amber-900/40 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400",
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

      {/* Claim eligible certificates */}
      {eligible.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Ready to Claim
            <span className="text-sm font-medium text-gray-400">— you've completed these courses</span>
          </h2>
          <div className="flex flex-col gap-3">
            {eligible.map((course, i) => (
              <EligibleCard
                key={course.courseId}
                course={course}
                index={i}
                onClaim={(id) => generateMutation.mutate(id)}
                isClaiming={claimingId === course.courseId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search certificates…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
            bg-white dark:bg-[#0f1623]
            border border-gray-200 dark:border-white/[0.08]
            text-gray-800 dark:text-white placeholder:text-gray-400
            outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all
            shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        />
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
              <CertificateCard key={cert.id} cert={cert} index={i} studentName={studentName} />
            ))}
          </div>
        ) : generated.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08]">
            <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No certificates yet.</p>
            <p className="text-xs text-gray-400 mt-1">Complete a course to earn your first certificate.</p>
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08]">
            <p className="text-sm text-gray-400">No certificates match your search.</p>
          </div>
        )}
      </section>

      {/* In progress / ineligible */}
      {ineligible.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-400" />
            In Progress
            <span className="text-sm font-medium text-gray-400">— complete the course to unlock your certificate</span>
          </h2>
          <div className="flex flex-col gap-3 mt-4">
            {ineligible.map((course, i) => (
              <IneligibleCard key={course.courseId} course={course} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
