import mongoose from "mongoose";

const otherUserSchema = new mongoose.Schema({
    userEmail: {type: String, required: true},
    otherUserEmails: [{type: String}],
}, { timestamps: true })

const OtherUser = mongoose.model("OtherUser", otherUserSchema, "otherUsers");

export default OtherUser;