import { useContext, useState } from 'react';
import { MoreVertical, Search, Users, LogOut, Trash2 } from 'lucide-react';
import { ChatContext } from '../../context/chat/ChatContext';
import { AuthContext } from '../../context/auth/AuthContext';
import DEFAULT_AVATAR from '../../assets/defaultAvatar';
import { UserInfoModal, GroupInfoModal } from '../modals';
import clsx from 'clsx';

interface ChatHeaderProps {
  // No props needed anymore as we use internal modal state
}


const ChatHeader: React.FC<ChatHeaderProps> = () => {
  const { selectedConversation, searchQuery, setSearchQuery, leaveGroup, deleteConversation } = useContext(ChatContext);
  const { onlineUsers, authUser } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!selectedConversation) return null;

  const isGroupChat = selectedConversation.isGroup;
  
  // Get display information based on chat type
  const getDisplayInfo = () => {
    if (isGroupChat) {
      return {
        name: selectedConversation.name || 'Group Chat',
        avatar: null, // We'll use an icon for groups
        subtitle: `${selectedConversation.participants.length} members`,
        isOnline: false // Groups don't have online status
      };
    } else {
      const otherParticipant = selectedConversation.participants.find(
        participant => participant._id !== authUser?._id
      );
      
      if (!otherParticipant) return null;
      
      const isOnline = onlineUsers.includes(otherParticipant._id);
      return {
        name: otherParticipant.name,
        avatar: otherParticipant.avatar || DEFAULT_AVATAR,
        subtitle: isOnline ? 'Online' : 'Offline',
        isOnline
      };
    }
  };

  const displayInfo = getDisplayInfo();
  if (!displayInfo) return null;

  const getStatusColor = () => {
    if (isGroupChat) return '';
    return clsx(
      'w-3.5 h-3.5 rounded-full border-2 border-gray-900 absolute -bottom-1 -right-1',
      displayInfo.isOnline ? 'bg-green-400 shadow-green-400/50' : 'bg-gray-500 shadow-gray-400/40'
    );
  };

  return (
    <div className="px-6 py-4 bg-gray-950/90 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between shadow-sm">
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          {isGroupChat ? (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Users size={24} className="text-cyan-400" />
            </div>
          ) : (
            <>
              <img
                src={displayInfo.avatar || DEFAULT_AVATAR}
                alt={displayInfo.name}
                className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30 shadow-md group-hover:scale-105 transition-transform"
              />
              <div className={getStatusColor()} />
            </>
          )}
        </div>
        <div>
          <h2 className="text-white text-base font-semibold">{displayInfo.name}</h2>
          <p className="text-sm text-gray-400">{displayInfo.subtitle}</p>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Search Toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={clsx(
            "p-2 rounded-xl transition-all hover:scale-105 shadow-sm cursor-pointer",
            showSearch 
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
              : "bg-gray-800/50 text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10"
          )}
        >
          <Search size={18} />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-xl bg-gray-800/50 text-gray-400 transition-all hover:scale-105 shadow-sm cursor-pointer hover:text-cyan-300 hover:bg-cyan-500/10"
          >
            <MoreVertical size={18} />
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-12 w-48 bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-lg z-50">
              <div className="py-2">
                <button
                  onClick={() => {
                    if (isGroupChat) {
                      setShowGroupInfoModal(true);
                    } else {
                      setShowUserInfoModal(true);
                    }
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-3"
                >
                  <Users size={16} />
                  {isGroupChat ? 'Group Info' : 'User Info'}
                </button>
                
                {isGroupChat && (
                  <button
                    onClick={async () => {
                      try {
                        // Check if user is admin
                        const isAdmin = typeof selectedConversation.admin === 'object' 
                          ? selectedConversation.admin._id === authUser?._id
                          : selectedConversation.admin === authUser?._id;
                        
                        if (isAdmin) {
                          // Admin should delete the group, not leave
                          setShowConfirmDelete(true);
                        } else {
                          // Regular member leaves the group
                          await leaveGroup(selectedConversation._id);
                        }
                        setShowDropdown(false);
                      } catch (error) {
                        // Error is already handled in the context
                        setShowDropdown(false);
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3"
                  >
                    <LogOut size={16} />
                    {(() => {
                      const isAdmin = typeof selectedConversation.admin === 'object' 
                        ? selectedConversation.admin._id === authUser?._id
                        : selectedConversation.admin === authUser?._id;
                      return isAdmin ? 'Delete Group' : 'Leave Group';
                    })()}
                  </button>
                )}
                
                {!isGroupChat && (
                  <button
                    onClick={() => {
                      setShowConfirmDelete(true);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3"
                  >
                    <Trash2 size={16} />
                    Delete Chat
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Search Input */}
      {showSearch && (
        <div className="px-6 py-3 bg-gray-950/90 backdrop-blur-xl border-b border-cyan-500/20">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Modals */}
      <UserInfoModal 
        isOpen={showUserInfoModal} 
        onClose={() => setShowUserInfoModal(false)} 
      />
      <GroupInfoModal 
        isOpen={showGroupInfoModal} 
        onClose={() => setShowGroupInfoModal(false)} 
      />

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Delete {isGroupChat ? 'Group' : 'Chat'}
              </h3>
              <p className="text-gray-400">
                Are you sure you want to delete this {isGroupChat ? 'group' : 'chat'}? This action cannot be undone and all messages will be permanently lost.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteConversation(selectedConversation._id);
                    setShowConfirmDelete(false);
                  } catch (error) {
                    // Error is already handled in the context
                    setShowConfirmDelete(false);
                  }
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;