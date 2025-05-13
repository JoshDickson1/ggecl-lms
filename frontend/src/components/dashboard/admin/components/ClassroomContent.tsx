import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip, Send } from 'lucide-react';

const ClassroomContent = () => {
  const [activeChat, setActiveChat] = useState(null); // Track active chat
  const [messages, setMessages] = useState<any[]>([]); // Store messages (text, images, files)
  const [message, setMessage] = useState(''); // Text message input
  const [file, setFile] = useState<File | null>(null); // File input

  // Handle message send
  const handleSendMessage = () => {
    if (message || file) {
      const newMessage = {
        text: message,
        file: file,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage(''); // Reset text message
      setFile(null); // Reset file input
    }
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Default message when no chat is selected */}
      {!activeChat ? (
        <div className="text-center text-gray-500 p-4 grid place-items-center">
          You need to click a chat to view.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Displaying messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className="flex items-start gap-3">
                {/* Display message text */}
                {msg.text && (
                  <div className="bg-gray-100 p-3 rounded-md text-gray-700">
                    {msg.text}
                  </div>
                )}
                {/* Display attached file */}
                {msg.file && (
                  <div className="flex items-center gap-2">
                    <a
                      href={URL.createObjectURL(msg.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      {msg.file.name}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input area for sending messages */}
          <div className="flex items-center gap-2 p-4 border-t border-gray-200">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Paperclip className="text-gray-500" />
            </label>
            <Input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-700 text-white">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomContent;
