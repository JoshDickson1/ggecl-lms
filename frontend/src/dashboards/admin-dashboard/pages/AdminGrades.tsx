// src/pages/admin/AdminGrades.tsx
// Admin sees ALL groups across ALL courses, can grade/override any.
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, CheckCircle2, Clock, Plus,
  Search, BarChart3, AlertTriangle,
  ChevronDown, Shield,
} from "lucide-react";
import {
  MOCK_GRADES, MOCK_GROUPS, GRADE_META,
//    rubricTotal,
  type Grade, type StudentGroup,
} from "@/data/academicData";
// Re-use the GradeModal from InstructorGrades — in prod, extract to a shared component
// For now, we inline a simpler version

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

function StatusBadge({ status }: { status: Grade["status"] }) {
  const map = {
    graded:       { label: "Graded",    cls: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800/40" },
    pending:      { label: "Pending",   cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800/40"           },
    under_review: { label: "Review",    cls: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800/40"                },
  }[status];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${map.cls}`}>{map.label}</span>;
}

// Inline grade form (simplified for admin — admin can grade anything)
function AdminGradeSheet({
  group, existing, onClose, onSave,
}: {
  group: StudentGroup; existing?: Grade; onClose: () => void;
  onSave: (g: Partial<Grade>) => void;
}) {
  const GRADES = ["A+","A","A-","B+","B","B-","C+","C","C-","D","F"] as const;
  const [letter, setLetter]   = useState<Grade["letterGrade"]>(existing?.letterGrade ?? "B");
  const [pct, setPct]         = useState(existing?.percentage ?? 75);
  const [feedback, setFb]     = useState(existing?.feedback ?? "");
  const [saving, setSaving]   = useState(false);
  const meta = GRADE_META[letter];

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({ letterGrade: letter, percentage: pct, feedback,
        gradedBy: "admin", graderName: "Emeka Osei",
        gradedAt: new Date().toISOString(), status: "graded",
        gpa: meta.gpa,
        strengths: [], improvements: [],
        rubric: existing?.rubric ?? [],
      });
      setSaving(false); onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.22 }}
        className="relative w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10 overflow-hidden">

        {/* Admin badge */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Admin Grade Override</span>
            </div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">{group.name}</h2>
            <p className="text-xs text-gray-400">{group.courseName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 rotate-[-90deg]" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Members */}
          <div className="flex -space-x-2">
            {group.members.map(m => (
              <span key={m.id} className={`w-8 h-8 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-[#0f1623] ${m.avatarBg}`}>
                {m.avatar}
              </span>
            ))}
            <span className="ml-2 text-xs text-gray-500 self-center pl-1">{group.members.length} members</span>
          </div>

          {/* Grade select */}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Letter Grade</p>
            <div className="flex flex-wrap gap-1.5">
              {GRADES.map(g => {
                const m = GRADE_META[g];
                return (
                  <button key={g} onClick={() => setLetter(g)}
                    className={cn("px-2.5 py-1 rounded-lg text-sm font-bold border transition-all",
                      letter === g ? `${m.color} ${m.bg} ${m.border} shadow scale-105` : "border-gray-200 dark:border-white/[0.08] text-gray-400 hover:border-blue-300"
                    )}>{g}</button>
                );
              })}
            </div>
            <p className={`text-sm font-semibold mt-2 ${meta.color}`}>{meta.label} · GPA {meta.gpa.toFixed(1)}</p>
          </div>

          {/* Percentage */}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Score Percentage</p>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} value={pct} onChange={e => setPct(+e.target.value)}
                className="flex-1 accent-blue-600" />
              <span className="text-xl font-black text-gray-900 dark:text-white w-14 text-right">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] mt-2 overflow-hidden">
              <div style={{ width: `${pct}%` }} className={cn("h-full rounded-full transition-all",
                pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500")} />
            </div>
          </div>

          {/* Feedback */}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Admin Feedback</p>
            <textarea rows={3} value={feedback} onChange={e => setFb(e.target.value)}
              placeholder="Provide feedback as admin…"
              className="w-full px-4 py-3 rounded-xl text-sm resize-none
                bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08]
                focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all" />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold
              border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
              hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={save} disabled={saving || !feedback.trim()}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2",
                saving || !feedback.trim()
                  ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
              )}>
              {saving ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving…</> : <><Shield className="w-4 h-4" />Override Grade</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminGrades() {
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES);
  const [modal, setModal]   = useState<{ group: StudentGroup; existing?: Grade } | null>(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourse] = useState("all");

  const allCourses = Array.from(new Set(MOCK_GROUPS.map(g => g.courseName)));
  const ungradedGroups = MOCK_GROUPS.filter(g => !grades.find(gr => gr.groupId === g.id));

  const filteredGrades = grades.filter(g => {
    const matchSearch = !search.trim() || g.groupName.toLowerCase().includes(search.toLowerCase()) || g.courseName.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === "all" || g.courseName === courseFilter;
    return matchSearch && matchCourse;
  });

  const totalPct = grades.length ? Math.round(grades.reduce((s, g) => s + g.percentage, 0) / grades.length) : 0;

  const handleSave = (draft: Partial<Grade>) => {
    if (!modal) return;
    const existing = grades.find(g => g.groupId === modal.group.id);
    if (existing) {
      setGrades(prev => prev.map(g => g.groupId === modal.group.id ? { ...g, ...draft } : g));
    } else {
      setGrades(prev => [...prev, {
        id: `grd-${Date.now()}`, groupId: modal.group.id, groupName: modal.group.name,
        courseId: modal.group.courseId, courseName: modal.group.courseName,
        letterGrade: "B", percentage: 75, gpa: 3.0, status: "graded",
        gradedBy: "admin", graderName: "Emeka Osei", gradedAt: new Date().toISOString(),
        feedback: "", strengths: [], improvements: [], rubric: [],
        isAppealable: true, ...draft,
      } as Grade]);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      <Fade>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Grades <span className="text-blue-600 dark:text-blue-400">Overview</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">All groups across all courses · Admin override enabled</p>
        </div>
      </Fade>

      {/* Summary tiles */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users,        label: "Total Groups",  value: String(MOCK_GROUPS.length), color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/40"    },
            { icon: CheckCircle2, label: "Graded",        value: String(grades.filter(g=>g.status==="graded").length), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
            { icon: Clock,        label: "Ungraded",      value: String(ungradedGroups.length), color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/40"  },
            { icon: BarChart3,    label: "Avg. Score",    value: `${totalPct}%`, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
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

      {/* Search + filter */}
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
          <select value={courseFilter} onChange={e => setCourse(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#0f1623]
              border border-gray-200 dark:border-white/[0.08]
              text-gray-700 dark:text-gray-300 outline-none cursor-pointer
              focus:border-blue-400 transition-all">
            <option value="all">All Courses</option>
            {allCourses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </Fade>

      {/* Ungraded */}
      {ungradedGroups.length > 0 && (
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
                  <Users className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{group.name}</p>
                    <p className="text-xs text-gray-400">{group.courseName}</p>
                  </div>
                  <button onClick={() => setModal({ group })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                      bg-blue-600 hover:bg-blue-500 text-white shadow-[0_3px_10px_rgba(59,130,246,0.3)] transition-all">
                    <Plus className="w-3.5 h-3.5" /> Grade
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Fade>
      )}

      {/* All grades table */}
      <Fade delay={0.15}>
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
            <p className="text-sm font-black text-gray-900 dark:text-white">
              All Grades <span className="text-gray-400 font-normal">({filteredGrades.length})</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  {["Group","Course","Grade","Score","GPA","Graded By","Status",""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade, i) => {
                  const group = MOCK_GROUPS.find(g => g.id === grade.groupId);
                  return (
                    <motion.tr key={grade.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-gray-50 dark:border-white/[0.03] last:border-0
                        hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {group && <div className="flex -space-x-1.5">
                            {group.members.slice(0, 3).map(m => (
                              <span key={m.id} className={`w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-white dark:border-[#0f1623] ${m.avatarBg}`}>
                                {m.avatar}
                              </span>
                            ))}
                          </div>}
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{grade.groupName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{grade.courseName}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded-lg border text-sm font-black px-2.5 py-1 ${GRADE_META[grade.letterGrade].color} ${GRADE_META[grade.letterGrade].bg} ${GRADE_META[grade.letterGrade].border}`}>
                          {grade.letterGrade}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                            <div style={{ width: `${grade.percentage}%` }}
                              className={cn("h-full rounded-full", grade.percentage >= 70 ? "bg-emerald-500" : grade.percentage >= 50 ? "bg-amber-500" : "bg-red-500")} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{grade.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{grade.gpa.toFixed(1)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${grade.gradedBy === "admin" ? "bg-blue-500" : "bg-emerald-500"}`} />
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{grade.graderName} ({grade.gradedBy})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={grade.status} /></td>
                      <td className="px-4 py-3.5">
                        {group && (
                          <button onClick={() => setModal({ group, existing: grade })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold
                              border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400
                              hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                            <Shield className="w-3 h-3" /> Override
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filteredGrades.length === 0 && (
              <div className="py-16 text-center">
                <BarChart3 className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No grades found</p>
              </div>
            )}
          </div>
        </Card>
      </Fade>

      <AnimatePresence>
        {modal && (
          <AdminGradeSheet group={modal.group} existing={modal.existing}
            onClose={() => setModal(null)} onSave={handleSave} />
        )}
      </AnimatePresence>
    </div>
  );
}