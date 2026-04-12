// InstructorUploadVideo.tsx
// PAGE 1 of the instructor upload flow.
// Light / dark mode via Tailwind `dark:` prefix (respects system preference).

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, Check, X, Plus, Trash2,
  Film, Clock, Upload, AlertCircle, GripVertical, ArrowRight,
  Sparkles, Play, BookOpen, Info, Download, RefreshCw,
} from "lucide-react";
import {
  ASSIGNED_COURSES, Course, VideoChapter,
  parseChaptersFromText, labelToSeconds,
} from "@/data/courseTypes";

// ─── Course Selector ──────────────────────────────────────────────────────────

function CourseSelector({
  courses, selected, onSelect,
}: {
  courses: Course[];
  selected: Course | null;
  onSelect: (c: Course) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left
          ${open
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : selected
            ? "border-blue-400/60 dark:border-blue-500/40 bg-white dark:bg-[#0d1929] hover:border-blue-400 dark:hover:border-blue-500/60"
            : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1929] hover:border-slate-300 dark:hover:border-white/20"
          }`}
      >
        {selected ? (
          <>
            <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${selected.color}
              flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
              {selected.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white text-sm">{selected.name}</p>
              <p className="text-xs text-slate-400 dark:text-blue-300/60 mt-0.5">
                {selected.code} · {selected.subject} · {selected.level}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 text-slate-400 dark:text-white/30 flex-1">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm">Select an assigned course…</span>
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-white/30 transition-transform flex-shrink-0
          ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 z-50
              bg-white dark:bg-[#0d1929]
              border border-slate-200 dark:border-white/10
              rounded-2xl shadow-xl dark:shadow-none overflow-hidden"
          >
            {courses.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onSelect(c); setOpen(false); }}
                className="w-full flex items-center gap-4 px-5 py-3.5
                  hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
              >
                <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color}
                  flex items-center justify-center text-xl flex-shrink-0 shadow-md`}>
                  {c.icon}
                </span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-slate-400 dark:text-white/40">{c.code} · {c.totalStudents} students enrolled</p>
                </div>
                {selected?.id === c.id && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Course Info Banner ───────────────────────────────────────────────────────

function CourseInfoBanner({ course }: { course: Course }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 dark:border-white/[0.08]
        bg-slate-50 dark:bg-gradient-to-r dark:from-[#0d1929] dark:to-[#0a1520] overflow-hidden"
    >
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-2
        bg-blue-50 dark:bg-transparent">
        <Info className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Set by Admin · Read-only
        </p>
      </div>
      <div className="px-5 py-4 grid grid-cols-3 gap-4">
        {[
          { label: "Course Name",       value: course.name },
          { label: "Course Code",       value: course.code },
          { label: "Subject",           value: course.subject },
          { label: "Level",             value: course.level },
          { label: "Students Enrolled", value: `${course.totalStudents}` },
          { label: "Your Role",         value: course.instructor.name },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-sm font-semibold text-slate-700 dark:text-white/80">{value}</p>
          </div>
        ))}
      </div>
      <div className="px-5 pb-4">
        <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-1">
          Description
        </p>
        <p className="text-sm text-slate-500 dark:text-white/60 leading-relaxed">{course.description}</p>
      </div>
    </motion.div>
  );
}

// ─── Video Drop Zone ──────────────────────────────────────────────────────────

