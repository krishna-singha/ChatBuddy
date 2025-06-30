// Shared types between frontend and backend

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarId?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessage {
  _id: string;
  senderId: string;
  receiverId?: string;
  conversationId?: string;
  text?: string;
  image?: string;
  imagePublicId?: string;
  timestamp: Date;
  seen: boolean;
  readBy?: string[];
}

export interface IConversation {
  _id: string;
  participants: IUser[];
  isGroup: boolean;
  name?: string;
  admin?: string | IUser;
  lastMessage?: IMessage;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface SocketEvents {
  // Authentication
  'user:join': (userId: string) => void;
  'user:leave': (userId: string) => void;
  'users:online': (userIds: string[]) => void;
  
  // Messaging
  'message:send': (message: IMessage) => void;
  'message:receive': (message: IMessage) => void;
  'message:seen': (messageId: string, userId: string) => void;
  
  // Typing indicators
  'typing:start': (conversationId: string, userName: string) => void;
  'typing:stop': (conversationId: string, userName: string) => void;
  
  // Conversations
  'conversation:join': (conversationId: string) => void;
  'conversation:leave': (conversationId: string) => void;
}
