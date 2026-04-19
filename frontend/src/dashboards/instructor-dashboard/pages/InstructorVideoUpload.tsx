// InstructorUploadVideo.tsx — real API: courses from CoursesService, upload via StorageService

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, Check, X, Plus, Trash2,
  Film, Clock, Upload, AlertCircle, GripVertical, ArrowRight,
  Sparkles, BookOpen, Info, Download, RefreshCw, Grip,
  ChevronUp, FileVideo, Loader2, AlertTriangle,
} from "lucide-react";
import {
  VideoChapter, parseChaptersFromText, labelToSeconds,
} from "@/data/courseTypes";
import { useQuery } from "@tanstack/react-query";
import CoursesService from "@/services/course.service";
import StorageService from "@/services/storage.service";
import { MaterialType } from "@/services/course.service";

// ─── API Types ────────────────────────────────────────────────────────────────

interface ApiCourse {
  id: string;
  title: string;
  img: string | null;
  level: string;
  status: string;
}

interface ApiSection {
  id: string;
  title: string;
  position: number;
}

interface ApiCourseDetail extends ApiCourse {
  sections: ApiSection[];
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoEntry {
  id: string;
  file: File;
  title: string;
  sectionId: string;
  order: number;
  chapters: VideoChapter[];
  collapsed: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function normalizeCourses(raw: unknown): ApiCourse[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as ApiCourse[];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items as ApiCourse[];
  if (Array.isArray(obj.data)) return obj.data as ApiCourse[];
  return [];
}

// ─── Course Selector ──────────────────────────────────────────────────────────

function CourseSelector({ courses, selected, onSelect, loading }: {
  courses: ApiCourse[]; selected: ApiCourse | null; onSelect: (c: ApiCourse) => void; loading: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left
          ${open ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : selected ? "border-blue-400/60 dark:border-blue-500/40 bg-white dark:bg-[#0d1929] hover:border-blue-400 dark:hover:border-blue-500/60"
          : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1929] hover:border-slate-300 dark:hover:border-white/20"}`}
      >
        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 dark:text-white/30 flex-1">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading courses…</span>
          </div>
        ) : selected ? (
          <>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
              {selected.img ? (
                <img src={selected.img} alt={selected.title} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <BookOpen className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{selected.title}</p>
              <p className="text-xs text-slate-400 dark:text-blue-300/60 mt-0.5">{selected.level} · {selected.status}</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 text-slate-400 dark:text-white/30 flex-1">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm">{courses.length === 0 ? "No courses assigned yet" : "Select an assigned course…"}</span>
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-white/30 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && courses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 bg-white dark:bg-[#0d1929] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
            {courses.map(c => (
              <button key={c.id} type="button" onClick={() => { onSelect(c); setOpen(false); }}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                  {c.img ? (
                    <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.title}</p>
                  <p className="text-xs text-slate-400 dark:text-white/40">{c.level} · {c.status}</p>
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

function CourseInfoBanner({ course }: { course: ApiCourse }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#0d1929] overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-2 bg-blue-50 dark:bg-transparent">
        <Info className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Set by Admin · Read-only</p>
      </div>
      <div className="px-5 py-4 grid grid-cols-3 gap-4">
        {[
          { label: "Course Name", value: course.title },
          { label: "Level",       value: course.level },
          { label: "Status",      value: course.status },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-white/80">{value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Batch Drop Zone ──────────────────────────────────────────────────────────

function BatchDropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault(); setDragging(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("video/"));
        if (files.length) onFiles(files);
      }}
      onClick={() => ref.current?.click()}
      className={`group flex flex-col items-center gap-4 px-8 py-14 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
        dragging
          ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40"
          : "border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-950/20"
      }`}
    >
      <input ref={ref} type="file" accept="video/*" multiple className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <motion.div animate={dragging ? { scale: 1.1, rotate: -3 } : { scale: 1, rotate: 0 }}
        className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.06] group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center transition-colors relative">
        <Film className="w-8 h-8 text-slate-400 dark:text-white/30 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
          <Plus className="w-3 h-3 text-white" />
        </div>
      </motion.div>
      <div className="text-center">
        <p className="font-bold text-slate-500 dark:text-white/60 group-hover:text-slate-700 dark:group-hover:text-white/80 transition-colors">
          {dragging ? "Drop videos here" : "Drop multiple videos at once"}
        </p>
        <p className="text-sm text-slate-400 dark:text-white/30 mt-1">MP4, MOV, WebM, MKV · Up to 50 GB each</p>
        <p className="text-xs text-blue-500 dark:text-blue-400 font-semibold mt-2">Each video becomes a lesson</p>
      </div>
    </div>
  );
}

// ─── Chapter Row ──────────────────────────────────────────────────────────────

function ChapterRow({ chapter, index, onChange, onDelete }: {
  chapter: VideoChapter; index: number;
  onChange: (id: string, u: Partial<VideoChapter>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, height: 0 }}
      className="group flex items-center gap-2.5">
      <GripVertical className="w-4 h-4 text-slate-300 dark:text-white/15 cursor-grab flex-shrink-0" />
      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-500/20">
        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{index + 1}</span>
      </div>
      <input
        defaultValue={chapter.timestamp}
        onBlur={e => onChange(chapter.id, { timestamp: e.target.value, timestampSeconds: labelToSeconds(e.target.value) })}
        placeholder="0:00"
        className="w-20 font-mono text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-blue-600 dark:text-blue-300 placeholder:text-slate-300 dark:placeholder:text-white/20 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500/60 transition-all flex-shrink-0"
      />
      <input
        value={chapter.title}
        onChange={e => onChange(chapter.id, { title: e.target.value })}
        placeholder="Chapter title…"
        className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500/60 transition-all"
      />
      <button onClick={() => onDelete(chapter.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 dark:text-white/20 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all flex-shrink-0">
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
    if (parsed.length === 0) { setError("No valid chapters found. Each line should start with a timestamp."); setPreview([]); }
    else { setError(""); setPreview(parsed); }
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#0d1929] border border-slate-200 dark:border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-900 dark:text-white text-base">Import Chapter Markers</h2>
            <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">Paste text or upload a .txt / .csv file</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <textarea value={raw} onChange={e => parse(e.target.value)}
            placeholder={"0:00 Intro\n5:30 Main concept\n18:42 Deep dive\n1:12:30 Wrap up"}
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 font-mono focus:outline-none focus:border-blue-400 dark:focus:border-blue-500/60 resize-none" />
          <div className="flex gap-3">
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-sm text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <Upload className="w-3.5 h-3.5" />Upload .txt / .csv
            </button>
            <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => parse(ev.target?.result as string); r.readAsText(f); }}} />
            {raw && <button onClick={() => parse("")} className="text-sm text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-all flex items-center gap-1.5"><RefreshCw className="w-3 h-3" />Clear</button>}
          </div>
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}
          {preview.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">{preview.length} chapters parsed</p>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {preview.map((ch, i) => (
                  <div key={ch.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03]">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">{i + 1}</span>
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-300 w-14 flex-shrink-0">{ch.timestamp}</span>
                    <span className="text-sm text-slate-600 dark:text-white/70 truncate">{ch.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.07] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-all">Cancel</button>
          <button onClick={() => { onImport(preview); onClose(); }} disabled={preview.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-30 transition-all">
            <Check className="w-4 h-4" />Import {preview.length > 0 ? `${preview.length} chapters` : ""}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Video Entry Card ─────────────────────────────────────────────────────────

function VideoCard({
  entry, index, total, sections,
  onUpdate, onRemove, onMoveUp, onMoveDown,
  uploadProgress,
}: {
  entry: VideoEntry;
  index: number;
  total: number;
  sections: ApiSection[];
  onUpdate: (id: string, patch: Partial<VideoEntry>) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  uploadProgress?: number;
}) {
  const [showImport, setShowImport] = useState(false);

  const addChapter = () => {
    onUpdate(entry.id, {
      chapters: [...entry.chapters, { id: uid(), title: "", timestamp: "0:00", timestampSeconds: 0 }],
    });
  };

  const updateChapter = (chId: string, patch: Partial<VideoChapter>) => {
    onUpdate(entry.id, {
      chapters: entry.chapters.map(c => c.id === chId ? { ...c, ...patch } : c),
    });
  };

  const deleteChapter = (chId: string) => {
    onUpdate(entry.id, { chapters: entry.chapters.filter(c => c.id !== chId) });
  };

  const importChapters = (incoming: VideoChapter[]) => {
    const existing = new Set(entry.chapters.map(c => c.timestampSeconds));
    const novel = incoming.filter(c => !existing.has(c.timestampSeconds));
    onUpdate(entry.id, {
      chapters: [...entry.chapters, ...novel].sort((a, b) => a.timestampSeconds - b.timestampSeconds),
    });
  };

  return (
    <>
      {showImport && <ImportModal onImport={importChapters} onClose={() => setShowImport(false)} />}

      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, height: 0 }}
        className="bg-white dark:bg-[#0d1929] rounded-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden shadow-sm"
      >
        {/* Upload progress bar */}
        {uploadProgress !== undefined && (
          <div className="h-1 bg-slate-100 dark:bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className={`h-full rounded-full transition-colors ${uploadProgress === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
            />
          </div>
        )}

        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Grip className="w-4 h-4 text-slate-300 dark:text-white/20 cursor-grab" />
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              {uploadProgress === 100 ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">{index + 1}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <FileVideo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-700 dark:text-white/70 truncate">{entry.file.name}</p>
              <p className="text-[11px] text-slate-400 dark:text-white/30">{formatBytes(entry.file.size)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button onClick={() => onMoveUp(entry.id)} disabled={index === 0}
              className="p-1 rounded text-slate-300 dark:text-white/20 hover:text-slate-600 dark:hover:text-white disabled:opacity-20 transition-all">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onMoveDown(entry.id)} disabled={index === total - 1}
              className="p-1 rounded text-slate-300 dark:text-white/20 hover:text-slate-600 dark:hover:text-white disabled:opacity-20 transition-all">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <button onClick={() => onUpdate(entry.id, { collapsed: !entry.collapsed })}
            className="p-2 rounded-xl text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all flex-shrink-0">
            {entry.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <button onClick={() => onRemove(entry.id)}
            className="p-2 rounded-xl text-slate-300 dark:text-white/20 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card body */}
        <AnimatePresence initial={false}>
          {!entry.collapsed && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="px-5 py-5 space-y-5">
                <div className="grid grid-cols-[1fr_200px] gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-white/40 mb-1.5 uppercase tracking-wider">
                      Lesson Title
                    </label>
                    <input
                      value={entry.title}
                      onChange={e => onUpdate(entry.id, { title: e.target.value })}
                      placeholder={`Lesson ${index + 1} title…`}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-white/40 mb-1.5 uppercase tracking-wider">
                      Section
                    </label>
                    <div className="relative">
                      <select
                        value={entry.sectionId}
                        onChange={e => onUpdate(entry.id, { sectionId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-white appearance-none focus:outline-none focus:border-blue-400 dark:focus:border-blue-500/60 transition-all"
                      >
                        {sections.length === 0 ? (
                          <option value="">No sections yet</option>
                        ) : (
                          sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">Chapter Markers</p>
                      <p className="text-[10px] text-slate-400 dark:text-white/25 mt-0.5">Optional — help students navigate</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowImport(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-700 dark:hover:text-white transition-all">
                        <Download className="w-3 h-3" />Import
                      </button>
                      <button onClick={addChapter}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">
                        <Plus className="w-3 h-3" />Add
                      </button>
                    </div>
                  </div>

                  {entry.chapters.length > 0 ? (
                    <div className="space-y-2 pl-1">
                      <AnimatePresence>
                        {entry.chapters.map((ch, i) => (
                          <ChapterRow key={ch.id} chapter={ch} index={i} onChange={updateChapter} onDelete={deleteChapter} />
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-200 dark:border-white/[0.07] text-slate-400 dark:text-white/20">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <p className="text-xs">No chapter markers yet — optional but recommended</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center flex-shrink-0">
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

export default function InstructorVideoUpload() {
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
  const [videos, setVideos]                 = useState<VideoEntry[]>([]);
  const [saved, setSaved]                   = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [saveError, setSaveError]           = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  // Load instructor's courses
  const { data: coursesRaw, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn:  () => CoursesService.findAll({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });
  const courses = normalizeCourses(coursesRaw) as ApiCourse[];

  // Load sections for selected course
  const { data: courseDetail } = useQuery({
    queryKey: ["course-detail", selectedCourse?.id],
    queryFn:  () => CoursesService.findOne(selectedCourse!.id) as Promise<ApiCourseDetail>,
    enabled:  !!selectedCourse?.id,
    staleTime: 1000 * 60 * 5,
  });
  const courseSections: ApiSection[] = (courseDetail as ApiCourseDetail)?.sections ?? [];

  const addFiles = (files: File[]) => {
    const defaultSection = courseSections[0]?.id ?? "";
    const newEntries: VideoEntry[] = files.map((file, i) => ({
      id: uid(),
      file,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      sectionId: defaultSection,
      order: videos.length + i + 1,
      chapters: [],
      collapsed: false,
    }));
    setVideos(p => [...p, ...newEntries]);
  };

  const updateVideo = (id: string, patch: Partial<VideoEntry>) =>
    setVideos(p => p.map(v => v.id === id ? { ...v, ...patch } : v));

  const removeVideo = (id: string) =>
    setVideos(p => p.filter(v => v.id !== id));

  const moveUp = (id: string) =>
    setVideos(p => {
      const i = p.findIndex(v => v.id === id);
      if (i <= 0) return p;
      const next = [...p];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });

  const moveDown = (id: string) =>
    setVideos(p => {
      const i = p.findIndex(v => v.id === id);
      if (i >= p.length - 1) return p;
      const next = [...p];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });

  const handleSave = async () => {
    if (!selectedCourse || videos.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        // Upload video file to storage
        setUploadProgress(p => ({ ...p, [v.id]: 10 }));
        const publicUrl = await StorageService.upload("course-videos", v.file);
        setUploadProgress(p => ({ ...p, [v.id]: 60 }));
        // Create lesson in the section
        const lesson = await CoursesService.createLesson(
          selectedCourse.id,
          v.sectionId,
          { title: v.title, position: v.order }
        ) as { id: string };
        setUploadProgress(p => ({ ...p, [v.id]: 80 }));
        // Attach the video as a material
        await CoursesService.addMaterial(
          selectedCourse.id,
          v.sectionId,
          lesson.id,
          { type: MaterialType.VIDEO, title: v.title, url: publicUrl, fileName: v.file.name, size: v.file.size }
        );
        setUploadProgress(p => ({ ...p, [v.id]: 100 }));
      }
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canSave    = selectedCourse && videos.length > 0 && videos.every(v => v.title.trim()) && courseSections.length > 0;
  const totalSize  = videos.reduce((a, v) => a + v.file.size, 0);
  const totalChaps = videos.reduce((a, v) => a + v.chapters.length, 0);

  if (saved && selectedCourse) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060d18] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 px-10">
          <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 dark:shadow-blue-900/50">
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <div>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Videos Saved</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{selectedCourse.title}</h2>
            <p className="text-slate-400 dark:text-white/40 text-sm">
              {videos.length} lesson{videos.length !== 1 ? "s" : ""} uploaded · {totalChaps} chapter markers · {formatBytes(totalSize)} total
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/instructor/course-materials", { state: { courseId: selectedCourse.id } })}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/40 mx-auto transition-all">
            Continue to Materials <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d18]">
      <div className="relative max-w-[820px] mx-auto px-4 py-12">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/30 mb-5">
            <span>Instructor Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Upload Lessons</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Upload Lesson Videos</h1>
              <p className="text-slate-500 dark:text-white/40 text-sm leading-relaxed max-w-md">
                Drop multiple videos at once — each becomes a lesson. Add titles, assign to sections, and mark chapters so students can navigate with ease.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Step 1 of 2</span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">

          {/* 1: Course selection */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <SectionLabel step={1} title="Select Course" />
            <CourseSelector
              courses={courses}
              selected={selectedCourse}
              onSelect={c => { setSelectedCourse(c); setVideos([]); }}
              loading={coursesLoading}
            />
            {selectedCourse && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                <CourseInfoBanner course={selectedCourse} />
              </motion.div>
            )}
            {selectedCourse && courseSections.length === 0 && !coursesLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/[0.07] border border-amber-200 dark:border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-200/60">
                  This course has no sections yet. Go to Course Materials to add sections first, then come back to upload videos.
                </p>
              </motion.div>
            )}
          </motion.section>

          {/* 2: Batch drop zone */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={!selectedCourse || courseSections.length === 0 ? "opacity-40 pointer-events-none" : ""}>
            <SectionLabel step={2} title="Upload Lesson Videos" subtitle="Drag multiple files — each becomes a separate lesson" />
            <BatchDropZone onFiles={addFiles} />

            {videos.length > 0 && (
              <motion.label initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all w-fit cursor-pointer">
                <Plus className="w-4 h-4" />Add more videos
                <input type="file" accept="video/*" multiple className="hidden"
                  onChange={e => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
              </motion.label>
            )}
          </motion.section>

          {/* 3: Video list */}
          {videos.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="flex items-center justify-between mb-4">
                <SectionLabel step={3} title="Configure Each Lesson" subtitle="Title, section, and optional chapter markers" />
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-white/30">
                  <span>{videos.length} video{videos.length !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{formatBytes(totalSize)}</span>
                  {totalChaps > 0 && <><span>·</span><span>{totalChaps} chapters</span></>}
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={() => setVideos(p => p.map(v => ({ ...v, collapsed: true })))}
                  className="text-xs font-bold text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white transition-all">
                  Collapse all
                </button>
                <span className="text-slate-300 dark:text-white/20">·</span>
                <button onClick={() => setVideos(p => p.map(v => ({ ...v, collapsed: false })))}
                  className="text-xs font-bold text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white transition-all">
                  Expand all
                </button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {videos.map((v, i) => (
                    <VideoCard
                      key={v.id}
                      entry={v}
                      index={i}
                      total={videos.length}
                      sections={courseSections}
                      onUpdate={updateVideo}
                      onRemove={removeVideo}
                      onMoveUp={moveUp}
                      onMoveDown={moveDown}
                      uploadProgress={uploadProgress[v.id]}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {videos.some(v => !v.title.trim()) && (
                <div className="flex items-start gap-2.5 mt-4 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/[0.07] border border-amber-200 dark:border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-200/60">
                    All lessons need a title before saving.
                  </p>
                </div>
              )}
            </motion.section>
          )}

          {/* Error */}
          <AnimatePresence>
            {saveError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-300">{saveError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center justify-between pt-2">
            <div className="text-sm text-slate-400 dark:text-white/25">
              {videos.length > 0 && `${videos.length} lesson${videos.length !== 1 ? "s" : ""} ready`}
            </div>
            <motion.button
              whileHover={canSave ? { scale: 1.02 } : {}}
              whileTap={canSave ? { scale: 0.98 } : {}}
              onClick={handleSave}
              disabled={!canSave || saving}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-25 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {saving ? "Uploading…" : "Save & Continue"} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
