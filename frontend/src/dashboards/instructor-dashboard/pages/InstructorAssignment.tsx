import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus, Search, Eye,
  FileText, Edit3, Trash2, Send, X, Upload,
  BookOpen, Calendar,
  //   Download,
} from "lucide-react";
import {
  MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS, FILE_META, getFileType,
  type Assignment
  //    AssignmentStatus,
} from "@/data/academicData";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}
function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay, ease: "easeOut" }}>{children}</motion.div>;
}

// const STATUS_COLORS: Record<AssignmentStatus, string> = {
//   pending:   "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
//   submitted: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",
//   late:      "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40",
//   graded:    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
//   returned:  "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40",
//   missing:   "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40",
// };

// function StatusBadge({ status }: { status: AssignmentStatus }) {
//   return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${STATUS_COLORS[status]}`}>{status}</span>;
// }

// function FileChip({ file }: { file: AssignmentFile }) {
//   const meta = FILE_META[getFileType(file.name)];
//   return (
//     <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${meta.bg} border border-gray-100 dark:border-white/[0.06]`}>
//       <span className="text-sm leading-none">{meta.icon}</span>
//       <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{file.name}</span>
//       <span className={`text-[10px] ${meta.color}`}>{file.size}</span>
//       <a href={file.url} download className="text-gray-400 hover:text-blue-500 transition-colors">
//         <Download className="w-3 h-3" />
//       </a>
//     </div>
//   );
// }

