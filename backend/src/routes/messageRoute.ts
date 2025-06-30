import express from "express";
import { authMiddleware } from "../middleware/auth"
import { sendMessageToUser, markMessageAsSeen, getUnseenMessagesCount, getMessagesInConversation, deleteMessage} from "../controllers/messageController"

const messageRouter = express.Router();

messageRouter.post("/send", authMiddleware, sendMessageToUser);
messageRouter.patch("/mark-seen/:messageId", authMiddleware, markMessageAsSeen);
messageRouter.get("/unseen-count", authMiddleware, getUnseenMessagesCount);
messageRouter.get("/:conversationId", authMiddleware, getMessagesInConversation);
messageRouter.delete("/:messageId", authMiddleware, deleteMessage);

export default messageRouter;

