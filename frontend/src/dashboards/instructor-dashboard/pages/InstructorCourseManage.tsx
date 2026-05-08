// src/dashboards/instructor-dashboard/pages/InstructorSingleCourse.tsx
// Route: /instructor/courses/:id

import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Edit3, Trash2, Plus, Upload,
  ChevronDown, Loader2, CheckCircle2, Globe, DollarSign,
  Film, FileText, Paperclip, X, Save, Tag, Layers, AlertTriangle, Check, Image as ImageIcon,
  Users, Star, TrendingUp, ListChecks, HelpCircle,
  Eye, EyeOff, Music, ExternalLink,
  ZoomIn, ChevronLeft, ChevronRight, GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import CoursesService, { CourseLevel, MaterialType } from "@/services/course.service";
import StorageService from "@/services/storage.service";
import QuizService, { type CreateQuizPayload } from "@/services/quiz.service";
import { APIConfig } from "@/lib/api.config";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseMaterial {
  id: string;
  type: string;
  title: string;
  url: string | undefined;
  note: string | undefined;
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
  return MaterialType.PDF;
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
  VIDEO: { icon: <Film className="w-3.5 h-3.5" />,         color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-100 dark:bg-blue-900/30" },
  PDF:   { icon: <FileText className="w-3.5 h-3.5" />,     color: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-100 dark:bg-sky-900/30" },
  AUDIO: { icon: <Music className="w-3.5 h-3.5" />,        color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-100 dark:bg-violet-900/30" },
  LINK:  { icon: <Globe className="w-3.5 h-3.5" />,        color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  TEXT:  { icon: <FileText className="w-3.5 h-3.5" />,     color: "text-indigo-600 dark:text-indigo-400",   bg: "bg-indigo-100 dark:bg-indigo-900/30" },
  QUIZ:  { icon: <ListChecks className="w-3.5 h-3.5" />,   color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-100 dark:bg-amber-900/30" },
  OTHER: { icon: <Paperclip className="w-3.5 h-3.5" />,    color: "text-gray-500 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-white/[0.06]" },
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

function LessonRow({ lesson, courseId, sectionId, isDragOverlay = false }: {
  lesson: CourseLesson; courseId: string; sectionId: string; isDragOverlay?: boolean;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded]               = useState(false);
  const [editTitle, setEditTitle]             = useState(false);
  const [titleDraft, setTitleDraft]           = useState(lesson.title);
  const [editDescription, setEditDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(lesson.description ?? "");
  const [uploading, setUploading]             = useState(false);
  const [uploadProgress, setUploadProgress]   = useState(0);
  const [removingIds, setRemovingIds]         = useState<Set<string>>(new Set());
  const [preview, setPreview]                 = useState<{ items: PreviewItem[]; index: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id, disabled: isDragOverlay });

  const { mutate: removeLesson, isPending: removingLesson } = useMutation({
    mutationFn: () => CoursesService.removeLesson(courseId, sectionId, lesson.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }),
  });

  const { mutate: updateTitle } = useMutation({
    mutationFn: (title: string) => CoursesService.updateLesson(courseId, sectionId, lesson.id, { title }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }); setEditTitle(false); },
  });

  const { mutate: updateDescription } = useMutation({
    mutationFn: (description: string) => CoursesService.updateLesson(courseId, sectionId, lesson.id, { description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }); setEditDescription(false); },
  });

  const { mutate: removeMaterial } = useMutation({
    mutationFn: (materialId: string) => {
      setRemovingIds(prev => new Set(prev).add(materialId));
      return CoursesService.removeMaterial(courseId, sectionId, lesson.id, materialId);
    },
    onSuccess: (_, materialId) => {
      setRemovingIds(prev => { const s = new Set(prev); s.delete(materialId); return s; });
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    },
    onError: (_, materialId) => {
      setRemovingIds(prev => { const s = new Set(prev); s.delete(materialId); return s; });
    },
  });

  // Curriculum = video only
  const getVideoDuration = (file: File): Promise<number> =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      const objectUrl = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(Math.round(video.duration));
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(0);
      };
      video.src = objectUrl;
    });

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const videoFiles = Array.from(files).filter(f => f.type.startsWith("video/"));
    if (!videoFiles.length) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      let totalDuration = 0;
      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        const fileBase = (i / videoFiles.length) * 100;
        const fileShare = 100 / videoFiles.length;
        const [url, duration] = await Promise.all([
          StorageService.uploadWithProgress("course-videos", file, (pct) => {
            setUploadProgress(Math.round(fileBase + (pct * fileShare) / 100));
          }),
          getVideoDuration(file),
        ]);
        await CoursesService.addMaterial(courseId, sectionId, lesson.id, {
          type:     MaterialType.VIDEO,
          title:    file.name.replace(/\.[^/.]+$/, ""),
          url,
          fileName: file.name,
          size:     file.size,
        });
        totalDuration += duration;
      }
      if (totalDuration > 0) {
        await CoursesService.updateLesson(courseId, sectionId, lesson.id, { duration: totalDuration });
      }
      setUploadProgress(100);
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const videoMaterials = lesson.materials.filter(m => m.type === "VIDEO");
  const previewItems: PreviewItem[] = videoMaterials.filter(m => m.url).map(m => ({
    url: m.url!, title: m.title, fileType: "video",
  }));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/60 dark:bg-white/[0.02]">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="flex-shrink-0 p-0.5 rounded text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/40 cursor-grab active:cursor-grabbing touch-none transition-colors"
            tabIndex={-1}
            aria-label="Drag to reorder lesson"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
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
                {/* Description */}
                <div className="group/desc">
                  {editDescription ? (
                    <div className="space-y-1.5">
                      <textarea
                        autoFocus
                        value={descriptionDraft}
                        onChange={e => setDescriptionDraft(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Escape") { setDescriptionDraft(lesson.description ?? ""); setEditDescription(false); }
                        }}
                        rows={3}
                        placeholder="Lesson description…"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-all resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateDescription(descriptionDraft.trim())}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center gap-1">
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button
                          onClick={() => { setDescriptionDraft(lesson.description ?? ""); setEditDescription(false); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-700 transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-start gap-2 cursor-pointer"
                      onClick={() => setEditDescription(true)}
                    >
                      <p className={`flex-1 text-xs leading-relaxed ${lesson.description ? "text-gray-500 dark:text-gray-400" : "text-gray-300 dark:text-gray-600 italic"}`}>
                        {lesson.description || "Add a description…"}
                      </p>
                      <Edit3 className="w-3 h-3 text-gray-300 dark:text-gray-600 opacity-0 group-hover/desc:opacity-100 flex-shrink-0 mt-0.5 transition-opacity" />
                    </div>
                  )}
                </div>

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
                      disabled={removingIds.has(mat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all disabled:opacity-100">
                      {removingIds.has(mat.id)
                        ? <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                        : <Trash2 className="w-3 h-3" />
                      }
                    </button>                  </div>
                )) : (
                  <p className="text-xs text-gray-400 italic py-1">No videos yet.</p>
                )}
                <input ref={fileRef} type="file" accept="video/*" multiple className="hidden"
                  onChange={e => handleUpload(e.target.files)} />
                {uploading ? (
                  <div className="w-full px-3 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
                      </span>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ ease: "linear", duration: 0.2 }}
                      />
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-gray-500 text-xs font-bold hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Upload video
                  </button>
                )}
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

