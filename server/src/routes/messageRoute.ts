import express from "express"
import { authMiddleware } from "../middleware/auth"
import { getUsersForSidebar, getMessages, markMessagesAsSeen, sendMessage, getLatestMessages} from "../controllers/messageController"

const messageRouter = express.Router();

messageRouter.get("/user", authMiddleware, getUsersForSidebar);
messageRouter.get("/latest", authMiddleware, getLatestMessages);
messageRouter.get("/:id", authMiddleware, getMessages);
messageRouter.put("/mark/:id", authMiddleware, markMessagesAsSeen);
messageRouter.post("/send/:id", authMiddleware, sendMessage);

export default messageRouter;
