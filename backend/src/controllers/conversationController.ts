import { Response } from "express";
import { AuthenticatedRequest } from "../types/interfaces";
import User from "../models/User";
import Conversation from "../models/Conversation";
import { errorResponse, successResponse } from "../utils/responseHelper";

export const startNewPrivateChat = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const otherUserEmail = req.body.email;

    if (!userId || !otherUserEmail) {
      return errorResponse(res, 400, "Missing user details!");
    }

    const otherUser = await User.findOne({ email: otherUserEmail }).select(
      "_id"
    );

    if (!otherUser) {
      return errorResponse(res, 404, "User not found!");
    }

    if (otherUser._id.equals(userId)) {
      return errorResponse(res, 400, "You cannot start a chat with yourself!");
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, otherUser._id] },
      isGroup: false,
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage", "sender content attachments seenBy updatedAt");

    if (existingConversation) {
      return successResponse(res, {
        conversation: existingConversation,
      });
    }

    // Create new conversation
    const newConversation = await Conversation.create({
      participants: [userId, otherUser._id],
      admin: userId,
      isGroup: false,
    });

    // Populate after creation
    const populatedConversation = await Conversation.findById(
      newConversation._id
    )
      .populate("participants", "name email avatar")
      .populate("lastMessage", "sender content attachments seenBy updatedAt");

    return successResponse(res, { conversation: populatedConversation }, 201);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Group chat controller