function SectionBlock({
  section, courseId, index, onLessonsReordered, isDragOverlay = false,
}: {
  section: CourseSection;
  courseId: string;
  index: number;
  onLessonsReordered: (sectionId: string, newLessons: CourseLesson[]) => void;
  isDragOverlay?: boolean;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded]       = useState(true);
  const [editTitle, setEditTitle]     = useState(false);
  const [titleDraft, setTitleDraft]   = useState(section.title);
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonTitle, setLessonTitle]   = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  // Local optimistic lesson order for this section
  const [localLessons, setLocalLessons] = useState<CourseLesson[]>(section.lessons);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [reorderingLessons, setReorderingLessons] = useState(false);

  // Sync when server data changes
  useEffect(() => {
    setLocalLessons(section.lessons);
  }, [section.lessons]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: isDragOverlay });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

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
      title:       lessonTitle.trim(),
      ...(lessonDescription.trim() && { description: lessonDescription.trim() }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      setLessonTitle(""); setLessonDescription(""); setAddingLesson(false);
    },
  });

  const handleLessonDragStart = (event: DragStartEvent) => {
    setActiveLessonId(event.active.id as string);
  };

  const handleLessonDragEnd = async (event: DragEndEvent) => {
    setActiveLessonId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localLessons.findIndex(l => l.id === active.id);
    const newIndex = localLessons.findIndex(l => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(localLessons, oldIndex, newIndex);
    setLocalLessons(reordered);
    onLessonsReordered(section.id, reordered);

    setReorderingLessons(true);
    try {
      await CoursesService.reorderLessons(courseId, section.id, reordered.map(l => l.id));
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } catch {
      // Revert on failure
      setLocalLessons(section.lessons);
      onLessonsReordered(section.id, section.lessons);
    } finally {
      setReorderingLessons(false);
    }
  };

  const activeLesson = activeLessonId ? localLessons.find(l => l.id === activeLessonId) : null;

  const sectionStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={sectionStyle}
      className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#0f1623]"
    >
      <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors select-none">
        {/* Section drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-0.5 rounded text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/40 cursor-grab active:cursor-grabbing touch-none transition-colors"
          tabIndex={-1}
          aria-label="Drag to reorder section"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div
          className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 cursor-pointer"
          onClick={() => setExpanded(p => !p)}
        >
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
            <div className="flex items-center gap-2 group/title cursor-pointer" onClick={() => setExpanded(p => !p)}>
              <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">{section.title}</h3>
              <button onClick={e => { e.stopPropagation(); setEditTitle(true); }}
                className="opacity-0 group-hover/title:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all">
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-gray-400">{localLessons.length} lessons</span>
          {reorderingLessons && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
          <button onClick={() => removeSection()} disabled={removingSection}
            className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            {removingSection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
        <motion.div animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.2 }} className="cursor-pointer" onClick={() => setExpanded(p => !p)}>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-4 pt-1 space-y-2 border-t border-gray-100 dark:border-white/[0.06]">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleLessonDragStart}
                onDragEnd={handleLessonDragEnd}
              >
                <SortableContext items={localLessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                  {localLessons.map(lesson => (
                    <LessonRow key={lesson.id} lesson={lesson} courseId={courseId} sectionId={section.id} />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeLesson && (
                    <LessonRow lesson={activeLesson} courseId={courseId} sectionId={section.id} isDragOverlay />
                  )}
                </DragOverlay>
              </DndContext>
              <AnimatePresence>
                {addingLesson ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <input autoFocus value={lessonTitle}
                          onChange={e => setLessonTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter" && lessonTitle.trim()) addLesson();
                            if (e.key === "Escape") { setAddingLesson(false); setLessonTitle(""); setLessonDescription(""); }
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
                        <button onClick={() => { setAddingLesson(false); setLessonTitle(""); setLessonDescription(""); }}
                          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        value={lessonDescription}
                        onChange={e => setLessonDescription(e.target.value)}
                        placeholder="Description (optional)…"
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-all resize-none"
                      />
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
  const [addingSection, setAddingSection] = useState(false);
  const [sectionTitle, setSectionTitle]   = useState("");
  // Local optimistic section order
  const [localSections, setLocalSections] = useState<CourseSection[]>(course.sections ?? []);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [reorderingSections, setReorderingSections] = useState(false);

  // Sync when server data changes
  useEffect(() => {
    setLocalSections(course.sections ?? []);
  }, [course.sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const { mutate: createSection, isPending: creatingSec } = useMutation({
    mutationFn: () => CoursesService.createSection(courseId, { title: sectionTitle.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      setSectionTitle(""); setAddingSection(false);
    },
  });

  const handleSectionDragStart = (event: DragStartEvent) => {
    setActiveSectionId(event.active.id as string);
  };

  const handleSectionDragEnd = async (event: DragEndEvent) => {
    setActiveSectionId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localSections.findIndex(s => s.id === active.id);
    const newIndex = localSections.findIndex(s => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(localSections, oldIndex, newIndex);
    setLocalSections(reordered);

    setReorderingSections(true);
    try {
      await CoursesService.reorderSections(courseId, reordered.map(s => s.id));
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } catch {
      // Revert on failure
      setLocalSections(course.sections ?? []);
    } finally {
      setReorderingSections(false);
    }
  };

  // Called by SectionBlock when lessons are reordered optimistically
  const handleLessonsReordered = (sectionId: string, newLessons: CourseLesson[]) => {
    setLocalSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, lessons: newLessons } : s),
    );
  };

  const activeSection = activeSectionId ? localSections.find(s => s.id === activeSectionId) : null;

  const totalLessons = localSections.reduce((a, s) => a + s.lessons.length, 0);
  const totalVideos  = localSections.reduce((a, s) =>
    a + s.lessons.reduce((b, l) => b + l.materials.filter(m => m.type === "VIDEO").length, 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400">
            {localSections.length} sections · {totalLessons} lessons · {totalVideos} videos
          </p>
          {reorderingSections && (
            <span className="flex items-center gap-1 text-[10px] text-blue-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving order…
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
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

      {localSections.length > 0 ? (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleSectionDragStart}
            onDragEnd={handleSectionDragEnd}
          >
            <SortableContext items={localSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {localSections.map((section, i) => (
                  <SectionBlock
                    key={section.id}
                    section={section}
                    courseId={courseId}
                    index={i}
                    onLessonsReordered={handleLessonsReordered}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeSection && (
                <SectionBlock
                  section={activeSection}
                  courseId={courseId}
                  index={localSections.findIndex(s => s.id === activeSection.id)}
                  onLessonsReordered={() => {}}
                  isDragOverlay
                />
              )}
            </DragOverlay>
          </DndContext>
          <button onClick={() => setAddingSection(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-white/25 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 flex items-center justify-center gap-2 text-sm font-bold transition-all">
            <Plus className="w-4 h-4" /> Add Another Section
          </button>
        </>
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
  quiz, onSave, onClose, isSaving = false, error = null,
}: { quiz: InlineQuiz | null; onClose: () => void; onSave: (q: InlineQuiz) => void; isSaving?: boolean; error?: string | null }) {
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
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">✓ Saved to backend · Auto-graded on submission</p>
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

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/[0.07]">
            {error && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-500/[0.08] border border-red-200 dark:border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <button onClick={() => setIsPublished(p => !p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  isPublished
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                    : "border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-white/30"
                }`}>
                {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {isPublished ? "Published" : "Draft"}
              </button>
              <button onClick={handleSave} disabled={!title.trim() || questions.length === 0 || isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-30 transition-all">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Text Tab ─────────────────────────────────────────────────────────────────

function TextTab({ course, courseId }: { course: CourseDetail; courseId: string }) {
  const qc = useQueryClient();

  // Per-lesson text editor state
  const [editing, setEditing] = useState<Record<string, { title: string; content: string; saving: boolean }>>({});

  const allLessons = (course.sections ?? []).flatMap(s =>
    s.lessons.map(l => ({ ...l, sectionId: s.id, sectionTitle: s.title }))
  );

  const startEdit = (lessonId: string, existingMat?: CourseMaterial) => {
    setEditing(p => ({
      ...p,
      [lessonId]: {
        title:   existingMat?.title   ?? "Text Content",
        content: existingMat?.note    ?? "",
        saving:  false,
      },
    }));
  };

  const cancelEdit = (lessonId: string) =>
    setEditing(p => { const n = { ...p }; delete n[lessonId]; return n; });

  const saveText = async (lessonId: string, sectionId: string, existingMatId?: string) => {
    const draft = editing[lessonId];
    if (!draft || !draft.content.trim()) return;
    setEditing(p => ({ ...p, [lessonId]: { ...p[lessonId], saving: true } }));
    try {
      if (existingMatId) {
        // Delete old and re-add (PATCH not supported for materials)
        await CoursesService.removeMaterial(courseId, sectionId, lessonId, existingMatId);
      }
      await CoursesService.addMaterial(courseId, sectionId, lessonId, {
        type:  MaterialType.TEXT,
        title: draft.title.trim() || "Text Content",
        note:  draft.content.trim(),
      });
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      cancelEdit(lessonId);
    } finally {
      setEditing(p => p[lessonId] ? { ...p, [lessonId]: { ...p[lessonId], saving: false } } : p);
    }
  };

  const deleteText = async (lessonId: string, sectionId: string, matId: string) => {
    await CoursesService.removeMaterial(courseId, sectionId, lessonId, matId);
    qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
  };

  if (allLessons.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
          <FileText className="w-7 h-7 text-gray-300 dark:text-gray-600" />
        </div>
        <div>
          <p className="font-bold text-gray-500 dark:text-gray-400">No lessons yet</p>
          <p className="text-sm text-gray-400 mt-1">Add lessons in the Video tab first, then attach text content here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allLessons.map(lesson => {
        const textMat  = lesson.materials.find(m => m.type === "TEXT");
        const draft    = editing[lesson.id];
        const isEditing = !!draft;

        return (
          <div key={lesson.id} className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#0f1623]">
            {/* Lesson header */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50/60 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06]">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <FileText className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{lesson.title}</p>
                <p className="text-[10px] text-gray-400">{lesson.sectionTitle}</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => startEdit(lesson.id, textMat ?? undefined)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all">
                  <Edit3 className="w-3 h-3" />
                  {textMat ? "Edit" : "Add Text"}
                </button>
              )}
            </div>

            <div className="px-5 py-4">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    value={draft.title}
                    onChange={e => setEditing(p => ({ ...p, [lesson.id]: { ...p[lesson.id], title: e.target.value } }))}
                    placeholder="Content title…"
                    className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 transition-all"
                  />
                  <textarea
                    autoFocus
                    value={draft.content}
                    onChange={e => setEditing(p => ({ ...p, [lesson.id]: { ...p[lesson.id], content: e.target.value } }))}
                    rows={8}
                    placeholder="Write your lesson text or markdown content here…"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 transition-all resize-y font-mono leading-relaxed"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveText(lesson.id, lesson.sectionId, textMat?.id)}
                      disabled={!draft.content.trim() || draft.saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-all">
                      {draft.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {draft.saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => cancelEdit(lesson.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : textMat ? (
                <div className="group/text space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{textMat.title}</p>
                    <button
                      onClick={() => deleteText(lesson.id, lesson.sectionId, textMat.id)}
                      className="opacity-0 group-hover/text:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <pre className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 border border-gray-100 dark:border-white/[0.05] max-h-40 overflow-y-auto font-mono">
                    {textMat.note}
                  </pre>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No text content yet. Click "Add Text" to write content for this lesson.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── File Tab ─────────────────────────────────────────────────────────────────

function FileTab({ course, courseId }: { course: CourseDetail; courseId: string }) {
  const qc = useQueryClient();
  // Per-lesson upload state: uploading flag + progress percentage
  const [uploadState, setUploadState] = useState<Record<string, { uploading: boolean; progress: number }>>({});
  const [preview, setPreview]         = useState<{ items: PreviewItem[]; index: number } | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const allLessons = (course.sections ?? []).flatMap(s =>
    s.lessons.map(l => ({ ...l, sectionId: s.id, sectionTitle: s.title }))
  );

  const handleUpload = async (lessonId: string, sectionId: string, files: File[]) => {
    const validFiles = files.filter(f => !f.type.startsWith("video/"));
    if (!validFiles.length) return;
    setUploadState(p => ({ ...p, [lessonId]: { uploading: true, progress: 0 } }));
    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileBase  = (i / validFiles.length) * 100;
        const fileShare = 100 / validFiles.length;
        const url = await StorageService.uploadWithProgress("assignments", file, (pct) => {
          setUploadState(p => ({
            ...p,
            [lessonId]: { uploading: true, progress: Math.round(fileBase + (pct * fileShare) / 100) },
          }));
        });
        await CoursesService.addMaterial(courseId, sectionId, lessonId, {
          type:     materialTypeFromFile(file),
          title:    file.name.replace(/\.[^/.]+$/, ""),
          url,
          fileName: file.name,
          size:     file.size,
        });
      }
      setUploadState(p => ({ ...p, [lessonId]: { uploading: true, progress: 100 } }));
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } finally {
      setUploadState(p => ({ ...p, [lessonId]: { uploading: false, progress: 0 } }));
    }
  };

  const { mutate: deleteMaterial } = useMutation({
    mutationFn: ({ lessonId, sectionId, materialId }: { lessonId: string; sectionId: string; materialId: string }) =>
      CoursesService.removeMaterial(courseId, sectionId, lessonId, materialId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor-course", courseId] }),
  });

  const buildPreviewItems = (mats: CourseMaterial[]): PreviewItem[] =>
    mats.filter(m => m.type !== "VIDEO" && m.type !== "TEXT" && m.url).map(m => ({
      url:      m.url!,
      title:    m.title,
      fileType: resolvePreviewType(m.type, m.fileName),
    }));

  const totalFiles = allLessons.reduce((a, l) =>
    a + l.materials.filter(m => m.type !== "VIDEO" && m.type !== "TEXT").length, 0);

  if (allLessons.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
          <Paperclip className="w-7 h-7 text-gray-300 dark:text-gray-600" />
        </div>
        <div>
          <p className="font-bold text-gray-500 dark:text-gray-400">No lessons yet</p>
          <p className="text-sm text-gray-400 mt-1">Add lessons in the Video tab first, then attach files here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">{totalFiles} file{totalFiles !== 1 ? "s" : ""} across {allLessons.length} lessons</p>
      <div className="space-y-3">
        {allLessons.map(lesson => {
          const fileMats        = lesson.materials.filter(m => m.type !== "VIDEO" && m.type !== "TEXT");
          const previewItems    = buildPreviewItems(lesson.materials);
          const lessonUpload    = uploadState[lesson.id] ?? { uploading: false, progress: 0 };
          const isUploading     = lessonUpload.uploading;
          const uploadProgress  = lessonUpload.progress;

          return (
            <div key={lesson.id} className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#0f1623]">
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50/60 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06]">
                <Paperclip className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex-1 truncate">{lesson.title}</span>
                <span className="text-[10px] text-gray-400">{lesson.sectionTitle}</span>
                {fileMats.length > 0 && (
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-1.5 py-0.5 rounded-md">
                    {fileMats.length}
                  </span>
                )}
              </div>
              <div className="px-5 pb-4 pt-3 space-y-1.5">
                <AnimatePresence>
                  {fileMats.map((mat, matIdx) => {
                    const iconMeta = MATERIAL_ICONS[mat.type] ?? MATERIAL_ICONS.OTHER;
                    const fileType = resolvePreviewType(mat.type, mat.fileName);
                    return (
                      <motion.div key={mat.id}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.05] group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <div className={`w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 ${iconMeta.bg} ${iconMeta.color}`}>
                          {fileType === "image" && mat.url
                            ? <img src={mat.url} alt="" className="w-full h-full object-cover" />
                            : iconMeta.icon
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{mat.title}</p>
                          <p className="text-[10px] text-gray-400">{mat.type}{mat.size ? ` · ${formatSize(mat.size)}` : ""}</p>
                        </div>
                        {mat.url && (
                          <button
                            onClick={() => setPreview({ items: previewItems, index: matIdx })}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-blue-500 transition-all flex-shrink-0">
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => deleteMaterial({ lessonId: lesson.id, sectionId: lesson.sectionId, materialId: mat.id })}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {fileMats.length === 0 && !isUploading && (
                  <p className="text-xs text-gray-400 italic py-1">No files for this lesson yet.</p>
                )}
                <input
                  ref={el => { fileRefs.current[lesson.id] = el; }}
                  type="file" multiple
                  accept="image/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.apk,*/*"
                  className="hidden"
                  onChange={e => { if (e.target.files) handleUpload(lesson.id, lesson.sectionId, Array.from(e.target.files)); }}
                />
                {isUploading ? (
                  <div className="w-full px-3 py-2.5 rounded-xl border border-sky-200 dark:border-sky-800/50 bg-sky-50/50 dark:bg-sky-900/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
                      </span>
                      <span className="text-xs font-black text-sky-600 dark:text-sky-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-sky-100 dark:bg-sky-900/40 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-sky-500 dark:bg-sky-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ ease: "linear", duration: 0.2 }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRefs.current[lesson.id]?.click()}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-gray-500 text-xs font-bold hover:border-sky-300 hover:text-sky-600 dark:hover:border-sky-700 dark:hover:text-sky-400 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Add PDF, audio, image, doc…
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {preview && (
        <FilePreviewModal items={preview.items} startIndex={preview.index} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}

// ─── Quiz Tab ─────────────────────────────────────────────────────────────────

function QuizTab({
  course,
  courseId,
  fetchedQuizzes,
  loadingQuizzes,
}: {
  course: CourseDetail;
  courseId: string;
  fetchedQuizzes: import("@/services/quiz.service").Quiz[] | undefined;
  loadingQuizzes: boolean;
}) {
  const qc = useQueryClient();
  const [editingQuiz, setEditingQuiz]         = useState<InlineQuiz | null | "new">(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [quizError, setQuizError]             = useState<string | null>(null);

  // Group fetched quizzes by sectionId and map to InlineQuiz shape
  const quizzesBySectionId: Record<string, InlineQuiz[]> = {};
  for (const q of fetchedQuizzes ?? []) {
    const mapped: InlineQuiz = {
      id:          q.id,
      title:       q.title,
      passMark:    q.passMark,
      isPublished: false, // API doesn't return this field yet
      questions:   (q.questions ?? []).map(qq => ({
        id:              qq.id ?? `qq-${Math.random()}`,
        question:        qq.text,
        options:         (qq.options ?? []).map(o => ({ id: o.id ?? `o-${Math.random()}`, text: o.text })),
        correctOptionId: qq.options?.[0]?.id ?? "",
      })),
    };
    if (!quizzesBySectionId[q.sectionId]) quizzesBySectionId[q.sectionId] = [];
    quizzesBySectionId[q.sectionId].push(mapped);
  }

  const sections = (course.sections ?? []).map(s => ({
    sectionId:    s.id,
    sectionTitle: s.title,
    position:     s.position,
    lessons:      s.lessons,
    quizzes:      quizzesBySectionId[s.id] ?? [],
  }));

  const totalQuizzes = sections.reduce((a, s) => a + s.quizzes.length, 0);

  const { mutate: saveQuizMutation, isPending: savingQuiz } = useMutation({
    mutationFn: async (quiz: InlineQuiz) => {
      setQuizError(null);
      // Validate: each question must have exactly 4 non-empty options with exactly 1 correct
      for (const q of quiz.questions) {
        if (q.options.length !== 4) throw new Error("Each question must have exactly 4 options.");
        const emptyOpts = q.options.filter(o => !o.text.trim());
        if (emptyOpts.length > 0) throw new Error("All option fields must be filled in.");
        if (!q.question.trim()) throw new Error("All question texts must be filled in.");
      }
      const payload: CreateQuizPayload = {
        title:     quiz.title,
        sectionId: activeSectionId!,
        passMark:  quiz.passMark,
        questions: quiz.questions.map(q => ({
          text:    q.question,
          options: q.options.map(opt => ({
            text:      opt.text,
            isCorrect: opt.id === q.correctOptionId,
          })),
        })),
      };
      const isNew = !quiz.id || quiz.id.startsWith("q-");
      if (isNew) return await QuizService.create(payload);
      await QuizService.update(quiz.id, { title: quiz.title, passMark: quiz.passMark });
      return quiz;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
      setEditingQuiz(null);
      setActiveSectionId(null);
      setQuizError(null);
    },
    onError: (error: Error) => setQuizError(error.message),
  });

  const { mutate: deleteQuizMutation, isPending: deletingQuiz } = useMutation({
    mutationFn: (quizId: string) => QuizService.remove(quizId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
    },
    onError: (error: Error) => setQuizError(error.message),
  });

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
          <HelpCircle className="w-7 h-7 text-gray-300 dark:text-gray-600" />
        </div>
        <div>
          <p className="font-bold text-gray-500 dark:text-gray-400">No sections yet</p>
          <p className="text-sm text-gray-400 mt-1">Create sections in the Video tab first.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {loadingQuizzes
              ? "Loading quizzes…"
              : `${totalQuizzes} quiz${totalQuizzes !== 1 ? "zes" : ""} across ${sections.length} sections`
            }
          </p>
          {loadingQuizzes && <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
        </div>

        {quizError && !editingQuiz && (
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-500/[0.08] border border-red-200 dark:border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{quizError}</p>
          </div>
        )}

        {sections.map(sec => (
          <div key={sec.sectionId} className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#0f1623]">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50/60 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06]">
              <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <ListChecks className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{sec.sectionTitle}</h3>
              {loadingQuizzes && <Loader2 className="w-3 h-3 text-amber-400 animate-spin flex-shrink-0" />}
              {!loadingQuizzes && sec.quizzes.length > 0 && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
                  {sec.quizzes.length}
                </span>
              )}
            </div>
            <div className="px-5 pb-4 pt-3 space-y-2">
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
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
                      <button onClick={() => { setActiveSectionId(sec.sectionId); setEditingQuiz(quiz); }}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteQuizMutation(quiz.id)} disabled={deletingQuiz}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all">
                        {deletingQuiz
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!loadingQuizzes && sec.quizzes.length === 0 && (
                <p className="text-xs text-gray-400 italic py-1">No quizzes in this section yet.</p>
              )}
              <button
                onClick={() => { setActiveSectionId(sec.sectionId); setEditingQuiz("new"); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all w-full text-xs font-bold">
                <Plus className="w-3.5 h-3.5" /> Add Quiz
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editingQuiz !== null && (
          <QuizEditorModal
            quiz={editingQuiz === "new" ? null : editingQuiz}
            onClose={() => { setEditingQuiz(null); setActiveSectionId(null); setQuizError(null); }}
            onSave={q => saveQuizMutation(q)}
            isSaving={savingQuiz}
            error={quizError}
          />
        )}
      </AnimatePresence>
    </>
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
  const [tab, setTab] = useState<"video" | "text" | "file" | "quiz" | "overview" | "students">("video");

  const { data: course, isLoading } = useQuery<CourseDetail>({
    queryKey: ["instructor-course", id],
    queryFn:  () => CoursesService.findOne(id!) as Promise<CourseDetail>,
    enabled:  !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // ── Hoist quiz query so it loads in the background immediately ──────────────
  const sectionIds = (course?.sections ?? []).map(s => s.id);
  const { data: fetchedQuizzes, isLoading: loadingQuizzes } = useQuery({
    queryKey: ["course-quizzes", id],
    queryFn: async () => {
      if (!sectionIds.length) return [] as import("@/services/quiz.service").Quiz[];
      const results = await Promise.all(
        sectionIds.map(sid => QuizService.findBySection(sid))
      );
      return results.flat();
    },
    enabled: !!id && sectionIds.length > 0,
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
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
  const totalTexts   = (course.sections ?? []).reduce((a, s) =>
    a + s.lessons.reduce((b, l) => b + l.materials.filter(m => m.type === "TEXT").length, 0), 0);
  const totalMats    = (course.sections ?? []).reduce((a, s) =>
    a + s.lessons.reduce((b, l) => b + l.materials.filter(m => m.type !== "VIDEO" && m.type !== "TEXT").length, 0), 0);

  const TABS = [
    { id: "video"    as const, label: "Video",      count: totalLessons > 0 ? `${totalLessons}` : undefined },
    { id: "text"     as const, label: "Text",        count: totalTexts   > 0 ? `${totalTexts}`   : undefined },
    { id: "file"     as const, label: "File",        count: totalMats    > 0 ? `${totalMats}`    : undefined },
    { id: "quiz"     as const, label: "Quiz" },
    { id: "overview" as const, label: "Info" },
    { id: "students" as const, label: "Students",   count: enrollments  > 0 ? `${enrollments}`  : undefined },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-5 sm:space-y-6 pb-16">

      <Link to="/instructor/courses"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Courses
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">

        <div className="h-16 sm:h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
          {course.img && <img src={course.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
        </div>

        <div className="px-4 sm:px-6 pb-5 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-7 sm:-mt-8 mb-4 sm:mb-5">
            <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 ring-4 ring-white dark:ring-[#0f1623] shadow-lg">
              {course.img ? <img src={course.img} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white/60" />}
            </div>
            <div className="flex-1 min-w-0">
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
              <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white line-clamp-2">{course.title}</h1>
              <p className="text-xs text-gray-400 mt-0.5">${(course.price ?? 0).toFixed(2)} · {enrollments} enrolled</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto mt-1 sm:mt-0">
              {!isArchived && (
                <button onClick={() => isPublished ? archive() : publish()} disabled={publishing || archiving}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isPublished
                      ? "border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
                  }`}>
                  {(publishing || archiving) ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : isPublished ? <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {isPublished ? "Archive" : "Publish"}
                </button>
              )}
              {isArchived && (
                <button onClick={() => publish()} disabled={publishing}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
                  {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Re-publish
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-4 sm:pt-5 border-t border-gray-100 dark:border-white/[0.06]">
            {[
              { icon: Users,      val: String(enrollments),                  sub: "Students"  },
              { icon: Layers,     val: String(course.sections?.length ?? 0), sub: "Sections"  },
              { icon: Star,       val: String(totalLessons),                 sub: "Lessons"   },
              { icon: TrendingUp, val: `$${(course.price ?? 0).toFixed(0)}`, sub: "Price"    },
            ].map(({ icon: Icon, val, sub }) => (
              <div key={sub} className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500" />
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

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
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
          {tab === "video"    && <CurriculumTab course={course} courseId={id!} />}
          {tab === "text"     && <TextTab       course={course} courseId={id!} />}
          {tab === "file"     && <FileTab       course={course} courseId={id!} />}
          {tab === "quiz"     && (
            <QuizTab
              course={course}
              courseId={id!}
              fetchedQuizzes={fetchedQuizzes}
              loadingQuizzes={loadingQuizzes}
            />
          )}
          {tab === "overview" && <OverviewTab   course={course} courseId={id!} />}
          {tab === "students" && <StudentsTab   course={course} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default InstructorSingleCourse;
