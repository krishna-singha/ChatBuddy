import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    avatar: {type: String, default: ""},
    avatarPublicId: {type: String, default: ""},
    // isOnline: {type: Boolean, default: false},
    bio: {type: String, default: ""},
}, {timestamps: true})

const User = mongoose.model("User", userSchema, "users");

export default User;