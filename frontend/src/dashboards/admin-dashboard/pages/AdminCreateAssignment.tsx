// src/pages/admin/AdminCreateAssignment.tsx
// Admin creates an assignment and assigns it to a course + instructor.
// Route: /admin/assignments/create

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, GraduationCap, Calendar,
  FileText, Upload, X, Loader2, CheckCircle2,
  Plus, Trash2, Info, Shield, AlertTriangle,
  Clock,
  Star,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AssignmentService, { type CreateAssignmentDto } from "@/services/assignment.service";
import CoursesService from "@/services/course.service";
import UserService, { UserRole } from "@/services/user.service";
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

function Input({
  value, onChange, placeholder, type = "text", disabled, error,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; disabled?: boolean; error?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none",
        "bg-gray-50/80 dark:bg-white/[0.04]",
        "text-gray-800 dark:text-white placeholder:text-gray-400",
        "border",
        error   ? "border-red-300 dark:border-red-700"
        : focused ? "border-blue-400 ring-2 ring-blue-500/15"
        :           "border-gray-200 dark:border-white/[0.08]",
        disabled ? "opacity-60 cursor-not-allowed"  : ""
      )}
    />
  );
}

function Textarea({
  value, onChange, placeholder, rows = 4, mono,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; mono?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value} rows={rows}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className={cn(
        "w-full px-4 py-2.5 rounded-xl text-sm resize-none transition-all duration-200 outline-none",
        "bg-gray-50/80 dark:bg-white/[0.04]",
        "text-gray-800 dark:text-white placeholder:text-gray-400",
        "border",
        focused ? "border-blue-400 ring-2 ring-blue-500/15" : "border-gray-200 dark:border-white/[0.08]",
        mono ? "font-mono" : ""
      )}
    />
  );
}

function SectionCard({
  icon: Icon, title, description, children, delay = 0,
}: {
  icon: React.ElementType; title: string; description?: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: "easeOut" }}
      className="rounded-[22px] bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden"
    >
      <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
          flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)] flex-shrink-0 mt-0.5">
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

// ─── Rubric row ────────────────────────────────────────────────────────────────
type RubricRow = { id: string; label: string; maxScore: number };

function RubricEditor({
  rows, onChange,
}: {
  rows: RubricRow[];
  onChange: (rows: RubricRow[]) => void;
}) {
  const add = () => onChange([...rows, { id: `r-${Date.now()}`, label: "", maxScore: 20 }]);
  const remove = (id: string) => onChange(rows.filter(r => r.id !== id));
  const update = (id: string, key: keyof RubricRow, value: string | number) =>
    onChange(rows.map(r => r.id === id ? { ...r, [key]: value } : r));

  const total = rows.reduce((s, r) => s + r.maxScore, 0);

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={row.id} className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
          <input
            value={row.label}
            onChange={e => update(row.id, "label", e.target.value)}
            placeholder="Criterion name (e.g. Code Quality)"
            className="flex-1 px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-white/[0.04]
              border border-gray-200 dark:border-white/[0.08]
              focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15
              text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all"
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <input
              type="number" value={row.maxScore} min={1} max={500}
              onChange={e => update(row.id, "maxScore", +e.target.value)}
              className="w-16 px-2 py-2 rounded-xl text-xs text-center font-bold
                bg-blue-50 dark:bg-blue-950/30
                border border-blue-200 dark:border-blue-800/40
                text-blue-700 dark:text-blue-300 outline-none transition-all"
            />
            <span className="text-[10px] text-gray-400">pts</span>
          </div>
          <button onClick={() => remove(row.id)}
            className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08]
              flex items-center justify-center text-gray-400
              hover:text-red-500 hover:border-red-300 transition-all flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between pt-1">
        <button onClick={add}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
            border border-dashed border-blue-300 dark:border-blue-700
            text-blue-600 dark:text-blue-400
            hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
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

// ─── File type tags ────────────────────────────────────────────────────────────
const FILE_TYPE_OPTIONS = [
  { label: "Images",    value: "image/*"    },
  { label: "Videos",   value: "video/*"    },
  { label: "Audio",    value: "audio/*"    },
  { label: "PDF",      value: ".pdf"       },
  { label: "Word",     value: ".docx"      },
  { label: "ZIP",      value: ".zip"       },
  { label: "Text",     value: ".txt"       },
  { label: "PPT",      value: ".pptx"      },
  { label: "Excel",    value: ".xlsx"      },
  { label: "Any file", value: "*"          },
];

