// InstructorCourseMaterials.tsx
// PAGE 2 of the instructor upload flow.
// The instructor adds supplementary sections, videos, files, and quizzes
// that accompany the main course video uploaded on Page 1.

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Plus, Upload, Video, FileText, Image as ImageIcon,
  Package, X, Edit3, Trash2, GripVertical, Clock,
  CheckCircle2, Circle, ChevronRight, BookOpen, ListChecks,
  Paperclip, Eye, EyeOff, Save, HelpCircle, Check, Layers,
  Film, ArrowLeft, Send, Sparkles, Pencil,
} from "lucide-react";
import {
  MOCK_ACTIVE_COURSE, Section, CourseFile, InlineQuiz,
  QuizQuestion, FileType, getFileType,
} from "@/data/courseTypes";

// ─── Helpers / constants ──────────────────────────────────────────────────────

const FILE_ICONS: Record<FileType, { icon: React.ReactNode; color: string; bg: string }> = {
  video: { icon: <Film className="w-4 h-4" />,     color: "text-blue-400",   bg: "bg-blue-900/30" },
  doc:   { icon: <FileText className="w-4 h-4" />,  color: "text-sky-400",    bg: "bg-sky-900/30" },
  image: { icon: <ImageIcon className="w-4 h-4" />, color: "text-emerald-400",bg: "bg-emerald-900/30" },
  apk:   { icon: <Package className="w-4 h-4" />,   color: "text-amber-400",  bg: "bg-amber-900/30" },
  other: { icon: <Paperclip className="w-4 h-4" />, color: "text-white/40",   bg: "bg-white/[0.06]" },
};

// ─── File Row ─────────────────────────────────────────────────────────────────

