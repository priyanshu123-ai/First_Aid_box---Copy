import express from "express";
import {
  profileDetailById,
  upsertProfile,
  updateProfileById,
  profileByPersonName, // ✅ Import this controller too
} from "../controller/Profile.js";

const userProfileRoute = express.Router();

// 🟢 Create or upsert profile
userProfileRoute.post("/profile", upsertProfile);

// 🟢 Get profile by MongoDB ID
userProfileRoute.get("/profileDetail/:id", profileDetailById);

// 🟢 Update profile by ID
userProfileRoute.put("/profile/:id", updateProfileById);

// 🟢 Get profile by Person_name ("myself" or "someone else")
userProfileRoute.get("/profile/person/:type", profileByPersonName); // ✅ Added route

export default userProfileRoute;
