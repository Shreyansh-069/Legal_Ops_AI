import React, { useState, useRef } from 'react';

export default function ChatInput({ onSubmit, isLoading, input, setInput }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;
    
    onSubmit(input, selectedFile);
    setInput('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please upload standard PDF document formats only.");
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-2.5 pt-4 border-t border-[#dcd6c5]">
      {selectedFile && (
        <div className="flex items-center gap-2 bg-[#faf9f6] border border-[#dcd6c5] rounded px-3 py-1 text-xs text-[#4a3728] font-mono font-semibold w-fit animate-fade-in">
          <span>Attachment: {selectedFile.name}</span>
          <button 
            type="button" 
            onClick={() => { setSelectedFile(null); fileInputRef.current.value = ''; }}
            className="hover:text-red-650 font-bold ml-1 cursor-pointer transition-colors"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center bg-[#faf9f6] border border-[#dcd6c5] rounded-lg px-3.5 py-2.5 focus-within:border-[#4a3728] transition-colors">
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="p-1.5 text-[#8a7c6e] hover:text-[#4a3728] transition-colors cursor-pointer mr-2"
          title="Upload reference PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedFile ? "Ask a question about this PDF..." : "Ask a question or explain your situation..."}
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm text-[#4a3728] placeholder-[#8a7c6e] focus:outline-none py-1"
        />

        <button
          type="submit"
          disabled={isLoading || (!input.trim() && !selectedFile)}
          className="ml-3 bg-[#4a3728] hover:bg-[#604a39] text-white rounded-lg text-xs font-mono font-semibold tracking-wider px-4 py-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer uppercase"
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </form>
  );
}