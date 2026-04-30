// src/pages/admin/AdminCreateAssignment.tsx
// Route: /admin/assignments/create

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Calendar, FileText, Upload,
  X, Loader2, CheckCircle2, Plus, Trash2, Info,
  Shield, AlertTriangle, Clock, Star, GraduationCap,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AssignmentService, { type CreateAssignmentDto } from "@/services/assignment.service";
import CoursesService from "@/services/course.service";
import StorageService from "@/services/storage.service";
import { FILE_META, getFileType } from "@/data/academicData";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1.5">
      {children}
      {required && <span className="text-blue-500">*</span>}
    </label>
  );
}

function FieldWrap({ children, error, hint }: {
  children: React.ReactNode; error?: string; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
      {hint && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", disabled, error }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; disabled?: boolean; error?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      placeholder={placeholder} disabled={disabled}
      className={cn(
        "w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none",
        "bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 border",
        error     ? "border-red-300 dark:border-red-700"
        : focused ? "border-blue-400 ring-2 ring-blue-500/15"
        :           "border-gray-200 dark:border-white/[0.08]",
        disabled  ? "opacity-60 cursor-not-allowed" : ""
      )}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, mono }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; mono?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value} rows={rows}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className={cn(
        "w-full px-4 py-2.5 rounded-xl text-sm resize-none transition-all duration-200 outline-none",
        "bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 border",
        focused ? "border-blue-400 ring-2 ring-blue-500/15" : "border-gray-200 dark:border-white/[0.08]",
        mono ? "font-mono" : ""
      )}
    />
  );
}

function SectionCard({ icon: Icon, title, description, children, delay = 0 }: {
  icon: React.ElementType; title: string; description?: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: "easeOut" }}
      className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden"
    >
      <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)] flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── Rubric ────────────────────────────────────────────────────────────────────
type RubricRow = { id: string; label: string; maxScore: number };

function RubricEditor({ rows, onChange }: { rows: RubricRow[]; onChange: (rows: RubricRow[]) => void }) {
  const add    = () => onChange([...rows, { id: `r-${Date.now()}`, label: "", maxScore: 20 }]);
  const remove = (id: string) => onChange(rows.filter(r => r.id !== id));
  const update = (id: string, key: keyof RubricRow, value: string | number) =>
    onChange(rows.map(r => r.id === id ? { ...r, [key]: value } : r));
  const total = rows.reduce((s, r) => s + r.maxScore, 0);

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={row.id} className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
          <input value={row.label} onChange={e => update(row.id, "label", e.target.value)}
            placeholder="Criterion name (e.g. Code Quality)"
            className="flex-1 px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all" />
          <div className="flex items-center gap-1 flex-shrink-0">
            <input type="number" value={row.maxScore} min={1} max={500}
              onChange={e => update(row.id, "maxScore", +e.target.value)}
              className="w-16 px-2 py-2 rounded-xl text-xs text-center font-bold bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 outline-none transition-all" />
            <span className="text-[10px] text-gray-400">pts</span>
          </div>
          <button onClick={() => remove(row.id)}
            className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <button onClick={add}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
          <Plus className="w-3 h-3" /> Add Criterion
        </button>
        {rows.length > 0 && (
          <span className="text-xs text-gray-400">
            Total: <span className="font-black text-gray-800 dark:text-white">{total} pts</span>
          </span>
        )}
      </div>
    </div>
  );
}

// ─── File type selector ────────────────────────────────────────────────────────
const FILE_TYPE_OPTIONS = [
  { label: "PDF",      value: ".pdf"    },
  { label: "ZIP",      value: ".zip"    },
  { label: "Images",   value: "image/*" },
  { label: "Videos",   value: "video/*" },
  { label: "Word",     value: ".docx"   },
  { label: "Any file", value: "*"       },
];

