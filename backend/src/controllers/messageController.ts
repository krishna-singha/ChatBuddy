import { Response } from "express";
import { AuthenticatedRequest } from "../types/interfaces";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { errorResponse, successResponse } from "../utils/responseHelper";
import cloudinary from "../utils/cloudinary";
import { IMessage } from "../types/interfaces/models";
import { io } from "../socket/socketServer";

// Send a message to a user
export const sendMessageToUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    
    const { conversationId, content, attachments } = req.body;

    if (!userId || (!content && !attachments)) {
      return errorResponse(res, 400, "Content or attachments are required");
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "name email avatar")
      .populate("admin", "name email avatar");
    if (!conversation) {
      return errorResponse(res, 404, "Conversation not found");
    }

    // Check if the user is a participant in the conversation
    if (
      !conversation.participants.some((participant) =>
        participant._id.equals(userId)
      )
    ) {
      return errorResponse(
        res,
        403,
        "You are not a participant in this conversation"
      );
    }

    // if attachment sent first uploads to cloudinary
    let uploadedAttachments: { url?: string; id?: string } = {};
    if (attachments && attachments.file) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(attachments.file, {
          folder: "ChatBuddy/chats",
        });
        
        uploadedAttachments = {
          url: uploadResponse.secure_url,
          id: uploadResponse.public_id,
        };
      } catch (uploadError) {
        return errorResponse(res, 500, "Failed to upload attachment");
      }
    }

    // Create the message object
    const messageData: IMessage = {
      conversationId,
      sender: userId,
      ...(content && { content }),
      ...(uploadedAttachments.url && { attachments: uploadedAttachments }),
      seenBy: [userId],
    };
    const newMessage = await Message.create(messageData);

    // Update the last message in the conversation
    conversation.lastMessage = (newMessage as any)._id;
    await conversation.save();

    // Populate the message with user details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email avatar")
      .populate("seenBy", "name email avatar");
    if (!populatedMessage) {
      return errorResponse(res, 404, "Message not found");
    }

    // Emit the message to all participants via socket
    if (io) {
      const socketData = {
        message: populatedMessage,
        conversationId: conversationId
      };
      
      // Broadcast to the conversation room (all participants will receive it)
      // The client-side will filter out the sender's own messages to prevent duplicates
      io.to(conversationId).emit("newMessage", socketData);
    }

    // Return the populated message
    return successResponse(res, { newMessage: populatedMessage }, 201);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Get messages in a conversation
export const getMessagesInConversation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { conversationId } = req.params;

    if (!userId) {
      return errorResponse(res, 401, "Unauthorized");
    }


    // Find the conversation
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "name email avatar")
      .populate("admin", "name email avatar");
    if (!conversation) {
      return errorResponse(res, 404, "Conversation not found");
    }
    

    // Check if the user is a participant in the conversation
    if (
      !conversation.participants.some((participant) =>
        participant._id.equals(userId)
      )
    ) {
      return errorResponse(
        res,
        403,
        "You are not a participant in this conversation"
      );
    }

    
    // Get messages in the conversation
    const messages = await Message.find({ conversationId })
    .populate("sender", "name email avatar")
    .populate("seenBy", "name email avatar")
    .sort({ createdAt: -1 });

    return successResponse(res, { messages }, 200);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Delete a message
export const deleteMessage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { messageId } = req.params;

    if (!userId) {
      return errorResponse(res, 401, "Unauthorized");
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return errorResponse(res, 404, "Message not found");
    }

    // Check if the user is the sender of the message
    if (!message.sender.equals(userId)) {
      return errorResponse(res, 403, "You can only delete your own messages");
    }

    // Delete the message
    await Message.deleteOne({ _id: messageId });

    // If image attachments exist, delete them from cloudinary
    if (
      message.attachments &&
      message.attachments.url &&
      message.attachments.id
    ) {
      // Assuming you have a function to delete from cloudinary
      await cloudinary.uploader.destroy(message.attachments.id, {
        resource_type: "image",
      });
    }

    return successResponse(
      res,
      { message: "Message deleted successfully" },
      200
    );
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Mark a message as seen
export const markMessageAsSeen = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { messageId } = req.params;

    if (!userId) {
      return errorResponse(res, 401, "Unauthorized");
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return errorResponse(res, 404, "Message not found");
    }

    // Check if the user has already seen the message
    if (message.seenBy.some((seenUser) => seenUser.equals(userId))) {
      return successResponse(res, { message: "Message already seen" }, 200);
    }

    // Add the user to the seenBy array
    message.seenBy.push(userId);
    await message.save();

    return successResponse(res, { message: "Message marked as seen" }, 200);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Get unseen messages count in a conversation
export const getUnseenMessagesCount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { conversationId } = req.params;

    if (!userId) {
      return errorResponse(res, 401, "Unauthorized");
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return errorResponse(res, 404, "Conversation not found");
    }

    // Get unseen messages count
    const unseenCount = await Message.countDocuments({
      conversationId,
      seenBy: { $ne: userId },
    });

    return successResponse(res, { unseenCount }, 200);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

