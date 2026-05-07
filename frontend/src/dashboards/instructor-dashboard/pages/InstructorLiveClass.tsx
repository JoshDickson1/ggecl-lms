// src/dashboards/instructor-dashboard/pages/InstructorLiveClass.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, AlertCircle, Loader2, PhoneOff, Crown,
  Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff,
  Users, MessageSquare, X, Hand, Send,
} from "lucide-react";
import {
  LiveKitRoom,
  useParticipants,
  useLocalParticipant,
  useTracks,
  useParticipantTracks,
  VideoTrack,
  useConnectionState,
  RoomAudioRenderer,
  useChat,
  useRoomContext,
  isTrackReference,
  type TrackReference,
  type ReceivedChatMessage,
} from "@livekit/components-react";
import {
  Track,
  ConnectionState,
  RoomEvent,
  type Participant,
} from "livekit-client";
import LiveService, { type JoinSessionResponse } from "@/services/live.service";
import SchedulingService, { type LiveSession } from "@/services/scheduling.service";

// ─── Elapsed timer ────────────────────────────────────────────────────────────

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
  return (
    <span className="font-mono text-xs font-bold text-white/60">
      {h > 0 ? `${h}:` : ""}{m}:{s}
    </span>
  );
}

// ─── Helper: parse hand-raise from raw metadata string ───────────────────────

function parseHandRaised(metadata: string | undefined | null): boolean {
  try {
    if (!metadata) return false;
    return JSON.parse(metadata)?.handRaised === true;
  } catch {
    return false;
  }
}

// ─── Hook: reactively track metadata changes for all participants ─────────────

function useParticipantsWithMeta() {
  const room = useRoomContext();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const bump = () => forceUpdate(n => n + 1);
    room.on(RoomEvent.ParticipantMetadataChanged, bump);
    room.on(RoomEvent.ParticipantConnected, bump);
    room.on(RoomEvent.ParticipantDisconnected, bump);
    return () => {
      room.off(RoomEvent.ParticipantMetadataChanged, bump);
      room.off(RoomEvent.ParticipantConnected, bump);
      room.off(RoomEvent.ParticipantDisconnected, bump);
    };
  }, [room]);

  return Array.from(room.remoteParticipants.values());
}

// ─── Per-participant tile (attendee strip) ────────────────────────────────────

