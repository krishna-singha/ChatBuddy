import mongoose from "mongoose";
import OtherUser from "../models/OtherUser";
import User from "../models/User"; // Make sure you import User model
import { Request, Response } from "express";

// Extend the Request interface to include `user`
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getOtherUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user._id.toString();
    const user = await User.findById(userId).select("email");
    const userEmail = user?.email;

    const otherUsersDoc = await OtherUser.findOne({ userEmail });

    if (!otherUsersDoc || otherUsersDoc.otherUserEmails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No other users found",
      });
    }

    // Get full details of other users by matching emails
    const otherUserDetails = await User.find({
      email: { $in: otherUsersDoc.otherUserEmails },
    }).select("-password -__v -createdAt -updatedAt");

    return res.status(200).json({
      success: true,
      otherUsers: otherUserDetails,
    });
  } catch (error) {
    console.error("Error in getting other users for sidebar:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Add other user to the list
export const addOtherUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user._id.toString();
    const otherUserEmail = req.params.email;

    // check first is user exists in this system
    const otherUser = await User.findOne({ email: otherUserEmail });
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = await User.findById(userId).select("email");
    const userEmail = user?.email;

    // // Check if the user already has a record in other users collection
    let userDoc = await OtherUser.findOne({ userEmail });
    
    if (userDoc) {
      // If the other user is already in the list, reject
      const alreadyExists = userDoc.otherUserEmails.some(
        (email) => email === otherUserEmail
      );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: "Other user already exists",
        });
      }

      // Add and save
      userDoc.otherUserEmails.push(otherUserEmail);
      await userDoc.save();
    } else {
      // Create a new document if it doesn’t exist
      await OtherUser.create({
        userEmail: userEmail,
        otherUserEmails: [otherUserEmail],
      });
    }

    // Optionally, you can also fetch the newly added user details
    const newOtherUsers = await User.find({
      email: { $in: otherUserEmail },
    }).select("-password -__v -createdAt -updatedAt");

    return res.status(201).json({
      success: true,
      newOtherUsers,
      message: "Other user added successfully",
    });
  } catch (error) {
    console.error("Error in adding other user", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
