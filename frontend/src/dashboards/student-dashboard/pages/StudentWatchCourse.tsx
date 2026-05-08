// src/dashboards/student-dashboard/pages/StudentWatchCourse.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward,
  Settings, Download, FileText, CheckCircle2, Clock,
  ArrowLeft, Home, List, ChevronDown, Lock,
  PlayCircle, Eye, AlertCircle, Loader2, Star, HelpCircle, Award, XCircle,
  ChevronLeft, ChevronRight, X, File
} from "lucide-react";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import CoursesService, {
  type CourseResponse,
  type CourseSection,
  type CourseLesson,
  type CourseMaterial
} from "@/services/course.service";
import ProgressService from "@/services/progress.service";
import ReviewService, { type ReviewResponse } from "@/services/review.service";
import QuizService, { type Quiz, type QuizAttempt } from "@/services/quiz.service";

// ==================== TYPES ====================

interface VideoProgress {
  currentTime: number;
  duration: number;
  watchedSeconds: number;
  watched: boolean;
}

interface LessonProgressDetail {
  id: string;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
  watchedSeconds: number;
  totalSeconds: number;
}

interface SectionProgressDetail {
  id: string;
  title: string;
  lessons: LessonProgressDetail[];
}

interface CourseProgressDetail {
  courseId: string;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  sections: SectionProgressDetail[];
}

// ==================== HELPERS ====================

