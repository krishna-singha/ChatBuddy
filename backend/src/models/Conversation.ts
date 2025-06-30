import mongoose, { Schema } from "mongoose";
import { IConversation } from "../types/interfaces/models";

const conversationSchema = new Schema<IConversation>(
  {
    name: {
      type: String,
      default: "Private Chat",
      required: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);

export default Conversation;