function ParticipantTile({ participant }: { participant: Participant }) {
  const tracks = useParticipantTracks([Track.Source.Camera], participant.identity);
  const videoTrack = tracks.find(isTrackReference);
  const initials = (participant.name ?? participant.identity)
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const isMuted = !participant.isMicrophoneEnabled;
  const handUp = parseHandRaised(participant.metadata);

  return (
    <div className="relative flex-shrink-0 w-[88px] rounded-xl overflow-hidden bg-[#0d1829] border border-white/[0.07]">
      <div className="aspect-video relative flex items-center justify-center bg-gradient-to-br from-[#0a1525] to-[#060d18]">
        {videoTrack ? (
          <VideoTrack trackRef={videoTrack} className="w-full h-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-violet-700 flex items-center justify-center text-white text-[10px] font-black">
            {initials}
          </div>
        )}
        {isMuted && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500/80 flex items-center justify-center">
            <MicOff className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {handUp && (
          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-amber-400/90 flex items-center justify-center">
            <Hand className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <p className="text-[9px] font-bold text-white/50 truncate px-1.5 py-1 text-center">
        {(participant.name ?? participant.identity).split(" ")[0]}
      </p>
    </div>
  );
}

// ─── Attendees strip ──────────────────────────────────────────────────────────

function AttendeesStrip() {
  const remotes = useParticipantsWithMeta();
  const handsUp = remotes.filter(p => parseHandRaised(p.metadata)).length;

  return (
    <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#08111f] px-4 py-2 min-h-[64px]">
      <div className="flex items-center gap-3 h-full">
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest whitespace-nowrap">
            {remotes.length === 0 ? "No attendees yet" : `Attendees · ${remotes.length}`}
          </span>
          {handsUp > 0 && (
            <span className="text-[9px] font-black text-amber-400 flex items-center gap-1">
              <Hand className="w-2.5 h-2.5" />
              {handsUp} hand{handsUp > 1 ? "s" : ""} raised
            </span>
          )}
        </div>
        {remotes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {remotes.map(p => (
              <ParticipantTile key={p.identity} participant={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Local self-view PiP ──────────────────────────────────────────────────────

function LocalVideoTile({ initials }: { initials: string }) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
  const tracks = useParticipantTracks([Track.Source.Camera], localParticipant.identity);
  const videoTrack = tracks.find(isTrackReference);

  return (
    <div className="relative w-36 aspect-video rounded-xl overflow-hidden bg-[#0d1829] border border-white/[0.12] shadow-2xl">
      {videoTrack ? (
        // Show the track whenever it exists — don't gate on isCameraEnabled
        // (the flag lags behind the actual track publication)
        <VideoTrack trackRef={videoTrack} className="w-full h-full object-cover scale-x-[-1]" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-[#060d18]">
          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-black">
            {initials}
          </div>
        </div>
      )}
      <div className="absolute bottom-1 left-1 flex gap-1">
        {!isMicrophoneEnabled && (
          <div className="w-4 h-4 rounded-full bg-red-500/80 flex items-center justify-center">
            <MicOff className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {!isCameraEnabled && (
          <div className="w-4 h-4 rounded-full bg-gray-700/80 flex items-center justify-center">
            <VideoOff className="w-2.5 h-2.5 text-white/60" />
          </div>
        )}
      </div>
      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-[8px] font-bold text-white/60">
        You
      </div>
    </div>
  );
}

// ─── Remote participant grid tile ─────────────────────────────────────────────

function RemoteGridTile({ participant }: { participant: Participant }) {
  const tracks = useParticipantTracks([Track.Source.Camera], participant.identity);
  // Filter to real published tracks only (not placeholders)
  const videoTrack = tracks.find(isTrackReference);
  const initials = (participant.name ?? participant.identity)
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const handUp = parseHandRaised(participant.metadata);

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0d1829] border border-white/[0.07] flex items-center justify-center min-h-[120px]">
      {videoTrack ? (
        <VideoTrack trackRef={videoTrack} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-violet-700 flex items-center justify-center text-white text-lg font-black">
            {initials}
          </div>
          <span className="text-xs text-white/50 font-semibold">{participant.name ?? participant.identity}</span>
        </div>
      )}
      {!participant.isMicrophoneEnabled && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center">
          <MicOff className="w-3 h-3 text-white" />
        </div>
      )}
      {handUp && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-400/90">
          <Hand className="w-3 h-3 text-white" />
          <span className="text-[9px] font-black text-white">Hand</span>
        </div>
      )}
    </div>
  );
}

// ─── Main stage ───────────────────────────────────────────────────────────────

function MainStage({ localInitials }: { localInitials: string }) {
  const participants = useParticipants();
  // Only grab screen-share tracks from all participants
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  const remotes = participants.filter(p => !p.isLocal);

  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-900 via-[#0a1525] to-gray-950">
      {/* Dot grid texture */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "24px 24px" }} />

      {/* Screen share takes priority */}
      {screenTracks.length > 0 ? (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <VideoTrack
            trackRef={screenTracks[0] as TrackReference}
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
        </div>
      ) : remotes.length > 0 ? (
        // Remote participant grid
        <div className="absolute inset-0 p-4">
          <div className={`grid gap-3 h-full ${
            remotes.length === 1 ? "grid-cols-1" :
            remotes.length <= 4 ? "grid-cols-2" : "grid-cols-3"
          }`}>
            {remotes.slice(0, 9).map(p => (
              <RemoteGridTile key={p.identity} participant={p} />
            ))}
          </div>
        </div>
      ) : (
        // Waiting state
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20"
          >
            <Radio className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold text-violet-300">Waiting for students to join…</span>
          </motion.div>
        </div>
      )}

      {/* Self-view PiP — small, bottom-right */}
      <div className="absolute bottom-4 right-4 z-10">
        <LocalVideoTile initials={localInitials} />
      </div>
    </div>
  );
}

// ─── Custom chat panel ────────────────────────────────────────────────────────

function ChatBubble({ msg, isOwn }: { msg: ReceivedChatMessage; isOwn: boolean }) {
  const name = msg.from?.name ?? msg.from?.identity ?? "Unknown";
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
      {!isOwn && (
        <span className="text-[10px] font-bold text-white/40 px-1">{name}</span>
      )}
      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
        isOwn
          ? "bg-violet-600 text-white rounded-br-sm"
          : "bg-white/[0.1] text-white/90 rounded-bl-sm border border-white/[0.08]"
      }`}>
        {msg.message}
      </div>
      <span className="text-[9px] text-white/25 px-1">{time}</span>
    </div>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { chatMessages, send, isSending } = useChat();
  const { localParticipant } = useLocalParticipant();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    await send(text);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1829]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#0a1525]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-black text-white">Chat</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <MessageSquare className="w-8 h-8 text-white/10" />
            <p className="text-xs text-white/25 font-semibold">No messages yet</p>
            <p className="text-[10px] text-white/15">Be the first to say something</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <ChatBubble
              key={`${msg.timestamp}-${msg.from?.identity}`}
              msg={msg}
              isOwn={msg.from?.identity === localParticipant.identity}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-3 border-t border-white/[0.08] bg-[#0a1525]">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 resize-none bg-white/[0.07] border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.09] transition-all max-h-24 overflow-y-auto"
            style={{ lineHeight: "1.4" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <p className="text-[9px] text-white/20 mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

// ─── Controls bar ─────────────────────────────────────────────────────────────

function ControlBtn({
  onClick, off, danger, active, label, children, badge,
}: {
  onClick: () => void; off?: boolean; danger?: boolean; active?: boolean;
  label: string; children: React.ReactNode; badge?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
          danger
            ? "bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-900/30"
            : off
            ? "bg-red-500/10 border border-red-400/30 text-red-400 hover:bg-red-500/20"
            : active
            ? "bg-violet-600 text-white shadow-sm shadow-violet-900/20"
            : "bg-white/[0.07] border border-white/[0.1] text-white/70 hover:bg-white/[0.12] hover:text-white"
        }`}
      >
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-white text-[8px] font-black flex items-center justify-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
      <span className="text-[9px] text-white/30 font-semibold">{label}</span>
    </div>
  );
}

function ControlsBar({
  sessionId, onEnded, onToggleChat, chatOpen,
}: {
  sessionId: string; onEnded: () => void; onToggleChat: () => void; chatOpen: boolean;
}) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const [screenSharing, setScreenSharing] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);

  async function toggleMic() {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }
  async function toggleCamera() {
    await localParticipant.setCameraEnabled(!isCameraEnabled);
  }
  async function toggleScreen() {
    const next = !screenSharing;
    await localParticipant.setScreenShareEnabled(next);
    setScreenSharing(next);
  }
  async function handleEnd() {
    if (!confirmEnd) { setConfirmEnd(true); return; }
    setEnding(true);
    try { await LiveService.endSession(sessionId); } catch { /* room closes anyway */ }
    onEnded();
  }

  return (
    <div className="flex-shrink-0 flex items-center justify-center gap-3 px-4 py-3 bg-[#0a1120] border-t border-white/[0.06]">
      <ControlBtn onClick={toggleMic} off={!isMicrophoneEnabled} label={isMicrophoneEnabled ? "Mute" : "Unmute"}>
        {isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </ControlBtn>
      <ControlBtn onClick={toggleCamera} off={!isCameraEnabled} label={isCameraEnabled ? "Stop" : "Video"}>
        {isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
      </ControlBtn>
      <ControlBtn onClick={toggleScreen} active={screenSharing} label={screenSharing ? "Stop" : "Share"}>
        {screenSharing ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
      </ControlBtn>

      <div className="w-px h-6 bg-white/[0.08] mx-1" />

      <ControlBtn onClick={onToggleChat} active={chatOpen} label="Chat">
        <MessageSquare className="w-4 h-4" />
      </ControlBtn>

      <div className="w-px h-6 bg-white/[0.08] mx-1" />

      <ControlBtn onClick={handleEnd} danger={confirmEnd} label={ending ? "Ending…" : confirmEnd ? "Confirm" : "End"}>
        {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />}
      </ControlBtn>
    </div>
  );
}

// ─── Room inner (needs LiveKit context) ──────────────────────────────────────

function RoomInner({
  session, localInitials, onEnded,
}: {
  session: LiveSession; localInitials: string; onEnded: () => void;
}) {
  const connectionState = useConnectionState();
  const participants = useParticipants();
  // Chat open by default so no messages are missed
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MainStage localInitials={localInitials} />
        <AttendeesStrip />
        <ControlsBar
          sessionId={session.id}
          onEnded={onEnded}
          onToggleChat={() => setChatOpen(p => !p)}
          chatOpen={chatOpen}
        />
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-l border-white/[0.08] overflow-hidden"
          >
            <ChatPanel onClose={() => setChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participant count badge */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/[0.08]">
        <Users className="w-3 h-3 text-white/40" />
        <span className="text-xs font-bold text-white/50">{participants.length}</span>
      </div>

      {/* Reconnecting overlay */}
      <AnimatePresence>
        {connectionState === ConnectionState.Reconnecting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-[#060d18]/70 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              <p className="text-sm font-bold text-white/60">Reconnecting…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Loading / Error screens ──────────────────────────────────────────────────

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 flex-1">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-violet-900/40">
        <Radio className="w-7 h-7 text-white" />
      </div>
      <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      <p className="text-sm text-white/50 font-semibold">{message}</p>
    </div>
  );
}

function ErrorScreen({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 flex-1 p-6">
      <div className="w-14 h-14 rounded-2xl bg-red-900/30 border border-red-500/30 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-black text-white">Failed to join session</p>
        <p className="text-xs text-white/40 max-w-xs">{message}</p>
      </div>
      <button onClick={onBack} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all">
        Back to Sessions
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorLiveClass() {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();

  const [tokenData, setTokenData] = useState<JoinSessionResponse | null>(null);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Will be replaced with real user name once we have it
  const localInitials = "ME";

  useEffect(() => {
    if (!sessionId) { setError("No session ID provided."); setLoading(false); return; }
    Promise.all([
      LiveService.joinSession(sessionId),
      SchedulingService.getSession(sessionId),
    ])
      .then(([token, sess]) => { setTokenData(token); setSession(sess); })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not join session."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleBack = () => navigate("/instructor/live");

  return (
    // z-50 covers the sidebar (z-0) and navbar (z-20) completely
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a1120]">

      {/* Header — 48px, always on top */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 h-12 bg-[#0a1120] border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0">
          <Radio className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-white truncate">{session?.title ?? "Live Session"}</p>
        </div>
        {session && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider">Live</span>
            </motion.div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/[0.07]">
              <Crown className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-300">Host</span>
            </div>
            <ElapsedTimer startedAt={session.scheduledAt} />
          </div>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <LoadingScreen message="Joining session…" />
      ) : error || !tokenData || !session ? (
        <ErrorScreen message={error || "Session not found."} onBack={handleBack} />
      ) : (
        <LiveKitRoom
          token={tokenData.token}
          serverUrl={tokenData.url}
          audio={true}
          video={true}
          onDisconnected={handleBack}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <RoomAudioRenderer />
          <RoomInner
            session={session}
            localInitials={localInitials}
            onEnded={handleBack}
          />
        </LiveKitRoom>
      )}
    </div>
  );
}
