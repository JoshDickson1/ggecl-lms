import { useEffect, useState } from "react";
import { Message } from "react-hook-form";

// Simulated fetch method — replace with your actual API call or data hook
const getMessagesForGroup = async (groupId: string): Promise<Message[]> => {
  // Example: Replace this with real API logic
  const response = await fetch(`/api/groups/${groupId}/messages`);
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
};

export const useAllGroupMessages = (groupIds: string[]) => {
  const [messagesMap, setMessagesMap] = useState<{ [key: string]: Message[] }>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const map: { [key: string]: Message[] } = {};

        for (const id of groupIds) {
          const messages = await getMessagesForGroup(id);
          map[id] = messages;
        }

        setMessagesMap(map);
      } catch (err) {
        setError("Error fetching messages");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (groupIds.length > 0) {
      fetchAllMessages();
    }
  }, [groupIds]);

  return { messagesMap, loading, error };
};
