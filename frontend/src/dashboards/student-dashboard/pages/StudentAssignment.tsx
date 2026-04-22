// src/pages/student/StudentAssignment.tsx
// Wired to real API via AssignmentService + StorageService.
// Replaces all MOCK_* data.

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Upload, FileText, Clock, CheckCircle2,
  AlertTriangle, XCircle, X, ChevronDown, BookOpen,
  Send, RefreshCw, Loader2, Eye, ExternalLink,
} from "lucide-react";
import { FilePreviewModal, type PreviewFile } from "@/components/FilePreviewModal";
import AssignmentService, {
  type StudentAssignmentItem,
  type MySubmission,
  type AssignmentStatus,
  // type LetterGrade,
} from "@/services/AssignmentService";
import StorageService from "@/services/storage.service";
import { GRADE_META, FILE_META, getFileType } from "@/data/academicData";

// ─── Utilities ────────────────────────────────────────────────────────────────

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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_MAP: Record<AssignmentStatus, {
  label: string; color: string; bg: string; border: string; icon: React.ElementType;
}> = {
  pending:   { label: "Pending",   color: "text-amber-700 dark:text-amber-300",    bg: "bg-amber-50 dark:bg-amber-950/30",    border: "border-amber-200 dark:border-amber-800/40",    icon: Clock        },
  submitted: { label: "Submitted", color: "text-blue-700 dark:text-blue-300",      bg: "bg-blue-50 dark:bg-blue-950/30",      border: "border-blue-200 dark:border-blue-800/40",      icon: CheckCircle2 },
  late:      { label: "Late",      color: "text-orange-700 dark:text-orange-300",  bg: "bg-orange-50 dark:bg-orange-950/30",  border: "border-orange-200 dark:border-orange-800/40",  icon: AlertTriangle },
  graded:    { label: "Graded",    color: "text-emerald-700 dark:text-emerald-300",bg: "bg-emerald-50 dark:bg-emerald-950/30",border: "border-emerald-200 dark:border-emerald-800/40",icon: CheckCircle2 },
  returned:  { label: "Returned",  color: "text-purple-700 dark:text-purple-300",  bg: "bg-purple-50 dark:bg-purple-950/30",  border: "border-purple-200 dark:border-purple-800/40",  icon: FileText     },
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

function FileChip({
  file,
  onRemove,
  onPreview,
}: {
  file: { name: string; size?: string; url?: string } | File;
  onRemove?: () => void;
  onPreview?: () => void;
}) {
  const isRaw  = file instanceof File;
  const name   = file.name ?? "Unknown file";
  const size   = isRaw
    ? `${((file as File).size / 1024 / 1024).toFixed(1)} MB`
    : (file as { size?: string }).size ?? "";
  const url    = isRaw ? undefined : (file as { url?: string }).url;
  const meta   = FILE_META[getFileType(name)];

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${meta.bg} border border-gray-100 dark:border-white/[0.06] group`}>
      <span
        className={cn("text-base leading-none", onPreview && "cursor-pointer")}
        onClick={onPreview}
      >
        {meta.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{name}</p>
        {size && <p className={`text-[10px] ${meta.color}`}>{size}</p>}
      </div>
      {onRemove && (
        <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {!onRemove && url && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {onPreview && (
            <button onClick={onPreview}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
              title="Preview">
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
            title="Open in new tab">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href={url} download={name}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
            title="Download">
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Submit modal ──────────────────────────────────────────────────────────────

function SubmitModal({
  assignment,
  onClose,
  onSubmitted,
}: {
  assignment: StudentAssignmentItem;
  onClose: () => void;
  onSubmitted: (submission: MySubmission) => void;
}) {
  const [files, setFiles]     = useState<File[]>([]);
  const [note, setNote]       = useState("");
  const [status, setStatus]   = useState<"idle" | "uploading" | "submitting" | "done">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError]     = useState<string | null>(null);
  const fileRef               = useRef<HTMLInputElement>(null);

  const isLate    = new Date() > new Date(assignment.dueDate);
  const isBusy    = status === "uploading" || status === "submitting";

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const submit = async () => {
    if (!files.length || isBusy) return;
    setError(null);

    try {
      // 1. Upload each file to R2, collect object keys (not public URLs)
      setStatus("uploading");
      const fileKeys: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const key = await StorageService.uploadGetKey("assignments", files[i]);
        fileKeys.push(key);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // 2. Submit to API
      setStatus("submitting");
      const submission = await AssignmentService.submit(assignment.id, {
        fileKeys,
        note: note.trim() || undefined,
      });

      setStatus("done");
      onSubmitted(submission);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      setStatus("idle");
    }
  };

  const statusLabel =
    status === "uploading"  ? `Uploading files… ${uploadProgress}%` :
    status === "submitting" ? "Submitting…" : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={!isBusy ? onClose : undefined}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">Submit Assignment</h2>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{assignment.title}</p>
          </div>
          <button
            onClick={!isBusy ? onClose : undefined}
            disabled={isBusy}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center disabled:opacity-40"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Late warning */}
          {isLate && assignment.allowLate && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30">
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                This submission is past the due date and will be marked as late.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !isBusy && fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center transition-all group",
              isBusy
                ? "border-gray-200 dark:border-white/[0.05] cursor-not-allowed opacity-60"
                : "border-gray-200 dark:border-white/[0.08] cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-950/10",
            )}
          >
            <Upload className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Drop files here or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Allowed: {(assignment.allowedFileTypes ?? []).join(", ") || "All file types"}
            </p>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              accept={(assignment.allowedFileTypes ?? []).join(",") || undefined}
              onChange={handleFiles}
              disabled={isBusy}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              {files.map((f, i) => (
                <FileChip
                  key={i}
                  file={f}
                  onRemove={!isBusy ? () => setFiles(prev => prev.filter((_, xi) => xi !== i)) : undefined}
                />
              ))}
            </div>
          )}

          {/* Upload progress bar */}
          {status === "uploading" && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Uploading files</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full rounded-full bg-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Submission note */}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Submission Note (optional)</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              disabled={isBusy}
              placeholder="Any notes for your instructor…"
              className="w-full px-4 py-2.5 rounded-xl text-sm resize-none
                bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08]
                focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                text-gray-800 dark:text-white placeholder:text-gray-400 outline-none
                transition-all disabled:opacity-60"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={!isBusy ? onClose : undefined}
              disabled={isBusy}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                border border-gray-200 dark:border-white/[0.08]
                text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <motion.button
              whileHover={!isBusy && files.length ? { scale: 1.02 } : {}}
              whileTap={!isBusy && files.length ? { scale: 0.97 } : {}}
              onClick={submit}
              disabled={isBusy || !files.length}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2",
                isBusy || !files.length
                  ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                  : isLate && assignment.allowLate
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]",
              )}
            >
              {isBusy ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{statusLabel}</>
              ) : (
                <><Send className="w-4 h-4" />{isLate ? "Submit Late" : "Submit"}</>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Assignment card ──────────────────────────────────────────────────────────

function AssignmentCard({ assignment: initial }: { assignment: StudentAssignmentItem }) {
  const [assignment, setAssignment] = useState(initial);
  const [open, setOpen]             = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [submission, setSubmission] = useState<MySubmission | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [preview, setPreview]       = useState<{ files: PreviewFile[]; index: number } | null>(null);

  const attFiles: PreviewFile[] = (assignment.attachments ?? []).map(f => ({
    name: f.name, url: f.url, size: f.size,
  }));
  const subFiles: PreviewFile[] = (submission?.files ?? []).map(f => ({
    name: f.name, url: f.url, size: f.size,
  }));

  const dueDate  = new Date(assignment.dueDate);
  const now      = new Date();
  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
  const isOverdue = daysLeft < 0;

  const gradeMeta = assignment.grade ? GRADE_META[assignment.grade] : null;

  // Lazy-load submission detail when the card expands
  useEffect(() => {
    if (!open || submission !== null || loadingSub) return;
    if (!["submitted", "graded", "late", "returned"].includes(assignment.status)) return;

    setLoadingSub(true);
    AssignmentService.getMySubmission(assignment.id)
      .then(sub => setSubmission(sub))
      .catch(console.error)
      .finally(() => setLoadingSub(false));
  }, [open, assignment.id, assignment.status, submission, loadingSub]);

  const handleSubmitted = (sub: MySubmission) => {
    setSubmission(sub);
    setAssignment(prev => ({
      ...prev,
      status:      sub.status,
      submittedAt: sub.submittedAt,
      isLate:      sub.isLate,
    }));
  };

  const canSubmit   = !["graded", "returned"].includes(assignment.status);
  const hasSubmitted = ["submitted", "graded", "late", "returned"].includes(assignment.status);

  return (
    <>
      <Card>
        <button
          className="w-full flex items-center gap-4 px-6 py-4 text-left"
          onClick={() => setOpen(p => !p)}
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{assignment.title}</p>
              <StatusBadge status={assignment.status} />
              {assignment.grade && gradeMeta && (
                <span className={`text-sm font-black px-2.5 py-0.5 rounded-xl border ${gradeMeta.color} ${gradeMeta.bg} ${gradeMeta.border}`}>
                  {assignment.grade}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{assignment.courseName}</span>
              <span className={`flex items-center gap-1 font-semibold ${isOverdue ? "text-red-500" : daysLeft <= 2 ? "text-amber-500" : "text-gray-400"}`}>
                <Clock className="w-3 h-3" />
                {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today!" : `${daysLeft}d left`}
              </span>
              <span>by {assignment.creatorName}</span>
            </p>
          </div>

          {assignment.score != null && (
            <div className="text-right flex-shrink-0 mr-3">
              <p className="text-lg font-black text-gray-900 dark:text-white">{assignment.score}/{assignment.maxScore}</p>
              <p className="text-[10px] text-gray-400">Score</p>
            </div>
          )}

          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
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

                {/* Attachments from instructor/admin */}
                {attFiles.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                      Files from {assignment.createdBy === "admin" ? "Admin" : "Instructor"} ({attFiles.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {(assignment.attachments ?? []).map((f, i) => (
                        <FileChip key={f.id} file={f}
                          onPreview={() => setPreview({ files: attFiles, index: i })} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission detail (lazy loaded) */}
                {loadingSub && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading submission…
                  </div>
                )}

                {submission && !loadingSub && (
                  <div className="rounded-2xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.06]">
                      <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Your Submission</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex flex-col gap-2">
                        {(submission.files ?? []).map((f, i) => (
                          <FileChip key={f.id} file={f}
                            onPreview={() => setPreview({ files: subFiles, index: i })} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                        Submitted {new Date(submission.submittedAt).toLocaleString()}
                        {submission.isLate && (
                          <span className="ml-2 text-orange-500 font-bold">(Late)</span>
                        )}
                      </p>
                      {submission.note && (
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Your Note</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{submission.note}</p>
                        </div>
                      )}
                      {submission.feedback && (
                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/20">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Instructor Feedback</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{submission.feedback}</p>
                        </div>
                      )}
                      {submission.rubric && submission.rubric.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Rubric Breakdown</p>
                          <div className="flex flex-col gap-2">
                            {(submission.rubric ?? []).map(r => (
                              <div key={r.id}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{r.label}</span>
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{r.score}/{r.maxScore}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                                  <div
                                    style={{ width: `${(r.score / r.maxScore) * 100}%` }}
                                    className="h-full rounded-full bg-blue-500"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  {canSubmit && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSubmitModal(true)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                        hasSubmitted
                          ? "border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]",
                      )}
                    >
                      <Upload className="w-4 h-4" />
                      {hasSubmitted ? "Resubmit" : "Submit Assignment"}
                    </motion.button>
                  )}
                  {(assignment.attachments ?? []).length > 0 && (
                    <a
                      href={(assignment.attachments ?? [])[0]?.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                        border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
                        hover:border-blue-300 hover:text-blue-600 transition-all"
                    >
                      <Download className="w-4 h-4" /> Download Files
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
          <SubmitModal
            key="submit-modal"
            assignment={assignment}
            onClose={() => setSubmitModal(false)}
            onSubmitted={handleSubmitted}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {preview && (
          <FilePreviewModal
            key="file-preview"
            files={preview.files}
            initialIndex={preview.index}
            onClose={() => setPreview(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function AssignmentSkeleton() {
  return (
    <div className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
          <div className="h-3 w-1/2 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { key: AssignmentStatus | "all"; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "pending",   label: "Pending"   },
  { key: "submitted", label: "Submitted" },
  { key: "graded",    label: "Graded"    },
];

export default function StudentAssignment() {
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [filter, setFilter]           = useState<AssignmentStatus | "all">("all");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [sortType, setSortType]       = useState<"soon" | "recent" | "old" | "default">("recent");

  const fetchAssignments = useCallback(async (currentFilter: typeof filter, currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssignmentService.getMyAssignments({
        status: currentFilter === "all" ? undefined : currentFilter,
        page:   currentPage,
        limit:  20,
      });
      setAssignments(result.data);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments(filter, page);
  }, [filter, page, fetchAssignments]);

  const handleFilterChange = (f: typeof filter) => {
    setFilter(f);
    setPage(1);
  };

  // Count per status from current loaded data (approximate; use totals from API if available)
  const counts = assignments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              My <span className="text-blue-600 dark:text-blue-400">Assignments</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">All assignments from your enrolled courses</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortType}
              onChange={e => setSortType(e.target.value as "soon" | "recent" | "old" | "default")}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1623] text-gray-600 dark:text-gray-300"
            >
              <option value="soon">Soon-to-be-due</option>
              <option value="recent">Recent</option>
              <option value="old">Old</option>
              <option value="default">Default</option>
            </select>
            <button
              onClick={() => fetchAssignments(filter, page)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                border border-gray-200 dark:border-white/[0.08]
                text-gray-500 dark:text-gray-400
                hover:border-blue-300 hover:text-blue-600 transition-all
                disabled:opacity-40"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </Fade>

      {/* Filter chips */}
      <Fade delay={0.06}>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                filter === key
                  ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                  : "bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600",
              )}
            >
              {label}
              {key !== "all" && counts[key] !== undefined && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  filter === key ? "bg-white/25 text-white" : "bg-gray-200 dark:bg-white/[0.08] text-gray-500",
                )}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </Fade>

      {/* Error state */}
      {error && !loading && (
        <Fade delay={0.1}>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
            <div className="flex items-center gap-2.5">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
            <button
              onClick={() => fetchAssignments(filter, page)}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Retry
            </button>
          </div>
        </Fade>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => <AssignmentSkeleton key={i} />)}
        </div>
      )}

      {/* Assignment list */}
      {!loading && !error && (
        <>
          <div className="flex flex-col gap-4">
            {assignments.length === 0 ? (
              <Fade delay={0.1}>
                <Card className="p-16 text-center">
                  <FileText className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No assignments in this category</p>
                </Card>
              </Fade>
            ) : (
              (() => {
                let sortedAssignments = [...assignments];
                if (sortType === "soon") {
                  sortedAssignments = sortedAssignments
                    .filter(a => new Date(a.dueDate) > new Date())
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                } else if (sortType === "recent") {
                  sortedAssignments = sortedAssignments
                    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
                } else if (sortType === "old") {
                  sortedAssignments = sortedAssignments
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                }
                return sortedAssignments.map((a, i) => (
                  <Fade key={a.id} delay={0.1 + i * 0.06}>
                    <AssignmentCard assignment={a} />
                  </Fade>
                ));
              })()
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Fade delay={0.2}>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold
                    border border-gray-200 dark:border-white/[0.08]
                    text-gray-600 dark:text-gray-400
                    hover:border-blue-300 hover:text-blue-600 transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400 font-medium">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold
                    border border-gray-200 dark:border-white/[0.08]
                    text-gray-600 dark:text-gray-400
                    hover:border-blue-300 hover:text-blue-600 transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </Fade>
          )}
        </>
      )}
    </div>
  );
}