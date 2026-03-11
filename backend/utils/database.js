import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const database = async () => {
    try {
       await mongoose.connect(process.env.MONGODB_URL);
       console.log("MongoDB connected");
    } catch (error) {
        console.log("MongoDB connection error:", error);
    }
}

export default database;
