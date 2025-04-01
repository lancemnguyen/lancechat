"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import { useConversations } from "../../../context/ConversationContext";
import Summarizer from "../../../components/Summarizer";

const ChatbotPage = () => {
  const { addConversation } = useConversations();
  const [isClient, setIsClient] = useState(false);  // Track if we're on the client
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Track if user is authenticated
  const [hasStartedChat, setHasStartedChat] = useState(false);  // Track if user has sent first message
  const router = useRouter();

  // Check if the component has mounted client-side
  useEffect(() => {
    setIsClient(true);  // Set to true after the component mounts
  }, []);

  // Authentication check - only run after the component has mounted on the client
  useEffect(() => {
    if (!isClient) return;  // Skip if not mounted on the client

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");  // Redirect to login if not authenticated
      } else {
        setIsAuthenticated(true);
      }
    });

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();
  }, [isClient, router]);  // Run once after client mount and router is available

    const handleFirstMessage = (newConversation) => {
      // console.log('New Conversation:', newConversation);
      if (!hasStartedChat) {
        addConversation(newConversation); // Add the single new conversation
        setHasStartedChat(true); // Mark chat as started
      }
    };
    

  // Render loading state or redirecting page while waiting for client-side mount or authentication
  if (!isClient || !isAuthenticated) return <div>Loading...</div>;

  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-full max-w-3xl p-8 relative">
        <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text">
          Summarize an Article
        </h1>
        <div className="relative">
          <Summarizer onFirstMessage={handleFirstMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
