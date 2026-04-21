// src/dashboards/instructor-dashboard/pages/InstructorCourseManage.tsx
// Route: /instructor/courses/:id/manage
import { useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Edit3, Trash2, Plus, Upload,
  ChevronDown, Loader2, CheckCircle2, Globe, DollarSign,
  Film, FileText, Paperclip, X, Save, Tag, Layers,
  Play, AlertTriangle, Check, Image as ImageIcon,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import CoursesService, { CourseLevel, MaterialType } from "@/services/course.service";
import StorageService from "@/services/storage.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseMaterial {
  id: string;
  type: string;
  title: string;
  url: string;
  fileName: string | null;
  size: number | null;
}

interface CourseLesson {
  id: string;
  title: string;
  position: number;
  duration: number | null;
  isPreview: boolean;
  description: string | null;
  materials: CourseMaterial[];
}

interface CourseSection {
  id: string;
  title: string;
  position: number;
  lessons: CourseLesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  img: string | null;
  videoUrl: string | null;
  price: number;
  level: string;
  status: string;
  badge: string | null;
  tags: string[];
  syllabus: string[];
  includes: string[];
  sections: CourseSection[];
  _count?: { enrollments?: number };
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl text-sm
        bg-gray-50 dark:bg-white/[0.04]
        border border-gray-200 dark:border-white/[0.08]
        text-gray-800 dark:text-white
        placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
        transition-all"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 rounded-xl text-sm resize-none
        bg-gray-50 dark:bg-white/[0.04]
        border border-gray-200 dark:border-white/[0.08]
        text-gray-800 dark:text-white
        placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
        transition-all"
    />
  );
}

