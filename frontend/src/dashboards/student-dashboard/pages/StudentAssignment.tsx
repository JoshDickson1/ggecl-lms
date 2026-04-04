// src/pages/student/StudentAssignment.tsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Upload, FileText, Clock, CheckCircle2,
  AlertTriangle, XCircle, X,
  ChevronDown, BookOpen, Send, Archive,
} from "lucide-react";
import {
  MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS, FILE_META, GRADE_META, getFileType,
  type Assignment, type AssignmentFile, type AssignmentStatus,
} from "@/data/academicData";

const STUDENT_ID = "stu-001";
const mySubmissions = MOCK_SUBMISSIONS.filter(s => s.studentId === STUDENT_ID);

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

// ─── Status badge ──────────────────────────────────────────────────────────────
const STATUS_MAP: Record<AssignmentStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending:   { label: "Pending",   color: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800/40",   icon: Clock        },
  submitted: { label: "Submitted", color: "text-blue-700 dark:text-blue-300",     bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800/40",     icon: CheckCircle2 },
  late:      { label: "Late",      color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800/40", icon: AlertTriangle },
  graded:    { label: "Graded",    color: "text-emerald-700 dark:text-emerald-300",bg: "bg-emerald-50 dark:bg-emerald-950/30",border: "border-emerald-200 dark:border-emerald-800/40",icon: CheckCircle2 },
  returned:  { label: "Returned",  color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800/40", icon: FileText      },
  missing:   { label: "Missing",   color: "text-red-700 dark:text-red-300",       bg: "bg-red-50 dark:bg-red-950/30",       border: "border-red-200 dark:border-red-800/40",       icon: XCircle      },
};

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const s = STATUS_MAP[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.color} ${s.bg} ${s.border}`}>
      <Icon className="w-3 h-3" />{s.label}
    </span>
  );
}

// ─── File chip ────────────────────────────────────────────────────────────────
function FileChip({ file, onRemove }: { file: AssignmentFile | File; onRemove?: () => void }) {
  const isRaw = file instanceof File;
  const name  = isRaw ? file.name : file.name;
  const size  = isRaw ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : (file as AssignmentFile).size;
  const type  = getFileType(name);
  const meta  = FILE_META[type];

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${meta.bg} border border-gray-100 dark:border-white/[0.06]`}>
      <span className="text-base leading-none">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{name}</p>
        <p className={`text-[10px] ${meta.color}`}>{size}</p>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {!onRemove && !isRaw && (
        <a href={(file as AssignmentFile).url} download className="text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0">
          <Download className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

// ─── Submit modal ──────────────────────────────────────────────────────────────
function SubmitModal({ assignment, onClose, onSubmit }: {
  assignment: Assignment; onClose: () => void; onSubmit: () => void;
}) {
  const [files, setFiles]     = useState<File[]>([]);
  const [submitting, setSub]  = useState(false);
  const [note, setNote]       = useState("");
  const fileRef               = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const submit = () => {
    if (!files.length) return;
    setSub(true);
    setTimeout(() => { setSub(false); onSubmit(); onClose(); }, 1600);
  };

  const isLate = new Date() > new Date(assignment.dueDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.22 }}
        className="relative w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10 overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">Submit Assignment</h2>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{assignment.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {isLate && assignment.allowLate && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30">
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                This submission is past the due date and will be marked as late.
              </p>
            </div>
          )}

          {/* Drop zone */}
          <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 text-center cursor-pointer
              hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all group">
            <Upload className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Drop files here or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Allowed: {assignment.allowedFileTypes.join(", ")}
            </p>
            <input ref={fileRef} type="file" multiple className="hidden" accept={assignment.allowedFileTypes.join(",")} onChange={handleFiles} />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              {files.map((f, i) => (
                <FileChip key={i} file={f} onRemove={() => setFiles(prev => prev.filter((_, xi) => xi !== i))} />
              ))}
            </div>
          )}

          {/* Submission note */}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Submission Note (optional)</p>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder="Any notes for your instructor…"
              className="w-full px-4 py-2.5 rounded-xl text-sm resize-none
                bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08]
                focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all" />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold
              border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <motion.button whileHover={!submitting && files.length ? { scale: 1.02 } : {}}
              whileTap={!submitting && files.length ? { scale: 0.97 } : {}}
              onClick={submit} disabled={submitting || !files.length}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2",
                submitting || !files.length
                  ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                  : isLate && assignment.allowLate
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
              )}>
              {submitting
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Submitting…</>
                : <><Send className="w-4 h-4" />{isLate ? "Submit Late" : "Submit"}</>
              }
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Assignment card ──────────────────────────────────────────────────────────
function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const [open, setOpen] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submission = mySubmissions.find(s => s.assignmentId === assignment.id);
  const status: AssignmentStatus = submitted ? "submitted" : assignment.status;
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
  const isOverdue = daysLeft < 0;
  const gradeMeta = submission?.grade ? GRADE_META[submission.grade] : null;

  return (
    <>
      <Card>
        <button className="w-full flex items-center gap-4 px-6 py-4 text-left" onClick={() => setOpen(p => !p)}>
          {/* Left: course icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{assignment.title}</p>
              <StatusBadge status={status} />
              {submission?.grade && gradeMeta && (
                <span className={`text-sm font-black px-2.5 py-0.5 rounded-xl border ${gradeMeta.color} ${gradeMeta.bg} ${gradeMeta.border}`}>
                  {submission.grade}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-3">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{assignment.courseName}</span>
              <span className={`flex items-center gap-1 font-semibold ${isOverdue ? "text-red-500" : daysLeft <= 2 ? "text-amber-500" : "text-gray-400"}`}>
                <Clock className="w-3 h-3" />
                {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today!" : `${daysLeft}d left`}
              </span>
              <span>by {assignment.creatorName} ({assignment.createdBy})</span>
            </p>
          </div>

          {submission?.score != null && (
            <div className="text-right flex-shrink-0 mr-3">
              <p className="text-lg font-black text-gray-900 dark:text-white">{submission.score}/{submission.maxScore}</p>
              <p className="text-[10px] text-gray-400">Score</p>
            </div>
          )}

          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="overflow-hidden">
              <div className="px-6 pb-6 pt-4 border-t border-gray-100 dark:border-white/[0.06] space-y-5">

                {/* Description */}
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">Description</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{assignment.description}</p>
                </div>

                {/* Instructions */}
                <div className="rounded-2xl p-4 bg-blue-50/60 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/20">
                  <p className="text-[11px] font-bold tracking-widest text-blue-600 uppercase mb-2">Instructions</p>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {assignment.instructions}
                  </pre>
                </div>

                {/* Attachments */}
                {assignment.attachments.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                        Attachments ({assignment.attachments.length})
                      </p>
                      <a href="#" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                        bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400
                        border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 transition-all">
                        <Archive className="w-3 h-3" /> Download All (.zip)
                      </a>
                    </div>
                    <div className="flex flex-col gap-2">
                      {assignment.attachments.map(f => <FileChip key={f.id} file={f} />)}
                    </div>
                  </div>
                )}

                {/* Submission + grade */}
                {submission && (
                  <div className="rounded-2xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.06]">
                      <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Your Submission</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex flex-col gap-2">
                        {submission.files.map(f => <FileChip key={f.id} file={f} />)}
                      </div>
                      <p className="text-xs text-gray-400">
                        Submitted {new Date(submission.submittedAt).toLocaleString()}
                        {submission.isLate && <span className="ml-2 text-orange-500 font-bold">(Late)</span>}
                      </p>
                      {submission.feedback && (
                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/20">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Feedback</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  {(!submission && !submitted) && (status !== "graded") && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setSubmitModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                        bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all">
                      <Upload className="w-4 h-4" /> Submit Assignment
                    </motion.button>
                  )}
                  {(submission || submitted) && status !== "graded" && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setSubmitModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                        border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400
                        hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                      <Upload className="w-4 h-4" /> Resubmit
                    </motion.button>
                  )}
                  {assignment.attachments.length > 0 && (
                    <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                      border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
                      hover:border-blue-300 hover:text-blue-600 transition-all">
                      <Download className="w-4 h-4" /> Download Brief
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <AnimatePresence>
        {submitModal && (
          <SubmitModal assignment={assignment} onClose={() => setSubmitModal(false)} onSubmit={() => setSubmitted(true)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentAssignment() {
  const [filter, setFilter] = useState<"all" | AssignmentStatus>("all");

  const counts = MOCK_ASSIGNMENTS.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1; return acc;
  }, {} as Record<string, number>);

  const filtered = filter === "all" ? MOCK_ASSIGNMENTS : MOCK_ASSIGNMENTS.filter(a => a.status === filter);

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">
      <Fade>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            My <span className="text-blue-600 dark:text-blue-400">Assignments</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">All assignments from your enrolled courses</p>
        </div>
      </Fade>

      {/* Summary chips */}
      <Fade delay={0.06}>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all",       label: "All",       count: MOCK_ASSIGNMENTS.length },
            { key: "pending",   label: "Pending",   count: counts.pending ?? 0    },
            { key: "submitted", label: "Submitted", count: counts.submitted ?? 0  },
            { key: "graded",    label: "Graded",    count: counts.graded ?? 0     },
            { key: "missing",   label: "Missing",   count: counts.missing ?? 0    },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key as typeof filter)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                filter === key
                  ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                  : "bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600"
              )}>
              {label}
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                filter === key ? "bg-white/25 text-white" : "bg-gray-200 dark:bg-white/[0.08] text-gray-500")}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </Fade>

      <div className="flex flex-col gap-4">
        {filtered.map((a, i) => (
          <Fade key={a.id} delay={0.1 + i * 0.06}>
            <AssignmentCard assignment={a} />
          </Fade>
        ))}
        {filtered.length === 0 && (
          <Fade delay={0.1}>
            <Card className="p-16 text-center">
              <FileText className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No assignments in this category</p>
            </Card>
          </Fade>
        )}
      </div>
    </div>
  );
}