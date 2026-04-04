// src/pages/instructor/InstructorGrades.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BookOpen, CheckCircle2, Clock,
  AlertCircle, Edit3, Plus, X, Save, Loader2, BarChart3, MessageSquare,
} from "lucide-react";
import {
  MOCK_GRADES, MOCK_GROUPS, GRADE_META, rubricTotal,
  type Grade, type LetterGrade, type RubricCriterion, type StudentGroup,
} from "@/data/academicData";

const LETTER_GRADES: LetterGrade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }
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
      transition={{ duration: 0.36, delay, ease: "easeOut" }}>{children}</motion.div>
  );
}

function GradePill({ grade }: { grade: LetterGrade }) {
  const m = GRADE_META[grade];
  return <span className={`rounded-xl border text-lg font-black px-3 py-1 ${m.color} ${m.bg} ${m.border}`}>{grade}</span>;
}

function StatusBadge({ status }: { status: Grade["status"] }) {
  const map = {
    graded: { label: "Graded", icon: CheckCircle2, cls: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800/40" },
    pending: { label: "Pending", icon: Clock, cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800/40" },
    under_review: { label: "Review", icon: AlertCircle, cls: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800/40" },
  }[status];
  const Icon = map.icon;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${map.cls}`}>
    <Icon className="w-2.5 h-2.5" />{map.label}
  </span>;
}

// ─── Grading Modal ────────────────────────────────────────────────────────────
function GradeModal({
  group, existing, onClose, onSave,
}: {
  group: StudentGroup;
  existing?: Grade;
  onClose: () => void;
  onSave: (draft: Partial<Grade>) => void;
}) {
  const [letterGrade, setLetterGrade] = useState<LetterGrade>(existing?.letterGrade ?? "B");
  const [percentage, setPercentage] = useState(existing?.percentage ?? 75);
  const [feedback, setFeedback] = useState(existing?.feedback ?? "");
  const [strengths, setStrengths] = useState(existing?.strengths.join("\n") ?? "");
  const [improvements, setImprovements] = useState(existing?.improvements.join("\n") ?? "");
  const [rubric, setRubric] = useState<RubricCriterion[]>(
    existing?.rubric ?? [
      { id: "r1", label: "Technical Accuracy", maxScore: 30, score: 20 },
      { id: "r2", label: "Code Quality", maxScore: 25, score: 18 },
      { id: "r3", label: "Problem Solving", maxScore: 20, score: 15 },
      { id: "r4", label: "Documentation", maxScore: 15, score: 10 },
      { id: "r5", label: "Collaboration", maxScore: 10, score: 7 },
    ]
  );
  const [saving, setSaving] = useState(false);

  const rubricPct = rubricTotal(rubric);
  const meta = GRADE_META[letterGrade];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        letterGrade, percentage, feedback, rubric,
        strengths: strengths.split("\n").filter(Boolean),
        improvements: improvements.split("\n").filter(Boolean),
        gradedBy: "instructor", graderName: "Sarah Mitchell",
        gradedAt: new Date().toISOString(),
        status: "graded",
      });
      setSaving(false);
      onClose();
    }, 1400);
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

        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4
          bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              {existing ? "Re-grade" : "Grade"} Group
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{group.name} · {group.courseName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center hover:bg-gray-200 transition-all">
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Group members */}
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
                </div>
              ))}
            </div>
          </div>

          {/* Letter grade + percentage */}
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
                          : "border-gray-200 dark:border-white/[0.08] text-gray-400 hover:border-blue-300"
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
              {/* Mini bar */}
              <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div animate={{ width: `${percentage}%` }} transition={{ duration: 0.3 }}
                  className={cn("h-full rounded-full", percentage >= 70 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-red-500")} />
              </div>
            </div>
          </div>

          {/* Rubric */}
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
                      onChange={e => setRubric(prev => prev.map((x, xi) => xi === i ? { ...x, score: Number(e.target.value) } : x))}
                      className="flex-1 accent-blue-600" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-14 text-right">
                      {r.score}/{r.maxScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold
              border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
              hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              Cancel
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave} disabled={saving || !feedback.trim()}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                saving || !feedback.trim()
                  ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
              )}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : existing ? "Update Grade" : "Submit Grade"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InstructorGrades() {
  // Instructor only sees groups they are in charge of (dev-001 courses)
  const myGroups = MOCK_GROUPS.filter(g => g.courseId === "dev-001");
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES.filter(g => g.courseId === "dev-001"));
  const [modal, setModal] = useState<{ group: StudentGroup; existing?: Grade } | null>(null);
  const [filter, setFilter] = useState<"all" | "graded" | "pending">("all");

  const graded = grades.filter(g => g.status === "graded");
  const pending = myGroups.filter(g => !grades.find(gr => gr.groupId === g.id));
  const avg = graded.length ? Math.round(graded.reduce((s, g) => s + g.percentage, 0) / graded.length) : 0;

  const handleSave = (draft: Partial<Grade>) => {
    if (!modal) return;
    const existing = grades.find(g => g.groupId === modal.group.id);
    if (existing) {
      setGrades(prev => prev.map(g => g.groupId === modal.group.id ? { ...g, ...draft } : g));
    } else {
      const newGrade: Grade = {
        id: `grd-${Date.now()}`,
        groupId: modal.group.id, groupName: modal.group.name,
        courseId: modal.group.courseId, courseName: modal.group.courseName,
        letterGrade: "B", percentage: 75, gpa: 3.0,
        status: "graded", gradedBy: "instructor", graderName: "Sarah Mitchell",
        gradedAt: new Date().toISOString(),
        feedback: "", strengths: [], improvements: [], rubric: [],
        isAppealable: true,
        appealDeadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        ...draft,
      };
      setGrades(prev => [...prev, newGrade]);
    }
  };

  const filtered = filter === "graded" ? graded
    : filter === "pending" ? [] // pending groups shown separately
      : grades;

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <Fade>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Grades <span className="text-blue-600 dark:text-blue-400">Management</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">Grade and review your course groups</p>
          </div>
        </div>
      </Fade>

      {/* Stats */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total Groups", value: String(myGroups.length) },
            { icon: CheckCircle2, label: "Graded", value: String(graded.length) },
            { icon: Clock, label: "Pending", value: String(pending.length) },
            { icon: BarChart3, label: "Average Score", value: `${avg}%` },
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
              className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize",
                filter === f
                  ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}>
              {f}
            </button>
          ))}
        </div>
      </Fade>

      {/* Pending groups */}
      {(filter === "all" || filter === "pending") && pending.length > 0 && (
        <Fade delay={0.12}>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-amber-600 uppercase mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Awaiting Grades ({pending.length})
            </p>
            <div className="flex flex-col gap-3">
              {pending.map(group => (
                <Card key={group.id} className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{group.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <BookOpen className="w-3 h-3" />{group.courseName}
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span>{group.members.length} members</span>
                    </p>
                  </div>
                  <div className="flex -space-x-2 mr-2">
                    {group.members.slice(0, 3).map(m => (
                      <span key={m.id} className={`w-7 h-7 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-[#0f1623] ${m.avatarBg}`}>
                        {m.avatar}
                      </span>
                    ))}
                    {group.members.length > 3 && (
                      <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/[0.06] text-[10px] font-bold text-gray-500 flex items-center justify-center border-2 border-white dark:border-[#0f1623]">
                        +{group.members.length - 3}
                      </span>
                    )}
                  </div>
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
      {(filter === "all" || filter === "graded") && filtered.length > 0 && (
        <Fade delay={0.15}>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Graded ({filtered.length})
            </p>
            <div className="flex flex-col gap-4">
              {filtered.map((grade, i) => {
                const group = myGroups.find(g => g.id === grade.groupId);
                const rubric = rubricTotal(grade.rubric);
                if (!group) return null;
                return (
                  <Fade key={grade.id} delay={0.17 + i * 0.05}>
                    <Card className="p-5">
                      <div className="flex flex-col w-full">

                        {/* ── Top row: grade letter + centre info + desktop right column ── */}
                        <div className="flex items-start gap-3 w-full">

                          {/* Grade letter */}
                          <span className={`rounded-xl border text-xl font-black px-3 py-1.5 flex-shrink-0 leading-snug
      ${GRADE_META[grade.letterGrade].color}
      ${GRADE_META[grade.letterGrade].bg}
      ${GRADE_META[grade.letterGrade].border}`}>
                            {grade.letterGrade}
                          </span>

                          {/* Centre block */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{grade.groupName}</p>
                              <StatusBadge status={grade.status} />
                              <span className="text-[10px] text-gray-400 w-full md:w-auto">
                                by {grade.graderName} ({grade.gradedBy})
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-2">
                              <BookOpen className="w-3 h-3" />{grade.courseName}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden w-full max-w-[140px]">
                                <div style={{ width: `${rubric.pct}%` }}
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
                              </div>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">{rubric.score}/{rubric.max}</span>
                            </div>
                          </div>

                          {/* Desktop-only right column */}
                          <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0 ml-auto">
                            <div className="text-right">
                              <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                                {grade.percentage}%
                              </p>
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

                        {/* ── Mobile-only bottom row — sibling to top row, spans full width ── */}
                        <div className="flex items-center justify-between w-full mt-3 pt-3
    border-t border-gray-100 dark:border-white/[0.06]
    md:hidden">
                          <div>
                            <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                              {grade.percentage}%
                            </p>
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

                      {/* Feedback preview */}
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                          {grade.feedback}
                        </p>
                      </div>
                    </Card>
                  </Fade>
                );
              })}
            </div>
          </div>
        </Fade>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <GradeModal
            group={modal.group}
            existing={modal.existing}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}