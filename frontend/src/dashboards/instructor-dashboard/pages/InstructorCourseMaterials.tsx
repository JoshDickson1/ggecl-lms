// InstructorCourseMaterials.tsx — real API: courses, sections, lessons, materials via CoursesService + StorageService

import { useState, useRef, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Plus, Upload, Video, FileText, Image as ImageIcon,
  Package, X, Edit3, Trash2, GripVertical, Clock,
  CheckCircle2, ChevronRight, BookOpen, ListChecks,
  Paperclip, Save, HelpCircle, Check, Layers,
  Film, Send, Sparkles, Pencil, Loader2,
} from "lucide-react";
import {
  CourseFile, FileType, getFileType,
} from "@/data/courseTypes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CoursesService, { getMaterialTypeFromFile, CreateMaterialPayload } from "@/services/course.service";
import StorageService from "@/services/storage.service";
import QuizService, { type Quiz, type CreateQuizPayload } from "@/services/quiz.service";

// ─── API Types ────────────────────────────────────────────────────────────────

interface ApiCourse {
  id: string;
  title: string;
  img: string | null;
  level: string;
  status: string;
}

interface ApiMaterial {
  id: string;
  type: string;
  title: string;
  url: string;
  fileName: string | null;
  size: number | null;
}

interface ApiLesson {
  id: string;
  title: string;
  position: number;
  duration: number | null;
  materials: ApiMaterial[];
}

interface ApiSection {
  id: string;
  title: string;
  position: number;
  lessons: ApiLesson[];
}

interface ApiCourseDetail extends ApiCourse {
  sections: ApiSection[];
}

// Extended CourseFile that stores the lesson id (one lesson per file in our model)
interface CourseFileExt extends CourseFile {
  lessonId?: string;
}

