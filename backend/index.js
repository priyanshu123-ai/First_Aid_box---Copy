import express from "express"
import dotenv from "dotenv"
import database from "./utils/database.js";
import UserRouter from "./routes/UserRoute.js";

import cookieParser from "cookie-parser";

import cors from "cors"
import ImageRouter from "./routes/ImageRoute.js";
import userProfileRoute from "./routes/ProfileRoute.js";
import LocationRoute from "./routes/LocationRoute.js";
import HealthWalletRoute from "./routes/HealthWalletRoute.js";


const app = express();

app.use(express.json());

const port = process.env.PORT || 4000

app.use(cookieParser())

app.use(
    cors({
        origin:["https://first-aid-box-6.onrender.com","http://localhost:5173","http://localhost:5174"],
        credentials: true
    })
)

database()

app.use("/api/v1",UserRouter);

app.use("/api/v2",ImageRouter);

app.use("/api/v3",userProfileRoute)

app.use("/api/v4",LocationRoute)

app.use("/api/v5",HealthWalletRoute)

app.listen(port,() => {
    console.log(`Server is Running at Port NO ${port}`);
})