function FileTypeSelector({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {FILE_TYPE_OPTIONS.map(({ label, value }) => (
        <button key={value} onClick={() => toggle(value)}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
            selected.includes(value)
              ? "bg-blue-600 text-white border-blue-600 shadow-[0_3px_10px_rgba(59,130,246,0.3)]"
              : "border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600"
          )}>
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Course selector ───────────────────────────────────────────────────────────
interface CourseItem {
  id: string;
  title: string;
  status: string;
  level: string;
  instructorId: string;
  instructorName: string;
}

function CourseSelector({ selectedCourseId, onCourseChange, error }: {
  selectedCourseId: string;
  onCourseChange: (id: string, course: CourseItem | null) => void;
  error?: string;
}) {
  const { data: courses = [], isLoading } = useQuery<CourseItem[]>({
    queryKey: ["courses-list-published"],
    queryFn: async () => {
      const res = await CoursesService.findAll<CourseItem>({ limit: 200 });
      return res.items ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const selected = courses.find(c => c.id === selectedCourseId) ?? null;

  return (
    <div>
      <Label required>Course</Label>
      <FieldWrap error={error} hint="The backend resolves the instructor automatically from the course.">
        <div className={cn("rounded-xl border overflow-hidden transition-all",
          error ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-white/[0.08]")}>
          {isLoading ? (
            <div className="px-4 py-2.5 text-sm text-gray-400 flex items-center gap-2 bg-gray-50/80 dark:bg-white/[0.04]">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading courses…
            </div>
          ) : (
            <select value={selectedCourseId}
              onChange={e => {
                const course = courses.find(c => c.id === e.target.value) ?? null;
                onCourseChange(e.target.value, course);
              }}
              className="w-full px-4 py-2.5 text-sm bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white outline-none cursor-pointer">
              <option value="">Select a course…</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          )}
        </div>
      </FieldWrap>

      <AnimatePresence>
        {selected && (
          <motion.div key="course-preview"
            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.22 }}
            className="mt-3 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Course card */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{selected.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
                    {selected.status.toLowerCase()} · {selected.level.toLowerCase()}
                  </p>
                </div>
              </div>
              {/* Instructor card (resolved from course) */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{selected.instructorName}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Auto-resolved instructor</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Attachment upload zone ────────────────────────────────────────────────────
function AttachmentZone({ files, onAdd, onRemove }: {
  files: File[]; onAdd: (files: File[]) => void; onRemove: (index: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    onAdd(Array.from(e.dataTransfer.files));
  }, [onAdd]);

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
          dragging
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]"
            : "border-gray-200 dark:border-white/[0.08] hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-950/10"
        )}>
        <Upload className={cn("w-8 h-8 mx-auto mb-2 transition-colors", dragging ? "text-blue-500" : "text-gray-300 dark:text-gray-600")} />
        <p className={cn("text-sm font-semibold transition-colors", dragging ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400")}>
          {dragging ? "Drop to attach" : "Drag & drop files, or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, MP4, images, ZIP — max 50 MB each</p>
        <input ref={fileRef} type="file" multiple accept=".pdf,.zip,image/*,video/mp4"
          className="hidden" onChange={e => e.target.files && onAdd(Array.from(e.target.files))} />
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, i) => {
            const type = getFileType(file.name);
            const meta = FILE_META[type];
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${meta.bg} border border-gray-100 dark:border-white/[0.06] group`}>
                <span className="text-xl leading-none flex-shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
                  <p className={`text-[10px] ${meta.color}`}>{(file.size / 1024 / 1024).toFixed(2)} MB · {type}</p>
                </div>
                <button onClick={() => onRemove(i)}
                  className="w-7 h-7 rounded-xl bg-white/60 dark:bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Success overlay ───────────────────────────────────────────────────────────
function SuccessOverlay({ onDone }: { onDone: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
        className="rounded-[28px] p-12 text-center bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.2)] max-w-sm w-full mx-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.25 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_32px_rgba(16,185,129,0.4)]">
          <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Assignment Created!</h2>
        <p className="text-sm text-gray-400 mb-6">
          The assignment has been created. Enrolled students will be notified automatically.
        </p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onDone}
          className="w-full py-3 rounded-2xl text-sm font-black bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] transition-colors">
          Back to Assignments
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Form state ────────────────────────────────────────────────────────────────
type FormState = {
  title: string;
  courseId: string;
  description: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  maxScore: number;
  allowLate: boolean;
  allowedFileTypes: string[];
  rubric: RubricRow[];
  attachments: File[];
};

type FormErrors = Partial<Record<keyof FormState | "submit", string>>;

const DEFAULT_RUBRIC: RubricRow[] = [
  { id: "r1", label: "Content Quality",    maxScore: 30 },
  { id: "r2", label: "Technical Accuracy", maxScore: 30 },
  { id: "r3", label: "Presentation",       maxScore: 20 },
  { id: "r4", label: "Originality",        maxScore: 20 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminCreateAssignment() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<FormState>({
    title:            "",
    courseId:         "",
    description:      "",
    instructions:     "",
    dueDate:          "",
    dueTime:          "23:59",
    maxScore:         100,
    allowLate:        true,
    allowedFileTypes: [".pdf", ".zip", "image/*"],
    rubric:           DEFAULT_RUBRIC,
    attachments:      [],
  });

  // Derived: the selected course object (for the preview card)
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  const [errors,          setErrors]          = useState<FormErrors>({});
  const [success,         setSuccess]         = useState(false);
  const [uploading,       setUploading]       = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState<{ done: number; total: number } | null>(null);

  const set = <K extends keyof FormState>(key: K) => (value: FormState[K]) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key as keyof FormErrors]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  const { mutate: createAssignment, isPending: saving } = useMutation({
    mutationFn: (payload: CreateAssignmentDto) => AssignmentService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      setSuccess(true);
    },
    onError: (err: unknown) => {
      let message = "Failed to create assignment. Please try again.";
      if (err instanceof Error) {
        if (err.message.includes("403"))       message = "You don't have permission to create assignments for this course.";
        else if (err.message.includes("404"))  message = "Course not found. Please select a valid course.";
        else if (err.message.includes("400"))  message = "Invalid data. Please check all required fields.";
        else                                   message = err.message;
      }
      setErrors(p => ({ ...p, submit: message }));
    },
  });

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim())        e.title        = "Title is required";
    if (!form.courseId)            e.courseId     = "Please select a course";
    if (!form.description.trim())  e.description  = "Description is required";
    if (!form.instructions.trim()) e.instructions = "Instructions are required";
    if (!form.dueDate)             e.dueDate      = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;

    // 1. Upload attachments via presigned PUT, collect public URLs
    let attachmentUrls: string[] = [];
    if (form.attachments.length > 0) {
      setUploading(true);
      setUploadProgress({ done: 0, total: form.attachments.length });
      try {
        for (let i = 0; i < form.attachments.length; i++) {
          const url = await StorageService.upload("assignments", form.attachments[i]);
          attachmentUrls.push(url);
          setUploadProgress({ done: i + 1, total: form.attachments.length });
        }
      } catch {
        setErrors(p => ({ ...p, submit: "File upload failed. Please try again." }));
        setUploading(false);
        setUploadProgress(null);
        return;
      }
      setUploading(false);
      setUploadProgress(null);
    }

    // 2. POST /assignments — backend resolves instructorId from courseId for ADMIN
    const payload: CreateAssignmentDto = {
      title:        form.title.trim(),
      courseId:     form.courseId,
      description:  form.description.trim(),
      instructions: form.instructions.trim(),
      maxScore:     form.maxScore,
      dueDate:      new Date(`${form.dueDate}T${form.dueTime}:00`).toISOString(),
      allowLate:    form.allowLate,
      attachments:  attachmentUrls,
    };

    createAssignment(payload);
  };

  const rubricTotal = form.rubric.reduce((s, r) => s + r.maxScore, 0);

  return (
    <>
      <div className="max-w-[860px] mx-auto space-y-6 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/admin/assignments"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Assignments
          </Link>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_6px_20px_rgba(59,130,246,0.4)] flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                  Create <span className="text-blue-600 dark:text-blue-400">Assignment</span>
                </h1>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Admin
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Select a course — the instructor is resolved automatically. Enrolled students are notified on creation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 1. Course */}
        <SectionCard icon={BookOpen} title="Course" description="Choose which course this assignment belongs to" delay={0.06}>
          <CourseSelector
            selectedCourseId={form.courseId}
            onCourseChange={(id, course) => {
              set("courseId")(id);
              setSelectedCourse(course);
            }}
            error={errors.courseId}
          />
        </SectionCard>

        {/* 2. Details */}
        <SectionCard icon={FileText} title="Assignment Details" description="Title, description, and step-by-step instructions" delay={0.1}>
          <div className="space-y-5">
            <FieldWrap error={errors.title}>
              <Label required>Assignment Title</Label>
              <Input value={form.title} onChange={set("title")}
                placeholder="e.g. Build a REST API with Express & MongoDB" error={!!errors.title} />
            </FieldWrap>

            <FieldWrap error={errors.description}>
              <Label required>Description</Label>
              <Textarea value={form.description} onChange={set("description")}
                placeholder="Briefly explain what this assignment is about and what students will learn…" rows={3} />
            </FieldWrap>

            <FieldWrap error={errors.instructions} hint="Use numbered steps for clarity. Students see this exactly as written.">
              <Label required>Step-by-Step Instructions</Label>
              <Textarea value={form.instructions} onChange={set("instructions")}
                placeholder={"1. First step\n2. Second step\n3. Third step\n…"} rows={6} mono />
            </FieldWrap>
          </div>
        </SectionCard>

        {/* 3. Deadline + scoring */}
        <SectionCard icon={Calendar} title="Deadline & Scoring" delay={0.14}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldWrap error={errors.dueDate}>
              <Label required>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={set("dueDate")} error={!!errors.dueDate} />
            </FieldWrap>

            <FieldWrap hint="Defaults to end of day (23:59)">
              <Label>Due Time</Label>
              <Input type="time" value={form.dueTime} onChange={set("dueTime")} />
            </FieldWrap>

            <FieldWrap hint="Total points students can earn">
              <Label required>Maximum Score</Label>
              <div className="relative">
                <Input type="number" value={String(form.maxScore)}
                  onChange={v => set("maxScore")(Math.max(1, parseInt(v) || 1))} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold pointer-events-none">pts</span>
              </div>
              {rubricTotal > 0 && rubricTotal !== form.maxScore && (
                <p className="text-[11px] text-amber-500 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  Rubric totals {rubricTotal} pts — doesn't match max score ({form.maxScore} pts)
                </p>
              )}
            </FieldWrap>

            <div>
              <Label>Late Submissions</Label>
              <div className="flex items-center gap-3 mt-2.5">
                <button onClick={() => set("allowLate")(!form.allowLate)}
                  className={cn("relative w-12 h-6 rounded-full transition-all duration-300",
                    form.allowLate ? "bg-blue-600" : "bg-gray-200 dark:bg-white/[0.1]")}>
                  <motion.div animate={{ x: form.allowLate ? 24 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {form.allowLate ? "Allowed (marked as late)" : "Not allowed after deadline"}
                </span>
              </div>
              {form.allowLate && (
                <p className="text-[11px] text-blue-500 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Late submissions will be flagged
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* 4. Rubric (UI only — for instructor reference) */}
        <SectionCard icon={Star} title="Grading Rubric" description="Shown to instructors when marking and to students when viewing grades" delay={0.18}>
          <div className="mb-4 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/20 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Rubric criteria are for reference. Max scores don't need to add up to the total — they're used as relative weights.
            </p>
          </div>
          <RubricEditor rows={form.rubric} onChange={set("rubric")} />
        </SectionCard>

        {/* 5. Allowed file types */}
        <SectionCard icon={Upload} title="Allowed Submission Types" description="What file types students can submit" delay={0.22}>
          <FileTypeSelector selected={form.allowedFileTypes} onChange={set("allowedFileTypes")} />
          {form.allowedFileTypes.length > 0 && (
            <p className="text-[11px] text-gray-400 mt-3">
              Accepted: <span className="font-medium text-gray-600 dark:text-gray-300">{form.allowedFileTypes.join(", ")}</span>
            </p>
          )}
        </SectionCard>

        {/* 6. Attachments */}
        <SectionCard icon={BookOpen} title="Attachments for Students" description="Brief PDFs, starter templates, rubrics, datasets, etc." delay={0.26}>
          <AttachmentZone
            files={form.attachments}
            onAdd={files => set("attachments")([...form.attachments, ...files])}
            onRemove={i => set("attachments")(form.attachments.filter((_, xi) => xi !== i))}
          />
        </SectionCard>

        {/* Summary + Publish */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.3 }}
          className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500" />
          <div className="p-6">
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">Summary</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Course",     value: selectedCourse?.title ?? "—" },
                { label: "Instructor", value: selectedCourse?.instructorName ?? "—" },
                { label: "Max Score",  value: `${form.maxScore} pts` },
                { label: "Due",        value: form.dueDate ? new Date(form.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl p-3 bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white truncate">{value}</p>
                </div>
              ))}
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Please fix the following:
                </p>
                <ul className="space-y-0.5">
                  {Object.values(errors).filter(Boolean).map(e => (
                    <li key={e} className="text-xs text-red-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />{e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Link to="/admin/assignments"
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-center border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                Cancel
              </Link>
              <motion.button
                whileHover={!saving && !uploading ? { scale: 1.02, boxShadow: "0 10px 32px rgba(59,130,246,0.5)" } : {}}
                whileTap={!saving && !uploading ? { scale: 0.97 } : {}}
                onClick={handlePublish} disabled={saving || uploading}
                className={cn(
                  "flex-[2] py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all",
                  saving || uploading ? "bg-blue-400 cursor-wait text-white" : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_6px_24px_rgba(59,130,246,0.42)]"
                )}>
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {uploadProgress?.done}/{uploadProgress?.total}…</>
                ) : saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                ) : (
                  <><Shield className="w-4 h-4" /> Create Assignment</>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>

      <AnimatePresence>
        {success && <SuccessOverlay onDone={() => navigate("/admin/assignments")} />}
      </AnimatePresence>
    </>
  );
}
