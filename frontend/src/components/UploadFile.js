import { useState } from 'react';

export default function UploadFile() {
  const [fileName, setFileName] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
        Upload File
      </label>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
      {fileName && (
        <p className="mt-4 text-sm text-gray-700">Uploaded File: {fileName}</p>
      )}
    </div>
  );
}
