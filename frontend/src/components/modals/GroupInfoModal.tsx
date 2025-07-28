import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Calendar, Crown, UserPlus, LogOut, Trash2 } from 'lucide-react';
import { ChatContext } from '../../context/chat/ChatContext';
import { AuthContext } from '../../context/auth/AuthContext';
import { apiClient } from '../../services/api/apiService';
import DEFAULT_AVATAR from '../../assets/defaultAvatar';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupInfoModal = ({ isOpen, onClose }: GroupInfoModalProps) => {
  const { selectedConversation, leaveGroup, deleteConversation } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen || showConfirmDelete || showConfirmLeave || showAddMembers) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, showConfirmDelete, showConfirmLeave, showAddMembers]);

  // Fetch available users when Add Members modal is opened
  useEffect(() => {
    if (showAddMembers) {
      const fetchAvailableUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const response = await apiClient.get('/users');
          setAvailableUsers(response.data);
        } catch (error) {
          console.error('Error fetching users:', error);
          setAvailableUsers([]);
        } finally {
          setIsLoadingUsers(false);
        }
      };

      fetchAvailableUsers();
    }
  }, [showAddMembers]);

  // Early returns after all hooks have been called
  if (!isOpen || !selectedConversation || !selectedConversation.isGroup) return null;

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
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"
        onClick={() => setShowConfirmDelete(false)}
      >
        <div 
          className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-auto border border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Group</h3>
            <p className="text-gray-400">
              Are you sure you want to delete this group? This action cannot be undone and all messages will be permanently lost.
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
      document.getElementById('modal-root') || document.body
    );
  }

  // Render leave confirmation modal separately
  if (showConfirmLeave) {
    return createPortal(
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"
        onClick={() => setShowConfirmLeave(false)}
      >
        <div 
          className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-auto border border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Leave Group</h3>
            <p className="text-gray-400">
              Are you sure you want to leave this group? You will need to be re-invited to rejoin.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmLeave(false)}
              className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  await leaveGroup(selectedConversation._id);
                  setShowConfirmLeave(false);
                  onClose();
                } catch (error) {
                  // Error is already handled in the context
                  setShowConfirmLeave(false);
                }
              }}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </div>,
      document.getElementById('modal-root') || document.body
    );
  }

  // Render add members modal separately
  if (showAddMembers) {
    const currentMemberIds = selectedConversation.participants.map(p => p._id);
    const filteredUsers = availableUsers.filter(user => 
      !currentMemberIds.includes(user._id) && 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return createPortal(
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"
        onClick={() => setShowAddMembers(false)}
      >
        <div 
          className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Add Members</h3>
            <p className="text-gray-400">
              Select users to add to "{selectedConversation.name || 'this group'}"
            </p>
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto mb-4 max-h-64">
            {isLoadingUsers ? (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                {availableUsers.length === 0 ? 'No users available' : 'No users match your search'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUsers.includes(user._id)
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                    }`}
                    onClick={() => {
                      setSelectedUsers(prev => 
                        prev.includes(user._id)
                          ? prev.filter(id => id !== user._id)
                          : [...prev, user._id]
                      );
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || DEFAULT_AVATAR}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                      {selectedUsers.includes(user._id) && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAddMembers(false);
                setSelectedUsers([]);
                setSearchQuery('');
              }}
              className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (selectedUsers.length === 0) return;
                setIsAddingMembers(true);
                try {
                  await apiClient.post(`/conversations/${selectedConversation._id}/members`, {
                    userIds: selectedUsers
                  });

                  // console.log('Members added successfully');
                  setShowAddMembers(false);
                  setSelectedUsers([]);
                  setSearchQuery('');
                  // TODO: Refresh conversation data or update context
                  // You might want to call a context method to refresh the conversation
                } catch (error) {
                  console.error('Error adding members:', error);
                } finally {
                  setIsAddingMembers(false);
                }
              }}
              disabled={selectedUsers.length === 0 || isAddingMembers}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingMembers ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Adding...
                </div>
              ) : (
                `Add (${selectedUsers.length})`
              )}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const isAdmin = typeof selectedConversation.admin === 'object' 
    ? selectedConversation.admin._id === authUser?._id
    : selectedConversation.admin === authUser?._id;

  const adminUser = typeof selectedConversation.admin === 'object'
    ? selectedConversation.admin
    : selectedConversation.participants.find(p => p._id === selectedConversation.admin);

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
            <Users size={24} className="text-cyan-400" />
            Group Information
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
          {/* Group Icon and Name */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 rounded-full mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-4 border-cyan-500/30 flex items-center justify-center shadow-lg">
              <Users size={40} className="text-cyan-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">
              {selectedConversation.name || 'Group Chat'}
            </h3>
            <p className="text-gray-400 text-lg">
              {selectedConversation.participants.length} members
            </p>
          </div>

          {/* Group Details */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl">
              <Calendar size={20} className="text-cyan-400" />
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide">Created</p>
                <p className="text-white text-lg">{formatDate(selectedConversation.createdAt || new Date())}</p>
              </div>
            </div>

            {adminUser && (
              <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl">
                <Crown size={20} className="text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">Admin</p>
                  <p className="text-white text-lg">{adminUser.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Members List */}
          <div className="mb-8">
            <h4 className="text-white font-medium mb-4 flex items-center gap-2 text-lg">
              <Users size={18} className="text-cyan-400" />
              Members ({selectedConversation.participants.length})
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedConversation.participants.map(participant => (
                <div key={participant._id} className="flex items-center gap-4 p-4 bg-gray-700/20 rounded-xl">
                  <img
                    src={participant.avatar || DEFAULT_AVATAR}
                    alt={participant.name}
                    className="w-12 h-12 rounded-full border border-gray-600"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{participant.name}</p>
                    <p className="text-gray-400 text-sm">{participant.email}</p>
                  </div>
                  {(typeof selectedConversation.admin === 'object' 
                    ? participant._id === selectedConversation.admin._id
                    : participant._id === selectedConversation.admin) && (
                    <Crown size={16} className="text-yellow-400" />
                  )}
                  {participant._id === authUser?._id && (
                    <span className="text-sm bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-6 border-t border-gray-700/50">
            {isAdmin && (
              <button 
                onClick={() => {
                  setShowAddMembers(true);
                  // TODO: Fetch available users when opening the modal
                }}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 text-lg"
              >
                <UserPlus size={20} />
                Add Members
              </button>
            )}
            
            {!isAdmin && (
              <button 
                onClick={() => setShowConfirmLeave(true)}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 text-lg"
              >
                <LogOut size={20} />
                Leave Group
              </button>
            )}

            {isAdmin && (
              <button 
                onClick={() => setShowConfirmDelete(true)}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 text-lg"
              >
                <Trash2 size={20} />
                Delete Group
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-700/50 text-gray-300 rounded-xl font-medium hover:bg-gray-600/50 transition-colors text-lg"
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

export default GroupInfoModal;
