// src/dashboards/student-dashboard/pages/StudentWatchCourse.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward,
  Settings, Download, FileText, CheckCircle2, Clock,
  ArrowLeft, Home, List, ChevronDown, Lock,
  PlayCircle, Eye, AlertCircle, Loader2, Star, HelpCircle, Award, XCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CoursesService, {
  type CourseResponse,
  type CourseSection,
  type CourseLesson,
  type CourseMaterial
} from "@/services/course.service";
import ProgressService from "@/services/progress.service";
import ReviewService, { type ReviewResponse } from "@/services/review.service";
import QuizService, { type QuizResponse } from "@/services/quiz.service";

// ==================== TYPES ====================

interface VideoProgress {
  currentTime: number;
  duration: number;
  watched: boolean;
}

// Shape returned by GET /api/progress/courses/{courseId}
interface LessonProgressDetail {
  id: string;
  title: string;
  isCompleted: boolean;
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
  overallProgress: number; // 0–100
  completedLessons: number;
  totalLessons: number;
  sections: SectionProgressDetail[];
}

// ==================== HELPERS ====================

function getSectionsAsArray(
  sections: CourseSection[] | string | undefined
): CourseSection[] {
  if (Array.isArray(sections)) return sections;
  if (typeof sections === "string") {
    try {
      const parsed = JSON.parse(sections);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Build a Set of completed lesson IDs from the progress detail response.
 * Handles the real DTO shape: progress.sections[].lessons[].isCompleted
 */
function buildCompletedSet(progress: CourseProgressDetail | unknown): Set<string> {
  const set = new Set<string>();
  if (!progress || typeof progress !== "object") return set;

  const p = progress as CourseProgressDetail;
  if (!Array.isArray(p.sections)) return set;

  for (const section of p.sections) {
    if (!Array.isArray(section.lessons)) continue;
    for (const lesson of section.lessons) {
      if (lesson.isCompleted) set.add(lesson.id);
    }
  }
  return set;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown size";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ==================== VIDEO PLAYER ====================

function VideoPlayer({
  material,
  resumeAt,
  onProgress,
  onComplete,
}: {
  material: CourseMaterial;
  resumeAt?: number;
  onProgress: (progress: VideoProgress) => void;
  onComplete: () => void;
}) {
  const videoRef      = useRef<HTMLVideoElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [volume,       setVolume]       = useState(1);
  const [isMuted,      setIsMuted]      = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeed,    setShowSpeed]    = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResume,   setShowResume]   = useState(false);
  const [resumeTime,   setResumeTime]   = useState(0);
  const [buffered,     setBuffered]     = useState(0);

  // Show resume toast when resumeAt is provided
  useEffect(() => {
    if (resumeAt && resumeAt > 5) {
      setResumeTime(resumeAt);
      setShowResume(true);
    }
  }, [resumeAt]);

  // Reset state when material changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowResume(false);
  }, [material.url]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case " ": case "k":
          e.preventDefault();
          v.paused ? v.play() : v.pause();
          break;
        case "ArrowLeft":  e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 5); break;
        case "ArrowRight": e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 5); break;
        case "ArrowUp":    e.preventDefault(); v.volume = Math.min(1, v.volume + 0.1); setVolume(v.volume); break;
        case "ArrowDown":  e.preventDefault(); v.volume = Math.max(0, v.volume - 0.1); setVolume(v.volume); break;
        case "m": case "M": v.muted = !v.muted; setIsMuted(v.muted); break;
        case "f": case "F": toggleFullscreen(); break;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Update buffered
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
      // Throttle progress saves to every 5 seconds
      if (progressTimer.current) return;
      progressTimer.current = setTimeout(() => {
        progressTimer.current = null;
        onProgress({
          currentTime: video.currentTime,
          duration: video.duration,
          watched: video.currentTime / video.duration > 0.9,
        });
      }, 5000);
    };

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => { setIsPlaying(false); onComplete(); };
    const handlePlay  = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate",     handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended",          handleEnded);
    video.addEventListener("play",           handlePlay);
    video.addEventListener("pause",          handlePause);
    return () => {
      video.removeEventListener("timeupdate",     handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended",          handleEnded);
      video.removeEventListener("play",           handlePlay);
      video.removeEventListener("pause",          handlePause);
      if (progressTimer.current) clearTimeout(progressTimer.current);
      if (hideTimer.current)     clearTimeout(hideTimer.current);
    };
  }, [onProgress, onComplete]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = parseFloat(e.target.value);
    v.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const changePlaybackRate = (rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeed(false);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  const handleResume = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = resumeTime;
    setCurrentTime(resumeTime);
    setShowResume(false);
    v.play();
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (hideTimer.current) clearTimeout(hideTimer.current); setShowControls(false); }}
      onMouseEnter={resetHideTimer}
    >
      <video
        ref={videoRef}
        className="w-full aspect-video cursor-pointer"
        src={material.url}
        onClick={togglePlay}
        playsInline
      />

      {/* Resume toast */}
      <AnimatePresence>
        {showResume && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 text-white text-sm z-20"
          >
            <span>Resume from <strong>{formatDuration(resumeTime)}</strong>?</span>
            <button onClick={handleResume} className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold transition-colors">Resume</button>
            <button onClick={() => setShowResume(false)} className="text-white/50 hover:text-white text-xs">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center play/pause flash */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        onClick={togglePlay}
      />

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Center play button */}
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
        >
          {isPlaying
            ? <Pause className="w-8 h-8 text-white" />
            : <Play  className="w-8 h-8 text-white ml-1" />
          }
        </button>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
          {/* Progress bar */}
          <div className="relative mb-3 group/seek">
            {/* Buffered */}
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/20 pointer-events-none" style={{ width: `${buffered}%` }} />
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="relative w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:opacity-0 group-hover/seek:[&::-webkit-slider-thumb]:opacity-100
                [&::-webkit-slider-runnable-track]:bg-transparent"
              style={{ background: `linear-gradient(to right, #3b82f6 ${pct}%, rgba(255,255,255,0.2) ${pct}%)` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Left controls */}
            <div className="flex items-center gap-2">
              <button onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); }}
                className="text-white/70 hover:text-white transition-colors p-1">
                <SkipBack className="w-4 h-4" />
              </button>
              <button onClick={togglePlay} className="text-white/70 hover:text-white transition-colors p-1">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration, v.currentTime + 10); }}
                className="text-white/70 hover:text-white transition-colors p-1">
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5 group/vol">
                <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors p-1">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/vol:w-20 transition-all duration-200 h-1 rounded-full appearance-none cursor-pointer overflow-hidden
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  style={{ background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)` }}
                />
              </div>

              <span className="text-xs text-white/60 font-mono tabular-nums">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1">
              {/* Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeed(p => !p)}
                  className="flex items-center gap-1 text-white/70 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {playbackRate}x
                </button>
                <AnimatePresence>
                  {showSpeed && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute bottom-full right-0 mb-2 bg-gray-950/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[80px] z-30"
                    >
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`block w-full px-4 py-2 text-xs text-left transition-colors hover:bg-white/10 ${
                            playbackRate === rate ? "text-blue-400 font-bold" : "text-white/70"
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors p-1">
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== LESSON ITEM ====================

function LessonItem({
  lesson,
  isCompleted,
  isCurrent,
  onClick,
}: {
  lesson: CourseLesson;
  isCompleted: boolean;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const videoMaterial = lesson.materials?.find((m) => m.type === "VIDEO");
  const hasVideo = !!videoMaterial;
  const isLocked = !lesson.isPreview && !hasVideo;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
        isCurrent
          ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40"
          : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
      )}
    >
      <div className="flex-shrink-0">
        {isCompleted ? (
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        ) : isLocked ? (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {lesson.title}
        </h4>
        {lesson.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {lesson.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {lesson.duration && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(lesson.duration)}
            </span>
          )}
          {lesson.isPreview && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
              Preview
            </span>
          )}
        </div>
      </div>
      {isCurrent && (
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
      )}
    </div>
  );
}

// ==================== QUIZ PANEL ====================

interface QuizAttemptResult {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  resolvedGrade: number;
  passed: boolean;
  submittedAt: string;
  answers: {
    questionId: string;
    questionText: string;
    selectedOptionId: string;
    isCorrect: boolean;
    correctOptionId: string;
  }[];
}

function QuizPanel({ sectionId }: { sectionId: string }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [showReview, setShowReview] = useState(false);

  const { data: quizList, isLoading } = useQuery<{ data: QuizResponse[] }>({
    queryKey: ["section-quizzes", sectionId],
    queryFn: () => QuizService.getQuizzes({ sectionId }),
    enabled: !!sectionId,
  });

  const quiz = quizList?.data?.[0];

  const { data: existingAttempt } = useQuery<QuizAttemptResult>({
    queryKey: ["quiz-attempt", quiz?.id],
    queryFn: () => QuizService.getMyAttempt(quiz!.id),
    enabled: !!quiz?.id,
    retry: false,
  });

  useEffect(() => {
    if (existingAttempt) setResult(existingAttempt);
  }, [existingAttempt]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 px-4 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading quiz…
      </div>
    );
  }

  if (!quiz) return null;

  const handleSubmit = async () => {
    const answers = quiz.questions.map((q) => ({
      questionId: q.id,
      optionId: selectedAnswers[q.id] ?? "",
    }));
    if (answers.some((a) => !a.optionId)) return;
    setSubmitting(true);
    try {
      const res = await QuizService.submitQuiz(quiz.id, answers);
      setResult(res);
    } catch (e) {
      console.error("Quiz submission failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#131c2e] rounded-2xl border border-gray-200 dark:border-white/[0.07] p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            result.passed
              ? "bg-emerald-100 dark:bg-emerald-950/40"
              : "bg-red-100 dark:bg-red-950/40"
          )}>
            {result.passed
              ? <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              : <XCircle className="w-5 h-5 text-red-500" />
            }
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{quiz.title}</h3>
            <p className={cn(
              "text-sm font-semibold",
              result.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
            )}>
              {result.passed ? "Passed" : "Failed"} — {result.score}/{result.totalQuestions} correct ({result.resolvedGrade}%)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowReview(!showReview)}
          className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
        >
          {showReview ? "Hide review" : "Review answers"}
        </button>

        <AnimatePresence>
          {showReview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4"
            >
              {result.answers.map((ans, i) => (
                <div key={ans.questionId} className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {i + 1}. {ans.questionText}
                  </p>
                  {quiz.questions.find(q => q.id === ans.questionId)?.options.map(opt => {
                    const isSelected = opt.id === ans.selectedOptionId;
                    const isCorrect  = opt.id === ans.correctOptionId;
                    return (
                      <div
                        key={opt.id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border",
                          isCorrect
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300"
                            : isSelected
                            ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300"
                            : "border-transparent text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : isSelected ? <XCircle className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5" />}
                        {opt.text}
                      </div>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#131c2e] rounded-2xl border border-gray-200 dark:border-white/[0.07] p-6 space-y-6"
    >
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-gray-900 dark:text-white">{quiz.title}</h3>
        <span className="ml-auto text-xs text-gray-400">Pass mark: {quiz.passMark}%</span>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="space-y-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {i + 1}. {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const chosen = selectedAnswers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all",
                      chosen
                        ? "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold"
                        : "border-gray-200 dark:border-white/[0.07] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                      chosen ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"
                    )}>
                      {chosen && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || quiz.questions.some(q => !selectedAnswers[q.id])}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
      >
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : "Submit Quiz"}
      </button>
    </motion.div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function StudentWatchCourse() {
  const { id: courseId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showSidebar, setShowSidebar] = useState(true);
  const [quizSectionId, setQuizSectionId] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────────

  const { data: course, isLoading, error } = useQuery<CourseResponse>({
    queryKey: ["course", courseId],
    queryFn: () => {
      if (!courseId) throw new Error("Course ID is required");
      return CoursesService.findOne(courseId);
    },
    enabled: !!courseId,
  });

  // FIX: type cast progress response properly so we can read real data
  const { data: progress } = useQuery<CourseProgressDetail>({
    queryKey: ["course-progress", courseId],
    queryFn: () =>
      ProgressService.getCourseProgress(courseId!) as Promise<CourseProgressDetail>,
    enabled: !!courseId,
  });

  const { data: existingReview } = useQuery<ReviewResponse | null>({
    queryKey: ["my-review", courseId],
    queryFn: () => ReviewService.getMyReview(courseId!),
    enabled: !!courseId && !!course?.isEnrolled,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────

  const { mutate: saveProgress } = useMutation({
    mutationFn: ({
      lessonId,
      watchedSeconds,
      totalSeconds,
    }: {
      lessonId: string;
      watchedSeconds: number;
      totalSeconds: number;
    }) =>
      ProgressService.updateLessonProgress(lessonId, { watchedSeconds, totalSeconds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-progress", courseId] });
    },
  });

  const { mutate: markLessonComplete } = useMutation({
    mutationFn: (lessonId: string) => ProgressService.completeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-progress", courseId] });
    },
  });

  // ── Derived state ─────────────────────────────────────────────────────────────

  // FIX: build completed set from real DTO structure instead of (progress as any)?.completedLessons
  const completedLessonIds = buildCompletedSet(progress);
  const overallProgress = progress?.overallProgress ?? 0;

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    const sectionsArray = getSectionsAsArray(course?.sections);
    if (course && !selectedLesson && sectionsArray.length > 0) {
      const firstSection = sectionsArray[0];
      const firstLesson = firstSection?.lessons[0];
      if (firstLesson) {
        setSelectedLesson(firstLesson);
        const videoMaterial = firstLesson.materials?.find(
          (m: CourseMaterial) => m.type === "VIDEO"
        );
        if (videoMaterial) setSelectedMaterial(videoMaterial);
        setExpandedSections(new Set([firstSection.id]));
      }
    }
  }, [course, selectedLesson]);

  useEffect(() => {
    if (selectedLesson && course) {
      const sectionsArray = getSectionsAsArray(course.sections);
      const section = sectionsArray.find((s: CourseSection) =>
        s.lessons.some((l: CourseLesson) => l.id === selectedLesson.id)
      );
      if (section) {
        setExpandedSections((prev) => new Set([...prev, section.id]));
      }
    }
  }, [selectedLesson, course]);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  };

  const selectLesson = (lesson: CourseLesson) => {
    setSelectedLesson(lesson);
    setQuizSectionId(null);
    const videoMaterial = lesson.materials?.find(
      (m: CourseMaterial) => m.type === "VIDEO"
    );
    setSelectedMaterial(videoMaterial ?? null);
  };

  const openQuiz = (sectionId: string) => {
    setSelectedLesson(null);
    setSelectedMaterial(null);
    setQuizSectionId(sectionId);
  };

  const handleVideoProgress = (vp: VideoProgress) => {
    if (selectedLesson) {
      saveProgress({
        lessonId: selectedLesson.id,
        watchedSeconds: Math.floor(vp.currentTime),
        totalSeconds: Math.floor(vp.duration),
      });
    }
  };

  const handleVideoComplete = () => {
    if (selectedLesson) markLessonComplete(selectedLesson.id);
  };

  const handleReviewSubmit = async () => {
    if (!courseId || !rating || comment.trim().length < 10) return;
    setSubmittingReview(true);
    try {
      await ReviewService.create({ courseId, rating, comment: comment.trim() });
      setReviewSuccess(true);
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["my-review", courseId] });
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Guards (deduplicated) ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1623] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1623] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-400 mb-4">Course not found or access denied</p>
          <Link to="/student/courses">
            <button className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">
              Back to My Courses
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!course.isEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1623] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Enrollment Required
          </h2>
          <p className="text-gray-400 mb-6">
            You need to enroll in this course to access the content.
          </p>
          <Link to={`/student/courses/${course.id}`}>
            <button className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">
              View Course Details
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1623]">
      {/* Header */}
      <header className="bg-white dark:bg-[#0f1623] border-b border-gray-200 dark:border-white/[0.07] sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/student/courses"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {course.title}
              </h1>
              {selectedLesson && (
                <p className="text-sm text-gray-400">{selectedLesson.title}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* FIX: show real overall progress from API */}
            {progress && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-32 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(overallProgress)}%
                </span>
              </div>
            )}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <List className="w-5 h-5" />
            </button>
            <Link
              to="/student/courses"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 bg-white dark:bg-[#0f1623] border-r border-gray-200 dark:border-white/[0.07] h-[calc(100vh-60px)] overflow-y-auto flex-shrink-0"
            >
              <div className="p-4">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  Course Content
                </h2>
                <div className="space-y-2">
                  {getSectionsAsArray(course.sections).map(
                    (section: CourseSection) => (
                      <div
                        key={section.id}
                        className="border border-gray-200 dark:border-white/[0.07] rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {section.title}
                          </span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 text-gray-400 transition-transform",
                              expandedSections.has(section.id) ? "rotate-180" : ""
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedSections.has(section.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              {section.lessons.map((lesson: CourseLesson) => {
                                const isCompleted = completedLessonIds.has(lesson.id);
                                const isCurrent = selectedLesson?.id === lesson.id;
                                return (
                                  <LessonItem
                                    key={lesson.id}
                                    lesson={lesson}
                                    isCompleted={isCompleted}
                                    isCurrent={isCurrent}
                                    onClick={() => selectLesson(lesson)}
                                  />
                                );
                              })}
                              {/* Quiz entry for this section */}
                              <button
                                onClick={() => openQuiz(section.id)}
                                className={cn(
                                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                                  quizSectionId === section.id
                                    ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40"
                                    : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                                )}
                              >
                                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0">
                                  <HelpCircle className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Section Quiz</p>
                                  <p className="text-xs text-gray-400">Test your knowledge</p>
                                </div>
                                {quizSectionId === section.id && (
                                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />
                                )}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* FIX: main + review both inside the flex row, stacked in a column inside main */}
        <div className="flex-1 min-w-0 p-4 space-y-6">
          {/* Video / placeholder */}
          {selectedMaterial && selectedMaterial.type === "VIDEO" ? (
            <div className="space-y-4">
              <VideoPlayer
                material={selectedMaterial}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
              />

              {selectedLesson && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#0f1623] rounded-xl p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {selectedLesson.title}
                  </h2>
                  {selectedLesson.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {selectedLesson.description}
                    </p>
                  )}
                  {selectedLesson.materials && selectedLesson.materials.length > 1 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Additional Materials
                      </h3>
                      <div className="space-y-2">
                        {selectedLesson.materials
                          .filter((m) => m.type !== "VIDEO")
                          .map((material) => (
                            <a
                              key={material.id}
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-white/[0.07] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                                {material.type === "PDF" ? (
                                  <FileText className="w-4 h-4 text-gray-500" />
                                ) : material.type === "LINK" ? (
                                  <Eye className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <Download className="w-4 h-4 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {material.title}
                                </p>
                                {material.fileName && (
                                  <p className="text-xs text-gray-400">{material.fileName}</p>
                                )}
                              </div>
                              {material.size && (
                                <span className="text-xs text-gray-400">
                                  {formatFileSize(material.size)}
                                </span>
                              )}
                            </a>
                          ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ) : quizSectionId ? (
            <QuizPanel sectionId={quizSectionId} />
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-400">Select a lesson to start learning</p>
              </div>
            </div>
          )}

          {/* Review — FIX: moved inside the main content column */}
          {course.isEnrolled && !existingReview && (
            <div className="bg-white dark:bg-[#0f1623] rounded-2xl border border-gray-200 dark:border-white/[0.07] p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Leave a Review
              </h3>
              {reviewSuccess ? (
                <div className="py-8 flex flex-col items-center gap-3 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    Review submitted!
                  </p>
                  <p className="text-sm text-gray-400">Thank you for your feedback.</p>
                  <button
                    onClick={() => setReviewSuccess(false)}
                    className="mt-2 text-xs font-bold text-blue-500 hover:underline"
                  >
                    Leave another review
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHovered(star)}
                          onMouseLeave={() => setHovered(0)}
                          className="w-10 h-10 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 active:scale-95 hover:scale-105 flex items-center justify-center transition-all duration-200"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= (hovered || rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200 dark:text-gray-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">
                      Your Review
                    </label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this course (minimum 10 characters)..."
                      className="w-full rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    {comment.length > 0 && comment.length < 10 && (
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        Review must be at least 10 characters long ({comment.length}/10)
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleReviewSubmit}
                    disabled={submittingReview || !rating || comment.trim().length < 10}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {existingReview && (
            <div className="bg-white dark:bg-[#0f1623] rounded-2xl border border-gray-200 dark:border-white/[0.07] p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Your Review
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (existingReview?.rating ?? 0)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200 dark:text-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {existingReview.rating}/5
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{existingReview.comment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}