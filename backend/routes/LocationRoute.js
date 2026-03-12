import express from "express";
import { getNearestHospitals, triggerSOS } from "../controller/EmergencyController.js";
import { alert } from "../utils/nodemailer.js";
import { getChatResponse } from "../controller/ChatbotSchema.js";

const LocationRoute = express.Router();

LocationRoute.get("/location", getNearestHospitals);
LocationRoute.post("/mail",alert)
LocationRoute.post("/message",getChatResponse);
LocationRoute.post("/sos", triggerSOS);

export default LocationRoute;
