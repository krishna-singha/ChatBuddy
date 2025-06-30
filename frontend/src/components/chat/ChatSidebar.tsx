import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Settings, X, Users, User } from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import { ChatContext } from '../../context/chat/ChatContext';
import { Logo } from '../ui';
import DEFAULT_AVATAR from '../../assets/defaultAvatar';
import { useNavigate } from 'react-router-dom';

const ChatSidebar = () => {
  const navigate = useNavigate();
  const {
    conversations,
    unseenMessages,
    startNewGroupChat,
    createGroupChat,
    getAvailableUsers,
    selectedConversation,
    setSelectedConversation,
  } = useContext(ChatContext);

  const { onlineUsers, authUser } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupEmails, setGroupEmails] = useState<string[]>(['']);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState<{ [key: number]: boolean }>({});

  // Fetch available users when modal opens
  useEffect(() => {
    if (isModalOpen && isGroupChat) {
      getAvailableUsers().then(setAvailableUsers);
    }
  }, [isModalOpen, isGroupChat, getAvailableUsers]);

  const filteredConversations =
    searchQuery === '' || !authUser
      ? conversations
      : conversations.filter((conversation) => {
          if (conversation.isGroup) {
            // For group chats, search in group name
            return conversation.name?.toLowerCase().includes(searchQuery.toLowerCase());
          } else {
            // For individual chats, search in participant names
            return conversation.participants.find(
              (p) =>
                p._id !== authUser._id &&
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
        });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-400 shadow-green-400/50';
      case 'away':
        return 'bg-yellow-300 shadow-yellow-300/50';
      case 'busy':
        return 'bg-red-400 shadow-red-400/50';
      default:
        return 'bg-gray-500 shadow-gray-400/40';
    }
  };

  const handleAddEmail = () => {
    setGroupEmails([...groupEmails, '']);
  };

  const handleRemoveEmail = (index: number) => {
    if (groupEmails.length > 1) {
      setGroupEmails(groupEmails.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...groupEmails];
    updatedEmails[index] = value;
    setGroupEmails(updatedEmails);
  };

  const handleCreateChat = async () => {
    if (isGroupChat) {
      // Handle group chat creation
      const validEmails = groupEmails.filter(email => email.trim() !== '');
      if (groupName.trim() && validEmails.length > 0) {
        await createGroupChat(groupName.trim(), validEmails);
        resetModal();
      }
    } else {
      // Handle individual chat creation
      if (newUserEmail.trim()) {
        await startNewGroupChat(newUserEmail.trim());
        resetModal();
      }
    }
  };

  const resetModal = () => {
    setNewUserEmail('');
    setGroupName('');
    setGroupEmails(['']);
    setIsGroupChat(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-80 h-screen bg-gradient-to-b from-gray-950/90 to-gray-900/90 backdrop-blur-2xl border-r border-cyan-600/30 flex flex-col shadow-[0_0_30px_0_rgba(0,255,255,0.05)]"
      >
        {/* Header */}
        <div className="px-5 py-6 border-b border-cyan-500/20">
          <Logo size="medium" className="mb-5" />
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-800/60 text-sm rounded-xl text-white placeholder-gray-400 border border-gray-700/40 focus:border-cyan-500 focus:ring focus:ring-cyan-400/40 transition-all duration-200"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-xl bg-gradient-to-br from-cyan-600/20 to-cyan-800/30 hover:scale-105 text-cyan-300 hover:text-white transition-all hover:shadow-md hover:shadow-cyan-500/30 cursor-pointer"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          {filteredConversations.map((conversation) => {
            if (!authUser) return null;

            // Handle group chats vs individual chats
            const isGroupChat = conversation.isGroup;
            let displayName = '';
            let displayAvatar = '';
            let isOnline = false;

            if (isGroupChat) {
              displayName = conversation.name || 'Group Chat';
              displayAvatar = DEFAULT_AVATAR; // You could create a group avatar placeholder
            } else {
              const otherUser = conversation.participants.find(
                (p) => p._id !== authUser._id
              );
              if (!otherUser) return null;
              displayName = otherUser.name;
              displayAvatar = otherUser.avatar || DEFAULT_AVATAR;
              isOnline = onlineUsers.includes(otherUser._id);
            }

            return (
              <motion.div
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation)}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`group p-3 mb-3 mx-3 rounded-xl cursor-pointer bg-gray-800/60 backdrop-blur-md shadow-sm hover:shadow-md hover:shadow-cyan-500/10 transition-all duration-200 ${selectedConversation?._id === conversation._id
                    ? 'border-2 border-cyan-500/30'
                    : 'border border-transparent hover:border-cyan-600/30'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {isGroupChat ? (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <Users size={20} className="text-cyan-400" />
                      </div>
                    ) : (
                      <>
                        <img
                          src={displayAvatar}
                          alt={displayName}
                          className="w-11 h-11 rounded-full object-cover border border-gray-700 group-hover:scale-105 transition-transform"
                        />
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-950 ${getStatusColor(
                            isOnline ? 'online' : 'offline'
                          )} animate-pulse`}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-cyan-300 font-medium truncate flex items-center gap-2">
                        {displayName}
                        {isGroupChat && (
                          <span className="text-xs text-gray-500">
                            ({conversation.participants.length})
                          </span>
                        )}
                      </h3>
                      {unseenMessages[conversation._id] > 0 && (
                        <div className="ml-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg shadow-cyan-500/30 animate-pulse">
                          {unseenMessages[conversation._id]}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-300 truncate max-w-[180px]">
                        {conversation.lastMessage ? (
                          conversation.lastMessage.content ||
                          (conversation.lastMessage.attachments ? '📎 Image' : 'No messages yet')
                        ) : (
                          'Start a conversation!'
                        )}
                      </p>
                      {conversation.lastMessage && conversation.lastMessage.createdAt && (
                        <span className="text-xs text-gray-500 ml-2 shrink-0">
                          {(() => {
                            const messageDate = new Date(conversation.lastMessage.createdAt);
                            const now = new Date();
                            const diffTime = Math.abs(now.getTime() - messageDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays === 1) {
                              return messageDate.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              });
                            } else if (diffDays <= 7) {
                              return messageDate.toLocaleDateString([], { weekday: 'short' });
                            } else {
                              return messageDate.toLocaleDateString([], { 
                                month: 'short', 
                                day: 'numeric' 
                              });
                            }
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-[1.57rem] border-t border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <img
                src={authUser?.avatar || DEFAULT_AVATAR}
                alt={authUser?.name || 'User'}
                className="w-12 h-12 rounded-full border-2 border-cyan-400 shadow-md group-hover:scale-105 transition-transform"
              />
              {authUser?._id && onlineUsers.includes(authUser._id) && (
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-950 ${getStatusColor('online')} animate-pulse`}
                />
              )}
            </div>
            <div>
              <h2 className="text-white text-sm font-semibold leading-tight truncate">
                {authUser?.name}
              </h2>
              <p className="text-cyan-400 text-xs capitalize truncate">
                {authUser?._id && onlineUsers.includes(authUser._id) ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-700 hover:scale-105 text-cyan-400 hover:text-white transition-all hover:shadow-md hover:shadow-cyan-500/30 cursor-pointer"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </motion.aside>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] p-4"
          onClick={resetModal}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '85vh', overflowY: 'auto' }}
          >
            <button
              onClick={resetModal}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-white text-xl font-semibold mb-6 pr-12">
              {isGroupChat ? 'Create Group Chat' : 'Start New Chat'}
            </h2>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setIsGroupChat(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    !isGroupChat 
                      ? 'bg-cyan-600 text-white shadow-md' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <User size={16} />
                  <span className="text-sm font-medium">Individual</span>
                </button>
                <button
                  onClick={() => setIsGroupChat(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    isGroupChat 
                      ? 'bg-cyan-600 text-white shadow-md' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users size={16} />
                  <span className="text-sm font-medium">Group</span>
                </button>
              </div>
            </div>

            {/* Individual Chat Form */}
            {!isGroupChat && (
              <div className="space-y-4">
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Enter user's email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Group Chat Form */}
            {isGroupChat && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Add members:</label>
                  {groupEmails.map((email, index) => (
                    <div key={index} className="relative">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              handleEmailChange(index, e.target.value);
                              setShowUserSuggestions({ ...showUserSuggestions, [index]: e.target.value.length > 0 });
                            }}
                            onFocus={() => setShowUserSuggestions({ ...showUserSuggestions, [index]: true })}
                            onBlur={() => setTimeout(() => setShowUserSuggestions({ ...showUserSuggestions, [index]: false }), 200)}
                            placeholder="Enter email"
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          />
                          
                          {/* User Suggestions Dropdown */}
                          {showUserSuggestions[index] && email.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                              {availableUsers
                                .filter(user => 
                                  user.email.toLowerCase().includes(email.toLowerCase()) ||
                                  user.name.toLowerCase().includes(email.toLowerCase())
                                )
                                .slice(0, 5)
                                .map(user => (
                                  <button
                                    key={user._id}
                                    onClick={() => {
                                      handleEmailChange(index, user.email);
                                      setShowUserSuggestions({ ...showUserSuggestions, [index]: false });
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
                                  >
                                    <img
                                      src={user.avatar || DEFAULT_AVATAR}
                                      alt={user.name}
                                      className="w-6 h-6 rounded-full"
                                    />
                                    <div>
                                      <div className="text-white text-sm">{user.name}</div>
                                      <div className="text-gray-400 text-xs">{user.email}</div>
                                    </div>
                                  </button>
                                ))
                              }
                              {availableUsers.filter(user => 
                                user.email.toLowerCase().includes(email.toLowerCase()) ||
                                user.name.toLowerCase().includes(email.toLowerCase())
                              ).length === 0 && (
                                <div className="px-4 py-2 text-gray-400 text-sm">No users found</div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {groupEmails.length > 1 && (
                          <button
                            onClick={() => handleRemoveEmail(index)}
                            className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddEmail}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add another member
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={resetModal}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChat}
                disabled={
                  isGroupChat 
                    ? !groupName.trim() || !groupEmails.some(email => email.trim())
                    : !newUserEmail.trim()
                }
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGroupChat ? 'Create Group' : 'Start Chat'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;
