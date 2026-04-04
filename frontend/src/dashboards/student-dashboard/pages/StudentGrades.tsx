// src/pages/student/StudentGrades.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Users, ChevronDown, ChevronRight,
  CheckCircle2, AlertCircle, Clock, Star, BookOpen,
  BarChart3, MessageSquare, Flag,
} from "lucide-react";
import { MOCK_GROUPS, GRADE_META, calcGPA, rubricTotal,
  getStudentGrades, type Grade, type LetterGrade,
} from "@/data/academicData";

const STUDENT_ID = "stu-001"; // Zara — from useDashboardUser in prod
const grades = getStudentGrades(STUDENT_ID);
const myGroups = MOCK_GROUPS.filter(g => g.members.some(m => m.id === STUDENT_ID));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] bg-white dark:bg-[#0f1623]
      border border-gray-100 dark:border-white/[0.07]
      shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function GradePill({ grade, size = "md" }: { grade: LetterGrade; size?: "sm" | "md" | "lg" }) {
  const m = GRADE_META[grade];
  const sz = size === "lg" ? "text-3xl font-black px-5 py-2" : size === "md" ? "text-lg font-black px-4 py-1.5" : "text-sm font-bold px-2.5 py-1";
  return (
    <span className={`rounded-xl border ${m.color} ${m.bg} ${m.border} ${sz} inline-flex items-center`}>
      {grade}
    </span>
  );
}

function StatusBadge({ status }: { status: Grade["status"] }) {
  const map = {
    graded:       { label: "Graded",       icon: CheckCircle2, cls: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" },
    pending:      { label: "Pending",      icon: Clock,        cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"            },
    under_review: { label: "Under Review", icon: AlertCircle,  cls: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40"                  },
  }[status];
  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${map.cls}`}>
      <Icon className="w-3 h-3" />{map.label}
    </span>
  );
}

// ─── GPA ring ────────────────────────────────────────────────────────────────
function GPARing({ gpa }: { gpa: number }) {
  const pct = (gpa / 4.0) * 100;
  const r = 42, circ = 2 * Math.PI * r;
  const color = gpa >= 3.7 ? "#10b981" : gpa >= 3.0 ? "#3b82f6" : gpa >= 2.0 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor"
          className="text-gray-100 dark:text-white/[0.06]" strokeWidth="10" />
        <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-gray-900 dark:text-white">{gpa.toFixed(1)}</span>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">GPA</span>
      </div>
    </div>
  );
}

// ─── Grade card (expandable) ──────────────────────────────────────────────────
function GradeCard({ grade }: { grade: Grade }) {
  const [open, setOpen] = useState(false);
  const group = myGroups.find(g => g.id === grade.groupId);
  const rubric = rubricTotal(grade.rubric);

  return (
    <Card>
      {/* Header row */}
      <button className="w-full flex items-center gap-4 px-6 py-4 text-left" onClick={() => setOpen(p => !p)}>
        <GradePill grade={grade.letterGrade} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{grade.groupName}</p>
            <StatusBadge status={grade.status} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />{grade.courseName}
          </p>
        </div>

        <div className="text-right flex-shrink-0 mr-3">
          <p className="text-base font-black text-gray-900 dark:text-white">{grade.percentage}%</p>
          <p className="text-[10px] text-gray-400">GPA {grade.gpa.toFixed(1)}</p>
        </div>

        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      {/* Expanded */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden">
            <div className="px-6 pb-6 border-t border-gray-100 dark:border-white/[0.06] pt-5 space-y-5">

              {/* Graded by */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Star className="w-3.5 h-3.5 text-blue-500" />
                Graded by <span className="font-bold text-gray-800 dark:text-white">{grade.graderName}</span>
                ({grade.gradedBy}) · {new Date(grade.gradedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>

              {/* Rubric bars */}
              <div>
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">
                  Rubric Breakdown — {rubric.score}/{rubric.max} ({rubric.pct}%)
                </p>
                <div className="flex flex-col gap-2.5">
                  {grade.rubric.map(r => (
                    <div key={r.id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-36 flex-shrink-0 truncate">{r.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                        <motion.div initial={{ width: 0 }}
                          animate={{ width: `${(r.score / r.maxScore) * 100}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-14 text-right flex-shrink-0">
                        {r.score}/{r.maxScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="rounded-2xl p-4 bg-blue-50/60 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/20">
                <p className="text-[11px] font-bold tracking-widest text-blue-500 uppercase mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" /> Instructor Feedback
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{grade.feedback}</p>
              </div>

              {/* Strengths + Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4 bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/20">
                  <p className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase mb-2">Strengths</p>
                  {grade.strengths.map(s => (
                    <p key={s} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 py-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                    </p>
                  ))}
                </div>
                <div className="rounded-2xl p-4 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/20">
                  <p className="text-[11px] font-bold tracking-widest text-amber-600 uppercase mb-2">Areas to Improve</p>
                  {grade.improvements.map(i => (
                    <p key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 py-0.5">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />{i}
                    </p>
                  ))}
                </div>
              </div>

              {/* Group members */}
              {group && (
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">Group Members</p>
                  <div className="flex flex-wrap gap-2">
                    {group.members.map(m => (
                      <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                        bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                        <span className={`w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${m.avatarBg}`}>
                          {m.avatar}
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{m.name}</span>
                        {m.id === STUDENT_ID && (
                          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-md">You</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appeal */}
              {grade.isAppealable && grade.appealDeadline && (
                <div className="flex items-center justify-between p-3 rounded-xl
                  bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Appeal deadline: <span className="font-bold">{new Date(grade.appealDeadline).toLocaleDateString()}</span>
                  </p>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                    border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400
                    hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                    <Flag className="w-3 h-3" /> Appeal Grade
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentGrades() {
  const gpa = calcGPA(grades);
  const avg = grades.length ? Math.round(grades.reduce((s, g) => s + g.percentage, 0) / grades.length) : 0;
  const gradeCounts = grades.reduce((acc, g) => {
    const letter = g.letterGrade[0]; // A, B, C etc
    acc[letter] = (acc[letter] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <Fade>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            My <span className="text-blue-600 dark:text-blue-400">Grades</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Group grades from your enrolled courses</p>
        </div>
      </Fade>

      {/* Summary row */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* GPA ring */}
          <Card className="p-6 flex flex-col items-center gap-3">
            <GPARing gpa={gpa} />
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cumulative GPA</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {gpa >= 3.7 ? "Dean's List" : gpa >= 3.0 ? "Good Standing" : gpa >= 2.0 ? "Satisfactory" : "At Risk"}
              </p>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6 flex flex-col justify-center gap-4">
            {[
              { icon: BarChart3, label: "Average Score", value: `${avg}%` },
              { icon: Users,     label: "Groups",        value: String(myGroups.length) },
              { icon: Award,     label: "Graded",        value: String(grades.filter(g => g.status === "graded").length) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </Card>

          {/* Grade distribution */}
          <Card className="p-6">
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">Distribution</p>
            <div className="flex flex-col gap-2">
              {["A", "B", "C", "D", "F"].map(letter => {
                const count = gradeCounts[letter] ?? 0;
                const pct = grades.length ? (count / grades.length) * 100 : 0;
                const color = letter === "A" ? "bg-emerald-500" : letter === "B" ? "bg-blue-500" :
                  letter === "C" ? "bg-amber-500" : letter === "D" ? "bg-orange-500" : "bg-red-500";
                return (
                  <div key={letter} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 w-3">{letter}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className={`h-full rounded-full ${color}`} />
                    </div>
                    <span className="text-xs text-gray-400 w-3 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </Fade>

      {/* Grade cards */}
      <div className="flex flex-col gap-4">
        {grades.length === 0 ? (
          <Fade delay={0.1}>
            <Card className="p-12 text-center">
              <Award className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">No grades yet</p>
              <p className="text-xs text-gray-400 mt-1">Your grades will appear here once your group work is marked.</p>
            </Card>
          </Fade>
        ) : (
          grades.map((g, i) => (
            <Fade key={g.id} delay={0.1 + i * 0.06}>
              <GradeCard grade={g} />
            </Fade>
          ))
        )}
      </div>
    </div>
  );
}