import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Calendar, User, MessageCircle, Trash2 } from 'lucide-react';
import { ChatContext } from '../../context/chat/ChatContext';
import { AuthContext } from '../../context/auth/AuthContext';
import DEFAULT_AVATAR from '../../assets/defaultAvatar';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserInfoModal = ({ isOpen, onClose }: UserInfoModalProps) => {
  const { selectedConversation, deleteConversation } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen || showConfirmDelete) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, showConfirmDelete]);

  // Early returns after all hooks have been called
  if (!isOpen || !selectedConversation || selectedConversation.isGroup) return null;

  // Get the other participant (not the current user)
  const otherParticipant = selectedConversation.participants.find(
    participant => participant._id !== authUser?._id
  );

  if (!otherParticipant) return null;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render delete confirmation modal separately
  if (showConfirmDelete) {
    return createPortal(
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/90 backdrop-blur-sm z-[10001] flex items-center justify-center"
        onClick={() => setShowConfirmDelete(false)}
        style={{ 
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <div 
          className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            maxWidth: '28rem',
            width: '100%',
            margin: 'auto'
          }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Chat</h3>
            <p className="text-gray-400">
              Are you sure you want to delete this chat{otherParticipant?.name ? ` with ${otherParticipant.name}` : ''}? This action cannot be undone and all messages will be permanently lost.
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
                  onClose();
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
      </div>,
      document.body
    );
  }

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
            <User size={24} className="text-cyan-400" />
            User Information
          </h2>
          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Avatar and Name */}
          <div className="text-center mb-8">
            <img
              src={otherParticipant.avatar || DEFAULT_AVATAR}
              alt={otherParticipant.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-500/30 shadow-lg"
            />
            <h3 className="text-2xl font-bold text-white mb-2">{otherParticipant.name}</h3>
            {otherParticipant.bio && (
              <p className="text-gray-400 max-w-md mx-auto">{otherParticipant.bio}</p>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl">
              <Mail size={20} className="text-cyan-400" />
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide">Email</p>
                <p className="text-white">{otherParticipant.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl">
              <Calendar size={20} className="text-cyan-400" />
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide">Joined</p>
                <p className="text-white">{formatDate(otherParticipant.createdAt || new Date())}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl">
              <MessageCircle size={20} className="text-cyan-400" />
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide">Chat Started</p>
                <p className="text-white">{formatDate(selectedConversation.createdAt || new Date())}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Delete Chat
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default UserInfoModal;
