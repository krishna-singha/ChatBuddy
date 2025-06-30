import type { IUser } from "./index";
import { Socket } from "socket.io-client";
import axios from "axios";

export interface AuthContextType {
  authUser: IUser | null;
  onlineUsers: string[];
  socket: Socket | null;
  login: (
    state: "login" | "register",
    credentials: Record<string, string>
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  axios: typeof axios;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  sender: IUser;
  content?: string;
  attachments?: {
    url: string;
    id: string;
  };
  seenBy: IUser[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConversation {
  _id: string;
  admin: string | IUser;
  isGroup: boolean;
  name: string;
  participants: IUser[];
  lastMessage?: IMessage;
  createdAt: Date;
  updatedAt: Date;
}
