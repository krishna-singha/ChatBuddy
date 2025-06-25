import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils";
import { Request, Response } from "express";
import cloudinary from "../lib/cloudinary";

// Extend the Request interface to include `user`
interface AuthenticatedRequest extends Request {
  user?: any;
}

// User signup controller
export const signup = async (req: Request, res: Response): Promise<any> => {
  
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing user details!" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = generateToken(newUser._id.toString());

    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// User login controller
export const login = async (req: Request, res: Response): Promise<any>  => {
  
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Missing user details!" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist!" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password!" });
    }
    const token = generateToken(user._id.toString());
    return res.status(200).json({
      success: true,
      message: "User logged in successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// controller to check if user is authenticated
export const isAuthenticated = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  return res.status(200).json({
    success: true,
    message: "User is authenticated",
    user: req.user,
  });
};

// controller to update user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { avatar, name, bio, avatarPublicId } = req.body;

    const userId = req.user._id;
    let updatedUser;

    if (!avatar) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, bio },
        { new: true }
      );
    } else {
      // Delete old avatar if public ID is provided
      if (avatarPublicId) {
        try {
          await cloudinary.uploader.destroy(avatarPublicId);
        } catch (err) {
          console.warn("Failed to delete old avatar:", err);
        }
      }

      // Upload new avatar
      const uploadedImage = await cloudinary.uploader.upload(avatar, {
        folder: "ChatBuddy/avatars",
      });

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          avatar: uploadedImage.secure_url, 
          avatarPublicId: uploadedImage.public_id, 
          name, 
          bio 
        },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};
