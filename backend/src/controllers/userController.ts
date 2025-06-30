import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary";
import User from "../models/User";
import { generateToken } from "../utils/token";
import { AuthenticatedRequest } from "../types/interfaces"
import { IUser } from "../types/interfaces/models";
import { errorResponse, successResponse } from "../utils/responseHelper";


// Signup Controller
export const signup = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 400, "Missing user details!");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "User already exists!");
    }

    const hashedPassword = await bcrypt.hash(password, 11);
    const newUser = await User.create({ name, email, password: hashedPassword });

    const token = generateToken(newUser._id.toString());

    return successResponse(res, {
      message: "User created successfully!",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    }, 201);
  } catch (error) {
    console.error("Signup Error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

// Login Controller
export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, "Missing user details!");
  }

  try {
    const user = await User.findOne({ email });
    
    
    if (!user) {console.log(user); return errorResponse(res, 400, "User does not exist!");}

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 400, "Invalid password!");

    const token = generateToken(user._id.toString());

    return successResponse(res, {
      message: "User logged in successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

// Auth Check Controller
export const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  return res.status(200).json({
    success: true,
    message: "User is authenticated",
    user: req.user,
  });
};

// Update Profile Controller
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { avatar, avatarId, name, bio } = req.body;
  const userId = req.user?._id;

  try {
    const updatedData: Partial<IUser> = {};
    if (name) updatedData.name = name;
    if (bio) updatedData.bio = bio;

    // Concurrent Cloudinary destroy + upload
    if (avatar) {
      const promises: Promise<any>[] = [];

      if (avatarId) {
        promises.push(cloudinary.uploader.destroy(avatarId));
      }

      promises.push(
        cloudinary.uploader.upload(avatar, {
          folder: "ChatBuddy/avatars",
        })
      );

      const results = await Promise.allSettled(promises);
      const uploadResult = results.find(
        (r) => r.status === "fulfilled" && "secure_url" in r.value
      );

      if (!uploadResult || uploadResult.status !== "fulfilled") {
        return errorResponse(res, 500, "Failed to upload avatar.");
      }

      updatedData.avatar = uploadResult.value.secure_url;
      updatedData.avatarId = uploadResult.value.public_id;
    }

    if (Object.keys(updatedData).length === 0) {
      return successResponse(res, {
        message: "Nothing to update.",
        user: req.user,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, {
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

// Get user by email Controller
export const getUserByEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.params;

    if (!email) {
      return errorResponse(res, 400, "Email is required");
    }

    const user = await User.findOne({ email }).select("_id name email avatar");

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, {
      user,
    });
  } catch (error) {
    console.error("Get User By Email Error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};

// Get all users (excluding current user) for group chat creation
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      return errorResponse(res, 401, "User not authenticated");
    }

    // Get all users except the current user
    const users = await User.find({ 
      _id: { $ne: currentUserId } 
    }).select("name email avatar").limit(50); // Limit to prevent large responses

    return successResponse(res, {
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};
