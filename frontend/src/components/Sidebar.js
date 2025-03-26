import { useRouter } from 'next/navigation';
import { useConversations } from '../context/ConversationContext';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import useFirebaseUid from "../hooks/useFirebaseUid";

const Sidebar = () => {
  const uid = useFirebaseUid();
  const router = useRouter();
  const { conversations, loading, fetchConversations } = useConversations();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleConversationClick = (id) => {
    router.push(`/chatbots/general/conversations/${id}`);
  };

  const handleDeleteConversation = async (id) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await axios.delete(`${apiUrl}/api/conversations/${id}`, {
        params: { user_id: uid },
      });
      await fetchConversations();
      router.push('/chatbots/general'); // Redirect to the general chatbot page after deletion
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-wrapper')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="sidebar bg-gradient-to-b from-gray-800 to-blue-900 p-4 w-64 h-full border-r space-y-4 relative">
      <h2 className="text-xl font-bold text-white">LanceChat</h2>
      <button
        onClick={() => router.push('/chatbots/general')}
        className="new-chat-button bg-green-500 text-white p-2 rounded-lg w-full"
      >
        New Chat
      </button>
      <div className="conversation-list space-y-2">
        {loading ? (
          <p>Loading...</p>
        ) : conversations.length > 0 ? (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className="conversation-item p-2 bg-gray-500 rounded hover:bg-gray-400 flex justify-between items-center text-white"
            >
              <span
                onClick={() => handleConversationClick(conv.id)}
                className="cursor-pointer flex-grow"
              >
                {conv.title || `Conversation ${conv.id.slice(-4)}`}
              </span>
              <div className="relative dropdown-wrapper">
                <button
                  onClick={() => toggleDropdown(conv.id)}
                  className="options-button p-2 rounded hover:bg-gray-400"
                >
                  ⋮
                </button>
                {dropdownOpen === conv.id && (
                  <>
                    {/* Overlay to capture outside clicks */}
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)}></div>
                    <div className="dropdown-menu absolute top-0 -right-16 mt-1 bg-white border rounded shadow-lg z-20">
                      <button
                        onClick={() => handleDeleteConversation(conv.id)}
                        className="bg-red-500 dropdown-item p-2 hover:bg-red-400 text-left w-full text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-white">Create your first conversation or sign in to see your stored conversations.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