// ─── Create / Edit Assignment Modal ───────────────────────────────────────────
function AssignmentModal({ existing, onClose, onSave }: {
  existing?: Assignment; onClose: () => void; onSave: (a: Partial<Assignment>) => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [course, setCourse] = useState(existing?.courseName ?? "React & TypeScript Bootcamp");
  const [desc, setDesc] = useState(existing?.description ?? "");
  const [instructions, setInst] = useState(existing?.instructions ?? "");
  const [dueDate, setDue] = useState(existing?.dueDate?.slice(0, 16) ?? "");
  const [maxScore, setMax] = useState(existing?.maxScore ?? 100);
  const [allowLate, setLate] = useState(existing?.allowLate ?? true);
  const [attachments, setAtts] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => {
    if (!title || !dueDate) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ title, courseName: course, description: desc, instructions, dueDate: new Date(dueDate).toISOString(), maxScore, allowLate, createdBy: "instructor", creatorName: "Sarah Mitchell" });
      setSaving(false); onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.22 }}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[24px]
          bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10">

        <div className="sticky top-0 flex items-center justify-between px-6 py-4
          bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur border-b border-gray-100 dark:border-white/[0.06] z-10">
          <h2 className="text-base font-black text-gray-900 dark:text-white">
            {existing ? "Edit Assignment" : "Create Assignment"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment title…"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 text-gray-800 dark:text-white outline-none transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Course</label>
              <select value={course} onChange={e => setCourse(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 text-gray-800 dark:text-white outline-none cursor-pointer transition-all">
                <option>React & TypeScript Bootcamp</option>
                <option>Node.js Backend Masterclass</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Due Date *</label>
              <input type="datetime-local" value={dueDate} onChange={e => setDue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 text-gray-800 dark:text-white outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
              placeholder="Brief description of the assignment…"
              className="w-full px-4 py-2.5 rounded-xl text-sm resize-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Instructions (step-by-step)</label>
            <textarea value={instructions} onChange={e => setInst(e.target.value)} rows={5}
              placeholder="1. First step&#10;2. Second step&#10;3. ..."
              className="w-full px-4 py-2.5 rounded-xl text-sm resize-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Max Score</label>
              <input type="number" value={maxScore} onChange={e => setMax(+e.target.value)} min={1} max={500}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 text-gray-800 dark:text-white outline-none transition-all" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <button onClick={() => setLate(p => !p)}
                className={cn("relative w-11 h-6 rounded-full transition-all", allowLate ? "bg-blue-600" : "bg-gray-200 dark:bg-white/[0.1]")}>
                <motion.div animate={{ x: allowLate ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Allow late submissions</span>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">Attachments</label>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 text-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Upload brief, rubric, starter files…</p>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={e => e.target.files && setAtts(p => [...p, ...Array.from(e.target.files!)])} />
            </div>
            {attachments.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                {attachments.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                    <span className="text-sm">{FILE_META[getFileType(f.name)].icon}</span>
                    <span className="text-xs flex-1 truncate text-gray-700 dark:text-gray-300">{f.name}</span>
                    <button onClick={() => setAtts(p => p.filter((_, xi) => xi !== i))}>
                      <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <motion.button whileHover={!saving && title && dueDate ? { scale: 1.02 } : {}} whileTap={{ scale: 0.97 }}
              onClick={save} disabled={saving || !title || !dueDate}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2",
                saving || !title || !dueDate
                  ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
              )}>
              {saving
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving…</>
                : <><Send className="w-4 h-4" />{existing ? "Update" : "Publish"}</>
              }
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main InstructorAssignment ─────────────────────────────────────────────────
export function InstructorAssignment() {
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS.filter(a => a.createdBy === "instructor"));
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; assignment: Assignment } | null>(null);
  const [search, setSearch] = useState("");

  const filtered = assignments.filter(a =>
    !search.trim() || a.title.toLowerCase().includes(search.toLowerCase()) || a.courseName.toLowerCase().includes(search.toLowerCase())
  );

  const totalSubs = MOCK_SUBMISSIONS.filter(s => assignments.some(a => a.id === s.assignmentId)).length;
  const ungraded = MOCK_SUBMISSIONS.filter(s => assignments.some(a => a.id === s.assignmentId) && s.status === "submitted").length;

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">
      <Fade>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Assignments <span className="text-blue-600 dark:text-blue-400">Management</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">Create, manage, and review student submissions</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all">
            <Plus className="w-4 h-4" /> New Assignment
          </motion.button>
        </div>
      </Fade>

      {/* Stats */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Published", value: assignments.length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
            { label: "Submissions", value: totalSubs, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
            { label: "Pending Mark", value: ungraded, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
            { label: "Courses", value: new Set(assignments.map(a => a.courseId)).size, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-5">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Search */}
      <Fade delay={0.1}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all" />
        </div>
      </Fade>

      {/* Assignment list */}
      <div className="flex flex-col gap-4">
        {filtered.map((a, i) => {
          const subs = MOCK_SUBMISSIONS.filter(s => s.assignmentId === a.id);
          const graded = subs.filter(s => s.status === "graded").length;
          const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);

          return (
            <Fade key={a.id} delay={0.12 + i * 0.05}>
              <Card className="p-5">
                <div className="flex flex-col w-full gap-3">

                  {/* Top row */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{a.title}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{a.courseName}</span>
                        <span className={cn("flex items-center gap-1 font-semibold",
                          daysLeft < 0 ? "text-red-500" : daysLeft <= 2 ? "text-amber-500" : "text-gray-400")}>
                          <Calendar className="w-3 h-3" />
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `Due in ${daysLeft}d`}
                        </span>
                        <span>{subs.length} submission{subs.length !== 1 ? "s" : ""}</span>
                        <span className="text-emerald-500">{graded} graded</span>
                      </p>
                    </div>

                    {/* Desktop-only icon buttons */}
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                      <Link to={`/instructor/assignments/${a.id}/submissions`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
          border border-blue-200 dark:border-blue-800/50
          text-blue-600 dark:text-blue-400
          hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                        <Eye className="w-3.5 h-3.5" /> Submissions
                      </Link>
                      <button onClick={() => setModal({ mode: "edit", assignment: a })}
                        className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile-only bottom row — full width sibling */}
                  <div className="flex items-center justify-between w-full pt-3
    border-t border-gray-100 dark:border-white/[0.06]
    md:hidden">
                    <Link to={`/instructor/assignments/${a.id}/submissions`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
        border border-blue-200 dark:border-blue-800/50
        text-blue-600 dark:text-blue-400
        hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                      <Eye className="w-3.5 h-3.5" /> Submissions
                    </Link>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal({ mode: "edit", assignment: a })}
                        className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Submission progress */}
                {subs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                      <span>Grading progress</span>
                      <span>{graded}/{subs.length} graded</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${subs.length ? (graded / subs.length) * 100 : 0}%` }}
                        transition={{ duration: 0.7 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                    </div>
                  </div>
                )}
              </Card>
            </Fade>
          );
        })}
      </div>

      <AnimatePresence>
        {modal && (
          <AssignmentModal
            existing={modal.mode === "edit" ? modal.assignment : undefined}
            onClose={() => setModal(null)}
            onSave={draft => { if (modal.mode === "create") setAssignments(p => [...p, { ...MOCK_ASSIGNMENTS[0], ...draft, id: `asg-${Date.now()}`, status: "pending", attachments: [] }]); setModal(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default InstructorAssignment;