function FileRow({ file, onDelete }: { file: CourseFile; onDelete: (id: string) => void }) {
  const meta = FILE_ICONS[file.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] group transition-colors"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
        <p className="text-xs text-white/30">{file.size} · {file.uploadedAt}</p>
      </div>
      {file.duration && (
        <span className="flex items-center gap-1 text-xs text-white/30 flex-shrink-0">
          <Clock className="w-3 h-3" />{file.duration}
        </span>
      )}
      <button
        onClick={() => onDelete(file.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-900/20 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ label, accept, onFiles }: { label: string; accept: string; onFiles: (files: File[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); onFiles(Array.from(e.dataTransfer.files)); }}
      onClick={() => ref.current?.click()}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
        dragging
          ? "border-blue-400 bg-blue-900/20"
          : "border-white/[0.07] hover:border-blue-500/40 hover:bg-blue-900/10"
      }`}
    >
      <input ref={ref} type="file" accept={accept} multiple className="hidden"
        onChange={e => { if (e.target.files) onFiles(Array.from(e.target.files)); }} />
      <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center flex-shrink-0">
        <Upload className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white/60">{label}</p>
        <p className="text-xs text-white/25">Click or drag & drop</p>
      </div>
    </div>
  );
}

// ─── Quiz Editor Modal ────────────────────────────────────────────────────────

function QuizEditor({
  quiz, onSave, onClose,
}: {
  quiz: InlineQuiz | null;
  onClose: () => void;
  onSave: (quiz: InlineQuiz) => void;
}) {
  const [title, setTitle] = useState(quiz?.title ?? "");
  const [passMark, setPassMark] = useState(quiz?.passMark ?? 70);
  const [questions, setQuestions] = useState<QuizQuestion[]>(quiz?.questions ?? []);
  const [isPublished, setIsPublished] = useState(quiz?.isPublished ?? false);

  const addQuestion = () => setQuestions(p => [...p, {
    id: `qq-${Date.now()}`,
    question: "",
    options: [
      { id: "o-1", text: "" }, { id: "o-2", text: "" },
      { id: "o-3", text: "" }, { id: "o-4", text: "" },
    ],
    correctOptionId: "o-1",
  }]);

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) =>
    setQuestions(p => p.map(q => q.id === id ? { ...q, ...updates } : q));

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl my-8 bg-[#0d1929] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-900/30 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="font-black text-white">{quiz ? "Edit Quiz" : "New Inline Quiz"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-white/30 hover:text-white hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div>
              <label className="block text-xs font-bold text-white/40 mb-1.5">Quiz Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Module 1 Knowledge Check"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 mb-1.5">Pass Mark (%)</label>
              <input type="number" min={0} max={100} value={passMark} onChange={e => setPassMark(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-white/[0.08] bg-white/[0.04] text-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white/70">Questions ({questions.length})</p>
              <button onClick={addQuestion} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-400 bg-blue-900/30 hover:bg-blue-900/50 transition-all">
                <Plus className="w-3.5 h-3.5" />Add Question
              </button>
            </div>

            <AnimatePresence>
              {questions.map((q, qi) => (
                <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="border border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 bg-white/[0.03] border-b border-white/[0.06] flex items-center gap-2">
                    <span className="text-xs font-bold text-white/30">Q{qi + 1}</span>
                    <input value={q.question} onChange={e => updateQuestion(q.id, { question: e.target.value })}
                      placeholder="Enter question text…"
                      className="flex-1 text-sm font-semibold bg-transparent text-white/80 placeholder:text-white/20 focus:outline-none" />
                    <button onClick={() => setQuestions(p => p.filter(x => x.id !== q.id))} className="p-1 text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-2">
                    {q.options.map(opt => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button onClick={() => updateQuestion(q.id, { correctOptionId: opt.id })}
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                            q.correctOptionId === opt.id ? "border-emerald-500 bg-emerald-500" : "border-white/20"
                          }`}>
                          {q.correctOptionId === opt.id && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <input value={opt.text} onChange={e => updateOption(q.id, opt.id, e.target.value)}
                          placeholder={`Option ${opt.id.replace("o-", "")}`}
                          className="flex-1 text-sm px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-3">
                    <input value={q.explanation ?? ""} onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                      placeholder="Explanation shown after student answers…"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/40 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {questions.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-white/20">
                <HelpCircle className="w-8 h-8 opacity-30" />
                <p className="text-sm">No questions yet. Add one above.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
            <button onClick={() => setIsPublished(p => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                isPublished
                  ? "bg-emerald-900/30 text-emerald-400 border-emerald-700"
                  : "border-white/[0.07] text-white/30"
              }`}>
              {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {isPublished ? "Published" : "Draft"}
            </button>
            <button onClick={handleSave} disabled={!title.trim() || questions.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:opacity-90 disabled:opacity-30 transition-all shadow-md">
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
  section, onUpdate, onDelete,
}: {
  section: Section;
  onUpdate: (id: string, updates: Partial<Section>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [tab, setTab] = useState<"videos" | "files" | "quizzes">("videos");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  const [editingQuiz, setEditingQuiz] = useState<InlineQuiz | null | "new">(null);

  const commitTitle = () => {
    onUpdate(section.id, { title: titleDraft });
    setEditingTitle(false);
  };

  const addFiles = (rawFiles: File[], type: "videos" | "files") => {
    const newFiles: CourseFile[] = rawFiles.map(f => ({
      id: `f-${Date.now()}-${Math.random()}`,
      name: f.name,
      type: getFileType(f.name),
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      url: URL.createObjectURL(f),
      uploadedAt: new Date().toISOString().split("T")[0],
    }));
    if (type === "videos") onUpdate(section.id, { videos: [...section.videos, ...newFiles] });
    else onUpdate(section.id, { files: [...section.files, ...newFiles] });
  };

  const removeFile = (id: string, type: "videos" | "files") => {
    if (type === "videos") onUpdate(section.id, { videos: section.videos.filter(v => v.id !== id) });
    else onUpdate(section.id, { files: section.files.filter(f => f.id !== id) });
  };

  const saveQuiz = (quiz: InlineQuiz) => {
    const exists = section.quizzes.some(q => q.id === quiz.id);
    const updated = exists
      ? section.quizzes.map(q => q.id === quiz.id ? quiz : q)
      : [...section.quizzes, quiz];
    onUpdate(section.id, { quizzes: updated });
    setEditingQuiz(null);
  };

  const TABS = [
    { id: "videos",  label: "Videos",  icon: <Video className="w-3.5 h-3.5" />,       count: section.videos.length },
    { id: "files",   label: "Files",   icon: <Paperclip className="w-3.5 h-3.5" />,   count: section.files.length },
    { id: "quizzes", label: "Quizzes", icon: <ListChecks className="w-3.5 h-3.5" />,  count: section.quizzes.length },
  ] as const;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/[0.07] rounded-2xl overflow-hidden bg-[#0d1929]"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
          onClick={() => setExpanded(p => !p)}
        >
          <GripVertical className="w-4 h-4 text-white/15 flex-shrink-0 cursor-grab" />
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${MOCK_ACTIVE_COURSE.color} flex items-center justify-center flex-shrink-0`}>
            <Layers className="w-4 h-4 text-white" />
          </div>

          {/* Editable title */}
          <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
            {editingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={e => {
                  if (e.key === "Enter") commitTitle();
                  if (e.key === "Escape") { setTitleDraft(section.title); setEditingTitle(false); }
                }}
                className="w-full text-sm font-black bg-transparent text-white focus:outline-none border-b border-blue-400"
              />
            ) : (
              <div className="flex items-center gap-2 group/title">
                <h3 className="text-sm font-black text-white truncate">{section.title}</h3>
                <button onClick={() => setEditingTitle(true)}
                  className="opacity-0 group-hover/title:opacity-100 p-1 text-white/30 hover:text-white/60 transition-all">
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Pill counts + controls */}
          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            {section.videos.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 font-bold">
                {section.videos.length}v
              </span>
            )}
            {section.files.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-900/40 text-sky-400 font-bold">
                {section.files.length}f
              </span>
            )}
            {section.quizzes.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 font-bold">
                {section.quizzes.length}q
              </span>
            )}

            <button
              onClick={() => onUpdate(section.id, { isPublished: !section.isPublished })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                section.isPublished
                  ? "text-emerald-400 bg-emerald-900/20"
                  : "text-white/25 bg-white/[0.04] hover:text-white/50"
              }`}
            >
              {section.isPublished ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
              {section.isPublished ? "Live" : "Draft"}
            </button>

            <button onClick={() => onDelete(section.id)}
              className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-900/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <motion.div animate={{ rotate: expanded ? 0 : -90 }}>
            <ChevronDown className="w-4 h-4 text-white/25" />
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
              <div className="border-t border-white/[0.07]">
                {/* Description field */}
                <div className="px-5 pt-3">
                  <input
                    value={section.description}
                    onChange={e => onUpdate(section.id, { description: e.target.value })}
                    placeholder="Brief description of this section (optional)…"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 placeholder:text-white/15 focus:outline-none focus:border-blue-500/40"
                  />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-5 pt-3">
                  {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                        tab === t.id
                          ? "text-blue-400 border-blue-500 bg-blue-900/10"
                          : "text-white/25 border-transparent hover:text-white/50"
                      }`}
                    >
                      {t.icon}{t.label}
                      {t.count > 0 && (
                        <span className={`px-1.5 rounded-full text-[10px] font-black ${
                          tab === t.id ? "bg-blue-900/50 text-blue-300" : "bg-white/[0.07] text-white/30"
                        }`}>{t.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="px-5 pb-5 pt-3">
                  <AnimatePresence mode="wait">
                    {tab === "videos" && (
                      <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                        {section.videos.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-6 text-white/20">
                            <Film className="w-7 h-7 opacity-40" />
                            <p className="text-sm">No videos yet</p>
                          </div>
                        )}
                        <AnimatePresence>
                          {section.videos.map(v => (
                            <FileRow key={v.id} file={v} onDelete={id => removeFile(id, "videos")} />
                          ))}
                        </AnimatePresence>
                        <UploadZone label="Upload Video" accept="video/*" onFiles={f => addFiles(f, "videos")} />
                      </motion.div>
                    )}

                    {tab === "files" && (
                      <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                        {section.files.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-6 text-white/20">
                            <Paperclip className="w-7 h-7 opacity-40" />
                            <p className="text-sm">No files yet</p>
                          </div>
                        )}
                        <AnimatePresence>
                          {section.files.map(f => (
                            <FileRow key={f.id} file={f} onDelete={id => removeFile(id, "files")} />
                          ))}
                        </AnimatePresence>
                        <UploadZone label="Upload File (PDF, slides, images, archives…)" accept="*/*" onFiles={f => addFiles(f, "files")} />
                      </motion.div>
                    )}

                    {tab === "quizzes" && (
                      <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        {section.quizzes.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-6 text-white/20">
                            <HelpCircle className="w-7 h-7 opacity-40" />
                            <p className="text-sm">No quizzes yet</p>
                          </div>
                        )}
                        <AnimatePresence>
                          {section.quizzes.map(quiz => (
                            <motion.div key={quiz.id}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] hover:bg-white/[0.02] group transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                <ListChecks className="w-4 h-4 text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white/80 truncate">{quiz.title}</p>
                                <p className="text-xs text-white/30">{quiz.questions.length} questions · {quiz.passMark}% pass</p>
                              </div>
                              {quiz.isPublished
                                ? <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Live</span>
                                : <span className="text-xs font-bold text-white/25 flex items-center gap-1"><Circle className="w-3 h-3" />Draft</span>
                              }
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingQuiz(quiz)}
                                  className="p-1.5 rounded-lg text-white/25 hover:text-blue-400 hover:bg-blue-900/20 transition-all">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onUpdate(section.id, { quizzes: section.quizzes.filter(q => q.id !== quiz.id) })}
                                  className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-900/20 transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        <button onClick={() => setEditingQuiz("new")}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-amber-900/50 text-amber-400 hover:bg-amber-900/10 transition-all w-full text-sm font-bold">
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
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ sections }: { sections: Section[] }) {
  const totalVideos   = sections.reduce((a, s) => a + s.videos.length, 0);
  const totalFiles    = sections.reduce((a, s) => a + s.files.length, 0);
  const totalQuizzes  = sections.reduce((a, s) => a + s.quizzes.length, 0);
//   const published     = sections.filter(s => s.isPublished).length;

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Sections",  value: sections.length, icon: <Layers className="w-4 h-4" />,       accent: "text-blue-400", bg: "bg-blue-900/20" },
        { label: "Videos",    value: totalVideos,      icon: <Film className="w-4 h-4" />,         accent: "text-sky-400",  bg: "bg-sky-900/20" },
        { label: "Files",     value: totalFiles,       icon: <Paperclip className="w-4 h-4" />,    accent: "text-emerald-400", bg: "bg-emerald-900/20" },
        { label: "Quizzes",   value: totalQuizzes,     icon: <ListChecks className="w-4 h-4" />,   accent: "text-amber-400", bg: "bg-amber-900/20" },
      ].map(s => (
        <div key={s.label} className={`${s.bg} border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3`}>
          <div className={`w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0 ${s.accent}`}>
            {s.icon}
          </div>
          <div>
            <p className={`text-xl font-black ${s.accent}`}>{s.value}</p>
            <p className="text-xs text-white/30">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorCourseMaterials() {
  const course = MOCK_ACTIVE_COURSE;
  const [sections, setSections] = useState<Section[]>(course.sections);
//   const [showAddSection, setShowAddSection] = useState(false);
  const [publishAll, setPublishAll] = useState(false);
  const [published, setPublished] = useState(false);

  // New-section quick-add state
  const [newTitle, setNewTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  const updateSection = (id: string, updates: Partial<Section>) =>
    setSections(p => p.map(s => s.id === id ? { ...s, ...updates } : s));

  const deleteSection = (id: string) => setSections(p => p.filter(s => s.id !== id));

  const addSection = () => {
    if (!newTitle.trim()) return;
    const s: Section = {
      id: `sec-${Date.now()}`,
      title: newTitle.trim(),
      description: "",
      order: sections.length + 1,
      isPublished: false,
      videos: [], files: [], quizzes: [],
    };
    setSections(p => [...p, s]);
    setNewTitle("");
    setAddingSection(false);
  };

  const handlePublishAll = () => {
    setSections(p => p.map(s => ({ ...s, isPublished: !publishAll })));
    setPublishAll(p => !p);
  };

  if (published) {
    return (
      <div className="min-h-screen bg-[#060d18] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 px-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-900/50">
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Course Published</p>
            <h2 className="text-2xl font-black text-white mb-2">{course.name}</h2>
            <p className="text-white/40 text-sm">{sections.length} sections · {sections.reduce((a,s) => a+s.quizzes.length,0)} quizzes · {course.totalStudents} students enrolled</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d18]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-800/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 py-10">
        <div className="space-y-6">

          {/* ── Page Header ─────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl shadow-lg shadow-blue-900/30 flex-shrink-0`}>
                {course.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-white/25 uppercase tracking-wider">{course.code}</span>
                  <ChevronRight className="w-3 h-3 text-white/20" />
                  <span className="text-xs font-bold text-blue-400">Course Materials</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30 font-bold">Step 2 of 2</span>
                </div>
                <h1 className="text-2xl font-black text-white">{course.name}</h1>
                <p className="text-xs text-white/30">{course.totalStudents} students · {course.level}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePublishAll}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  publishAll
                    ? "bg-emerald-900/30 text-emerald-400 border-emerald-700"
                    : "border-white/[0.08] text-white/40 hover:border-white/20"
                }`}
              >
                {publishAll ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {publishAll ? "All Live" : "Publish All"}
              </button>

              <button
                onClick={() => setAddingSection(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/30 transition-all"
              >
                <Plus className="w-4 h-4" />New Section
              </button>

              <button
                onClick={() => setPublished(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-emerald-600 to-teal-700 hover:opacity-90 shadow-lg shadow-emerald-900/30 transition-all"
              >
                <Send className="w-4 h-4" />Publish Course
              </button>
            </div>
          </motion.div>

          {/* ── Main video quick-view ──────────────────────────────── */}
          {course.mainVideo && (
            <div className="flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-[#0d1929] border border-white/[0.07]">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <Film className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/80 truncate">{course.mainVideo.name}</p>
                <p className="text-xs text-white/30">{course.mainVideo.size} · {course.mainVideo.durationLabel} · {course.mainVideo.chapters.length} chapters</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white/40 border border-white/[0.07] hover:border-white/20 hover:text-white/60 transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />Edit Video
              </button>
            </div>
          )}

          {/* ── Stats ─────────────────────────────────────────────── */}
          <StatsBar sections={sections} />

          {/* ── Quick-add section inline panel ───────────────────── */}
          <AnimatePresence>
            {addingSection && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 bg-[#0d1929] border border-blue-500/30 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4 text-blue-400" />
                  </div>
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") addSection();
                      if (e.key === "Escape") { setAddingSection(false); setNewTitle(""); }
                    }}
                    placeholder="Section title, e.g. Module 4: Performance Patterns"
                    className="flex-1 text-sm font-bold bg-transparent text-white placeholder:text-white/20 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setAddingSection(false); setNewTitle(""); }}
                      className="p-2 rounded-xl text-white/25 hover:text-white/60 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={addSection} disabled={!newTitle.trim()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-30 transition-all">
                      <Check className="w-3.5 h-3.5" />Add
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Sections list ─────────────────────────────────────── */}
          <div className="space-y-3">
            <AnimatePresence>
              {sections.map(section => (
                <SectionBlock
                  key={section.id}
                  section={section}
                  onUpdate={updateSection}
                  onDelete={deleteSection}
                />
              ))}
            </AnimatePresence>

            {sections.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-16 text-white/20">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <BookOpen className="w-8 h-8 opacity-40" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white/30 mb-1">No sections yet</p>
                  <p className="text-sm text-white/20">Sections are supplementary — they live alongside the main course video.</p>
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
              className="w-full py-3 rounded-2xl border-2 border-dashed border-white/[0.07] text-white/25 hover:text-blue-400 hover:border-blue-700 hover:bg-blue-900/10 flex items-center justify-center gap-2 text-sm font-bold transition-all"
            >
              <Plus className="w-4 h-4" />Add Another Section
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}