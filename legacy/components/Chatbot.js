import { useState } from 'react';
import ChatInput from './ChatInput'; // Import the ChatInput component

const Chatbot = ({ messages, setMessages }) => {
  const [loading, setLoading] = useState(false);

  // const handleSendMessage = async (message) => {
  //   // Update messages to include the user's message
  //   setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: message }]);
  //   setLoading(true);

  //   try {
  //     // Send the user's message to the backend
  //     const response = await fetch('http://localhost:8000/chatbot', {  // Update the URL as necessary
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ message }),
  //     });
  //     const data = await response.json();

  //     // Add the AI's response to the messages
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { sender: 'ai', text: data.response }
  //     ]);
  //   } catch (error) {
  //     console.error("Error fetching response:", error);
  //     // Handle error accordingly
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSendMessage = async (message) => {
    // if (!selectedConversation) return; // Ensure conversation is selected
  
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: message }]);
  
    try {
      const response = await fetch(`http://localhost:8000/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'user', text: message }),
      });
  
      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', text: data.response }
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = (file) => {
    // You can implement file handling logic here if needed
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: `Uploaded: ${file.name}` }
    ]);
  };

  return (
    <div className="border-t border-gray-300 p-4">
      <ChatInput onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} />
    </div>
  );
};

export default Chatbot;

// import { useState } from 'react';
// import ChatInput from './ChatInput'; // Text input for sending messages

// const Chatbot = ({ messages, setMessages }) => {
//   const [loading, setLoading] = useState(false);

//   const handleSendMessage = async (message) => {
//     setMessages(prevMessages => [...prevMessages, { sender: 'user', text: message }]);
//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:8000/chatbot', { 
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message })
//       });

//       const data = await response.json();
//       setMessages(prevMessages => [
//         ...prevMessages, 
//         { sender: 'ai', text: data.response }
//       ]);
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex-1 p-4 overflow-y-auto">
//       {messages.map((msg, index) => (
//         <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
//           <span className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-green-500 text-white' : 'bg-white text-black'}`}>
//             {msg.text}
//           </span>
//         </div>
//       ))}
//       <ChatInput onSendMessage={handleSendMessage} />
//     </div>
//   );
// };

// export default Chatbot;
