import {
    createContext,
    useState,
    useContext,
    useEffect,
} from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    avatarPublicId?: string;
    bio?: string;
}

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    text?: string;
    timestamp: Date;
    seen: boolean;
    image?: string;
    imagePublicId?: string;
}

interface ChatContextType {
    messages: Message[];
    users: User[];
    selectedUser: User | null;
    unseenMessages: Record<string, number>;
    setUnseenMessages: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<Message[]>;
    sendMessage: (text: string, image: string) => Promise<void>;
    setSelectedUser: (user: User | null) => void;
    latestMessages: { [userId: string]: string };
    getLatestMessages: () => Promise<void>;
    messageSent: boolean;
}

export const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({});
    const [latestMessages, setLatestMessages] = useState<{ [userId: string]: string }>({});
    const [messageSent, setMessageSent] = useState(false);

    const { socket, axios, authUser } = useContext(AuthContext);

    const getUsers = async () => {
        try {
            const { data } = await axios.get('/api/messages/user');
            if (data.success) {
                setUsers(data.users);
                const unseen = { ...data.unseenMessages };
                if (selectedUser) unseen[selectedUser._id] = 0;
                setUnseenMessages(unseen);
            }
        } catch {
            toast.error("Failed to fetch users.");
        }
    };

    const getMessages = async (userId: string): Promise<Message[]> => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
                setUnseenMessages(prev => ({ ...prev, [userId]: 0 }));
                getLatestMessages();
                return data.messages;
            }
        } catch {
            toast.error("Failed to fetch messages.");
        }
        return [];
    };

    const getLatestMessages = async () => {
        try {
            const { data } = await axios.get('/api/messages/latest');
            if (data.success) {
                setLatestMessages(data.latestMessages);
            } else {
                toast.error(data.message || "Failed to fetch latest messages.");
            }
        } catch {
            toast.error("Failed to fetch latest messages.");
        }
    };

    const sendMessage = async (text: string, image: string): Promise<void> => {
        if (!selectedUser) {
            toast.error("No user selected.");
            return;
        }

        if (!authUser) {
            toast.error("User not authenticated.");
            return;
        }
        setMessageSent(true);

        const tempMessage: Message = {
            _id: Date.now().toString(),
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text,
            image,
            imagePublicId: '',
            timestamp: new Date(),
            seen: true,
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, { text, image });
            if (data.success) {
                setMessages(prev =>
                    prev.map(msg => msg._id === tempMessage._id ? data.newMessage : msg)
                );
                getLatestMessages();
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Failed to send message.");
        }
        finally {
            setMessageSent(false);
        }
    };

    const handleNewMessage = (newMessage: Message) => {
        const isChattingWithSender = selectedUser?._id === newMessage.senderId;

        if (isChattingWithSender) {
            setMessages(prev => [...prev, newMessage]);
            setUnseenMessages(prev => ({ ...prev, [newMessage.senderId]: 0 }));
            axios.put(`/api/messages/mark/${newMessage.senderId}`).catch(() => {
                toast.error("Failed to mark message as seen.");
            });
        } else {
            setUnseenMessages(prev => ({
                ...prev,
                [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
            }));
        }

        getLatestMessages();
    };

    useEffect(() => {
        if (!socket) return;

        // Only attach message listener
        socket.on('newMessage', handleNewMessage);

        getUsers();
        getLatestMessages();

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, selectedUser]);

    const setSelectedUserWithMessages = async (user: User | null) => {
        if (socket) {
            if (user) {
                socket.emit('openChat', user._id);
            } else if (selectedUser) {
                socket.emit('closeChat');
            }
        }

        setSelectedUser(user);

        if (user) {
            await getMessages(user._id);
        } else {
            setMessages([]);
        }
    };

    const value: ChatContextType = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser: setSelectedUserWithMessages,
        latestMessages,
        getLatestMessages,
        messageSent
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
