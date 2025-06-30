import { useContext } from 'react';
import { ChatContext } from '../../context/chat/ChatContext';
import { AuthContext } from '../../context/auth/AuthContext';
import { Trash, ShieldOff } from 'lucide-react';
import DEFAULT_AVATAR from '../../assets/defaultAvatar';

const ChatUserDetails = () => {
  const { selectedConversation, setSelectedConversation } = useContext(ChatContext);
  const { onlineUsers, authUser } = useContext(AuthContext);

  if (!selectedConversation || selectedConversation.isGroup) return null;

  // Get the other participant (not the current user)
  const otherParticipant = selectedConversation.participants.find(
    participant => participant._id !== authUser?._id
  );

  if (!otherParticipant) return null;

  const isOnline = onlineUsers.includes(otherParticipant._id);

  const handleBlockUser = () => {
    alert(`Block user: ${otherParticipant.name}`);
  };

  const handleDeleteChat = () => {
    const confirmDelete = confirm(`Are you sure you want to delete the chat with ${otherParticipant.name}?`);
    if (confirmDelete) {
      alert(`Deleted chat with ${otherParticipant.name}`);
      setSelectedConversation(null);
    }
  };

  return (
    <aside className="w-full max-w-[400px] p-6 bg-gradient-to-br from-[#0f172a] to-[#020617] border-l border-cyan-600/30 flex flex-col gap-6 shadow-2xl shadow-cyan-500/10 text-white">
      {/* User Info */}
      <div className="flex flex-col items-center text-center gap-3">
        <img
          src={otherParticipant.avatar || DEFAULT_AVATAR}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500 shadow-lg"
        />
        <h2 className="text-xl font-bold tracking-wide">{otherParticipant.name}</h2>
        <p className="text-sm text-gray-400">{otherParticipant.email}</p>
        <span
          className={`text-xs mt-1 px-3 py-1 rounded-full font-medium ${
            isOnline ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
          }`}
        >
          {isOnline ? '🟢 Online' : '⚫ Offline'}
        </span>
      </div>

      {/* Bio */}
      {otherParticipant.bio && (
        <div className="text-sm px-2 py-2 rounded-md bg-zinc-800/50 border border-zinc-700 text-gray-300 leading-relaxed">
          <span className="text-cyan-400 font-semibold">Bio:</span> {otherParticipant.bio}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={handleBlockUser}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600/10 text-red-400 hover:bg-red-600/20 transition font-medium"
        >
          <ShieldOff size={18} /> Block User
        </button>

        <button
          onClick={handleDeleteChat}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600/10 text-red-400 hover:bg-red-600/20 transition font-medium"
        >
          <Trash size={18} /> Delete Chat
        </button>
      </div>
    </aside>
  );
};

export default ChatUserDetails;
