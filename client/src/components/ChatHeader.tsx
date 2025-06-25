import { useContext, useState } from 'react';
import { Phone, Video, MoreVertical, Search } from 'lucide-react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import DEFAULT_AVATAR from '../assets/defaultAvatar';
import clsx from 'clsx';

interface ChatHeaderProps {
  setShowInfo: (value: boolean) => void;
  showInfo: boolean;
}


const ChatHeader: React.FC<ChatHeaderProps> = ({showInfo, setShowInfo}) => {
  const { selectedUser } = useContext(ChatContext);
  const { onlineUsers } = useContext(AuthContext);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  const getStatusColor = () => {
    return clsx(
      'w-3.5 h-3.5 rounded-full border-2 border-gray-900 absolute -bottom-1 -right-1',
      isOnline ? 'bg-green-400 shadow-green-400/50' : 'bg-gray-500 shadow-gray-400/40'
    );
  };

  const actionButtons = [
    { icon: <Search size={18} />, color: 'hover:text-cyan-300 hover:bg-cyan-500/10' },
    { icon: <Phone size={18} />, color: 'hover:text-green-300 hover:bg-green-500/10' },
    { icon: <Video size={18} />, color: 'hover:text-blue-300 hover:bg-blue-500/10' },
    { icon: <MoreVertical size={18} />, color: 'hover:text-cyan-300 hover:bg-cyan-500/10', onClick: () => setShowInfo(!showInfo) },
  ];

  return (
    <div className="px-6 py-4 bg-gray-950/90 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between shadow-sm">
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <img
            src={selectedUser.avatar || DEFAULT_AVATAR}
            alt={selectedUser.name}
            className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30 shadow-md group-hover:scale-105 transition-transform"
          />
          <div className={getStatusColor()} />
        </div>
        <div>
          <h2 className="text-white text-base font-semibold">{selectedUser.name}</h2>
          {/* You can uncomment this later if needed */}
          {/* <p className="text-sm text-gray-400">{selectedUser.email}</p> */}
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        {actionButtons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.onClick}
            className={clsx(
              'p-2 rounded-xl bg-gray-800/50 text-gray-400 transition-all hover:scale-105 shadow-sm cursor-pointer',
              btn.color
            )}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatHeader;