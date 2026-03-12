import mongoose from "mongoose";

// Sub-schema for emergency contacts
const ContactDetailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  relation: {
    type: String,
    
  },
  location: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
});

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Person_name: {
    type: String,
    enum: ["myself", "someone else"], // only two options
    required: true,
  },
  FullName: {
    type: String,
    required: true,
  },
  DateOfBirth: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // optional validation
  },
  Height: {
    type: String,
  },
  Weight: {
    type: String,
  },
  OrganDonor: {
    type: String,
    enum: ["yes", "no", "undecided"],
  },
  Allergies: {
    type: String,
  },
  CurrentMedications: {
    type: String,
  },
  MedicalConditions: {
    type: String,
  },
  contactDetails: {
    type: [ContactDetailSchema],
    default: [],
  },
  InsuranceProvider: {
    type: String,
  },
  PolicyNumber: {
    type: String,
  },
  fcmToken: {
    type: String, // Store Firebase Cloud Messaging Token
  },
}, { timestamps: true }); // automatically adds createdAt and updatedAt

export const Profile = mongoose.model("Profile", ProfileSchema);