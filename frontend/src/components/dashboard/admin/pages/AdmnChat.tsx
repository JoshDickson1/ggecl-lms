import { useState } from "react";
import { FaPaperPlane, FaBars, FaTimes } from "react-icons/fa";

interface User {
  name: string;
  message: string;
  time: string;
  active: boolean;
}

interface Message {
  text: string;
  sender: "You" | string;
}

const users: User[] = [
  { name: "Jane Cooper", message: "Yeah sure, tell me zafor", time: "just now", active: true },
  { name: "Jenny Wilson", message: "Thank you so much, sir", time: "2 m", active: false },
  { name: "Marvin McKinney", message: "You're Welcome", time: "4 m", active: false },
  { name: "Eleanor Pena", message: "Thank you so much, sir", time: "1 m", active: false },
  { name: "Ronald Richards", message: "Sorry, I can't help you", time: "3 m", active: false },
  { name: "Jacob Jones", message: "Thank you so much, sir", time: "6 m", active: false },
];

const AdminChat = () => {
  const [selectedUser, setSelectedUser] = useState<User>(users[0]);
  const [messages, setMessages] = useState<Message[]>([  
    { text: "Hello and thanks for signing up...", sender: "Jane" },
    { text: "Hello, Good Evening.", sender: "You" },
    { text: "I'm Zafor", sender: "You" },
    { text: "I only have a small doubt...", sender: "You" },
    { text: "Yeah sure, tell me zafor", sender: "Jane" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { text: newMessage, sender: "You" }]);
    setNewMessage("");
  };

  return (
    <div className="flex h-screen text-gray-600">
      {/* Sidebar */}
      <div className={`fixed md:static w-64 md:w-1/3 h-full shadow-md p-4 border-r border-gray-50 dark:border-gray-950 bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
          Messages
          <button className="md:hidden text-xl" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </h2>
        <input type="text" placeholder="Search" className="w-full p-2 mb-4 border rounded-md" />
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 mb-4 rounded-md font-medium">
          + Compose
        </button>
        <div className="overflow-y-auto h-96 space-y-2">
          {users.map((user, index) => (
            <div
              key={index}
              onClick={() => { setSelectedUser(user); setSidebarOpen(false); }}
              className={`p-3 flex items-center cursor-pointer rounded-md transition-all duration-200 hover:bg-blue-100 ${selectedUser.name === user.name ? "bg-blue-200" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-800"></div>
              <div className="ml-3">
                <p className="font-semibold">{user.name}</p>
                <p className="text-gray-500 text-sm truncate w-40">{user.message}</p>
              </div>
              <span className="ml-auto text-gray-400 text-sm">{user.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center p-4 shadow-md border-b border-gray-200 dark:border-gray-900">
          <button className="md:hidden text-xl mr-3" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
          <div className="w-12 h-12 rounded-full bg-gray-800"></div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
            <p className={`text-sm ${selectedUser.active ? "text-green-500" : "text-gray-400"}`}>
              {selectedUser.active ? "Active Now" : "Offline"}
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3 dark:bg-gray-800 bg-gray-100">
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 text-sm text-gray-500 bg-white dark:bg-gray-900  rounded-full">Today</span>
          </div>
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.sender === "You" ? "bg-blue-600 text-white" : " text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-950"}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex p-4 shadow-md border-t border-gray-200 dark:border-gray-900">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            onClick={sendMessage}
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md transition-all duration-200"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
