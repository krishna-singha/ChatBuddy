import express from 'express';
import { authMiddleware } from "../middleware/auth"
import { signup, login, updateProfile, isAuthenticated, getUserByEmail, getAllUsers } from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/register', signup);
userRouter.post('/login', login);
userRouter.get('/check', authMiddleware, isAuthenticated);
userRouter.put('/profile', authMiddleware, updateProfile);
userRouter.get('/user-by-email/:email', authMiddleware, getUserByEmail);
userRouter.get('/users', authMiddleware, getAllUsers);

export default userRouter;