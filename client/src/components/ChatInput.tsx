import React, { useState, useRef, useContext } from 'react';
import { Send, Paperclip, Smile, Mic, Image } from 'lucide-react';
import { ChatContext } from '../../context/ChatContext';


const ChatInput = () => {
  const { selectedUser, sendMessage } = useContext(ChatContext);

  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  if (!selectedUser) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-900/95 backdrop-blur-xl border-t border-cyan-500/20 shadow-inner">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        {/* <button
          type="button"
          className="p-2 rounded-full bg-gray-800/50 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-300 transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/30"
        >
          <Paperclip size={20} />
        </button> */}

        <button
          type="button"
          className="p-2 rounded-full bg-gray-800/50 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-300 transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/30"
        >
          <Image size={20} />
        </button>

        <div className="flex items-center relative w-full">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200 resize-none scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />

          {/* <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-yellow-400 transition-all duration-200"
          >
            <Smile size={18} />
          </button> */}
        </div>

        <button
          type="submit"
          className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>

        {/* {message.trim() ? (
          <button
            type="submit"
            disabled={disabled}
            className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-full transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-400 text-white animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-gray-800/50 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-300 hover:shadow-md hover:shadow-cyan-500/20'
            }`}
          >
            <Mic size={20} />
          </button>
        )} */}
      </form>

      {isRecording && (
        <div className="mt-2 flex items-center justify-center space-x-2 text-red-400">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm">Recording...</span>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;