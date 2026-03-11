import express from "express"
import { getCurrentUser, login, logout, register } from "../controller/User.controller.js";
import isAuth from "../middleware/isAuth.js";

const UserRouter = express.Router();

UserRouter.post("/register",register)
UserRouter.post("/login",login)
UserRouter.post("/logout",logout)
UserRouter.get("/current",isAuth,getCurrentUser)

export default UserRouter

