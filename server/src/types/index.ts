import { Document } from "mongoose";

export interface UserDocument extends Document {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
}