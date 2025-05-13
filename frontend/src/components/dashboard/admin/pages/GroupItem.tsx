import { useChatData } from "@/hooks/useChatData";

export const GroupItem = ({
  group,
  fullName,
}: {
  group: string;
  fullName?: string;
  role: string | null;
}) => {
  const { messages } = useChatData(group);

  const lastMessage = messages?.[messages.length - 1]; // ✅ Fix here

  //   console.log({ sender: lastMessage?.sender, fullName, role });

  const senderLabel =
    lastMessage?.sender === fullName
      ? "You"
      : lastMessage?.role === "admin"
        ? "Admin"
        : lastMessage?.role === "instructor"
          ? "Instructor"
          : lastMessage?.sender;

  const messageContent = lastMessage?.image ? "📷 Image" : lastMessage?.text;

  return (
    <div className="group-item">
      <p className="truncate text-sm text-gray-500 dark:text-gray-400">
        {lastMessage ? `${senderLabel}: ${messageContent}` : "No messages yet"}
      </p>
    </div>
  );
};
