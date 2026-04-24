// src/dashboards/instructor-dashboard/pages/InstructorSingleCourse.tsx
// Route: /instructor/courses/:id

import { useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Edit3, Trash2, Plus, Upload,
  ChevronDown, Loader2, CheckCircle2, Globe, DollarSign,
  Film, FileText, Paperclip, X, Save, Tag, Layers, AlertTriangle, Check, Image as ImageIcon,
  Users, Star, TrendingUp, Video, ListChecks, HelpCircle,
  Eye, EyeOff, Circle, Music, ExternalLink,
  ZoomIn, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CoursesService, { CourseLevel, MaterialType } from "@/services/course.service";
import StorageService from "@/services/storage.service";
import { APIConfig } from "@/lib/api.config";

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

// ==================== HELPERS ====================

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
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
  _count?: { enrollments?: number; sections?: number };
}

interface EnrolledStudent {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  studentAvatar: string | null;
  enrolledAt: string;
  progress: number | null;
  status: string | null;
  // Additional progress data
  lessonsCompleted?: number;
  progressPercentage?: number;
  lastActiveAt?: string;
}

interface EnrollmentsResponse {
  data: EnrolledStudent[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface EnrollmentResponseDto {
  id: string;
  courseId: string;
  enrolledAt: string;
  student: { id: string; name: string; image: string | null };
  lessonsCompleted?: number;
  progressPercentage?: number;
  lastActiveAt?: string;
}

// ─── Quiz types (local-state only) ───────────────────────────────────────────

interface QuizOption   { id: string; text: string; }
interface QuizQuestion { id: string; question: string; options: QuizOption[]; correctOptionId: string; }
interface InlineQuiz   { id: string; title: string; passMark: number; isPublished: boolean; questions: QuizQuestion[]; }

// ─── Preview types ────────────────────────────────────────────────────────────

type PreviewFileType = "video" | "audio" | "image" | "pdf" | "other";

interface PreviewItem {
  url: string;
  title: string;
  fileType: PreviewFileType;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function materialTypeFromFile(file: File): MaterialType {
  if (file.type.startsWith("video/")) return MaterialType.VIDEO;
  if (file.type.startsWith("audio/")) return MaterialType.AUDIO;
  return MaterialType.DOCUMENT;
}

function resolvePreviewType(apiType: string, fileName: string | null): PreviewFileType {
  if (apiType === "VIDEO") return "video";
  if (apiType === "AUDIO") return "audio";
  const ext = (fileName ?? "").split(".").pop()?.toLowerCase() ?? "";
  if (["jpg","jpeg","png","gif","webp","svg","avif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "other";
}

function mapEnrollmentDto(dto: EnrollmentResponseDto): EnrolledStudent {
  return {
    id: dto.id,
    studentId: dto.student.id,
    studentName: dto.student.name,
    studentEmail: null,
    studentAvatar: dto.student.image ?? null,
    enrolledAt: dto.enrolledAt,
    progress: dto.progressPercentage ?? null,
    status: null,
    // Map progress data from backend
    lessonsCompleted: dto.lessonsCompleted,
    progressPercentage: dto.progressPercentage,
    lastActiveAt: dto.lastActiveAt,
  };
}

// ─── Status / icon config ─────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:     { label: "Draft",     color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-900/20",     border: "border-amber-200 dark:border-amber-800/40" },
  PUBLISHED: { label: "Published", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/40" },
  ARCHIVED:  { label: "Archived",  color: "text-gray-500 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-white/[0.05]",     border: "border-gray-200 dark:border-white/[0.08]" },
};

const MATERIAL_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  VIDEO:    { icon: <Film className="w-3.5 h-3.5" />,      color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-100 dark:bg-blue-900/30" },
  DOCUMENT: { icon: <FileText className="w-3.5 h-3.5" />,  color: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-100 dark:bg-sky-900/30" },
  AUDIO:    { icon: <Music className="w-3.5 h-3.5" />,     color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-100 dark:bg-violet-900/30" },
  LINK:     { icon: <Globe className="w-3.5 h-3.5" />,     color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  OTHER:    { icon: <Paperclip className="w-3.5 h-3.5" />, color: "text-gray-500 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-white/[0.06]" },
};

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ─── File Previewer Modal ─────────────────────────────────────────────────────

function FilePreviewModal({
  items,
  startIndex,
  onClose,
}: {
  items: PreviewItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const item = items[idx];
  const canPrev = idx > 0;
  const canNext = idx < items.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-[#0a0f1a] border border-white/[0.08] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{item.title}</p>
            {items.length > 1 && (
              <p className="text-[10px] text-white/30">{idx + 1} / {items.length}</p>
            )}
          </div>
          <a href={item.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white/60 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </a>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/60 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0 flex items-center justify-center bg-black/40">
          {item.fileType === "video" && (
            <video key={item.url} src={item.url} controls autoPlay className="max-w-full max-h-[70vh] rounded-lg" />
          )}
          {item.fileType === "audio" && (
            <div className="flex flex-col items-center gap-6 p-12">
              <div className="w-24 h-24 rounded-3xl bg-violet-900/40 flex items-center justify-center">
                <Music className="w-10 h-10 text-violet-400" />
              </div>
              <p className="text-white/70 font-semibold text-sm">{item.title}</p>
              <audio key={item.url} src={item.url} controls autoPlay className="w-72" />
            </div>
          )}
          {item.fileType === "image" && (
            <img src={item.url} alt={item.title} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
          )}
          {item.fileType === "pdf" && (
            <iframe src={item.url} title={item.title} className="w-full h-[70vh]" />
          )}
          {item.fileType === "other" && (
            <div className="flex flex-col items-center gap-5 p-12 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.05] flex items-center justify-center">
                <FileText className="w-9 h-9 text-white/30" />
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Preview not available for this file type.</p>
                <p className="text-white/30 text-xs">{item.title}</p>
              </div>
              <a href={item.url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">
                <ExternalLink className="w-4 h-4" /> Open File
              </a>
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        {items.length > 1 && (
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-3 pointer-events-none">
            <button
              onClick={e => { e.stopPropagation(); if (canPrev) setIdx(i => i - 1); }}
              disabled={!canPrev}
              className="pointer-events-auto w-9 h-9 rounded-full bg-black/60 border border-white/[0.12] flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 disabled:opacity-20 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); if (canNext) setIdx(i => i + 1); }}
              disabled={!canNext}
              className="pointer-events-auto w-9 h-9 rounded-full bg-black/60 border border-white/[0.12] flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 disabled:opacity-20 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Thumbnail strip */}
        {items.length > 1 && (
          <div className="flex gap-2 px-4 py-3 border-t border-white/[0.08] overflow-x-auto flex-shrink-0">
            {items.map((it, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === idx ? "border-blue-500" : "border-transparent opacity-50 hover:opacity-80"
                }`}>
                {it.fileType === "image"
                  ? <img src={it.url} alt="" className="w-full h-full object-cover" />
                  : (
                    <div className="w-full h-full bg-white/[0.06] flex items-center justify-center">
                      {it.fileType === "video" && <Film className="w-4 h-4 text-white/50" />}
                      {it.fileType === "audio" && <Music className="w-4 h-4 text-white/50" />}
                      {it.fileType === "pdf"   && <FileText className="w-4 h-4 text-white/50" />}
                      {it.fileType === "other" && <Paperclip className="w-4 h-4 text-white/50" />}
                    </div>
                  )
                }
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Lesson Row (Curriculum — videos only) ────────────────────────────────────

function LessonRow({ lesson, courseId, sectionId }: {
  lesson: CourseLesson; courseId: string; sectionId: string;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded]     = useState(false);
  const [editTitle, setEditTitle]   = useState(false);
  const [titleDraft, setTitleDraft] = useState(lesson.title);
  const [uploading, setUploading]   = useState(false);
  const [preview, setPreview]       = useState<{ items: PreviewItem[]; index: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { mutate: removeLesson, isPending: removingLesson } = useMutation({
    mutationFn: () => CoursesService.removeLesson(courseId, sectionId, lesson.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }),
  });

  const { mutate: updateTitle } = useMutation({
    mutationFn: (title: string) => CoursesService.updateLesson(courseId, sectionId, lesson.id, { title }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }); setEditTitle(false); },
  });

  const { mutate: removeMaterial } = useMutation({
    mutationFn: (materialId: string) => CoursesService.removeMaterial(courseId, sectionId, lesson.id, materialId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }),
  });

  // Curriculum = video only
  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("video/")) continue;
        const url = await StorageService.upload("course-videos", file);
        await CoursesService.addMaterial(courseId, sectionId, lesson.id, {
          type:     MaterialType.VIDEO,
          title:    file.name.replace(/\.[^/.]+$/, ""),
          url,
          fileName: file.name,
          size:     file.size,
        });
      }
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } finally {
      setUploading(false);
    }
  };

  const videoMaterials = lesson.materials.filter(m => m.type === "VIDEO");
  const previewItems: PreviewItem[] = videoMaterials.map(m => ({
    url: m.url, title: m.title, fileType: "video",
  }));

  return (
    <>
      <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/60 dark:bg-white/[0.02]">
          <button onClick={() => setExpanded(p => !p)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </motion.div>
            {editTitle ? (
              <input
                autoFocus value={titleDraft}
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
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{lesson.title}</span>
            )}
            {videoMaterials.length > 0 && (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-md flex-shrink-0">
                {videoMaterials.length} video{videoMaterials.length !== 1 ? "s" : ""}
              </span>
            )}
          </button>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setEditTitle(p => !p)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => removeLesson()} disabled={removingLesson}
              className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              {removingLesson ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="px-4 pb-4 pt-3 space-y-2">
                {videoMaterials.length > 0 ? videoMaterials.map((mat, matIdx) => (
                  <div key={mat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.05] group">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Film className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{mat.title}</p>
                      {mat.size && <p className="text-[10px] text-gray-400">{formatSize(mat.size)}</p>}
                    </div>
                    <button
                      onClick={() => setPreview({ items: previewItems, index: matIdx })}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-blue-500 transition-all flex-shrink-0">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeMaterial(mat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )) : (
                  <p className="text-xs text-gray-400 italic py-1">No videos yet.</p>
                )}
                <input ref={fileRef} type="file" accept="video/*" multiple className="hidden"
                  onChange={e => handleUpload(e.target.files)} />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-gray-500 text-xs font-bold hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 disabled:opacity-50 transition-all">
                  {uploading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                    : <><Upload className="w-3.5 h-3.5" /> Upload video</>
                  }
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {preview && (
        <FilePreviewModal items={preview.items} startIndex={preview.index} onClose={() => setPreview(null)} />
      )}
    </>
  );
}

// ─── Section Block (Curriculum) ───────────────────────────────────────────────

function SectionBlock({ section, courseId, index }: {
  section: CourseSection; courseId: string; index: number;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded]       = useState(true);
  const [editTitle, setEditTitle]     = useState(false);
  const [titleDraft, setTitleDraft]   = useState(section.title);
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonTitle, setLessonTitle]   = useState("");

  const { mutate: removeSection, isPending: removingSection } = useMutation({
    mutationFn: () => CoursesService.removeSection(courseId, section.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }),
  });

  const { mutate: updateTitle } = useMutation({
    mutationFn: (title: string) => CoursesService.updateSection(courseId, section.id, { title }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }); setEditTitle(false); },
  });

  const { mutate: addLesson, isPending: addingLessonPending } = useMutation({
    mutationFn: () => CoursesService.createLesson(courseId, section.id, {
      title:    lessonTitle.trim(),
      position: section.lessons.length + 1,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      setLessonTitle(""); setAddingLesson(false);
    },
  });

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#0f1623]">
      <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors select-none"
        onClick={() => setExpanded(p => !p)}>
        <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-black text-blue-600 dark:text-blue-400">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
          {editTitle ? (
            <input autoFocus value={titleDraft}
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
              <button onClick={() => setEditTitle(true)}
                className="opacity-0 group-hover/title:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all">
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <span className="text-[10px] text-gray-400">{section.lessons.length} lessons</span>
          <button onClick={() => removeSection()} disabled={removingSection}
            className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            {removingSection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
        <motion.div animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-4 pt-1 space-y-2 border-t border-gray-100 dark:border-white/[0.06]">
              {section.lessons.map(lesson => (
                <LessonRow key={lesson.id} lesson={lesson} courseId={courseId} sectionId={section.id} />
              ))}
              <AnimatePresence>
                {addingLesson ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex items-center gap-2 mt-2">
                      <input autoFocus value={lessonTitle}
                        onChange={e => setLessonTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && lessonTitle.trim()) addLesson();
                          if (e.key === "Escape") { setAddingLesson(false); setLessonTitle(""); }
                        }}
                        placeholder="Lesson title…"
                        className="flex-1 px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-all"
                      />
                      <button onClick={() => lessonTitle.trim() && addLesson()}
                        disabled={!lessonTitle.trim() || addingLessonPending}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-all flex items-center gap-1.5">
                        {addingLessonPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Add
                      </button>
                      <button onClick={() => { setAddingLesson(false); setLessonTitle(""); }}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button onClick={() => setAddingLesson(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-dashed border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all mt-2">
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

// ─── Curriculum Tab ───────────────────────────────────────────────────────────

function CurriculumTab({ course, courseId }: { course: CourseDetail; courseId: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [addingSection, setAddingSection] = useState(false);
  const [sectionTitle, setSectionTitle]   = useState("");

  const { mutate: createSection, isPending: creatingSec } = useMutation({
    mutationFn: () => CoursesService.createSection(courseId, {
      title:    sectionTitle.trim(),
      position: (course.sections?.length ?? 0) + 1,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      setSectionTitle(""); setAddingSection(false);
    },
  });

  const totalLessons = (course.sections ?? []).reduce((a, s) => a + s.lessons.length, 0);
  const totalVideos  = (course.sections ?? []).reduce((a, s) =>
    a + s.lessons.reduce((b, l) => b + l.materials.filter(m => m.type === "VIDEO").length, 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-gray-400">
          {course.sections?.length ?? 0} sections · {totalLessons} lessons · {totalVideos} videos
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/instructor/upload-video`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
            <Video className="w-3.5 h-3.5" /> Bulk Upload
          </button>
          {!addingSection && (
            <button onClick={() => setAddingSection(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Section
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {addingSection && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#0f1623] border border-blue-300 dark:border-blue-500/30 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <input autoFocus value={sectionTitle}
                onChange={e => setSectionTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && sectionTitle.trim()) createSection();
                  if (e.key === "Escape") { setAddingSection(false); setSectionTitle(""); }
                }}
                placeholder="Section title, e.g. Module 1: Introduction"
                className="flex-1 text-sm font-bold bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <button onClick={() => { setAddingSection(false); setSectionTitle(""); }}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-all">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={() => sectionTitle.trim() && createSection()}
                  disabled={!sectionTitle.trim() || creatingSec}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-all">
                  {creatingSec ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(course.sections ?? []).length > 0 ? (
        <div className="space-y-3">
          {course.sections.map((section, i) => (
            <SectionBlock key={section.id} section={section} courseId={courseId} index={i} />
          ))}
          <button onClick={() => setAddingSection(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-white/25 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 flex items-center justify-center gap-2 text-sm font-bold transition-all">
            <Plus className="w-4 h-4" /> Add Another Section
          </button>
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
          <button onClick={() => setAddingSection(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all">
            <Plus className="w-4 h-4" /> Add First Section
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Editor Modal ────────────────────────────────────────────────────────

function QuizEditorModal({
  quiz, onSave, onClose,
}: { quiz: InlineQuiz | null; onClose: () => void; onSave: (q: InlineQuiz) => void }) {
  const [title, setTitle]         = useState(quiz?.title ?? "");
  const [passMark, setPassMark]   = useState(quiz?.passMark ?? 70);
  const [questions, setQuestions] = useState<QuizQuestion[]>(quiz?.questions ?? []);
  const [isPublished, setIsPublished] = useState(quiz?.isPublished ?? false);

  const addQuestion = () => setQuestions(p => [...p, {
    id: `qq-${Date.now()}`, question: "",
    options: [{ id: "o-1", text: "" }, { id: "o-2", text: "" }, { id: "o-3", text: "" }, { id: "o-4", text: "" }],
    correctOptionId: "o-1",
  }]);

  const updateQuestion = (id: string, upd: Partial<QuizQuestion>) =>
    setQuestions(p => p.map(q => q.id === id ? { ...q, ...upd } : q));

  const updateOption = (qId: string, oId: string, text: string) =>
    setQuestions(p => p.map(q =>
      q.id !== qId ? q : { ...q, options: q.options.map(o => o.id === oId ? { ...o, text } : o) }
    ));

  const handleSave = () => {
    if (!title.trim() || questions.length === 0) return;
    onSave({ id: quiz?.id ?? `q-${Date.now()}`, title, passMark, questions, isPublished });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl my-8 bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-white text-sm">{quiz ? "Edit Quiz" : "New Quiz"}</h2>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Local state only · wire up endpoint to persist</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Quiz Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Module 1 Knowledge Check"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Pass Mark (%)</label>
              <input type="number" min={0} max={100} value={passMark} onChange={e => setPassMark(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700 dark:text-white/70">Questions ({questions.length})</p>
              <button onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all">
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
            <AnimatePresence>
              {questions.map((q, qi) => (
                <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/[0.06] flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-white/30">Q{qi + 1}</span>
                    <input value={q.question} onChange={e => updateQuestion(q.id, { question: e.target.value })}
                      placeholder="Enter question text…"
                      className="flex-1 text-sm font-semibold bg-transparent text-gray-800 dark:text-white placeholder:text-gray-300 focus:outline-none" />
                    <button onClick={() => setQuestions(p => p.filter(x => x.id !== q.id))}
                      className="p-1 text-gray-300 dark:text-white/20 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-2">
                    {q.options.map(opt => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button onClick={() => updateQuestion(q.id, { correctOptionId: opt.id })}
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                            q.correctOptionId === opt.id ? "border-emerald-500 bg-emerald-500" : "border-gray-300 dark:border-white/20"
                          }`}>
                          {q.correctOptionId === opt.id && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <input value={opt.text} onChange={e => updateOption(q.id, opt.id, e.target.value)}
                          placeholder={`Option ${opt.id.replace("o-", "")}`}
                          className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {questions.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-gray-300 dark:text-white/20">
                <HelpCircle className="w-8 h-8 opacity-30" />
                <p className="text-sm">No questions yet.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.07]">
            <button onClick={() => setIsPublished(p => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                isPublished
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                  : "border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-white/30"
              }`}>
              {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {isPublished ? "Published" : "Draft"}
            </button>
            <button onClick={handleSave} disabled={!title.trim() || questions.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-30 transition-all">
              <Save className="w-4 h-4" /> Save Quiz
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Materials Section Block ──────────────────────────────────────────────────

interface MaterialsSectionState {
  sectionId:    string;
  sectionTitle: string;
  position:     number;
  lessons:      CourseLesson[];
  quizzes:      InlineQuiz[];
}

function MaterialsSectionBlock({
  sec, courseId, onQuizzesChange,
}: {
  sec: MaterialsSectionState;
  courseId: string;
  onQuizzesChange: (sectionId: string, quizzes: InlineQuiz[]) => void;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded]       = useState(true);
  const [subTab, setSubTab]           = useState<"files" | "quizzes">("files");
  const [editingQuiz, setEditingQuiz] = useState<InlineQuiz | null | "new">(null);
  const [preview, setPreview]         = useState<{ items: PreviewItem[]; index: number } | null>(null);
  const [uploading, setUploading]     = useState<Record<string, boolean>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const allNonVideo = sec.lessons.flatMap(l => l.materials.filter(m => m.type !== "VIDEO"));

  const SUB_TABS = [
    { id: "files"   as const, label: "Files",   count: allNonVideo.length },
    { id: "quizzes" as const, label: "Quizzes", count: sec.quizzes.length },
  ];

  const handleUpload = async (lessonId: string, files: File[]) => {
    const validFiles = files.filter(f => !f.type.startsWith("video/"));
    if (!validFiles.length) return;
    setUploading(p => ({ ...p, [lessonId]: true }));
    try {
      for (const file of validFiles) {
        const url = await StorageService.upload("assignments", file);
        await CoursesService.addMaterial(courseId, sec.sectionId, lessonId, {
          type:     materialTypeFromFile(file),
          title:    file.name.replace(/\.[^/.]+$/, ""),
          url,
          fileName: file.name,
          size:     file.size,
        });
      }
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } finally {
      setUploading(p => ({ ...p, [lessonId]: false }));
    }
  };

  const handleDelete = async (lessonId: string, materialId: string) => {
    await CoursesService.removeMaterial(courseId, sec.sectionId, lessonId, materialId);
    qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
  };

  const saveQuiz = (quiz: InlineQuiz) => {
    const exists  = sec.quizzes.some(q => q.id === quiz.id);
    const updated = exists
      ? sec.quizzes.map(q => q.id === quiz.id ? quiz : q)
      : [...sec.quizzes, quiz];
    onQuizzesChange(sec.sectionId, updated);
    setEditingQuiz(null);
  };

  const buildPreviewItems = (mats: CourseMaterial[]): PreviewItem[] =>
    mats.filter(m => m.type !== "VIDEO").map(m => ({
      url:      m.url,
      title:    m.title,
      fileType: resolvePreviewType(m.type, m.fileName),
    }));

  return (
    <>
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#0f1623]">
        {/* Section header */}
        <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors select-none"
          onClick={() => setExpanded(p => !p)}>
          <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{sec.position}</span>
          </div>
          <h3 className="flex-1 text-sm font-black text-gray-900 dark:text-white truncate">{sec.sectionTitle}</h3>
          <div className="flex items-center gap-1.5 text-[10px] font-bold flex-shrink-0">
            {allNonVideo.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400">
                {allNonVideo.length} files
              </span>
            )}
            {sec.quizzes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                {sec.quizzes.length}q
              </span>
            )}
          </div>
          <motion.div animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="border-t border-gray-100 dark:border-white/[0.06]">

                {/* Sub-tabs */}
                <div className="flex gap-0.5 px-5 pt-3">
                  {SUB_TABS.map(t => (
                    <button key={t.id} onClick={() => setSubTab(t.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                        subTab === t.id
                          ? "text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                          : "text-gray-400 dark:text-white/25 border-transparent hover:text-gray-600 dark:hover:text-white/50"
                      }`}>
                      {t.label}
                      {t.count > 0 && (
                        <span className={`px-1.5 rounded-full text-[10px] font-black ${
                          subTab === t.id
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-white/30"
                        }`}>{t.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="px-5 pb-5 pt-3">
                  <AnimatePresence mode="wait">

                    {/* Files — grouped by lesson */}
                    {subTab === "files" && (
                      <motion.div key="files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        {sec.lessons.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-10 text-gray-300 dark:text-white/20 text-center">
                            <Paperclip className="w-7 h-7 opacity-40" />
                            <p className="text-sm">No lessons yet — add lessons in the Curriculum tab first.</p>
                          </div>
                        )}
                        {sec.lessons.map(lesson => {
                          const nonVideoMats  = lesson.materials.filter(m => m.type !== "VIDEO");
                          const previewItems  = buildPreviewItems(lesson.materials);
                          const isUploading   = uploading[lesson.id] ?? false;

                          return (
                            <div key={lesson.id} className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
                              {/* Lesson label */}
                              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/60 dark:bg-white/[0.02]">
                                <Film className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex-1 truncate">{lesson.title}</span>
                                {nonVideoMats.length > 0 && (
                                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-1.5 py-0.5 rounded-md">
                                    {nonVideoMats.length}
                                  </span>
                                )}
                              </div>

                              <div className="px-4 pb-3 pt-2 space-y-1.5">
                                <AnimatePresence>
                                  {nonVideoMats.map((mat, matIdx) => {
                                    const iconMeta  = MATERIAL_ICONS[mat.type] ?? MATERIAL_ICONS.OTHER;
                                    const fileType  = resolvePreviewType(mat.type, mat.fileName);
                                    return (
                                      <motion.div key={mat.id}
                                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.05] group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        {/* Image thumbnail, else type icon */}
                                        <div className={`w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 ${iconMeta.bg} ${iconMeta.color}`}>
                                          {fileType === "image"
                                            ? <img src={mat.url} alt="" className="w-full h-full object-cover" />
                                            : iconMeta.icon
                                          }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{mat.title}</p>
                                          <p className="text-[10px] text-gray-400">{mat.type}{mat.size ? ` · ${formatSize(mat.size)}` : ""}</p>
                                        </div>
                                        <button
                                          onClick={() => setPreview({ items: previewItems, index: matIdx })}
                                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-blue-500 transition-all flex-shrink-0">
                                          <ZoomIn className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete(lesson.id, mat.id)}
                                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </motion.div>
                                    );
                                  })}
                                </AnimatePresence>

                                {nonVideoMats.length === 0 && !isUploading && (
                                  <p className="text-xs text-gray-400 italic py-1 px-1">No files for this lesson yet.</p>
                                )}

                                {/* Upload zone */}
                                <input
                                  ref={el => { fileRefs.current[lesson.id] = el; }}
                                  type="file" multiple
                                  accept="image/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.apk,*/*"
                                  className="hidden"
                                  onChange={e => { if (e.target.files) handleUpload(lesson.id, Array.from(e.target.files)); }}
                                />
                                <button
                                  onClick={() => fileRefs.current[lesson.id]?.click()}
                                  disabled={isUploading}
                                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-gray-500 text-xs font-bold hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 disabled:opacity-50 transition-all">
                                  {isUploading
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                                    : <><Upload className="w-3.5 h-3.5" /> Add image, audio, PDF, doc…</>
                                  }
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* Quizzes */}
                    {subTab === "quizzes" && (
                      <motion.div key="quizzes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        {sec.quizzes.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-8 text-gray-300 dark:text-white/20">
                            <HelpCircle className="w-7 h-7 opacity-40" />
                            <p className="text-sm">No quizzes in this section.</p>
                          </div>
                        )}
                        <AnimatePresence>
                          {sec.quizzes.map(quiz => (
                            <motion.div key={quiz.id}
                              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.02] group transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                <ListChecks className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{quiz.title}</p>
                                <p className="text-xs text-gray-400">{quiz.questions.length} questions · {quiz.passMark}% pass</p>
                              </div>
                              {quiz.isPublished
                                ? <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Live</span>
                                : <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Circle className="w-3 h-3" />Draft</span>
                              }
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingQuiz(quiz)}
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onQuizzesChange(sec.sectionId, sec.quizzes.filter(q => q.id !== quiz.id))}
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <button onClick={() => setEditingQuiz("new")}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all w-full text-sm font-bold">
                          <Plus className="w-4 h-4" /> Add Quiz
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {preview && (
        <FilePreviewModal items={preview.items} startIndex={preview.index} onClose={() => setPreview(null)} />
      )}

      <AnimatePresence>
        {editingQuiz !== null && (
          <QuizEditorModal
            quiz={editingQuiz === "new" ? null : editingQuiz}
            onClose={() => setEditingQuiz(null)}
            onSave={saveQuiz}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Materials Tab ────────────────────────────────────────────────────────────

function MaterialsTab({ course, courseId }: { course: CourseDetail; courseId: string }) {
  const [quizzesBySectionId, setQuizzesBySectionId] = useState<Record<string, InlineQuiz[]>>({});

  const sections: MaterialsSectionState[] = (course.sections ?? []).map(s => ({
    sectionId:    s.id,
    sectionTitle: s.title,
    position:     s.position,
    lessons:      s.lessons,
    quizzes:      quizzesBySectionId[s.id] ?? [],
  }));

  const totalFiles   = sections.reduce((a, s) =>
    a + s.lessons.reduce((b, l) => b + l.materials.filter(m => m.type !== "VIDEO").length, 0), 0);
  const totalQuizzes = sections.reduce((a, s) => a + s.quizzes.length, 0);
  const totalLessons = sections.reduce((a, s) => a + s.lessons.length, 0);

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Sections", val: sections.length, color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20",   icon: <Layers className="w-4 h-4" /> },
          { label: "Lessons",  val: totalLessons,    color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: <Film className="w-4 h-4" /> },
          { label: "Files",    val: totalFiles,      color: "text-sky-600 dark:text-sky-400",     bg: "bg-sky-50 dark:bg-sky-900/20",     icon: <Paperclip className="w-4 h-4" /> },
          { label: "Quizzes",  val: totalQuizzes,    color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", icon: <ListChecks className="w-4 h-4" /> },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-xl bg-white dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0 ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/[0.07] border border-amber-200 dark:border-amber-500/20">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-200/60">
          <strong>Quizzes</strong> are local state only — wire up{" "}
          <code className="font-mono text-[11px]">POST /courses/:id/sections/:sectionId/quizzes</code> to persist them.
          All other files upload to the API instantly.
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
            <Paperclip className="w-7 h-7 text-gray-300 dark:text-gray-600" />
          </div>
          <div>
            <p className="font-bold text-gray-500 dark:text-gray-400">No sections yet</p>
            <p className="text-sm text-gray-400 mt-1">Create sections and lessons in the Curriculum tab first.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map(sec => (
            <MaterialsSectionBlock
              key={sec.sectionId}
              sec={sec}
              courseId={courseId}
              onQuizzesChange={(sectionId, quizzes) =>
                setQuizzesBySectionId(p => ({ ...p, [sectionId]: quizzes }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ course, courseId }: { course: CourseDetail; courseId: string }) {
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
      title: title.trim(), description: desc.trim(),
      price: parseFloat(price) || 0, level: level as any, tags,
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
    } finally { setImgUploading(false); }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags(p => [...p, t]); setTagInput(""); }
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white">Course Thumbnail</h2>
        </div>
        <div className="p-6 flex items-center gap-5">
          <div className="w-28 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0">
            {course.img
              ? <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-white/40" /></div>
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload course thumbnail</p>
            <p className="text-xs text-gray-400 mb-3">JPG, PNG or WebP · min 640×360px</p>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => handleImgUpload(e.target.files?.[0] ?? null)} />
            <button onClick={() => imgRef.current?.click()} disabled={imgUploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all disabled:opacity-50">
              {imgUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {imgUploading ? "Uploading…" : "Change Image"}
            </button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white">Course Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Title">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course title…"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
          </Field>
          <Field label="Description">
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="What will students learn?"
              className="w-full px-4 py-2.5 rounded-xl text-sm resize-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (USD)">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="14.99"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
              </div>
            </Field>
            <Field label="Level">
              <select value={level} onChange={e => setLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all">
                {Object.values(CourseLevel).map(l => (
                  <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </Field>
          </div>
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
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter…"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
              <button onClick={addTag} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex-shrink-0">Add</button>
            </div>
          </Field>
          <div className="pt-2">
            <button onClick={() => save()} disabled={saving || !title.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-all">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Students Tab ─────────────────────────────────────────────────────────────

function StudentsTab({ course }: { course: CourseDetail }) {
  const { data: enrollmentData, isLoading: enrollmentsLoading, isError } =
    useQuery<EnrollmentsResponse>({
      queryKey: ["course-enrollments", course.id],
      queryFn: async (): Promise<EnrollmentsResponse> => {
        const response = await APIConfig.fetch(`/enrollments/course/${course.id}`);
        if (!response.ok) throw new Error("Failed to fetch enrollments");
        const raw: EnrollmentResponseDto[] = await response.json();
        const data = raw.map(mapEnrollmentDto);
        return { data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } };
      },
      staleTime: 1000 * 60 * 3,
    });

  const students = enrollmentData?.data ?? [];
  const total    = enrollmentData?.meta?.total ?? course._count?.enrollments ?? 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <Users className="w-3.5 h-3.5 text-white" />
        </div>
        <h2 className="text-sm font-black text-gray-900 dark:text-white">Enrolled Students</h2>
        <span className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">
          {total} enrolled
        </span>
      </div>
      <div className="p-6">
        {enrollmentsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-50 dark:bg-red-500/[0.07] border border-red-200 dark:border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">Failed to load students. Please try again.</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
              <Users className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <div>
              <p className="font-bold text-gray-500 dark:text-gray-400">No students enrolled yet</p>
              <p className="text-sm text-gray-400 mt-1">Students will appear here once they enroll.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {students.map(student => (
              <div key={student.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  {student.studentAvatar
                    ? <img src={student.studentAvatar} alt={student.studentName} className="w-full h-full object-cover" />
                    : <span className="text-xs font-black text-white">{student.studentName?.charAt(0)?.toUpperCase() ?? "S"}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{student.studentName}</p>
                  {student.studentEmail && <p className="text-xs text-gray-400 truncate">{student.studentEmail}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    {student.lessonsCompleted != null && (
                      <p className="text-xs text-gray-400">
                        <span className="font-medium">{student.lessonsCompleted}</span> lessons completed
                      </p>
                    )}
                    {student.lastActiveAt && (
                      <p className="text-xs text-gray-400">
                        Last active: {formatRelativeTime(student.lastActiveAt)}
                      </p>
                    )}
                  </div>
                </div>
                {student.progress != null && (
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                          style={{ width: `${Math.min(student.progress, 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{student.progress}%</span>
                    </div>
                    {student.enrolledAt && (
                      <span className="text-[10px] text-gray-400">
                        Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function InstructorSingleCourse() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"curriculum" | "materials" | "overview" | "students">("curriculum");

  const { data: course, isLoading } = useQuery<CourseDetail>({
    queryKey: ["instructor-course", id],
    queryFn:  () => CoursesService.findOne(id!) as Promise<CourseDetail>,
    enabled:  !!id,
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

  const statusCfg    = STATUS_STYLE[course.status] ?? STATUS_STYLE.DRAFT;
  const isPublished  = course.status === "PUBLISHED";
  const isArchived   = course.status === "ARCHIVED";
  const enrollments  = course._count?.enrollments ?? 0;
  const totalLessons = (course.sections ?? []).reduce((a, s) => a + s.lessons.length, 0);
  const totalMats    = (course.sections ?? []).reduce((a, s) =>
    a + s.lessons.reduce((b, l) => b + l.materials.filter(m => m.type !== "VIDEO").length, 0), 0);

  const TABS = [
    { id: "curriculum" as const, label: "Curriculum", count: totalLessons > 0 ? `${totalLessons}` : undefined },
    { id: "materials"  as const, label: "Materials",  count: totalMats    > 0 ? `${totalMats}`    : undefined },
    { id: "overview"   as const, label: "Course Info" },
    { id: "students"   as const, label: "Students",   count: enrollments  > 0 ? `${enrollments}`  : undefined },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8 space-y-6 pb-16">

      <Link to="/instructor/courses"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Courses
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">

        <div className="h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
          {course.img && <img src={course.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8 mb-5">
            <div className="relative z-10 w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 ring-4 ring-white dark:ring-[#0f1623] shadow-lg">
              {course.img ? <img src={course.img} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-7 h-7 text-white/60" />}
            </div>
            <div className="flex-1 sm:pb-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                  {statusCfg.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400">
                  {course.level}
                </span>
                {course.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/10 text-blue-600 dark:text-blue-400">{course.badge}</span>
                )}
              </div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white truncate">{course.title}</h1>
              <p className="text-xs text-gray-400 mt-0.5">${(course.price ?? 0).toFixed(2)} · {enrollments} enrolled</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!isArchived && (
                <button onClick={() => isPublished ? archive() : publish()} disabled={publishing || archiving}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isPublished
                      ? "border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
                  }`}>
                  {(publishing || archiving) ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublished ? <AlertTriangle className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  {isPublished ? "Archive" : "Publish"}
                </button>
              )}
              {isArchived && (
                <button onClick={() => publish()} disabled={publishing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Re-publish
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-gray-100 dark:border-white/[0.06]">
            {[
              { icon: Users,      val: String(enrollments),                  sub: "Students"  },
              { icon: Layers,     val: String(course.sections?.length ?? 0), sub: "Sections"  },
              { icon: Star,       val: String(totalLessons),                 sub: "Lessons"   },
              { icon: TrendingUp, val: `$${(course.price ?? 0).toFixed(0)}`, sub: "Price"    },
            ].map(({ icon: Icon, val, sub }) => (
              <div key={sub} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-none">{val}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              tab === t.id
                ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}>
            {t.label}
            {t.count && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === "curriculum" && <CurriculumTab course={course} courseId={id!} />}
          {tab === "materials"  && <MaterialsTab  course={course} courseId={id!} />}
          {tab === "overview"   && <OverviewTab   course={course} courseId={id!} />}
          {tab === "students"   && <StudentsTab   course={course} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default InstructorSingleCourse;