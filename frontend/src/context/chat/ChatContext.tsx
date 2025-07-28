import {
    createContext,
    useState,
    useContext,
    useEffect,
} from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from '../auth/AuthContext';
import toast from 'react-hot-toast';
import type { IMessage, IConversation } from '../../interfaces/context';
import type { IUser } from '../../interfaces';



interface ChatContextType {
    messages: IMessage[];
    unseenMessages: Record<string, number>;
    setUnseenMessages: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    getMessages: (conversationId: string) => Promise<IMessage[]>;
    sendMessage: (text: string, image: string) => Promise<void>;
    messageSent: boolean;

    startNewGroupChat: (email: string) => Promise<void>;
    createGroupChat: (name: string, emails: string[]) => Promise<void>;
    getConversation: () => Promise<void>;
    conversations: IConversation[];
    setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
    selectedConversation: IConversation | null;
    setSelectedConversation: (conversation: IConversation | null) => Promise<void>;
    
    // New real-time features
    typingUsers: Record<string, string[]>; // conversationId -> array of typing user names
    setTypingUsers: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    startTyping: (conversationId: string) => void;
    stopTyping: (conversationId: string) => void;
    markMessagesAsSeen: (conversationId: string) => void;
    isTyping: boolean;
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
    
    // Search functionality
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    filteredMessages: IMessage[];
    
    // Available users for group creation
    getAvailableUsers: () => Promise<IUser[]>;
    
    // Chat management functions
    leaveGroup: (conversationId: string) => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;
}



