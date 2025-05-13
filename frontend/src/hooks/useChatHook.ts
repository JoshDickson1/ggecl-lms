import { useState, useEffect, useCallback } from "react";
import socketService from "@/socket/socketService";

interface Message {
  text: string | null;
  sender: string;
  senderId: string;
  role: "admin" | "student";
  timestamp?: number;
  image?: string | null;
}

interface Group {
  groupId: string;
  groupName: string;
  adminId: string;
  students: string[];
  instructors?: string[];
  messages?: Message[];
  lastMessageTime?: Date | null;
}

export const useChat = (
  currentUserId: string,
  currentUserRole: "admin" | "student",
) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket and load groups
  useEffect(() => {
    socketService.connect(currentUserId);

    const loadInitialGroups = () => {
      setIsLoading(true);
      setError(null);

      // Mock initial groups - replace with actual API call
      setTimeout(() => {
        try {
          setGroups([
            {
              groupId: "group1",
              groupName: "React Learners",
              adminId: "admin1",
              students: ["student1", "student2"],
              instructors: ["inst1"],
              messages: [
                {
                  text: "Welcome to the group!",
                  sender: "Admin",
                  senderId: "admin1",
                  role: "admin",
                  timestamp: Date.now() - 10000,
                },
                {
                  text: "Thanks!",
                  sender: "Alice",
                  senderId: "student1",
                  role: "student",
                  timestamp: Date.now() - 5000,
                },
              ],
              lastMessageTime: new Date(Date.now() - 5000),
            },
          ]);
        } catch (err) {
          setError("Failed to load groups");
        } finally {
          setIsLoading(false);
        }
      }, 500);
    };

    loadInitialGroups();

    return () => {
      socketService.disconnect();
    };
  }, [currentUserId]);

  // Handle sending messages
  const sendMessage = useCallback(
    (groupId: string, messageData: { text?: string; image?: string }) => {
      if (
        (!messageData.text || !messageData.text.trim()) &&
        !messageData.image
      ) {
        throw new Error("Message or image must be provided");
      }

      const message: Message = {
        text: messageData.text ? messageData.text.trim() : null,
        sender: currentUserRole === "admin" ? "Admin" : "You", // Replace with actual user name
        senderId: currentUserId,
        role: currentUserRole,
        timestamp: Date.now(),
        image: messageData.image || null,
      };

      // Optimistic update
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.groupId === groupId
            ? {
                ...group,
                messages: [...(group.messages || []), message],
                lastMessageTime: new Date(),
              }
            : group,
        ),
      );

      if (selectedGroup?.groupId === groupId) {
        setSelectedGroup((prev) =>
          prev
            ? {
                ...prev,
                messages: [...(prev.messages || []), message],
                lastMessageTime: new Date(),
              }
            : null,
        );
      }

      // Send via socket
      socketService.emit(
        "sendMessage",
        {
          groupId,
          senderId: currentUserId,
          role: currentUserRole,
          sender: currentUserRole === "admin" ? "Admin" : "You", // Replace with actual user name
          text: messageData.text,
          image: messageData.image,
        },
        (response: { success: boolean; error?: string }) => {
          if (!response.success) {
            // Revert optimistic update if failed
            setGroups((prevGroups) => prevGroups);
            setSelectedGroup((prev) => prev);
            throw new Error(response.error || "Failed to send message");
          }
        },
      );
    },
    [currentUserId, currentUserRole, selectedGroup],
  );

  // Handle real-time updates
  useEffect(() => {
    const handleGroupCreated = (newGroup: Group) => {
      const transformedGroup = {
        ...newGroup,
        messages: newGroup.messages || [],
        lastMessageTime: newGroup.lastMessageTime || null,
      };

      setGroups((prev) => [...prev, transformedGroup]);

      if (
        newGroup.students.includes(currentUserId) ||
        newGroup.adminId === currentUserId
      ) {
        setSelectedGroup(transformedGroup);
      }
    };

    const handleNewMessage = (data: {
      groupId: string;
      senderId: string;
      role: "admin" | "student";
      sender: string;
      text: string | null;
      image: string | null;
    }) => {
      const message: Message = {
        text: data.text,
        sender: data.sender,
        senderId: data.senderId,
        role: data.role,
        timestamp: Date.now(),
        image: data.image,
      };

      console.log("Received message:", message);

      setGroups((prev) =>
        prev.map((group) =>
          group.groupId === data.groupId
            ? {
                ...group,
                messages: [...(group.messages || []), message],
                lastMessageTime: new Date(),
              }
            : group,
        ),
      );

      if (selectedGroup?.groupId === data.groupId) {
        setSelectedGroup((prev) =>
          prev
            ? {
                ...prev,
                messages: [...(prev.messages || []), message],
                lastMessageTime: new Date(),
              }
            : null,
        );
      }
    };

    socketService.on("groupCreated", handleGroupCreated);
    socketService.on("message", handleNewMessage);

    return () => {
      socketService.off("groupCreated", handleGroupCreated);
      socketService.off("message", handleNewMessage);
    };
  }, [currentUserId, selectedGroup]);

  return {
    groups,
    setGroups,
    selectedGroup,
    setSelectedGroup,
    isLoading,
    error,
    sendMessage,
  };
};
