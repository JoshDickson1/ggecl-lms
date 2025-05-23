<<<<<<< HEAD
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaPaperPlane,
  FaBars,
  FaTimes,
  FaImage,
  FaSpinner,
} from "react-icons/fa";
import socketService from "@/socket/socketService";
import { formatDistanceToNow } from "date-fns";

//Chat hook
import { useChatData } from "@/hooks/useChatData";
import { useAuth } from "@/hooks/useAuth";
import { useInstructors } from "@/hooks/useInstructors";
import { useStudents } from "@/hooks/useStudents";
import { GroupItem } from "./GroupItem";

interface Message {
  text: string | null;
  sender: string;
  senderId: string;
  role: "admin" | "student" | "instructor";
  timestamp?: number;
  image?: string | null;
}

interface Group {
  groupId: string;
  groupName: string;
  adminId: string;
  students: string[];
  instructors?: string[];
  messages?: Message[];
  lastMessageTime?: Date | null;
}

const AdminChat = () => {
  const { userId, role } = useAuth();
  const currentUserId = userId || "admin";
  const currentUserRole = role || "admin";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{
    [groupId: string]: string[];
  }>({});
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [availableInstructors, setAvailableInstructors] = useState([
    { id: "instructor1", name: "Instructor One" },
    { id: "instructor2", name: "Instructor Two" },
  ]);
  const [availableStudents, setAvailableStudents] = useState([
    { id: "student1", name: "Student One" },
    { id: "student2", name: "Student Two" },
  ]);
  const { groupsData, loading, messages } = useChatData(selectedGroup?.groupId);

  const [searchTerm, setSearchTerm] = useState("");
  const { instructors = [] } = useInstructors({ limit: 200 });
  const { students = [] } = useStudents({ limit: 200 });

  useEffect(() => {
    if (instructors) {
      setAvailableInstructors(
        instructors.map((ins) => ({
          id: ins._id.toString(),
          name: ins.fullName,
        })),
      );
    }
    if (students) {
      setAvailableStudents(
        students.map((stu) => ({ id: stu._id.toString(), name: stu.fullName })),
      );
    }
  }, [groupsData, instructors, students]);

  const filteredInstructors = availableInstructors.filter((instructor) =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const filteredStudents = availableStudents.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // console.log({ availableInstructors });

  // console.log("Instructors:", instructors);
  // console.log("Students:", students);

  // // console.log("User ID:", { userId, role });
  // // console.log("Selected Group:", selectedGroup);

  useEffect(() => {
    // console.log("Groups data updated:", groupsData);
    // console.log("Groups data loading:", loading);
    // console.log("Groups message:", messages);
  }, [groupsData, selectedGroup, messages]);

  useEffect(() => {
    if (!Array.isArray(messages) || messages.length === 0) return;

    const groupMessages = messages.filter(
      (msg) => msg.group === selectedGroup?.groupId,
    );
    if (groupMessages.length === 0) return;

    const transformedMessages = groupMessages.map((msg) => ({
      text: msg.text ?? null,
      sender: msg.sender,
      senderId: msg.senderId,
      role: msg.role as "admin" | "student" | "instructor",
      timestamp: new Date(msg.createdAt).getTime(),
      image: msg.image,
    }));

    const latestMessage = groupMessages[groupMessages.length - 1];

    setGroups((prev) =>
      prev.map((group) =>
        group.groupId === selectedGroup?.groupId
          ? {
              ...group,
              messages: transformedMessages,
              lastMessageTime: new Date(latestMessage.createdAt),
            }
          : group,
      ),
    );

    if (selectedGroup) {
      setSelectedGroup((prev) => ({
        ...prev!,
        messages: transformedMessages,
        lastMessageTime: new Date(latestMessage.createdAt),
      }));
    }
  }, [messages, selectedGroup?.groupId]);

  // console.log("Groups:", groups);

  // Join groups when groups data is loaded
  useEffect(() => {
    if (currentUserId && groups.length > 0) {
      const groupIds = groups.map((g) => g.groupId);
      socketService.emit("joinGroups", { groupIds, admin: currentUserId });
    }
  }, [currentUserId, groups]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Initialize socket and load groups
  useEffect(() => {
    socketService.connect(currentUserId);

    const loadInitialGroups = () => {
      try {
        setGroups(
          groupsData.map((group) => ({
            ...group,
            groupId: group.groupId,
            groupName: group.name,
            adminId: group.admin,
            students: group.students,
            instructors: group.instructors,
          })),
        );
        // if (groups.length > 0) {
        //   setSelectedGroup(groups[0]);
        // }
      } catch (err) {
        setError("Failed to load groups");
      }
    };

    loadInitialGroups();

    return () => {
      socketService.disconnect();
    };
  }, [currentUserId, groupsData]);

  // Handle sending messages
  const sendMessage = useCallback(async () => {
    if (!selectedGroup || (!newMessage.trim() && !image)) return;

    setIsSending(true);

    try {
      const messageData = {
        text: newMessage,
        image: image || undefined,
      };

      if (
        (!messageData.text || !messageData.text.trim()) &&
        !messageData.image
      ) {
        throw new Error("Message or image must be provided");
      }

      // Send via socket - wait for socket response to update UI
      await socketService.emit(
        "sendMessage",
        {
          groupId: selectedGroup.groupId,
          senderId: currentUserId,
          role: currentUserRole,
          sender: "Admin",
          text: messageData.text,
          image: messageData.image,
        },
        (response: { success: boolean; error?: string }) => {
          if (!response.success) {
            throw new Error(response.error || "Failed to send message");
          }
          // Clear input only on success
          setNewMessage("");
          setImage(null);
          setImagePreview(null);
        },
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [selectedGroup, newMessage, image, currentUserId, currentUserRole]);

  // Handle real-time updates
  useEffect(() => {
    const handleGroupCreated = (newGroup: Group) => {
      const transformedGroup = {
        ...newGroup,
        messages: newGroup.messages || [],
        lastMessageTime: newGroup.lastMessageTime || null,
      };

      setGroups((prev) => [...prev, transformedGroup]);
      setSelectedGroup(transformedGroup);
    };

    const handleNewMessage = (data: {
      groupId: string;
      senderId: string;
      role: "admin" | "student" | "instructor";
      sender: string;
      text: string | null;
      image: string | null;
    }) => {
      const message: Message = {
        text: data.text,
        sender: data.sender,
        senderId: data.senderId,
        role: data.role,
        timestamp: Date.now(),
        image: data.image,
      };

      // Update groups state
      setGroups((prev) =>
        prev.map((group) =>
          group.groupId === data.groupId
            ? {
                ...group,
                messages: [...(group.messages || []), message],
                lastMessageTime: new Date(),
              }
            : group,
        ),
      );

      // Update selected group if it's the current one
      if (selectedGroup?.groupId === data.groupId) {
        setSelectedGroup((prev) =>
          prev
            ? {
                ...prev,
                messages: [...(prev.messages || []), message],
                lastMessageTime: new Date(),
              }
            : null,
        );
      }
    };

    const handleTyping = (data: {
      groupId: string;
      userId: string;
      userName: string;
    }) => {
      setTypingUsers((prev) => {
        const groupTypingUsers = prev[data.groupId] || [];
        if (!groupTypingUsers.includes(data.userName)) {
          return {
            ...prev,
            [data.groupId]: [...groupTypingUsers, data.userName],
          };
        }
        return prev;
      });

      setTimeout(() => {
        setTypingUsers((prev) => {
          const groupTypingUsers = prev[data.groupId] || [];
          return {
            ...prev,
            [data.groupId]: groupTypingUsers.filter(
              (name) => name !== data.userName,
            ),
          };
        });
      }, 3000);
    };

    socketService.on("groupCreated", handleGroupCreated);
    socketService.on("message", handleNewMessage);
    socketService.on("typing", handleTyping);

    return () => {
      socketService.off("groupCreated", handleGroupCreated);
      socketService.off("message", handleNewMessage);
      socketService.off("typing", handleTyping);
    };
  }, [selectedGroup?.groupId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedGroup?.messages, scrollToBottom]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (selectedGroup) {
      socketService.emit("typing", {
        groupId: selectedGroup.groupId,
        userId: currentUserId,
        userName: "Admin",
      });
    }
  };

  const handleToggleInstructor = (instructorId: string) => {
    setSelectedInstructors((prev) =>
      prev.includes(instructorId)
        ? prev.filter((id) => id !== instructorId)
        : [...prev, instructorId],
    );
  };

  const handleToggleStudent = (studentId: string) => {
    console.log("compare Students:", userId, studentId);
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleCreateNewGroup = () => {
    if (!newGroupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    // console.log(selectedInstructors);

    const groupDetails = {
      groupId: new Date().getTime().toString(16).padStart(24, "0"),
      groupName: newGroupName.trim(),
      adminId: currentUserId,
      students: selectedStudents,
      instructors: selectedInstructors,
    };

    socketService.createGroup(groupDetails, (response) => {
      if (response.success) {
        setIsCreateGroupModalOpen(false);
        setNewGroupName("");
        setSelectedInstructors([]);
        setSelectedStudents([]);
      } else {
        alert(response.error || "Failed to create group");
      }
    });
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupMessagesByDate = (messages: Message[] = []) => {
    const grouped: { [date: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.timestamp || 0).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });

    return grouped;
  };

  // // console.log("messages", messages);

  const groupedMessages = groupMessagesByDate(selectedGroup?.messages);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Sidebar */}
      <div
        className={`fixed z-20 h-full w-64 border-r border-gray-200 bg-white p-4 shadow-lg transition-transform duration-300 ease-in-out md:static md:z-0 md:w-80 md:translate-x-0 dark:border-gray-700 dark:bg-gray-800 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Chat Groups</h2>
          <button
            className="text-xl text-gray-500 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        <button
          onClick={() => setIsCreateGroupModalOpen(true)}
          className="mt-4 w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
        >
          + Create Group
        </button>

        <div className="mt-4">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <FaSpinner className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : groups.length > 0 ? (
            <div
              className="mt-4 space-y-2 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 180px)" }}
            >
              {groups.map((group) => (
                <div
                  key={group.groupId}
                  onClick={() => {
                    setSelectedGroup(group);
                    setSidebarOpen(false);
                  }}
                  className={`flex cursor-pointer items-center rounded-lg p-3 transition-colors duration-200 ${
                    selectedGroup?.groupId === group.groupId
                      ? "bg-blue-100 dark:bg-gray-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                    {group.groupName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <p className="truncate font-medium">{group.groupName}</p>
                    <GroupItem
                      key={group.groupId}
                      group={group.groupId}
                      fullName={group.groupName}
                      role={currentUserRole}
                    />
                  </div>
                  {group.messages && group.messages.length > 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      {formatTime(
                        group.messages[group.messages.length - 1].timestamp,
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-gray-500">No groups created yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center border-b border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <button
            className="mr-3 text-xl text-gray-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FaBars />
          </button>
          {selectedGroup ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                {selectedGroup.groupName.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold">
                  {selectedGroup.groupName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedGroup.students.length} student
                  {selectedGroup.students.length !== 1 ? "s" : ""},{" "}
                  {selectedGroup.instructors?.length || 0} instructor
                  {(selectedGroup.instructors?.length || 0) !== 1 ? "s" : ""}
                  {typingUsers[selectedGroup.groupId]?.length > 0 && (
                    <span className="ml-2 text-blue-500">
                      {typingUsers[selectedGroup.groupId].join(", ")} typing...
                    </span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <div className="ml-3">
              <h2 className="text-lg font-semibold">No group selected</h2>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">
          {selectedGroup ? (
            <>
              {Object.entries(groupedMessages).map(([date, messages]) => (
                <div key={date}>
                  <div className="mb-4 flex justify-center">
                    <span className="mt-5 rounded-full bg-white px-3 py-1 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-400">
                      {new Date(date).toLocaleDateString([], {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          msg.senderId !== currentUserId
                            ? "justify-start"
                            : "justify-end"
                        }`}
                      >
                        <div
                          className={`flex max-w-xs flex-col rounded-xl px-4 py-2 ${
                            msg.senderId === currentUserId
                              ? "bg-blue-600 text-white"
                              : msg.role === "instructor"
                                ? "bg-purple-600 text-white"
                                : "bg-white text-gray-800 shadow dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          <p className="text-xs font-semibold">
                            {msg.senderId === currentUserId
                              ? "You"
                              : msg.sender}
                          </p>
                          {msg.image ? (
                            <div className="my-2">
                              <img
                                src={msg.image}
                                alt="Message attachment"
                                className="max-h-60 rounded-md object-cover"
                              />
                            </div>
                          ) : null}
                          <p className="py-1">{msg.text}</p>
                          <span
                            className={`text-xs ${
                              msg.senderId === currentUserId
                                ? "text-blue-100"
                                : msg.role === "instructor"
                                  ? "text-purple-100"
                                  : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                            {" • "}
                            {formatDistanceToNow(new Date(msg.timestamp || 0), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a group to start chatting
                </p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 md:hidden"
                >
                  Browse groups
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          {imagePreview && (
            <div className="relative mb-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 rounded-md object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 rounded-full bg-gray-800 p-1 text-white opacity-75 hover:opacity-100"
                aria-label="Remove image"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-l-md bg-gray-100 px-3 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-label="Attach image"
            >
              <FaImage />
            </button>
            <input
              type="text"
              placeholder={
                selectedGroup
                  ? "Type your message..."
                  : "Select a group to chat"
              }
              className="flex-1 border border-gray-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedGroup}
            />
            <button
              onClick={sendMessage}
              disabled={
                !selectedGroup || (!newMessage.trim() && !image) || isSending
              }
              className="rounded-r-md bg-blue-600 px-4 text-white hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-700 dark:hover:bg-blue-800 dark:disabled:bg-gray-600"
              aria-label="Send message"
            >
              {isSending ? (
                <FaSpinner className="h-4 w-4 animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {isCreateGroupModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg bg-white shadow dark:bg-gray-800">
            <button
              type="button"
              className="absolute top-3 right-2.5 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setIsCreateGroupModalOpen(false)}
            >
              <FaTimes className="h-5 w-5" />
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
                Create a New Group
              </h3>
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full rounded-md border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Search Instructors/Students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2 w-full rounded-md border-1 border-amber-50 p-1.5 outline-0 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-4 text-left">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Instructors
                </label>
                <ul className="h-28 overflow-y-auto rounded-md border dark:border-gray-600">
                  {filteredInstructors.map((instructor) => (
                    <li
                      key={instructor.id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                          value={instructor.id}
                          checked={selectedInstructors.includes(instructor.id)}
                          onChange={() => handleToggleInstructor(instructor.id)}
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          {instructor.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4 text-left">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Students
                </label>
                <ul className="h-32 overflow-y-scroll rounded-md border dark:border-gray-600">
                  {filteredStudents.map((student) => (
                    <li
                      key={student.id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                          value={student.id}
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleToggleStudent(student.id)}
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          {student.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleCreateNewGroup}
                className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChat;
=======
import { useState } from 'react';
import SidebarM from '../components/SidebarM';
import ClassroomContent from '../components/ClassroomContent';

const initialGroups = [
  {
    id: 1,
    name: 'Class 1',
    createdAt: new Date(),
    image: 'https://i.pinimg.com/736x/32/60/dc/3260dc3b3034bd82b1caef506ae0b8e0.jpg',
    instructor: 'Alice',
    students: ['John', 'Jane'],
    description: '',
    classroomId: 1, // ✅ Add this
  },
  {
    id: 2,
    name: 'Class 2',
    createdAt: new Date(),
    image: 'https://i.pinimg.com/736x/32/60/dc/3260dc3b3034bd82b1caef506ae0b8e0.jpg',
    instructor: 'Bob',
    students: ['Jim'],
    description: '',
    classroomId: 2, // ✅ Add this
  },
];
// import { Group } from '@/types/types';

export default function AdminChat() {
  const [activeTab, setActiveTab] = useState<'classroom' | 'class-groups'>('classroom');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [classGroups, setClassGroups] = useState(initialGroups);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'classroom' | 'class-groups');
  };


  return (
    <div className="flex h-[96%]">
      <SidebarM
        classGroups={classGroups}
        setClassGroups={setClassGroups}
        onTabChange={handleTabChange}
        activeChatId={activeChatId}
        onSelectGroup={setActiveChatId}
      />
      <div className="flex-1 p-4">
        {activeTab === 'classroom' && activeChatId === null && (
          <p className="text-gray-500 dark:text-gray-300 text-center mt-10">
            Select a class group to view the chat.
          </p>
        )}

        {activeTab === 'classroom' && activeChatId !== null && (
          <ClassroomContent
          group={classGroups.find((group) => group.id === activeChatId) || {
            id: -1,
            name: 'Unknown',
            instructor: 'N/A',
            students: [],
            image: '/default-image.jpg',
            createdAt: new Date(),
            description: 'No description available',
          }}        
          />
        )}

        {activeTab === 'class-groups' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Class Groups</h2>
            {/* <GroupComp classGroups={classGroups} onCreateGroup={handleCreateGroup} /> */}
          </>
        )}
      </div>
    </div>
  );
}
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