export const startNewGroupChat = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { name, participants } = req.body;

    if (!userId || !name || !participants || participants.length < 1) {
      return errorResponse(res, 400, "Missing group chat details!");
    }

    // Ensure all participants are valid user IDs
    const validUsers = await User.find({ _id: { $in: participants } }).select("_id");
    const validUserIds = validUsers.map(user => user._id);

    if (validUserIds.length === 0) {
      return errorResponse(res, 400, "No valid participants found!");
    }

    // Ensure the creator is part of the participants
    if (!validUserIds.some(id => id.equals(userId))) {
      validUserIds.push(userId);
    }

    // Create a new group conversation
    const newGroupConversation = await Conversation.create({
      name,
      participants: validUserIds,
      admin: userId,
      isGroup: true,
    });

    // Populate the conversation before returning
    const populatedConversation = await Conversation.findById(newGroupConversation._id)
      .populate("participants", "name email avatar")
      .populate("admin", "name email avatar")
      .populate("lastMessage", "sender content attachments seenBy updatedAt");

    return successResponse(
      res,
      { conversation: populatedConversation },
      201
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Change group name controller
export const changeGroupName = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { conversationId, newName } = req.body;

    if (!userId || !conversationId || !newName) {
      return errorResponse(res, 400, "Missing group name details!");
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return errorResponse(res, 404, "Conversation not found!");
    }

    // Check if the user is the admin of the group
    if (!conversation.admin.equals(userId)) {
      return errorResponse(
        res,
        403,
        "You are not authorized to change the group name!"
      );
    }

    // Update the group name
    conversation.name = newName;
    await conversation.save();

    return successResponse(res, {
      message: "Group name updated successfully!",
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Get all conversations for a user
export const getAllConversations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return errorResponse(res, 400, "User not authenticated!");
    }

    // Fetch all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email avatar")
      .populate("admin", "name email avatar")
      .populate("lastMessage", "sender content attachments seenBy updatedAt")
      .sort({ updatedAt: -1 });

    return successResponse(res, { conversations });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Get conversation details by ID
export const getConversationDetails = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { conversationId } = req.params;

    if (!userId || !conversationId) {
      return errorResponse(res, 400, "Missing conversation details!");
    }

    // Fetch the conversation
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "name email avatar")
      .populate("admin", "name email avatar");

    if (!conversation) {
      return errorResponse(res, 404, "Conversation not found!");
    }

    // Check if the user is a participant in the conversation
    if (
      !conversation.participants.some((participant) =>
        participant.equals(userId)
      )
    ) {
      return errorResponse(
        res,
        403,
        "You are not a participant in this conversation!"
      );
    }

    return successResponse(res, { conversation });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Delete conversation controller
export const deleteConversation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { conversationId } = req.params;

    if (!userId || !conversationId) {
      return errorResponse(res, 400, "Missing conversation details!");
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return errorResponse(res, 404, "Conversation not found!");
    }

    // Check if the user is a participant in the conversation
    if (
      !conversation.participants.some((participant) =>
        participant.equals(userId)
      )
    ) {
      return errorResponse(
        res,
        403,
        "You are not a participant in this conversation!"
      );
    }

    // check is it private chat or group chat
    if (!conversation.isGroup) {
      await Conversation.deleteOne({ _id: conversationId });
      return successResponse(res, {
        message: "Private conversation deleted successfully!",
      });
    }

    // Check if the user is the admin of the group
    if (!conversation.admin.equals(userId)) {
      return errorResponse(
        res,
        403,
        "You are not authorized to delete this group conversation!"
      );
    }

    // Remove the conversation
    await Conversation.deleteOne({ _id: conversationId });

    return successResponse(res, {
      message: "Conversation deleted successfully!",
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Leave group chat controller
export const leaveGroupChat = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { conversationId } = req.params;

    if (!userId || !conversationId) {
      return errorResponse(res, 400, "Missing conversation details!");
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return errorResponse(res, 404, "Conversation not found!");
    }

    // Check if the user is a participant in the conversation
    if (
      !conversation.participants.some((participant) =>
        participant.equals(userId)
      )
    ) {
      return errorResponse(
        res,
        403,
        "You are not a participant in this conversation!"
      );
    }

    // Remove the user from participants
    conversation.participants = conversation.participants.filter(
      (participant) => !participant.equals(userId)
    );

    // If the user is the admin and the group has other participants, transfer admin rights
    if (
      conversation.admin.equals(userId) &&
      conversation.participants.length > 0
    ) {
      conversation.admin = conversation.participants[0]; // Transfer to first participant
    } else if (conversation.participants.length === 0) {
      // If no participants left, delete the group
      await Conversation.deleteOne({ _id: conversationId });
      return successResponse(res, {
        message: "Group chat deleted as you were the last participant.",
      });
    }

    await conversation.save();

    return successResponse(res, {
      message: "You have left the group chat successfully!",
      conversation,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Add participant to group chat controller
export const addParticipantToGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { conversationId, newParticipantEmail } = req.body;

    if (!userId || !conversationId || !newParticipantEmail) {
      return errorResponse(res, 400, "Missing details to add participant!");
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return errorResponse(res, 404, "Conversation not found!");
    }

    // Check if the user is the admin of the group
    if (!conversation.admin.equals(userId)) {
      return errorResponse(
        res,
        403,
        "You are not authorized to add participants to this group!"
      );
    }

    // Find the new participant by email
    const newParticipant = await User.findOne({ email: newParticipantEmail });

    if (!newParticipant) {
      return errorResponse(res, 404, "New participant not found!");
    }

    // Check if the new participant is already in the conversation
    if (
      conversation.participants.some((participant) =>
        participant.equals(newParticipant._id)
      )
    ) {
      return errorResponse(
        res,
        400,
        "User is already a participant in this group!"
      );
    }

    // Add the new participant to the conversation
    conversation.participants.push(newParticipant._id);
    await conversation.save();

    return successResponse(res, {
      message: "New participant added successfully!",
      conversation,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};

// Remove participant from group chat controller
export const removeParticipantFromGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { conversationId, participantId } = req.body;

    if (!userId || !conversationId || !participantId) {
      return errorResponse(res, 400, "Missing details to remove participant!");
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return errorResponse(res, 404, "Conversation not found!");
    }

    // Check if the user is the admin of the group
    if (!conversation.admin.equals(userId)) {
      return errorResponse(
        res,
        403,
        "You are not authorized to remove participants from this group!"
      );
    }

    // Check if the participant exists in the conversation
    if (
      !conversation.participants.some((participant) =>
        participant.equals(participantId)
      )
    ) {
      return errorResponse(res, 404, "Participant not found in this group!");
    }

    // Remove the participant from the conversation
    conversation.participants = conversation.participants.filter(
      (participant) => !participant.equals(participantId)
    );

    await conversation.save();

    return successResponse(res, {
      message: "Participant removed successfully!",
      conversation,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(res, 500, "Internal server error: " + errMessage);
  }
};
