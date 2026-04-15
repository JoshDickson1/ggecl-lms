import { useEffect, useState } from "react";
import {
  Room,
  RoomEvent,
  // RemoteParticipant,
  // LocalParticipant,
  ConnectionState,
} from "livekit-client";
import { Loader2 } from "lucide-react";

export interface VideoRoomProps {
  token: string;
  serverUrl: string;
  onDisconnect?: () => void;
  children: (room: Room) => React.ReactNode;
}

export function VideoRoom({ token, serverUrl, onDisconnect, children }: VideoRoomProps) {
  const [room] = useState(() => new Room());
  const [state, setState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    room.on(RoomEvent.ConnectionStateChanged, setState);
    room.on(RoomEvent.Disconnected, () => onDisconnect?.());

    room
      .connect(serverUrl, token, {
        autoSubscribe: true,
      })
      .catch((err) => setError(err.message));

    return () => {
      room.disconnect();
    };
  }, [token, serverUrl]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        Failed to connect: {error}
      </div>
    );
  }

  if (state === ConnectionState.Connecting) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting...
      </div>
    );
  }

  return <>{children(room)}</>;
}