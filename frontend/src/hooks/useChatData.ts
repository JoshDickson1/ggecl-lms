import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/api/client";

interface Group {
  _id: string;
  name: string;
  groupId: string;
  admin: string;
  students: string[];
  instructors: string[];
}

interface Message {
  _id: string;
  group: string;
  sender: string;
  senderId: string;
  role: string;
  text?: string;
  image?: string;
  createdAt: string;
}

export function useChatData(groupId?: string) {
  const [groupsData, setGroupsData] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${API_URL}/chat/get-groups`);
        setGroupsData(res.data);
        // console.log("Groups ---:", res.data);
      } catch (err) {
        console.error("Error fetching groups", err);
      }
    };

    const fetchMessages = async () => {
      if (!groupId) return;
      try {
        const res = await axios.get(`${API_URL}/chat/get-messages/${groupId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };

    setLoading(true);
    Promise.all([fetchGroups(), fetchMessages()]).finally(() =>
      setLoading(false),
    );
  }, [groupId]);

  return { groupsData, messages, loading, setGroupsData, setMessages };
}
