// components/ChatBottomSection.tsx .
import { Message } from "@/types/types"; // adjust path based on your structure

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "lucide-react";

type GroupInfo = {
  name: string;
  groupImage: string;
  instructor: string;
  students: string[];
  description: string;
};

type Props = {
  message: string;
  setMessage: (msg: string) => void;
  handleSendMessage: () => void;
  groupChatInfo: GroupInfo;
  showChatInfo: boolean;
  setShowChatInfo: (value: boolean) => void;
  onSendFileMessage: (file: File, type: Message["type"]) => void;
  onSendTextMessage: (text: string) => void;
  onSendImageMessage: (file: File) => void;
  onSendVideoMessage: (file: File) => void;
  onSendPdfMessage: (file: File) => void;
  onSendMsWordMessage: (file: File) => void;
};

export default function ChatBottomSection({
  message,
  setMessage,
  handleSendMessage,
  groupChatInfo,
  showChatInfo,
  setShowChatInfo,
  onSendFileMessage,
}: Props) {

  const [showFileOptions, setShowFileOptions] = useState(false);
  const [activeFileType, setActiveFileType] = useState<
    "pdf" | "image" | "video" | "msword" | null
  >(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Reset when modal closes
  useEffect(() => {
    if (!showFileOptions) {
      setActiveFileType(null);
      setSelectedFile(null);
    }
  }, [showFileOptions]);

  const FileUploadInput = ({ type }: { type: string }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Upload {type.toUpperCase()} file
        </label>
        <input
          type="file"
          accept={
            type === "pdf"
              ? "application/pdf"
              : type === "image"
                ? "image/*"
                : type === "video"
                  ? "video/*"
                  : type === "msword"
                    ? ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    : undefined
          }
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setSelectedFile(e.target.files[0]);
            }
          }}
          className="w-full rounded border p-2"
        />

        {selectedFile && (
          <div className="text-muted-foreground text-sm">
            <p>
              <strong>Selected:</strong> {selectedFile.name}
            </p>
            <p>
              <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="-mt-20 flex flex-col space-y-2">
      {/* File Upload Button */}
      <Button
        onClick={() => setShowFileOptions(true)}
        variant="outline"
        className="w-max"
      >
        <Paperclip className="mr-2 h-4 w-4" />
        Attach Files
      </Button>

      {/* File Upload Dialog */}
      <Dialog open={showFileOptions} onOpenChange={setShowFileOptions}>
        <DialogContent className="w-[90vw] p-6 sm:w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Attach a File
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              {["pdf", "image", "video", "msword"].map((type) => (
                <Button
                  key={type}
                  variant={activeFileType === type ? "default" : "outline"}
                  onClick={() => {
                    setActiveFileType(type as any);
                    setSelectedFile(null); // reset file when changing type
                  }}
                >
                  <Paperclip className="mr-1 h-4 w-4" />
                  {type.toUpperCase()}
                </Button>
              ))}
            </div>

            {activeFileType && <FileUploadInput type={activeFileType} />}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFileOptions(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedFile}
              onClick={() => {
                if (selectedFile && activeFileType) {
                  onSendFileMessage(selectedFile, activeFileType);
                }
                setShowFileOptions(false);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Input */}
      <div className="flex items-center gap-2">
      <Input
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }}
  placeholder="Type a message..."
  className="flex-1"
/>

        <Button onClick={handleSendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Group Chat Info Dialog */}
      <Dialog open={showChatInfo} onOpenChange={setShowChatInfo}>
        <DialogContent className="w-[90vw] p-6 sm:w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Active Chat Info
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="font-medium">Group Name:</p>
              <p>{groupChatInfo.name}</p>
            </div>
            <div>
              <p className="font-medium">Group Image</p>
              <img
                src={groupChatInfo.groupImage}
                className="h-24 w-24 rounded-lg object-cover"
              />
            </div>
            <div>
              <p className="font-medium">Instructor:</p>
              <p>{groupChatInfo.instructor}</p>
            </div>
            <div>
              <p className="font-medium">Students:</p>
              <ul className="max-h-15 list-disc overflow-y-auto pl-4">
                {groupChatInfo.students.map((student, index) => (
                  <li key={index}>{student}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Group Description:</p>
              <p>{groupChatInfo.description}</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowChatInfo(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
