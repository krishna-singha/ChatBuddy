import express from 'express';
import { authMiddleware } from "../middleware/auth"
import { getOtherUsers, addOtherUser } from '../controllers/otherUsersController';

const otherUserRouter = express.Router();

otherUserRouter.get("/users", authMiddleware, getOtherUsers);
otherUserRouter.post("/add/:email", authMiddleware, addOtherUser);

export default otherUserRouter;