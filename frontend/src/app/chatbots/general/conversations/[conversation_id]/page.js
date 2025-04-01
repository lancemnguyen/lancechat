"use client";

import axios from 'axios';
import useFirebaseUid from '../../../../../hooks/useFirebaseUid';
import { useEffect, useState, useRef } from 'react';
import { useConversations } from '../../../../../context/ConversationContext';

const ConversationPage = ({ params }) => {
  const user_id = useFirebaseUid();
  const messageListRef = useRef(null);
  const { conversation_id } = params;
  const { addConversation } = useConversations();
  const [conversationTitle, setConversationTitle] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setError] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchConversation = async () => {
      if (!user_id) return;
      try {
        const response = await axios.get(`${apiUrl}/conversations/${conversation_id}`, {
          params: { user_id },
        });
        setMessages(response.data.messages || []);
        setConversationTitle(response.data.title || `Conversation ${conversation_id.slice(-4)}`); // Set title
      } catch (err) {
        console.error('Error fetching conversation:', err);
        setError('Failed to load conversation'); // not a function yet
      } finally {
        setLoading(false);
      }
    };

    if (conversation_id) fetchConversation();
  }, [conversation_id, user_id]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    setSending(true);
    try {
      const response = await axios.post(`${apiUrl}/messages/`, {
        sender: user_id,
        text: inputText,
        conversation_id,
      });

      const { bot_response } = response.data;

      setMessages((prev) => [
        ...prev,
        { sender: user_id, text: inputText },
        { sender: 'bot', text: bot_response },
      ]);
      setInputText('');

      // Add conversation to context when a new message is sent
      if (messages.length === 0) {
        const newConversation = { id: conversation_id, title: conversationTitle };
        addConversation(newConversation);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Scroll to the bottom of the messages container
  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        messageListRef.current?.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 0); // Ensure this runs after the render cycle

      return () => clearTimeout(timeout);
    }
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full bg-gray-100">      
      {/* Title */}
      <h1 className="text-xl font-bold text-center py-4 bg-white border-b">{conversationTitle}</h1>

      {/* Chat Messages */}
      <div ref={messageListRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === user_id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-lg ${
                msg.sender === user_id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t p-4 sticky bottom-0">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !sending && inputText.trim()) sendMessage();
            }}
            className="flex-1 border rounded-lg p-2"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            disabled={sending || !inputText.trim()}
            className="bg-green-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
