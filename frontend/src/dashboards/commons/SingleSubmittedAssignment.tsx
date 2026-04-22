// src/dashboards/commons/SingleSubmittedAssignment.tsx
// Instructor + Admin: view all submissions for one assignment and grade them.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Download, Eye, FileText, Save, User,
  MessageSquare, Award, X, Shield, Loader2, AlertTriangle,
  ExternalLink, Archive, RefreshCw,
} from "lucide-react";
import AssignmentService, {
  type InstructorSubmission,
  type GradeSubmissionPayload,
  type LetterGrade,
} from "@/services/AssignmentService";
import { GRADE_META, FILE_META, getFileType } from "@/data/academicData";
import { FilePreviewModal, type PreviewFile } from "@/components/FilePreviewModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LETTER_GRADES: LetterGrade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>
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

// ─── Safe grade meta lookup ───────────────────────────────────────────────────
// The API grade field can be:
//   • a letter string "A", "B+", etc.
//   • a grade object { id, score, resolvedGrade, feedback, gradedAt }
//   • undefined / null
// Returns { letter, meta } when resolvable, otherwise null.

function safeGradeMeta(grade: unknown): { letter: LetterGrade; meta: typeof GRADE_META[LetterGrade] } | null {
  if (!grade) return null;

  // Plain letter string
  if (typeof grade === "string") {
    const m = GRADE_META[grade as LetterGrade];
    if (m) return { letter: grade as LetterGrade, meta: m };
  }

  // Grade object — derive letter from resolvedGrade (percentage 0‑100)
  if (typeof grade === "object") {
    const g = grade as Record<string, unknown>;
    const pct = typeof g.resolvedGrade === "number" ? g.resolvedGrade : null;
    if (pct !== null) {
      let letter: LetterGrade = "F";
      if (pct >= 97)      letter = "A+";
      else if (pct >= 93) letter = "A";
      else if (pct >= 90) letter = "A-";
      else if (pct >= 87) letter = "B+";
      else if (pct >= 83) letter = "B";
      else if (pct >= 80) letter = "B-";
      else if (pct >= 77) letter = "C+";
      else if (pct >= 73) letter = "C";
      else if (pct >= 70) letter = "C-";
      else if (pct >= 60) letter = "D";
      return { letter, meta: GRADE_META[letter] };
    }
  }

  return null;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CLS: Record<string, string> = {
  pending:   "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800/40",
  submitted: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800/40",
  late:      "bg-orange-50 dark:bg-orange-950/30 text-orange-600 border-orange-200 dark:border-orange-800/40",
  graded:    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800/40",
  returned:  "bg-purple-50 dark:bg-purple-950/30 text-purple-600 border-purple-200 dark:border-purple-800/40",
  missing:   "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-800/40",
};

function StatusBadge({ status }: { status: string | undefined }) {
  if (!status) return null;
  const cls   = STATUS_CLS[status] ?? "bg-gray-50 dark:bg-gray-800/30 text-gray-400 border-gray-200 dark:border-gray-700/40";
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${cls}`}>
      {label}
    </span>
  );
}

// ─── File chip ────────────────────────────────────────────────────────────────

function FileChip({ file, onPreview }: { file: { name: string; url: string; size?: string }; onPreview?: () => void }) {
  const meta = FILE_META[getFileType(file.name)];
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl ${meta.bg} border border-gray-100 dark:border-white/[0.06]`}>
      <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={onPreview}>
        <span className="text-xl leading-none">{meta.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
        {file.size && <p className={`text-[10px] ${meta.color}`}>{file.size}</p>}
      </div>
      <div className="flex items-center gap-1.5">
        {onPreview && (
          <button onClick={onPreview} className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors" title="Preview">
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors" title="Open">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a href={file.url} download={file.name} className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors" title="Download">
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

// ─── Normalised submission shape ──────────────────────────────────────────────
// The raw API response for GET /api/assignments/{id}/submissions returns:
//   { id, assignmentId, studentId, attachments: string[], isLate, submittedAt,
//     grade: { id, score, resolvedGrade, feedback, gradedAt } }
// Student name/email may be joined by the service layer or may be absent.

interface NormalisedSub {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  files: { id: string; name: string; url: string; size?: string }[];
  submittedAt: string;
  isLate: boolean;
  note?: string;
  status: string;         // "submitted" | "late" | "graded"
  gradeLetter?: LetterGrade;
  score?: number;
  feedback?: string;
  gradeRaw?: unknown;
}

function normalise(raw: InstructorSubmission): NormalisedSub {
  const r = raw as unknown as Record<string, unknown>;

  // ── Attachments → files ──
  const attachments: string[] = Array.isArray(r.attachments)
    ? (r.attachments as string[])
    : Array.isArray(raw.files)
      ? raw.files.map((f: { url: string }) => f.url)
      : [];

  const files = attachments.map((url, i) => {
    const name = decodeURIComponent(url.split("?")[0].split("/").pop() ?? `file-${i + 1}`);
    return { id: String(i), name, url };
  });

  // ── Grade ──
  const gradeRaw = r.grade ?? raw.grade;
  let gradeLetter: LetterGrade | undefined;
  let score: number | undefined;
  let feedback: string | undefined;

  if (gradeRaw) {
    const resolved = safeGradeMeta(gradeRaw);
    if (resolved) gradeLetter = resolved.letter;

    if (typeof gradeRaw === "object") {
      const g = gradeRaw as Record<string, unknown>;
      if (typeof g.score    === "number") score    = g.score;
      if (typeof g.feedback === "string") feedback = g.feedback;
    } else {
      if (typeof raw.score === "number") score = raw.score;
      feedback = raw.feedback ?? undefined;
    }
  } else {
    if (typeof raw.score === "number") score = raw.score;
    feedback = raw.feedback ?? undefined;
    if (raw.grade && typeof raw.grade === "string") gradeLetter = raw.grade as LetterGrade;
  }

  // ── Status ──
  let status = (r.status ?? raw.status ?? "") as string;
  if (!status) {
    if (gradeLetter || (gradeRaw && typeof gradeRaw === "object")) status = "graded";
    else if (raw.isLate) status = "late";
    else status = "submitted";
  }

  // ── Student info ──
  // These fields come from the service layer join; fall back gracefully.
  const studentName  = (r.studentName  ?? raw.studentName  ?? "") as string;
  const studentEmail = (r.studentEmail ?? raw.studentEmail ?? "") as string;
  const studentAvatar = (r.studentAvatar ?? raw.studentAvatar) as string | undefined;

  return {
    id:            raw.id,
    studentId:     (r.studentId ?? raw.studentId ?? "") as string,
    studentName,
    studentEmail,
    studentAvatar,
    files,
    submittedAt:   (r.submittedAt ?? raw.submittedAt ?? new Date().toISOString()) as string,
    isLate:        (r.isLate ?? raw.isLate ?? false) as boolean,
    note:          (r.note ?? raw.note) as string | undefined,
    status,
    gradeLetter,
    score,
    feedback,
    gradeRaw,
  };
}

// ─── Marking panel ────────────────────────────────────────────────────────────

function MarkingPanel({
  submission, assignmentMaxScore, onClose, onGraded, isAdmin,
}: {
  submission: NormalisedSub;
  assignmentMaxScore: number;
  onClose: () => void;
  onGraded: (id: string) => void;
  isAdmin?: boolean;
}) {
  const [letter, setLetter]   = useState<LetterGrade>(submission.gradeLetter ?? "B");
  const [score,  setScore]    = useState(submission.score ?? Math.round(assignmentMaxScore * 0.75));
  const [feedback, setFb]     = useState(submission.feedback ?? "");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [preview, setPreview] = useState<{ files: PreviewFile[]; index: number } | null>(null);

  const meta = GRADE_META[letter];
  const previewFiles: PreviewFile[] = submission.files.map(f => ({ name: f.name, url: f.url, size: f.size }));

  const save = async () => {
    if (!feedback.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload: GradeSubmissionPayload = { score, grade: letter, feedback: feedback.trim() };
      await AssignmentService.gradeSubmission(submission.id, payload);
      onGraded(submission.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save grade.");
    } finally {
      setSaving(false);
    }
  };

  const displayName  = submission.studentName  || `Student …${submission.studentId.slice(-6)}`;
  const displayEmail = submission.studentEmail || submission.studentId;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-end">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="relative h-full w-full max-w-md bg-white dark:bg-[#0f1623] border-l border-gray-100 dark:border-white/[0.07] shadow-[-8px_0_40px_rgba(0,0,0,0.12)] overflow-y-auto z-10"
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur border-b border-gray-100 dark:border-white/[0.06] z-10">
            <div className="flex items-center gap-3">
              {submission.studentAvatar ? (
                <img src={submission.studentAvatar} alt={displayName} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-white">{displayName}</p>
                <p className="text-[10px] text-gray-400">{displayEmail}</p>
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
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Files */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Submitted Files ({submission.files.length})
                </p>
                {submission.files.length > 1 && (
                  <button onClick={() => setPreview({ files: previewFiles, index: 0 })} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    <Archive className="w-3 h-3" /> View All
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {submission.files.length === 0
                  ? <p className="text-xs text-gray-400 italic">No files submitted.</p>
                  : submission.files.map((f, i) => (
                    <FileChip key={f.id} file={f} onPreview={f.url ? () => setPreview({ files: previewFiles, index: i }) : undefined} />
                  ))
                }
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                Submitted {new Date(submission.submittedAt).toLocaleString()}
                {submission.isLate && <span className="ml-2 text-orange-500 font-bold">· Late</span>}
              </p>
              {submission.note && (
                <div className="mt-2 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Student Note</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{submission.note}</p>
                </div>
              )}
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
                      )}>
                      {g}
                    </button>
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
              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">Score — {score}/{assignmentMaxScore}</p>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={assignmentMaxScore} value={score} onChange={e => setScore(+e.target.value)} className="flex-1 accent-blue-600" />
                <input type="number" value={score} min={0} max={assignmentMaxScore} onChange={e => setScore(Math.min(assignmentMaxScore, Math.max(0, +e.target.value)))}
                  className="w-16 px-2 py-1 rounded-lg text-sm font-black text-center bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white outline-none" />
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] mt-2 overflow-hidden">
                <div style={{ width: `${(score / assignmentMaxScore) * 100}%` }}
                  className={cn("h-full rounded-full transition-all",
                    score >= assignmentMaxScore * 0.7 ? "bg-emerald-500" : score >= assignmentMaxScore * 0.5 ? "bg-amber-500" : "bg-red-500"
                  )} />
              </div>
            </div>

            {/* Feedback */}
            <div>
              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">Feedback *</p>
              <textarea value={feedback} onChange={e => setFb(e.target.value)} rows={5}
                placeholder="Write detailed, constructive feedback for the student…"
                className="w-full px-4 py-3 rounded-xl text-sm resize-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all" />
            </div>

            {/* Save */}
            <motion.button
              whileHover={!saving && feedback.trim() ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.97 }}
              onClick={save}
              disabled={saving || !feedback.trim()}
              className={cn("w-full py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2",
                saving || !feedback.trim()
                  ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_6px_20px_rgba(59,130,246,0.4)]"
              )}>
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                : <><Save className="w-4 h-4" />{submission.gradeLetter ? "Update Grade" : "Submit Grade"}</>
              }
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {preview && (
          <FilePreviewModal key="marking-preview" files={preview.files} initialIndex={preview.index} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SingleSubmittedAssignment() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [marking, setMarking] = useState<NormalisedSub | null>(null);
  const [filter, setFilter]   = useState<"all" | "submitted" | "graded" | "late">("all");
  const [preview, setPreview] = useState<{ files: PreviewFile[]; index: number } | null>(null);

  const isAdmin = window.location.pathname.startsWith("/admin");

  const { data: assignment } = useQuery({
    queryKey: ["assignment-detail", id],
    queryFn: async () => {
      try { return await AssignmentService.getInstructorAssignment(id!); }
      catch { return null; }
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const { data: submissionsData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["submissions", id],
    queryFn: async () => {
      try { return await AssignmentService.getSubmissions(id!, { limit: 200 }); }
      catch { return { data: [], meta: { total: 0, page: 1, limit: 200, totalPages: 1 } }; }
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  // Normalise every submission — this is the single place that handles API shape variation
  const submissions: NormalisedSub[] = (submissionsData?.data ?? []).map(normalise);

  const filtered = filter === "all" ? submissions : submissions.filter(s => s.status === filter);
  const graded   = submissions.filter(s => s.status === "graded").length;
  const pending  = submissions.filter(s => s.status === "submitted" || s.status === "late").length;
  const maxScore = assignment?.maxScore ?? 100;

  const handleGraded = (updatedId: string) => {
    // Refetch to get fresh data (status change, grade populated, etc.)
    refetch();
    // Close the panel if the submission that was just graded is the open one
    if (marking?.id === updatedId) setMarking(null);
    // Update the assignment list page counts
    qc.invalidateQueries({ queryKey: ["instructor-assignments"] });
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-gray-900 dark:text-white">
                  {assignment?.title ?? "Loading assignment…"}
                </h1>
                {isFetching && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
              </div>
              {assignment && (
                <p className="text-sm text-gray-400 flex items-center gap-3 flex-wrap mt-1">
                  <span>{assignment.courseName}</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span>Due {new Date(assignment.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span>Max {assignment.maxScore} pts</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => refetch()} disabled={isFetching}
                className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all disabled:opacity-40">
                <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
              </button>
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

          {submissions.length > 0 && (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Grading progress</span>
                <span>{graded}/{submissions.length} graded</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${submissions.length ? (graded / submissions.length) * 100 : 0}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                />
              </div>
            </div>
          )}
        </Card>
      </Fade>

      {/* Filter tabs */}
      <Fade delay={0.08}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
          {(["all", "submitted", "graded", "late"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                filter === f ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              )}>
              {f}
            </button>
          ))}
        </div>
      </Fade>

      {/* Rows */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-white/[0.05]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
                  <div className="h-3 w-1/2 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <Fade delay={0.1}>
            <Card className="p-16 text-center">
              <User className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">
                {submissions.length === 0 ? "No submissions yet" : "No submissions in this category"}
              </p>
            </Card>
          </Fade>
        ) : (
          filtered.map((sub, i) => {
            const previewFileList: PreviewFile[] = sub.files.map(f => ({ name: f.name, url: f.url, size: f.size }));
            // Safely resolve grade display — never crashes even if gradeRaw is malformed
            const gradeInfo = safeGradeMeta(sub.gradeLetter ?? sub.gradeRaw);
            const displayName = sub.studentName || `Student …${sub.studentId.slice(-6)}`;

            return (
              <Fade key={sub.id} delay={0.1 + i * 0.04}>
                <Card className="p-5">
                  <div className="flex items-center gap-4">
                    {sub.studentAvatar ? (
                      <img src={sub.studentAvatar} alt={displayName} className="w-11 h-11 rounded-2xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{displayName}</p>
                        <StatusBadge status={sub.status} />
                        {sub.isLate && (
                          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/30">
                            Late
                          </span>
                        )}
                        {/* Only render when meta is safely resolved */}
                        {gradeInfo && (
                          <span className={`text-sm font-black px-2.5 py-0.5 rounded-xl border ${gradeInfo.meta.color} ${gradeInfo.meta.bg} ${gradeInfo.meta.border}`}>
                            {gradeInfo.letter}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {sub.files.length} file{sub.files.length !== 1 ? "s" : ""}
                        {" · "}{new Date(sub.submittedAt).toLocaleDateString()}
                        {sub.score != null && (
                          <span className="ml-2 font-bold text-gray-600 dark:text-gray-300">
                            {sub.score}/{maxScore}
                          </span>
                        )}
                      </p>
                      {sub.studentEmail && (
                        <p className="text-[10px] text-gray-400 truncate">{sub.studentEmail}</p>
                      )}
                    </div>

                    {/* File type badges */}
                    <div className="hidden sm:flex items-center gap-1.5 flex-wrap max-w-[180px]">
                      {sub.files.slice(0, 2).map((f, fi) => {
                        const meta = FILE_META[getFileType(f.name)];
                        return (
                          <button key={f.id}
                            onClick={() => setPreview({ files: previewFileList, index: fi })}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${meta.bg} ${meta.color} hover:opacity-80 transition-opacity`}>
                            {meta.icon} {f.name.split(".").pop()?.toUpperCase()}
                          </button>
                        );
                      })}
                      {sub.files.length > 2 && (
                        <button onClick={() => setPreview({ files: previewFileList, index: 0 })}
                          className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline">
                          +{sub.files.length - 2} more
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {previewFileList.length > 0 && (
                        <button onClick={() => setPreview({ files: previewFileList, index: 0 })}
                          className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all"
                          title="Preview files">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setMarking(sub)}
                        className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                          sub.status === "graded"
                            ? "border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_3px_10px_rgba(59,130,246,0.3)]"
                        )}>
                        {sub.status === "graded"
                          ? <><Eye className="w-3.5 h-3.5" /> Review</>
                          : <><Award className="w-3.5 h-3.5" /> Mark</>
                        }
                      </motion.button>
                    </div>
                  </div>

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
            );
          })
        )}
      </div>

      <AnimatePresence>
        {marking && (
          <MarkingPanel
            key="marking"
            submission={marking}
            assignmentMaxScore={maxScore}
            isAdmin={isAdmin}
            onClose={() => setMarking(null)}
            onGraded={handleGraded}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {preview && (
          <FilePreviewModal key="row-preview" files={preview.files} initialIndex={preview.index} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}