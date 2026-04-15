// src/dashboards/student-dashboard/pages/StudentRecordingView.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft, Play, Pause, Volume2, VolumeX,
  Maximize, Clock, Eye, BookOpen, Film,
  Download, Share2, Radio,
} from "lucide-react";
import { MOCK_RECORDINGS } from "@/data/liveTypes";

function formatDuration(mins: number) {
  return Math.floor(mins / 60) > 0
    ? `${Math.floor(mins / 60)}h ${mins % 60}m`
    : `${mins}m`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default function StudentRecordingView() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();

  const rec = MOCK_RECORDINGS.find(r => r.id === id);

  const [playing, setPlaying] = useState(false);
  const [muted,   setMuted]   = useState(false);

  // 404-style empty state
  if (!rec) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
          <Film className="w-8 h-8 text-gray-300 dark:text-white/20" />
        </div>
        <p className="text-sm font-bold text-gray-500 dark:text-white/30">Recording not found.</p>
        <button onClick={() => navigate("/student/live")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
          <ChevronLeft className="w-4 h-4" />Back to Live
        </button>
      </div>
    );
  }

  // Other recordings (exclude current)
  const related = MOCK_RECORDINGS.filter(r => r.id !== rec.id);

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">

      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/student/live")}
        className="flex items-center gap-2 mb-6 text-sm font-bold text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4" />Back to Live Classes
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── Left: player + info ── */}
        <div className="space-y-5">

          {/* Video player */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden bg-gray-900 dark:bg-[#0d1829] border border-gray-700 dark:border-white/[0.07] shadow-2xl">

            {/* Thumbnail / player area */}
            <div className={`relative aspect-video bg-gradient-to-br ${rec.thumbnailGradient} flex items-center justify-center cursor-pointer group`}
              onClick={() => setPlaying(p => !p)}>

              {/* Background icon */}
              <span className="text-8xl opacity-10 select-none">{rec.courseIcon}</span>

              {/* Play/pause overlay */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                  {playing
                    ? <Pause className="w-8 h-8 text-white fill-white" />
                    : <Play  className="w-8 h-8 text-white fill-white ml-1" />
                  }
                </motion.div>
              </div>

              {/* Top: course badge */}
              <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${rec.courseColor} shadow-lg`}>
                <span className="text-xs font-black text-white">{rec.courseIcon} {rec.courseName}</span>
              </div>

              {/* Top right: duration */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm border border-white/[0.1]">
                <span className="text-xs font-bold text-white font-mono">{formatDuration(rec.durationMinutes)}</span>
              </div>

              {/* Playing indicator */}
              {playing && (
                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-600/90 backdrop-blur-sm">
                  <Radio className="w-3 h-3 text-white" />
                  <span className="text-xs font-black text-white">Playing</span>
                </motion.div>
              )}
            </div>

            {/* Controls bar */}
            <div className="flex items-center gap-3 px-5 py-3 bg-gray-950/80 backdrop-blur-sm">
              <button onClick={() => setPlaying(p => !p)}
                className="text-white/60 hover:text-white transition-colors">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={() => setMuted(p => !p)}
                className="text-white/60 hover:text-white transition-colors">
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Scrubber placeholder */}
              <div className="flex-1 h-1.5 bg-white/10 rounded-full mx-2 cursor-pointer group/scrub">
                <div className="h-full w-0 bg-blue-500 rounded-full group-hover/scrub:bg-blue-400 transition-colors" />
              </div>

              <span className="text-xs text-white/30 font-mono">0:00 / {formatDuration(rec.durationMinutes)}</span>

              <button className="text-white/40 hover:text-white transition-colors">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#0d1829] rounded-2xl border border-gray-100 dark:border-white/[0.07] p-6 space-y-4">

            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white leading-snug mb-2">
                {rec.sessionTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-white/30">
                <span className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white text-[9px] font-black`}>
                    {rec.instructorName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  {rec.instructorName}
                </span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(rec.durationMinutes)}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{rec.viewCount} views</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{formatDate(rec.recordedAt)}</span>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-white/60 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.09] transition-all">
                <Download className="w-4 h-4" />Download
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-white/60 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.09] transition-all">
                <Share2 className="w-4 h-4" />Share
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── Right: related recordings ── */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="space-y-3 lg:sticky lg:top-6">
          <p className="text-xs font-black text-gray-400 dark:text-white/25 uppercase tracking-widest px-1">Other Recordings</p>

          {related.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-gray-300 dark:text-white/20">
              <Film className="w-8 h-8 opacity-30" />
              <p className="text-xs">No other recordings.</p>
            </div>
          ) : (
            related.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
                onClick={() => navigate(`/student/live/recordings/${r.id}`)}
                className="flex gap-3 p-3 rounded-2xl border border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0d1829] hover:border-gray-200 dark:hover:border-white/[0.14] transition-all cursor-pointer group">

                {/* Thumbnail */}
                <div className={`relative w-24 h-16 rounded-xl bg-gradient-to-br ${r.thumbnailGradient} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                  <span className="text-2xl opacity-20">{r.courseIcon}</span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60">
                    <span className="text-[9px] font-bold text-white font-mono">{formatDuration(r.durationMinutes)}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1">{r.sessionTitle}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/30">{r.instructorName}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-300 dark:text-white/20">
                    <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{r.viewCount}</span>
                    <span>·</span>
                    <span>{new Date(r.recordedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}