"use client";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { ConversationProvider } from "../../context/ConversationContext";

const ChatbotLayout = ({ children }) => {
  return (
    <ConversationProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 p-4 overflow-y-auto">{children}</div>
        </div>
      </div>
    </ConversationProvider>
  );
};

export default ChatbotLayout;