function FileTypeSelector({
  selected, onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
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

// ─── Course + Instructor selector ─────────────────────────────────────────────
function CourseInstructorSelector({
  selectedCourseId, selectedInstructorId,
  onCourseChange, onInstructorChange, errors,
}: {
  selectedCourseId: string;
  selectedInstructorId: string;
  onCourseChange: (id: string) => void;
  onInstructorChange: (id: string) => void;
  errors: { course?: string; instructor?: string };
}) {
  const { data: allCourses = [] } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const res = await CoursesService.findAll({ limit: 200 });
      return res.items || [];
    },
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ["instructors-list"],
    queryFn: async () => {
      const res = await UserService.findAll({ role: UserRole.INSTRUCTOR, limit: 100 });
      return Array.isArray(res) ? res : (res as any).data || [];
    },
  });

  // Filter courses to only those belonging to the selected instructor
  const visibleCourses = selectedInstructorId
    ? allCourses.filter((c: any) => c.instructorId === selectedInstructorId)
    : allCourses;

  const selectedCourse      = (allCourses as any[]).find((c: any) => c.id === selectedCourseId);
  const selectedInstructor  = (instructors as any[]).find((i: any) => i.id === selectedInstructorId);

  // Course selected → auto-fill instructor
  const handleCourseChange = (id: string) => {
    onCourseChange(id);
    const course = (allCourses as any[]).find((c: any) => c.id === id);
    if (course?.instructorId) {
      onInstructorChange(course.instructorId);
    }
  };

  // Instructor selected → clear course if it doesn't belong to this instructor
  const handleInstructorChange = (id: string) => {
    onInstructorChange(id);
    if (selectedCourseId) {
      const course = (allCourses as any[]).find((c: any) => c.id === selectedCourseId);
      if (course && course.instructorId !== id) {
        onCourseChange("");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Instructor picker — pick instructor first to filter courses */}
      <div>
        <Label required>Instructor</Label>
        <FieldWrap error={errors.instructor}
          hint="Selecting an instructor filters the course list to their courses.">
          <div className={cn(
            "rounded-xl border overflow-hidden transition-all",
            errors.instructor ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-white/[0.08]"
          )}>
            <select
              value={selectedInstructorId}
              onChange={e => handleInstructorChange(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50/80 dark:bg-white/[0.04]
                text-gray-800 dark:text-white outline-none cursor-pointer"
            >
              <option value="">Select an instructor…</option>
              {(instructors as any[]).map((i: any) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </FieldWrap>
        <AnimatePresence>
          {selectedInstructor && (
            <motion.div key="instructor-preview"
              initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.22 }}
              className="mt-3 overflow-hidden">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{(selectedInstructor as any).name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {visibleCourses.length} course{visibleCourses.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Course picker */}
      <div>
        <Label required>Course</Label>
        <FieldWrap error={errors.course}>
          <div className={cn(
            "rounded-xl border overflow-hidden transition-all",
            errors.course ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-white/[0.08]"
          )}>
            <select
              value={selectedCourseId}
              onChange={e => handleCourseChange(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50/80 dark:bg-white/[0.04]
                text-gray-800 dark:text-white outline-none cursor-pointer"
            >
              <option value="">
                {selectedInstructorId
                  ? visibleCourses.length === 0 ? "No courses for this instructor" : "Select a course…"
                  : "Select a course…"}
              </option>
              {(visibleCourses as any[]).map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </FieldWrap>
        <AnimatePresence>
          {selectedCourse && (
            <motion.div key="course-preview"
              initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.22 }}
              className="mt-3 overflow-hidden">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{(selectedCourse as any).title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
                    {((selectedCourse as any).status ?? "").toLowerCase()} · {((selectedCourse as any).level ?? "").toLowerCase()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Attachment upload zone ────────────────────────────────────────────────────
function AttachmentZone({
  files, onAdd, onRemove,
}: {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onAdd(Array.from(e.dataTransfer.files));
  }, [onAdd]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onAdd(Array.from(e.target.files));
  };

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
        <p className="text-xs text-gray-400 mt-1">
          Upload a brief, rubric PDF, starter template, design mockups, etc.
        </p>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleChange} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, i) => {
            const type = getFileType(file.name);
            const meta = FILE_META[type];
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${meta.bg}
                  border border-gray-100 dark:border-white/[0.06] group`}>
                <span className="text-xl leading-none flex-shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
                  <p className={`text-[10px] ${meta.color}`}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {type}
                  </p>
                </div>
                <button onClick={() => onRemove(i)}
                  className="w-7 h-7 rounded-xl bg-white/60 dark:bg-white/[0.08] flex items-center justify-center
                    text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
        className="rounded-[28px] p-12 text-center bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.2)] max-w-sm w-full mx-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.25 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600
            flex items-center justify-center mx-auto mb-5
            shadow-[0_8px_32px_rgba(16,185,129,0.4)]"
        >
          <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Assignment Published!</h2>
        <p className="text-sm text-gray-400 mb-6">
          The assignment has been created and assigned to the instructor. Students will be notified.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          className="w-full py-3 rounded-2xl text-sm font-black
            bg-blue-600 hover:bg-blue-500 text-white
            shadow-[0_4px_16px_rgba(59,130,246,0.4)] transition-colors"
        >
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
  instructorId: string;
  description: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  maxScore: number;
  allowLate: boolean;
  allowedFileTypes: string[];
  rubric: RubricRow[];
  attachments: File[];
  note: string;         // private note to instructor
};

type FormErrors = Partial<Record<keyof FormState | "course" | "instructor", string>>;

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

  const { data: courses = [], isLoading: _coursesLoading } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const res = await CoursesService.findAll();
      return res.items || [];
    },
  });

  const { data: instructors = [], isLoading: _instructorsLoading } = useQuery({
    queryKey: ["instructors-list"],
    queryFn: async () => {
      const res = await UserService.findAll({ role: UserRole.INSTRUCTOR, limit: 100 });
      return Array.isArray(res) ? res : (res as any).data || [];
    },
  });

  const { mutate: createAssignment, isPending: saving } = useMutation({
    mutationFn: (payload: CreateAssignmentDto) => AssignmentService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      setSuccess(true);
    },
    onError: (err: unknown) => {
      console.error('Assignment creation failed:', err);
      let message = "Failed to create assignment. Please try again.";
      
      if (err instanceof Error) {
        if (err.message.includes('400')) {
          message = "Invalid assignment data. Please check all required fields.";
        } else if (err.message.includes('403')) {
          message = "You don't have permission to create assignments.";
        } else if (err.message.includes('401')) {
          message = "Please log in to create assignments.";
        } else {
          message = err.message;
        }
      }
      
      setErrors(p => ({ ...p, submit: message }));
    },
  });

  const [form, setForm] = useState<FormState>({
    title:            "",
    courseId:         "",
    instructorId:     "",
    description:      "",
    instructions:     "",
    dueDate:          "",
    dueTime:          "23:59",
    maxScore:         100,
    allowLate:        true,
    allowedFileTypes: [".pdf", ".zip", "image/*"],
    rubric:           DEFAULT_RUBRIC,
    attachments:      [],
    note:             "",
  });

  const [errors,    setErrors]    = useState<FormErrors>({});
  const [success,   setSuccess]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);

  const set = <K extends keyof FormState>(key: K) => (value: FormState[K]) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key as keyof FormErrors]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim())         e.title        = "Title is required";
    if (!form.courseId)             e.course       = "Please select a course";
    if (!form.instructorId)         e.instructor   = "Please select an instructor";
    if (!form.description.trim())   e.description  = "Description is required";
    if (!form.instructions.trim())  e.instructions = "Instructions are required";
    if (!form.dueDate)              e.dueDate      = "Due date is required";
    if (form.allowedFileTypes.length === 0) e.allowedFileTypes = "Select at least one file type";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) {
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Upload attachment files first
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
  const selectedCourse = courses.find((c: any) => c.id === form.courseId);
  const selectedInstructor = instructors.find((i: any) => i.id === form.instructorId);

  return (
    <>
      <div className="max-w-[860px] mx-auto space-y-6 pb-16">

        {/* Back + header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/admin/assignments"
            className="inline-flex items-center gap-2 text-sm text-gray-400
              hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Assignments
          </Link>

          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700
              flex items-center justify-center shadow-[0_6px_20px_rgba(59,130,246,0.4)] flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                  Create <span className="text-blue-600 dark:text-blue-400">Assignment</span>
                </h1>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold
                  bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300
                  border border-blue-200 dark:border-blue-800/50 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Admin
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Create an assignment and assign it to a course and instructor.
                Students in the course will be notified automatically.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── 1. Course + Instructor ──────────────────────────────────── */}
        <SectionCard
          icon={GraduationCap}
          title="Course & Instructor Assignment"
          description="Choose which course this assignment belongs to and who is responsible for it"
          delay={0.06}
        >
          <CourseInstructorSelector
            selectedCourseId={form.courseId}
            selectedInstructorId={form.instructorId}
            onCourseChange={set("courseId")}
            onInstructorChange={set("instructorId")}
            errors={{ course: errors.course, instructor: errors.instructor }}
          />
        </SectionCard>

        {/* ── 2. Basic details ────────────────────────────────────────── */}
        <SectionCard
          icon={FileText}
          title="Assignment Details"
          description="Title, description, and step-by-step instructions for students"
          delay={0.1}
        >
          <div className="space-y-5">
            <FieldWrap error={errors.title}>
              <Label required>Assignment Title</Label>
              <Input
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Build a REST API with Express & MongoDB"
                error={!!errors.title}
              />
            </FieldWrap>

            <FieldWrap error={errors.description}>
              <Label required>Description</Label>
              <Textarea
                value={form.description}
                onChange={set("description")}
                placeholder="Briefly explain what this assignment is about and what students will learn…"
                rows={3}
              />
            </FieldWrap>

            <FieldWrap
              error={errors.instructions}
              hint="Use numbered steps for clarity. Students see this exactly as written."
            >
              <Label required>Step-by-Step Instructions</Label>
              <Textarea
                value={form.instructions}
                onChange={set("instructions")}
                placeholder={"1. First step\n2. Second step\n3. Third step\n…"}
                rows={6}
                mono
              />
            </FieldWrap>

            {/* Private note to instructor */}
            <FieldWrap hint="Only the assigned instructor can see this note. Not visible to students.">
              <Label>
                <span className="flex items-center gap-1.5">
                  Private Note to Instructor
                  <Info className="w-3 h-3 text-gray-400" />
                </span>
              </Label>
              <Textarea
                value={form.note}
                onChange={set("note")}
                placeholder="Any context, grading priorities, or special instructions for the instructor…"
                rows={2}
              />
            </FieldWrap>
          </div>
        </SectionCard>

        {/* ── 3. Deadline + scoring ────────────────────────────────────── */}
        <SectionCard
          icon={Calendar}
          title="Deadline & Scoring"
          description="Set when the assignment is due and how it will be scored"
          delay={0.14}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Due date */}
            <FieldWrap error={errors.dueDate}>
              <Label required>Due Date</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={set("dueDate")}
                error={!!errors.dueDate}
              />
            </FieldWrap>

            {/* Due time */}
            <FieldWrap hint="Defaults to end of day (23:59)">
              <Label>Due Time</Label>
              <Input
                type="time"
                value={form.dueTime}
                onChange={set("dueTime")}
              />
            </FieldWrap>

            {/* Max score */}
            <FieldWrap hint="Total points students can earn on this assignment">
              <Label required>Maximum Score</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={String(form.maxScore)}
                  onChange={v => set("maxScore")(Math.max(1, parseInt(v) || 1))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold pointer-events-none">
                  pts
                </span>
              </div>
              {rubricTotal > 0 && rubricTotal !== form.maxScore && (
                <p className="text-[11px] text-amber-500 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  Rubric totals {rubricTotal} pts — doesn't match max score ({form.maxScore} pts)
                </p>
              )}
            </FieldWrap>

            {/* Late submissions */}
            <div>
              <Label>Late Submissions</Label>
              <div className="flex items-center gap-3 mt-2.5">
                <button
                  onClick={() => set("allowLate")(!form.allowLate)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-all duration-300",
                    form.allowLate ? "bg-blue-600" : "bg-gray-200 dark:bg-white/[0.1]"
                  )}
                >
                  <motion.div
                    animate={{ x: form.allowLate ? 24 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {form.allowLate ? "Allowed (marked as late)" : "Not allowed after deadline"}
                </span>
              </div>
              {form.allowLate && (
                <p className="text-[11px] text-blue-500 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Late submissions will be flagged and may affect the grade
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── 4. Rubric ───────────────────────────────────────────────── */}
        <SectionCard
          icon={Star}
          title="Grading Rubric"
          description="Define the criteria instructors will use to mark this assignment"
          delay={0.18}
        >
          <div className="mb-4 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/15
            border border-blue-100 dark:border-blue-900/20 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              The rubric is shown to both instructors (when marking) and students (when viewing their grade).
              Max scores don't have to add up to the total — they're used as relative weights.
            </p>
          </div>
          <RubricEditor rows={form.rubric} onChange={set("rubric")} />
        </SectionCard>

        {/* ── 5. File types ────────────────────────────────────────────── */}
        <SectionCard
          icon={Upload}
          title="Allowed Submission Types"
          description="Choose what file types students can submit"
          delay={0.22}
        >
          <FieldWrap error={errors.allowedFileTypes as string | undefined}>
            <FileTypeSelector
              selected={form.allowedFileTypes}
              onChange={set("allowedFileTypes")}
            />
          </FieldWrap>
          {form.allowedFileTypes.length > 0 && (
            <p className="text-[11px] text-gray-400 mt-3">
              Accepted: <span className="font-medium text-gray-600 dark:text-gray-300">{form.allowedFileTypes.join(", ")}</span>
            </p>
          )}
        </SectionCard>

        {/* ── 6. Attachments ────────────────────────────────────────────── */}
        <SectionCard
          icon={BookOpen}
          title="Attachments for Students"
          description="Upload brief PDFs, starter templates, rubrics, design mockups, datasets, etc."
          delay={0.26}
        >
          <AttachmentZone
            files={form.attachments}
            onAdd={files => set("attachments")([...form.attachments, ...files])}
            onRemove={i => set("attachments")(form.attachments.filter((_, xi) => xi !== i))}
          />
        </SectionCard>

        {/* ── Summary + Publish ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.3 }}
          className="rounded-[22px] bg-white dark:bg-[#0f1623]
            border border-gray-100 dark:border-white/[0.07]
            shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500" />
          <div className="p-6">
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">
              Assignment Summary
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Course",
                  value: (selectedCourse as any)?.title ?? "–",
                  sub: "Selected course",
                },
                {
                  label: "Instructor", 
                  value: (selectedInstructor as any)?.name ?? "–",
                  sub: "Assigned instructor",
                },
                {
                  label: "Max Score",
                  value: `${form.maxScore} pts`,
                  sub: rubricTotal > 0 ? `${rubricTotal} rubric pts` : null,
                },
                {
                  label: "Due",
                  value: form.dueDate ? new Date(form.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—",
                  sub: form.dueTime,
                },
              ].map(({ label, value, sub }) => (
                <div key={label} className="rounded-2xl p-3 bg-gray-50/80 dark:bg-white/[0.03]
                  border border-gray-100 dark:border-white/[0.06] text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white truncate">{value}</p>
                  {sub && <p className="text-[10px] text-gray-400 truncate">{sub}</p>}
                </div>
              ))}
            </div>

            {/* Validation errors summary */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20
                border border-red-200 dark:border-red-900/30">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Please fix the following before publishing:
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
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-center
                  border border-gray-200 dark:border-white/[0.08]
                  text-gray-600 dark:text-gray-400
                  hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                Cancel
              </Link>

              <motion.button
                whileHover={!saving && !uploading ? { scale: 1.02, boxShadow: "0 10px 32px rgba(59,130,246,0.5)" } : {}}
                whileTap={!saving && !uploading ? { scale: 0.97 } : {}}
                onClick={handlePublish}
                disabled={saving || uploading}
                className={cn(
                  "flex-[2] py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all",
                  saving || uploading
                    ? "bg-blue-400 cursor-wait text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_6px_24px_rgba(59,130,246,0.42)]"
                )}>
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {uploadProgress?.done}/{uploadProgress?.total}…</>
                ) : saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
                ) : (
                  <><Shield className="w-4 h-4" /> Publish Assignment</>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {success && <SuccessOverlay onDone={() => navigate("/admin/assignments")} />}
      </AnimatePresence>
    </>
  );
}