"use client";

import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

    return (
      <header className="border-b border-gray-300 shadow h-16">
        <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between px-6 h-full">
          <nav className="flex items-center space-x-4">
            <button
              className="text-blue-500 hover:underline"
              onClick={() => router.push("/chatbots/general")}
            >General</button>
            {/* <button className="text-blue-500 hover:underline">Summarizer</button>
            <button className="text-blue-500 hover:underline">RAG</button> */}
            <span className="text-gray-500">| Summarizer | RAG (In Progress)</span>
            <span className="text-gray-500"></span>
          </nav>

          <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
            Log Out
          </button>
        </div>
      </header>

    );
  };
  
  export default Header;
  