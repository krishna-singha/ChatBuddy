// src/socketServer.ts
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import Message from "./models/Message";

interface MessagePayload {
  text: string;
  receiverId: string;
  senderId: string;
}

export const userSocketMap: { [userId: string]: Set<string> } = {}; // userId -> Set of socketIds
const userChatState: { [userId: string]: string | null } = {}; // userId -> chattingWithUserId

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
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("openChat", (chattingWithId: string) => {
      if (userId) userChatState[userId] = chattingWithId;
    });

    socket.on("closeChat", () => {
      if (userId) userChatState[userId] = null;
    });

    socket.on("sendMessage", async (payload: MessagePayload) => {
      const { text, receiverId, senderId } = payload;

      if (!text || !receiverId || !senderId) return;

      try {
        const isReceiverChatOpen = userChatState[receiverId] === senderId;

        const newMessage = await Message.create({
          senderId,
          receiverId,
          text,
          seen: isReceiverChatOpen,
        });

        const receiverSocketSet = userSocketMap[receiverId];
        if (receiverSocketSet) {
          receiverSocketSet.forEach((socketId) => {
            io.to(socketId).emit("newMessage", newMessage);
          });
        }

        console.log(`📨 Message from ${senderId} to ${receiverId}`);
      } catch (err) {
        console.error("❌ sendMessage error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${userId}`);
      if (userId && userSocketMap[userId]) {
        userSocketMap[userId].delete(socket.id);
        if (userSocketMap[userId].size === 0) {
          delete userSocketMap[userId];
          delete userChatState[userId];
        }
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};
