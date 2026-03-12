import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
  getHealthWallet,
  saveHealthWallet,
  symptomCheck,
  searchDoctors,
  analyzePrescription,
} from "../controller/HealthWalletController.js";
import {
  uploadPrescription,
  ocrPrescription,
  translatePrescription,
  analyzeOcrPrescription,
  getPrescriptions,
  deletePrescription,
  verifyPin,
} from "../controller/PrescriptionController.js";

const HealthWalletRoute = express.Router();

// Existing routes
HealthWalletRoute.get("/health-wallet", isAuth, getHealthWallet);
HealthWalletRoute.post("/health-wallet", isAuth, saveHealthWallet);
HealthWalletRoute.post("/symptom-check", symptomCheck);
HealthWalletRoute.get("/doctor-search", searchDoctors);
HealthWalletRoute.post("/analyze-prescription", analyzePrescription);

// New Prescription Vault routes
HealthWalletRoute.post("/prescription/upload", isAuth, uploadPrescription);
HealthWalletRoute.post("/prescription/ocr", isAuth, ocrPrescription);
HealthWalletRoute.post("/prescription/translate", isAuth, translatePrescription);
HealthWalletRoute.post("/prescription/analyze", isAuth, analyzeOcrPrescription);
HealthWalletRoute.get("/prescriptions", isAuth, getPrescriptions);
HealthWalletRoute.delete("/prescription/:prescriptionId", isAuth, deletePrescription);
HealthWalletRoute.post("/verify-pin", isAuth, verifyPin);

export default HealthWalletRoute;
