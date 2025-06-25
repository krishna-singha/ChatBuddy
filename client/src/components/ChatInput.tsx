import React, { useState, useRef, useContext } from 'react';
import { Send, Paperclip, Smile, Mic, Image, X } from 'lucide-react';
import { ChatContext } from '../../context/ChatContext';


const ChatInput = () => {
  const { selectedUser, sendMessage, messageSent } = useContext(ChatContext);

  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUploaded, setImageUploaded] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    // If there's an image uploaded
    if (imageUploaded) {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const imageUrl = reader.result as string;

          // Send message with or without text (both or only image)
          sendMessage(trimmedMessage, imageUrl);

          // Clear inputs
          setMessage('');
          setImageUploaded(null);
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        } catch (error) {
          console.error('Error sending image message:', error);
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading image file:', error);
      };

      reader.readAsDataURL(imageUploaded);
    }
    // Only text case
    else if (trimmedMessage !== '') {
      sendMessage(trimmedMessage, '');
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

  if (!selectedUser) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-900/95 backdrop-blur-xl border-t border-cyan-500/20 shadow-inner">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">

        <button
          onClick={() => fileRef.current?.click()}
          type="button"
          className="p-2 rounded-full bg-gray-800/50 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-300 transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/30 cursor-pointer"
        >
          <Image size={20} />
          <input
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImageUploaded(e.target.files[0]);
              }
            }}
            ref={fileRef}
            type="file"
            accept='.jpg, .jpeg, .png'
            id='image'
            className='hidden'
          />
        </button>

        <div className="flex flex-col justify-center relative w-full bg-gray-800/50 border border-cyan-500/50 rounded-2xl p-2">
          {imageUploaded && (
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg w-fit relative mb-2">
              <img src={URL.createObjectURL(imageUploaded)} alt="chat-image" className='w-[5rem] rounded-2xl' />
              <button
                onClick={() => setImageUploaded(null)}
                className="text-cyan-400 hover:text-white transition-colors duration-200 absolute top-[0.2rem] right-[0.2rem] rounded-full bg-gray-700/50 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-2 rounded-2xl text-white placeholder-gray-400 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent"
            rows={1}
            maxLength={500}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        <button
          type="submit"
          disabled={messageSent}
          className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {messageSent ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
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