import express from "express";
import { authMiddleware } from "../middleware/auth"
import { getAllConversations, getConversationDetails, startNewPrivateChat, startNewGroupChat, changeGroupName, addParticipantToGroup, removeParticipantFromGroup, deleteConversation, leaveGroupChat } from "../controllers/conversationController";

const conversionRouter = express.Router();

conversionRouter.get("/", authMiddleware, getAllConversations);
conversionRouter.get("/:conversationId", authMiddleware, getConversationDetails);
conversionRouter.post("/start", authMiddleware, startNewPrivateChat);
conversionRouter.post("/group/start", authMiddleware, startNewGroupChat);
conversionRouter.put("/group/name", authMiddleware, changeGroupName);
conversionRouter.put("/group/add", authMiddleware, addParticipantToGroup);
conversionRouter.put("/group/remove", authMiddleware, removeParticipantFromGroup);
conversionRouter.delete("/:conversationId", authMiddleware, deleteConversation);
conversionRouter.delete("/group/leave/:conversationId", authMiddleware, leaveGroupChat);

export default conversionRouter;