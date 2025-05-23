import { Paperclip, Send, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  filePreview: string | null;
  setFilePreview: (value: string | null) => void;
  triggerFileInput: () => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
};

export default function ChatBottomSection({
  message,
  setMessage,
  handleSendMessage,
  groupChatInfo,
  showChatInfo,
  setShowChatInfo,
  filePreview,
  setFilePreview,
  triggerFileInput,
  selectedFile,
  setSelectedFile,
}: Props) {
  const clearFilePreview = () => {
    setFilePreview(null);
    setSelectedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFileTypeIcon = () => {
    if (!selectedFile) return <Paperclip className="h-4 w-4" />;

    if (selectedFile.type.startsWith("image/")) return "🖼️";
    if (selectedFile.type.startsWith("video/")) return "🎬";
    if (selectedFile.type === "application/pdf") return "📄";
    if (
      selectedFile.type === "application/msword" ||
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "📝";

    return "📎";
  };

  return (
    <div className="-mt-20 flex flex-col space-y-2">
      {/* File Preview */}
      {filePreview && (
        <div className="relative rounded-lg border p-2">
          {filePreview.startsWith("data:image") ? (
            <img
              src={filePreview}
              alt="Preview"
              className="h-32 w-32 object-contain"
            />
          ) : (
            <div className="flex items-center gap-2 p-2">
              <span className="text-lg">{getFileTypeIcon()}</span>
              <div>
                <p className="text-sm font-medium">{selectedFile?.name}</p>
                <p className="text-muted-foreground text-xs">
                  {(selectedFile?.size || 0 / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={clearFilePreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={triggerFileInput}
        >
          {selectedFile ? getFileTypeIcon() : <Paperclip className="h-4 w-4" />}
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={handleSendMessage} disabled={!message && !filePreview}>
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
                alt="Group"
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