const MATERIAL_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  VIDEO:    { icon: <Film className="w-3.5 h-3.5" />,      color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/30" },
  DOCUMENT: { icon: <FileText className="w-3.5 h-3.5" />,   color: "text-sky-600 dark:text-sky-400",     bg: "bg-sky-100 dark:bg-sky-900/30" },
  AUDIO:    { icon: <Play className="w-3.5 h-3.5" />,       color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
  LINK:     { icon: <Globe className="w-3.5 h-3.5" />,      color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  OTHER:    { icon: <Paperclip className="w-3.5 h-3.5" />,  color: "text-gray-500 dark:text-gray-400",   bg: "bg-gray-100 dark:bg-white/[0.06]" },
};

function materialType(file: File): MaterialType {
  if (file.type.startsWith("video/"))  return MaterialType.VIDEO;
  if (file.type.startsWith("audio/"))  return MaterialType.AUDIO;
  if (file.type.includes("pdf") || file.type.includes("document") || file.type.includes("presentation"))
    return MaterialType.DOCUMENT;
  return MaterialType.DOCUMENT;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:     { label: "Draft",     color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-900/20",   border: "border-amber-200 dark:border-amber-800/40" },
  PUBLISHED: { label: "Published", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/40" },
  ARCHIVED:  { label: "Archived",  color: "text-gray-500 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-white/[0.05]",   border: "border-gray-200 dark:border-white/[0.08]" },
};

// ─── Lesson Row ───────────────────────────────────────────────────────────────

function LessonRow({
  lesson, courseId, sectionId,
}: {
  lesson: CourseLesson;
  courseId: string;
  sectionId: string;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(lesson.title);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { mutate: removeLesson, isPending: removingLesson } = useMutation({
    mutationFn: () => CoursesService.removeLesson(courseId, sectionId, lesson.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }),
  });

  const { mutate: updateTitle } = useMutation({
    mutationFn: (title: string) =>
      CoursesService.updateLesson(courseId, sectionId, lesson.id, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      setEditTitle(false);
    },
  });

  const { mutate: removeMaterial } = useMutation({
    mutationFn: (materialId: string) =>
      CoursesService.removeMaterial(courseId, sectionId, lesson.id, materialId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }),
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await StorageService.upload(
          file.type.startsWith("video/") ? "course-videos" : "lesson-materials",
          file
        );
        await CoursesService.addMaterial(courseId, sectionId, lesson.id, {
          type: materialType(file),
          title: file.name.replace(/\.[^/.]+$/, ""),
          url,
          fileName: file.name,
          size: file.size,
        });
      }
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
      {/* Lesson header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/60 dark:bg-white/[0.02]">
        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          </motion.div>
          {editTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={() => titleDraft.trim() && updateTitle(titleDraft.trim())}
              onKeyDown={e => {
                if (e.key === "Enter") titleDraft.trim() && updateTitle(titleDraft.trim());
                if (e.key === "Escape") { setTitleDraft(lesson.title); setEditTitle(false); }
              }}
              onClick={e => e.stopPropagation()}
              className="flex-1 text-sm font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none border-b border-blue-400"
            />
          ) : (
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
              {lesson.title}
            </span>
          )}
          {lesson.materials.length > 0 && (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-md flex-shrink-0">
              {lesson.materials.length} files
            </span>
          )}
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setEditTitle(p => !p)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => removeLesson()}
            disabled={removingLesson}
            className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            {removingLesson ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Lesson body — materials */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 space-y-2">
              {lesson.materials.length > 0 ? (
                lesson.materials.map(mat => {
                  const meta = MATERIAL_ICONS[mat.type] ?? MATERIAL_ICONS.OTHER;
                  return (
                    <div key={mat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.05] group">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{mat.title}</p>
                        {mat.size && <p className="text-[10px] text-gray-400">{formatSize(mat.size)}</p>}
                      </div>
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-500 hover:underline flex-shrink-0"
                      >
                        Open
                      </a>
                      <button
                        onClick={() => removeMaterial(mat.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 italic py-1">No materials yet.</p>
              )}

              {/* Upload zone */}
              <input ref={fileRef} type="file" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border-2 border-dashed
                  border-gray-200 dark:border-white/[0.07]
                  text-gray-400 dark:text-gray-500 text-xs font-bold
                  hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400
                  disabled:opacity-50 transition-all"
              >
                {uploading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                  : <><Upload className="w-3.5 h-3.5" /> Upload video or file</>
                }
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Block ────────────────────────────────────────────────────────────

function SectionBlock({
  section, courseId, index,
}: {
  section: CourseSection;
  courseId: string;
  index: number;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded]   = useState(true);
  const [editTitle, setEditTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonTitle, setLessonTitle]   = useState("");

  const { mutate: removeSection, isPending: removingSection } = useMutation({
    mutationFn: () => CoursesService.removeSection(courseId, section.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }),
  });

  const { mutate: updateTitle } = useMutation({
    mutationFn: (title: string) =>
      CoursesService.updateSection(courseId, section.id, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      setEditTitle(false);
    },
  });

  const { mutate: addLesson, isPending: addingLessonPending } = useMutation({
    mutationFn: () => CoursesService.createLesson(courseId, section.id, {
      title: lessonTitle.trim(),
      position: section.lessons.length + 1,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      setLessonTitle("");
      setAddingLesson(false);
    },
  });

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#0f1623]">
      {/* Section header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer
          hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors select-none"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-black text-blue-600 dark:text-blue-400">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
          {editTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={() => titleDraft.trim() && updateTitle(titleDraft.trim())}
              onKeyDown={e => {
                if (e.key === "Enter") titleDraft.trim() && updateTitle(titleDraft.trim());
                if (e.key === "Escape") { setTitleDraft(section.title); setEditTitle(false); }
              }}
              className="w-full text-sm font-black bg-transparent text-gray-900 dark:text-white focus:outline-none border-b border-blue-400"
            />
          ) : (
            <div className="flex items-center gap-2 group/title">
              <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">{section.title}</h3>
              <button
                onClick={() => setEditTitle(true)}
                className="opacity-0 group-hover/title:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <span className="text-[10px] text-gray-400">{section.lessons.length} lessons</span>
          <button
            onClick={() => removeSection()}
            disabled={removingSection}
            className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            {removingSection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        <motion.div animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </motion.div>
      </div>

      {/* Section body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 space-y-2 border-t border-gray-100 dark:border-white/[0.06]">
              {section.lessons.map(lesson => (
                <LessonRow key={lesson.id} lesson={lesson} courseId={courseId} sectionId={section.id} />
              ))}

              {/* Add lesson */}
              <AnimatePresence>
                {addingLesson ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        autoFocus
                        value={lessonTitle}
                        onChange={e => setLessonTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && lessonTitle.trim()) addLesson();
                          if (e.key === "Escape") { setAddingLesson(false); setLessonTitle(""); }
                        }}
                        placeholder="Lesson title…"
                        className="flex-1 px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-all"
                      />
                      <button
                        onClick={() => lessonTitle.trim() && addLesson()}
                        disabled={!lessonTitle.trim() || addingLessonPending}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-all flex items-center gap-1.5"
                      >
                        {addingLessonPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingLesson(false); setLessonTitle(""); }}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setAddingLesson(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                      border border-dashed border-blue-200 dark:border-blue-800/50
                      text-blue-600 dark:text-blue-400
                      hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all mt-2"
                  >
                    <Plus className="w-3 h-3" /> Add Lesson
                  </button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Info Tab ─────────────────────────────────────────────────────────────────

function InfoTab({ course, courseId }: { course: CourseDetail; courseId: string }) {
  const qc = useQueryClient();

  const [title, setTitle]       = useState(course.title);
  const [desc, setDesc]         = useState(course.description);
  const [price, setPrice]       = useState(String(course.price ?? ""));
  const [level, setLevel]       = useState(course.level);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags]         = useState<string[]>(course.tags ?? []);
  const [imgUploading, setImgUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () => CoursesService.update(courseId, {
      title: title.trim(),
      description: desc.trim(),
      price: parseFloat(price) || 0,
      level: level as any,
      tags,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }),
  });

  const handleImgUpload = async (file: File | null) => {
    if (!file) return;
    setImgUploading(true);
    try {
      const url = await StorageService.upload("course-images", file);
      await CoursesService.update(courseId, { img: url });
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } finally {
      setImgUploading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags(p => [...p, t]); setTagInput(""); }
  };

  return (
    <div className="space-y-6">
      {/* Thumbnail */}
      <div className="rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white">Course Thumbnail</h2>
        </div>
        <div className="p-6 flex items-center gap-5">
          <div className="w-28 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 relative">
            {course.img
              ? <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-white/40" /></div>
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload course thumbnail</p>
            <p className="text-xs text-gray-400 mb-3">JPG, PNG or WebP recommended. Min 640×360px.</p>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => handleImgUpload(e.target.files?.[0] ?? null)} />
            <button
              onClick={() => imgRef.current?.click()}
              disabled={imgUploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all disabled:opacity-50"
            >
              {imgUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {imgUploading ? "Uploading…" : "Change Image"}
            </button>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white">Course Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Title">
            <Input value={title} onChange={setTitle} placeholder="Course title…" />
          </Field>
          <Field label="Description">
            <Textarea value={desc} onChange={setDesc} placeholder="What will students learn?" rows={4} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (USD)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"><DollarSign className="w-3.5 h-3.5" /></span>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="14.99"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            </Field>
            <Field label="Level">
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
              >
                {Object.values(CourseLevel).map(l => (
                  <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tags">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                  <Tag className="w-2.5 h-2.5" />{t}
                  <button onClick={() => setTags(p => p.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter…"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <button onClick={addTag} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex-shrink-0">Add</button>
            </div>
          </Field>

          <div className="pt-2">
            <button
              onClick={() => save()}
              disabled={saving || !title.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Curriculum Tab ───────────────────────────────────────────────────────────

function CurriculumTab({ course, courseId }: { course: CourseDetail; courseId: string }) {
  const qc = useQueryClient();
  const [addingSection, setAddingSection] = useState(false);
  const [sectionTitle, setSectionTitle]   = useState("");

  const { mutate: createSection, isPending: creatingSec } = useMutation({
    mutationFn: () => CoursesService.createSection(courseId, {
      title: sectionTitle.trim(),
      position: (course.sections?.length ?? 0) + 1,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      setSectionTitle("");
      setAddingSection(false);
    },
  });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {course.sections?.length ?? 0} sections · {course.sections?.reduce((a, s) => a + s.lessons.length, 0) ?? 0} lessons
        </p>
        {!addingSection && (
          <button
            onClick={() => setAddingSection(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Section
          </button>
        )}
      </div>

      {/* Add section form */}
      <AnimatePresence>
        {addingSection && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#0f1623] border border-blue-300 dark:border-blue-500/30 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <input
                autoFocus
                value={sectionTitle}
                onChange={e => setSectionTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && sectionTitle.trim()) createSection();
                  if (e.key === "Escape") { setAddingSection(false); setSectionTitle(""); }
                }}
                placeholder="Section title, e.g. Module 1: Introduction"
                className="flex-1 text-sm font-bold bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setAddingSection(false); setSectionTitle(""); }}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => sectionTitle.trim() && createSection()}
                  disabled={!sectionTitle.trim() || creatingSec}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-all"
                >
                  {creatingSec ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sections */}
      {(course.sections ?? []).length > 0 ? (
        <div className="space-y-3">
          {course.sections.map((section, i) => (
            <SectionBlock key={section.id} section={section} courseId={courseId} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
            <Layers className="w-7 h-7 text-gray-300 dark:text-gray-600" />
          </div>
          <div>
            <p className="font-bold text-gray-500 dark:text-gray-400">No sections yet</p>
            <p className="text-sm text-gray-400 mt-1">Add a section to start building the curriculum.</p>
          </div>
          <button
            onClick={() => setAddingSection(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all"
          >
            <Plus className="w-4 h-4" /> Add First Section
          </button>
        </div>
      )}

      {(course.sections ?? []).length > 0 && (
        <button
          onClick={() => setAddingSection(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-white/25 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 flex items-center justify-center gap-2 text-sm font-bold transition-all"
        >
          <Plus className="w-4 h-4" /> Add Another Section
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorCourseManage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"info" | "curriculum">("curriculum");

  const { data: course, isLoading } = useQuery<CourseDetail>({
    queryKey: ["instructor-course", id],
    queryFn: () => CoursesService.findOne(id!) as Promise<CourseDetail>,
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
  });

  const { mutate: publish, isPending: publishing } = useMutation({
    mutationFn: () => CoursesService.publish(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", id] }),
  });

  const { mutate: archive, isPending: archiving } = useMutation({
    mutationFn: () => CoursesService.archive(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", id] }),
  });

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  const statusCfg = STATUS_STYLE[course.status] ?? STATUS_STYLE.DRAFT;
  const isPublished = course.status === "PUBLISHED";
  const isArchived  = course.status === "ARCHIVED";

  const TABS = [
    { id: "curriculum" as const, label: "Curriculum" },
    { id: "info"       as const, label: "Course Info" },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8 space-y-6 pb-16">

      {/* Header */}
      <div>
        <Link
          to="/instructor/courses"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Courses
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {course.img ? (
              <img src={course.img} alt={course.title} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 shadow-md" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-md">
                <BookOpen className="w-7 h-7 text-white/60" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                  {statusCfg.label}
                </span>
                <span className="text-xs text-gray-400">{course.level}</span>
              </div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">{course.title}</h1>
              <p className="text-xs text-gray-400 mt-0.5">${(course.price ?? 0).toFixed(2)} · {course._count?.enrollments ?? 0} enrolled</p>
            </div>
          </div>

          {/* Publish / Archive */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isArchived && (
              <button
                onClick={() => isPublished ? archive() : publish()}
                disabled={publishing || archiving}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isPublished
                    ? "border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
                }`}
              >
                {(publishing || archiving) ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublished ? <AlertTriangle className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                {isPublished ? "Archive" : "Publish"}
              </button>
            )}
            {isArchived && (
              <button
                onClick={() => publish()}
                disabled={publishing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Re-publish
              </button>
            )}
            <Link
              to={`/instructor/courses/${id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
            >
              <BookOpen className="w-4 h-4" /> View
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === t.id
                ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === "info"       && <InfoTab       course={course} courseId={id!} />}
          {tab === "curriculum" && <CurriculumTab course={course} courseId={id!} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
