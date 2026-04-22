// src/dashboards/instructor-dashboard/pages/InstructorSingleCourse.tsx
// Route: /instructor/courses/:id

import { useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Edit3, Trash2, Plus, Upload,
  ChevronDown, Loader2, CheckCircle2, Globe, DollarSign,
  Film, FileText, Paperclip, X, Save, Tag, Layers,
  Play, AlertTriangle, Check, Image as ImageIcon,
  Users, Star, TrendingUp, Video, ListChecks, HelpCircle, Package, BarChart3,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CoursesService, { CourseLevel, MaterialType } from "@/services/course.service";
import StorageService from "@/services/storage.service";
import { APIConfig } from "@/lib/api.config";

// ─── Quiz API types (match backend exactly) ───────────────────────────────────

/** Option shape for CREATE — backend requires isCorrect on every option */
interface CreateQuizOptionPayload {
  text: string;
  isCorrect: boolean;
}

interface CreateQuizQuestionPayload {
  text: string;
  options: CreateQuizOptionPayload[];  // exactly 4, exactly 1 isCorrect=true
}

interface CreateQuizPayload {
  title: string;
  sectionId: string;
  passMark: number;
  questions: CreateQuizQuestionPayload[];
}

/** API response option (no isCorrect — backend strips it from response) */
interface ApiQuizOption {
  id: string;
  text: string;
  position: number;
}

interface ApiQuizQuestion {
  id: string;
  text: string;
  position: number;
  options: ApiQuizOption[];
}

interface ApiQuiz {
  id: string;
  sectionId: string;
  title: string;
  passMark: number;
  createdAt: string;
  questions: ApiQuizQuestion[];
}

interface ApiQuizStats {
  totalAttempts: number;
  totalPassed: number;
  passRate: number;
  averageScore: number;
}

// ─── Local editor types (richer than API, tracks correctOptionId in UI) ────────

interface EditorOption {
  text: string;
  isCorrect: boolean;
}

interface EditorQuestion {
  /** Temp client-side ID for React keys, not sent to API */
  _clientId: string;
  text: string;
  options: EditorOption[];  // always 4
}

function blankQuestion(index: number): EditorQuestion {
  return {
    _clientId: `q-${Date.now()}-${index}`,
    text: "",
    options: [
      { text: "", isCorrect: true  },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  };
}

function apiQuizToEditorQuestions(questions: ApiQuizQuestion[]): EditorQuestion[] {
  // The API response does NOT include isCorrect (it's stripped).
  // We default the first option to correct so the editor opens in a valid state.
  // Instructor can change the correct answer before re-saving.
  return questions.map(q => ({
    _clientId: q.id,
    text: q.text,
    options: q.options.map((o, i) => ({
      text: o.text,
      isCorrect: i === 0, // default — instructor corrects if needed
    })),
  }));
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

// ─── Enrollment / domain types ────────────────────────────────────────────────

interface StudentDto {
  id: string;
  userId: string;
  name: string;
  image: string | null;
}

interface EnrollmentResponseDto {
  id: string;
  courseId: string;
  enrolledAt: string;
  student: StudentDto;
  // Student progress data from backend
  lessonsCompleted?: number;
  progressPercentage?: number;
  lastActiveAt?: string;
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

function mapEnrollmentDtoToModel(dto: EnrollmentResponseDto): EnrolledStudent {
  return {
    id:            dto.id,
    studentId:     dto.student.id,
    studentName:   dto.student.name,
    studentEmail:  null,
    studentAvatar: dto.student.image ?? null,
    enrolledAt:    dto.enrolledAt,
    progress:      dto.progressPercentage ?? null,
    status:        null,
    // Map progress data from backend
    lessonsCompleted: dto.lessonsCompleted,
    progressPercentage: dto.progressPercentage,
    lastActiveAt: dto.lastActiveAt,
  };
}

function mapEnrollmentsResponse(raw: EnrollmentResponseDto[]): EnrollmentsResponse {
  const data = raw.map(mapEnrollmentDtoToModel);
  return { data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } };
}

// ─── Material domain types ────────────────────────────────────────────────────

type MaterialFileType = "video" | "audio" | "image" | "doc" | "apk" | "other";

interface SectionMaterial {
  id: string;
  lessonId: string;
  materialId: string;
  type: string;
  title: string;
  url: string;
  fileName: string | null;
  size: number | null;
  fileType: MaterialFileType;
}

interface MaterialSection {
  sectionId: string;
  sectionTitle: string;
  position: number;
  materials: SectionMaterial[];
  quizzes: ApiQuiz[];
}

// ─── Course types ─────────────────────────────────────────────────────────────

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
  _count?: { enrollments?: number; sections?: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function storageFolderFromFile(file: File): "course-videos" | "lesson-materials" {
  return file.type.startsWith("video/") ? "course-videos" : "lesson-materials";
}

function resolveFileType(apiType: string, fileName: string | null): MaterialFileType {
  if (apiType === "VIDEO") return "video";
  if (apiType === "AUDIO") return "audio";
  const ext = (fileName ?? "").split(".").pop()?.toLowerCase() ?? "";
  if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return "image";
  if (["apk","aab"].includes(ext)) return "apk";
  if (["pdf","doc","docx","ppt","pptx","xls","xlsx","txt","md"].includes(ext)) return "doc";
  return "other";
}

// ─── Static lookup tables ─────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:     { label: "Draft",     color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-900/20",     border: "border-amber-200 dark:border-amber-800/40" },
  PUBLISHED: { label: "Published", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/40" },
  ARCHIVED:  { label: "Archived",  color: "text-gray-500 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-white/[0.05]",     border: "border-gray-200 dark:border-white/[0.08]" },
};

const MATERIAL_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  VIDEO:    { icon: <Film className="w-3.5 h-3.5" />,      color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-100 dark:bg-blue-900/30" },
  DOCUMENT: { icon: <FileText className="w-3.5 h-3.5" />,  color: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-100 dark:bg-sky-900/30" },
  AUDIO:    { icon: <Play className="w-3.5 h-3.5" />,      color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-100 dark:bg-violet-900/30" },
  LINK:     { icon: <Globe className="w-3.5 h-3.5" />,     color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  OTHER:    { icon: <Paperclip className="w-3.5 h-3.5" />, color: "text-gray-500 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-white/[0.06]" },
};

const FILE_TYPE_META: Record<MaterialFileType, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  video: { icon: <Film className="w-4 h-4" />,      color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-100 dark:bg-blue-900/30",       label: "Video" },
  audio: { icon: <Play className="w-4 h-4" />,      color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-100 dark:bg-violet-900/30",   label: "Audio" },
  image: { icon: <ImageIcon className="w-4 h-4" />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "Image" },
  doc:   { icon: <FileText className="w-4 h-4" />,  color: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-100 dark:bg-sky-900/30",         label: "Document" },
  apk:   { icon: <Package className="w-4 h-4" />,   color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-100 dark:bg-amber-900/30",     label: "APK" },
  other: { icon: <Paperclip className="w-4 h-4" />, color: "text-gray-500 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-white/[0.06]",      label: "File" },
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

// ─── Quiz Stats Modal ─────────────────────────────────────────────────────────

function QuizStatsModal({ quizId, quizTitle, onClose }: {
  quizId: string; quizTitle: string; onClose: () => void;
}) {
  const { data: stats, isLoading } = useQuery<ApiQuizStats>({
    queryKey: ["quiz-stats", quizId],
    queryFn: async () => {
      const res = await APIConfig.fetch(`/quizzes/${quizId}/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-white text-sm">Quiz Stats</h2>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">{quizTitle}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Attempts",  val: stats.totalAttempts,              color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20" },
                { label: "Passed",          val: stats.totalPassed,                color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                { label: "Pass Rate",       val: `${stats.passRate.toFixed(0)}%`,  color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
                { label: "Avg Score",       val: `${stats.averageScore.toFixed(0)}%`, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No stats available.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Quiz Editor Modal — wired to real API ─────────────────────────────────────

function QuizEditorModal({
  existingQuiz,
  sectionId,
  onSaved,
  onClose,
}: {
  existingQuiz: ApiQuiz | null;   // null = create, non-null = edit (delete + recreate)
  sectionId: string;
  onSaved: (quiz: ApiQuiz) => void;
  onClose: () => void;
}) {
  const isEdit = existingQuiz !== null;

  const [title, setTitle]       = useState(existingQuiz?.title ?? "");
  const [passMark, setPassMark] = useState(existingQuiz?.passMark ?? 70);
  const [questions, setQuestions] = useState<EditorQuestion[]>(
    existingQuiz ? apiQuizToEditorQuestions(existingQuiz.questions) : [blankQuestion(0)]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const addQuestion = () => {
    setQuestions(p => [...p, blankQuestion(p.length)]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(p => p.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx: number, text: string) => {
    setQuestions(p => p.map((q, i) => i === idx ? { ...q, text } : q));
  };

  const updateOptionText = (qIdx: number, oIdx: number, text: string) => {
    setQuestions(p => p.map((q, i) =>
      i !== qIdx ? q : {
        ...q,
        options: q.options.map((o, oi) => oi === oIdx ? { ...o, text } : o),
      }
    ));
  };

  const setCorrectOption = (qIdx: number, oIdx: number) => {
    setQuestions(p => p.map((q, i) =>
      i !== qIdx ? q : {
        ...q,
        options: q.options.map((o, oi) => ({ ...o, isCorrect: oi === oIdx })),
      }
    ));
  };

  const validate = (): string | null => {
    if (!title.trim()) return "Quiz title is required.";
    if (questions.length === 0) return "Add at least one question.";
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      if (!q.text.trim()) return `Question ${qi + 1} text is empty.`;
      if (q.options.length !== 4) return `Question ${qi + 1} must have exactly 4 options.`;
      for (let oi = 0; oi < q.options.length; oi++) {
        if (!q.options[oi].text.trim()) return `Question ${qi + 1}, Option ${oi + 1} is empty.`;
      }
      const correctCount = q.options.filter(o => o.isCorrect).length;
      if (correctCount !== 1) return `Question ${qi + 1} must have exactly one correct answer.`;
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSaving(true);
    setError(null);

    try {
      // If editing, delete the old quiz first (API only supports title/passMark PATCH,
      // questions can't be changed — must delete+recreate per API design)
      if (isEdit && existingQuiz) {
        await APIConfig.fetch(`/quizzes/${existingQuiz.id}`, { method: "DELETE" });
      }

      // Build the payload — every option must have isCorrect: true or false
      const payload: CreateQuizPayload = {
        title:     title.trim(),
        sectionId,
        passMark,
        questions: questions.map(q => ({
          text:    q.text.trim(),
          options: q.options.map(o => ({
            text:      o.text.trim(),
            isCorrect: o.isCorrect,   // always pass this — backend requires it
          })),
        })),
      };

      const res = await APIConfig.fetch("/quizzes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `Failed: ${res.status}`);
      }

      const created: ApiQuiz = await res.json();
      onSaved(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  const canSave = !saving && title.trim().length > 0 && questions.length > 0;

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
        className="w-full max-w-2xl my-8 bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-white text-sm">
                {isEdit ? "Edit Quiz" : "Create Quiz"}
              </h2>
              {isEdit && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                  Editing deletes the old quiz and recreates it
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/[0.07] border border-red-200 dark:border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Title + Pass Mark */}
          <div className="grid grid-cols-[1fr_130px] gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Quiz Title *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Module 1 Knowledge Check"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Pass Mark (%)</label>
              <input
                type="number" min={0} max={100} value={passMark}
                onChange={e => setPassMark(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700 dark:text-white/70">
                Questions ({questions.length})
              </p>
              <button
                onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            <AnimatePresence>
              {questions.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-gray-300 dark:text-white/20">
                  <HelpCircle className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No questions yet.</p>
                </div>
              )}

              {questions.map((q, qi) => (
                <motion.div
                  key={q._clientId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden"
                >
                  {/* Question header */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/[0.06] flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-white/30 flex-shrink-0">
                      Q{qi + 1}
                    </span>
                    <input
                      value={q.text}
                      onChange={e => updateQuestionText(qi, e.target.value)}
                      placeholder="Enter question text…"
                      className="flex-1 text-sm font-semibold bg-transparent text-gray-800 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none"
                    />
                    <button
                      onClick={() => removeQuestion(qi)}
                      className="p-1 text-gray-300 dark:text-white/20 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Options — all 4 always shown, radio selects correct */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        {/* Radio button — sets isCorrect=true for this option, false for others */}
                        <button
                          onClick={() => setCorrectOption(qi, oi)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                            opt.isCorrect
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-gray-300 dark:border-white/20 hover:border-emerald-400"
                          }`}
                          title="Mark as correct answer"
                        >
                          {opt.isCorrect && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <input
                          value={opt.text}
                          onChange={e => updateOptionText(qi, oi, e.target.value)}
                          placeholder={`Option ${oi + 1}${oi === 0 ? " (correct by default)" : ""}`}
                          className={`flex-1 text-sm px-3 py-2 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                            opt.isCorrect
                              ? "border-emerald-300 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/10 focus:ring-emerald-500/20"
                              : "border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] focus:ring-blue-500/20"
                          } text-gray-700 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Correct answer indicator */}
                  <div className="px-4 pb-3">
                    <p className="text-[10px] text-gray-400">
                      ✓ Correct: <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {q.options.find(o => o.isCorrect)?.text?.trim() || "Option 1 (set text above)"}
                      </span>
                      <span className="ml-2 text-gray-300">· click a radio to change</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.07] flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-white/[0.02]">
          <p className="text-[10px] text-gray-400">
            {questions.length} question{questions.length !== 1 ? "s" : ""} · {passMark}% pass mark
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-all"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" />{isEdit ? "Updating…" : "Creating…"}</>
                : <><Save className="w-4 h-4" />{isEdit ? "Update Quiz" : "Create Quiz"}</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Lesson Row ───────────────────────────────────────────────────────────────

function LessonRow({ lesson, courseId, sectionId }: {
  lesson: CourseLesson; courseId: string; sectionId: string;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded]     = useState(false);
  const [editTitle, setEditTitle]   = useState(false);
  const [titleDraft, setTitleDraft] = useState(lesson.title);
  const [uploading, setUploading]   = useState(false);
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

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await StorageService.upload(storageFolderFromFile(file), file);
        await CoursesService.addMaterial(courseId, sectionId, lesson.id, {
          type: materialTypeFromFile(file), title: file.name.replace(/\.[^/.]+$/, ""),
          url, fileName: file.name, size: file.size,
        });
      }
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } finally { setUploading(false); }
  };

  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/60 dark:bg-white/[0.02]">
        <button onClick={() => setExpanded(p => !p)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          </motion.div>
          {editTitle ? (
            <input autoFocus value={titleDraft} onChange={e => setTitleDraft(e.target.value)}
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
          {lesson.materials.length > 0 && (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-md flex-shrink-0">
              {lesson.materials.length} files
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
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-3 space-y-2">
              {lesson.materials.length > 0 ? lesson.materials.map(mat => {
                const meta = MATERIAL_ICONS[mat.type] ?? MATERIAL_ICONS.OTHER;
                return (
                  <div key={mat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.05] group">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>{meta.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{mat.title}</p>
                      {mat.size && <p className="text-[10px] text-gray-400">{formatSize(mat.size)}</p>}
                    </div>
                    <a href={mat.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline flex-shrink-0">Open</a>
                    <button onClick={() => removeMaterial(mat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              }) : <p className="text-xs text-gray-400 italic py-1">No materials yet.</p>}
              <input ref={fileRef} type="file" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-gray-500 text-xs font-bold hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 disabled:opacity-50 transition-all">
                {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</> : <><Upload className="w-3.5 h-3.5" /> Upload video or file</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Block (Curriculum tab) ──────────────────────────────────────────

function SectionBlock({ section, courseId, index }: {
  section: CourseSection; courseId: string; index: number;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded]         = useState(true);
  const [editTitle, setEditTitle]       = useState(false);
  const [titleDraft, setTitleDraft]     = useState(section.title);
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
      title: lessonTitle.trim(), position: section.lessons.length + 1,
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
            <input autoFocus value={titleDraft} onChange={e => setTitleDraft(e.target.value)}
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
                      <input autoFocus value={lessonTitle} onChange={e => setLessonTitle(e.target.value)}
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
      title: sectionTitle.trim(), position: (course.sections?.length ?? 0) + 1,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      setSectionTitle(""); setAddingSection(false);
    },
  });

  const totalLessons   = (course.sections ?? []).reduce((a, s) => a + s.lessons.length, 0);
  const totalMaterials = (course.sections ?? []).reduce((a, s) =>
    a + s.lessons.reduce((b, l) => b + l.materials.length, 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-gray-400">
          {course.sections?.length ?? 0} sections · {totalLessons} lessons · {totalMaterials} files
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/instructor/upload-video`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
            <Video className="w-3.5 h-3.5" /> Bulk Upload Videos
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
              <input autoFocus value={sectionTitle} onChange={e => setSectionTitle(e.target.value)}
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
        return mapEnrollmentsResponse(raw);
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
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
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
              <div key={student.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
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

// ─── Upload Drop Zone ─────────────────────────────────────────────────────────

function UploadDropZone({ label, accept, onFiles, uploading }: {
  label: string; accept: string; onFiles: (f: File[]) => void; uploading?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); if (!uploading) onFiles(Array.from(e.dataTransfer.files)); }}
      onClick={() => !uploading && ref.current?.click()}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
        uploading ? "opacity-60 cursor-not-allowed border-gray-200 dark:border-white/[0.07]"
          : dragging ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-white/[0.07] hover:border-blue-400 dark:hover:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-900/10"
      }`}
    >
      <input ref={ref} type="file" accept={accept} multiple className="hidden"
        onChange={e => { if (e.target.files) onFiles(Array.from(e.target.files)); }} />
      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
        {uploading ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <Upload className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{uploading ? "Uploading…" : label}</p>
        <p className="text-xs text-gray-400 dark:text-white/25">Click or drag & drop</p>
      </div>
    </div>
  );
}

// ─── Materials Section Block ──────────────────────────────────────────────────

function MaterialsSectionBlock({ sec, courseId }: {
  sec: MaterialSection; courseId: string;
}) {
  const qc = useQueryClient();

  const [expanded, setExpanded]   = useState(true);
  const [subTab, setSubTab]       = useState<"all"|"video"|"audio"|"image"|"doc"|"quizzes">("all");
  const [editingQuiz, setEditingQuiz] = useState<ApiQuiz | null | "new">(null);
  const [statsQuiz, setStatsQuiz]     = useState<ApiQuiz | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingFile, setUploadingFile]   = useState(false);

  // ── Fetch quizzes for this section from the real API ──
  const { data: quizzesData, refetch: refetchQuizzes } = useQuery<{ data: ApiQuiz[] }>({
    queryKey: ["section-quizzes", sec.sectionId],
    queryFn: async () => {
      const res = await APIConfig.fetch(`/quizzes?sectionId=${sec.sectionId}&limit=100`);
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

  const quizzes: ApiQuiz[] = quizzesData?.data ?? [];

  const videos = sec.materials.filter(m => m.fileType === "video");
  const audios = sec.materials.filter(m => m.fileType === "audio");
  const images = sec.materials.filter(m => m.fileType === "image");
  const docs   = sec.materials.filter(m => ["doc","apk","other"].includes(m.fileType));

  const visibleMaterials =
    subTab === "video" ? videos : subTab === "audio" ? audios :
    subTab === "image" ? images : subTab === "doc"   ? docs   : sec.materials;

  const SUB_TABS = [
    { id: "all"     as const, label: "All",     count: sec.materials.length },
    { id: "video"   as const, label: "Videos",  count: videos.length },
    { id: "audio"   as const, label: "Audio",   count: audios.length },
    { id: "image"   as const, label: "Images",  count: images.length },
    { id: "doc"     as const, label: "Docs",    count: docs.length },
    { id: "quizzes" as const, label: "Quizzes", count: quizzes.length },
  ].filter(t => t.id === "all" || t.id === "quizzes" || t.count > 0);

  const handleUpload = async (files: File[], isVideo: boolean) => {
    if (isVideo) setUploadingVideo(true); else setUploadingFile(true);
    try {
      for (const file of files) {
        const url    = await StorageService.upload(storageFolderFromFile(file), file);
        const lesson = await CoursesService.createLesson(courseId, sec.sectionId, {
          title: file.name.replace(/\.[^/.]+$/, ""), position: sec.materials.length + 1,
        }) as { id: string };
        await CoursesService.addMaterial(courseId, sec.sectionId, lesson.id, {
          type: materialTypeFromFile(file), title: file.name, url, fileName: file.name, size: file.size,
        });
      }
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } catch (err) { console.error("Upload failed:", err); }
    finally { if (isVideo) setUploadingVideo(false); else setUploadingFile(false); }
  };

  const handleDeleteMaterial = async (mat: SectionMaterial) => {
    try {
      await CoursesService.removeMaterial(courseId, sec.sectionId, mat.lessonId, mat.materialId);
      qc.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    } catch (err) { console.error("Delete failed:", err); }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await APIConfig.fetch(`/quizzes/${quizId}`, { method: "DELETE" });
      refetchQuizzes();
    } catch (err) { console.error("Delete quiz failed:", err); }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#0f1623]">
        {/* Section header */}
        <div className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
          onClick={() => setExpanded(p => !p)}>
          <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{sec.position}</span>
          </div>
          <h3 className="flex-1 text-sm font-black text-gray-900 dark:text-white truncate">{sec.sectionTitle}</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] font-bold" onClick={e => e.stopPropagation()}>
            {videos.length > 0 && <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">{videos.length}v</span>}
            {audios.length > 0 && <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400">{audios.length}a</span>}
            {images.length > 0 && <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">{images.length}i</span>}
            {docs.length   > 0 && <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400">{docs.length}d</span>}
            {quizzes.length > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">{quizzes.length}q</span>}
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
                <div className="flex gap-0.5 px-5 pt-3 overflow-x-auto">
                  {SUB_TABS.map(t => (
                    <button key={t.id} onClick={() => setSubTab(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                        subTab === t.id
                          ? "text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                          : "text-gray-400 dark:text-white/25 border-transparent hover:text-gray-600 dark:hover:text-white/50"
                      }`}>
                      {t.label}
                      {t.count > 0 && (
                        <span className={`px-1.5 rounded-full text-[10px] font-black ${
                          subTab === t.id ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-white/30"
                        }`}>{t.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="px-5 pb-5 pt-3 space-y-2">
                  <AnimatePresence mode="wait">
                    {subTab !== "quizzes" ? (
                      <motion.div key={subTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                        {visibleMaterials.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-6 text-gray-300 dark:text-white/20 text-center">
                            <Paperclip className="w-6 h-6 opacity-40" />
                            <p className="text-sm">No {subTab === "all" ? "materials" : subTab + " files"} here yet.</p>
                          </div>
                        )}
                        <AnimatePresence>
                          {visibleMaterials.map(mat => {
                            const meta = FILE_TYPE_META[mat.fileType];
                            return (
                              <motion.div key={mat.id}
                                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] group transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>{meta.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{mat.title}</p>
                                  <p className="text-[10px] text-gray-400">{meta.label}{mat.size ? ` · ${formatSize(mat.size)}` : ""}</p>
                                </div>
                                <a href={mat.url} target="_blank" rel="noreferrer"
                                  className="text-[10px] text-blue-500 hover:underline flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={e => e.stopPropagation()}>Open</a>
                                <button onClick={() => handleDeleteMaterial(mat)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                        <div className="pt-1 space-y-2">
                          <UploadDropZone label="Upload Video" accept="video/*"
                            onFiles={f => handleUpload(f, true)} uploading={uploadingVideo} />
                          <UploadDropZone label="Upload Audio, Image, PDF, Slides, APK or any file"
                            accept="audio/*,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.apk,*/*"
                            onFiles={f => handleUpload(f, false)} uploading={uploadingFile} />
                        </div>
                      </motion.div>
                    ) : (
                      /* ── Quizzes sub-tab ── */
                      <motion.div key="quizzes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        {quizzes.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-6 text-gray-300 dark:text-white/20">
                            <HelpCircle className="w-6 h-6 opacity-40" />
                            <p className="text-sm">No quizzes in this section yet.</p>
                          </div>
                        )}
                        <AnimatePresence>
                          {quizzes.map(quiz => (
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
                              {/* Always "live" since the API persists them */}
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 flex-shrink-0">
                                <CheckCircle2 className="w-3 h-3" />Live
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setStatsQuiz(quiz)}
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all"
                                  title="View stats">
                                  <BarChart3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setEditingQuiz(quiz)}
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-900/20 transition-all"
                                  title="Edit quiz">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteQuiz(quiz.id)}
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all"
                                  title="Delete quiz">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        <button onClick={() => setEditingQuiz("new")}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all w-full text-sm font-bold">
                          <Plus className="w-4 h-4" /> Create Quiz
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

      {/* Quiz Editor Modal */}
      <AnimatePresence>
        {editingQuiz !== null && (
          <QuizEditorModal
            key="quiz-editor"
            existingQuiz={editingQuiz === "new" ? null : editingQuiz}
            sectionId={sec.sectionId}
            onSaved={() => { refetchQuizzes(); setEditingQuiz(null); }}
            onClose={() => setEditingQuiz(null)}
          />
        )}
      </AnimatePresence>

      {/* Quiz Stats Modal */}
      <AnimatePresence>
        {statsQuiz && (
          <QuizStatsModal
            key="quiz-stats"
            quizId={statsQuiz.id}
            quizTitle={statsQuiz.title}
            onClose={() => setStatsQuiz(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Materials Tab ────────────────────────────────────────────────────────────

function MaterialsTab({ course, courseId }: { course: CourseDetail; courseId: string }) {
  const materialSections: MaterialSection[] = (course.sections ?? []).map(section => ({
    sectionId:    section.id,
    sectionTitle: section.title,
    position:     section.position,
    quizzes:      [],   // quizzes are fetched per-section inside MaterialsSectionBlock
    materials:    section.lessons.flatMap(lesson =>
      lesson.materials.map(mat => ({
        id:         `${lesson.id}::${mat.id}`,
        lessonId:   lesson.id,
        materialId: mat.id,
        type:       mat.type,
        title:      mat.title,
        url:        mat.url,
        fileName:   mat.fileName,
        size:       mat.size,
        fileType:   resolveFileType(mat.type, mat.fileName),
      }))
    ),
  }));

  const totalVideos = materialSections.reduce((a, s) => a + s.materials.filter(m => m.fileType === "video").length, 0);
  const totalFiles  = materialSections.reduce((a, s) => a + s.materials.filter(m => m.fileType !== "video").length, 0);

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Sections", val: materialSections.length, color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20",    icon: <Layers className="w-4 h-4" /> },
          { label: "Videos",   val: totalVideos,             color: "text-violet-600 dark:text-violet-400",bg: "bg-violet-50 dark:bg-violet-900/20",icon: <Film className="w-4 h-4" /> },
          { label: "Files",    val: totalFiles,              color: "text-sky-600 dark:text-sky-400",      bg: "bg-sky-50 dark:bg-sky-900/20",      icon: <Paperclip className="w-4 h-4" /> },
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

      {materialSections.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
            <Paperclip className="w-7 h-7 text-gray-300 dark:text-gray-600" />
          </div>
          <div>
            <p className="font-bold text-gray-500 dark:text-gray-400">No sections yet</p>
            <p className="text-sm text-gray-400 mt-1">Create sections in the Curriculum tab first.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {materialSections.map(sec => (
            <MaterialsSectionBlock key={sec.sectionId} sec={sec} courseId={courseId} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function InstructorSingleCourse() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"curriculum"|"overview"|"students"|"materials">("curriculum");

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
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-7 h-7 text-blue-500 animate-spin" /></div>;
  }

  const statusCfg    = STATUS_STYLE[course.status] ?? STATUS_STYLE.DRAFT;
  const isPublished  = course.status === "PUBLISHED";
  const isArchived   = course.status === "ARCHIVED";
  const enrollments  = course._count?.enrollments ?? 0;
  const totalLessons = (course.sections ?? []).reduce((a, s) => a + s.lessons.length, 0);
  const totalMats    = (course.sections ?? []).reduce((a, s) =>
    a + s.lessons.reduce((b, l) => b + l.materials.length, 0), 0);

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
        <div className="h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative overflow-visible">
          {course.img && <img src={course.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    {course.badge}
                  </span>
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
              { icon: Users,      val: String(enrollments),                  sub: "Students" },
              { icon: Layers,     val: String(course.sections?.length ?? 0), sub: "Sections" },
              { icon: Star,       val: String(totalLessons),                 sub: "Lessons"  },
              { icon: TrendingUp, val: `$${(course.price ?? 0).toFixed(0)}`,sub: "Price"    },
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
      <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
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