// Extended Section that uses CourseFileExt
interface SectionExt {
  id: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  videos: CourseFileExt[];
  files:  CourseFileExt[];
  quizzes: Quiz[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeCourses(raw: unknown): ApiCourse[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as ApiCourse[];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items as ApiCourse[];
  if (Array.isArray(obj.data)) return obj.data as ApiCourse[];
  return [];
}

function mapApiSection(s: ApiSection): SectionExt {
  const videos: CourseFileExt[] = [];
  const files:  CourseFileExt[] = [];

  for (const lesson of s.lessons ?? []) {
    for (const mat of lesson.materials ?? []) {
      const file: CourseFileExt = {
        id:         mat.id,
        name:       mat.fileName ?? mat.title,
        type:       getFileType(mat.fileName ?? mat.title),
        size:       mat.size ? `${(mat.size / 1024 / 1024).toFixed(1)} MB` : "—",
        url:        mat.url,
        uploadedAt: new Date().toISOString().split("T")[0],
        lessonId:   lesson.id,
      };
      if (mat.type === "VIDEO") videos.push(file);
      else files.push(file);
    }
  }

  return {
    id:          s.id,
    title:       s.title,
    description: "",
    order:       s.position,
    isPublished: false,
    videos,
    files,
    quizzes:     [],
  };
}

// ─── File icons ───────────────────────────────────────────────────────────────

const FILE_ICONS: Record<FileType, { icon: React.ReactNode; color: string; bg: string }> = {
  video: { icon: <Film className="w-4 h-4" />,      color: "text-blue-600 dark:text-blue-400",        bg: "bg-blue-100 dark:bg-blue-900/30" },
  doc:   { icon: <FileText className="w-4 h-4" />,   color: "text-sky-600 dark:text-sky-400",          bg: "bg-sky-100 dark:bg-sky-900/30" },
  image: { icon: <ImageIcon className="w-4 h-4" />,  color: "text-emerald-600 dark:text-emerald-400",  bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  apk:   { icon: <Package className="w-4 h-4" />,    color: "text-amber-600 dark:text-amber-400",      bg: "bg-amber-100 dark:bg-amber-900/30" },
  other: { icon: <Paperclip className="w-4 h-4" />,  color: "text-slate-500 dark:text-white/40",       bg: "bg-slate-100 dark:bg-white/[0.06]" },
};

// ─── File Row ─────────────────────────────────────────────────────────────────

function FileRow({ file, onDelete }: { file: CourseFileExt; onDelete: (id: string) => void }) {
  const meta = FILE_ICONS[file.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] group transition-colors"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-white/80 truncate">{file.name}</p>
        <p className="text-xs text-slate-400 dark:text-white/30">{file.size} · {file.uploadedAt}</p>
      </div>
      {file.duration && (
        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-white/30 flex-shrink-0">
          <Clock className="w-3 h-3" />{file.duration}
        </span>
      )}
      <button
        onClick={() => onDelete(file.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 dark:text-white/20 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ label, accept, onFiles, uploading }: {
  label: string; accept: string; onFiles: (f: File[]) => void; uploading?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); onFiles(Array.from(e.dataTransfer.files)); }}
      onClick={() => !uploading && ref.current?.click()}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
        uploading ? "opacity-60 cursor-not-allowed border-slate-200 dark:border-white/[0.07]" :
        dragging
          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : "border-slate-200 dark:border-white/[0.07] hover:border-blue-400 dark:hover:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-900/10"
      }`}
    >
      <input ref={ref} type="file" accept={accept} multiple className="hidden"
        onChange={e => { if (e.target.files) onFiles(Array.from(e.target.files)); }} />
      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
        {uploading
          ? <Loader2 className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-spin" />
          : <Upload className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        }
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600 dark:text-white/60">{uploading ? "Uploading…" : label}</p>
        <p className="text-xs text-slate-400 dark:text-white/25">Click or drag & drop</p>
      </div>
    </div>
  );
}

// ─── Quiz Editor Modal ────────────────────────────────────────────────────────

// Local quiz question structure for editing
interface LocalQuizQuestion {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

function QuizEditor({
  quiz, onSave, onClose, sectionId,
}: { 
  quiz: Quiz | null; 
  onClose: () => void; 
  onSave: (q: CreateQuizPayload) => void;
  sectionId: string;
}) {
  const [title, setTitle]         = useState(quiz?.title ?? "");
  const [passMark, setPassMark]   = useState(quiz?.passMark ?? 70);
  const [questions, setQuestions] = useState<LocalQuizQuestion[]>(() => {
    if (quiz?.questions) {
      return quiz.questions.map((q, qIdx) => ({
        id: q.id || `qq-${Date.now()}-${qIdx}`,
        text: q.text,
        options: q.options.map((opt, idx) => ({
          id: opt.id || `opt-${Date.now()}-${idx}`,
          text: opt.text,
          isCorrect: opt.isCorrect ?? idx === 0 // Use backend value or default to first option
        }))
      }));
    }
    return [];
  });

  const addQuestion = () => setQuestions(p => [...p, {
    id: `qq-${Date.now()}`, 
    text: "",
    options: [
      { id: "o-1", text: "", isCorrect: true },
      { id: "o-2", text: "", isCorrect: false },
      { id: "o-3", text: "", isCorrect: false },
      { id: "o-4", text: "", isCorrect: false }
    ],
  }]);

  const updateQuestion = (id: string, updates: Partial<LocalQuizQuestion>) =>
    setQuestions(p => p.map(q => q.id === id ? { ...q, ...updates } : q));

  const updateOption = (qId: string, oId: string, text: string) =>
    setQuestions(p => p.map(q =>
      q.id !== qId ? q : { ...q, options: q.options.map(o => o.id === oId ? { ...o, text } : o) }
    ));

  const setCorrectOption = (qId: string, oId: string) =>
    setQuestions(p => p.map(q =>
      q.id !== qId ? q : { ...q, options: q.options.map(o => ({ ...o, isCorrect: o.id === oId })) }
    ));

  const handleSave = () => {
    if (!title.trim() || questions.length === 0) return;
    
    // Validate each question has exactly one correct option
    const isValid = questions.every(q => {
      const correctCount = q.options.filter(o => o.isCorrect).length;
      return correctCount === 1 && q.options.every(o => o.text.trim());
    });
    
    if (!isValid) {
      alert('Each question must have exactly one correct option and all options must have text.');
      return;
    }
    
    const createQuizDto: CreateQuizPayload = {
      title: title.trim(),
      sectionId,
      passMark,
      questions: questions.map(q => ({
        text: q.text.trim(),
        options: q.options.map(o => ({
          text: o.text.trim(),
          isCorrect: o.isCorrect
        }))
      }))
    };
    
    onSave(createQuizDto);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl my-8 bg-white dark:bg-[#0d1929] border border-slate-200 dark:border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-white">{quiz ? "Edit Quiz" : "New Inline Quiz"}</h2>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-white/40 mb-1.5">Quiz Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Module 1 Knowledge Check"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-white/40 mb-1.5">Pass Mark (%)</label>
              <input type="number" min={0} max={100} value={passMark}
                onChange={e => setPassMark(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500/30" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700 dark:text-white/70">Questions ({questions.length})</p>
              <button onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all">
                <Plus className="w-3.5 h-3.5" />Add Question
              </button>
            </div>

            <AnimatePresence>
              {questions.map((q, qi) => (
                <motion.div key={q.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="border border-slate-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-white/30">Q{qi + 1}</span>
                    <input value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })}
                      placeholder="Enter question text…"
                      className="flex-1 text-sm font-semibold bg-transparent text-slate-800 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 focus:outline-none" />
                    <button onClick={() => setQuestions(p => p.filter(x => x.id !== q.id))}
                      className="p-1 text-slate-300 dark:text-white/20 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-2">
                    {q.options.map(opt => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button onClick={() => setCorrectOption(q.id, opt.id)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                            opt.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-white/20"
                          }`}>
                          {opt.isCorrect && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <input value={opt.text} onChange={e => updateOption(q.id, opt.id, e.target.value)}
                          placeholder={`Option ${opt.id.replace("o-", "")}`}
                          className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500/30" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {questions.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-300 dark:text-white/20">
                <HelpCircle className="w-8 h-8 opacity-30" />
                <p className="text-sm">No questions yet. Add one above.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.07]">
            <div className="text-xs text-slate-400 dark:text-white/30">
              Quiz will be created and saved to the backend
            </div>
            <button onClick={handleSave} disabled={!title.trim() || questions.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:opacity-90 disabled:opacity-30 transition-all shadow-md shadow-blue-200 dark:shadow-none">
              <Save className="w-4 h-4" />Save Quiz
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Section Block ────────────────────────────────────────────────────────────

function SectionBlock({
  section, courseId, onUpdate, onDelete,
}: {
  section: SectionExt;
  courseId: string;
  onUpdate: (id: string, updates: Partial<SectionExt>) => void;
  onDelete: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded]         = useState(true);
  const [tab, setTab]                   = useState<"videos" | "files" | "quizzes">("videos");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState(section.title);
  const [editingQuiz, setEditingQuiz]   = useState<Quiz | null | "new">(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingFile, setUploadingFile]   = useState(false);

  const updateTitleMutation = useMutation({
    mutationFn: (title: string) => CoursesService.updateSection(courseId, section.id, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] }),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => CoursesService.removeLesson(courseId, section.id, lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] }),
  });

  const commitTitle = () => {
    onUpdate(section.id, { title: titleDraft });
    setEditingTitle(false);
    updateTitleMutation.mutate(titleDraft);
  };

  const addFiles = async (rawFiles: File[], type: "videos" | "files") => {
    if (type === "videos") setUploadingVideo(true);
    else setUploadingFile(true);
    
    const uploadPromises = rawFiles.map(async (f) => {
      try {
        // Determine material type from file
        const materialType = getMaterialTypeFromFile(f);
        
        // Select appropriate storage folder
        const storageFolder = type === "videos" ? "course-videos" : "lesson-materials";
        
        // Upload file to storage
        const url = await StorageService.upload(storageFolder, f);
        
        // Determine lesson position
        const currentPosition = type === "videos" ? section.videos.length : section.files.length;
        
        // Create material with lesson
        const payload: CreateMaterialPayload = {
          type: materialType,
          title: f.name,
          url,
          fileName: f.name,
          size: f.size,
          lessonTitle: f.name.replace(/\.[^/.]+$/, ""),
          lessonPosition: currentPosition + 1,
          lessonDescription: `Uploaded file: ${f.name}`,
        };
        
        const result = await CoursesService.createMaterial(courseId, section.id, payload);
        
        // Create file object for UI
        const newFile: CourseFileExt = {
          id: result.material.id,
          name: f.name,
          type: getFileType(f.name),
          size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
          url,
          uploadedAt: new Date().toISOString().split("T")[0],
          lessonId: result.lesson.id,
        };
        
        // Update local state
        if (type === "videos") {
          onUpdate(section.id, { videos: [...section.videos, newFile] });
        } else {
          onUpdate(section.id, { files: [...section.files, newFile] });
        }
        
        return { success: true, file: newFile, error: null };
      } catch (error) {
        console.error(`Failed to upload file ${f.name}:`, error);
        return { 
          success: false, 
          file: null, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        };
      }
    });
    
    try {
      const results = await Promise.allSettled(uploadPromises);
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
      
      if (failed.length > 0) {
        console.error(`${failed.length} files failed to upload`);
        alert(`${failed.length} file(s) failed to upload. Please try again.`);
      } else {
        // Refresh course data from backend after successful uploads
        queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] });
      }
    } finally {
      setUploadingVideo(false);
      setUploadingFile(false);
    }
  };

  const removeFile = async (fileId: string, type: "videos" | "files") => {
    const file = (type === "videos" ? section.videos : section.files).find(f => f.id === fileId) as CourseFileExt | undefined;
    const lessonId = file?.lessonId ?? fileId;
    deleteLessonMutation.mutate(lessonId);
    if (type === "videos") onUpdate(section.id, { videos: section.videos.filter(v => v.id !== fileId) });
    else onUpdate(section.id, { files: section.files.filter(f => f.id !== fileId) });
  };

  const saveQuiz = async (quizDto: CreateQuizPayload) => {
    try {
      const createdQuiz = await QuizService.create(quizDto);
      const updated = [...section.quizzes, createdQuiz];
      onUpdate(section.id, { quizzes: updated });
      setEditingQuiz(null);
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('Failed to create quiz. Please try again.');
    }
  };

  const removeQuiz = async (quizId: string) => {
    try {
      await QuizService.remove(quizId);
      onUpdate(section.id, { quizzes: section.quizzes.filter(q => q.id !== quizId) });
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    }
  };

  const TABS = [
    { id: "videos",  label: "Videos",  icon: <Video className="w-3.5 h-3.5" />,      count: section.videos.length },
    { id: "files",   label: "Files",   icon: <Paperclip className="w-3.5 h-3.5" />,  count: section.files.length },
    { id: "quizzes", label: "Quizzes", icon: <ListChecks className="w-3.5 h-3.5" />, count: section.quizzes.length },
  ] as const;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-slate-200 dark:border-white/[0.07] rounded-2xl overflow-hidden bg-white dark:bg-[#0d1929]"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
          onClick={() => setExpanded(p => !p)}
        >
          <GripVertical className="w-4 h-4 text-slate-300 dark:text-white/15 flex-shrink-0 cursor-grab" />
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
            {editingTitle ? (
              <input
                autoFocus value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={e => {
                  if (e.key === "Enter") commitTitle();
                  if (e.key === "Escape") { setTitleDraft(section.title); setEditingTitle(false); }
                }}
                className="w-full text-sm font-black bg-transparent text-slate-900 dark:text-white focus:outline-none border-b border-blue-400"
              />
            ) : (
              <div className="flex items-center gap-2 group/title">
                <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">{section.title}</h3>
                <button onClick={() => setEditingTitle(true)}
                  className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-all">
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            {section.videos.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold">
                {section.videos.length}v
              </span>
            )}
            {section.files.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 font-bold">
                {section.files.length}f
              </span>
            )}
            {section.quizzes.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold">
                {section.quizzes.length}q
              </span>
            )}

            <button onClick={() => onDelete(section.id)}
              className="p-1.5 rounded-lg text-slate-300 dark:text-white/20 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <motion.div animate={{ rotate: expanded ? 0 : -90 }}>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/25" />
          </motion.div>
        </div>

        {/* Body */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-100 dark:border-white/[0.07]">
                {/* Tabs */}
                <div className="flex gap-1 px-5 pt-3">
                  {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                        tab === t.id
                          ? "text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                          : "text-slate-400 dark:text-white/25 border-transparent hover:text-slate-600 dark:hover:text-white/50"
                      }`}>
                      {t.icon}{t.label}
                      {t.count > 0 && (
                        <span className={`px-1.5 rounded-full text-[10px] font-black ${
                          tab === t.id
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                            : "bg-slate-100 dark:bg-white/[0.07] text-slate-500 dark:text-white/30"
                        }`}>{t.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="px-5 pb-5 pt-3">
                  <AnimatePresence mode="wait">
                    {tab === "videos" && (
                      <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                        {section.videos.length === 0 && !uploadingVideo && (
                          <div className="flex flex-col items-center gap-2 py-6 text-slate-300 dark:text-white/20">
                            <Film className="w-7 h-7 opacity-40" />
                            <p className="text-sm">No videos yet</p>
                          </div>
                        )}
                        <AnimatePresence>
                          {section.videos.map(v => (
                            <FileRow key={v.id} file={v} onDelete={id => removeFile(id, "videos")} />
                          ))}
                        </AnimatePresence>
                        <UploadZone label="Upload Video" accept="video/*" onFiles={f => addFiles(f, "videos")} uploading={uploadingVideo} />
                      </motion.div>
                    )}
                    {tab === "files" && (
                      <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                        {section.files.length === 0 && !uploadingFile && (
                          <div className="flex flex-col items-center gap-2 py-6 text-slate-300 dark:text-white/20">
                            <Paperclip className="w-7 h-7 opacity-40" />
                            <p className="text-sm">No files yet</p>
                          </div>
                        )}
                        <AnimatePresence>
                          {section.files.map(f => (
                            <FileRow key={f.id} file={f} onDelete={id => removeFile(id, "files")} />
                          ))}
                        </AnimatePresence>
                        <UploadZone 
                          label="Upload File (PDF, slides, images, archives…)" 
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.zip,.rar,.jpg,.jpeg,.png,.gif,.webp" 
                          onFiles={f => addFiles(f, "files")} 
                          uploading={uploadingFile} 
                        />
                      </motion.div>
                    )}
                    {tab === "quizzes" && (
                      <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        {section.quizzes.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-6 text-slate-300 dark:text-white/20">
                            <HelpCircle className="w-7 h-7 opacity-40" />
                            <p className="text-sm">No quizzes yet</p>
                          </div>
                        )}
                        <AnimatePresence>
                          {section.quizzes.map(quiz => (
                            <motion.div key={quiz.id}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.07] hover:bg-slate-50 dark:hover:bg-white/[0.02] group transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                <ListChecks className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white/80 truncate">{quiz.title}</p>
                                <p className="text-xs text-slate-400 dark:text-white/30">{quiz.questions.length} questions · {quiz.passMark}% pass</p>
                              </div>
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Active</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingQuiz(quiz)}
                                  className="p-1.5 rounded-lg text-slate-300 dark:text-white/25 hover:text-blue-500 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => removeQuiz(quiz.id)}
                                  className="p-1.5 rounded-lg text-slate-300 dark:text-white/25 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <button onClick={() => setEditingQuiz("new")}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all w-full text-sm font-bold">
                          <Plus className="w-4 h-4" />Add Inline Quiz
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {editingQuiz !== null && (
          <QuizEditor
            quiz={editingQuiz === "new" ? null : editingQuiz}
            onClose={() => setEditingQuiz(null)}
            onSave={saveQuiz}
            sectionId={section.id}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ sections }: { sections: SectionExt[] }) {
  const totalVideos  = sections.reduce((a, s) => a + s.videos.length, 0);
  const totalFiles   = sections.reduce((a, s) => a + s.files.length, 0);
  const totalQuizzes = sections.reduce((a, s) => a + s.quizzes.length, 0);

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Sections", value: sections.length, icon: <Layers className="w-4 h-4" />,      accent: "text-blue-600 dark:text-blue-400",        bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Videos",   value: totalVideos,     icon: <Film className="w-4 h-4" />,         accent: "text-sky-600 dark:text-sky-400",          bg: "bg-sky-50 dark:bg-sky-900/20" },
        { label: "Files",    value: totalFiles,      icon: <Paperclip className="w-4 h-4" />,    accent: "text-emerald-600 dark:text-emerald-400",  bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { label: "Quizzes",  value: totalQuizzes,    icon: <ListChecks className="w-4 h-4" />,   accent: "text-amber-600 dark:text-amber-400",      bg: "bg-amber-50 dark:bg-amber-900/20" },
      ].map(s => (
        <div key={s.label}
          className={`${s.bg} border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 flex items-center gap-3`}>
          <div className={`w-9 h-9 rounded-xl bg-white dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0 ${s.accent}`}>
            {s.icon}
          </div>
          <div>
            <p className={`text-xl font-black ${s.accent}`}>{s.value}</p>
            <p className="text-xs text-slate-400 dark:text-white/30">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Course Selector ──────────────────────────────────────────────────────────

function CoursePicker({ courses, selected, onSelect, loading }: {
  courses: ApiCourse[]; selected: ApiCourse | null; onSelect: (c: ApiCourse) => void; loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all text-left ${
          open ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : selected ? "border-blue-400/60 dark:border-blue-500/40 bg-white dark:bg-[#0d1929]"
          : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1929] hover:border-slate-300 dark:hover:border-white/20"
        }`}>
        {loading ? (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        ) : selected ? (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {selected.img ? <img src={selected.img} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-4 h-4 text-white" />}
          </div>
        ) : (
          <BookOpen className="w-4 h-4 text-slate-400 dark:text-white/30" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {selected ? selected.title : loading ? "Loading courses…" : "Select a course…"}
          </p>
          {selected && <p className="text-[10px] text-slate-400 dark:text-white/30">{selected.level} · {selected.status}</p>}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-white/30 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && courses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 bg-white dark:bg-[#0d1929] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
            {courses.map(c => (
              <button key={c.id} type="button" onClick={() => { onSelect(c); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {c.img ? <img src={c.img} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.title}</p>
                  <p className="text-xs text-slate-400 dark:text-white/40">{c.level} · {c.status}</p>
                </div>
                {selected?.id === c.id && <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorCourseMaterials() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
  const [sections, setSections]             = useState<SectionExt[]>([]);
  const [published, setPublished]           = useState(false);
  const [newTitle, setNewTitle]             = useState("");
  const [addingSection, setAddingSection]   = useState(false);
  const [publishing, setPublishing]         = useState(false);

  // Load instructor's courses
  const { data: coursesRaw, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn:  () => CoursesService.findAll({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });
  const courses = normalizeCourses(coursesRaw) as ApiCourse[];

  // Load selected course detail (sections → lessons → materials)
  const { data: courseDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["course-detail", selectedCourse?.id],
    queryFn:  () => CoursesService.findOne(selectedCourse!.id) as Promise<ApiCourseDetail>,
    enabled:  !!selectedCourse?.id,
    staleTime: 1000 * 60 * 2,
  });

  // Sync API sections → local state when course changes
  useEffect(() => {
    if (courseDetail) {
      const detail = courseDetail as ApiCourseDetail;
      const sectionsWithoutQuizzes = (detail.sections ?? []).map(mapApiSection);
      setSections(sectionsWithoutQuizzes);
      
      // Load quizzes for each section
      sectionsWithoutQuizzes.forEach(async (section) => {
        try {
          const quizData = await QuizService.findAll({ sectionId: section.id });
          const updatedSection = {
            ...section,
            quizzes: quizData.data
          };
          setSections(prev => prev.map(s => s.id === section.id ? updatedSection : s));
        } catch (error) {
          console.error(`Failed to load quizzes for section ${section.id}:`, error);
        }
      });
    }
  }, [courseDetail]);

  // Auto-select course from URL parameter or navigation state
  useEffect(() => {
    const urlCourseId = params.id;
    const stateId = (location.state as { courseId?: string } | null)?.courseId;
    const courseId = urlCourseId || stateId;
    
    if (courseId && courses.length > 0 && !selectedCourse) {
      const match = courses.find(c => c.id === courseId);
      if (match) setSelectedCourse(match);
    }
  }, [courses, location.state, selectedCourse, params.id]);

  // Mutations
  const createSectionMutation = useMutation({
    mutationFn: (title: string) =>
      CoursesService.createSection(selectedCourse!.id, { title, position: sections.length + 1 }) as Promise<ApiSection>,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-detail", selectedCourse?.id] }),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: string) => CoursesService.removeSection(selectedCourse!.id, sectionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-detail", selectedCourse?.id] }),
  });

  const updateSection = (id: string, updates: Partial<SectionExt>) =>
    setSections(p => p.map(s => s.id === id ? { ...s, ...updates } : s));

  const deleteSection = (id: string) => {
    setSections(p => p.filter(s => s.id !== id));
    deleteSectionMutation.mutate(id);
  };

  const addSection = async () => {
    if (!newTitle.trim() || !selectedCourse) return;
    try {
      const created = await createSectionMutation.mutateAsync(newTitle.trim()) as ApiSection;
      setSections(p => [...p, {
        id: created?.id ?? `sec-${Date.now()}`,
        title: newTitle.trim(),
        description: "",
        order: p.length + 1,
        isPublished: false,
        videos: [],
        files: [],
        quizzes: [],
      }]);
      setNewTitle("");
      setAddingSection(false);
    } catch {
      // error handled by react-query
    }
  };

  const onSelect = (c: ApiCourse) => { 
    setSelectedCourse(c); 
    setSections([]); 
    setPublished(false);
    // Navigate to the course-specific URL
    navigate(`/instructor/course-materials/${c.id}`, { replace: true });
  };

  const handlePublish = async () => {
    if (!selectedCourse) return;
    setPublishing(true);
    try {
      await CoursesService.publish(selectedCourse.id);
      setPublished(true);
    } catch {
      setPublishing(false);
    }
  };

  if (published && selectedCourse) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060d18] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 px-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-100 dark:shadow-emerald-900/50">
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Course Published</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{selectedCourse.title}</h2>
            <p className="text-slate-400 dark:text-white/40 text-sm">
              {sections.length} sections · {sections.reduce((a, s) => a + s.quizzes.length, 0)} quizzes
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d18]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-100/50 dark:bg-blue-800/[0.08] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 py-10">
        <div className="space-y-6">

          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-100 dark:shadow-blue-900/30 flex-shrink-0 overflow-hidden">
                {selectedCourse?.img
                  ? <img src={selectedCourse.img} alt="" className="w-full h-full object-cover" />
                  : <BookOpen className="w-5 h-5 text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">Instructor</span>
                  <ChevronRight className="w-3 h-3 text-slate-300 dark:text-white/20" />
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Course Materials</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedCourse ? selectedCourse.title : "Course Materials"}
                </h1>
                {selectedCourse && (
                  <p className="text-xs text-slate-400 dark:text-white/30">{selectedCourse.level} · {selectedCourse.status}</p>
                )}
              </div>
            </div>

            {selectedCourse && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setAddingSection(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900/30 transition-all">
                  <Plus className="w-4 h-4" />New Section
                </button>
                <button onClick={handlePublish} disabled={publishing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-emerald-600 to-teal-700 hover:opacity-90 shadow-md shadow-emerald-100 dark:shadow-emerald-900/30 transition-all disabled:opacity-60">
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {publishing ? "Publishing…" : "Publish Course"}
                </button>
              </div>
            )}
          </motion.div>

          {/* Course picker */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <CoursePicker
              courses={courses}
              selected={selectedCourse}
              onSelect={onSelect}
              loading={coursesLoading}
            />
          </motion.div>

          {/* Loading state */}
          {selectedCourse && detailLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
            </div>
          )}

          {selectedCourse && !detailLoading && (
            <>
              <StatsBar sections={sections} />

              {/* Quick-add inline */}
              <AnimatePresence>
                {addingSection && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#0d1929] border border-blue-300 dark:border-blue-500/30 rounded-2xl">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") addSection();
                          if (e.key === "Escape") { setAddingSection(false); setNewTitle(""); }
                        }}
                        placeholder="Section title, e.g. Module 4: Performance Patterns"
                        className="flex-1 text-sm font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 focus:outline-none" />
                      <div className="flex gap-2">
                        <button onClick={() => { setAddingSection(false); setNewTitle(""); }}
                          className="p-2 rounded-xl text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/60 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={addSection} disabled={!newTitle.trim() || createSectionMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-30 transition-all">
                          {createSectionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sections */}
              <div className="space-y-3">
                <AnimatePresence>
                  {sections.map(section => (
                    <SectionBlock
                      key={section.id}
                      section={section}
                      courseId={selectedCourse.id}
                      onUpdate={updateSection}
                      onDelete={deleteSection}
                    />
                  ))}
                </AnimatePresence>

                {sections.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 py-16 text-slate-300 dark:text-white/20">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center">
                      <BookOpen className="w-8 h-8 opacity-40" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-400 dark:text-white/30 mb-1">No sections yet</p>
                      <p className="text-sm text-slate-300 dark:text-white/20">Add sections to organise your course content.</p>
                    </div>
                    <button onClick={() => setAddingSection(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:opacity-90 transition-all shadow-md">
                      <Plus className="w-4 h-4" />Add First Section
                    </button> 
                  </motion.div>
                )}
              </div>

              {sections.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
                  onClick={() => setAddingSection(true)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.07] text-slate-400 dark:text-white/25 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 flex items-center justify-center gap-2 text-sm font-bold transition-all">
                  <Plus className="w-4 h-4" />Add Another Section
                </motion.button>
              )}
            </>
          )}

          {/* No course selected yet */}
          {!selectedCourse && !coursesLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-20 text-slate-300 dark:text-white/20">
              <BookOpen className="w-12 h-12 opacity-30" />
              <p className="text-slate-400 dark:text-white/30 text-sm">Select a course above to manage its sections and materials.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