export const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({});
    const [messageSent, setMessageSent] = useState(false);
    const [conversations, setConversations] = useState<IConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
    
    // New real-time features state
    const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
    const [isTyping, setIsTyping] = useState(false);
    
    // Search functionality state
    const [searchQuery, setSearchQuery] = useState('');

    const { socket, axios, authUser } = useContext(AuthContext);

    // Filter messages based on search query
    const filteredMessages = searchQuery === '' 
        ? messages 
        : messages.filter(message => 
            message.content?.toLowerCase().includes(searchQuery.toLowerCase())
          );

    const getConversation = async () => {
        try {
            const { data } = await axios.get('/api/conversations');
            // console.log(data.conversations);
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Failed.";
            toast.error(message);
        }
    };

    const startNewGroupChat = async (email: string) => {
        try {
            const { data } = await axios.post(`/api/conversations/start`, { email });
            if (data.success) {
                setConversations(prev => [data.conversation, ...prev]);
                toast.success("User added successfully.");
            } else {
                toast.error(data.message || "Failed to add user.");
            }

        } catch (error: any) {
            console.error("Error adding other user:", error.response?.data || error);
            toast.error("Failed to add user.");
        }
    };

    const createGroupChat = async (name: string, emails: string[]) => {
        try {
            // Validate and find user IDs for the provided emails
            const validEmails = emails.filter(email => email.trim().length > 0);
            if (validEmails.length === 0) {
                toast.error("Please provide at least one valid email address.");
                return;
            }

            const userPromises = validEmails.map(email => 
                axios.get(`/api/auth/user-by-email/${encodeURIComponent(email.trim())}`).catch(() => null)
            );
            
            const userResponses = await Promise.all(userPromises);
            const validUsers: string[] = [];
            const invalidEmails: string[] = [];

            validEmails.forEach((email, index) => {
                const response = userResponses[index];
                if (response && response.data.success) {
                    validUsers.push(response.data.user._id);
                } else {
                    invalidEmails.push(email);
                }
            });

            // Show specific error for invalid emails
            if (invalidEmails.length > 0) {
                toast.error(`Invalid email(s): ${invalidEmails.join(', ')}`);
                if (validUsers.length === 0) return;
            }

            if (validUsers.length === 0) {
                toast.error("No valid users found for the provided emails.");
                return;
            }

            const { data } = await axios.post(`/api/conversations/group/start`, {
                name,
                participants: validUsers
            });

            if (data.success) {
                // Add the new conversation to the list
                setConversations(prev => [data.conversation, ...prev]);
                toast.success("Group chat created successfully!");
            } else {
                toast.error(data.message || "Failed to create group chat.");
            }

        } catch (error: any) {
            console.error("Error creating group chat:", error.response?.data || error);
            const errorMessage = error.response?.data?.message || "Failed to create group chat.";
            toast.error(errorMessage);
        }
    };

    const getAvailableUsers = async (): Promise<IUser[]> => {
        try {
            const { data } = await axios.get('/api/auth/users');
            if (data.success) {
                return data.users;
            }
        } catch (error: any) {
            console.error("Error fetching available users:", error);
            toast.error("Failed to fetch available users.");
        }
        return [];
    };

    const leaveGroup = async (conversationId: string): Promise<void> => {
        try {
            const { data } = await axios.delete(`/api/conversations/group/leave/${conversationId}`);
            if (data.success) {
                // Remove the conversation from the list
                setConversations(prev => prev.filter(conv => conv._id !== conversationId));
                // Clear selected conversation if it's the one being left
                if (selectedConversation?._id === conversationId) {
                    setSelectedConversation(null);
                }
                toast.success("Left group successfully!");
            } else {
                toast.error(data.message || "Failed to leave group.");
            }
        } catch (error: any) {
            console.error("Error leaving group:", error);
            const errorMessage = error.response?.data?.message || "Failed to leave group.";
            toast.error(errorMessage);
        }
    };

    const deleteConversation = async (conversationId: string): Promise<void> => {
        try {
            const { data } = await axios.delete(`/api/conversations/${conversationId}`);
            if (data.success) {
                // Remove the conversation from the list
                setConversations(prev => prev.filter(conv => conv._id !== conversationId));
                // Clear selected conversation if it's the one being deleted
                if (selectedConversation?._id === conversationId) {
                    setSelectedConversation(null);
                }
                toast.success("Conversation deleted successfully!");
            } else {
                toast.error(data.message || "Failed to delete conversation.");
            }
        } catch (error: any) {
            console.error("Error deleting conversation:", error);
            const errorMessage = error.response?.data?.message || "Failed to delete conversation.";
            toast.error(errorMessage);
        }
    };

    const getMessages = async (conversationId: string): Promise<IMessage[]> => {
        try {
            const { data } = await axios.get(`/api/messages/${conversationId}`);
            // console.log(data.messages);

            if (data.success) {
                setMessages(data.messages);
                return data.messages;
            }
        } catch {
            toast.error("Failed to fetch messages.");
        }
        return [];
    };

    const sendMessage = async (text: string, image: string): Promise<void> => {
        if (!selectedConversation) {
            toast.error("No conversation selected.");
            return;
        }

        if (!authUser) {
            toast.error("User not authenticated.");
            return;
        }
        setMessageSent(true);

        const tempMessage: IMessage = {
            _id: Date.now().toString(),
            conversationId: selectedConversation._id,
            sender: authUser,
            content: text,
            attachments: image ? {
                url: image,
                id: ''
            } : undefined,
            seenBy: [authUser],
            createdAt: new Date(),
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
            const { data } = await axios.post(`/api/messages/send`, {
                conversationId: selectedConversation._id,
                content: text,
                attachments: image ? { file: image } : undefined
            });
            if (data.success) {
                setMessages(prev =>
                    prev.map(msg => msg._id === tempMessage._id ? data.newMessage : msg)
                );
                
                // The server will handle socket broadcasting, so we don't emit here
                // This prevents double messages
            } else {
                // Remove the temporary message if send failed
                setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
                toast.error(data.message || "Failed to send message.");
            }
        } catch (error: any) {
            // Remove the temporary message if send failed
            setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
            const errorMessage = error.response?.data?.message || "Failed to send message.";
            toast.error(errorMessage);
        }
        finally {
            setMessageSent(false);
        }
    };

    // New real-time functionality methods
    const startTyping = (conversationId: string) => {
        if (socket && authUser) {
            socket.emit('typing', {
                conversationId,
                userId: authUser._id,
                userName: authUser.name
            });
        }
    };

    const stopTyping = (conversationId: string) => {
        if (socket && authUser) {
            socket.emit('stopTyping', {
                conversationId,
                userId: authUser._id
            });
        }
    };

    const markMessagesAsSeen = (conversationId: string) => {
        if (socket && authUser) {
            socket.emit('markAsSeen', {
                conversationId,
                userId: authUser._id
            });
        }
        
        // Update local unseen count
        setUnseenMessages(prev => ({ ...prev, [conversationId]: 0 }));
    };

    const handleNewMessage = (data: { message: IMessage; conversationId: string }) => {
        const { message: newMessage, conversationId } = data;
        const isMessageForCurrentConversation = selectedConversation?._id === conversationId;
        const isOwnMessage = newMessage.sender._id === authUser?._id;

        // Don't process our own messages from socket events (they're already added via API response)
        if (isOwnMessage) {
            return;
        }

        if (isMessageForCurrentConversation) {
            setMessages(prev => {
                // Check if message already exists to prevent duplicates
                const exists = prev.some(msg => msg._id === newMessage._id);
                if (exists) return prev;
                return [...prev, newMessage];
            });
            // Auto-mark as seen if we're actively viewing the conversation
            markMessagesAsSeen(conversationId);
        } else {
            // Update unseen count for other conversations
            setUnseenMessages(prev => ({
                ...prev,
                [conversationId]: (prev[conversationId] || 0) + 1,
            }));
        }

        // Update the conversation's last message and move it to top
        setConversations(prev => {
            const updatedConversations = prev.map(conv =>
                conv._id === conversationId
                    ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
                    : conv
            );
            
            // Sort conversations by last message time (most recent first)
            return updatedConversations.sort((a, b) => {
                const aTime = a.lastMessage?.createdAt || a.updatedAt;
                const bTime = b.lastMessage?.createdAt || b.updatedAt;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
            });
        });
    };

    const handleTyping = (data: { conversationId: string; userId: string; userName: string }) => {
        if (data.userId === authUser?._id) return; // Don't show own typing
        
        setTypingUsers(prev => {
            const currentTypers = prev[data.conversationId] || [];
            if (!currentTypers.includes(data.userName)) {
                return {
                    ...prev,
                    [data.conversationId]: [...currentTypers, data.userName]
                };
            }
            return prev;
        });
    };

    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
        if (data.userId === authUser?._id) return;
        
        setTypingUsers(prev => {
            const currentTypers = prev[data.conversationId] || [];
            // Remove the user who stopped typing - need better user tracking in real implementation
            const updatedTypers = currentTypers.filter(() => false); // Simplified: clear all typing for this conversation
            
            return {
                ...prev,
                [data.conversationId]: updatedTypers
            };
        });
    };

    const handleMessagesSeen = (data: { conversationId: string; userId: string }) => {
        if (selectedConversation?._id === data.conversationId) {
            // Update message seen status in current conversation
            setMessages(prev => 
                prev.map(msg => ({
                    ...msg,
                    seenBy: msg.seenBy.some(user => user._id === data.userId) 
                        ? msg.seenBy 
                        : [...msg.seenBy, { _id: data.userId } as IUser]
                }))
            );
        }
    };

    useEffect(() => {
        if (!socket) return;

        // Socket event listeners for real-time features
        socket.on('newMessage', handleNewMessage);
        socket.on('typing', handleTyping);
        socket.on('stopTyping', handleStopTyping);
        socket.on('messagesSeen', handleMessagesSeen);

        // Fetch conversations on mount
        getConversation();

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('typing', handleTyping);
            socket.off('stopTyping', handleStopTyping);
            socket.off('messagesSeen', handleMessagesSeen);
        };
    }, [socket, selectedConversation?._id, authUser?._id]);

    const setSelectedConversationWithMessages = async (conversation: IConversation | null) => {
        if (socket) {
            if (conversation) {
                socket.emit('openChat', conversation._id);
                // Mark messages as seen when opening a conversation
                markMessagesAsSeen(conversation._id);
            } else if (selectedConversation) {
                socket.emit('closeChat');
            }
        }
        setSelectedConversation(conversation);

        if (conversation) {
            await getMessages(conversation._id);
        } else {
            setMessages([]);
        }
    };

    const value: ChatContextType = {
        messages,
        unseenMessages,
        setUnseenMessages,
        getMessages,
        sendMessage,
        messageSent,
        startNewGroupChat,
        createGroupChat,
        getConversation,
        conversations,
        setConversations,
        selectedConversation,
        setSelectedConversation: setSelectedConversationWithMessages,
        
        // Real-time features
        typingUsers,
        setTypingUsers,
        startTyping,
        stopTyping,
        markMessagesAsSeen,
        isTyping,
        setIsTyping,
        
        // Search functionality
        searchQuery,
        setSearchQuery,
        filteredMessages,
        
        // Available users
        getAvailableUsers,
        
        // Chat management
        leaveGroup,
        deleteConversation,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
