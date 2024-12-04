import { useState } from 'react';

const ChatInput = ({ onSendMessage, onFileUpload }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      onSendMessage(inputValue);  // Call parent function to send the message
      setInputValue('');  // Clear input field after sending
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);  // Call parent function to handle file upload
    }
  };

  return (
    <div className="flex items-center">
      {/* File Upload Button */}
      <label className="flex items-center justify-center px-4 py-2 bg-gray-200 border border-gray-300 rounded-l-lg cursor-pointer hover:bg-gray-300 transition">
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        Upload
      </label>

      {/* Text Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
        placeholder="Type your message..."
        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
      />

      {/* Send Button */}
      <button
        onClick={handleSendMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;

// import { useState } from 'react';

// const ChatInput = ({ onSendMessage }) => {
//   const [input, setInput] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (input.trim()) {
//       onSendMessage(input);
//       setInput('');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="border-t border-gray-300 p-4">
//       <input
//         type="text"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         placeholder="Type a message..."
//         className="w-full p-2 border rounded"
//       />
//     </form>
//   );
// };

// export default ChatInput;
