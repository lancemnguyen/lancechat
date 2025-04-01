"use client";

import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Header = () => {
  const router = useRouter();
  const [isDemoUser, setIsDemoUser] = useState(null);  // Start with null to avoid flickering
  const [user, setUser] = useState(null);

  // Check if the user is logged in and if they are a demo user
  useEffect(() => {
    // check auth user
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // set regular user state
        setUser(user);
        setIsDemoUser(false);
      } else {
        // demo flag
        const userType = localStorage.getItem("userType");
        setIsDemoUser(userType === "demo");
      }
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDemoUser(false);  // Immediately update the state to prevent Home button
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleHomeRedirect = () => {
    router.push("/");  // Redirect to the login page (or home page)
  };

  // If isDemoUser is null, it means we're still checking, so don't render anything
  if (isDemoUser === null) return null;

  return (
    <header className="border-b border-gray-300 shadow h-16">
      <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between px-6 h-full">
        <nav className="flex items-center space-x-4">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => router.push("/chatbots/general")}
          >
            General
          </button>
          <span className="text-gray-500">|</span>
          <button
            className="text-blue-500 hover:underline"
            onClick={() => router.push("/chatbots/summarizer")}
          >
            Summarizer
          </button>
          {/* <button className="text-blue-500 hover:underline">RAG</button> */}
          <span className="text-gray-500">| RAG (In Progress)</span>
        </nav>

        {/* Conditional rendering based on whether the user is a demo user */}
        {isDemoUser ? (
          <button
            onClick={handleHomeRedirect}
            className="bg-green-500 text-white p-2 rounded"
          >
            Home
          </button>
        ) : (
          <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
            Log Out
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
