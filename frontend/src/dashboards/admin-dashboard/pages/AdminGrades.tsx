import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, CheckCircle2, Clock, Plus, Search, BarChart3,
  AlertTriangle, ChevronDown, Shield, X, Loader2, Save,
} from "lucide-react";
import CoursesService from "@/services/course.service";
import GradingService, {
  type ApiGroup, type ApiGroupGrade, type GradeGroupPayload,
} from "@/services/grading.service";
import { GRADE_META, rubricTotal, type LetterGrade, type RubricCriterion } from "@/data/academicData";

// ─── Constants ────────────────────────────────────────────────────────────────

const LETTER_GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"] as const;

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    graded:       { label: "Graded",  cls: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800/40" },
    pending:      { label: "Pending", cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800/40"           },
    under_review: { label: "Review",  cls: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800/40"                },
  };
  const m = map[status] ?? { label: status, cls: "bg-gray-50 text-gray-500 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.cls}`}>
      {m.label}
    </span>
  );
}

// ─── Admin Grade Sheet (Modal) ────────────────────────────────────────────────

function AdminGradeSheet({
  group, existing, onClose, onSave, saving,
}: {
  group: ApiGroup;
  existing?: ApiGroupGrade;
  onClose: () => void;
  onSave: (payload: GradeGroupPayload) => void;
  saving: boolean;
}) {
  const [letter, setLetter]     = useState<LetterGrade>((existing?.letterGrade as LetterGrade) ?? "B");
  const [pct, setPct]           = useState(existing?.percentage ?? 75);
  const [feedback, setFeedback] = useState(existing?.feedback ?? "");
  const [rubric, setRubric]     = useState<RubricCriterion[]>(
    existing?.rubric?.length
      ? existing.rubric.map(r => ({ id: r.id, label: r.label, maxScore: r.maxScore, score: r.score }))
      : DEFAULT_RUBRIC,
  );
  const [strengths, setStrengths]       = useState((existing?.strengths ?? []).join("\n"));
  const [improvements, setImprovements] = useState((existing?.improvements ?? []).join("\n"));

  const meta     = GRADE_META[letter];
  const rubricPt = rubricTotal(rubric);

  const save = () => {
    onSave({
      letterGrade: letter,
      percentage: pct,
      gpa: meta.gpa,
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
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px]
          bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10">

        {/* Admin stripe */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4
          bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur
          border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Admin Grade Override
              </span>
            </div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              {group.name}
            </h2>
            <p className="text-xs text-gray-400">{group.courseName ?? ""}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center hover:bg-gray-200 transition-all">
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Members */}
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
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grade select */}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Letter Grade</p>
            <div className="flex flex-wrap gap-1.5">
              {LETTER_GRADES.map(g => {
                const m = GRADE_META[g];
                return (
                  <button key={g} onClick={() => setLetter(g)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-sm font-bold border transition-all",
                      letter === g
                        ? `${m.color} ${m.bg} ${m.border} shadow scale-105`
                        : "border-gray-200 dark:border-white/[0.08] text-gray-400 hover:border-blue-300",
                    )}>
                    {g}
                  </button>
                );
              })}
            </div>
            <p className={`text-sm font-semibold mt-2 ${meta.color}`}>
              {meta.label} · GPA {meta.gpa.toFixed(1)}
            </p>
          </div>

          {/* Percentage */}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Score Percentage</p>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} value={pct}
                onChange={e => setPct(+e.target.value)}
                className="flex-1 accent-blue-600" />
              <span className="text-xl font-black text-gray-900 dark:text-white w-14 text-right">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] mt-2 overflow-hidden">
              <div style={{ width: `${pct}%` }}
                className={cn("h-full rounded-full transition-all",
                  pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500")} />
            </div>
          </div>

          {/* Rubric */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">
              Rubric Scores — {rubricPt.score}/{rubricPt.max} ({rubricPt.pct}%)
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

          {/* Feedback */}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Admin Feedback</p>
            <textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Provide feedback as admin…"
              className="w-full px-4 py-3 rounded-xl text-sm resize-none
                bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08]
                focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all" />
          </div>

          {/* Strengths / improvements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-600 mb-2">Strengths (one per line)</p>
              <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={3}
                placeholder={"Strong participation\nGood collaboration"}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none
                  bg-emerald-50/60 dark:bg-emerald-950/15
                  border border-emerald-100 dark:border-emerald-900/20
                  focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/15
                  text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none transition-all" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 mb-2">Improvements (one per line)</p>
              <textarea value={improvements} onChange={e => setImprovements(e.target.value)} rows={3}
                placeholder={"More engagement\nClearer communication"}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none
                  bg-amber-50/60 dark:bg-amber-950/15
                  border border-amber-100 dark:border-amber-900/20
                  focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15
                  text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none transition-all" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 border-t border-gray-100 dark:border-white/[0.06]">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
                hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={save} disabled={saving || !feedback.trim()}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                saving || !feedback.trim()
                  ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]",
              )}>
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> {existing ? "Update Grade" : "Override Grade"}</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminGrades() {
  const qc = useQueryClient();
  const [modal, setModal]           = useState<{ group: ApiGroup; existing?: ApiGroupGrade } | null>(null);
  const [search, setSearch]         = useState("");
  const [courseFilter, setCourse]   = useState("all");

  // ── Data ──────────────────────────────────────────────────────────────────

  const { data: coursesRaw } = useQuery({
    queryKey: ["admin-courses-for-grading"],
    queryFn: () => CoursesService.findAll({ limit: 200 }),
    staleTime: 1000 * 60 * 5,
  });

  const courses = useMemo(() => normalizeCourses(coursesRaw), [coursesRaw]);

  const { data: groupsRaw, isLoading: groupsLoading } = useQuery({
    queryKey: ["admin-all-groups", courseFilter],
    queryFn: () => GradingService.getGroups(
      courseFilter !== "all" ? { courseId: courseFilter } : undefined,
    ),
    staleTime: 1000 * 60 * 2,
  });

  const groups = useMemo(() => normalizeGroups(groupsRaw), [groupsRaw]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const ungradedGroups = groups.filter(g => !g.grade);
  const gradedGroups   = groups.filter(g => !!g.grade);
  const totalPct       = gradedGroups.length
    ? Math.round(gradedGroups.reduce((s, g) => s + (g.grade?.percentage ?? 0), 0) / gradedGroups.length)
    : 0;

  const filteredGraded = useMemo(() => {
    return gradedGroups.filter(g => {
      const q = search.trim().toLowerCase();
      if (q && !g.name.toLowerCase().includes(q) && !(g.courseName ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [gradedGroups, search]);

  // ── Mutation ───────────────────────────────────────────────────────────────

  const gradeMutation = useMutation({
    mutationFn: async ({ group, payload }: { group: ApiGroup; payload: GradeGroupPayload }) => {
      if (group.grade?.id) {
        return GradingService.updateGroupGrade(group.id, group.grade.id, payload);
      }
      return GradingService.gradeGroup(group.id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-all-groups"] });
      setModal(null);
    },
  });

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      <Fade>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Grades <span className="text-blue-600 dark:text-blue-400">Overview</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            All groups across all courses · Admin override enabled
          </p>
        </div>
      </Fade>

      {/* Summary tiles */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users,        label: "Total Groups", value: groupsLoading ? "—" : String(groups.length),         color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/40"    },
            { icon: CheckCircle2, label: "Graded",       value: groupsLoading ? "—" : String(gradedGroups.length),   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
            { icon: Clock,        label: "Ungraded",     value: groupsLoading ? "—" : String(ungradedGroups.length), color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/40"  },
            { icon: BarChart3,    label: "Avg. Score",   value: groupsLoading ? "—" : `${totalPct}%`,                color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label} className="p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-[10px] text-gray-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Search + course filter */}
      <Fade delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search groups or courses…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                bg-white dark:bg-[#0f1623]
                border border-gray-200 dark:border-white/[0.08]
                text-gray-800 dark:text-white placeholder:text-gray-400
                focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all" />
          </div>
          <div className="relative">
            <select value={courseFilter} onChange={e => setCourse(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm
                bg-white dark:bg-[#0f1623]
                border border-gray-200 dark:border-white/[0.08]
                text-gray-700 dark:text-gray-300 outline-none cursor-pointer
                focus:border-blue-400 transition-all">
              <option value="all">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </Fade>

      {/* Loading */}
      {groupsLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Ungraded warning */}
      {!groupsLoading && ungradedGroups.length > 0 && (
        <Fade delay={0.12}>
          <div className="rounded-[22px] bg-amber-50/60 dark:bg-amber-950/15
            border border-amber-200 dark:border-amber-900/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {ungradedGroups.length} group{ungradedGroups.length > 1 ? "s" : ""} awaiting grades
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {ungradedGroups.map(group => (
                <div key={group.id} className="flex items-center gap-3 p-3 rounded-xl
                  bg-white dark:bg-[#0f1623] border border-amber-100 dark:border-amber-900/20">
                  <div className="flex -space-x-1.5">
                    {group.members.slice(0, 3).map(m => (
                      <span key={m.id}
                        className={`w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center
                          border border-white dark:border-[#0f1623] ${avatarBg(m.userId)}`}>
                        {initials(m.name)}
                      </span>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{group.name}</p>
                    <p className="text-xs text-gray-400">{group.courseName ?? ""}</p>
                  </div>
                  <button onClick={() => setModal({ group })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                      bg-blue-600 hover:bg-blue-500 text-white
                      shadow-[0_3px_10px_rgba(59,130,246,0.3)] transition-all">
                    <Plus className="w-3.5 h-3.5" /> Grade
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Fade>
      )}

      {/* Grades table */}
      {!groupsLoading && (
        <Fade delay={0.15}>
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
              <p className="text-sm font-black text-gray-900 dark:text-white">
                All Grades{" "}
                <span className="text-gray-400 font-normal">({filteredGraded.length})</span>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                    {["Group", "Course", "Grade", "Score", "GPA", "Graded By", "Status", ""].map(h => (
                      <th key={h}
                        className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGraded.map((group, i) => {
                    const grade = group.grade!;
                    const letterGrade = grade.letterGrade as LetterGrade;
                    const gradeMeta = GRADE_META[letterGrade];
                    return (
                      <motion.tr key={group.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-gray-50 dark:border-white/[0.03] last:border-0
                          hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                              {group.members.slice(0, 3).map(m => (
                                <span key={m.id}
                                  className={`w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-white dark:border-[#0f1623] ${avatarBg(m.userId)}`}>
                                  {initials(m.name)}
                                </span>
                              ))}
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{group.name}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{group.courseName ?? ""}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          {gradeMeta ? (
                            <span className={`rounded-lg border text-sm font-black px-2.5 py-1
                              ${gradeMeta.color} ${gradeMeta.bg} ${gradeMeta.border}`}>
                              {grade.letterGrade}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                              {grade.letterGrade}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                              <div style={{ width: `${grade.percentage}%` }}
                                className={cn("h-full rounded-full",
                                  grade.percentage >= 70 ? "bg-emerald-500"
                                  : grade.percentage >= 50 ? "bg-amber-500" : "bg-red-500")} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {grade.percentage}%
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {grade.gpa.toFixed(1)}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${grade.gradedBy === "admin" ? "bg-blue-500" : "bg-emerald-500"}`} />
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {grade.graderName} ({grade.gradedBy})
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusBadge status={grade.status} />
                        </td>

                        <td className="px-4 py-3.5">
                          <button onClick={() => setModal({ group, existing: grade })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold
                              border border-blue-200 dark:border-blue-800/50
                              text-blue-600 dark:text-blue-400
                              hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                            <Shield className="w-3 h-3" /> Override
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredGraded.length === 0 && !groupsLoading && (
                <div className="py-16 text-center">
                  <BarChart3 className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    {search ? "No grades match your search" : "No grades yet"}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Fade>
      )}

      <AnimatePresence>
        {modal && (
          <AdminGradeSheet
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
