// src/dashboards/instructor-dashboard/pages/InstructorAssignment.tsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus, Search, Eye, FileText, Edit3, Trash2, Send, X,
  Upload, BookOpen, Calendar, Clock, CheckCircle2,
  AlertTriangle, Loader2, RefreshCw, Users,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AssignmentService, {
  type InstructorAssignmentItem,
  type InstructorAssignmentListResponse,
  type CreateAssignmentPayload,
} from "@/services/AssignmentService";
import CoursesService from "@/services/course.service";
import StorageService from "@/services/storage.service";
import { FILE_META, getFileType } from "@/data/academicData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Confirm delete dialog ────────────────────────────────────────────────────

function ConfirmDialog({
  title, message, onConfirm, onCancel, loading,
}: {
  title: string; message: string;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm rounded-[20px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07] shadow-xl z-10 p-6 space-y-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-black text-gray-900 dark:text-white text-base">{title}</p>
          <p className="text-sm text-gray-400 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Create / Edit modal ──────────────────────────────────────────────────────

interface CourseOption { id: string; title: string; }

function AssignmentModal({
  existing, courses, onClose, onSaved,
}: {
  existing?: InstructorAssignmentItem;
  courses: CourseOption[];
  onClose: () => void;
  onSaved: (item: InstructorAssignmentItem, isEdit: boolean) => void;
}) {
  const [title, setTitle]             = useState(existing?.title ?? "");
  const [courseId, setCourseId]       = useState(existing?.courseId ?? courses[0]?.id ?? "");
  const [desc, setDesc]               = useState(existing?.description ?? "");
  const [instructions, setInst]       = useState(existing?.instructions ?? "");
  const [dueDate, setDue]             = useState(existing?.dueDate?.slice(0, 16) ?? "");
  const [maxScore, setMax]            = useState(existing?.maxScore ?? 100);
  const [allowLate, setLate]          = useState(existing?.allowLate ?? true);
  const [attachments, setAtts]        = useState<File[]>([]);
  const [uploadProgress, setProgress] = useState(0);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const fileRef                       = useRef<HTMLInputElement>(null);

  const isEdit = !!existing;

  const save = async () => {
    if (!title.trim() || !dueDate || !courseId) return;
    setSaving(true);
    setError(null);
    try {
      const attachmentKeys: string[] = [];
      const n = attachments.length;
      for (let i = 0; i < n; i++) {
        const slice = 85 / n;
        const base  = Math.round(i * slice);
        setProgress(base + Math.round(slice * 0.2));
        const { uploadUrl, key } = await StorageService.getPresignedUpload("assignments", attachments[i]);
        setProgress(base + Math.round(slice * 0.6));
        await StorageService.uploadFile(uploadUrl, attachments[i]);
        attachmentKeys.push(key);
        setProgress(Math.round((i + 1) * slice));
      }
      setProgress(n > 0 ? 90 : 40);

      const payload: CreateAssignmentPayload = {
        title: title.trim(),
        description: desc.trim() || undefined,
        instructions: instructions.trim() || undefined,
        courseId,
        dueDate: new Date(dueDate).toISOString(),
        maxScore,
        allowLate,
        attachmentKeys: attachmentKeys.length ? attachmentKeys : undefined,
      };

      const saved = isEdit
        ? await AssignmentService.updateAssignment(existing!.id, payload)
        : await AssignmentService.createAssignment(payload);

      setProgress(100);
      onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save assignment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={!saving ? onClose : undefined}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[24px]
          bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4
          bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur border-b border-gray-100 dark:border-white/[0.06] z-10">
          <h2 className="text-base font-black text-gray-900 dark:text-white">
            {isEdit ? "Edit Assignment" : "Create Assignment"}
          </h2>
          <button
            onClick={!saving ? onClose : undefined}
            disabled={saving}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center disabled:opacity-40"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Assignment title…"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                text-gray-800 dark:text-white outline-none transition-all"
            />
          </div>

          {/* Course + Due date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Course *</label>
              <select
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04]
                  border border-gray-200 dark:border-white/[0.08] focus:border-blue-400
                  text-gray-800 dark:text-white outline-none cursor-pointer transition-all"
              >
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                {courses.length === 0 && <option value="">No courses assigned</option>}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Due Date *</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={e => setDue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04]
                  border border-gray-200 dark:border-white/[0.08] focus:border-blue-400
                  text-gray-800 dark:text-white outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={2}
              placeholder="Brief overview of the assignment…"
              className="w-full px-4 py-2.5 rounded-xl text-sm resize-none bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Instructions</label>
            <textarea
              value={instructions}
              onChange={e => setInst(e.target.value)}
              rows={5}
              placeholder={"1. First step\n2. Second step\n3. Submit via the portal"}
              className="w-full px-4 py-2.5 rounded-xl text-sm resize-none bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
                text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all font-mono"
            />
          </div>

          {/* Max score + Allow late */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Max Score</label>
              <input
                type="number"
                value={maxScore}
                onChange={e => setMax(+e.target.value)}
                min={1}
                max={500}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04]
                  border border-gray-200 dark:border-white/[0.08] focus:border-blue-400
                  text-gray-800 dark:text-white outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <button
                onClick={() => setLate(p => !p)}
                className={cn("relative w-11 h-6 rounded-full transition-all", allowLate ? "bg-blue-600" : "bg-gray-200 dark:bg-white/[0.1]")}
              >
                <motion.div
                  animate={{ x: allowLate ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Allow late submissions</span>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">
              Attachments <span className="font-normal text-gray-400">(brief, rubric, starter files…)</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-white/[0.08] rounded-2xl p-5
                text-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Click to browse files</p>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={e => e.target.files && setAtts(p => [...p, ...Array.from(e.target.files!)])}
              />
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

          {/* Upload progress */}
          {saving && attachments.length > 0 && uploadProgress < 100 && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Uploading files…</span>
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

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
            <button
              onClick={!saving ? onClose : undefined}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <motion.button
              whileHover={!saving && title && dueDate && courseId ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.97 }}
              onClick={save}
              disabled={saving || !title.trim() || !dueDate || !courseId}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2",
                saving || !title.trim() || !dueDate || !courseId
                  ? "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]",
              )}
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" />{attachments.length ? "Uploading…" : "Saving…"}</>
                : <><Send className="w-4 h-4" />{isEdit ? "Update" : "Create Assignment"}</>
              }
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Assignment row ───────────────────────────────────────────────────────────

function AssignmentRow({
  assignment,
  onEdit,
  onDelete,
}: {
  assignment: InstructorAssignmentItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const daysLeft  = Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / 86400000);
  const isOverdue = daysLeft < 0;
  // Normalise submission count — handle all possible shapes the API might return
  const total  = assignment.submissionStats?.total ?? assignment._count?.submissions ?? 0;
  const graded = assignment.submissionStats?.graded ?? 0;

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{assignment.title}</p>
            <p className="text-xs text-gray-400 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{assignment.courseName}</span>
              <span className={cn(
                "flex items-center gap-1 font-semibold",
                isOverdue ? "text-red-500" : daysLeft <= 2 ? "text-amber-500" : "text-gray-400",
              )}>
                <Calendar className="w-3 h-3" />
                {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `Due in ${daysLeft}d`}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />{total} submission{total !== 1 ? "s" : ""}
              </span>
              {graded > 0 && (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />{graded} graded
                </span>
              )}
            </p>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <Link
              to={`/instructor/assignments/${assignment.id}/submissions`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400
                hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
            >
              <Eye className="w-3.5 h-3.5" /> Submissions
            </Link>
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.06] md:hidden">
          <Link
            to={`/instructor/assignments/${assignment.id}/submissions`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
              border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400
              hover:bg-blue-50 transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> Submissions
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Submission progress bar */}
      {total > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span>Grading progress</span>
            <span>{graded}/{total} graded</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${total ? (graded / total) * 100 : 0}%` }}
              transition={{ duration: 0.7 }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            />
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.05]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
          <div className="h-3 w-2/3 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function InstructorAssignment() {
  const qc = useQueryClient();
  const [search, setSearch]             = useState("");
  const [modal, setModal]               = useState<{ mode: "create" } | { mode: "edit"; item: InstructorAssignmentItem } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstructorAssignmentItem | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // isFetching stays true during background refetches; isLoading is only true on first load
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["instructor-assignments"],
    queryFn: async () => {
      try {
        return await AssignmentService.getInstructorAssignments({ limit: 100 });
      } catch {
        return { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 1 } };
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 3,
    // Re-fetch counts automatically when the user switches back to this tab
    refetchOnWindowFocus: true,
  });

  // Fetch instructor's courses for the modal dropdown
  const { data: courseData } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => CoursesService.findAll() as Promise<{ items: { id: string; title: string }[] }>,
    staleTime: 1000 * 60 * 10,
  });

  const assignments = data?.data ?? [];
  const courses     = courseData?.items ?? [];

  const filtered = assignments.filter(a =>
    !search.trim() ||
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.courseName.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = {
    total:       assignments.length,
    // Use the same normalised count as AssignmentRow
    submissions: assignments.reduce((s, a) => s + (a.submissionStats?.total ?? a._count?.submissions ?? 0), 0),
    pending:     assignments.reduce((s, a) => s + (a.submissionStats?.pending ?? 0), 0),
    courses:     new Set(assignments.map(a => a.courseId)).size,
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await AssignmentService.deleteAssignment(deleteTarget.id);
      const id = deleteTarget.id;
      qc.setQueryData<InstructorAssignmentListResponse>(["instructor-assignments"], old =>
        old
          ? { ...old, data: old.data.filter(a => a.id !== id), meta: { ...old.meta, total: old.meta.total - 1 } }
          : old,
      );
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const onSaved = (item: InstructorAssignmentItem, isEdit: boolean) => {
    qc.setQueryData<InstructorAssignmentListResponse>(["instructor-assignments"], old => {
      if (!old) return old;
      const newData = isEdit
        ? old.data.map(a => a.id === item.id ? item : a)
        : [item, ...old.data];
      return { ...old, data: newData, meta: { ...old.meta, total: isEdit ? old.meta.total : old.meta.total + 1 } };
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto space-y-6 pb-10">
        <div className="h-10 w-64 rounded-xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
        <div className="flex flex-col gap-4">{[1, 2, 3].map(i => <Skeleton key={i} />)}</div>
        <div className="flex justify-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <Fade>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Assignments <span className="text-blue-600 dark:text-blue-400">Management</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">Create, manage and grade student submissions</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Reload — isFetching covers both initial load and background refetches */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400
                hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-40"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModal({ mode: "create" })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all"
            >
              <Plus className="w-4 h-4" /> New Assignment
            </motion.button>
          </div>
        </div>
      </Fade>

      {/* Stats */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Assignments",  value: stats.total,       color: "text-blue-600 dark:text-blue-400",       icon: FileText  },
            { label: "Submissions",  value: stats.submissions,  color: "text-indigo-600 dark:text-indigo-400",   icon: Users     },
            { label: "Pending Mark", value: stats.pending,      color: "text-amber-600 dark:text-amber-400",     icon: Clock     },
            { label: "Courses",      value: stats.courses,      color: "text-emerald-600 dark:text-emerald-400", icon: BookOpen  },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className={`text-xl font-black ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Search */}
      <Fade delay={0.1}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assignments…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
              bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08]
              text-gray-800 dark:text-white placeholder:text-gray-400
              focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
          />
        </div>
      </Fade>

      {/* List */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <Fade delay={0.1}>
            <Card className="p-16 text-center">
              <FileText className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">
                {assignments.length === 0 ? "No assignments yet" : "No results for your search"}
              </p>
              {assignments.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">Click "New Assignment" to create one.</p>
              )}
            </Card>
          </Fade>
        ) : (
          filtered.map((a, i) => (
            <Fade key={a.id} delay={0.12 + i * 0.05}>
              <AssignmentRow
                assignment={a}
                onEdit={() => setModal({ mode: "edit", item: a })}
                onDelete={() => setDeleteTarget(a)}
              />
            </Fade>
          ))
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <AssignmentModal
            key="assignment-modal"
            existing={modal.mode === "edit" ? modal.item : undefined}
            courses={courses}
            onClose={() => setModal(null)}
            onSaved={onSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            key="confirm-delete"
            title="Delete Assignment"
            message={`"${deleteTarget.title}" and all its submissions will be permanently deleted.`}
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default InstructorAssignment;