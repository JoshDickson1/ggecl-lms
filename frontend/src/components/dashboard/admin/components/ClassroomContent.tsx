"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ChatBottomSection from "./ChatBottomSection";
import ChatMessages from "./ChatMessages";

type ClassroomContentProps = {
  group: {
    id: number;
    name: string;
    instructor: string;
    students: string[];
    image: string;
    createdAt: Date;
    groupDes?: string;
  };
};

const ClassroomContent = ({ group }: ClassroomContentProps) => {
  const [message, setMessage] = useState("");
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [messages, setMessages] = useState<any[]>([]); // Adjust based on your message structure
  const currentUser = "You"; // Replace with dynamic current user

  const groupChatInfo = {
    name: group.name,
    instructor: group.instructor,
    students: group.students,
    otherDetails: group.groupDes || "No description available.",
    groupImage: group.image,
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    const newMessage = {
      sender: currentUser,
      content: message,
      type: "text" as const,
    };
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="-mt-5 flex h-full flex-col space-y-2 px-0 py-2 md:p-2">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
          {group.name}
        </div>
        <Button className="mt-2 text-sm" onClick={() => setShowChatInfo(true)}>
          Active Chat Info
        </Button>
      </div>

      {/* Chat Messages */}
      <ChatMessages messages={messages} currentUser={currentUser} />

      {/* Input Section */}
      <ChatBottomSection
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        groupChatInfo={groupChatInfo}
        showChatInfo={showChatInfo}
        setShowChatInfo={setShowChatInfo}
      />
    </div>
  );
};

export default ClassroomContent;
