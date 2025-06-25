// import {
//   Check,
//   CheckCheck,
// } from 'lucide-react';
import type { Message } from '../pages/Chat';


interface MessageBubbleProps {
  isOwn: boolean;
  messages: Message;
}

const MessageBubble = ({ isOwn, messages }: MessageBubbleProps) => {


  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'sending':
  //       return <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />;
  //     case 'sent':
  //       return <Check size={14} className="text-gray-400" />;
  //     case 'delivered':
  //       return <CheckCheck size={14} className="text-gray-400" />;
  //     case 'read':
  //       return <CheckCheck size={14} className="text-cyan-400" />;
  //     default:
  //       return null;
  //   }
  // };

  // const formatTime = (date: Date) =>
  //   new Intl.DateTimeFormat('en-US', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //   }).format(date);

  return (
    <div className="flex flex-col items-start">
      <div
        className={`relative max-w-xs md:max-w-sm px-4 py-2 rounded-2xl text-sm transition-all duration-200 ${isOwn
            ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
            : 'bg-gray-800/60 text-white border border-gray-700/30 shadow-md'
          }`}
      >
        {messages.image && <img src={messages.image} alt="img" className='w-[15rem]' />}
        <p className="leading-relaxed whitespace-pre-wrap">{messages.text}</p>
      </div>

    </div>
  );
};

export default MessageBubble;
