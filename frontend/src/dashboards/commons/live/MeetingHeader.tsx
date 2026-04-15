// src/shared/live/MeetingHeader.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, Clock, Users, ChevronLeft } from "lucide-react";
import type { LiveSession } from "@/data/liveTypes";

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    setElapsed(Math.max(0, diff));
    const id = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, "0");
  const s = (elapsed % 60).toString().padStart(2, "0");
  return <span className="font-mono text-sm font-bold text-white">{h > 0 ? `${h}:` : ""}{m}:{s}</span>;
}

export function MeetingHeader({
  session, participantCount, onLeave, isInstructor = false,
}: {
  session: LiveSession; participantCount: number;
  onLeave: () => void; isInstructor?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-[#0a1120]/95 backdrop-blur-xl border-b border-white/[0.06] flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${session.courseColor} flex items-center justify-center text-lg flex-shrink-0`}>
          {session.courseIcon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-white truncate max-w-[280px]">{session.title}</p>
          <p className="text-xs text-white/40 truncate">{session.courseName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30">
          <Radio className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-black text-red-400 uppercase tracking-wider">Live</span>
        </motion.div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.07]">
          <Clock className="w-3.5 h-3.5 text-white/40" />
          <ElapsedTimer startedAt={session.scheduledAt} />
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.07]">
          <Users className="w-3.5 h-3.5 text-white/40" />
          <span className="text-sm font-bold text-white/70">{participantCount}</span>
        </div>
      </div>
      <button onClick={onLeave}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-900/30">
        <ChevronLeft className="w-3.5 h-3.5" />
        {isInstructor ? "End Session" : "Leave"}
      </button>
    </div>
  );
}