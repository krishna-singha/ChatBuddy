import { CheckCheck, Check } from 'lucide-react';
import type { IMessage } from '../../interfaces/context';
import { useContext } from 'react';
import { AuthContext } from '../../context/auth/AuthContext';
import { ChatContext } from '../../context/chat/ChatContext';

interface MessageBubbleProps {
  isOwn: boolean;
  messages: IMessage;
}

const MessageBubble = ({ isOwn, messages }: MessageBubbleProps) => {
  const { authUser } = useContext(AuthContext);
  const { selectedConversation } = useContext(ChatContext);

  const getStatusIcon = () => {
    if (!isOwn || !selectedConversation) return null;
    
    // Count how many people have seen the message (excluding sender)
    const seenByOthers = messages.seenBy.filter(user => user._id !== authUser?._id);
    const totalParticipants = selectedConversation.participants.length - 1; // Exclude sender
    
    if (seenByOthers.length === totalParticipants && totalParticipants > 0) {
      // All participants have seen the message
      return (
        <div className="flex items-center gap-1" title="Seen by all">
          <CheckCheck size={16} className="text-green-400 font-bold" />
        </div>
      );
    } else if (seenByOthers.length > 0) {
      // Some participants have seen the message
      return (
        <div className="flex items-center gap-1" title={`Seen by ${seenByOthers.length}/${totalParticipants}`}>
          <CheckCheck size={16} className="text-blue-400 font-bold" />
          {seenByOthers.length > 1 && (
            <span className="text-xs text-blue-400 font-bold">{seenByOthers.length}</span>
          )}
        </div>
      );
    } else {
      // Message delivered but not seen
      return (
        <div title="Delivered">
          <Check size={16} className="text-gray-300 font-bold" />
        </div>
      );
    }
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '';
    const messageDate = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(messageDate);
  };

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} w-full`}>
      <div
        className={`max-w-xs md:max-w-sm px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${isOwn
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/20 rounded-br-md'
            : 'bg-gray-800 text-white border border-gray-600/50 shadow-lg shadow-gray-900/50 rounded-bl-md'
          }`}
      >
        {messages.attachments?.url && (
          <img 
            src={messages.attachments.url} 
            alt="attachment" 
            className='w-[15rem] mb-2 rounded-lg object-cover' 
          />
        )}
        <p className="leading-relaxed whitespace-pre-wrap">{messages.content}</p>
      </div>
      
      {/* Time and Status - Outside the bubble */}
      <div className={`flex items-center gap-2 text-xs mt-1 px-2 ${
        isOwn ? 'text-gray-300 flex-row-reverse' : 'text-gray-400'
      }`}>
        <span className="font-medium opacity-80">{formatTime(messages.createdAt)}</span>
        {isOwn && (
          <div className="flex items-center bg-gray-800/50 rounded-full px-2 py-1">
            {getStatusIcon()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
