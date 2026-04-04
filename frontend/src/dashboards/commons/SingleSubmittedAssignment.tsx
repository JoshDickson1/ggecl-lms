// src/pages/shared/SingleSubmittedAssignment.tsx
// Used by both instructor (/instructor/assignments/:id/submissions)
// and admin (/admin/assignments/:id/submissions)
// Shows all submissions for an assignment + individual marking.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Download, Eye, FileText, Save, User,
  MessageSquare, Award, Archive, X, Shield,
} from "lucide-react";
import {
  MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS, GRADE_META, FILE_META, getFileType,
  type Submission, type LetterGrade, type RubricCriterion,
} from "@/data/academicData";

const LETTER_GRADES: LetterGrade[] = ["A+","A","A-","B+","B","B-","C+","C","C-","D","F"];

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}
function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay, ease: "easeOut" }}>{children}</motion.div>;
}

function StatusBadge({ status }: { status: Submission["status"] }) {
  const map = {
    pending:   { label: "Pending",   cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800/40"     },
    submitted: { label: "Submitted", cls: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800/40"           },
    late:      { label: "Late",      cls: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 border-orange-200 dark:border-orange-800/40"  },
    graded:    { label: "Graded",    cls: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800/40" },
    returned:  { label: "Returned",  cls: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 border-purple-200 dark:border-purple-800/40"  },
    missing:   { label: "Missing",   cls: "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-800/40"                 },
  }[status];
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${map.cls}`}>{map.label}</span>;
}

// ─── File preview chip ─────────────────────────────────────────────────────────
function FilePreview({ file }: { file: { id: string; name: string; size: string; type: string; url: string } }) {
  const meta = FILE_META[getFileType(file.name)];
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl ${meta.bg} border border-gray-100 dark:border-white/[0.06] group`}>
      <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0">
        <span className="text-xl leading-none">{meta.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
        <p className={`text-[10px] ${meta.color}`}>{file.size} · {file.type}</p>
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors">
          <Eye className="w-3.5 h-3.5" />
        </button>
        <a href={file.url} download className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors">
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

// ─── Marking panel ─────────────────────────────────────────────────────────────
function MarkingPanel({
  submission, onClose, onMark, isAdmin,
}: {
  submission: Submission; onClose: () => void;
  onMark: (sub: Submission) => void; isAdmin?: boolean;
}) {
  const [letter, setLetter]   = useState<LetterGrade>(submission.grade ?? "B");
  const [score, setScore]     = useState(submission.score ?? Math.round(submission.maxScore * 0.75));
  const [feedback, setFb]     = useState(submission.feedback ?? "");
  const [rubric, setRubric]   = useState<RubricCriterion[]>(
    submission.rubric ?? [
      { id: "r1", label: "Functionality",  maxScore: 40, score: 32 },
      { id: "r2", label: "Code Quality",   maxScore: 30, score: 22 },
      { id: "r3", label: "TypeScript",     maxScore: 20, score: 16 },
      { id: "r4", label: "Testing",        maxScore: 10, score: 8  },
    ]
  );
  const [saving, setSaving] = useState(false);
  const meta = GRADE_META[letter];
  const rubricScore = rubric.reduce((s, r) => s + r.score, 0);
  const rubricMax   = rubric.reduce((s, r) => s + r.maxScore, 0);

  const save = () => {
    if (!feedback.trim()) return;
    setSaving(true);
    setTimeout(() => {
      onMark({
        ...submission,
        grade: letter, score, feedback, rubric,
        status: "graded",
        gradedBy: isAdmin ? "admin" : "instructor",
        graderName: isAdmin ? "Emeka Osei" : "Sarah Mitchell",
        gradedAt: new Date().toISOString(),
      });
      setSaving(false);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="relative h-full w-full max-w-md bg-white dark:bg-[#0f1623]
          border-l border-gray-100 dark:border-white/[0.07]
          shadow-[-8px_0_40px_rgba(0,0,0,0.12)] overflow-y-auto z-10">

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4
          bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur border-b border-gray-100 dark:border-white/[0.06] z-10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl text-sm font-black text-white flex items-center justify-center ${submission.studentAvatarBg}`}>
              {submission.studentAvatar}
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 dark:text-white">{submission.studentName}</p>
              <p className="text-[10px] text-gray-400">{submission.assignmentTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && <Shield className="w-4 h-4 text-blue-500" />}
            <button onClick={onClose} className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Submitted files */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Submitted Files</p>
              <a href="#" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                <Archive className="w-3 h-3" /> Download All
              </a>
            </div>
            <div className="flex flex-col gap-2">
              {submission.files.map(f => <FilePreview key={f.id} file={f} />)}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Submitted {new Date(submission.submittedAt).toLocaleString()}
              {submission.isLate && <span className="ml-2 text-orange-500 font-bold">· Late submission</span>}
            </p>
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

          {/* Letter grade */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">Letter Grade</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {LETTER_GRADES.map(g => {
                const m = GRADE_META[g];
                return (
                  <button key={g} onClick={() => setLetter(g)}
                    className={cn("px-2 py-1 rounded-lg text-xs font-bold border transition-all",
                      letter === g ? `${m.color} ${m.bg} ${m.border} scale-105 shadow` : "border-gray-200 dark:border-white/[0.08] text-gray-400 hover:border-blue-300"
                    )}>{g}</button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black rounded-xl border px-3 py-1 ${meta.color} ${meta.bg} ${meta.border}`}>{letter}</span>
              <span className={`text-sm font-semibold ${meta.color}`}>{meta.label} · GPA {meta.gpa.toFixed(1)}</span>
            </div>
          </div>

          {/* Score */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">
              Score — {score}/{submission.maxScore}
            </p>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={submission.maxScore} value={score}
                onChange={e => setScore(+e.target.value)} className="flex-1 accent-blue-600" />
              <div className="relative w-16">
                <input type="number" value={score} min={0} max={submission.maxScore}
                  onChange={e => setScore(Math.min(submission.maxScore, Math.max(0, +e.target.value)))}
                  className="w-full px-2 py-1 rounded-lg text-sm font-black text-center bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white outline-none" />
              </div>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] mt-2 overflow-hidden">
              <div style={{ width: `${(score / submission.maxScore) * 100}%` }}
                className={cn("h-full rounded-full transition-all",
                  score >= submission.maxScore * 0.7 ? "bg-emerald-500" : score >= submission.maxScore * 0.5 ? "bg-amber-500" : "bg-red-500"
                )} />
            </div>
          </div>

          {/* Rubric */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">
              Rubric — {rubricScore}/{rubricMax} ({Math.round((rubricScore/rubricMax)*100)}%)
            </p>
            <div className="flex flex-col gap-3">
              {rubric.map((r, i) => (
                <div key={r.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{r.label}</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{r.score}/{r.maxScore}</span>
                  </div>
                  <input type="range" min={0} max={r.maxScore} value={r.score}
                    onChange={e => setRubric(prev => prev.map((x, xi) => xi === i ? { ...x, score: +e.target.value } : x))}
                    className="w-full accent-blue-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">Feedback *</p>
            <textarea value={feedback} onChange={e => setFb(e.target.value)} rows={4}
              placeholder="Write detailed, constructive feedback for the student…"
              className="w-full px-4 py-3 rounded-xl text-sm resize-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all" />
          </div>

          {/* Save */}
          <motion.button whileHover={!saving && feedback.trim() ? { scale: 1.02 } : {}} whileTap={{ scale: 0.97 }}
            onClick={save} disabled={saving || !feedback.trim()}
            className={cn("w-full py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2",
              saving || !feedback.trim()
                ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_6px_20px_rgba(59,130,246,0.4)]"
            )}>
            {saving
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving…</>
              : <><Save className="w-4 h-4" />{submission.grade ? "Update Grade" : "Submit Grade"}</>
            }
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SingleSubmittedAssignment() {
  const { id } = useParams<{ id: string }>();
  const assignment = MOCK_ASSIGNMENTS.find(a => a.id === id) ?? MOCK_ASSIGNMENTS[0];
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS.filter(s => s.assignmentId === assignment.id));
  const [marking, setMarking] = useState<Submission | null>(null);
  const [filter, setFilter]   = useState<"all" | "submitted" | "graded" | "late">("all");

  // Determine admin vs instructor from URL
  const isAdmin = window.location.pathname.startsWith("/admin");

  const filtered = filter === "all" ? submissions : submissions.filter(s => s.status === filter);
  const graded   = submissions.filter(s => s.status === "graded").length;
  const pending  = submissions.filter(s => s.status === "submitted").length;

  const handleMark = (updated: Submission) => {
    setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setMarking(null);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">
      {/* Back */}
      <Fade>
        <Link to={isAdmin ? "/admin/assignments" : "/instructor/assignments"}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </Link>

        <Card className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-gray-900 dark:text-white mb-1">{assignment.title}</h1>
              <p className="text-sm text-gray-400 flex items-center gap-3 flex-wrap">
                <span>{assignment.courseName}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>Due {new Date(assignment.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>Max score: {assignment.maxScore}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>By {assignment.creatorName} ({assignment.createdBy})</span>
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-center px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{graded}</p>
                <p className="text-[10px] text-gray-400">Graded</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                <p className="text-lg font-black text-amber-600 dark:text-amber-400">{pending}</p>
                <p className="text-[10px] text-gray-400">Pending</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">{submissions.length}</p>
                <p className="text-[10px] text-gray-400">Total</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Grading progress</span>
              <span>{graded}/{submissions.length} graded</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${submissions.length ? (graded/submissions.length)*100 : 0}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
            </div>
          </div>
        </Card>
      </Fade>

      {/* Filter */}
      <Fade delay={0.08}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
          {(["all","submitted","graded","late"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                filter === f ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                             : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              )}>{f}</button>
          ))}
        </div>
      </Fade>

      {/* Submission rows */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <Fade delay={0.1}>
            <Card className="p-16 text-center">
              <User className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No submissions in this category</p>
            </Card>
          </Fade>
        ) : (
          filtered.map((sub, i) => (
            <Fade key={sub.id} delay={0.1 + i * 0.05}>
              <Card className="p-5">
                <div className="flex items-center gap-4">
                  {/* Student */}
                  <div className={`w-11 h-11 rounded-2xl text-sm font-black text-white flex items-center justify-center flex-shrink-0 ${sub.studentAvatarBg}`}>
                    {sub.studentAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{sub.studentName}</p>
                      <StatusBadge status={sub.status} />
                      {sub.isLate && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/30">
                          Late
                        </span>
                      )}
                      {sub.grade && (
                        <span className={`text-sm font-black px-2.5 py-0.5 rounded-xl border ${GRADE_META[sub.grade].color} ${GRADE_META[sub.grade].bg} ${GRADE_META[sub.grade].border}`}>
                          {sub.grade}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {sub.files.length} file{sub.files.length !== 1 ? "s" : ""} · {new Date(sub.submittedAt).toLocaleDateString()}
                      {sub.score != null && <span className="ml-2 font-bold text-gray-600 dark:text-gray-400">{sub.score}/{sub.maxScore}</span>}
                      {sub.graderName && <span className="ml-2">· Marked by {sub.graderName}</span>}
                    </p>
                  </div>

                  {/* File chips (truncated) */}
                  <div className="hidden sm:flex items-center gap-1.5 flex-wrap max-w-[180px]">
                    {sub.files.slice(0, 2).map(f => {
                      const meta = FILE_META[getFileType(f.name)];
                      return (
                        <span key={f.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${meta.bg} ${meta.color}`}>
                          {meta.icon} {f.name.split(".").pop()?.toUpperCase()}
                        </span>
                      );
                    })}
                    {sub.files.length > 2 && (
                      <span className="text-[10px] text-gray-400">+{sub.files.length - 2}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setMarking(sub)}
                      className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                        sub.status === "graded"
                          ? "border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_3px_10px_rgba(59,130,246,0.3)]"
                      )}>
                      {sub.status === "graded" ? <><Eye className="w-3.5 h-3.5" /> Review</> : <><Award className="w-3.5 h-3.5" /> Mark</>}
                    </motion.button>
                  </div>
                </div>

                {/* Feedback preview */}
                {sub.feedback && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      {sub.feedback}
                    </p>
                  </div>
                )}
              </Card>
            </Fade>
          ))
        )}
      </div>

      {/* Marking panel */}
      <AnimatePresence>
        {marking && (
          <MarkingPanel submission={marking} isAdmin={isAdmin}
            onClose={() => setMarking(null)} onMark={handleMark} />
        )}
      </AnimatePresence>
    </div>
  );
}