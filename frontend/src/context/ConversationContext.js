import axios from 'axios';
import useFirebaseUid from '../hooks/useFirebaseUid';
import { createContext, useContext, useState, useEffect } from 'react';

const ConversationContext = createContext();

export const useConversations = () => {
  return useContext(ConversationContext);
};

export const ConversationProvider = ({ children }) => {
  const user_id = useFirebaseUid();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchConversations = async () => {
    setLoading(true);
    try {
      if (!user_id) return;
      const response = await axios.get(`${apiUrl}/conversations/`, {
        params: { user_id },
      });
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user_id]);

  const addConversation = (newConversation) => {
    // console.log('Adding conversation:', newConversation);
    setConversations((prev) => {
      // Check for duplicates and prevent them
      if (prev.find((conv) => conv.id === newConversation.id)) return prev;

      // Add the new conversation at the top of the list
      return [newConversation, ...prev];
    });
  };

  return (
    <ConversationContext.Provider value={{ conversations, loading, addConversation, fetchConversations }}>
      {children}
    </ConversationContext.Provider>
  );
};
