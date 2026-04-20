// src/pages/student/StudentGrades.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, ChevronDown,
  CheckCircle2, Clock, Star, BookOpen,
  BarChart3, MessageSquare, Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AssignmentService, {
  type StudentAssignmentItem,
  type MySubmission,
} from "@/services/AssignmentService";
import { GRADE_META, type LetterGrade } from "@/data/academicData";
import { ApiErrorPage } from "@/components/ui/ApiError";

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

function letterToGPA(grade?: LetterGrade | null): number {
  if (!grade) return 0;
  return GRADE_META[grade]?.gpa ?? 0;
}

function calcGPA(items: StudentAssignmentItem[]): number {
  const graded = items.filter(a => a.grade);
  if (!graded.length) return 0;
  return parseFloat(
    (graded.reduce((s, a) => s + letterToGPA(a.grade), 0) / graded.length).toFixed(2),
  );
}

// ─── GPA ring ─────────────────────────────────────────────────────────────────

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

// ─── Grade pill ───────────────────────────────────────────────────────────────

function GradePill({ grade }: { grade: LetterGrade }) {
  const m = GRADE_META[grade] ?? GRADE_META["B"];
  return (
    <span className={`rounded-xl border text-lg font-black px-4 py-1.5 inline-flex items-center ${m.color} ${m.bg} ${m.border}`}>
      {grade}
    </span>
  );
}

// ─── Grade card ───────────────────────────────────────────────────────────────

