import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BookOpen, CheckCircle2, Clock,
  AlertCircle, Edit3, Plus, X, Save, Loader2,
  BarChart3, MessageSquare, ChevronDown, GraduationCap,
  TrendingUp, Activity, Timer, Star,
} from "lucide-react";
import CoursesService from "@/services/course.service";
import GradingService, {
  type ApiGroup, type ApiGroupGrade, type GradeGroupPayload,
} from "@/services/grading.service";
import InstructorDashboardService from "@/services/instructor-dashboard.service";
import {
  GRADE_META, rubricTotal,
  type LetterGrade, type RubricCriterion,
} from "@/data/academicData";

// ─── Constants ────────────────────────────────────────────────────────────────

const LETTER_GRADES: LetterGrade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

const DEFAULT_RUBRIC: RubricCriterion[] = [
  { id: "r1", label: "Technical Accuracy",  maxScore: 30, score: 20 },
  { id: "r2", label: "Code Quality",        maxScore: 25, score: 18 },
  { id: "r3", label: "Problem Solving",     maxScore: 20, score: 15 },
  { id: "r4", label: "Documentation",       maxScore: 15, score: 10 },
  { id: "r5", label: "Collaboration",       maxScore: 10, score:  7 },
];

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-pink-500", "bg-violet-500",
  "bg-amber-500", "bg-cyan-500",   "bg-rose-500", "bg-teal-500",
  "bg-purple-500", "bg-orange-500",
];

const COURSE_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function avatarBg(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase();
}

function fmtHours(s: number) {
  const h = Math.round(s / 3600);
  return h >= 1 ? `${h}h` : `${Math.round(s / 60)}m`;
}

function normalizeGroups(raw: unknown): ApiGroup[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as ApiGroup[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.items))  return r.items  as ApiGroup[];
  if (Array.isArray(r.data))   return r.data   as ApiGroup[];
  if (Array.isArray(r.groups)) return r.groups as ApiGroup[];
  return [];
}

