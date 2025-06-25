import Message from "../models/Message";
import { Request, Response } from "express";
import User from "../models/User";
import cloudinary from "../lib/cloudinary";
import { io, userSocketMap } from "../socketServer";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getUsersForSidebar = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const filterUser = await User.find({ _id: { $ne: userId } }).select(
      "-password -__v -createdAt -updatedAt"
    );

    const unseenMessages: Record<string, number> = {};
    const promises = filterUser.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id.toString()] = messages.length;
      }
    });

    await Promise.all(promises);
    return res.status(200).json({
      success: true,
      users: filterUser,
      unseenMessages,
    });
  } catch (error) {
    console.log("Error in geting users for sidebar", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMessages = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const selectedUserId = req.params.id;
    const myId = req.user._id.toString();

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );
    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log("Error in getting messages", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

export const markMessagesAsSeen = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const senderId = req.params.id;
    const receiverId = req.user._id;

    await Message.updateMany(
      {
        senderId,
        receiverId,
        seen: false,
      },
      { seen: true }
    );

    return res.status(200).json({
      success: true,
      message: "All unseen messages marked as seen!",
    });
  } catch (error) {
    console.error("Error updating seen status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id.toString();

    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "ChatBuddy/chats",
      });
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const isReceiverChatOpen =
      (globalThis as any).userChatState?.[receiverId] === senderId;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      imagePublicId: imagePublicId,
      seen: isReceiverChatOpen,
    });

    const receiverSocketSet = userSocketMap[receiverId];
    if (receiverSocketSet) {
      receiverSocketSet.forEach((socketId) => {
        io.to(socketId).emit("newMessage", newMessage);
      });
    }

    return res.status(200).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error("Error in sending message", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

export const getLatestMessages = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id.toString();

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    if (messages.length === 0) {
      return res.status(200).json({
        success: true,
        latestMessages: {},
      });
    }

    const latestMessages: Record<string, string> = {};
    messages.forEach((message) => {
      const otherUserId =
        message.senderId.toString() === userId
          ? message.receiverId
          : message.senderId;
      latestMessages[otherUserId.toString()] = message.text
        ? message.text
        : message.image
        ? "Sent a photo"
        : "";
    });

    return res.status(200).json({
      success: true,
      latestMessages,
    });
  } catch (error) {
    console.log("Error in getting latest messages", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
