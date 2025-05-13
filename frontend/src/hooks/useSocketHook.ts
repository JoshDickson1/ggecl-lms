// useGroupSocket.ts
import { useEffect } from "react";
import socket from "@/socket/socketIo";

type Group = {
  groupName: string;
  students: string[];
  messages: string[];
  adminId: string;
};

interface UseGroupSocketProps {
  groupDetails: Group;
  setGroups: (groups: Group[]) => void;
}

export const useGroupSocket = ({
  groupDetails,
  setGroups,
}: UseGroupSocketProps) => {
  useEffect(() => {
    if (!groupDetails) return;

    socket.emit("join_group", groupDetails);

    const handleGroupCreated = (newGroups: Group[]) => {
      setGroups(newGroups);
    };

    socket.on("group_created", handleGroupCreated);

    return () => {
      socket.off("group_created", handleGroupCreated);
    };
  }, [groupDetails, setGroups]);
};