function VideoDropZone({
  file, onFile, onClear,
}: {
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  if (file) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    const sizeDisplay = Number(sizeMB) > 1024
      ? `${(Number(sizeMB) / 1024).toFixed(2)} GB` : `${sizeMB} MB`;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex items-center gap-5 px-6 py-5 rounded-2xl
          bg-blue-50 dark:bg-blue-950/40
          border-2 border-blue-300 dark:border-blue-500/40"
      >
        <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Play className="w-6 h-6 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 dark:text-white truncate">{file.name}</p>
          <p className="text-sm text-slate-500 dark:text-white/40 mt-0.5">{sizeDisplay} · Ready to upload</p>
          <div className="mt-2 h-1 w-48 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-2 rounded-xl text-slate-400 dark:text-white/30
            hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files[0]; if (f) onFile(f);
      }}
      onClick={() => ref.current?.click()}
      className={`group flex flex-col items-center gap-4 px-8 py-14 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
        dragging
          ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40"
          : "border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-950/20"
      }`}
    >
      <input ref={ref} type="file" accept="video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <motion.div
        animate={dragging ? { scale: 1.1 } : { scale: 1 }}
        className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.06]
          group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30
          flex items-center justify-center transition-colors"
      >
        <Film className="w-8 h-8 text-slate-400 dark:text-white/30
          group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
      </motion.div>
      <div className="text-center">
        <p className="font-bold text-slate-500 dark:text-white/60
          group-hover:text-slate-700 dark:group-hover:text-white/80 transition-colors">
          {dragging ? "Drop to upload" : "Upload Main Course Video"}
        </p>
        <p className="text-sm text-slate-400 dark:text-white/30 mt-1">MP4, MOV, WebM, MKV · Up to 50 GB</p>
      </div>
    </div>
  );
}

// ─── Chapter Row ──────────────────────────────────────────────────────────────

function ChapterRow({
  chapter, index, onChange, onDelete,
}: {
  chapter: VideoChapter;
  index: number;
  onChange: (id: string, u: Partial<VideoChapter>) => void;
  onDelete: (id: string) => void;
}) {
  const handleTimestampBlur = (raw: string) => {
    onChange(chapter.id, { timestamp: raw, timestampSeconds: labelToSeconds(raw) });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, height: 0 }}
      className="group flex items-center gap-3"
    >
      <GripVertical className="w-4 h-4 text-slate-300 dark:text-white/15 cursor-grab flex-shrink-0" />
      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-black text-blue-600 dark:text-blue-400">{index + 1}</span>
      </div>

      <input
        defaultValue={chapter.timestamp}
        onBlur={e => handleTimestampBlur(e.target.value)}
        placeholder="0:00"
        className="w-24 font-mono text-xs px-3 py-2 rounded-xl
          border border-slate-200 dark:border-white/10
          bg-white dark:bg-white/[0.04]
          text-blue-600 dark:text-blue-300
          placeholder:text-slate-300 dark:placeholder:text-white/20
          focus:outline-none focus:border-blue-400 dark:focus:border-blue-500/60
          focus:bg-blue-50 dark:focus:bg-blue-950/30 transition-all flex-shrink-0"
      />

      <input
        value={chapter.title}
        onChange={e => onChange(chapter.id, { title: e.target.value })}
        placeholder="Chapter title…"
        className="flex-1 text-sm px-3 py-2 rounded-xl
          border border-slate-200 dark:border-white/10
          bg-white dark:bg-white/[0.04]
          text-slate-800 dark:text-white
          placeholder:text-slate-300 dark:placeholder:text-white/20
          focus:outline-none focus:border-blue-400 dark:focus:border-blue-500/60
          focus:bg-blue-50 dark:focus:bg-blue-950/20 transition-all"
      />

      <button
        onClick={() => onDelete(chapter.id)}
        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl
          text-slate-300 dark:text-white/20
          hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20
          transition-all flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────

