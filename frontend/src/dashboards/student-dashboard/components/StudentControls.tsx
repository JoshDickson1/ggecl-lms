// src/dashboards/student-dashboard/components/live/StudentControls.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff,
  Hand, PhoneOff, MessageSquare, Users, MoreHorizontal,
} from "lucide-react";

interface StudentControlsProps {
  audio: boolean; video: boolean; screen: boolean; hand: boolean;
  onToggleAudio: () => void; onToggleVideo: () => void;
  onToggleScreen: () => void; onToggleHand: () => void;
  onLeave: () => void;
  onOpenChat: () => void; onOpenParticipants: () => void;
  chatUnread?: number;
}

function ControlBtn({
  onClick, active, danger, off, children, label, badge,
}: {
  onClick: () => void; active?: boolean; danger?: boolean; off?: boolean;
  children: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <div className="relative flex flex-col items-center gap-1.5">
      <button onClick={onClick}
        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
          danger
            ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40"
            : off
            ? "bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25"
            : active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
            : "bg-white/[0.07] border border-white/[0.1] text-white/70 hover:bg-white/[0.12] hover:text-white"
        }`}>
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
      <span className="text-[10px] text-white/30 font-semibold">{label}</span>
    </div>
  );
}

export function StudentControls({
  audio, video, screen, hand,
  onToggleAudio, onToggleVideo, onToggleScreen, onToggleHand,
  onLeave, onOpenChat, onOpenParticipants, chatUnread = 0,
}: StudentControlsProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-[#0a1120]/95 backdrop-blur-xl border-t border-white/[0.06] flex-shrink-0">
      {/* Main controls */}
      <ControlBtn onClick={onToggleAudio} off={!audio} label={audio ? "Mute" : "Unmute"}>
        {audio ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </ControlBtn>

      <ControlBtn onClick={onToggleVideo} off={!video} label={video ? "Stop Video" : "Start Video"}>
        {video ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </ControlBtn>

      <ControlBtn onClick={onToggleScreen} active={screen} label={screen ? "Stop Share" : "Share Screen"}>
        {screen ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
      </ControlBtn>

      {/* Divider */}
      <div className="w-px h-8 bg-white/[0.08] mx-1" />

      <ControlBtn onClick={onToggleHand} active={hand} label={hand ? "Lower Hand" : "Raise Hand"}>
        <Hand className="w-5 h-5" />
      </ControlBtn>

      <ControlBtn onClick={onOpenChat} label="Chat" badge={chatUnread}>
        <MessageSquare className="w-5 h-5" />
      </ControlBtn>

      <ControlBtn onClick={onOpenParticipants} label="People">
        <Users className="w-5 h-5" />
      </ControlBtn>

      <ControlBtn onClick={() => setShowMore(p => !p)} active={showMore} label="More">
        <MoreHorizontal className="w-5 h-5" />
      </ControlBtn>

      {/* Divider */}
      <div className="w-px h-8 bg-white/[0.08] mx-1" />

      <ControlBtn onClick={onLeave} danger label="Leave">
        <PhoneOff className="w-5 h-5" />
      </ControlBtn>

      {/* More menu */}
      <AnimatePresence>
        {showMore && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#0d1829] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl min-w-[180px] z-20">
            {[
              { label: "Virtual Background", icon: "🎭" },
              { label: "Noise Cancellation", icon: "🔇" },
              { label: "View Recordings", icon: "🎬" },
              { label: "Report Issue", icon: "⚠️" },
            ].map(item => (
              <button key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors text-left">
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}