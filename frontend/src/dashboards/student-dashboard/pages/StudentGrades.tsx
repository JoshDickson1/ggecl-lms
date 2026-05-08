// src/dashboards/student-dashboard/pages/StudentGrades.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, ChevronDown, CheckCircle2, Clock, BarChart3,
  BookOpen, MessageSquare, TrendingUp, Target, Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import GradesService, { type CumulativeGradeReport, type CourseGrade, type GradeComponent } from "@/services/grades.service";
import { ApiErrorPage } from "@/components/ui/ApiError";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map a letter grade to a GPA value */
function letterToGPA(letter: string | null): number {
  if (!letter) return 0;
  const map: Record<string, number> = {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0,
  };
  return map[letter] ?? 0;
}

/** Colour tokens for a letter grade */
function gradeColors(letter: string | null): { text: string; bg: string; border: string } {
  if (!letter) return { text: "text-gray-400", bg: "bg-gray-50 dark:bg-white/[0.04]", border: "border-gray-200 dark:border-white/[0.08]" };
  const l = letter[0];
  if (l === "A") return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800/40" };
  if (l === "B") return { text: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/30",    border: "border-blue-200 dark:border-blue-800/40"    };
  if (l === "C") return { text: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/30",  border: "border-amber-200 dark:border-amber-800/40"  };
  if (l === "D") return { text: "text-orange-600 dark:text-orange-400",bg: "bg-orange-50 dark:bg-orange-950/30",border: "border-orange-200 dark:border-orange-800/40" };
  return { text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800/40" };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function gpaStanding(gpa: number): string {
  if (gpa >= 3.7) return "Dean's List";
  if (gpa >= 3.0) return "Good Standing";
  if (gpa >= 2.0) return "Satisfactory";
  if (gpa > 0)    return "At Risk";
  return "No grades yet";
}

// ─── UI primitives ────────────────────────────────────────────────────────────

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

function GradePill({ letter, size = "md" }: { letter: string | null; size?: "sm" | "md" | "lg" }) {
  const { text, bg, border } = gradeColors(letter);
  const sz = size === "lg" ? "text-2xl px-5 py-2" : size === "sm" ? "text-xs px-2.5 py-1" : "text-lg px-4 py-1.5";
  return (
    <span className={`rounded-xl border font-black inline-flex items-center ${sz} ${text} ${bg} ${border}`}>
      {letter ?? "—"}
    </span>
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

// ─── Component row ────────────────────────────────────────────────────────────

function ComponentRow({ comp, index }: { comp: GradeComponent; index: number }) {
  const pct = Math.round(comp.resolvedGrade);
  const { text } = gradeColors(pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F");

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-white/[0.04] last:border-0"
    >
      {/* Type badge */}
      <span className={`flex-shrink-0 mt-0.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg
        ${comp.type === "assignment"
          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
          : "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
        }`}>
        {comp.type === "assignment" ? "Assign" : "Group"}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{comp.label}</p>
        {comp.feedback && (
          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 flex items-center gap-1">
            <MessageSquare className="w-3 h-3 flex-shrink-0" />{comp.feedback}
          </p>
        )}
        <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(comp.gradedAt)}</p>
      </div>

      <div className="flex-shrink-0 text-right">
        <p className={`text-sm font-black ${text}`}>{pct}%</p>
        <p className="text-[10px] text-gray-400">{comp.score}/{comp.maxScore}</p>
      </div>
    </motion.div>
  );
}

// ─── Course grade card ────────────────────────────────────────────────────────

function CourseGradeCard({ course, index }: { course: CourseGrade; index: number }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round(course.averageGrade ?? 0);
  const { text } = gradeColors(course.letterGrade);
  const coverageColor = course.gradedComponents === course.totalComponents
    ? "text-emerald-500" : "text-amber-500";

  return (
    <Card>
      <button
        className="w-full flex items-center gap-4 px-6 py-4 text-left"
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
      >
        <GradePill letter={course.letterGrade} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{course.courseTitle}</p>
          <p className={`text-xs mt-0.5 font-medium ${coverageColor}`}>
            {course.gradedComponents}/{course.totalComponents} components graded
          </p>
        </div>

        {/* Score bar */}
        <div className="hidden sm:flex flex-col items-end gap-1 w-32 flex-shrink-0">
          <span className={`text-sm font-black ${text}`}>{pct}%</span>
          <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.05 }}
              className={`h-full rounded-full ${
                pct >= 90 ? "bg-emerald-500" : pct >= 80 ? "bg-blue-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>

        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 border-t border-gray-100 dark:border-white/[0.06] pt-4">
              {course.components.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No graded components yet.</p>
              ) : (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
                    Graded Components
                  </p>
                  {course.components.map((comp, i) => (
                    <ComponentRow key={comp.sourceId} comp={comp} index={i} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6 max-w-[900px] mx-auto pb-10">
      <div className="h-10 w-48 rounded-xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-36 rounded-[22px] bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
        ))}
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 rounded-[22px] bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentGrades() {
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const { data, isLoading, isError, refetch } = useQuery<CumulativeGradeReport>({
    queryKey: ["student-grades-cumulative"],
    queryFn: () => GradesService.getMyGrades(),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <Skeleton />;
  if (isError)   return <ApiErrorPage onRetry={refetch} message="Failed to load your grades." />;
  if (!data)     return null;

  // ── Derived values ──────────────────────────────────────────────────────────

  const allCourses = data.courses ?? [];
  const gpa = letterToGPA(data.overallLetterGrade);
  const overallPct = Math.round(data.overallGrade ?? 0);

  // Grade distribution across all components
  const allComponents = allCourses.flatMap(c => c.components);
  const gradeCounts = allComponents.reduce((acc, comp) => {
    const pct = comp.resolvedGrade;
    const letter = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    acc[letter] = (acc[letter] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter courses
  const visibleCourses = courseFilter === "all"
    ? allCourses
    : allCourses.filter(c => c.courseId === courseFilter);

  const coursesWithGrades = allCourses.filter(c => c.gradedComponents > 0);
  const pendingComponents = allCourses.reduce(
    (sum, c) => sum + Math.max(0, c.totalComponents - c.gradedComponents), 0
  );

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <Fade>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            My <span className="text-blue-600 dark:text-blue-400">Grades</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Cumulative grade report across {data.totalCourses} enrolled course{data.totalCourses !== 1 ? "s" : ""}
          </p>
        </div>
      </Fade>

      {/* Summary row */}
      <Fade delay={0.05}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* GPA ring */}
          <Card className="p-6 flex flex-col items-center gap-3">
            <GPARing gpa={gpa} />
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cumulative GPA</p>
              <p className="text-xs text-gray-400 mt-0.5">{gpaStanding(gpa)}</p>
            </div>
          </Card>

          {/* Key stats */}
          <Card className="p-6 flex flex-col justify-center gap-4">
            {[
              {
                icon: BarChart3,
                label: "Overall Score",
                value: data.overallGrade != null ? `${overallPct}%` : "—",
                sub: data.overallLetterGrade ?? undefined,
              },
              {
                icon: CheckCircle2,
                label: "Courses Graded",
                value: `${data.coursesWithGrades} / ${data.totalCourses}`,
                sub: undefined,
              },
              {
                icon: Clock,
                label: "Pending Components",
                value: String(pendingComponents),
                sub: pendingComponents > 0 ? "awaiting grading" : "all caught up",
              },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    {value}
                    {sub && <span className="ml-1.5 text-[10px] font-bold text-gray-400">{sub}</span>}
                  </p>
                </div>
              </div>
            ))}
          </Card>

          {/* Grade distribution */}
          <Card className="p-6">
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">Distribution</p>
            <div className="flex flex-col gap-2.5">
              {(["A", "B", "C", "D", "F"] as const).map(letter => {
                const count = gradeCounts[letter] ?? 0;
                const pct   = allComponents.length ? (count / allComponents.length) * 100 : 0;
                const barColor = letter === "A" ? "bg-emerald-500"
                  : letter === "B" ? "bg-blue-500"
                  : letter === "C" ? "bg-amber-500"
                  : letter === "D" ? "bg-orange-500"
                  : "bg-red-500";
                return (
                  <div key={letter} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 w-3">{letter}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </Fade>

      {/* Overall grade hero — only when there's data */}
      {data.overallLetterGrade && (
        <Fade delay={0.08}>
          <div className="rounded-[22px] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 flex items-center gap-6">
            <div className="flex-shrink-0">
              <GradePill letter={data.overallLetterGrade} size="lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-lg leading-tight">Overall Grade</p>
              <p className="text-blue-200 text-sm mt-0.5">
                {overallPct}% average across {coursesWithGrades.length} graded course{coursesWithGrades.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
              {[
                { icon: TrendingUp, label: "GPA",     value: gpa.toFixed(1) },
                { icon: Target,     label: "Standing", value: gpaStanding(gpa).split(" ")[0] },
                { icon: Star,       label: "Courses",  value: String(data.coursesWithGrades) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center px-3 py-1.5 rounded-xl bg-white/15 border border-white/20">
                  <Icon className="w-3.5 h-3.5 text-blue-200 mx-auto mb-0.5" />
                  <p className="text-white font-black text-sm leading-none">{value}</p>
                  <p className="text-blue-200 text-[10px]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Fade>
      )}

      {/* Course filter tabs */}
      {allCourses.length > 1 && (
        <Fade delay={0.1}>
          <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit max-w-full overflow-x-auto">
            <button
              onClick={() => setCourseFilter("all")}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                courseFilter === "all"
                  ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> All Courses
            </button>
            {allCourses.map(c => (
              <button
                key={c.courseId}
                onClick={() => setCourseFilter(c.courseId)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  courseFilter === c.courseId
                    ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {c.courseTitle.length > 20 ? c.courseTitle.slice(0, 20) + "…" : c.courseTitle}
                {c.letterGrade && (
                  <span className={`text-[10px] font-black ${gradeColors(c.letterGrade).text}`}>
                    {c.letterGrade}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Fade>
      )}

      {/* Course grade cards */}
      <div className="flex flex-col gap-4">
        {visibleCourses.length === 0 ? (
          <Fade delay={0.12}>
            <Card className="p-16 text-center">
              <Award className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">No grades yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Your grades will appear here once your work has been marked.
              </p>
            </Card>
          </Fade>
        ) : (
          visibleCourses.map((course, i) => (
            <Fade key={course.courseId} delay={0.12 + i * 0.05}>
              <CourseGradeCard course={course} index={i} />
            </Fade>
          ))
        )}
      </div>

      {/* Pending notice */}
      {pendingComponents > 0 && (
        <Fade delay={0.2}>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl
            bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <span className="font-bold">{pendingComponents} component{pendingComponents !== 1 ? "s" : ""}</span>{" "}
              pending grading — check back soon.
            </p>
          </div>
        </Fade>
      )}
    </div>
  );
}
