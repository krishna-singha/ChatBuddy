import express from 'express';
import { signup, login, isAuthenticated, updateProfile } from '../controllers/userController';
import { authMiddleware } from "../middleware/auth"

const userRouter = express.Router();

userRouter.post('/register', signup);
userRouter.post('/login', login);
userRouter.put('/update-profile', authMiddleware, updateProfile);
userRouter.get('/check', authMiddleware, isAuthenticated);

export default userRouter;