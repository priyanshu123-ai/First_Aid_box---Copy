import express from "express";
import {
  profileDetailById,
  upsertProfile,
  updateProfileById,
  profileByPersonName, // ✅ Import this controller too
  saveFCMToken, // ✅ Import saveFCMToken controller
} from "../controller/Profile.js";
import isAuth from "../middleware/isAuth.js";

const userProfileRoute = express.Router();

// 🟢 Create or upsert profile
userProfileRoute.post("/profile", isAuth, upsertProfile);

// 🟢 Get profile by MongoDB ID
userProfileRoute.get("/profileDetail/:id", profileDetailById);

// 🟢 Update profile by ID
userProfileRoute.put("/profile/:id", isAuth, updateProfileById);

// 🟢 Get profile by Person_name ("myself" or "someone else")
userProfileRoute.get("/profile/person/:type", isAuth, profileByPersonName); // ✅ Added route

// 🟢 Save FCM token
userProfileRoute.post("/profile/token", isAuth, saveFCMToken);

export default userProfileRoute;
