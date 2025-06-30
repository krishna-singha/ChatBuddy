import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import Message from "../models/Message";
import Conversation from "../models/Conversation";


export const userSocketMap: { [userId: string]: Set<string> } = {}; // userId -> Set of socketIds
const userChatState: { [userId: string]: string | null } = {}; // userId -> activeConversationId
const typingUsers: { [conversationId: string]: { [userId: string]: string } } = {}; // conversationId -> userId -> userName

export let io: Server;

export const setupSocketServer = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      if (!userSocketMap[userId]) {
        userSocketMap[userId] = new Set();
      }
      userSocketMap[userId].add(socket.id);
      userChatState[userId] = null;
      console.log(`✅ User connected: ${userId}`);
      
      // Join user to their conversation rooms
      Conversation.find({ "participants": userId })
        .then(conversations => {
          conversations.forEach(conv => {
            socket.join((conv._id as any).toString());
          });
        })
        .catch(err => console.error("Error joining conversation rooms:", err));
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("openChat", (conversationId: string) => {
      if (userId) userChatState[userId] = conversationId;
    });

    socket.on("closeChat", () => {
      if (userId) userChatState[userId] = null;
    });

    // Handle typing indicators
    socket.on("typing", (data: { conversationId: string; userId: string; userName: string }) => {
      if (!userId) return;
      
      const { conversationId, userName } = data;
      
      // Add user to typing list for this conversation
      if (!typingUsers[conversationId]) {
        typingUsers[conversationId] = {};
      }
      typingUsers[conversationId][userId] = userName;
      
      // Broadcast typing event to other users in the conversation
      socket.to(conversationId).emit("typing", data);
    });

    socket.on("stopTyping", (data: { conversationId: string; userId: string }) => {
      if (!userId) return;
      
      const { conversationId } = data;
      
      // Remove user from typing list
      if (typingUsers[conversationId]) {
        delete typingUsers[conversationId][userId];
        if (Object.keys(typingUsers[conversationId]).length === 0) {
          delete typingUsers[conversationId];
        }
      }
      
      // Broadcast stop typing event
      socket.to(conversationId).emit("stopTyping", data);
    });

    // Handle marking messages as seen
    socket.on("markAsSeen", async (data: { conversationId: string; userId: string }) => {
      try {
        const { conversationId } = data;
        
        // Update all unseen messages in the conversation to seen
        await Message.updateMany(
          { 
            conversationId, 
            "seenBy": { $ne: userId } 
          },
          { 
            $addToSet: { seenBy: userId } 
          }
        );
        
        // Broadcast to other participants
        socket.to(conversationId).emit("messagesSeen", data);
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });



    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${userId}`);
      if (userId && userSocketMap[userId]) {
        userSocketMap[userId].delete(socket.id);
        if (userSocketMap[userId].size === 0) {
          delete userSocketMap[userId];
          delete userChatState[userId];
          
          // Clean up typing indicators for this user
          Object.keys(typingUsers).forEach(conversationId => {
            if (typingUsers[conversationId][userId]) {
              delete typingUsers[conversationId][userId];
              // Broadcast stop typing to conversation
              socket.to(conversationId).emit("stopTyping", { conversationId, userId });
              
              if (Object.keys(typingUsers[conversationId]).length === 0) {
                delete typingUsers[conversationId];
              }
            }
          });
        }
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};
