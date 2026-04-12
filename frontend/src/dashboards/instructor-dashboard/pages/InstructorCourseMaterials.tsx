// src/dashboards/instructor/pages/InstructorCourseMaterials.tsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Plus, Upload, Video, FileText, Image as ImageIcon,
  Package, X, Edit3, Trash2, GripVertical, Clock,
  CheckCircle2, Circle, ChevronRight,
  BookOpen, ListChecks, Paperclip, Eye, EyeOff, Save,
  HelpCircle, Check, Layers, Film,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FileType = "video" | "doc" | "image" | "apk" | "other";

interface CourseFile {
  id: string;
  name: string;
  type: FileType;
  size: string;
  url: string;
  uploadedAt: string;
  duration?: string; // for videos
}

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
}

interface InlineQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  isPublished: boolean;
  passMark: number; // percentage
}

interface Section {
  id: string;
  title: string;
  description: string;
  videos: CourseFile[];
  files: CourseFile[];
  quizzes: InlineQuiz[];
  isPublished: boolean;
  order: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
  totalStudents: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_COURSE: Course = {
  id: "crs-001",
  name: "Advanced React Patterns",
  code: "WEB-401",
  color: "from-blue-600 to-blue-700",
  icon: "⚛️",
  totalStudents: 124,
};

const MOCK_SECTIONS: Section[] = [
  {
    id: "sec-001",
    title: "Module 1: Foundations & Setup",
    description: "Core concepts and environment configuration",
    order: 1,
    isPublished: true,
    videos: [
      { id: "v-001", name: "Introduction to Advanced Patterns.mp4", type: "video", size: "248 MB", url: "#", uploadedAt: "2024-03-10", duration: "18:42" },
      { id: "v-002", name: "Setting Up Your Dev Environment.mp4", type: "video", size: "182 MB", url: "#", uploadedAt: "2024-03-10", duration: "12:15" },
    ],
    files: [
      { id: "f-001", name: "Module 1 Slides.pdf", type: "doc", size: "4.2 MB", url: "#", uploadedAt: "2024-03-10" },
      { id: "f-002", name: "Starter Code Template.zip", type: "apk", size: "1.8 MB", url: "#", uploadedAt: "2024-03-10" },
      { id: "f-003", name: "Architecture Diagram.png", type: "image", size: "540 KB", url: "#", uploadedAt: "2024-03-10" },
    ],
    quizzes: [
      {
        id: "q-001",
        title: "Module 1 Knowledge Check",
        passMark: 70,
        isPublished: true,
        questions: [
          {
            id: "qq-001",
            question: "Which hook is best suited for memoizing expensive computations?",
            options: [
              { id: "o-1", text: "useState" },
              { id: "o-2", text: "useMemo" },
              { id: "o-3", text: "useCallback" },
              { id: "o-4", text: "useRef" },
            ],
            correctOptionId: "o-2",
            explanation: "useMemo caches the result of a computation between renders.",
          },
          {
            id: "qq-002",
            question: "What does the Context API primarily solve?",
            options: [
              { id: "o-1", text: "Async data fetching" },
              { id: "o-2", text: "Performance optimization" },
              { id: "o-3", text: "Prop drilling" },
              { id: "o-4", text: "Global state mutation" },
            ],
            correctOptionId: "o-3",
            explanation: "Context avoids passing props through intermediate components.",
          },
        ],
      },
    ],
  },
  {
    id: "sec-002",
    title: "Module 2: Compound Components",
    description: "Building flexible, composable UI components",
    order: 2,
    isPublished: true,
    videos: [
      { id: "v-003", name: "Compound Component Pattern.mp4", type: "video", size: "310 MB", url: "#", uploadedAt: "2024-03-15", duration: "24:08" },
    ],
    files: [
      { id: "f-004", name: "Compound Components Cheatsheet.pdf", type: "doc", size: "2.1 MB", url: "#", uploadedAt: "2024-03-15" },
    ],
    quizzes: [],
  },
  {
    id: "sec-003",
    title: "Module 3: State Management Deep Dive",
    description: "Zustand, Jotai, and custom solutions",
    order: 3,
    isPublished: false,
    videos: [],
    files: [
      { id: "f-005", name: "State Management Comparison.xlsx", type: "doc", size: "890 KB", url: "#", uploadedAt: "2024-03-18" },
    ],
    quizzes: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FILE_ICONS: Record<FileType, { icon: React.ReactNode; color: string; bg: string }> = {
  video: { icon: <Film className="w-4 h-4" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  doc:   { icon: <FileText className="w-4 h-4" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  image: { icon: <ImageIcon className="w-4 h-4" />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  apk:   { icon: <Package className="w-4 h-4" />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  other: { icon: <Paperclip className="w-4 h-4" />, color: "text-gray-500", bg: "bg-gray-100 dark:bg-white/[0.06]" },
};

function getFileType(name: string): FileType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "mov", "webm", "avi"].includes(ext)) return "video";
  if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt"].includes(ext)) return "doc";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) return "image";
  if (["apk", "zip", "rar", "tar", "gz"].includes(ext)) return "apk";
  return "other";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Card wrapper matching existing UI
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white dark:bg-[#131c2e] border border-gray-100 dark:border-white/[0.07] rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

// File row component
function FileRow({
  file, onDelete,
}: {
  file: CourseFile;
  onDelete: (id: string) => void;
}) {
  const meta = FILE_ICONS[file.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] group transition-colors"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
        <p className="text-xs text-gray-400">{file.size} · {file.uploadedAt}</p>
      </div>
      {file.duration && (
        <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
          <Clock className="w-3 h-3" />{file.duration}
        </span>
      )}
      <button
        onClick={() => onDelete(file.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// Upload drop zone
function UploadZone({
  label, accept, onFiles,
}: {
  label: string;
  accept: string;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
        dragging
          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-white/[0.1] hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
      }`}
    >
      <input ref={inputRef} type="file" accept={accept} multiple className="hidden"
        onChange={e => { if (e.target.files) onFiles(Array.from(e.target.files)); }} />
      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
        <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-xs text-gray-400">Click or drag & drop</p>
      </div>
    </div>
  );
}

// Quiz editor
function QuizEditor({
  quiz, onSave, onClose,
}: {
  quiz: InlineQuiz | null;
  onClose: () => void;
  onSave: (quiz: InlineQuiz) => void;
}) {
  const [title, setTitle] = useState(quiz?.title ?? "");
  const [passMark, setPassMark] = useState(quiz?.passMark ?? 70);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    quiz?.questions ?? []
  );
  const [isPublished, setIsPublished] = useState(quiz?.isPublished ?? false);

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: `qq-${Date.now()}`,
      question: "",
      options: [
        { id: "o-1", text: "" },
        { id: "o-2", text: "" },
        { id: "o-3", text: "" },
        { id: "o-4", text: "" },
      ],
      correctOptionId: "o-1",
    };
    setQuestions(p => [...p, newQ]);
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions(p => p.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateOption = (qId: string, oId: string, text: string) => {
    setQuestions(p => p.map(q =>
      q.id !== qId ? q : {
        ...q,
        options: q.options.map(o => o.id === oId ? { ...o, text } : o),
      }
    ));
  };

  const deleteQuestion = (id: string) => setQuestions(p => p.filter(q => q.id !== id));

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: quiz?.id ?? `q-${Date.now()}`,
      title, passMark, questions, isPublished,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="font-black text-gray-900 dark:text-white">
              {quiz ? "Edit Quiz" : "New Inline Quiz"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Title + pass mark */}
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Quiz Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Module 1 Knowledge Check"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Pass Mark (%)</label>
              <input
                type="number" min={0} max={100}
                value={passMark}
                onChange={e => setPassMark(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Questions ({questions.length})</p>
              <button onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all">
                <Plus className="w-3.5 h-3.5" />Add Question
              </button>
            </div>

            <AnimatePresence>
              {questions.map((q, qi) => (
                <motion.div key={q.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-gray-100 dark:border-white/[0.07] rounded-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.07] flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">Q{qi + 1}</span>
                    <input
                      value={q.question}
                      onChange={e => updateQuestion(q.id, { question: e.target.value })}
                      placeholder="Enter question text..."
                      className="flex-1 text-sm font-semibold bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none"
                    />
                    <button onClick={() => deleteQuestion(q.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-2">
                    {q.options.map(opt => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuestion(q.id, { correctOptionId: opt.id })}
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all border-2 ${
                            q.correctOptionId === opt.id
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-gray-300 dark:border-white/[0.2]"
                          }`}
                        >
                          {q.correctOptionId === opt.id && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <input
                          value={opt.text}
                          onChange={e => updateOption(q.id, opt.id, e.target.value)}
                          placeholder={`Option ${opt.id.replace("o-", "")}`}
                          className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-3">
                    <input
                      value={q.explanation ?? ""}
                      onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                      placeholder="Explanation (shown after answer)..."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-500 dark:text-gray-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {questions.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
                <HelpCircle className="w-8 h-8 opacity-30" />
                <p className="text-sm">No questions yet. Add one above.</p>
              </div>
            )}
          </div>

          {/* Publish toggle + Save */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.07]">
            <button
              onClick={() => setIsPublished(p => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                isPublished
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                  : "border-gray-200 dark:border-white/[0.07] text-gray-500"
              }`}
            >
              {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {isPublished ? "Published" : "Draft"}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || questions.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:opacity-90 disabled:opacity-40 transition-all shadow-md"
            >
              <Save className="w-4 h-4" />Save Quiz
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Section component
function SectionBlock({
  section,
  onUpdateSection,
  onDeleteSection,
}: {
  section: Section;
  onUpdateSection: (id: string, updates: Partial<Section>) => void;
  onDeleteSection: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"videos" | "files" | "quizzes">("videos");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  const [editingQuiz, setEditingQuiz] = useState<InlineQuiz | null | "new">(null);

  const totalVideos = section.videos.length;
  const totalFiles = section.files.length;
  const totalQuizzes = section.quizzes.length;

  const handleAddFiles = (rawFiles: File[], type: "videos" | "files") => {
    const newFiles: CourseFile[] = rawFiles.map(f => ({
      id: `f-${Date.now()}-${Math.random()}`,
      name: f.name,
      type: getFileType(f.name),
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      url: "#",
      uploadedAt: new Date().toISOString().split("T")[0],
    }));
    if (type === "videos") {
      onUpdateSection(section.id, { videos: [...section.videos, ...newFiles] });
    } else {
      onUpdateSection(section.id, { files: [...section.files, ...newFiles] });
    }
  };

  const deleteFile = (id: string, type: "videos" | "files") => {
    if (type === "videos") {
      onUpdateSection(section.id, { videos: section.videos.filter(v => v.id !== id) });
    } else {
      onUpdateSection(section.id, { files: section.files.filter(f => f.id !== id) });
    }
  };

  const saveQuiz = (quiz: InlineQuiz) => {
    const exists = section.quizzes.some(q => q.id === quiz.id);
    const updated = exists
      ? section.quizzes.map(q => q.id === quiz.id ? quiz : q)
      : [...section.quizzes, quiz];
    onUpdateSection(section.id, { quizzes: updated });
    setEditingQuiz(null);
  };

  const deleteQuiz = (id: string) => {
    onUpdateSection(section.id, { quizzes: section.quizzes.filter(q => q.id !== id) });
  };

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="border border-gray-100 dark:border-white/[0.07] rounded-2xl overflow-hidden bg-white dark:bg-[#0f1623]">

        {/* Section Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
          onClick={() => setExpanded(p => !p)}
        >
          <GripVertical className="w-4 h-4 text-gray-300 dark:text-white/[0.2] flex-shrink-0 cursor-grab" />

          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${MOCK_COURSE.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Layers className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
            {editingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={() => {
                  onUpdateSection(section.id, { title: titleDraft });
                  setEditingTitle(false);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") { onUpdateSection(section.id, { title: titleDraft }); setEditingTitle(false); }
                  if (e.key === "Escape") { setTitleDraft(section.title); setEditingTitle(false); }
                }}
                className="w-full text-sm font-black bg-transparent text-gray-900 dark:text-white focus:outline-none border-b border-blue-400"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">{section.title}</h3>
                <button onClick={() => setEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all">
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            {/* Stats pills */}
            {totalVideos > 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
                <Video className="w-3 h-3" />{totalVideos}
              </span>
            )}
            {totalFiles > 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
                <Paperclip className="w-3 h-3" />{totalFiles}
              </span>
            )}
            {totalQuizzes > 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                <ListChecks className="w-3 h-3" />{totalQuizzes}
              </span>
            )}

            {/* Published toggle */}
            <button
              onClick={() => onUpdateSection(section.id, { isPublished: !section.isPublished })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                section.isPublished
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                  : "text-gray-400 bg-gray-100 dark:bg-white/[0.06]"
              }`}
            >
              {section.isPublished ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
              {section.isPublished ? "Live" : "Draft"}
            </button>

            <button onClick={() => onDeleteSection(section.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <motion.div animate={{ rotate: expanded ? 0 : -90 }} className="flex-shrink-0">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>

        {/* Section Body */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 dark:border-white/[0.07]">
                {/* Tab Bar */}
                <div className="flex gap-1 px-5 pt-4 pb-0">
                  {[
                    { id: "videos", label: "Videos", icon: <Video className="w-3.5 h-3.5" />, count: totalVideos },
                    { id: "files", label: "Files", icon: <Paperclip className="w-3.5 h-3.5" />, count: totalFiles },
                    { id: "quizzes", label: "Quizzes", icon: <ListChecks className="w-3.5 h-3.5" />, count: totalQuizzes },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                        activeTab === t.id
                          ? "text-blue-700 dark:text-blue-400 border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                          : "text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300"
                      }`}
                    >
                      {t.icon}{t.label}
                      {t.count > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          activeTab === t.id
                            ? "bg-blue-200 dark:bg-blue-800/60 text-blue-800 dark:text-blue-200"
                            : "bg-gray-200 dark:bg-white/[0.1] text-gray-600 dark:text-gray-400"
                        }`}>{t.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="px-5 pb-5 pt-3">
                  <AnimatePresence mode="wait">
                    {/* VIDEOS TAB */}
                    {activeTab === "videos" && (
                      <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                        {section.videos.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-6 text-gray-400">
                            <Film className="w-8 h-8 opacity-30" />
                            <p className="text-sm">No videos yet</p>
                          </div>
                        ) : (
                          <AnimatePresence>
                            {section.videos.map(v => (
                              <FileRow key={v.id} file={v} onDelete={id => deleteFile(id, "videos")} />
                            ))}
                          </AnimatePresence>
                        )}
                        <UploadZone
                          label="Upload Video"
                          accept="video/*"
                          onFiles={files => handleAddFiles(files, "videos")}
                        />
                      </motion.div>
                    )}

                    {/* FILES TAB */}
                    {activeTab === "files" && (
                      <motion.div key="files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                        {section.files.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-6 text-gray-400">
                            <Paperclip className="w-8 h-8 opacity-30" />
                            <p className="text-sm">No files yet</p>
                          </div>
                        ) : (
                          <AnimatePresence>
                            {section.files.map(f => (
                              <FileRow key={f.id} file={f} onDelete={id => deleteFile(id, "files")} />
                            ))}
                          </AnimatePresence>
                        )}
                        <UploadZone
                          label="Upload File (docs, images, APKs, etc.)"
                          accept="*/*"
                          onFiles={files => handleAddFiles(files, "files")}
                        />
                      </motion.div>
                    )}

                    {/* QUIZZES TAB */}
                    {activeTab === "quizzes" && (
                      <motion.div key="quizzes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        {section.quizzes.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-6 text-gray-400">
                            <HelpCircle className="w-8 h-8 opacity-30" />
                            <p className="text-sm">No quizzes yet</p>
                          </div>
                        ) : (
                          <AnimatePresence>
                            {section.quizzes.map(quiz => (
                              <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-white/[0.07] hover:bg-gray-50 dark:hover:bg-white/[0.02] group transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                  <ListChecks className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{quiz.title}</p>
                                  <p className="text-xs text-gray-400">{quiz.questions.length} questions · Pass: {quiz.passMark}%</p>
                                </div>
                                {quiz.isPublished
                                  ? <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Live</span>
                                  : <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Circle className="w-3 h-3" />Draft</span>
                                }
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => setEditingQuiz(quiz)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteQuiz(quiz.id)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        )}

                        <button
                          onClick={() => setEditingQuiz("new")}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all w-full text-sm font-bold"
                        >
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

      {/* Quiz Editor Modal */}
      <AnimatePresence>
        {editingQuiz !== null && (
          <QuizEditor
            quiz={editingQuiz === "new" ? null : editingQuiz}
            onClose={() => setEditingQuiz(null)}
            onSave={saveQuiz}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Add Section Panel ────────────────────────────────────────────────────────

function AddSectionPanel({
  onClose, onAdd,
}: {
  onClose: () => void;
  onAdd: (title: string, description: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [done, setDone] = useState(false);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), description.trim());
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
          <h2 className="font-black text-gray-900 dark:text-white">New Section</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-12 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="font-black text-gray-900 dark:text-white text-lg">Section added!</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Section Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Module 4: Performance Patterns"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Description <span className="font-normal text-gray-400">(optional)</span></label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Brief overview of this section"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <button onClick={handleAdd} disabled={!title.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:opacity-90 disabled:opacity-40 transition-all shadow-md">
              <Plus className="w-4 h-4" />Create Section
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ sections }: { sections: Section[] }) {
  const totalVideos = sections.reduce((a, s) => a + s.videos.length, 0);
  const totalFiles = sections.reduce((a, s) => a + s.files.length, 0);
  const totalQuizzes = sections.reduce((a, s) => a + s.quizzes.length, 0);
//   const published = sections.filter(s => s.isPublished).length;

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Sections", value: sections.length, icon: <Layers className="w-4 h-4" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
        { label: "Videos", value: totalVideos, icon: <Film className="w-4 h-4" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
        { label: "Files", value: totalFiles, icon: <Paperclip className="w-4 h-4" />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
        { label: "Quizzes", value: totalQuizzes, icon: <ListChecks className="w-4 h-4" />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
      ].map(stat => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorCourseMaterials() {
  const [sections, setSections] = useState<Section[]>(MOCK_SECTIONS);
  const [showAddSection, setShowAddSection] = useState(false);
  const [publishAll, setPublishAll] = useState(false);

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(p => p.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSection = (id: string) => {
    setSections(p => p.filter(s => s.id !== id));
  };

  const addSection = (title: string, description: string) => {
    const newSection: Section = {
      id: `sec-${Date.now()}`,
      title,
      description,
      order: sections.length + 1,
      isPublished: false,
      videos: [],
      files: [],
      quizzes: [],
    };
    setSections(p => [...p, newSection]);
  };

  const handlePublishAll = () => {
    setSections(p => p.map(s => ({ ...s, isPublished: !publishAll })));
    setPublishAll(p => !p);
  };

  return (
    <>
      <div className=" flex flex-col max-w-[1100px] mx-auto py-10">
        <div className="space-y-6">

          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${MOCK_COURSE.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                {MOCK_COURSE.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{MOCK_COURSE.code}</span>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Course Materials</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{MOCK_COURSE.name}</h1>
                <p className="text-xs text-gray-400">{MOCK_COURSE.totalStudents} students enrolled</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePublishAll}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  publishAll
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                    : "border-gray-200 dark:border-white/[0.07] text-gray-600 dark:text-gray-300 hover:border-gray-300"
                }`}
              >
                {publishAll ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {publishAll ? "All Live" : "Publish All"}
              </button>
              <button
                onClick={() => setShowAddSection(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:opacity-90 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />New Section
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <StatsBar sections={sections} />

          {/* Sections */}
          <div className="space-y-3">
            <AnimatePresence>
              {sections.map(section => (
                <SectionBlock
                  key={section.id}
                  section={section}
                  onUpdateSection={updateSection}
                  onDeleteSection={deleteSection}
                />
              ))}
            </AnimatePresence>

            {sections.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-16 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
                  <BookOpen className="w-8 h-8 opacity-40" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-600 dark:text-gray-300 mb-1">No sections yet</p>
                  <p className="text-sm">Add your first section to start building course content.</p>
                </div>
                <button onClick={() => setShowAddSection(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:opacity-90 transition-all shadow-md">
                  <Plus className="w-4 h-4" />Add First Section
                </button>
              </motion.div>
            )}
          </div>

          {/* Bottom add section button */}
          {sections.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => setShowAddSection(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.1] text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 flex items-center justify-center gap-2 text-sm font-bold transition-all"
            >
              <Plus className="w-4 h-4" />Add Another Section
            </motion.button>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddSection && (
          <AddSectionPanel onClose={() => setShowAddSection(false)} onAdd={addSection} />
        )}
      </AnimatePresence>
    </>
  );
}