function GradeCard({ assignment, index }: { assignment: StudentAssignmentItem; index: number }) {
  const [open, setOpen]           = useState(false);
  const [submission, setSubmission] = useState<MySubmission | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    if (!open || submission !== null || loadingSub) return;
    setLoadingSub(true);
    AssignmentService.getMySubmission(assignment.id)
      .then(sub => setSubmission(sub))
      .catch(console.error)
      .finally(() => setLoadingSub(false));
  }, [open, assignment.id, submission, loadingSub]);

  const grade   = assignment.grade!;
  const meta    = GRADE_META[grade] ?? GRADE_META["B"];
  const pct     = assignment.maxScore
    ? Math.round(((assignment.score ?? 0) / assignment.maxScore) * 100)
    : null;
  const gpa     = letterToGPA(grade);

  return (
    <Card>
      <button className="w-full flex items-center gap-4 px-6 py-4 text-left" onClick={() => setOpen(p => !p)}>
        <GradePill grade={grade} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{assignment.title}</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border
              bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40`}>
              <CheckCircle2 className="w-3 h-3" />
              {assignment.status === "returned" ? "Returned" : "Graded"}
            </span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />{assignment.courseName}
            <span className="text-gray-300 dark:text-white/20">·</span>
            by {assignment.creatorName}
          </p>
        </div>

        <div className="text-right flex-shrink-0 mr-3">
          {assignment.score != null && (
            <>
              <p className="text-base font-black text-gray-900 dark:text-white">
                {assignment.score}/{assignment.maxScore}
              </p>
              <p className="text-[10px] text-gray-400">GPA {gpa.toFixed(1)}</p>
            </>
          )}
        </div>

        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-gray-100 dark:border-white/[0.06] pt-5 space-y-5">

              {/* Score bar */}
              {pct !== null && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    <span className="font-bold">Score</span>
                    <span className={`font-black ${meta.color}`}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Loading submission */}
              {loadingSub && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading details…
                </div>
              )}

              {submission && !loadingSub && (
                <>
                  {/* Graded by */}
                  {submission.graderName && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Star className="w-3.5 h-3.5 text-blue-500" />
                      Graded by{" "}
                      <span className="font-bold text-gray-800 dark:text-white">{submission.graderName}</span>
                      ({submission.gradedBy})
                      {submission.gradedAt && (
                        <>
                          {" · "}
                          {new Date(submission.gradedAt).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </>
                      )}
                    </div>
                  )}

                  {/* Feedback */}
                  {submission.feedback && (
                    <div className="rounded-2xl p-4 bg-blue-50/60 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/20">
                      <p className="text-[11px] font-bold tracking-widest text-blue-500 uppercase mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" /> Instructor Feedback
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{submission.feedback}</p>
                    </div>
                  )}

                  {/* Rubric */}
                  {(submission.rubric ?? []).length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">
                        Rubric Breakdown
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {submission.rubric!.map(r => (
                          <div key={r.id} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-36 flex-shrink-0 truncate">
                              {r.label}
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(r.score / r.maxScore) * 100}%` }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-14 text-right flex-shrink-0">
                              {r.score}/{r.maxScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Fallback feedback from list item */}
              {!loadingSub && !submission && assignment.feedback && (
                <div className="rounded-2xl p-4 bg-blue-50/60 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/20">
                  <p className="text-[11px] font-bold tracking-widest text-blue-500 uppercase mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" /> Instructor Feedback
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{assignment.feedback}</p>
                </div>
              )}

              {/* Submitted at */}
              {assignment.submittedAt && (
                <p className="text-xs text-gray-400">
                  Submitted {new Date(assignment.submittedAt).toLocaleString()}
                  {assignment.isLate && (
                    <span className="ml-2 text-orange-500 font-bold">(Late)</span>
                  )}
                </p>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GradeSkeleton() {
  return (
    <div className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
          <div className="h-3 w-1/3 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentGrades() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-assignments-graded"],
    queryFn: () => AssignmentService.getMyAssignments({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto space-y-6 pb-10">
        <div className="h-10 w-48 rounded-xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => <GradeSkeleton key={i} />)}
        </div>
        <div className="flex justify-center pt-2">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) return <ApiErrorPage onRetry={refetch} message="Failed to load your grades." />;

  const all      = data?.data ?? [];
  const graded   = all.filter(a => a.grade && (a.status === "graded" || a.status === "returned"));
  const gpa      = calcGPA(graded);
  const avgPct   = graded.length
    ? Math.round(
        graded.reduce((s, a) => s + (a.maxScore ? ((a.score ?? 0) / a.maxScore) * 100 : 0), 0) / graded.length,
      )
    : 0;

  const gradeCounts = graded.reduce((acc, a) => {
    const letter = (a.grade ?? "")[0];
    if (letter) acc[letter] = (acc[letter] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const gpaLabel = gpa >= 3.7 ? "Dean's List" : gpa >= 3.0 ? "Good Standing" : gpa >= 2.0 ? "Satisfactory" : gpa > 0 ? "At Risk" : "No grades yet";

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <Fade>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            My <span className="text-blue-600 dark:text-blue-400">Grades</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Graded assignments from your enrolled courses</p>
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
              <p className="text-xs text-gray-400 mt-0.5">{gpaLabel}</p>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6 flex flex-col justify-center gap-4">
            {[
              { icon: BarChart3,    label: "Average Score", value: graded.length ? `${avgPct}%` : "—" },
              { icon: CheckCircle2, label: "Graded",        value: String(graded.length) },
              { icon: Clock,        label: "Pending",       value: String(all.filter(a => a.status === "pending" || a.status === "submitted").length) },
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
                const pct   = graded.length ? (count / graded.length) * 100 : 0;
                const color = letter === "A" ? "bg-emerald-500" : letter === "B" ? "bg-blue-500"
                  : letter === "C" ? "bg-amber-500" : letter === "D" ? "bg-orange-500" : "bg-red-500";
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
        {graded.length === 0 ? (
          <Fade delay={0.1}>
            <Card className="p-16 text-center">
              <Award className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">No grades yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Your grades will appear here once your assignments have been marked.
              </p>
            </Card>
          </Fade>
        ) : (
          graded.map((a, i) => (
            <Fade key={a.id} delay={0.1 + i * 0.06}>
              <GradeCard assignment={a} index={i} />
            </Fade>
          ))
        )}
      </div>

      {/* Pending assignments notice */}
      {all.filter(a => !a.grade).length > 0 && (
        <Fade delay={0.2}>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl
            bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <span className="font-bold">{all.filter(a => !a.grade).length} assignment{all.filter(a => !a.grade).length !== 1 ? "s" : ""}</span>{" "}
              pending grading — check back soon.
            </p>
          </div>
        </Fade>
      )}
    </div>
  );
}
