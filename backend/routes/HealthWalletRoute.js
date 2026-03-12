import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
  getHealthWallet,
  saveHealthWallet,
  symptomCheck,
  searchDoctors,
  analyzePrescription,
} from "../controller/HealthWalletController.js";

const HealthWalletRoute = express.Router();

HealthWalletRoute.get("/health-wallet", isAuth, getHealthWallet);
HealthWalletRoute.post("/health-wallet", isAuth, saveHealthWallet);
HealthWalletRoute.post("/symptom-check", symptomCheck);
HealthWalletRoute.get("/doctor-search", searchDoctors);
HealthWalletRoute.post("/analyze-prescription", analyzePrescription);

export default HealthWalletRoute;