function getSectionsAsArray(sections: CourseSection[] | string | undefined): CourseSection[] {
  if (Array.isArray(sections)) return sections;
  if (typeof sections === "string") {
    try {
      const parsed = JSON.parse(sections);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  return [];
}

/** Unwrap the progress API response — handles both flat and { data: ... } shapes */
function unwrapProgress(raw: unknown): CourseProgressDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  // Handle { data: { sections: [...], ... } } wrapper
  if (r.data && typeof r.data === "object" && Array.isArray((r.data as Record<string, unknown>).sections)) {
    return r.data as unknown as CourseProgressDetail;
  }
  // Handle flat { sections: [...], ... }
  if (Array.isArray(r.sections)) {
    return r as unknown as CourseProgressDetail;
  }
  return null;
}

function buildCompletedSet(raw: unknown): Set<string> {
  const set = new Set<string>();
  const p = unwrapProgress(raw);
  if (!p || !Array.isArray(p.sections)) return set;
  for (const section of p.sections) {
    if (!Array.isArray(section.lessons)) continue;
    for (const lesson of section.lessons) {
      if (lesson.isCompleted) set.add(lesson.id);
    }
  }
  return set;
}

function buildLockedSet(raw: unknown): Set<string> {
  const set = new Set<string>();
  const p = unwrapProgress(raw);
  if (!p || !Array.isArray(p.sections)) return set;
  for (const section of p.sections) {
    if (!Array.isArray(section.lessons)) continue;
    for (const lesson of section.lessons) {
      if (lesson.isLocked) set.add(lesson.id);
    }
  }
  return set;
}

function isSectionComplete(section: CourseSection, completedIds: Set<string>): boolean {
  const lessons = section.lessons ?? [];
  return lessons.length > 0 && lessons.every(l => completedIds.has(l.id));
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function getMaterialIcon(type: string) {
  switch (type) {
    case "DOCUMENT": return <FileText className="w-4 h-4" />;
    case "LINK": return <Eye className="w-4 h-4" />;
    case "AUDIO": return <Volume2 className="w-4 h-4" />;
    case "TEXT": return <FileText className="w-4 h-4" />;
    default: return <File className="w-4 h-4" />;
  }
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ==================== REVIEW MODAL ====================

function ReviewModal({
  courseId,
  existingReview,
  onClose,
  onSubmitted,
}: {
  courseId: string;
  existingReview: ReviewResponse | null | undefined;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!rating || comment.trim().length < 10) return;
    setSubmitting(true);
    try {
      await ReviewService.create({ courseId, rating, comment: comment.trim() });
      setSuccess(true);
      setTimeout(() => { onSubmitted(); onClose(); }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden
          bg-white dark:bg-slate-900/80 backdrop-blur-2xl
          border border-white/20 dark:border-white/10 shadow-2xl shadow-black/40 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {existingReview ? "Your Review" : "Leave a Review"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {existingReview ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-6 h-6 ${s <= existingReview.rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
              ))}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{existingReview.rating}/5</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{existingReview.comment}</p>
          </div>
        ) : success ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white">Review submitted!</p>
            <p className="text-sm text-gray-400">Thanks for your feedback.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                    <Star className={`w-6 h-6 transition-all ${s <= (hovered || rating) ? "text-amber-400 fill-amber-400 scale-110" : "text-gray-300 dark:text-gray-600"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Comment</label>
              <textarea
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience (min. 10 characters)..."
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/30 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              {comment.length > 0 && comment.length < 10 && (
                <p className="mt-1.5 text-xs text-amber-500">{comment.length}/10 characters</p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || !rating || comment.trim().length < 10}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : "Submit Review"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ==================== VIDEO PLAYER ====================

function VideoPlayer({
  material,
  resumeAt,
  onProgress,
  onComplete,
  onNearEnd,
  onPrefetch,
}: {
  material: CourseMaterial;
  resumeAt?: number;
  onProgress: (p: VideoProgress) => void;
  onComplete: () => void;
  onNearEnd?: () => void;
  onPrefetch?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimeRef = useRef<number>(0);
  const watchedSecondsRef = useRef<number>(0);
  const nearEndFiredRef = useRef<boolean>(false);
  const prefetchFiredRef = useRef<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    if (resumeAt && resumeAt > 5) { setResumeTime(resumeAt); setShowResume(true); }
  }, [resumeAt]);

  useEffect(() => {
    setIsPlaying(false); setCurrentTime(0); setDuration(0); setShowResume(false);
    lastTimeRef.current = 0;
    watchedSecondsRef.current = 0;
    nearEndFiredRef.current = false;
    prefetchFiredRef.current = false;
    // Auto-play when src changes — catch rejection silently (browser autoplay policy)
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
  }, [material.url]);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); v.paused ? v.play() : v.pause(); break;
        case "ArrowLeft": e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 5); break;
        case "ArrowRight": e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 5); break;
        case "m": case "M": v.muted = !v.muted; setIsMuted(v.muted); break;
        case "f": case "F": toggleFullscreen(); break;
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      const now = video.currentTime;
      // Only accumulate when actually playing (not seeking/paused)
      if (!video.paused && !video.ended && lastTimeRef.current > 0) {
        const delta = now - lastTimeRef.current;
        // Ignore negative deltas (seek backwards) and large jumps (seek forwards)
        if (delta > 0 && delta < 2) {
          watchedSecondsRef.current += delta;
        }
      }
      lastTimeRef.current = now;

      setCurrentTime(now);
      if (video.buffered.length > 0)
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      // Fire onPrefetch once when ≤7s remain (video must be >7s) — kicks off API work early
      if (
        onPrefetch &&
        !prefetchFiredRef.current &&
        video.duration > 7 &&
        video.duration - now <= 7 &&
        video.duration - now > 0
      ) {
        prefetchFiredRef.current = true;
        onPrefetch();
      }
      // Fire onNearEnd once when ≤5s remain — shows the banner
      if (
        onNearEnd &&
        !nearEndFiredRef.current &&
        video.duration > 5 &&
        video.duration - now <= 5 &&
        video.duration - now > 0
      ) {
        nearEndFiredRef.current = true;
        onNearEnd();
      }
      if (progressTimer.current) return;
      progressTimer.current = setTimeout(() => {
        progressTimer.current = null;
        onProgress({
          currentTime: video.currentTime,
          duration: video.duration,
          watchedSeconds: Math.floor(watchedSecondsRef.current),
          watched: video.currentTime / video.duration > 0.9,
        });
      }, 5000);
    };
    const onPlay = () => { lastTimeRef.current = video.currentTime; setIsPlaying(true); };
    const onPause = () => { lastTimeRef.current = 0; setIsPlaying(false); };
    const onMeta = () => setDuration(video.duration);
    const onEnd = () => { lastTimeRef.current = 0; setIsPlaying(false); onComplete(); };
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("ended", onEnd);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("ended", onEnd);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      if (progressTimer.current) clearTimeout(progressTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [onProgress, onComplete]);

  const togglePlay = () => { const v = videoRef.current; if (!v) return; v.paused ? v.play() : v.pause(); };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    const t = parseFloat(e.target.value); v.currentTime = t; setCurrentTime(t);
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    const val = parseFloat(e.target.value); v.volume = val; setVolume(val); setIsMuted(val === 0);
  };
  const toggleMute = () => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setIsMuted(v.muted); };
  const changeRate = (r: number) => { const v = videoRef.current; if (!v) return; v.playbackRate = r; setPlaybackRate(r); setShowSpeed(false); };
  const toggleFullscreen = async () => {
    const el = containerRef.current; if (!el) return;
    if (!document.fullscreenElement) await el.requestFullscreen().catch(() => {});
    else await document.exitFullscreen().catch(() => {});
  };
  const handleResume = () => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = resumeTime; setCurrentTime(resumeTime); setShowResume(false); v.play();
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const controlsVisible = showControls || !isPlaying;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden select-none"
      style={{ height: "min(56dvh, calc(100vw * 9/16))" }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (hideTimer.current) clearTimeout(hideTimer.current); setShowControls(false); }}
      onMouseEnter={resetHideTimer}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        src={material.url}
        onClick={togglePlay}
        onContextMenu={e => e.preventDefault()}
        playsInline
        autoPlay
        controlsList="nodownload"
      />

      {/* Resume toast */}
      <AnimatePresence>
        {showResume && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 text-white text-sm z-20 whitespace-nowrap"
          >
            <span>Resume from <strong>{formatDuration(resumeTime)}</strong>?</span>
            <button onClick={handleResume} className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold transition-colors">Resume</button>
            <button onClick={() => setShowResume(false)} className="text-white/50 hover:text-white text-xs">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay — only gradient + controls when visible */}
      <motion.div
        animate={{ opacity: controlsVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: controlsVisible ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 40%, rgba(0,0,0,0.2) 100%)" : "none" }}
      />

      {/* Center play button */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all pointer-events-auto"
          >
            {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 pointer-events-auto"
          >
            {/* Seek bar */}
            <div className="relative mb-3 group/seek h-4 flex items-center">
              <div className="absolute inset-y-[6px] left-0 rounded-full bg-white/20 pointer-events-none" style={{ width: `${buffered}%` }} />
              <input
                type="range" min="0" max={duration || 0} step="0.1" value={currentTime}
                onChange={handleSeek}
                className="relative w-full h-1 rounded-full appearance-none cursor-pointer group-hover/seek:h-1.5 transition-all"
                style={{ background: `linear-gradient(to right, #3b82f6 ${pct}%, rgba(255,255,255,0.25) ${pct}%)` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); }} className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={togglePlay} className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration, v.currentTime + 10); }} className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                  <SkipForward className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 group/vol">
                  <button onClick={toggleMute} className="p-1.5 text-white/70 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-200">
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)` }}
                    />
                  </div>
                </div>

                <span className="text-xs text-white/60 font-mono tabular-nums ml-1">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <div className="relative">
                  <button onClick={() => setShowSpeed(p => !p)} className="flex items-center gap-1 text-white/70 hover:text-white text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all">
                    <Settings className="w-3.5 h-3.5" />{playbackRate}x
                  </button>
                  <AnimatePresence>
                    {showSpeed && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-2 bg-gray-950/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[80px] z-30"
                      >
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                          <button key={r} onClick={() => changeRate(r)}
                            className={cn("block w-full px-4 py-2 text-xs text-left transition-colors hover:bg-white/10", playbackRate === r ? "text-blue-400 font-bold" : "text-white/70")}>
                            {r}x
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button onClick={toggleFullscreen} className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== FILE / IMAGE PREVIEW CARD ====================

function MaterialCard({ material }: { material: CourseMaterial }) {
  const isImage = material.type === "PDF" && material.fileName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
  const [preview, setPreview] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all group">
        {isImage ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-white/5">
            <img src={material.url} alt={material.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-500">
            {getMaterialIcon(material.type)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{material.title}</p>
          <p className="text-xs text-gray-400 truncate">{material.fileName ?? material.type}{material.size ? ` · ${formatFileSize(material.size)}` : ""}</p>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isImage && (
            <button onClick={() => setPreview(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
              <Eye className="w-4 h-4" />
            </button>
          )}
          <a href={material.url} download target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all">
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      <AnimatePresence>
        {preview && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreview(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
            >
              <img src={material.url} alt={material.title} className="max-w-full max-h-[90vh] object-contain" />
              <button onClick={() => setPreview(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ==================== TEXT MATERIAL CARD ====================

function TextMaterialCard({ material }: { material: CourseMaterial }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-500">
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{material.title}</p>
          <p className="text-xs text-gray-400">Text note</p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 flex-shrink-0 transition-transform", open ? "rotate-180" : "")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/[0.06]">
              {material.note ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{material.note}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No content available.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== QUIZ PANEL ====================

function SingleQuiz({ quiz, onNextSection, isLastSection }: {
  quiz: Quiz;
  onNextSection?: () => void;
  isLastSection?: boolean;
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [showReview, setShowReview] = useState(false);

  const { data: existingAttempt } = useQuery<QuizAttempt | null>({
    queryKey: ["quiz-attempt", quiz.id],
    queryFn: () => QuizService.getMyAttempt(quiz.id),
    enabled: !!quiz.id,
    retry: false,
  });

  useEffect(() => { if (existingAttempt) setResult(existingAttempt); }, [existingAttempt]);

  const handleSubmit = async () => {
    const answers = quiz.questions
      .filter(q => q.id && selectedAnswers[q.id])
      .map(q => ({ questionId: q.id!, optionId: selectedAnswers[q.id!] }));
    if (answers.length !== quiz.questions.length) return;
    setSubmitting(true);
    try { setResult(await QuizService.submit(quiz.id, { answers })); }
    catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  if (result) return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/[0.07] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", result.passed ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-red-50 dark:bg-red-950/40")}>
          {result.passed ? <Award className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm">{quiz.title}</h4>
          <p className={cn("text-xs font-semibold", result.passed ? "text-emerald-500" : "text-red-500")}>
            {result.passed ? "Passed" : "Failed"} — {result.score}/{result.totalQuestions} correct ({result.resolvedGrade}%)
          </p>
        </div>
        <span className={cn("text-xs px-2 py-1 rounded-lg font-bold", result.passed ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-100 dark:bg-red-500/15 text-red-500")}>
          {result.resolvedGrade}%
        </span>
      </div>
      <button onClick={() => setShowReview(!showReview)} className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">
        {showReview ? "Hide answers" : "Review answers"}
      </button>
      <AnimatePresence>
        {showReview && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-5 pt-1">
            {result.answers.map((ans, i) => (
              <div key={ans.questionId} className="space-y-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{i + 1}. {ans.questionText}</p>
                {quiz.questions.find(q => q.id === ans.questionId)?.options.map(opt => {
                  const isSel = opt.id === ans.selectedOptionId;
                  const isCorr = opt.id === ans.correctOptionId;
                  return (
                    <div key={opt.id} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm border",
                      isCorr ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300"
                        : isSel ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300"
                          : "border-transparent text-gray-500 dark:text-gray-500")}>
                      {isCorr ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : isSel ? <XCircle className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5" />}
                      {opt.text}
                    </div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next section / course complete CTA */}
      {result.passed && onNextSection && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNextSection}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
        >
          {isLastSection ? (
            <><Award className="w-4 h-4" />Complete Course</>
          ) : (
            <><span>Unlock Next Section</span><ChevronRight className="w-4 h-4" /></>
          )}
        </motion.button>
      )}
      {!result.passed && (
        <p className="text-xs text-center text-gray-400 pt-1">
          You scored {result.resolvedGrade}% — pass mark is {quiz.passMark}%. Quiz attempts are final.
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/[0.07] p-5 space-y-5">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{quiz.title}</h4>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg flex-shrink-0">Pass: {quiz.passMark}%</span>
      </div>
      <div className="space-y-5">
        {quiz.questions.map((q, i) => (
          <div key={q.id || i} className="space-y-2.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{i + 1}. {q.text}</p>
            <div className="space-y-2">
              {q.options.map(opt => {
                const chosen = q.id && selectedAnswers[q.id] === opt.id;
                return (
                  <button key={opt.id || opt.text} onClick={() => q.id && opt.id && setSelectedAnswers(p => ({ ...p, [q.id!]: opt.id! }))}
                    className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm text-left transition-all",
                      chosen ? "bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 font-semibold"
                        : "border-gray-200 dark:border-white/[0.07] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.03]")}>
                    <span className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
                      chosen ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600")}>
                      {chosen && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={submitting || quiz.questions.some(q => !q.id || !selectedAnswers[q.id])}
        className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : "Submit Quiz"}
      </button>
    </div>
  );
}

function QuizPanel({ sectionId, onNextSection, isLastSection }: {
  sectionId: string;
  onNextSection?: () => void;
  isLastSection?: boolean;
}) {
  const { data: quizList, isLoading, isError } = useQuery<{ data: Quiz[] }>({
    queryKey: ["section-quizzes", sectionId],
    queryFn: () => QuizService.findAll({ sectionId }),
    enabled: !!sectionId,
    retry: false,
  });

  const NextBtn = onNextSection ? (
    <button
      onClick={onNextSection}
      className="mt-2 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
    >
      {isLastSection ? <><Award className="w-4 h-4" />Complete Course</> : <><span>Continue to Next Section</span><ChevronRight className="w-4 h-4" /></>}
    </button>
  ) : null;

  if (isLoading) return (
    <div className="flex items-center gap-2 py-8 justify-center text-gray-400 text-sm">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading quizzes…
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-amber-500" />
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quiz unavailable</p>
      <p className="text-xs text-gray-400">Could not load this section's quiz. You can still proceed.</p>
      {NextBtn}
    </div>
  );

  const quizzes = quizList?.data ?? [];

  if (quizzes.length === 0) return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
        <HelpCircle className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-400">No quiz for this section</p>
      {NextBtn}
    </div>
  );

  return (
    <div className="space-y-4">
      {quizzes.map((quiz, i) => (
        <SingleQuiz
          key={quiz.id}
          quiz={quiz}
          onNextSection={i === quizzes.length - 1 ? onNextSection : undefined}
          isLastSection={isLastSection}
        />
      ))}
    </div>
  );
}

// ==================== FILE PREVIEW PANEL ====================

function FilePreviewPanel({ material }: { material: CourseMaterial }) {
  const isImage = !!material.fileName?.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/i);
  const isPdf = material.fileName?.toLowerCase().endsWith(".pdf") || (material.type === "PDF" && !isImage);
  const isAudio = material.type === "AUDIO";
  const isLink = material.type === "LINK";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{material.title}</h2>
          {material.fileName && (
            <p className="text-xs text-gray-400 mt-0.5">{material.fileName}{material.size ? ` · ${formatFileSize(material.size)}` : ""}</p>
          )}
        </div>
        <a
          href={material.url}
          download={!isLink || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
        >
          {isLink ? <Eye className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {isLink ? "Open" : "Download"}
        </a>
      </div>

      {/* Preview area */}
      {isImage ? (
        <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] flex items-center justify-center" style={{ minHeight: "60vh" }}>
          <img src={material.url} alt={material.title} className="max-w-full max-h-[70vh] object-contain" />
        </div>
      ) : isPdf ? (
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/[0.07]" style={{ height: "70vh" }}>
          <iframe src={material.url} className="w-full h-full" title={material.title} />
        </div>
      ) : isAudio ? (
        <div className="rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/[0.07] p-8 flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
            <Volume2 className="w-8 h-8 text-violet-500" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{material.title}</p>
          <audio controls src={material.url} className="w-full max-w-md" />
        </div>
      ) : isLink ? (
        <div className="rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/[0.07] p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <Eye className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{material.title}</p>
            <p className="text-xs text-gray-400 break-all max-w-sm">{material.url}</p>
          </div>
          <a href={material.url} target="_blank" rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
            Open Link
          </a>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/[0.07] p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <FileText className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{material.title}</p>
            {material.fileName && <p className="text-xs text-gray-400 mt-0.5">{material.fileName}{material.size ? ` · ${formatFileSize(material.size)}` : ""}</p>}
          </div>
          <a href={material.url} download target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
            <Download className="w-4 h-4" /> Download
          </a>
        </div>
      )}
    </motion.div>
  );
}

// ==================== SECTION LOCKED MODAL ====================

function SectionLockedModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ duration: 0.18 }}
        className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden
          bg-white dark:bg-[#0d1525] backdrop-blur-2xl
          border border-white/20 dark:border-white/10
          shadow-2xl shadow-black/40 p-6 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Content Locked</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-all shadow-lg shadow-blue-500/20"
        >
          Got it
        </button>
      </motion.div>
    </div>
  );
}

// ==================== LESSON ITEM ====================

function LessonItem({ lesson, isCompleted, isLocked, isCurrent, onClick }: {
  lesson: CourseLesson; isCompleted: boolean; isLocked: boolean; isCurrent: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={cn(
      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
      isLocked ? "cursor-not-allowed opacity-60 border border-transparent"
        : isCurrent ? "bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 cursor-pointer"
        : "hover:bg-gray-50 dark:hover:bg-white/[0.04] border border-transparent cursor-pointer"
    )}>
      <div className="flex-shrink-0">
        {isCompleted ? (
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        ) : isLocked ? (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-blue-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{lesson.title}</h4>
        {lesson.description && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{lesson.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {lesson.duration && lesson.duration > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />{formatDuration(lesson.duration)}
            </span>
          )}
          {lesson.isPreview && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium">Preview</span>
          )}
        </div>
      </div>
      {isCurrent && <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
    </button>
  );
}

// ==================== MAIN COMPONENT ====================

export default function StudentWatchCourse() {
  const { id: courseId, lessonId: lessonIdParam } = useParams<{ id: string; lessonId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [lockedAccessMessage, setLockedAccessMessage] = useState<string | null>(null);
  const autoCompletedRef = useRef<Set<string>>(new Set());

  const [quizSectionId, setQuizSectionId] = useState<string | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<CourseMaterial | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // On mobile, default sidebar closed
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────────

  const { data: course, isLoading, error } = useQuery<CourseResponse>({
    queryKey: ["course", courseId],
    queryFn: () => { if (!courseId) throw new Error("No ID"); return CoursesService.findOne(courseId); },
    enabled: !!courseId,
  });

  const { data: progressRaw } = useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => ProgressService.getCourseProgress(courseId!),
    enabled: !!courseId && !!course?.isEnrolled,
  });

  const { data: existingReview } = useQuery<ReviewResponse | null>({
    queryKey: ["my-review", courseId],
    queryFn: () => ReviewService.getMyReview(courseId!),
    enabled: !!courseId && !!course?.isEnrolled,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────

  const { mutate: saveProgress } = useMutation({
    mutationFn: ({ lessonId, watchedSeconds }: { lessonId: string; watchedSeconds: number }) =>
      ProgressService.updateLessonProgress(lessonId, { watchedSeconds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-progress", courseId] }),
  });

  // ── Derived state ─────────────────────────────────────────────────────────────

  const sections = getSectionsAsArray(course?.sections);
  const progressData = unwrapProgress(progressRaw);
  const completedIds = buildCompletedSet(progressRaw);
  const lockedIds = buildLockedSet(progressRaw);

  // Overall progress: prefer the API value, fall back to computing from completed/total
  const totalLessons = progressData?.totalLessons ?? sections.flatMap(s => s.lessons).length;
  const completedCount = progressData?.completedLessons ?? completedIds.size;
  const overallProgress = (progressData?.overallProgress && progressData.overallProgress > 0)
    ? progressData.overallProgress
    : totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

  // Keep a `progress` alias so the existing `{progress && ...}` guards in the JSX still work
  const progress = progressData ?? (progressRaw ? {} as CourseProgressDetail : null);

  // Prefetch quiz existence for every section in parallel — background, no UI spinner
  const sectionIds = sections.map(s => s.id);
  const quizPrefetchResults = useQueries({
    queries: sectionIds.map(sectionId => ({
      queryKey: ["section-quizzes", sectionId],
      queryFn: () => QuizService.findAll({ sectionId, limit: 1 }),
      enabled: !!course?.isEnrolled,
      staleTime: 5 * 60 * 1000, // 5 min — quiz list rarely changes mid-session
      retry: false,
    })),
  });

  // Build a set of section IDs that are confirmed to have at least one quiz.
  // While a section's query is still loading we treat it as "has quiz" (safe default)
  // so we never flash a quiz step and then remove it — we only remove once confirmed empty.
  const sectionsWithQuiz = new Set(
    sectionIds.filter((_id, i) => {
      const result = quizPrefetchResults[i];
      if (!result || result.isLoading || result.isPending) return true; // unknown → keep
      if (result.isError) return false; // failed to load → skip
      return (result.data?.data?.length ?? 0) > 0;
    })
  );

  // Flat navigable content list — only video lessons + quiz step when section has quizzes
  const allContent = sections.flatMap(section => {
    const videoLessons = section.lessons.filter(l => l.materials?.some(m => m.type === "VIDEO"));
    if (videoLessons.length === 0) return [];
    return [
      ...videoLessons.map(l => ({ type: "lesson" as const, lesson: l, sectionId: section.id })),
      ...(sectionsWithQuiz.has(section.id)
        ? [{ type: "quiz" as const, sectionId: section.id }]
        : []),
    ];
  });

  const currentIndex = allContent.findIndex(c =>
    c.type === "lesson" ? c.lesson.id === selectedLesson?.id : c.sectionId === quizSectionId
  );

  // ── Effects ───────────────────────────────────────────────────────────────────

  // On mount: select lesson from URL param, or fall back to first lesson
  useEffect(() => {
    if (!course || selectedLesson || sections.length === 0) return;

    let targetLesson: CourseLesson | null = null;

    // 1. Try URL param
    if (lessonIdParam) {
      for (const section of sections) {
        targetLesson = section.lessons.find(l => l.id === lessonIdParam) ?? null;
        if (targetLesson) break;
      }
    }

    // 2. Fall back to first video lesson
    if (!targetLesson) {
      const firstSection = sections[0];
      targetLesson = firstSection?.lessons.find(l => l.materials?.some(m => m.type === "VIDEO")) ?? null;
    }

    if (targetLesson) {
      setSelectedLesson(targetLesson);
      const vid = targetLesson.materials?.find(m => m.type === "VIDEO");
      if (vid) setSelectedMaterial(vid);
      const section = sections.find(s => s.lessons.some(l => l.id === targetLesson!.id));
      if (section) setExpandedSections(new Set([section.id]));
    }
  }, [course, selectedLesson, sections, lessonIdParam]);

  useEffect(() => {
    if (selectedLesson) {
      const section = sections.find(s => s.lessons.some(l => l.id === selectedLesson.id));
      if (section) setExpandedSections(prev => new Set([...prev, section.id]));
    }
  }, [selectedLesson, course]);

  // Sync lesson ID into the URL so the browser remembers which lesson was active
  useEffect(() => {
    if (selectedLesson && courseId && selectedLesson.id !== lessonIdParam) {
      navigate(`/student/courses/${courseId}/watch/${selectedLesson.id}`, { replace: true });
    }
  }, [selectedLesson?.id]);

  // ── Navigation helpers ────────────────────────────────────────────────────────

  const selectLesson = (lesson: CourseLesson) => {
    cancelCountdown();
    setSelectedLesson(lesson);
    setQuizSectionId(null);
    setPreviewMaterial(null);
    const vid = lesson.materials?.find(m => m.type === "VIDEO");
    setSelectedMaterial(vid ?? null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const openQuiz = (sectionId: string) => {
    cancelCountdown();
    setSelectedMaterial(null);
    setPreviewMaterial(null);
    setQuizSectionId(sectionId);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // Cancel countdown on unmount
  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  // Enter key skips the countdown immediately
  useEffect(() => {
    if (autoPlayCountdown === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") { e.preventDefault(); navigateToNext(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [autoPlayCountdown]);

  const goNext = () => {
    if (currentIndex < allContent.length - 1) {
      const next = allContent[currentIndex + 1];
      if (next.type === "lesson") selectLesson(next.lesson);
      else openQuiz(next.sectionId);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      const prev = allContent[currentIndex - 1];
      if (prev.type === "lesson") selectLesson(prev.lesson);
      else openQuiz(prev.sectionId);
    }
  };

  const handleQuizNextSection = async () => {
    const currentSectionIndex = sections.findIndex(s => s.id === quizSectionId);
    const isLastSec = currentSectionIndex === sections.length - 1;

    if (isLastSec && courseId) {
      ProgressService.completeCourse(courseId).catch(() => {});
      navigate("/student/courses");
      return;
    }

    // Refetch progress so the next section is unlocked
    if (courseId) {
      await queryClient.refetchQueries({ queryKey: ["course-progress", courseId] }).catch(() => {});
    }

    // Navigate to the first video lesson of the next section
    const nextSection = sections[currentSectionIndex + 1];
    if (nextSection) {
      const firstVideoLesson = nextSection.lessons.find(l => l.materials?.some(m => m.type === "VIDEO"));
      if (firstVideoLesson) {
        setSelectedLesson(firstVideoLesson);
        setQuizSectionId(null);
        setPreviewMaterial(null);
        setSelectedMaterial(firstVideoLesson.materials?.find(m => m.type === "VIDEO") ?? null);
        setExpandedSections(prev => new Set([...prev, nextSection.id]));
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
    }
  };

  const handleVideoProgress = (vp: VideoProgress) => {
    if (!selectedLesson) return;
    saveProgress({ lessonId: selectedLesson.id, watchedSeconds: vp.watchedSeconds });
    // Auto-complete when 90% watched — only once per lesson
    if (vp.watched && !autoCompletedRef.current.has(selectedLesson.id)) {
      autoCompletedRef.current.add(selectedLesson.id);
      ProgressService.completeLesson(selectedLesson.id)
        .then(() => queryClient.refetchQueries({ queryKey: ["course-progress", courseId] }))
        .catch(e => console.error("Auto-complete failed:", e));
    }
  };

  const cancelCountdown = () => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setAutoPlayCountdown(null);
    nextLessonPromiseRef.current = null;
  };

  // Ref to hold the in-flight prefetch promise
  const nextLessonPromiseRef = useRef<Promise<void> | null>(null);
  const [loadingNext, setLoadingNext] = useState(false);

  // Fires at 7s remaining — complete lesson + refetch progress in background
  const prefetchNextLesson = () => {
    if (currentIndex >= allContent.length - 1) return;
    if (!selectedLesson || autoCompletedRef.current.has(selectedLesson.id)) {
      // Already completed — just prefetch progress
      nextLessonPromiseRef.current = queryClient
        .refetchQueries({ queryKey: ["course-progress", courseId] })
        .catch(e => console.error("Prefetch progress failed:", e));
      return;
    }
    autoCompletedRef.current.add(selectedLesson.id);
    nextLessonPromiseRef.current = ProgressService.completeLesson(selectedLesson.id)
      .then(() => queryClient.refetchQueries({ queryKey: ["course-progress", courseId] }))
      .catch(e => console.error("Prefetch next lesson failed:", e));
  };

  // Fires at 5s remaining — shows the 5s countdown banner only, no API calls
  const startCountdown = () => {
    if (autoPlayCountdown !== null || currentIndex >= allContent.length - 1) return;
    const DELAY = 5;
    setAutoPlayCountdown(DELAY);
    countdownRef.current = setInterval(() => {
      setAutoPlayCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
          setTimeout(() => navigateToNext(), 0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Called when countdown ends or user skips — just navigate, promise is already resolved
  const navigateToNext = async () => {
    cancelCountdown();
    // If prefetch is somehow still in flight (very slow network), wait briefly
    if (nextLessonPromiseRef.current) {
      setLoadingNext(true);
      try { await nextLessonPromiseRef.current; } catch { /* already logged */ }
      setLoadingNext(false);
      nextLessonPromiseRef.current = null;
    }
    if (currentIndex >= allContent.length - 1) {
      if (courseId) ProgressService.completeCourse(courseId).catch(() => {});
      navigate("/student/courses");
      return;
    }
    const next = allContent[currentIndex + 1];
    if (next.type === "lesson") {
      setSelectedLesson(next.lesson);
      setQuizSectionId(null);
      setPreviewMaterial(null);
      setSelectedMaterial(next.lesson.materials?.find(m => m.type === "VIDEO") ?? null);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } else {
      setSelectedMaterial(null);
      setPreviewMaterial(null);
      setQuizSectionId(next.sectionId);
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const handleVideoNearEnd = () => startCountdown();

  const handleVideoComplete = () => {
    // Countdown already running — nothing to do
    if (autoPlayCountdown !== null) return;
    // Short video (≤5s) — prefetch hasn't fired yet, do it now then show banner
    if (!selectedLesson || autoCompletedRef.current.has(selectedLesson.id)) {
      startCountdown();
      return;
    }
    autoCompletedRef.current.add(selectedLesson.id);
    nextLessonPromiseRef.current = ProgressService.completeLesson(selectedLesson.id)
      .then(() => queryClient.refetchQueries({ queryKey: ["course-progress", courseId] }))
      .catch(e => console.error("Video-end complete failed:", e));
    startCountdown();
  };

  // ── Guards ────────────────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a] flex items-center justify-center">
      <div className="text-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" /><p className="text-sm text-gray-400">Loading course…</p></div>
    </div>
  );

  if (error || !course) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-6 h-6 text-red-500" /></div>
        <p className="text-gray-400 mb-4">Course not found or access denied</p>
        <button onClick={() => navigate("/student/courses")} className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">Back to My Courses</button>
      </div>
    </div>
  );

  if (!course.isEnrolled) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a] flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4"><Lock className="w-6 h-6 text-amber-500" /></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enrollment Required</h2>
        <p className="text-gray-400 mb-6 text-sm">You need to enroll to access this course.</p>
        <button onClick={() => navigate(`/student/courses/${course.id}`)} className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">View Course</button>
      </div>
    </div>
  );

  // ── Render helpers ────────────────────────────────────────────────────────────

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Sidebar header */}
      <div className="p-4 border-b border-gray-100 dark:border-white/[0.06] flex-shrink-0">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Course Content</h2>
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sections.map(section => {
          const sectionComplete = isSectionComplete(section, completedIds);
          const sectionExpanded = expandedSections.has(section.id);
          const videoLessons = section.lessons.filter(l => l.materials?.some(m => m.type === "VIDEO"));

          if (videoLessons.length === 0) return null;

          return (
            <div key={section.id} className={cn(
              "rounded-2xl border overflow-hidden transition-all",
              sectionComplete
                ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5"
                : "border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02]"
            )}>
              <button
                onClick={() => {
                  setExpandedSections(prev => { const n = new Set(prev); n.has(section.id) ? n.delete(section.id) : n.add(section.id); return n; });
                }}
                className="w-full px-3 py-2.5 flex items-center justify-between transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {sectionComplete
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : null
                  }
                  <span className={cn("text-sm font-semibold truncate",
                    sectionComplete ? "text-emerald-700 dark:text-emerald-400"
                    : "text-gray-900 dark:text-white")}>
                    {section.title}
                  </span>
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform flex-shrink-0 text-gray-400",
                  sectionExpanded ? "rotate-180" : "")} />
              </button>

              <AnimatePresence>
                {sectionExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-2 pb-2 space-y-1">
                      {videoLessons.map(lesson => (
                        <LessonItem key={lesson.id} lesson={lesson} isCompleted={completedIds.has(lesson.id)} isLocked={lockedIds.has(lesson.id)} isCurrent={selectedLesson?.id === lesson.id} onClick={() => selectLesson(lesson)} />
                      ))}
                      {/* Quiz entry — shown at the bottom of the section if a quiz exists */}
                      {sectionsWithQuiz.has(section.id) && (
                        <button
                          onClick={() => openQuiz(section.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border",
                            quizSectionId === section.id
                              ? "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30"
                              : "hover:bg-gray-50 dark:hover:bg-white/[0.04] border-transparent"
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                            <HelpCircle className="w-4 h-4 text-violet-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">Section Quiz</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Test your knowledge</p>
                          </div>
                          {quizSectionId === section.id && (
                            <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0a0f1a] overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-white/80 rounded-2xl mb-2 dark:bg-[#0d1525]/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06] z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Back button */}
          <button onClick={() => navigate("/student/courses")}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">{course.title}</h1>
            {selectedLesson && <p className="text-xs text-gray-400 truncate">{selectedLesson.title}</p>}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Progress bar */}
            {progress && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">{Math.round(overallProgress)}%</span>
              </div>
            )}

            {/* Review star button */}
            {course.isEnrolled && (
              <button onClick={() => setShowReviewModal(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all relative"
                title={existingReview ? "View your review" : "Leave a review"}>
                <Star className={cn("w-4 h-4", existingReview ? "fill-amber-400" : "")} />
                {existingReview && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0d1525]" />}
              </button>
            )}

            {/* Toggle sidebar */}
            <button onClick={() => setSidebarOpen(p => !p)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all">
              <List className="w-4 h-4" />
            </button>

            <button onClick={() => navigate("/student/courses")}
              className="hidden sm:flex w-8 h-8 rounded-xl items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all">
              <Home className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Mobile progress strip */}
        {progress && (
          <div className="sm:hidden px-4 pb-2 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
            </div>
            <span className="text-xs text-gray-400 tabular-nums flex-shrink-0">{Math.round(overallProgress)}%</span>
          </div>
        )}
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="hidden md:flex flex-col w-80 flex-shrink-0 bg-white dark:bg-[#0d1525] border-r border-gray-200 dark:border-white/[0.06] overflow-hidden"
              style={{ zIndex: 20 }}
            >
              {sidebarContent}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile drawer — bottom sheet */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="fixed left-0 right-0 bottom-0 bg-white dark:bg-[#0d1525] z-50 md:hidden shadow-2xl flex flex-col rounded-t-2xl"
                style={{ maxHeight: "80dvh" }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06] flex-shrink-0">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Course Content</span>
                  <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  {sidebarContent}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
            {/* Video player */}
            {selectedMaterial?.type === "VIDEO" ? (
              <div className="space-y-3">
                {/* Locked lesson overlay */}
                {selectedLesson && lockedIds.has(selectedLesson.id) ? (
                  <div
                    className="relative bg-black rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{ height: "min(56dvh, calc(100vw * 9/16))" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950" />
                    <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
                      <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <Lock className="w-7 h-7 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-base mb-1">Lesson Locked</p>
                        <p className="text-gray-400 text-sm">Complete the previous lessons to unlock this video.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <VideoPlayer
                      material={selectedMaterial}
                      onProgress={handleVideoProgress}
                      onComplete={handleVideoComplete}
                      onNearEnd={handleVideoNearEnd}
                      onPrefetch={prefetchNextLesson}
                    />
                    {/* Loading overlay while next lesson is being fetched */}
                    <AnimatePresence>
                      {loadingNext && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 rounded-2xl bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20"
                        >
                          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                          <p className="text-sm font-semibold text-white/80">Loading next lesson…</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Auto-advance countdown banner */}
                <AnimatePresence>
                  {autoPlayCountdown !== null && (
                    <motion.button
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      onClick={() => navigateToNext()}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white/[0.06] border border-white/10 overflow-hidden relative text-left"
                    >
                      <motion.div
                        className="absolute inset-0 bg-blue-600/20 dark:bg-blue-500/15 origin-left"
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 5, ease: "linear" }}
                      />
                      <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 relative z-10" />
                      <span className="text-sm font-semibold text-white relative z-10">
                        Next lesson in {autoPlayCountdown}s — press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">Enter</kbd> to continue now
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); cancelCountdown(); }}
                        className="ml-auto relative z-10 text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Loading overlay while next lesson is being fetched */}
                <AnimatePresence>
                  {loadingNext && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-2xl bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20"
                    >
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                      <p className="text-sm font-semibold text-white/80">Loading next lesson…</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Lesson metadata + prev/next */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {selectedLesson && (
                      <>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedLesson.title}</h2>
                        {selectedLesson.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedLesson.description}</p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <button onClick={goPrev} disabled={currentIndex <= 0}
                      className="flex-1 sm:flex-none h-9 sm:px-3 rounded-xl border border-gray-200 dark:border-white/[0.07] flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all gap-1.5 text-xs font-semibold">
                      <ChevronLeft className="w-4 h-4" />
                      <span className="sm:inline">Prev</span>
                    </button>
                  </div>
                </div>

                {/* Additional non-video materials */}
                {selectedLesson?.materials && selectedLesson.materials.filter(m => m.type !== "VIDEO").length > 0 && (
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/[0.07] p-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Lesson Materials</h3>
                    <div className="space-y-2">
                      {selectedLesson.materials.filter(m => m.type !== "VIDEO").map(mat =>
                        mat.type === "TEXT" ? (
                          <TextMaterialCard key={mat.id} material={mat} />
                        ) : (
                          <MaterialCard key={mat.id} material={mat} />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : quizSectionId ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Section Quiz</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={goPrev} disabled={currentIndex <= 0} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/[0.07] flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={goNext} disabled={currentIndex >= allContent.length - 1} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/[0.07] flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <QuizPanel
                  sectionId={quizSectionId}
                  onNextSection={handleQuizNextSection}
                  isLastSection={sections.length > 0 && sections[sections.length - 1].id === quizSectionId}
                />
              </div>
            ) : previewMaterial ? (
              <FilePreviewPanel material={previewMaterial} />
            ) : (
              <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-4">
                  <PlayCircle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-400 text-sm">Select a lesson to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {lockedAccessMessage && (
          <SectionLockedModal message={lockedAccessMessage} onClose={() => setLockedAccessMessage(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReviewModal && courseId && (
          <ReviewModal
            courseId={courseId}
            existingReview={existingReview}
            onClose={() => setShowReviewModal(false)}
            onSubmitted={() => queryClient.invalidateQueries({ queryKey: ["my-review", courseId] })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}