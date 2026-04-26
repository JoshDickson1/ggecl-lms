// StudentViewCourse.tsx
// Student-facing course page.
// Tab 1: Playlist of short video chunks + chapter navigation, resume toast,
//         speed control, working fullscreen/zoom, notes panel.
// Tab 2: Course materials — collapsible sections with videos, files, and inline quizzes.
// Right sidebar: video navigator + progress tracker.
// Light / dark mode toggle.

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, Volume2, VolumeX, Maximize, Minimize,
  ChevronRight, ChevronDown, ChevronUp, Clock, Check,
  CheckCircle2, Circle, Lock, FileText, Image as ImageIcon,
  Package, Paperclip, Film, ListChecks, BookOpen, Download,
  Users, BarChart2, Award, X, AlertCircle, StickyNote,
  Plus, Trash2, Bookmark, PlayCircle, Sun, Moon,
} from "lucide-react";
import {
  MOCK_ACTIVE_COURSE, MOCK_STUDENT_PROGRESS,
  FileType, InlineQuiz, Section, VideoChapter,
  StudentProgress, StudentNote, secondsToLabel,
} from "@/data/courseTypes";

// ─── Demo video chunks ────────────────────────────────────────────────────────
// Replace these URLs with your own hosted videos; these are public domain
// Big Buck Bunny segments available via Wikimedia / Blender Foundation.
 
export interface VideoChunk {
  id: string;
  title: string;
  duration: string;       // display label e.g. "4:12"
  durationSeconds: number;
  src: string;
  thumbnail?: string;
  chapters: VideoChapter[]; // chapters that belong to THIS chunk
}

const DEMO_CHUNKS: VideoChunk[] = [
  {
    id: "chunk-1",
    title: "1. Introduction & Setup",
    duration: "3:26",
    durationSeconds: 206,
    src: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.webm",
    chapters: [
      { id: "ch-1", title: "Welcome", timestamp: "0:00", timestampSeconds: 0 },
      { id: "ch-2", title: "What we'll build", timestamp: "1:10", timestampSeconds: 70 },
      { id: "ch-3", title: "Environment setup", timestamp: "2:30", timestampSeconds: 150 },
    ],
  },
  {
    id: "chunk-2",
    title: "2. Core Concepts",
    duration: "5:14",
    durationSeconds: 314,
    src: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.webm",
    chapters: [
      { id: "ch-4", title: "Data types", timestamp: "0:00", timestampSeconds: 0 },
      { id: "ch-5", title: "Functions", timestamp: "2:00", timestampSeconds: 120 },
    ],
  },
  {
    id: "chunk-3",
    title: "3. Advanced Patterns",
    duration: "6:01",
    durationSeconds: 361,
    src: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.webm",
    chapters: [
      { id: "ch-6", title: "Decorators", timestamp: "0:00", timestampSeconds: 0 },
      { id: "ch-7", title: "Context managers", timestamp: "3:10", timestampSeconds: 190 },
    ],
  },
  {
    id: "chunk-4",
    title: "4. Async & Concurrency",
    duration: "4:48",
    durationSeconds: 288,
    src: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.webm",
    chapters: [
      { id: "ch-8", title: "asyncio basics", timestamp: "0:00", timestampSeconds: 0 },
      { id: "ch-9", title: "Task groups", timestamp: "2:40", timestampSeconds: 160 },
    ],
  },
  {
    id: "chunk-5",
    title: "5. Testing & Wrap-up",
    duration: "3:55",
    durationSeconds: 235,
    src: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.webm",
    chapters: [
      { id: "ch-10", title: "Writing tests", timestamp: "0:00", timestampSeconds: 0 },
      { id: "ch-11", title: "CI integration", timestamp: "2:00", timestampSeconds: 120 },
      { id: "ch-12", title: "What's next", timestamp: "3:20", timestampSeconds: 200 },
    ],
  },
];

// ─── File icons ────────────────────────────────────────────────────────────────

const FILE_ICONS: Record<FileType, { icon: React.ReactNode; color: string; bg: string }> = {
  video: { icon: <Film className="w-4 h-4" />,      color: "text-blue-400",    bg: "bg-blue-900/30 dark:bg-blue-900/30" },
  doc:   { icon: <FileText className="w-4 h-4" />,   color: "text-sky-400",     bg: "bg-sky-900/30 dark:bg-sky-900/30" },
  image: { icon: <ImageIcon className="w-4 h-4" />,  color: "text-emerald-400", bg: "bg-emerald-900/30 dark:bg-emerald-900/30" },
  apk:   { icon: <Package className="w-4 h-4" />,    color: "text-amber-400",   bg: "bg-amber-900/30 dark:bg-amber-900/30" },
  other: { icon: <Paperclip className="w-4 h-4" />,  color: "text-gray-400 dark:text-white/40", bg: "bg-gray-100 dark:bg-white/[0.06]" },
};

