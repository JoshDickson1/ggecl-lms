// src/shared/live/Participants.tsx
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, Hand, Pin, Crown } from "lucide-react";
import type { LiveParticipant } from "@/data/liveTypes";

function ParticipantTile({
  p, onPin, canPin,
}: {
  p: LiveParticipant; onPin?: (id: string) => void; canPin?: boolean;
}) {
  const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className={`relative group rounded-2xl overflow-hidden bg-[#0d1829] border transition-all ${
        p.isSpeaking ? "border-blue-500/60 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]" : "border-white/[0.07]"
      } ${p.isPinned ? "col-span-2 row-span-2" : ""}`}
    >
      {/* Video placeholder / avatar */}
      <div className="aspect-video flex items-center justify-center relative">
        {p.media.video ? (
          <div className={`absolute inset-0 bg-gradient-to-br ${p.avatarBg.replace("bg-", "from-").replace("-600", "-900")} to-[#060d18] flex items-center justify-center`}>
            <div className={`w-16 h-16 rounded-full ${p.avatarBg} flex items-center justify-center text-white text-xl font-black`}>
              {initials}
            </div>
            <span className="absolute bottom-2 left-3 text-[10px] text-white/30 font-bold">CAM ON</span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#0a1120] flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full ${p.avatarBg} flex items-center justify-center text-white text-lg font-black`}>
              {initials}
            </div>
          </div>
        )}

        {/* Speaking ring */}
        {p.isSpeaking && (
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl border-2 border-blue-500/50 pointer-events-none" />
        )}

        {/* Role badge */}
        {p.role !== "student" && (
          <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
            p.role === "instructor" ? "bg-violet-600/90 text-white" : "bg-amber-500/90 text-white"
          }`}>
            <Crown className="w-2.5 h-2.5" />
            {p.role === "instructor" ? "Host" : "Admin"}
          </div>
        )}

        {/* Hand raised */}
        {p.media.hand && (
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
            <Hand className="w-3.5 h-3.5 text-white" />
          </motion.div>
        )}

        {/* Pin button — hover only */}
        {canPin && (
          <button onClick={() => onPin?.(p.id)}
            className={`absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${
              p.isPinned ? "bg-blue-600 text-white" : "bg-black/50 text-white/60 hover:text-white"
            }`}>
            <Pin className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a1120]/80 backdrop-blur-sm">
        <span className="text-xs font-bold text-white/80 truncate">{p.name}</span>
        <div className="flex items-center gap-1.5">
          {p.media.audio
            ? <Mic className="w-3 h-3 text-white/40" />
            : <MicOff className="w-3 h-3 text-red-400" />
          }
          {p.media.video
            ? <Video className="w-3 h-3 text-white/40" />
            : <VideoOff className="w-3 h-3 text-red-400" />
          }
        </div>
      </div>
    </motion.div>
  );
}

export function ParticipantsGrid({
  participants, canPin = false, onPin,
}: {
  participants: LiveParticipant[]; canPin?: boolean; onPin?: (id: string) => void;
}) {
  const pinned = participants.find(p => p.isPinned);
  const rest   = participants.filter(p => !p.isPinned);

  if (pinned) {
    return (
      <div className="flex-1 flex flex-col gap-3 p-3 overflow-hidden">
        {/* Pinned — big */}
        <div className="flex-1 min-h-0">
          <ParticipantTile p={pinned} canPin={canPin} onPin={onPin} />
        </div>
        {/* Strip */}
        <div className="flex gap-3 h-28 flex-shrink-0 overflow-x-auto">
          {rest.map(p => (
            <div key={p.id} className="w-44 flex-shrink-0 h-full">
              <ParticipantTile p={p} canPin={canPin} onPin={onPin} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 p-3 grid gap-3 overflow-hidden content-start ${
      participants.length === 1 ? "grid-cols-1" :
      participants.length === 2 ? "grid-cols-2" :
      participants.length <= 4 ? "grid-cols-2" :
      "grid-cols-3"
    }`}>
      <AnimatePresence>
        {participants.map(p => (
          <ParticipantTile key={p.id} p={p} canPin={canPin} onPin={onPin} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar participant list (for panel) ─────────────────────────────────────

export function ParticipantList({ participants }: { participants: LiveParticipant[] }) {
  const instructors = participants.filter(p => p.role !== "student");
  const students    = participants.filter(p => p.role === "student");

  const Row = ({ p }: { p: LiveParticipant }) => {
    const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors rounded-xl">
        <div className="relative flex-shrink-0">
          <div className={`w-8 h-8 rounded-full ${p.avatarBg} flex items-center justify-center text-white text-xs font-black`}>
            {initials}
          </div>
          {p.isSpeaking && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#0f1623]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white/80 truncate">{p.name}</p>
          <p className="text-[10px] text-white/25 capitalize">{p.role}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {p.media.hand && <Hand className="w-3.5 h-3.5 text-amber-400" />}
          {!p.media.audio && <MicOff className="w-3 h-3 text-red-400/70" />}
          {!p.media.video && <VideoOff className="w-3 h-3 text-red-400/70" />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {instructors.length > 0 && (
        <div className="mb-2">
          <p className="px-4 py-1.5 text-[10px] font-black text-white/25 uppercase tracking-widest">Host</p>
          {instructors.map(p => <Row key={p.id} p={p} />)}
        </div>
      )}
      <div>
        <p className="px-4 py-1.5 text-[10px] font-black text-white/25 uppercase tracking-widest">
          Students ({students.length})
        </p>
        {students.map(p => <Row key={p.id} p={p} />)}
      </div>
    </div>
  );
}
