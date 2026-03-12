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
    securityPin: { type: String, default: "" },
  },
  { timestamps: true }
);

const HealthWallet = mongoose.model("HealthWallet", healthWalletSchema);
export default HealthWallet;
