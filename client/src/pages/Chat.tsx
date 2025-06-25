import { useRef, useEffect, useContext, useState } from 'react';
import ChatHeader from '../components/ChatHeader';
import ChatSidebar from '../components/ChatSidebar';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import ChatUserDetails from '../components/ChatUserDetails';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  seen: boolean;
  // type: 'text' | 'image' | 'file';
}

function Chat() {

  const { selectedUser, getMessages, messages } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);

  const scrollEnd = useRef<HTMLDivElement | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  return (
    <div className="max-h-screen bg-gray-950 text-white relative flex">
      {/* Background Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <ChatSidebar />
      {selectedUser ? (
        <>
        <div className="flex-1 flex flex-col bg-gray-900/80 backdrop-blur-xl border-l border-cyan-500/10">
          <ChatHeader showInfo={showInfo} setShowInfo={setShowInfo} />

          <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
            {messages.map((message: Message) => {
              const isOwn = message.senderId === authUser?._id;

              return (
                <div key={message._id} className={`flex items-end space-x-2 mb-5 ${isOwn ? "justify-end" : "justify-start"} `}>
                  <MessageBubble isOwn={isOwn} message={message.text} timestamp={message.timestamp} />
                </div>
              )
            })}
            <div ref={scrollEnd} />
          </div>

          <ChatInput />
        </div>
        {showInfo && <ChatUserDetails />}
        </>
      ) : (
        <div className='flex items-center justify-center flex-1 bg-gray-900/60 backdrop-blur-xl'>
          <div className='text-3xl font-bold'>ChatBuddy</div>
        </div>
      )}
    </div>
  );
}

export default Chat;