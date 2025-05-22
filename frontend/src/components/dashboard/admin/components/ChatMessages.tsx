// components/ChatMessages.tsx .

type Message = {
  sender: string;
  content: string;
  type: "text" | "image" | "video" | "pdf" | "msword";
  fileUrl?: string;
};

type ChatMessagesProps = {
  messages: Message[];
  currentUser: string;
};

export default function ChatMessages({ messages, currentUser }: ChatMessagesProps) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-2 mb-20">
      {messages.map((msg, index) => {
        const isCurrentUser = msg.sender === currentUser;

        return (
          <div
            key={index}
            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs rounded-lg p-3 shadow-md ${
                isCurrentUser
                  ? "bg-gray-100 text-right"
                  : "bg-blue-100 text-left dark:bg-gray-800"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  isCurrentUser ? "text-gray-500" : "text-blue-700 dark:text-gray-400"
                }`}
              >
                {msg.sender}
              </p>

              {/* Text Message */}
              {msg.type === "text" && (
                <p
                  className={`text-sm break-words ${
                    isCurrentUser
                      ? "text-gray-800"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {msg.content}
                </p>
              )}

              {/* Image */}
              {msg.type === "image" && msg.fileUrl && (
                <img
                  src={msg.fileUrl}
                  alt="Sent image"
                  className="rounded-md mt-2 max-w-full"
                />
              )}

              {/* Video */}
              {msg.type === "video" && msg.fileUrl && (
                <video
                  controls
                  className="rounded-md mt-2 max-w-full"
                >
                  <source src={msg.fileUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              {/* File Attachments (PDF / Word) */}
              {(msg.type === "pdf" || msg.type === "msword") && msg.fileUrl && (
                <div className="mt-2">
                  <div className="font-medium text-sm truncate">
                    📄 {msg.content}
                  </div>
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 underline"
                  >
                    Download Attachment
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
