// src/dashboards/admin-dashboard/pages/AdminEditAssignment.tsx
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, GraduationCap, Calendar,
  FileText, Upload, X, Loader2, CheckCircle2,
  Plus, Trash2, Info, Shield, AlertTriangle,
  Clock, Star,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AssignmentService, { type UpdateAssignmentDto } from "@/services/assignment.service";
import CoursesService from "@/services/course.service";
import UserService, { UserRole } from "@/services/user.service";

// ==================== TYPES ====================

interface FormState {
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
  note: string;
}

interface FormErrors {
  title?: string;
  course?: string;
  instructor?: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  allowedFileTypes?: string;
  submit?: string;
}

interface RubricRow {
  id: string;
  label: string;
  maxScore: number;
}

// ==================== HELPERS ====================

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// ==================== SHARED UI COMPONENTS ====================

function SectionCard({ icon: Icon, title, children, delay = 0 }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
  description?: string; // kept for call-site compatibility, not rendered
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay }}
      className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

function Label({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-bold tracking-wider text-gray-700 dark:text-gray-300 uppercase mb-2 flex items-center gap-1">
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function FieldWrap({ children, error }: { children: React.ReactNode; error?: string | undefined }) {
  return (
    <div className={cn("relative", error && "animate-pulse")} data-error={error ? "true" : undefined}>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ==================== CUSTOM COMPONENTS ====================

function RichTextarea({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, []);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => {
        onChange(e.target.value);
        setTimeout(adjustHeight, 0);
      }}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none resize-none transition-all"
      rows={4}
    />
  );
}

function FileTypeSelector({ selected, onChange }: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const types = [
    { label: "PDF", value: ".pdf" },
    { label: "Word", value: ".doc,.docx" },
    { label: "Excel", value: ".xls,.xlsx" },
    { label: "PowerPoint", value: ".ppt,.pptx" },
    { label: "Images", value: "image/*" },
    { label: "ZIP", value: ".zip,.rar,.7z" },
    { label: "Text", value: ".txt,.md" },
    { label: "Code", value: ".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {types.map(type => (
        <button
          key={type.value}
          onClick={() => {
            if (selected.includes(type.value)) {
              onChange(selected.filter(v => v !== type.value));
            } else {
              onChange([...selected, type.value]);
            }
          }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
            selected.includes(type.value)
              ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40"
              : "border-gray-200 dark:border-white/[0.08] text-gray-500 hover:text-gray-700"
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}

function AttachmentZone({ files, onAdd, onRemove }: {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (i: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.size < 10 * 1024 * 1024);
    if (dropped.length) onAdd(dropped);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => ref.current?.click()}
        className="border-2 border-dashed border-gray-200 dark:border-white/[0.08] rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-all"
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Drop files here or <span className="text-blue-600 font-semibold">browse</span>
        </p>
        <p className="text-xs text-gray-400">PDF, Word, Excel, PowerPoint, images, ZIP, etc. (max 10MB each)</p>
        <input ref={ref} type="file" multiple className="hidden" onChange={e => {
          if (e.target.files?.length) onAdd(Array.from(e.target.files));
        }} />
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/[0.06] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{f.name}</p>
                  <p className="text-xs text-gray-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={() => onRemove(i)} className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RubricEditor({ rows, onChange }: { rows: RubricRow[]; onChange: (rows: RubricRow[]) => void }) {
  const update = (i: number, field: keyof RubricRow, value: string | number) => {
    const updated = [...rows];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  const add = () => onChange([...rows, { id: `r${Date.now()}`, label: "", maxScore: 10 }]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={row.id} className="flex items-center gap-3">
          <div className="flex-1">
            <input
              value={row.label}
              onChange={e => update(i, "label", e.target.value)}
              placeholder="Criteria name"
              className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
            />
          </div>
          <input
            type="number"
            value={row.maxScore}
            onChange={e => update(i, "maxScore", parseInt(e.target.value) || 0)}
            placeholder="Score"
            min="0"
            className="w-20 px-3 py-2 rounded-lg text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
          />
          <button onClick={() => remove(i)} className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button onClick={add} className="w-full py-2 rounded-xl text-sm font-bold border border-dashed border-gray-300 dark:border-white/[0.15] text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-all">
        <Plus className="w-4 h-4 inline mr-2" /> Add Criteria
      </button>
    </div>
  );
}

function SuccessOverlay({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-[#0f1623] rounded-[24px] p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Assignment Updated!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Your assignment has been successfully updated.</p>
        <button onClick={onDone} className="w-full py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}

// ==================== COURSE + INSTRUCTOR SELECTOR ====================

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
  const { data: courses = [] } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const res = await CoursesService.findAll();
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

  const selectedCourse = courses.find((c: any) => c.id === selectedCourseId);
  const selectedInstructor = instructors.find((i: any) => i.id === selectedInstructorId);

  // When course is selected, auto-fill instructor if not already set
  const handleCourseChange = (id: string) => {
    onCourseChange(id);
    const course = courses.find((c: any) => c.id === id) as any;
    if (course && !selectedInstructorId) {
      onInstructorChange((course.instructorId as string) || "");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Course picker */}
      <div>
        <Label required>Assign to Course</Label>
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
              <option value="">Select a course...</option>
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </FieldWrap>

        {/* Course preview card */}
        <AnimatePresence>
          {selectedCourse ? (
            <motion.div
              key="course-preview"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.22 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {(selectedCourse as any).title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Course ID: {(selectedCourse as any).id}</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Instructor picker */}
      <div>
        <Label required>Assign to Instructor</Label>
        <FieldWrap error={errors.instructor}>
          <div className={cn(
            "rounded-xl border overflow-hidden transition-all",
            errors.instructor ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-white/[0.08]"
          )}>
            <select
              value={selectedInstructorId}
              onChange={e => onInstructorChange(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50/80 dark:bg-white/[0.04]
                text-gray-800 dark:text-white outline-none cursor-pointer"
            >
              <option value="">Select an instructor...</option>
              {instructors.map((i: any) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </FieldWrap>

        {/* Instructor preview card */}
        <AnimatePresence>
          {selectedInstructor ? (
            <motion.div
              key="instructor-preview"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.22 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{(selectedInstructor as any).name}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">Instructor</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==================== DEFAULT RUBRIC ====================

const DEFAULT_RUBRIC: RubricRow[] = [
  { id: "r1", label: "Content Quality",    maxScore: 30 },
  { id: "r2", label: "Technical Accuracy", maxScore: 30 },
  { id: "r3", label: "Presentation",       maxScore: 20 },
  { id: "r4", label: "Originality",        maxScore: 20 },
];

// ==================== MAIN COMPONENT ====================

export default function AdminEditAssignment() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Fetch assignment data
  const { data: assignment, isLoading: assignmentLoading, error: assignmentError } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: async () => {
      if (!assignmentId) throw new Error("Assignment ID is required");
      return AssignmentService.getById(assignmentId);
    },
    enabled: !!assignmentId,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const res = await CoursesService.findAll();
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

  const { mutate: updateAssignment, isPending: saving } = useMutation({
    mutationFn: (payload: UpdateAssignmentDto) => AssignmentService.update(assignmentId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["assignment", assignmentId] });
      setSuccess(true);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update assignment. Please try again.";
      setErrors(p => ({ ...p, submit: message }));
    },
  });

  const [form, setForm] = useState<FormState>({
    title: "",
    courseId: "",
    instructorId: "",
    description: "",
    instructions: "",
    dueDate: "",
    dueTime: "23:59",
    maxScore: 100,
    allowLate: true,
    allowedFileTypes: [".pdf", ".zip", "image/*"],
    rubric: DEFAULT_RUBRIC,
    attachments: [],
    note: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  // Initialize form with assignment data when it loads
  useEffect(() => {
    if (assignment) {
      const dueDate = new Date(assignment.dueDate);
      setForm({
        title: assignment.title,
        courseId: assignment.courseId,
        instructorId: "", // This might need to be fetched from course data
        description: assignment.description,
        instructions: assignment.instructions,
        dueDate: dueDate.toISOString().split('T')[0],
        dueTime: dueDate.toTimeString().slice(0, 5),
        maxScore: assignment.maxScore,
        allowLate: assignment.allowLate,
        allowedFileTypes: [".pdf", ".zip", "image/*"],
        rubric: DEFAULT_RUBRIC,
        attachments: [],
        note: "",
      });
    }
  }, [assignment]);

  const set = <K extends keyof FormState>(key: K) => (value: FormState[K]) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key as keyof FormErrors]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim())         e.title        = "Title is required";
    if (!form.courseId)             e.course       = "Please select a course";
    if (!form.description.trim())   e.description  = "Description is required";
    if (!form.instructions.trim())  e.instructions = "Instructions are required";
    if (!form.dueDate)              e.dueDate      = "Due date is required";
    if (form.allowedFileTypes.length === 0) e.allowedFileTypes = "Select at least one file type";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpdate = () => {
    if (!validate()) {
      // Scroll to first error
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const payload: UpdateAssignmentDto = {
      title: form.title.trim(),
      description: form.description.trim(),
      instructions: form.instructions.trim(),
      maxScore: form.maxScore,
      dueDate: new Date(`${form.dueDate}T${form.dueTime}:00`).toISOString(),
      allowLate: form.allowLate,
      attachments: [], // TODO: Upload attachments and get URLs
    };

    updateAssignment(payload);
  };

  const rubricTotal = form.rubric.reduce((s, r) => s + r.maxScore, 0);
  const selectedCourse = courses.find((c: any) => c.id === form.courseId);
  const selectedInstructor = instructors.find((i: any) => i.id === form.instructorId);

  if (assignmentLoading) {
    return (
      <div className="max-w-[860px] mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-400">Loading assignment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (assignmentError || !assignment) {
    return (
      <div className="max-w-[860px] mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-400 mb-4">Assignment not found</p>
            <Link to="/admin/assignments">
              <button className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">
                Back to Assignments
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[860px] mx-auto space-y-6 pb-16">

        {/* Back + header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={`/admin/assignments/${assignmentId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-400
              hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Assignment
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                Edit Assignment
              </h1>
              <p className="text-sm text-gray-400 mt-1">Update assignment details and settings</p>
            </div>
          </div>
        </motion.div>

        {/* Course & Instructor */}
        <SectionCard
          icon={BookOpen}
          title="Course & Instructor Assignment"
          description="Select which course and instructor this assignment belongs to"
          delay={0.05}
        >
          <CourseInstructorSelector
            selectedCourseId={form.courseId}
            selectedInstructorId={form.instructorId}
            onCourseChange={set("courseId")}
            onInstructorChange={set("instructorId")}
            errors={{ course: errors.course, instructor: errors.instructor }}
          />
        </SectionCard>

        {/* Basic Info */}
        <SectionCard
          icon={FileText}
          title="Basic Information"
          description="Assignment title, description, and instructions for students"
          delay={0.09}
        >
          <div className="space-y-6">
            <div>
              <Label required>Assignment Title</Label>
              <FieldWrap error={errors.title}>
                <input
                  value={form.title}
                  onChange={e => set("title")(e.target.value)}
                  placeholder="e.g., Final Project - React Application"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
                />
              </FieldWrap>
            </div>

            <div>
              <Label required>Description</Label>
              <FieldWrap error={errors.description}>
                <RichTextarea
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Brief overview of what students will be working on..."
                />
              </FieldWrap>
            </div>

            <div>
              <Label required>Instructions</Label>
              <FieldWrap error={errors.instructions}>
                <RichTextarea
                  value={form.instructions}
                  onChange={set("instructions")}
                  placeholder="Detailed step-by-step instructions for completing the assignment..."
                />
              </FieldWrap>
            </div>
          </div>
        </SectionCard>

        {/* Due Date & Scoring */}
        <SectionCard
          icon={Calendar}
          title="Due Date & Scoring"
          description="Set deadline, scoring, and submission policies"
          delay={0.13}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label required>Due Date</Label>
              <FieldWrap error={errors.dueDate}>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => set("dueDate")(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
                />
              </FieldWrap>
            </div>

            <div>
              <Label>Due Time</Label>
              <input
                type="time"
                value={form.dueTime}
                onChange={e => set("dueTime")(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
              />
            </div>

            <div>
              <Label required>Maximum Score</Label>
              <input
                type="number"
                value={form.maxScore}
                onChange={e => set("maxScore")(parseInt(e.target.value) || 0)}
                placeholder="100"
                min="1"
                className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Current Score</p>
                <p className="text-2xl font-black text-blue-600">{form.maxScore}</p>
              </div>
            </div>
          </div>

          {/* Late submissions */}
          <div>
            <Label>Late Submissions</Label>
            <div className="flex items-center gap-3 mt-2.5">
              <button
                onClick={() => set("allowLate")(!form.allowLate)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  form.allowLate ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  form.allowLate ? "translate-x-7" : "translate-x-1"
                )} />
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
        </SectionCard>

        {/* Rubric */}
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
              Max scores don't have to add up to the total - they're used as relative weights.
            </p>
          </div>
          <RubricEditor rows={form.rubric} onChange={set("rubric")} />
        </SectionCard>

        {/* File types */}
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

        {/* Attachments */}
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

        {/* Summary + Update */}
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
                  value: (selectedCourse as any)?.title ?? "â",
                  sub: "Selected course",
                },
                {
                  label: "Instructor", 
                  value: (selectedInstructor as any)?.name ?? "â",
                  sub: "Assigned instructor",
                },
                {
                  label: "Max Score",
                  value: `${form.maxScore} pts`,
                  sub: rubricTotal > 0 ? `${rubricTotal} rubric pts` : null,
                },
                {
                  label: "Due",
                  value: form.dueDate ? new Date(form.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "â",
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
                  Please fix the following before updating:
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
              <Link to={`/admin/assignments/${assignmentId}`}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-center
                  border border-gray-200 dark:border-white/[0.08]
                  text-gray-600 dark:text-gray-400
                  hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                Cancel
              </Link>

              <motion.button
                whileHover={!saving ? { scale: 1.02, boxShadow: "0 10px 32px rgba(59,130,246,0.5)" } : {}}
                whileTap={!saving ? { scale: 0.97 } : {}}
                onClick={handleUpdate}
                disabled={saving}
                className={cn(
                  "flex-[2] py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all",
                  saving
                    ? "bg-blue-400 cursor-wait text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_6px_24px_rgba(59,130,246,0.42)]"
                )}>
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                ) : (
                  <><Shield className="w-4 h-4" /> Update Assignment</>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {success && <SuccessOverlay onDone={() => navigate(`/admin/assignments/${assignmentId}`)} />}
      </AnimatePresence>
    </>
  );
}
