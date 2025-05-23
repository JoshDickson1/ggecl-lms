"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import ChatBottomSection from "./ChatBottomSection";
import ChatMessages from "./ChatMessages";

type Message = {
  sender: string;
  content: string;
  type: "text" | "image" | "video" | "pdf" | "msword";
  fileUrl?: string;
};

type ClassroomContentProps = {
  group: {
    id: number;
    name: string;
    createdAt: Date;
    image: string;
    instructor: string;
    students: string[];
    description: string;
  };
};

const ClassGroupContent = ({ group }: ClassroomContentProps) => {
  const [message, setMessage] = useState("");
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = "You"; // Replace with dynamic current user

  const selectedGroup = group;

  const groupChatInfo = selectedGroup
    ? {
        name: selectedGroup.name,
        instructor: selectedGroup.instructor,
        students: selectedGroup.students,
        description: selectedGroup.description || "No description available.",
        groupImage: selectedGroup.image,
      }
    : {
        name: "",
        instructor: "",
        students: [],
        description: "No description available.",
        groupImage: "",
      };

  const getFileType = (file: File): "image" | "video" | "pdf" | "msword" => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type === "application/pdf") return "pdf";
    if (
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "msword";
    return "pdf"; // default
  };

  const handleSendMessage = () => {
    if (message.trim() === "" && !filePreview) return;

    const newMessage: Message = {
      sender: currentUser,
      content: filePreview ? filePreview : message,
      type: filePreview ? getFileType(selectedFile!) : "text",
      fileUrl: filePreview ? URL.createObjectURL(selectedFile!) : undefined,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
    setFilePreview(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="-mt-5 flex h-full flex-col space-y-2 px-0 py-2 md:p-2">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx"
      />

      {/* Chat Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
          {selectedGroup?.name}
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
        filePreview={filePreview}
        setFilePreview={setFilePreview}
        triggerFileInput={triggerFileInput}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
      />
    </div>
  );
};

export default ClassGroupContent;
