// src/dashboards/student-dashboard/pages/StudentRecordings.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Clock, Eye, Search, Film } from "lucide-react";
import { MOCK_RECORDINGS, type Recording } from "@/data/liveTypes";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function RecordingCard({ rec, index, onNavigate }: { rec: Recording; index: number; onNavigate: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={onNavigate}
      className="group rounded-2xl overflow-hidden bg-white dark:bg-[#0d1829] border border-black/[0.07] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] transition-all cursor-pointer">
      <div className={`relative aspect-video bg-gradient-to-br ${rec.thumbnailGradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <span className="text-6xl">{rec.courseIcon}</span>
        </div>
        <motion.div animate={{ scale: hovered ? 1 : 0.9, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-14 h-14 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </motion.div>
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm">
          <span className="text-xs font-bold text-white font-mono">
            {Math.floor(rec.durationMinutes / 60) > 0
              ? `${Math.floor(rec.durationMinutes / 60)}h ${rec.durationMinutes % 60}m`
              : `${rec.durationMinutes}m`}
          </span>
        </div>
        <div className={`absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r ${rec.courseColor} shadow-lg`}>
          <span className="text-xs font-black text-white">{rec.courseIcon} {rec.courseName}</span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm font-black text-gray-900 dark:text-white mb-1 line-clamp-2 leading-snug">{rec.sessionTitle}</p>
        <p className="text-xs text-gray-400 dark:text-white/30 mb-3">{rec.instructorName}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-white/25">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(rec.recordedAt)}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{rec.viewCount} views</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function StudentRecordings() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = MOCK_RECORDINGS.filter(r =>
    !query || r.sessionTitle.toLowerCase().includes(query.toLowerCase()) ||
    r.courseName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-md">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Recordings</h1>
            <p className="text-xs text-gray-400 dark:text-white/30">{MOCK_RECORDINGS.length} sessions recorded</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] focus-within:border-blue-400 dark:focus-within:border-blue-500/50 transition-colors w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 dark:text-white/25 flex-shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search recordings…"
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-white/70 placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none" />
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-gray-300 dark:text-white/20">
          <Film className="w-10 h-10 opacity-30" />
          <p className="text-sm">No recordings match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((rec, i) => (
            <RecordingCard
              key={rec.id}
              rec={rec}
              index={i}
              onNavigate={() => navigate(`/student/live/recordings/${rec.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}