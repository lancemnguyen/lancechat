"use client";

import { useEffect } from "react";
import DemoChatbot from '../../../components/DemoChatbot';

const DemoPage = () => {
  useEffect(() => {
    // Set userType to "demo" in localStorage when the demo page is accessed
    localStorage.setItem("userType", "demo");
  }, []);
  
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-full max-w-3xl p-8 relative">
        <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text">
          Chatbot Demo
        </h1>
        <div className="relative">
          <DemoChatbot />
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
