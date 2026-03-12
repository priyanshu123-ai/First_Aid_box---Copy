import mongoose from "mongoose";

const vaccinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String },
  provider: { type: String },
  batchNumber: { type: String },
});

const treatmentSchema = new mongoose.Schema({
  condition: { type: String, required: true },
  doctor: { type: String },
  hospital: { type: String },
  date: { type: String },
  notes: { type: String },
});

const prescriptionSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  cloudinaryId: { type: String },
  ocrText: { type: String, default: "" },
  ocrLanguage: { type: String, default: "en" },
  translatedText: { type: String, default: "" },
  analysis: {
    medications: [{ name: String, dosage: String, purpose: String }],
    diagnosedConditions: [String],
    recommendedSpecialist: { type: String },
    severity: { type: String },
    warnings: [String],
    followUpActions: [String],
    summary: { type: String },
    doctorName: { type: String },
    hospitalName: { type: String },
    prescriptionDate: { type: String },
  },
  title: { type: String, default: "Prescription" },
  uploadedAt: { type: Date, default: Date.now },
});

const healthWalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    vaccinations: [vaccinationSchema],
    treatmentHistory: [treatmentSchema],
    prescriptions: [prescriptionSchema],
    securityPin: { type: String, default: "" },
  },
  { timestamps: true }
);

const HealthWallet = mongoose.model("HealthWallet", healthWalletSchema);
export default HealthWallet;
