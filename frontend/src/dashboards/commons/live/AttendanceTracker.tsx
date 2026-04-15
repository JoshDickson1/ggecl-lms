import { Room, RoomEvent, RemoteParticipant } from "livekit-client";
import { useEffect, useState } from "react";
import { Clock, UserCheck, UserMinus } from "lucide-react";

interface AttendanceEntry {
  id: string;
  name: string;
  joinedAt: Date;
  leftAt?: Date;
}

export interface AttendanceTrackerProps {
  room: Room;
  /** Only renders full UI if canViewReport is true (admin/instructor only) */
  canViewReport?: boolean;
}

export function AttendanceTracker({ room, canViewReport = false }: AttendanceTrackerProps) {
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);

  useEffect(() => {
    const onJoin = (p: RemoteParticipant) => {
      setAttendance((prev) => [
        ...prev,
        { id: p.sid, name: p.name ?? "Unknown", joinedAt: new Date() },
      ]);
    };
    const onLeave = (p: RemoteParticipant) => {
      setAttendance((prev) =>
        prev.map((e) => (e.id === p.sid ? { ...e, leftAt: new Date() } : e))
      );
    };

    room.on(RoomEvent.ParticipantConnected, onJoin);
    room.on(RoomEvent.ParticipantDisconnected, onLeave);
    return () => {
      room.off(RoomEvent.ParticipantConnected, onJoin);
      room.off(RoomEvent.ParticipantDisconnected, onLeave);
    };
  }, [room]);

  if (!canViewReport) return null;

  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.07]">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Attendance ({attendance.length})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {attendance.map((e) => (
          <div key={e.id} className="flex items-center gap-3 px-4 py-2.5">
            {e.leftAt ? (
              <UserMinus className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <UserCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white truncate">{e.name}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Joined {fmt(e.joinedAt)}
                {e.leftAt && ` · Left ${fmt(e.leftAt)}`}
              </p>
            </div>
          </div>
        ))}
        {attendance.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">
            No participants have joined yet
          </p>
        )}
      </div>
    </div>
  );
}