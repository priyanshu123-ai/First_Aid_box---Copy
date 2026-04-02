import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const database = async () => {
    try {
       await mongoose.connect(process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/FirstAidBox");
       console.log("MongoDB connected");
    } catch (error) {
        console.log("MongoDB connection error:", error);
    }
}

export default database;