function normalizeCourses(raw: unknown): { id: string; title: string }[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as { id: string; title: string }[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.items)) return r.items as { id: string; title: string }[];
  if (Array.isArray(r.data))  return r.data  as { id: string; title: string }[];
  return [];
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] bg-white dark:bg-[#0f1623]
      border border-gray-100 dark:border-white/[0.07]
      shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

function GradePill({ grade }: { grade: LetterGrade }) {
  const m = GRADE_META[grade];
  return (
    <span className={`rounded-xl border text-lg font-black px-3 py-1 ${m.color} ${m.bg} ${m.border}`}>
      {grade}
    </span>
  );
}

function StatusBadge({ status }: { status: "graded" | "pending" | "under_review" }) {
  const map = {
    graded:       { label: "Graded", icon: CheckCircle2, cls: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800/40" },
    pending:      { label: "Pending", icon: Clock,       cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800/40"           },
    under_review: { label: "Review",  icon: AlertCircle, cls: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800/40"                },
  }[status];
  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${map.cls}`}>
      <Icon className="w-2.5 h-2.5" />{map.label}
    </span>
  );
}

// ─── Member Avatars ───────────────────────────────────────────────────────────

function MemberAvatars({ members, max = 3 }: {
  members: ApiGroup["members"]; max?: number;
}) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, max).map(m => (
        <span key={m.id}
          className={`w-7 h-7 rounded-full text-[10px] font-bold text-white flex items-center justify-center
            border-2 border-white dark:border-[#0f1623] ${avatarBg(m.userId)}`}>
          {initials(m.name)}
        </span>
      ))}
      {members.length > max && (
        <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/[0.06] text-[10px] font-bold
          text-gray-500 flex items-center justify-center border-2 border-white dark:border-[#0f1623]">
          +{members.length - max}
        </span>
      )}
    </div>
  );
}

// ─── Grade Modal ──────────────────────────────────────────────────────────────

function GradeModal({
  group, existing, onClose, onSave, saving,
}: {
  group: ApiGroup;
  existing?: ApiGroupGrade;
  onClose: () => void;
  onSave: (payload: GradeGroupPayload) => void;
  saving: boolean;
}) {
  const [letterGrade, setLetterGrade] = useState<LetterGrade>(
    (existing?.letterGrade as LetterGrade) ?? "B",
  );
  const [percentage, setPercentage] = useState(existing?.percentage ?? 75);
  const [feedback,    setFeedback]   = useState(existing?.feedback ?? "");
  const [strengths,   setStrengths]  = useState((existing?.strengths ?? []).join("\n"));
  const [improvements, setImprovements] = useState((existing?.improvements ?? []).join("\n"));
  const [rubric, setRubric] = useState<RubricCriterion[]>(
    existing?.rubric?.length
      ? existing.rubric.map(r => ({ id: r.id, label: r.label, maxScore: r.maxScore, score: r.score }))
      : DEFAULT_RUBRIC,
  );

  const rubricPct = rubricTotal(rubric);
  const meta      = GRADE_META[letterGrade];

  const handleSave = () => {
    const gpa = GRADE_META[letterGrade]?.gpa ?? 0;
    onSave({
      letterGrade,
      percentage,
      gpa,
      feedback,
      rubric: rubric.map(r => ({ label: r.label, maxScore: r.maxScore, score: r.score })),
      strengths:    strengths.split("\n").filter(Boolean),
      improvements: improvements.split("\n").filter(Boolean),
      isAppealable: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px]
          bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10">

        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4
          bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur
          border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              {existing ? "Re-grade" : "Grade"} Group
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {group.name} · {group.courseName ?? ""}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center hover:bg-gray-200 transition-all">
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">
              Group Members
            </p>
            <div className="flex flex-wrap gap-2">
              {group.members.map(m => (
                <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                  bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                  <span className={`w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${avatarBg(m.userId)}`}>
                    {initials(m.name)}
                  </span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Letter Grade *</p>
              <div className="flex flex-wrap gap-1.5">
                {LETTER_GRADES.map(g => {
                  const m = GRADE_META[g];
                  return (
                    <button key={g} onClick={() => setLetterGrade(g)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-sm font-bold border transition-all",
                        letterGrade === g
                          ? `${m.color} ${m.bg} ${m.border} shadow-md scale-105`
                          : "border-gray-200 dark:border-white/[0.08] text-gray-400 hover:border-blue-300",
                      )}>
                      {g}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <GradePill grade={letterGrade} />
                <span className={`text-sm font-semibold ${meta.color}`}>{meta.label}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Percentage Score *</p>
              <div className="relative">
                <input type="number" min={0} max={100} value={percentage}
                  onChange={e => setPercentage(Number(e.target.value))}
                  className="w-full px-4 py-3 pr-8 rounded-xl text-xl font-black
                    bg-gray-50 dark:bg-white/[0.04]
                    border border-gray-200 dark:border-white/[0.08]
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                    text-gray-900 dark:text-white outline-none transition-all" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div animate={{ width: `${percentage}%` }} transition={{ duration: 0.3 }}
                  className={cn("h-full rounded-full",
                    percentage >= 70 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-red-500",
                  )} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">
              Rubric Scores — {rubricPct.score}/{rubricPct.max} ({rubricPct.pct}%)
            </p>
            <div className="flex flex-col gap-3">
              {rubric.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-36 flex-shrink-0 truncate">{r.label}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <input type="range" min={0} max={r.maxScore} value={r.score}
                      onChange={e => setRubric(prev => prev.map((x, xi) =>
                        xi === i ? { ...x, score: Number(e.target.value) } : x))}
                      className="flex-1 accent-blue-600" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-14 text-right">
                      {r.score}/{r.maxScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Overall Feedback *</p>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
              placeholder="Write detailed feedback for this group…"
              className="w-full px-4 py-3 rounded-xl text-sm resize-none
                bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08]
                focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-600 mb-2">Strengths (one per line)</p>
              <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={3}
                placeholder={"Strong component design\nGood TypeScript usage"}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none
                  bg-emerald-50/60 dark:bg-emerald-950/15
                  border border-emerald-100 dark:border-emerald-900/20
                  focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/15
                  text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none transition-all" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 mb-2">Improvements (one per line)</p>
              <textarea value={improvements} onChange={e => setImprovements(e.target.value)} rows={3}
                placeholder={"Add more tests\nImprove error handling"}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none
                  bg-amber-50/60 dark:bg-amber-950/15
                  border border-amber-100 dark:border-amber-900/20
                  focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15
                  text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none transition-all" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold
                border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
                hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              Cancel
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving || !feedback.trim()}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                saving || !feedback.trim()
                  ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]",
              )}>
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> {existing ? "Update Grade" : "Submit Grade"}</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Course Selector ──────────────────────────────────────────────────────────

function CourseSelector({
  courses, selected, onSelect,
}: {
  courses: { id: string; title: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  if (courses.length === 0) return null;
  if (courses.length <= 4) {
    return (
      <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit flex-wrap">
        {courses.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              selected === c.id
                ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
            )}>
            {c.title.length > 22 ? c.title.slice(0, 22) + "…" : c.title}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="relative w-fit">
      <select value={selected} onChange={e => onSelect(e.target.value)}
        className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm font-semibold
          bg-white dark:bg-[#0f1623]
          border border-gray-200 dark:border-white/[0.08]
          text-gray-800 dark:text-white outline-none cursor-pointer
          focus:border-blue-400 transition-all">
        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ─── Progress Tab ─────────────────────────────────────────────────────────────

function ProgressTab() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["instructor-dashboard-summary"],
    queryFn:  () => InstructorDashboardService.getSummary(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: activityPerCourse = [] } = useQuery({
    queryKey: ["instructor-activity-per-course"],
    queryFn:  async () => {
      try { return await InstructorDashboardService.getStudentActivityPerCourse(); }
      catch { return []; }
    },
    staleTime: 1000 * 60 * 5,
  });

  const perCourse   = summary?.studentsPerCourse ?? [];
  const completions = summary?.completionRate?.perCourse ?? [];
  const reviewsMap  = Object.fromEntries(
    (summary?.avgReviews?.perCourse ?? []).map(r => [r.courseId, r])
  );
  const completionMap = Object.fromEntries(completions.map(c => [c.courseId, c]));
  const activityMap   = Object.fromEntries(activityPerCourse.map(a => [a.courseId, a]));

  const overallCompletion = summary?.completionRate?.overallRate ?? 0;
  const totalStudents     = summary?.totalStudents?.totalUniqueStudents ?? 0;
  const avgRating         = summary?.avgReviews?.overallAverage ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <Fade delay={0.04}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users,        label: "Total Students",    value: String(totalStudents),                                    accent: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/40"    },
            { icon: BookOpen,     label: "Courses",           value: String(perCourse.length),                                 accent: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
            { icon: TrendingUp,   label: "Avg Completion",    value: overallCompletion > 0 ? `${overallCompletion.toFixed(0)}%` : "—", accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
            { icon: Star,         label: "Avg Rating",        value: avgRating > 0 ? avgRating.toFixed(1) : "—",               accent: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/40"  },
          ].map(({ icon: Ic, label, value, accent, bg }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                  <Ic className={`w-4 h-4 ${accent}`} />
                </div>
                <div>
                  <p className={`text-xl font-black leading-none ${accent}`}>{value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Per-course cards */}
      {perCourse.length === 0 ? (
        <Fade delay={0.08}>
          <Card className="p-12 text-center">
            <GraduationCap className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No course data yet. Publish a course to see progress.</p>
          </Card>
        </Fade>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {perCourse.map((course, i) => {
            const comp    = completionMap[course.courseId];
            const act     = activityMap[course.courseId];
            const reviews = reviewsMap[course.courseId];
            const progress = act?.averageProgressPercent ?? 0;
            const completion = comp?.completionRate ?? 0;

            return (
              <Fade key={course.courseId} delay={0.06 + i * 0.04}>
                <Card className="p-5">
                  {/* Course header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br ${COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]} flex items-center justify-center`}>
                      {course.img
                        ? <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
                        : <BookOpen className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Users className="w-2.5 h-2.5" />{course.studentCount} students
                        </span>
                        {reviews && reviews.reviewCount > 0 && (
                          <span className="text-[10px] text-amber-500 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />{reviews.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    {/* Avg Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Activity className="w-3 h-3" />Avg Progress
                        </span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {act ? `${progress.toFixed(0)}%` : "—"}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />Completion
                        </span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {comp ? `${completion.toFixed(0)}%` : "—"}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completion}%` }}
                          transition={{ duration: 0.8, delay: 0.15 + i * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom stats */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {act ? String(act.activeStudents) : "—"}
                      </p>
                      <p className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
                        <Activity className="w-2.5 h-2.5" />Active
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {comp ? `${comp.completedEnrollments}/${comp.totalEnrollments}` : "—"}
                      </p>
                      <p className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />Finished
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {act ? fmtHours(act.totalTimeSpentSeconds) : "—"}
                      </p>
                      <p className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
                        <Timer className="w-2.5 h-2.5" />Time
                      </p>
                    </div>
                  </div>
                </Card>
              </Fade>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Group Grades Tab ─────────────────────────────────────────────────────────

function GroupGradesTab() {
  const qc = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [modal, setModal] = useState<{ group: ApiGroup; existing?: ApiGroupGrade } | null>(null);
  const [filter, setFilter] = useState<"all" | "graded" | "pending">("all");

  const { data: coursesRaw, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-courses-for-grading"],
    queryFn: () => CoursesService.findAll({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  const courses = useMemo(() => normalizeCourses(coursesRaw), [coursesRaw]);
  const activeCourseId = selectedCourseId || courses[0]?.id || "";

  const { data: groupsRaw, isLoading: groupsLoading } = useQuery({
    queryKey: ["instructor-groups", activeCourseId],
    queryFn: async () => {
      try { return await GradingService.getGroups({ courseId: activeCourseId }); }
      catch { return []; }
    },
    enabled: !!activeCourseId,
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  const groups        = useMemo(() => normalizeGroups(groupsRaw), [groupsRaw]);
  const gradedGroups  = groups.filter(g => g.grade?.status === "graded");
  const pendingGroups = groups.filter(g => !g.grade);
  const avgScore      = gradedGroups.length
    ? Math.round(gradedGroups.reduce((s, g) => s + (g.grade?.percentage ?? 0), 0) / gradedGroups.length)
    : 0;

  const gradeMutation = useMutation({
    mutationFn: async ({ group, payload }: { group: ApiGroup; payload: GradeGroupPayload }) => {
      if (group.grade?.id) return GradingService.updateGroupGrade(group.id, group.grade.id, payload);
      return GradingService.gradeGroup(group.id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-groups", activeCourseId] });
      setModal(null);
    },
  });

  const isLoading = coursesLoading || groupsLoading;

  return (
    <div className="space-y-5">
      {/* Course selector */}
      {courses.length > 0 && (
        <Fade delay={0.04}>
          <CourseSelector
            courses={courses}
            selected={activeCourseId}
            onSelect={id => { setSelectedCourseId(id); setFilter("all"); }}
          />
        </Fade>
      )}

      {/* Stats */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users,        label: "Total Groups",  value: isLoading ? "—" : String(groups.length)        },
            { icon: CheckCircle2, label: "Graded",        value: isLoading ? "—" : String(gradedGroups.length)  },
            { icon: Clock,        label: "Pending",       value: isLoading ? "—" : String(pendingGroups.length) },
            { icon: BarChart3,    label: "Average Score", value: isLoading ? "—" : `${avgScore}%`               },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Filter tabs */}
      <Fade delay={0.1}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
          {(["all", "graded", "pending"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize",
                filter === f
                  ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
              )}>
              {f}
            </button>
          ))}
        </div>
      </Fade>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {!isLoading && !activeCourseId && (
        <Fade delay={0.12}>
          <Card className="p-12 text-center">
            <GraduationCap className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No courses found. Create a course to get started.</p>
          </Card>
        </Fade>
      )}

      {!isLoading && activeCourseId && groups.length === 0 && (
        <Fade delay={0.12}>
          <Card className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No groups yet</p>
            <p className="text-xs text-gray-400 mt-1">Groups will appear here once students are assigned.</p>
          </Card>
        </Fade>
      )}

      {/* Pending groups */}
      {!isLoading && (filter === "all" || filter === "pending") && pendingGroups.length > 0 && (
        <Fade delay={0.12}>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-amber-600 uppercase mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Awaiting Grades ({pendingGroups.length})
            </p>
            <div className="flex flex-col gap-3">
              {pendingGroups.map(group => (
                <Card key={group.id} className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{group.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <BookOpen className="w-3 h-3" />{group.courseName ?? ""}
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      {group.members.length} members
                    </p>
                  </div>
                  <MemberAvatars members={group.members} />
                  <button onClick={() => setModal({ group })}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                      bg-blue-600 hover:bg-blue-500 text-white
                      shadow-[0_3px_10px_rgba(59,130,246,0.35)] transition-all">
                    <Plus className="w-3.5 h-3.5" /> Grade Group
                  </button>
                </Card>
              ))}
            </div>
          </div>
        </Fade>
      )}

      {/* Graded groups */}
      {!isLoading && (filter === "all" || filter === "graded") && gradedGroups.length > 0 && (
        <Fade delay={0.15}>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Graded ({gradedGroups.length})
            </p>
            <div className="flex flex-col gap-4">
              {gradedGroups.map((group, i) => {
                const grade = group.grade!;
                const rubric = rubricTotal(grade.rubric ?? []);
                return (
                  <Fade key={group.id} delay={0.17 + i * 0.05}>
                    <Card className="p-5">
                      <div className="flex flex-col w-full">
                        <div className="flex items-start gap-3 w-full">
                          <span className={`rounded-xl border text-xl font-black px-3 py-1.5 flex-shrink-0 leading-snug
                            ${GRADE_META[grade.letterGrade as LetterGrade]?.color ?? "text-gray-700"}
                            ${GRADE_META[grade.letterGrade as LetterGrade]?.bg ?? "bg-gray-50"}
                            ${GRADE_META[grade.letterGrade as LetterGrade]?.border ?? "border-gray-200"}`}>
                            {grade.letterGrade}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{group.name}</p>
                              <StatusBadge status={grade.status} />
                              <span className="text-[10px] text-gray-400 w-full md:w-auto">
                                by {grade.graderName} ({grade.gradedBy})
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-2">
                              <BookOpen className="w-3 h-3" />{group.courseName ?? ""}
                            </p>
                            {rubric.max > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden w-full max-w-[140px]">
                                  <div style={{ width: `${rubric.pct}%` }}
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
                                </div>
                                <span className="text-[10px] text-gray-400 flex-shrink-0">{rubric.score}/{rubric.max}</span>
                              </div>
                            )}
                          </div>
                          <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0 ml-auto">
                            <div className="text-right">
                              <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{grade.percentage}%</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">GPA {grade.gpa.toFixed(1)}</p>
                            </div>
                            <button onClick={() => setModal({ group, existing: grade })}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                                border border-blue-200 dark:border-blue-800/50
                                text-blue-600 dark:text-blue-400
                                hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                              <Edit3 className="w-3.5 h-3.5" /> Re-grade
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between w-full mt-3 pt-3
                          border-t border-gray-100 dark:border-white/[0.06] md:hidden">
                          <div>
                            <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{grade.percentage}%</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">GPA {grade.gpa.toFixed(1)}</p>
                          </div>
                          <button onClick={() => setModal({ group, existing: grade })}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                              border border-blue-200 dark:border-blue-800/50
                              text-blue-600 dark:text-blue-400
                              hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                            <Edit3 className="w-3.5 h-3.5" /> Re-grade
                          </button>
                        </div>
                        {grade.feedback && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 flex items-start gap-2">
                              <MessageSquare className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                              {grade.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Fade>
                );
              })}
            </div>
          </div>
        </Fade>
      )}

      <AnimatePresence>
        {modal && (
          <GradeModal
            group={modal.group}
            existing={modal.existing}
            onClose={() => setModal(null)}
            saving={gradeMutation.isPending}
            onSave={payload => gradeMutation.mutate({ group: modal.group, payload })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorGrades() {
  const [tab, setTab] = useState<"progress" | "groups">("progress");

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">
      <Fade>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Grades <span className="text-blue-600 dark:text-blue-400">&amp; Progress</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">Track student progress and grade group work</p>
          </div>

          <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05]">
            {([
              { key: "progress", label: "Progress Overview", icon: TrendingUp },
              { key: "groups",   label: "Group Grades",      icon: GraduationCap },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  tab === key
                    ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                )}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <AnimatePresence mode="wait">
        {tab === "progress" ? (
          <motion.div key="progress"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <ProgressTab />
          </motion.div>
        ) : (
          <motion.div key="groups"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <GroupGradesTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
