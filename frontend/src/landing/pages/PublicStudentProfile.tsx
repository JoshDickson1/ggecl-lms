// src/landing/pages/PublicStudentProfile.tsx
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Mail, Calendar, BookOpen, Award,
  Star, Target, Tag, Trophy, Users, CheckCircle2, Clock,
  TrendingUp, FileText, BarChart3, GraduationCap, Layers,
  Download, Shield, ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";
import { STUDENTS, gradeColor } from "./OurStudents";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&family=Dancing+Script:wght@700&display=swap');`;

function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function SectionCard({ title, icon: Icon, children, delay = 0, className = "" }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <FadeUp delay={delay} className={className}>
      <div className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </FadeUp>
  );
}

// ─── Certificate component (visual replica of GGECL cert) ─────────────────────

function Certificate({ cert, studentName }: {
  cert: { course: string; date: string; credentialId: string; grade: string };
  studentName: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[18px] overflow-hidden border border-gray-200 dark:border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
      {/* collapsed preview */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0d2a6e]/10 to-indigo-50 dark:from-[#0d2a6e]/30 dark:to-indigo-950/20 hover:brightness-105 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d2a6e] to-blue-700 flex items-center justify-center flex-shrink-0">
            <Award className="w-4.5 h-4.5 text-white w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{cert.course}</p>
            <p className="text-xs text-gray-400 mt-0.5">{cert.date} · {cert.credentialId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${gradeColor(cert.grade)}`}>
            {cert.grade}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* full certificate */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-4 bg-gray-50 dark:bg-black/20">
              {/* Certificate visual */}
              <div className="relative bg-white rounded-[14px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.12)] select-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>

                {/* Top wave decoration */}
                <div className="relative h-28 overflow-hidden bg-white">
                  <svg viewBox="0 0 800 120" className="absolute bottom-0 w-full" preserveAspectRatio="none">
                    <path d="M0,80 C150,20 350,110 500,60 C650,10 750,80 800,50 L800,0 L0,0 Z" fill="#dbeafe" opacity="0.5" />
                    <path d="M0,90 C120,40 300,100 480,55 C620,20 720,85 800,55 L800,0 L0,0 Z" fill="#bfdbfe" opacity="0.4" />
                    <path d="M0,100 C100,60 280,95 450,65 C600,38 720,90 800,65 L800,0 L0,0 Z" fill="#93c5fd" opacity="0.3" />
                  </svg>
                  {/* Logos row */}
                  <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-8">
                    {/* GGECL logo left */}
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-full border-2 border-[#0d2a6e] flex items-center justify-center bg-white shadow-sm">
                        <div className="text-[7px] font-black text-[#0d2a6e] text-center leading-tight">
                          <div className="text-[9px]">GG</div>
                          <div>ECOL</div>
                        </div>
                      </div>
                    </div>
                    {/* Title center */}
                    <div className="text-center">
                      <p className="text-[10px] font-black text-[#0d2a6e] tracking-wider uppercase leading-tight">
                        Golden Goshen Educational<br />Consultancy
                      </p>
                    </div>
                    {/* CPD badge right */}
                    <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-50 flex flex-col items-center justify-center shadow-sm">
                      <span className="text-[6px] font-black text-amber-600 uppercase tracking-wide leading-none">THE</span>
                      <span className="text-[8px] font-black text-amber-600">CPD</span>
                      <span className="text-[5px] font-black text-amber-600 uppercase tracking-wide leading-none">GROUP</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-10 py-6 text-center bg-white">
                  <div className="mb-3">
                    <h2 className="text-3xl font-black text-[#0d2a6e] tracking-[0.12em] uppercase mb-1"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      Certificate
                    </h2>
                    <p className="text-sm font-bold text-[#1e5aad] uppercase tracking-[0.3em]">of Completion</p>
                  </div>

                  <p className="text-sm text-gray-500 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    This certificate is proudly presented to
                  </p>

                  {/* Student name in cursive style */}
                  <div className="border-b-2 border-gray-300 pb-2 mb-3 inline-block min-w-[280px]">
                    <p className="text-2xl text-[#0d2a6e]" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}>
                      {studentName}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-sm mx-auto">
                    for successfully completing the{" "}
                    <strong className="text-gray-900">{cert.course}</strong>{" "}
                    on {cert.date}
                  </p>

                  {/* Signatures row */}
                  <div className="flex items-end justify-between mb-2 px-4">
                    {/* Sig 1 */}
                    <div className="text-center">
                      <div className="border-t-2 border-gray-400 pt-2 mb-0.5">
                        <p className="text-[10px] font-black text-gray-700">Daniel Vincent</p>
                        <p className="text-[9px] text-gray-400">Chief Executive Officer</p>
                      </div>
                    </div>

                    {/* Medal */}
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center shadow-md border-4 border-amber-200">
                        <Award className="w-6 h-6 text-amber-800" />
                      </div>
                      <div className="flex gap-1 mt-1">
                        {["#1d4ed8","#3b82f6","#60a5fa"].map((c, i) => (
                          <div key={i} className="w-1.5 h-5 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>

                    {/* Sig 2 */}
                    <div className="text-center">
                      <div className="border-t-2 border-gray-400 pt-2 mb-0.5">
                        <p className="text-[10px] font-black text-gray-700">Ify Willoughby</p>
                        <p className="text-[9px] text-gray-400">Training Coordinator</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom wave */}
                <div className="relative h-16 overflow-hidden">
                  <svg viewBox="0 0 800 80" className="absolute top-0 w-full h-full" preserveAspectRatio="none">
                    <path d="M0,0 C150,60 350,10 550,50 C700,80 780,20 800,30 L800,80 L0,80 Z" fill="#0d2a6e" />
                    <path d="M0,15 C120,65 320,5 520,45 C680,75 770,25 800,40 L800,80 L0,80 Z" fill="#1e3a8a" opacity="0.8" />
                  </svg>
                  {/* Credential + QR area */}
                  <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
                    <p className="text-[8px] text-white/60 font-mono">{cert.credentialId}</p>
                    {/* mini QR placeholder */}
                    <div className="w-8 h-8 bg-white rounded grid grid-cols-3 gap-[1px] p-0.5">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className={`rounded-[1px] ${[0,1,2,3,5,6,8].includes(i) ? "bg-gray-900" : "bg-white"}`} />
                      ))}
                    </div>
                  </div>
                  {/* amber accent corner */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-amber-400 to-amber-300 opacity-80" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0d2a6e] hover:bg-[#0a2060] text-white text-xs font-bold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors">
                  <Shield className="w-3.5 h-3.5" /> Verify
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Course row ───────────────────────────────────────────────────────────────

function CourseRow({ course }: { course: { title: string; grade: string; completed: boolean; progress: number; instructor: string } }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${course.completed ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-blue-100 dark:bg-blue-950/40"}`}>
        {course.completed
          ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          : <Clock className="w-4 h-4 text-blue-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{course.title}</p>
        <p className="text-xs text-gray-400">by {course.instructor}</p>
        {!course.completed && (
          <div className="mt-1.5 h-1.5 w-full bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${course.progress}%` }} />
          </div>
        )}
      </div>
      <div className="flex-shrink-0 text-right">
        {course.completed
          ? <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${gradeColor(course.grade)}`}>{course.grade}</span>
          : <span className="text-xs text-blue-500 font-bold">{course.progress}%</span>
        }
      </div>
    </div>
  );
}

// ─── Assignment donut ─────────────────────────────────────────────────────────

function AssignmentDonut({ stats }: { stats: { total: number; submitted: number; graded: number; pending: number; avgScore: number } }) {
  const pct = Math.round((stats.submitted / stats.total) * 100);
  const r = 36, c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-white/[0.06]" />
          <circle cx="48" cy="48" r={r} fill="none" stroke="url(#ag)" strokeWidth="8"
            strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round" />
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-gray-900 dark:text-white">{pct}%</span>
          <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Done</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1">
        {[
          { label: "Total", value: stats.total, color: "text-gray-600 dark:text-gray-300" },
          { label: "Submitted", value: stats.submitted, color: "text-blue-600 dark:text-blue-400" },
          { label: "Graded", value: stats.graded, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Avg Score", value: `${stats.avgScore}%`, color: "text-violet-600 dark:text-violet-400" },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className={`text-base font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicStudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const student = STUDENTS.find(s => s.id === id);

  if (!student) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <GraduationCap className="w-16 h-16 text-gray-300 dark:text-gray-700" />
        <p className="text-xl font-black text-gray-900 dark:text-white">Student not found</p>
        <Link to="/our-students/public" className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">
          ← Back to Our Students
        </Link>
      </div>
    );
  }

  const initials = student.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const completedCourses = student.courses.filter(c => c.completed);
  const inProgressCourses = student.courses.filter(c => !c.completed);

  const statItems = [
    { label: "Courses Completed", value: student.stats.coursesCompleted, icon: BookOpen, color: "from-blue-500 to-indigo-600" },
    { label: "Certificates", value: student.certificates.length, icon: Award, color: "from-amber-400 to-orange-500" },
    { label: "Avg Grade", value: student.stats.avgGrade, icon: Star, color: "from-emerald-500 to-teal-600" },
    { label: "Assignments", value: student.stats.assignments, icon: FileText, color: "from-violet-500 to-purple-600" },
    { label: "Study Groups", value: student.stats.groups, icon: Users, color: "from-cyan-500 to-blue-500" },
    { label: "Hours Learned", value: `${student.stats.hoursLearned}h`, icon: Clock, color: "from-rose-500 to-pink-600" },
    { label: "Day Streak", value: `${student.stats.streak}d`, icon: TrendingUp, color: "from-lime-500 to-green-600" },
    { label: "Accomplishments", value: student.accomplishments.length, icon: Trophy, color: "from-red-500 to-rose-600" },
  ];

  return (
    <>
      <style>{FONTS}</style>

      {/* ── Hero / cover ── */}
      <div className={`relative h-64 md:h-80 bg-gradient-to-br ${student.gradient} overflow-hidden pt-20 pb-8`}>
        {/* pattern */}
        <div className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

        {/* back btn */}
        <div className="absolute top-20 left-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Our Students
          </button>
        </div>
      </div>

      {/* ── Profile header ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Avatar */}
          <div className={`w-28 h-28 md:w-32 md:h-32 rounded-[22px] bg-gradient-to-br ${student.gradient} flex items-center justify-center flex-shrink-0 border-4 border-white dark:border-[#0a0f1d] shadow-2xl`}>
            <span className="text-white font-black text-3xl">{initials}</span>
          </div>

          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  {student.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{student.matricNumber}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${gradeColor(student.stats.avgGrade)} flex items-center gap-1.5`}>
                <Star className="w-3 h-3" /> Avg {student.stats.avgGrade}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{student.location}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{student.email}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Enrolled {student.enrollmentDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-6">

        {/* Stats grid */}
        <FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statItems.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-[18px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">{value}</p>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* About */}
        <SectionCard title="About" icon={Sparkles} delay={0.05}>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{student.bio}</p>
        </SectionCard>

        {/* Goals + Tags row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Learning Goals" icon={Target} delay={0.08}>
            <ul className="space-y-2.5">
              {student.goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400">{i + 1}</span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{goal}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Skills & Tags" icon={Tag} delay={0.1}>
            <div className="flex flex-wrap gap-2">
              {student.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Accomplishments */}
        <SectionCard title="Accomplishments" icon={Trophy} delay={0.12}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {student.accomplishments.map((acc, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/40 p-3.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-snug">{acc}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Courses */}
        <SectionCard title="Enrolled Courses" icon={BookOpen} delay={0.14}>
          {completedCourses.length > 0 && (
            <>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Completed</p>
              {completedCourses.map(c => <CourseRow key={c.title} course={c} />)}
            </>
          )}
          {inProgressCourses.length > 0 && (
            <div className={completedCourses.length > 0 ? "mt-5" : ""}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">In Progress</p>
              {inProgressCourses.map(c => <CourseRow key={c.title} course={c} />)}
            </div>
          )}
        </SectionCard>

        {/* Certificates */}
        <FadeUp delay={0.16}>
          <div className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-900 dark:text-white">Certificates of Completion</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">{student.certificates.length} certificate{student.certificates.length !== 1 ? "s" : ""} earned — click to expand</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {student.certificates.map((cert, i) => (
                <Certificate key={i} cert={cert} studentName={student.name} />
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Assignments */}
        <SectionCard title="Assignments" icon={FileText} delay={0.18}>
          <AssignmentDonut stats={student.assignmentStats} />
        </SectionCard>

        {/* Grades overview */}
        <SectionCard title="Grade Distribution" icon={BarChart3} delay={0.2}>
          <div className="space-y-3">
            {[
              { label: "A / A+ / A-", count: student.courses.filter(c => c.completed && c.grade.startsWith("A")).length, color: "from-emerald-400 to-teal-500", total: completedCourses.length },
              { label: "B / B+ / B-", count: student.courses.filter(c => c.completed && c.grade.startsWith("B")).length, color: "from-blue-400 to-indigo-500", total: completedCourses.length },
              { label: "C or below", count: student.courses.filter(c => c.completed && !c.grade.startsWith("A") && !c.grade.startsWith("B")).length, color: "from-amber-400 to-orange-400", total: completedCourses.length },
            ].map(({ label, count, color, total }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    <span>{label}</span>
                    <span>{count} course{count !== 1 ? "s" : ""} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Groups */}
        <SectionCard title="Study Groups" icon={Users} delay={0.22}>
          <div className="flex flex-wrap gap-2">
            {student.groups.map((group, i) => (
              <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{group}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Profile ID card */}
        <FadeUp delay={0.24}>
          <div className="rounded-[22px] overflow-hidden border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className={`h-2 w-full bg-gradient-to-r ${student.gradient}`} />
            <div className="bg-white dark:bg-[#0f1623] px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${student.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <span className="text-white font-black text-xl">{initials}</span>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Full Name</p>
                  <p className="font-bold text-gray-900 dark:text-white">{student.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Matric Number</p>
                  <p className="font-bold text-gray-900 dark:text-white font-mono">{student.matricNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Member Since</p>
                  <p className="font-bold text-gray-900 dark:text-white">{student.enrollmentDate}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">Verified Student</span>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Back link */}
        <FadeUp delay={0.26} className="flex justify-center pt-4">
          <Link
            to="/our-students/public"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Students
          </Link>
        </FadeUp>
      </div>
    </>
  );
}
