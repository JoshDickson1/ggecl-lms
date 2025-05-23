// constants/messagesData.ts

export const messagesData: {
  sender: string;
  content: string;
  type: "text" | "pdf" | "image" | "video" | "msword";
  fileUrl?: string;
}[] = [
  {
    sender: "Sender Name",
    content: "This is a sample message.",
    type: "text",
  },
  {
    sender: "Receiver Name",
    content: "Here is another message with an attachment.",
    type: "pdf",
    fileUrl: "https://example.com/sample.pdf",
  },
  {
    sender: "You",
    content: "Here’s a picture.",
    type: "image",
    fileUrl: "https://via.placeholder.com/150",
  },
];
