import mongoose from "mongoose";

export const connectDatabase = async ( ) => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("Database connected");
        })
        await mongoose.connect(`${process.env.MONGODB_URI}/chat_app`);
    }
    catch (error) {
        console.log(error);
    }
}