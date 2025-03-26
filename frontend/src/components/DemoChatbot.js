import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const DemoChatbot = () => {
  const messageListRef = useRef(null); // Reference for message list
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const sendMessage = async (text) => {
    if (!text.trim()) return; // Prevent empty messages
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/demo/messages/`, {
        sender: 'demo-user',
        text,
      });

      const { bot_response } = response.data;

      setMessages((prev) => [
        ...prev,
        { sender: 'user', text },
        { sender: 'bot', text: bot_response },
      ]);
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading && inputText.trim()) {
      sendMessage(inputText);
    }
  };

  // Scroll to the bottom of the message list
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div className="chat-container p-4 space-y-4 max-w-lg mx-auto">
      <div ref={messageListRef} className="message-list space-y-2 overflow-y-auto max-h-96">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`message-text px-4 py-2 rounded-lg inline-block ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      <div className="message-input flex items-center space-x-2 mt-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input-text p-2 w-full border rounded-lg"
          placeholder="Type your message..."
        />
        <button
          onClick={() => sendMessage(inputText)}
          disabled={loading || !inputText}
          className="send-button p-2 bg-green-500 text-white rounded-lg disabled:bg-gray-300"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default DemoChatbot;
