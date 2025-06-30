import { useRef, useEffect, useContext } from 'react';
import { ChatHeader, ChatSidebar, MessageBubble, ChatInput, DateSeparator } from '../components';
import { WelcomeScreen } from '../components';
import { ChatContext } from '../context/chat/ChatContext';
import { AuthContext } from '../context/auth/AuthContext';

import type { IMessage } from '../interfaces/context';

function Chat() {

  const { 
    selectedConversation, 
    getMessages, 
    messages, 
    filteredMessages,
    typingUsers, 
    markMessagesAsSeen 
  } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);

  const scrollEnd = useRef<HTMLDivElement | null>(null);

  // Group messages by date
  const groupMessagesByDate = (messages: IMessage[]) => {
    const groups: { [key: string]: IMessage[] } = {};
    
    messages
      .filter((message: IMessage) => message.sender)
      .forEach((message: IMessage) => {
        const dateKey = new Date(message.createdAt || '').toDateString();
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(message);
      });
    
    // Sort messages within each date group by creation time
    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].sort((a, b) => 
        new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
      );
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(filteredMessages);

  useEffect(() => {
    if (selectedConversation) {
      getMessages(selectedConversation._id);
      // Mark messages as seen when conversation is selected
      markMessagesAsSeen(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Component for showing typing indicator
  const TypingIndicator = ({ conversationId }: { conversationId: string }) => {
    const currentTypers = typingUsers[conversationId] || [];
    
    if (currentTypers.length === 0) return null;
    
    return (
      <div className="flex items-center space-x-2 mb-3 animate-pulse">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {/* <span className="text-sm text-gray-400">
          {currentTypers.length === 1 
            ? `${currentTypers[0]} is typing...`
            : `${currentTypers.length} people are typing...`
          }
        </span> */}
      </div>
    );
  };


  return (
    <div className="max-h-screen bg-gray-950 text-white relative flex">
      {/* Background Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <ChatSidebar />
      {selectedConversation ? (
        <>
          <div className="flex-1 flex flex-col bg-gray-900/80 backdrop-blur-xl border-l border-cyan-500/10">
            <ChatHeader />

            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
              {Object.entries(messageGroups)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([dateKey, dayMessages]) => (
                  <div key={dateKey}>
                    <DateSeparator date={dateKey} />
                    {dayMessages.map((message: IMessage) => {
                      const isOwn = Boolean(
                        message.sender &&
                        authUser?._id &&
                        message.sender._id?.toString() === authUser._id.toString()
                      );

                      return (
                        <div
                          key={message._id}
                          className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <MessageBubble isOwn={isOwn} messages={message} />
                        </div>
                      );
                    })}
                  </div>
                ))}

              {/* Typing Indicator */}
              {selectedConversation && (
                <TypingIndicator conversationId={selectedConversation._id} />
              )}

              <div ref={scrollEnd} />
            </div>

            <ChatInput />
          </div>
        </>
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
}

export default Chat;