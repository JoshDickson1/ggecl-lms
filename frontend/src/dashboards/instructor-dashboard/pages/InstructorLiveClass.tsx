// src/dashboards/instructor-dashboard/pages/InstructorLiveClass.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, AlertCircle, Loader2, PhoneOff, Crown,
  Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff,
  Users, MessageSquare, X,
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
  Chat,
} from "@livekit/components-react";
import {
  Track,
  ConnectionState,
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

// ─── Per-participant tile (attendee strip) ────────────────────────────────────

function ParticipantTile({ participant }: { participant: Participant }) {
  const tracks = useParticipantTracks([Track.Source.Camera], participant.identity);
  const videoTrack = tracks[0];
  const initials = (participant.name ?? participant.identity)
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const isMuted = !participant.isMicrophoneEnabled;

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
      </div>
      <p className="text-[9px] font-bold text-white/50 truncate px-1.5 py-1 text-center">
        {(participant.name ?? participant.identity).split(" ")[0]}
      </p>
    </div>
  );
}

// ─── Attendees strip ──────────────────────────────────────────────────────────

function AttendeesStrip() {
  const participants = useParticipants();
  const remotes = participants.filter(p => !p.isLocal);

  return (
    <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#08111f] px-4 py-2 min-h-[64px]">
      <div className="flex items-center gap-3 h-full">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest flex-shrink-0 whitespace-nowrap">
          {remotes.length === 0 ? "No attendees yet" : `Attendees · ${remotes.length}`}
        </span>
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
  const videoTrack = tracks[0];

  return (
    <div className="relative w-36 aspect-video rounded-xl overflow-hidden bg-[#0d1829] border border-white/[0.12] shadow-2xl">
      {isCameraEnabled && videoTrack ? (
        <VideoTrack trackRef={videoTrack} className="w-full h-full object-cover scale-x-[-1]" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-[#060d18]">
          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-black">
            {initials}
          </div>
        </div>
      )}
      {/* Status icons */}
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
  const videoTrack = tracks[0];
  const initials = (participant.name ?? participant.identity)
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

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
    </div>
  );
}

// ─── Main stage ───────────────────────────────────────────────────────────────

function MainStage({ localInitials }: { localInitials: string }) {
  const participants = useParticipants();
  const screenTracks = useTracks([Track.Source.ScreenShare]);
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
            trackRef={screenTracks[0]}
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
  const [chatOpen, setChatOpen] = useState(false);

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
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-l border-white/[0.07] bg-[#0a1120] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-xs font-black text-white/60 uppercase tracking-wider">Chat</span>
              <button onClick={() => setChatOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Chat className="h-full" />
            </div>
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