// ─── Resume Toast ─────────────────────────────────────────────────────────────

function ResumeToast({
  progressSeconds, onResume, onDismiss,
}: {
  progressSeconds: number;
  onResume: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-gray-950/90 backdrop-blur-md border border-white/10 shadow-2xl whitespace-nowrap"
    >
      <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
        <Bookmark className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Resume watching</p>
        <p className="text-sm font-black text-white">from {secondsToLabel(progressSeconds)}</p>
      </div>
      <button
        onClick={onResume}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all"
      >
        <Play className="w-3.5 h-3.5" />Resume
      </button>
      <button onClick={onDismiss} className="p-1.5 text-white/20 hover:text-white/60 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Notes Panel ─────────────────────────────────────────────────────────────

function NotesPanel({
  notes, currentSeconds, onAdd, onDelete, onSeek,
}: {
  notes: StudentNote[];
  currentSeconds: number;
  onAdd: (note: Omit<StudentNote, "id" | "createdAt">) => void;
  onDelete: (id: string) => void;
  onSeek: (seconds: number) => void;
}) {
  const [draft, setDraft] = useState("");

  const addNote = () => {
    if (!draft.trim()) return;
    onAdd({
      timestampSeconds: currentSeconds,
      timestampLabel: secondsToLabel(currentSeconds),
      text: draft.trim(),
    });
    setDraft("");
  };

  return (
    <div className="space-y-3">
      {/* Add note */}
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#0d1929] overflow-hidden">
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <span className="font-mono text-xs text-blue-500 dark:text-blue-400 font-bold">{secondsToLabel(currentSeconds)}</span>
          <span className="text-gray-300 dark:text-white/20 text-xs">·</span>
          <span className="text-xs text-gray-400 dark:text-white/30">Note at current timestamp</span>
        </div>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote(); }}
          placeholder="Type a note… (⌘↵ to save)"
          rows={3}
          className="w-full px-4 py-2 text-sm bg-transparent text-gray-700 dark:text-white/70 placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none resize-none"
        />
        <div className="flex justify-end px-4 pb-3">
          <button onClick={addNote} disabled={!draft.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-30 transition-all">
            <Plus className="w-3.5 h-3.5" />Save note
          </button>
        </div>
      </div>

      {/* Note list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-300 dark:text-white/20">
          <StickyNote className="w-7 h-7 opacity-40" />
          <p className="text-xs">No notes yet. Pause the video and jot something down.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...notes].sort((a, b) => a.timestampSeconds - b.timestampSeconds).map(note => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="group flex items-start gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0d1929] border border-black/[0.06] dark:border-white/[0.06] hover:border-black/[0.12] dark:hover:border-white/[0.12] transition-colors">
              <button onClick={() => onSeek(note.timestampSeconds)}
                className="font-mono text-xs text-blue-500 dark:text-blue-400 font-bold hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex-shrink-0 mt-0.5">
                {note.timestampLabel}
              </button>
              <p className="flex-1 text-sm text-gray-600 dark:text-white/60 leading-relaxed min-w-0">{note.text}</p>
              <button onClick={() => onDelete(note.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 dark:text-white/20 hover:text-red-400 transition-all flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Video Player ─────────────────────────────────────────────────────────────
// Now plays real <video> chunks with native playback, working fullscreen,
// speed control, scrubber, and chapter markers per chunk.

interface VideoPlayerProps {
  chunks: VideoChunk[];
  activeChunkId: string;
  progressSeconds: number;
  watchedChunkIds: string[];
  onProgressChange: (s: number) => void;
  onChapterChange: (ch: VideoChapter) => void;
  onChunkChange: (chunkId: string) => void;
  onChunkComplete: (chunkId: string) => void;
}

function VideoPlayer({
  chunks,
  activeChunkId,
  progressSeconds,
  onProgressChange,
  onChapterChange,
  onChunkChange,
  onChunkComplete,
}: VideoPlayerProps) {
  const videoRef      = useRef<HTMLVideoElement>(null);
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const [playing, setPlaying]         = useState(false);
  const [current, setCurrent]         = useState(0);
  const [duration, setDuration]       = useState(0);
  const [muted, setMuted]             = useState(false);
  const [speed, setSpeed]             = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [showResume, setShowResume]       = useState(progressSeconds > 0);
  const [currentChapter, setCurrentChapter] = useState<VideoChapter | null>(null);

  const activeChunk = chunks.find(c => c.id === activeChunkId) ?? chunks[0];

  // Sync speed to video element
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  // Sync muted
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  // When chunk changes reset playhead
  useEffect(() => {
    setCurrent(0);
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [activeChunkId]);

  // Fullscreen listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    setMuted(p => !p);
  };

  const toggleFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const seek = (s: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = s;
    setCurrent(s);
    onProgressChange(s);
    updateChapterBadge(s);
  };

  const updateChapterBadge = (s: number) => {
    const ch = [...activeChunk.chapters].reverse().find(c => c.timestampSeconds <= s);
    if (ch) { setCurrentChapter(ch); onChapterChange(ch); }
  };

  const scrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  const skipNext = () => {
    const idx = chunks.findIndex(c => c.id === activeChunkId);
    if (idx < chunks.length - 1) onChunkChange(chunks[idx + 1].id);
  };

  const resume = () => {
    setShowResume(false);
    seek(progressSeconds);
    videoRef.current?.play();
    setPlaying(true);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full rounded-3xl overflow-hidden bg-gray-950 shadow-2xl shadow-black/50"
    >
      {/* Video area */}
      <div
        className="relative w-full aspect-video bg-gradient-to-br dark:from-gray-900 dark:via-[#060d18] dark:to-gray-950 flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          preload="auto"
          playsInline
          onTimeUpdate={e => {
            const t = e.currentTarget.currentTime;
            setCurrent(t);
            onProgressChange(t);
            updateChapterBadge(t);
          }}
          onLoadedMetadata={e => {
            setDuration(e.currentTarget.duration);
          }}
          onEnded={() => {
            setPlaying(false);
            onChunkComplete(activeChunkId);
          }}
        >
          <source src={activeChunk.src} />
        </video>

        {/* Chapter badge */}
        <AnimatePresence>
          {currentChapter && (
            <motion.div
              key={currentChapter.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 z-10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-bold text-white/70">{currentChapter.title}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center play/pause overlay */}
        <AnimatePresence>
          {!playing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all pointer-events-none">
                <Play className="w-6 h-6 ml-0.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resume toast */}
        <AnimatePresence>
          {showResume && (
            <ResumeToast progressSeconds={progressSeconds} onResume={resume} onDismiss={() => setShowResume(false)} />
          )}
        </AnimatePresence>
      </div>

      {/* Controls bar — always dark regardless of page theme */}
      <div className="bg-gray-950 px-5 py-3 space-y-2.5">
        {/* Scrubber */}
        <div
          className="relative h-1.5 bg-white/10 rounded-full cursor-pointer group"
          onClick={scrubClick}
        >
          <div
            className="absolute inset-y-0 left-0 bg-blue-500 rounded-full group-hover:bg-blue-400 transition-colors"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${pct}% - 7px)` }}
          />
          {/* Chapter markers */}
          {activeChunk.chapters.map(ch => (
            <button
              key={ch.id}
              onClick={e => { e.stopPropagation(); seek(ch.timestampSeconds); }}
              title={`${ch.timestamp} — ${ch.title}`}
              style={{ left: `${duration ? (ch.timestampSeconds / duration) * 100 : 0}%` }}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30 hover:bg-white hover:scale-150 transition-all"
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={e => { e.stopPropagation(); togglePlay(); }} className="text-white/70 hover:text-white transition-colors">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={e => { e.stopPropagation(); skipNext(); }} className="text-white/70 hover:text-white transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
          <button onClick={e => { e.stopPropagation(); toggleMute(); }} className="text-white/70 hover:text-white transition-colors">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <span className="text-xs text-white/30 font-mono">
            {secondsToLabel(Math.floor(current))} / {secondsToLabel(Math.floor(duration))}
          </span>

          {/* Chunk label */}
          <span className="text-xs text-white/20 truncate max-w-[140px] hidden sm:block">
            {activeChunk.title}
          </span>

          <div className="flex-1" />

          {/* Speed */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowSpeedMenu(p => !p)}
              className="text-xs font-bold text-white/40 hover:text-white/70 px-2 py-1 rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              {speed}x
            </button>
            <AnimatePresence>
              {showSpeedMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bottom-full mb-2 right-0 bg-gray-950 border border-white/10 rounded-xl overflow-hidden shadow-xl z-20"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                    <button
                      key={s}
                      onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}
                      className={`block w-full px-4 py-2 text-xs font-bold text-left hover:bg-white/10 transition-colors ${speed === s ? "text-blue-400" : "text-white/50"}`}
                    >
                      {s}x
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fullscreen / Zoom */}
          <button
            onClick={e => { e.stopPropagation(); toggleFullscreen(); }}
            className="text-white/40 hover:text-white transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Playlist ─────────────────────────────────────────────────────────────────

function Playlist({
  chunks,
  activeChunkId,
  watchedChunkIds,
  onSelect,
}: {
  chunks: VideoChunk[];
  activeChunkId: string;
  watchedChunkIds: string[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-[#0d1929] rounded-2xl border border-black/[0.07] dark:border-white/[0.07] overflow-hidden">
      <div className="px-5 py-3 border-b border-black/[0.07] dark:border-white/[0.07] flex items-center justify-between">
        <p className="text-sm font-black text-gray-900 dark:text-white">Course Videos</p>
        <span className="text-xs text-gray-400 dark:text-white/25">
          {watchedChunkIds.length}/{chunks.length} watched
        </span>
      </div>
      <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
        {chunks.map((chunk, i) => {
          const isActive  = chunk.id === activeChunkId;
          const isWatched = watchedChunkIds.includes(chunk.id);
          return (
            <button
              key={chunk.id}
              onClick={() => onSelect(chunk.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03] ${isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
            >
              {/* Thumbnail placeholder */}
              <div className={`relative w-16 h-10 rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden ${isActive ? "ring-2 ring-blue-500" : ""}`}>
                <Film className="w-5 h-5 text-gray-300 dark:text-white/20" />
                {isActive && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <Play className="w-4 h-4 text-blue-400 ml-0.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${isActive ? "text-blue-600 dark:text-blue-300" : "text-gray-700 dark:text-white/70"}`}>
                  {chunk.title}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-white/25 font-mono mt-0.5">
                  {chunk.duration} · {chunk.chapters.length} chapters
                </p>
              </div>

              <div className="flex-shrink-0">
                {isActive ? (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                ) : isWatched ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <span className="text-[10px] font-bold text-gray-300 dark:text-white/20">{i + 1}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Quiz Widget ──────────────────────────────────────────────────────────────

function QuizWidget({ quiz, existingScore }: { quiz: InlineQuiz; existingScore?: number }) {
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(existingScore !== undefined);
  const [score, setScore]         = useState(existingScore ?? 0);
  const [expanded, setExpanded]   = useState(false);

  const passed = score >= quiz.passMark;
  const allAnswered = quiz.questions.every(q => answers[q.id]);

  const submit = () => {
    const correct = quiz.questions.filter(q => answers[q.id] === q.correctOptionId).length;
    setScore(Math.round((correct / quiz.questions.length) * 100));
    setSubmitted(true);
  };

  const retry = () => { setAnswers({}); setSubmitted(false); setScore(0); };

  return (
    <div className={`rounded-2xl border overflow-hidden ${
      submitted
        ? passed
          ? "border-emerald-200 dark:border-emerald-800/60"
          : "border-red-200 dark:border-red-900/60"
        : "border-amber-200 dark:border-amber-900/50"
    }`}>
      <button
        onClick={() => setExpanded(p => !p)}
        className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
          submitted
            ? passed
              ? "bg-emerald-50 dark:bg-emerald-900/15"
              : "bg-red-50 dark:bg-red-900/15"
            : "bg-amber-50 dark:bg-amber-900/10"
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          submitted
            ? passed ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-red-100 dark:bg-red-900/30"
            : "bg-amber-100 dark:bg-amber-900/30"
        }`}>
          {submitted
            ? passed
              ? <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              : <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            : <ListChecks className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          }
        </div>
        <div className="flex-1 text-left">
          <p className={`text-sm font-black ${
            submitted
              ? passed ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400"
              : "text-amber-700 dark:text-amber-300"
          }`}>{quiz.title}</p>
          <p className="text-xs text-gray-400 dark:text-white/30">
            {submitted
              ? `Score: ${score}% · ${passed ? "Passed 🎉" : `Need ${quiz.passMark}% to pass`}`
              : `${quiz.questions.length} questions · ${quiz.passMark}% to pass`
            }
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-300 dark:text-white/30" /> : <ChevronDown className="w-4 h-4 text-gray-300 dark:text-white/30" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 py-5 bg-gray-50 dark:bg-[#0d1929] space-y-5">
              {quiz.questions.map((q, qi) => {
                const sel = answers[q.id];
                return (
                  <div key={q.id} className="space-y-3">
                    <p className="text-sm font-bold text-gray-800 dark:text-white/80">
                      <span className="text-gray-300 dark:text-white/25 mr-2">Q{qi + 1}.</span>{q.question}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map(opt => {
                        const isSelected = sel === opt.id;
                        const isCorrect  = opt.id === q.correctOptionId;
                        let cls = "border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-gray-600 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/20";
                        if (submitted) {
                          if (isCorrect)         cls = "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
                          else if (isSelected)   cls = "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400";
                          else                   cls = "border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] text-gray-300 dark:text-white/25 opacity-60";
                        } else if (isSelected)   cls = "border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300";
                        return (
                          <button
                            key={opt.id}
                            disabled={submitted}
                            onClick={() => setAnswers(p => ({ ...p, [q.id]: opt.id }))}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-left text-sm font-semibold transition-all disabled:cursor-default ${cls}`}
                          >
                            {submitted && isCorrect
                              ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                              : submitted && isSelected && !isCorrect
                              ? <X className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                              : <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-200 dark:border-white/20"}`} />
                            }
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && q.explanation && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-900/40">
                        <AlertCircle className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-300/80">{q.explanation}</p>
                      </motion.div>
                    )}
                  </div>
                );
              })}

              {!submitted && (
                <button onClick={submit} disabled={!allAnswered}
                  className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600 hover:opacity-90 disabled:opacity-30 shadow-md transition-all">
                  Submit Quiz
                </button>
              )}
              {submitted && !passed && (
                <button onClick={retry}
                  className="w-full py-3 rounded-2xl text-sm font-bold text-red-500 dark:text-red-400 border-2 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  Try Again
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  section, isCompleted, onMarkComplete,
}: {
  section: Section;
  isCompleted: boolean;
  onMarkComplete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab]           = useState<"videos" | "files" | "quizzes">("videos");

  const hasVideos  = section.videos.length > 0;
  const hasFiles   = section.files.length > 0;
  const hasQuizzes = section.quizzes.filter(q => q.isPublished).length > 0;

  useEffect(() => {
    if (hasVideos) setTab("videos");
    else if (hasFiles) setTab("files");
    else if (hasQuizzes) setTab("quizzes");
  }, []);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-colors ${
      isCompleted
        ? "border-emerald-200 dark:border-emerald-800/40"
        : "border-black/[0.07] dark:border-white/[0.07]"
    } bg-white dark:bg-[#0d1929]`}>
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isCompleted ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-blue-50 dark:bg-blue-900/30"
        }`}>
          {isCompleted
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            : <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          }
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-black text-gray-900 dark:text-white">{section.title}</p>
          {section.description && <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{section.description}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-300 dark:text-white/25">
          {hasVideos   && <span>{section.videos.length}v</span>}
          {hasFiles    && <span>{section.files.length}f</span>}
          {hasQuizzes  && <span className="text-amber-400">{section.quizzes.filter(q => q.isPublished).length}q</span>}
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-gray-300 dark:text-white/25" />
          : <ChevronDown className="w-4 h-4 text-gray-300 dark:text-white/25" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-black/[0.06] dark:border-white/[0.07]">
              {/* Tabs */}
              <div className="flex gap-1 px-5 pt-3">
                {([
                  { id: "videos",  label: "Videos",  count: section.videos.length },
                  { id: "files",   label: "Files",   count: section.files.length },
                  { id: "quizzes", label: "Quizzes", count: section.quizzes.filter(q => q.isPublished).length },
                ] as const).map(t => t.count > 0 ? (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                      tab === t.id
                        ? "text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                        : "text-gray-300 dark:text-white/25 border-transparent hover:text-gray-500 dark:hover:text-white/50"
                    }`}>
                    {t.label} <span className="opacity-60">({t.count})</span>
                  </button>
                ) : null)}
              </div>

              <div className="px-5 py-4 space-y-2">
                <AnimatePresence mode="wait">
                  {tab === "videos" && (
                    <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                      {section.videos.map(v => (
                        <div key={v.id} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer group transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Film className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-700 dark:text-white/70 truncate">{v.name}</p>
                            <p className="text-xs text-gray-400 dark:text-white/25">{v.size} {v.duration && `· ${v.duration}`}</p>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 transition-all">
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                  {tab === "files" && (
                    <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                      {section.files.map(f => {
                        const meta = FILE_ICONS[f.type];
                        return (
                          <div key={f.id} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer group transition-colors">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>{meta.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-700 dark:text-white/70 truncate">{f.name}</p>
                              <p className="text-xs text-gray-400 dark:text-white/25">{f.size}</p>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-white/40 transition-all">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                  {tab === "quizzes" && (
                    <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      {section.quizzes.filter(q => q.isPublished).map(quiz => (
                        <QuizWidget key={quiz.id} quiz={quiz} existingScore={MOCK_STUDENT_PROGRESS.quizScores[quiz.id]} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="px-5 pb-4 flex justify-end">
                <button onClick={() => onMarkComplete(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isCompleted
                      ? "border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-white/30 hover:border-blue-300 dark:hover:border-blue-500/40 hover:text-blue-500 dark:hover:text-blue-400"
                  }`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  {isCompleted ? "Completed" : "Mark Complete"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentViewCourse() {
  const course = MOCK_ACTIVE_COURSE;

  // Light / dark mode
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const [progress, setProgress] = useState<StudentProgress>(MOCK_STUDENT_PROGRESS);
  const [tab, setTab]           = useState<"video" | "materials">("video");
  const [currentChapter, setCurrentChapter] = useState<VideoChapter | null>(null);
  const [videoSideTab, setVideoSideTab]     = useState<"chapters" | "notes">("chapters");

  // Playlist state
  const [activeChunkId, setActiveChunkId] = useState(DEMO_CHUNKS[0].id);
  const [watchedChunkIds, setWatchedChunkIds] = useState<string[]>([]);

  const activeChunk = DEMO_CHUNKS.find(c => c.id === activeChunkId) ?? DEMO_CHUNKS[0];

  const totalSections  = course.sections.length;
  const doneCount      = progress.completedSectionIds.length;
  const completionPct  = totalSections > 0 ? Math.round((doneCount / totalSections) * 100) : 0;

  const publishedSections = course.sections.filter(s => s.isPublished);
  const lockedSections    = course.sections.filter(s => !s.isPublished);

  const toggleComplete = (id: string) =>
    setProgress(p => ({
      ...p,
      completedSectionIds: p.completedSectionIds.includes(id)
        ? p.completedSectionIds.filter(x => x !== id)
        : [...p.completedSectionIds, id],
    }));

  const addNote = (note: Omit<StudentNote, "id" | "createdAt">) =>
    setProgress(p => ({
      ...p,
      notes: [...p.notes, { ...note, id: `n-${Date.now()}`, createdAt: new Date().toISOString() }],
    }));

  const deleteNote = (id: string) =>
    setProgress(p => ({ ...p, notes: p.notes.filter(n => n.id !== id) }));

  const handleChunkComplete = (id: string) => {
    setWatchedChunkIds(p => p.includes(id) ? p : [...p, id]);
    // Auto-advance
    const idx = DEMO_CHUNKS.findIndex(c => c.id === id);
    if (idx < DEMO_CHUNKS.length - 1) setActiveChunkId(DEMO_CHUNKS[idx + 1].id);
  };

  // All chapters across all chunks for sidebar display
  const allChapters = DEMO_CHUNKS.flatMap(c => c.chapters);

  return (
    <div className={`min-h-screen`}>
      {/* Ambient glow — dark only */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-blue-800/8 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative max-w-[1200px] mx-auto md:px-4 py-8">

        {/* ── Header ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 py-4 px-4 -mt-7 md:px-8 bg-white shadow-md dark:bg-[#0d1929] rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/25">
              <span>My Courses</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600 dark:text-blue-400 font-semibold">{course.name}</span>
            </div>

            {/* Light / dark toggle */}
            <button
              onClick={() => setIsDark(p => !p)}
              className="flex items-center hidden md:flex gap-2 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-500 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 text-xs font-semibold transition-all"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {isDark ? "Light mode" : "Dark mode"}
            </button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-3xl shadow-xl flex-shrink-0`}>
                {course.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-400 dark:text-white/25 uppercase tracking-wider">{course.code}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900">{course.level}</span>
                </div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white mb-1">{course.name}</h1>
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-white/30">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.totalStudents}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{DEMO_CHUNKS.length} videos</span>
                  <span className="whitespace-nowrap">by {course.instructor.name}</span>
                </div>
              </div>
            </div>

            {/* Circular progress */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-2xl font-black text-gray-900 dark:text-white">{completionPct}%</p>
                <p className="text-xs text-gray-400 dark:text-white/30">complete</p>
              </div>
              <div className="relative w-12 h-12">
                <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-black/[0.06] dark:text-white/[0.07]" />
                  <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4"
                    stroke={completionPct === 100 ? "#34d399" : "#3b82f6"}
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - completionPct / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                {completionPct === 100 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 bg-black/[0.06] dark:bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className={`h-full rounded-full ${completionPct === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/20 mt-1">
            <span>{doneCount}/{totalSections} sections</span>
            <span>{watchedChunkIds.length}/{DEMO_CHUNKS.length} videos watched</span>
          </div>
        </motion.div>

        {/* ── Two-column layout ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">

          {/* Left column */}
          <div className="space-y-4">
            {/* Tab selector */}
            <div className="flex gap-1 p-1.5 bg-white dark:bg-[#0d1929] rounded-2xl border border-black/[0.07] dark:border-white/[0.07]">
              {[
                { id: "video",     label: "📽 Course Videos" },
                { id: "materials", label: "📂 Materials", count: publishedSections.length },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as "video" | "materials")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    tab === t.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60"
                  }`}>
                  {t.label}
                  {"count" in t && t.count !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      tab === t.id
                        ? "bg-white/20 text-white"
                        : "bg-black/[0.06] dark:bg-white/[0.08] text-gray-400 dark:text-white/30"
                    }`}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* ── Video tab ──────────────────────────────────────── */}
              {tab === "video" && (
                <motion.div key="vid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <VideoPlayer
                    chunks={DEMO_CHUNKS}
                    activeChunkId={activeChunkId}
                    progressSeconds={progress.mainVideoProgressSeconds}
                    watchedChunkIds={watchedChunkIds}
                    onProgressChange={s => setProgress(p => ({ ...p, mainVideoProgressSeconds: s }))}
                    onChapterChange={ch => {
                      setCurrentChapter(ch);
                      setProgress(p => ({
                        ...p,
                        watchedChapterIds: p.watchedChapterIds.includes(ch.id)
                          ? p.watchedChapterIds
                          : [...p.watchedChapterIds, ch.id],
                      }));
                    }}
                    onChunkChange={setActiveChunkId}
                    onChunkComplete={handleChunkComplete}
                  />

                  {/* Playlist */}
                  <Playlist
                    chunks={DEMO_CHUNKS}
                    activeChunkId={activeChunkId}
                    watchedChunkIds={watchedChunkIds}
                    onSelect={setActiveChunkId}
                  />

                  {/* Below-video tabs: chapters + notes */}
                  <div className="bg-white dark:bg-[#0d1929] rounded-2xl border border-black/[0.07] dark:border-white/[0.07] overflow-hidden">
                    <div className="flex border-b border-black/[0.07] dark:border-white/[0.07]">
                      {[
                        { id: "chapters", label: `Chapters (${activeChunk.chapters.length})` },
                        { id: "notes",    label: `My Notes (${progress.notes.length})` },
                      ].map(t => (
                        <button key={t.id} onClick={() => setVideoSideTab(t.id as "chapters" | "notes")}
                          className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${
                            videoSideTab === t.id
                              ? "text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                              : "text-gray-400 dark:text-white/30 border-transparent hover:text-gray-600 dark:hover:text-white/50"
                          }`}>{t.label}</button>
                      ))}
                    </div>

                    <div className="p-4">
                      <AnimatePresence mode="wait">
                        {videoSideTab === "chapters" && (
                          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                            {activeChunk.chapters.map((ch, i) => {
                              const watched   = progress.watchedChapterIds.includes(ch.id);
                              const isCurrent = currentChapter?.id === ch.id;
                              return (
                                <button key={ch.id}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                                    isCurrent
                                      ? "bg-blue-50 dark:bg-blue-900/20"
                                      : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                                  }`}>
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black ${
                                    isCurrent
                                      ? "bg-blue-600 text-white"
                                      : watched
                                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                                      : "bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-white/30"
                                  }`}>
                                    {watched && !isCurrent ? <Check className="w-3.5 h-3.5" /> : i + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${isCurrent ? "text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-white/60"}`}>{ch.title}</p>
                                    <p className="text-xs text-gray-300 dark:text-white/25 font-mono">{ch.timestamp}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                        {videoSideTab === "notes" && (
                          <motion.div key="nt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <NotesPanel
                              notes={progress.notes}
                              currentSeconds={progress.mainVideoProgressSeconds}
                              onAdd={addNote}
                              onDelete={deleteNote}
                              onSeek={s => setProgress(p => ({ ...p, mainVideoProgressSeconds: s }))}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* About */}
                  <div className="bg-white dark:bg-[#0d1929] rounded-2xl border border-black/[0.07] dark:border-white/[0.07] p-5 space-y-4">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">About This Course</h3>
                    <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">{course.description}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Level",    value: course.level,               icon: <BarChart2 className="w-4 h-4" /> },
                        { label: "Videos",   value: `${DEMO_CHUNKS.length}`,    icon: <Film className="w-4 h-4" /> },
                        { label: "Chapters", value: `${allChapters.length}`,    icon: <ListChecks className="w-4 h-4" /> },
                      ].map(s => (
                        <div key={s.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-transparent">
                          <div className="text-blue-500">{s.icon}</div>
                          <div>
                            <p className="text-[10px] text-gray-400 dark:text-white/25 font-bold uppercase">{s.label}</p>
                            <p className="text-xs font-black text-gray-700 dark:text-white/70">{s.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Materials tab ──────────────────────────────────── */}
              {tab === "materials" && (
                <motion.div key="mat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {/* Stats strip */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Sections",  value: publishedSections.length, color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20" },
                      { label: "Completed", value: doneCount,                color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                      { label: "Quizzes",   value: publishedSections.reduce((a, s) => a + s.quizzes.filter(q => q.isPublished).length, 0), color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
                    ].map(s => (
                      <div key={s.label} className={`${s.bg} border border-black/[0.05] dark:border-white/[0.06] px-4 py-3 rounded-2xl flex items-center gap-2`}>
                        <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 dark:text-white/30 font-bold">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {publishedSections.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-gray-300 dark:text-white/20">
                      <BookOpen className="w-10 h-10 opacity-30" />
                      <p className="text-sm">No materials published yet. Check back soon.</p>
                    </div>
                  ) : (
                    publishedSections.map(s => (
                      <SectionCard
                        key={s.id}
                        section={s}
                        isCompleted={progress.completedSectionIds.includes(s.id)}
                        onMarkComplete={toggleComplete}
                      />
                    ))
                  )}

                  {lockedSections.length > 0 && (
                    <div className="border border-dashed border-black/[0.08] dark:border-white/[0.06] rounded-2xl px-5 py-4 flex items-center gap-3 opacity-50">
                      <Lock className="w-5 h-5 text-gray-400 dark:text-white/30" />
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-white/40">{lockedSections.length} upcoming section{lockedSections.length > 1 ? "s" : ""}</p>
                        <p className="text-xs text-gray-400 dark:text-white/20">Not yet released by your instructor.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 md:sticky top-4">
            {/* Video navigator */}
            <div className="bg-white dark:bg-[#0d1929] rounded-2xl border border-black/[0.07] dark:border-white/[0.07] overflow-hidden">
              <div className="px-5 py-4 border-b border-black/[0.07] dark:border-white/[0.07]">
                <p className="text-sm font-black text-gray-900 dark:text-white">Current Chapters</p>
                <p className="text-xs text-gray-400 dark:text-white/25 mt-0.5">{activeChunk.title}</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {activeChunk.chapters.map((ch, i) => {
                  const watched   = progress.watchedChapterIds.includes(ch.id);
                  const isCurrent = currentChapter?.id === ch.id;
                  return (
                    <button key={ch.id}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${isCurrent ? "bg-blue-50 dark:bg-blue-900/15" : ""}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black ${
                        isCurrent
                          ? "bg-blue-600 text-white"
                          : watched
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-white/[0.05] text-gray-400 dark:text-white/25"
                      }`}>
                        {watched && !isCurrent ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isCurrent ? "text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-white/50"}`}>{ch.title}</p>
                        <p className="text-[10px] text-gray-300 dark:text-white/20 font-mono">{ch.timestamp}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress panel */}
            <div className="bg-white dark:bg-[#0d1929] rounded-2xl border border-black/[0.07] dark:border-white/[0.07] p-4 space-y-3">
              <p className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-wide">Your Progress</p>
              {[
                {
                  label: "Sections done",
                  value: `${doneCount}/${totalSections}`,
                  pct: completionPct,
                },
                {
                  label: "Videos watched",
                  value: `${watchedChunkIds.length}/${DEMO_CHUNKS.length}`,
                  pct: Math.round((watchedChunkIds.length / DEMO_CHUNKS.length) * 100),
                },
                {
                  label: "Chapters watched",
                  value: `${progress.watchedChapterIds.length}/${allChapters.length}`,
                  pct: Math.round((progress.watchedChapterIds.length / (allChapters.length || 1)) * 100),
                },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-gray-400 dark:text-white/30">{r.label}</span>
                    <span className="text-xs font-bold text-gray-600 dark:text-white/60">{r.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              ))}

              {completionPct === 100 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-900/30 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/40">
                  <Award className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">Course Complete!</p>
                    <p className="text-[10px] text-emerald-500">Certificate ready to download</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}