function ImportModal({ onImport, onClose }: { onImport: (c: VideoChapter[]) => void; onClose: () => void }) {
  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<VideoChapter[]>([]);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parse = useCallback((text: string) => {
    setRaw(text);
    if (!text.trim()) { setPreview([]); setError(""); return; }
    const parsed = parseChaptersFromText(text);
    if (parsed.length === 0) {
      setError("No valid chapters found. Make sure each line starts with a timestamp (e.g. 0:00 or 1:24:05).");
      setPreview([]);
    } else { setError(""); setPreview(parsed); }
  }, []);

  const handleFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = e => parse(e.target?.result as string);
    reader.readAsText(f);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm
        flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-[#0d1929]
          border border-slate-200 dark:border-white/[0.1]
          rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-900 dark:text-white text-base">Import Chapter Markers</h2>
            <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">Paste text or upload a .txt / .csv file</p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-slate-400 dark:text-white/30
              hover:text-slate-700 dark:hover:text-white
              hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            {[
              { label: "Plain / YouTube", sample: "0:00 Intro\n18:42 Chapter 2\n1:12:30 Deep Dive" },
              { label: "With dash",       sample: "0:00 - Intro\n18:42 - Chapter 2\n1:12:30 - Deep Dive" },
              { label: "CSV",             sample: "0:00,Intro\n18:42,Chapter 2\n1:12:30,Deep Dive" },
            ].map(f => (
              <div key={f.label}
                className="rounded-xl bg-slate-50 dark:bg-white/[0.04]
                  border border-slate-200 dark:border-white/[0.06] px-3 py-2.5">
                <p className="font-bold text-slate-500 dark:text-white/50 mb-1.5">{f.label}</p>
                <pre className="text-slate-400 dark:text-white/30 font-mono whitespace-pre leading-relaxed">
                  {f.sample}
                </pre>
              </div>
            ))}
          </div>

          <textarea
            value={raw}
            onChange={e => parse(e.target.value)}
            placeholder={"Paste chapter markers here…\ne.g. 0:00 Introduction\n18:42 Compound Components"}
            rows={6}
            className="w-full px-4 py-3 rounded-xl
              border border-slate-200 dark:border-white/10
              bg-slate-50 dark:bg-white/[0.04]
              text-sm text-slate-700 dark:text-white/80
              placeholder:text-slate-300 dark:placeholder:text-white/20
              font-mono focus:outline-none
              focus:border-blue-400 dark:focus:border-blue-500/60 resize-none"
          />

          <div className="flex items-center gap-3">
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                border border-slate-200 dark:border-white/10
                bg-slate-50 dark:bg-white/[0.04]
                text-sm text-slate-500 dark:text-white/50
                hover:text-slate-800 dark:hover:text-white
                hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <Upload className="w-3.5 h-3.5" />Upload file
            </button>
            <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {raw && (
              <button onClick={() => parse("")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                  text-sm text-slate-400 dark:text-white/30
                  hover:text-slate-600 dark:hover:text-white/60 transition-all">
                <RefreshCw className="w-3 h-3" />Clear
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl
              bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {preview.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
              <p className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
                {preview.length} chapters parsed
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {preview.map((ch, i) => (
                  <div key={ch.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03]">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black
                      bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">{i + 1}</span>
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-300 w-16 flex-shrink-0">
                      {ch.timestamp}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-white/70 truncate">{ch.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.07] flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-slate-400 dark:text-white/40
              hover:text-slate-700 dark:hover:text-white transition-all">
            Cancel
          </button>
          <button
            onClick={() => { onImport(preview); onClose(); }}
            disabled={preview.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold
              text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-30 transition-all"
          >
            <Check className="w-4 h-4" />
            Import {preview.length > 0 ? `${preview.length} chapters` : ""}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20
        border border-blue-200 dark:border-blue-500/30 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-black text-blue-600 dark:text-blue-400">{step}</span>
      </div>
      <div>
        <p className="text-sm font-black text-slate-900 dark:text-white">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-white/30">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorUploadVideo() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [chapters, setChapters] = useState<VideoChapter[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const addChapter = () => {
    setChapters(p => [...p, {
      id: `ch-${Date.now()}`, title: "",
      timestamp: "0:00", timestampSeconds: 0,
    }]);
  };

  const updateChapter = (id: string, u: Partial<VideoChapter>) =>
    setChapters(p => p.map(c => c.id === id ? { ...c, ...u } : c));

  const deleteChapter = (id: string) => setChapters(p => p.filter(c => c.id !== id));

  const importChapters = (incoming: VideoChapter[]) => {
    setChapters(p => {
      const existingTs = new Set(p.map(c => c.timestampSeconds));
      const novel = incoming.filter(c => !existingTs.has(c.timestampSeconds));
      return [...p, ...novel].sort((a, b) => a.timestampSeconds - b.timestampSeconds);
    });
  };

  const canContinue = selectedCourse && videoFile;

  if (saved && selectedCourse) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060d18] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-5 px-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700
              flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 dark:shadow-blue-900/50"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <div>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
              Video Saved
            </p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {selectedCourse.name}
            </h2>
            <p className="text-slate-400 dark:text-white/40 text-sm">
              Main video uploaded · {chapters.length} chapter markers set
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/instructor/course-materials")}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold
              text-white bg-gradient-to-br from-blue-600 to-blue-700
              hover:from-blue-500 hover:to-blue-600
              shadow-lg shadow-blue-200 dark:shadow-blue-900/40 mx-auto transition-all"
          >
            Add Sections & Materials <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d18]">
      

      <div className="relative max-w-[780px] mx-auto px-4 py-12">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/30 mb-5">
            <span>Instructor Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Upload Course Video</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Upload Main Video
              </h1>
              <p className="text-slate-500 dark:text-white/40 text-sm leading-relaxed max-w-md">
                Select your assigned course, upload the primary lecture video, and mark chapter
                timestamps so students can navigate with ease.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
              bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30
              flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Step 1 of 2</span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">

          {/* 1: Course selection */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <SectionLabel step={1} title="Select Course" />
            <CourseSelector courses={ASSIGNED_COURSES} selected={selectedCourse} onSelect={setSelectedCourse} />
            {selectedCourse && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                <CourseInfoBanner course={selectedCourse} />
              </motion.div>
            )}
          </motion.section>

          {/* 2: Video upload */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={!selectedCourse ? "opacity-40 pointer-events-none" : ""}
          >
            <SectionLabel step={2} title="Upload Main Video" />
            <VideoDropZone file={videoFile} onFile={setVideoFile} onClear={() => setVideoFile(null)} />
          </motion.section>

          {/* 3: Chapter markers */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={!videoFile ? "opacity-40 pointer-events-none" : ""}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <SectionLabel step={3} title="Chapter Markers" subtitle="Help students jump to any part of the video" />
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowImport(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold
                    text-slate-500 dark:text-white/60
                    border border-slate-200 dark:border-white/10
                    hover:border-slate-300 dark:hover:border-white/20
                    hover:text-slate-700 dark:hover:text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" />Import from file
                </button>
                <button
                  onClick={addChapter}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold
                    text-blue-600 dark:text-blue-400
                    bg-blue-50 dark:bg-blue-500/10
                    border border-blue-200 dark:border-blue-500/30
                    hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />Add chapter
                </button>
              </div>
            </div>

            {chapters.length > 0 && (
              <div className="grid grid-cols-[16px_28px_96px_1fr_36px] gap-3 px-1 pb-2">
                <span /><span />
                <span className="text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">
                  Timestamp
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">
                  Title
                </span>
                <span />
              </div>
            )}

            <div className="space-y-2">
              <AnimatePresence>
                {chapters.map((ch, i) => (
                  <ChapterRow key={ch.id} chapter={ch} index={i} onChange={updateChapter} onDelete={deleteChapter} />
                ))}
              </AnimatePresence>
            </div>

            {chapters.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-10 rounded-2xl
                border border-dashed border-slate-200 dark:border-white/[0.07]">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center">
                  <Clock className="w-6 h-6 text-slate-300 dark:text-white/20" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-400 dark:text-white/30">No chapters yet</p>
                  <p className="text-xs text-slate-300 dark:text-white/20 mt-0.5">
                    Add manually or import from a text/CSV file
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 mt-4 px-4 py-3 rounded-xl
              bg-amber-50 dark:bg-amber-500/[0.07] border border-amber-200 dark:border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-200/60">
                Chapter markers are navigation points within the same video — they don't split or re-encode
                the file. Students will see them as clickable timestamps on the video player.
              </p>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between pt-2"
          >
            <div className="text-sm text-slate-400 dark:text-white/25">
              {chapters.length > 0 && `${chapters.length} chapter${chapters.length !== 1 ? "s" : ""} added`}
            </div>
            <motion.button
              whileHover={canContinue ? { scale: 1.02 } : {}}
              whileTap={canContinue ? { scale: 0.98 } : {}}
              onClick={() => setSaved(true)}
              disabled={!canContinue}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold text-white
                bg-gradient-to-br from-blue-600 to-blue-700
                hover:from-blue-500 hover:to-blue-600
                disabled:opacity-25 disabled:cursor-not-allowed
                shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all"
            >
              Save & Continue to Materials <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showImport && (
          <ImportModal onImport={importChapters} onClose={() => setShowImport(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}