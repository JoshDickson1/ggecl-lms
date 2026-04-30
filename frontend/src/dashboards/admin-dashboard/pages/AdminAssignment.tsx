// src/pages/admin/AdminAssignment.tsx
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus, Search, FileText, Edit3, Trash2,
  BookOpen, Users, CheckCircle2, Clock, Loader2,
  AlertTriangle, Eye, X, Save, Upload,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AssignmentService, { type UpdateAssignmentDto } from "@/services/assignment.service";
import CoursesService from "@/services/course.service";
import StorageService from "@/services/storage.service";
import { FILE_META, getFileType } from "@/data/academicData";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay, ease: "easeOut" }}>{children}</motion.div>;
}

// Per-row submission count — reads from the submissions array already included in the list response
function SubmissionCount({ count }: { count: number }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-black text-gray-800 dark:text-white">{count}</span>
      <span className="text-[10px] text-gray-400">submission{count !== 1 ? "s" : ""}</span>
    </div>
  );
}

// Delete confirmation modal
function DeleteModal({
  title, onConfirm, onCancel, isDeleting,
}: {
  title: string; onConfirm: () => void; onCancel: () => void; isDeleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.22)] p-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-black text-gray-900 dark:text-white text-center mb-1">Delete Assignment?</h2>
        <p className="text-sm text-gray-400 text-center mb-1">
          <span className="font-semibold text-gray-700 dark:text-gray-200">"{title}"</span>
        </p>
        <p className="text-xs text-gray-400 text-center mb-6">
          This will permanently delete the assignment and all its submissions and grades.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {isDeleting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</> : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Edit modal
interface EditTarget {
  id: string;
  title: string;
  description: string;
  instructions: string;
  maxScore: number;
  dueDate: string;
  allowLate: boolean;
  attachments: string[]; // existing CDN URLs
}

function EditModal({
  target, onSave, onCancel, isSaving,
}: {
  target: EditTarget;
  onSave: (id: string, data: UpdateAssignmentDto) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  // Convert ISO → datetime-local string (YYYY-MM-DDTHH:mm)
  const toLocalDT = (iso: string) => {
    if (!iso) return "";
    try { return new Date(iso).toISOString().slice(0, 16); } catch { return ""; }
  };

  const [title,        setTitle]        = useState(target.title);
  const [description,  setDescription]  = useState(target.description);
  const [instructions, setInstructions] = useState(target.instructions);
  const [maxScore,     setMaxScore]     = useState(target.maxScore);
  const [dueDate,      setDueDate]      = useState(toLocalDT(target.dueDate));
  const [allowLate,    setAllowLate]    = useState(target.allowLate);

  // Existing attachments (URLs) — user can remove them
  const [existingAttachments, setExistingAttachments] = useState<string[]>(target.attachments ?? []);
  // New files to upload
  const [newFiles,    setNewFiles]    = useState<File[]>([]);
  const [uploading,   setUploading]   = useState(false);
  const [uploadProg,  setUploadProg]  = useState<{ done: number; total: number } | null>(null);
  const [saveError,   setSaveError]   = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    setNewFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const handleSave = async () => {
    setSaveError(null);
    let uploadedUrls: string[] = [];

    if (newFiles.length > 0) {
      setUploading(true);
      setUploadProg({ done: 0, total: newFiles.length });
      try {
        for (let i = 0; i < newFiles.length; i++) {
          const url = await StorageService.upload("assignments", newFiles[i]);
          uploadedUrls.push(url);
          setUploadProg({ done: i + 1, total: newFiles.length });
        }
      } catch {
        setSaveError("File upload failed. Please try again.");
        setUploading(false);
        setUploadProg(null);
        return;
      }
      setUploading(false);
      setUploadProg(null);
    }

    const payload: UpdateAssignmentDto = {
      title:        title.trim(),
      description:  description.trim(),
      instructions: instructions.trim(),
      maxScore,
      dueDate:      dueDate ? new Date(dueDate).toISOString() : undefined,
      allowLate,
      attachments:  [...existingAttachments, ...uploadedUrls],
    };

    onSave(target.id, payload);
  };

  const inputCls =
    "w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all";
  const labelCls = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1";

  const busy = isSaving || uploading;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && !busy && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.22)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">Edit Assignment</h2>
          </div>
          <button onClick={onCancel} disabled={busy}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {/* Error banner */}
          {saveError && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {saveError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className={labelCls}>Title <span className="text-blue-500">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Assignment title" className={inputCls} />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="Brief description…" className={`${inputCls} resize-none`} />
          </div>

          {/* Instructions */}
          <div>
            <label className={labelCls}>Instructions</label>
            <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
              rows={4} placeholder="Step-by-step instructions for students…"
              className={`${inputCls} resize-none font-mono text-xs`} />
          </div>

          {/* Max score + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Max Score</label>
              <input type="number" min={1} value={maxScore}
                onChange={e => setMaxScore(Math.max(1, Number(e.target.value)))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Due Date & Time</label>
              <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className={inputCls} />
            </div>
          </div>

          {/* Allow late toggle */}
          <button type="button" onClick={() => setAllowLate(v => !v)}
            className="flex items-center gap-3 cursor-pointer select-none w-full text-left">
            <div className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${allowLate ? "bg-blue-600" : "bg-gray-200 dark:bg-white/[0.1]"}`}>
              <motion.div animate={{ x: allowLate ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Allow late submissions</span>
          </button>

          {/* ── Attachments ── */}
          <div>
            <label className={labelCls}>Attachments</label>

            {/* Existing URLs */}
            {existingAttachments.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {existingAttachments.map((url, i) => {
                  const name = url.split("/").pop() ?? url;
                  const type = getFileType(name);
                  const meta = FILE_META[type];
                  return (
                    <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${meta.bg} border border-gray-100 dark:border-white/[0.06] group`}>
                      <span className="text-base leading-none flex-shrink-0">{meta.icon}</span>
                      <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate min-w-0">{name}</span>
                      <button type="button"
                        onClick={() => setExistingAttachments(prev => prev.filter((_, j) => j !== i))}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        title="Remove">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* New files queued */}
            {newFiles.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {newFiles.map((file, i) => {
                  const type = getFileType(file.name);
                  const meta = FILE_META[type];
                  return (
                    <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${meta.bg} border border-blue-100 dark:border-blue-900/30 group`}>
                      <span className="text-base leading-none flex-shrink-0">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{file.name}</p>
                        <p className={`text-[10px] ${meta.color}`}>{(file.size / 1024 / 1024).toFixed(2)} MB · new</p>
                      </div>
                      <button type="button"
                        onClick={() => setNewFiles(prev => prev.filter((_, j) => j !== i))}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        title="Remove">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl px-4 py-5 text-center cursor-pointer transition-all duration-200 ${
                dragging
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-gray-200 dark:border-white/[0.08] hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/20 dark:hover:bg-blue-950/10"
              }`}>
              <Upload className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${dragging ? "text-blue-500" : "text-gray-300 dark:text-gray-600"}`} />
              <p className={`text-xs font-semibold transition-colors ${dragging ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
                {dragging ? "Drop to attach" : "Drag & drop or click to add files"}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">PDF, images, ZIP, MP4 — max 50 MB each</p>
              <input ref={fileRef} type="file" multiple accept=".pdf,.zip,image/*,video/mp4"
                className="hidden" onChange={e => e.target.files && setNewFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
            </div>

            {/* Upload progress */}
            {uploading && uploadProg && (
              <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                Uploading {uploadProg.done} / {uploadProg.total}…
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] flex-shrink-0">
          <button onClick={onCancel} disabled={busy}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all disabled:opacity-40">
            Cancel
          </button>
          <button onClick={handleSave} disabled={busy || !title.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {busy
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{uploading ? "Uploading…" : "Saving…"}</>
              : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminAssignment() {
  const [search, setSearch]           = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [editTarget, setEditTarget]     = useState<EditTarget | null>(null);
  const qc = useQueryClient();

  // Courses list for name lookup + filter dropdown
  const { data: coursesData } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const res = await CoursesService.findAll({ limit: 200 });
      return res.items || [];
    },
    staleTime: 1000 * 60 * 10,
  });
  const courses: any[] = coursesData || [];
  const courseMap = new Map(courses.map((c: any) => [c.id, c.title as string]));

  // Assignments
  const { data: assignmentsData, isLoading, error } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const res = await AssignmentService.list({ limit: 100 });
      return res.data || [];
    },
  });


  console.log('assignments data', assignmentsData)
  // Admin overview stats
  const { data: adminStats } = useQuery({
    queryKey: ["admin-assignment-stats"],
    queryFn: () => AssignmentService.getAdminOverview(),
  });

  const { mutate: deleteAssignment, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => AssignmentService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["admin-assignment-stats"] });
      setDeleteTarget(null);
    },
  });

  const { mutate: updateAssignment, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentDto }) =>
      AssignmentService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      setEditTarget(null);
    },
    onError: (err: unknown) => {
      // The EditModal handles its own upload errors; this catches PATCH failures.
      // We re-open the modal with an error by keeping editTarget set — the modal
      // reads isSaving=false and the user sees the save button re-enabled.
      console.error("Failed to update assignment:", err);
    },
  });

  const assignments: any[] = assignmentsData || [];

  // Unique courses that appear in assignments (for filter dropdown)
  const assignmentCourseIds = Array.from(new Set(assignments.map((a: any) => a.courseId).filter(Boolean)));

  const filtered = assignments.filter((a: any) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      a.title.toLowerCase().includes(q) ||
      (courseMap.get(a.courseId) ?? "").toLowerCase().includes(q);
    const matchCourse = courseFilter === "all" || a.courseId === courseFilter;
    return matchSearch && matchCourse;
  });

  const stats = adminStats;
  const totalAssignments  = stats?.totalAssignments  ?? assignments.length;
  const totalSubmissions  = stats?.totalSubmissions  ?? 0;
  const totalGraded       = stats?.totalGraded       ?? 0;
  const pendingSubs       = Math.max(0, totalSubmissions - totalGraded);

  if (error) {
    return (
      <div className="max-w-[1100px] mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-400 mb-4">Failed to load assignments</p>
          <button onClick={() => qc.invalidateQueries({ queryKey: ["assignments"] })}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <Fade>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Assignments <span className="text-blue-600 dark:text-blue-400">Admin</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">All assignments across all courses · Full admin control</p>
          </div>
          <Link to="/admin/assignments/create">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all cursor-pointer">
              <Plus className="w-4 h-4" /> New Assignment
            </motion.div>
          </Link>
        </div>
      </Fade>

      {/* Stats */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: FileText,     label: "Total",         value: totalAssignments, color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40"      },
            { icon: Users,        label: "Submissions",   value: totalSubmissions, color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/40"  },
            { icon: Clock,        label: "Needs Grading", value: pendingSubs,      color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"    },
            { icon: CheckCircle2, label: "Graded",        value: totalGraded,      color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label} className="p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] text-gray-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Filters */}
      <Fade delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments or course…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all" />
          </div>
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
            <option value="all">All Courses</option>
            {assignmentCourseIds.map(id => (
              <option key={id} value={id}>{courseMap.get(id) ?? id}</option>
            ))}
          </select>
        </div>
      </Fade>

      {/* Table */}
      <Fade delay={0.14}>
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
            <p className="text-sm font-black text-gray-900 dark:text-white">
              All Assignments <span className="text-gray-400 font-normal">({filtered.length})</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-sm text-gray-400">Loading assignments…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">
                  {search || courseFilter !== "all" ? "No assignments match your filters" : "No assignments yet"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                    {["Title", "Course", "Due", "Submissions", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a: any, i) => {
                    const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
                    const isPast   = daysLeft < 0;
                    const isSoon   = !isPast && daysLeft <= 3;
                    const courseName = courseMap.get(a.courseId) ?? a.courseId ?? "—";

                    return (
                      <motion.tr key={a.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">

                        {/* Title */}
                        <td className="px-4 py-3.5">
                          <Link to={`/admin/assignments/${a.id}`}
                            className="text-sm font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors max-w-[200px] truncate block">
                            {a.title}
                          </Link>
                        </td>

                        {/* Course name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 max-w-[160px]">
                            <BookOpen className="w-3 h-3 text-blue-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{courseName}</span>
                          </div>
                        </td>

                        {/* Due */}
                        <td className="px-4 py-3.5">
                          <span className={cn("text-xs font-semibold",
                            isPast ? "text-red-500" : isSoon ? "text-amber-500" : "text-gray-500")}>
                            {isPast ? `${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? "Today" : `in ${daysLeft}d`}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(a.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </p>
                        </td>

                        {/* Submission count */}
                        <td className="px-4 py-3.5">
                          <SubmissionCount count={Array.isArray(a.submissions) ? a.submissions.length : 0} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border",
                            isPast
                              ? "bg-gray-50 dark:bg-white/[0.03] text-gray-500 border-gray-200 dark:border-white/[0.08]"
                              : isSoon
                              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800/40"
                              : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800/40"
                          )}>
                            {isPast ? "Closed" : isSoon ? "Due Soon" : "Open"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Link to={`/admin/assignments/${a.id}`}
                              className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all"
                              title="Preview">
                              <Eye className="w-3 h-3" />
                            </Link>
                            <Link to={`/admin/assignments/${a.id}/submissions`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                              title="Submissions">
                              <Users className="w-3 h-3" /> Submissions
                            </Link>
                            <button
                              onClick={() => setEditTarget({
                                id:           a.id,
                                title:        a.title,
                                description:  a.description ?? "",
                                instructions: a.instructions ?? "",
                                maxScore:     a.maxScore ?? 100,
                                dueDate:      a.dueDate ?? "",
                                allowLate:    a.allowLate ?? false,
                                attachments:  a.attachments ?? [],
                              })}
                              className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all"
                              title="Edit">
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button onClick={() => setDeleteTarget({ id: a.id, title: a.title })}
                              className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all"
                              title="Delete">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </Fade>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            title={deleteTarget.title}
            isDeleting={isDeleting}
            onConfirm={() => deleteAssignment(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
        {editTarget && (
          <EditModal
            target={editTarget}
            isSaving={isUpdating}
            onSave={(id, data) => updateAssignment({ id, data })}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
