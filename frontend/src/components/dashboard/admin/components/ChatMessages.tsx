// components/ChatMessages.tsx

// type Message = {
//   sender: string;
//   content: string;
//   type: "text" | "image" | "video" | "pdf" | "msword";
//   fileUrl?: string;
// };

type ChatMessagesProps = {
  messages: any[];
  currentUser: string;
};

export default function ChatMessages({
  messages,
  currentUser,
}: ChatMessagesProps) {
  console.log("ChatMessages", messages);
  return (
    <div className="flex-1 space-y-4 overflow-y-auto">
      {messages.map((msg, index) => {
        const isCurrentUser = msg.sender === currentUser;

        return (
          <div
            key={index}
            className={`w-max max-w-60 rounded-lg p-2 ${
              !isCurrentUser
                ? "self-end bg-gray-100"
                : "self-start bg-blue-100 dark:bg-gray-800"
            }`}
          >
            <p
              className={`text-sm ${
                isCurrentUser ? "text-gray-500" : "dark:text-gray-500"
              }`}
            >
              {msg.sender}
            </p>

            {msg.type === "text" && (
              <p
                className={`font-semibold ${
                  !isCurrentUser
                    ? "text-gray-700"
                    : "text-gray-700 dark:text-white"
                }`}
              >
                {msg.content}
              </p>
            )}

            {msg.type === "image" && (
              <img
                src={msg.content}
                alt="Image"
                className="max-w-full rounded-md"
              />
            )}

            {msg.type === "video" && (
              <video controls className="max-w-full rounded-md">
                <source src={msg.content} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {(msg.type === "pdf" || msg.type === "msword") && (
              <div>
                <p
                  className={`font-semibold ${
                    !isCurrentUser
                      ? "text-gray-700"
                      : "text-gray-700 dark:text-white"
                  } overflow-hidden text-ellipsis whitespace-nowrap`}
                >
                  {msg.type}
                </p>
                <a
                  href={msg.content}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500"
                >
                  Download Attachment
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
