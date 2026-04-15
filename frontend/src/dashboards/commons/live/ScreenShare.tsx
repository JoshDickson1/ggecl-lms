import { Room } from "livekit-client";
import { useState } from "react";
import { Monitor, MonitorOff } from "lucide-react";

export interface ScreenShareProps {
  room: Room;
  canShare?: boolean;
}

export function ScreenShare({ room, canShare = false }: ScreenShareProps) {
  const [sharing, setSharing] = useState(false);

  const toggle = async () => {
    try {
      if (sharing) {
        await room.localParticipant.setScreenShareEnabled(false);
      } else {
        await room.localParticipant.setScreenShareEnabled(true);
      }
      setSharing((s) => !s);
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  if (!canShare) return null;

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        sharing
          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
          : "bg-gray-100 dark:bg-white/[0.07] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.12]"
      }`}
    >
      {sharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
      {sharing ? "Stop sharing" : "Share screen"}
    </button>
  );
}