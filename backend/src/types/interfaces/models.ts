import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  avatarId?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConversation extends Document {
  name: string;
  isGroup: boolean;
  participants: Types.ObjectId[];
  admin: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  sender: Types.ObjectId;
  content?: string;
  attachments?: {
    url: string;
    id: string;
  };
  seenBy: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
