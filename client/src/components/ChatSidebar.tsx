import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Settings } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import DEFAULT_AVATAR from '../assets/defaultAvatar';
import { useNavigate } from "react-router-dom"

const ChatSidebar = () => {
  const navigate = useNavigate();
  const { getUsers, users, setSelectedUser, unseenMessages, latestMessages } = useContext(ChatContext);
  const { onlineUsers, authUser } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = searchQuery === ''
    ? users
    : users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

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


  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-80 h-screen bg-gradient-to-b from-gray-950/90 to-gray-900/90 backdrop-blur-2xl border-r border-cyan-600/30 flex flex-col shadow-2xl shadow-cyan-500/10"
    >
      {/* Header */}
      <div className="px-5 py-6 border-b border-cyan-500/20">
        <h1 className="text-white text-2xl font-extrabold tracking-wide mb-5">ChatBuddy</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-800/60 text-sm rounded-xl text-white placeholder-gray-400 border border-gray-700/40 focus:border-cyan-500 focus:ring focus:ring-cyan-400 transition-all duration-200"
            />
          </div>
          <button
            className="p-2 rounded-xl bg-gradient-to-br from-cyan-600/20 to-cyan-800/30 hover:scale-105 text-cyan-300 hover:text-white transition-all hover:shadow-md hover:shadow-cyan-500/30 cursor-pointer"
            title="New Chat"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
        {filteredUsers.map((user) => (
          <motion.div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`group p-3 mb-3 mx-3 rounded-xl cursor-pointer bg-gray-800/60 backdrop-blur-md shadow-sm hover:shadow-md hover:shadow-cyan-500/10 transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={user.avatar || DEFAULT_AVATAR}
                  alt={user.name}
                  className="w-11 h-11 rounded-xl object-cover border border-gray-700 group-hover:scale-105 transition-transform"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-950 ${getStatusColor(
                    onlineUsers.includes(user._id) ? 'online' : 'offline'
                  )} shadow-sm`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h3 className="text-white font-medium truncate">{user.name}</h3>
                </div>
                <div>
                  <p className="text-sm text-gray-300 truncate">
                    {latestMessages[user._id] ? latestMessages[user._id] : "Start a conversation!"}
                  </p>
                </div>
              </div>
              {unseenMessages[user._id] > 0 && (
                <div className="ml-2 bg-cyan-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unseenMessages[user._id]}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer - Current User */}
      <div className="p-4 border-t border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img
              src={authUser?.avatar || DEFAULT_AVATAR}
              alt={authUser?.name || 'User'}
              className="w-10 h-10 rounded-xl border-2 border-cyan-400 shadow-lg shadow-cyan-400/30 group-hover:scale-105 transition-transform"
            />
            {authUser?._id && onlineUsers.includes(authUser._id) && (
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-950 ${getStatusColor(
                  onlineUsers.includes(authUser._id) ? 'online' : 'offline'
                )}`}
              />
            )}
          </div>
          <div>
            <h2 className="text-white text-sm font-semibold leading-tight">{authUser?.name}</h2>
            <p className="text-cyan-400 text-xs capitalize">
              {authUser?._id && onlineUsers.includes(authUser._id) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="p-2 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-700 hover:scale-105 text-cyan-400 hover:text-white transition-all hover:shadow-md hover:shadow-cyan-500/30 cursor-pointer"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </motion.aside>
  );
};

export default ChatSidebar;
