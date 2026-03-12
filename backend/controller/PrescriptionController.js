import HealthWallet from "../model/HealthWallet.model.js";
import { v2 as cloudinary } from "cloudinary";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { analyzePrescriptionText } from "../utils/MedicalEngine.js";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ===== Upload Prescription Image to Cloudinary =====
export const uploadPrescription = async (req, res) => {
  try {
    const { imageBase64, title } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "No image provided." });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "prescriptions",
      resource_type: "image",
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    });

    // Get or create wallet
    let wallet = await HealthWallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = await HealthWallet.create({ userId: req.userId });
    }

    // Add prescription to wallet
    const prescription = {
      imageUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      title: title || "Prescription",
      uploadedAt: new Date(),
    };

    wallet.prescriptions.push(prescription);
    await wallet.save();

    const savedPrescription = wallet.prescriptions[wallet.prescriptions.length - 1];

    res.status(200).json({
      success: true,
      data: savedPrescription,
      message: "Prescription uploaded successfully!",
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ success: false, message: "Failed to upload prescription." });
  }
};

import Tesseract from "tesseract.js";

// ===== OCR: Extract text from prescription image using Tesseract + Groq =====
export const ocrPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.body;

    if (!prescriptionId) {
      return res.status(400).json({ success: false, message: "Prescription ID required." });
    }

    const wallet = await HealthWallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found." });
    }

    const prescription = wallet.prescriptions.id(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found." });
    }

    // 1. Tesseract OCR processing
    console.log("Starting Tesseract OCR on:", prescription.imageUrl);
    const { data: { text: rawText } } = await Tesseract.recognize(prescription.imageUrl, "eng", {
      logger: m => console.log(m)
    });
    
    if (!rawText || rawText.trim().length === 0) {
      return res.status(500).json({ success: false, message: "Could not read any text from the given image." });
    }

    // 2. Groq text formatting processing
    console.log("Structuring Tesseract OCR text with Groq Llama 3.3...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a medical OCR expert. You will receive raw, messy text compiled from an OCR scan of a medical prescription. Clean it up, fix basic typos, and extract ALL details with extreme accuracy. Include:
1. Doctor's name and qualifications
2. Hospital/clinic name and address 
3. Patient details if visible
4. Date of prescription
5. All medications with dosage, frequency, and duration
6. Diagnosis/conditions mentioned
7. Any special instructions or precautions
8. Follow-up date if mentioned

Format the extracted text clearly with proper labels. If text is in Hindi or any regional language, transliterate it to English as well. Be thorough — capture every piece of text visible in the image. Return ONLY the cleaned and formatted plain text.`
        },
        {
          role: "user",
          content: rawText,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 2048,
    });

    const ocrText = chatCompletion.choices[0]?.message?.content || rawText;

    // Save formatted OCR text to prescription
    prescription.ocrText = ocrText;
    await wallet.save();

    res.status(200).json({
      success: true,
      data: { ocrText, prescriptionId },
      message: "OCR text extracted successfully!",
    });
  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ success: false, message: "Failed to extract text. Try again." });
  }
};

// ===== Translate OCR text using GROQ =====
export const translatePrescription = async (req, res) => {
  try {
    const { prescriptionId, targetLanguage } = req.body;

    if (!prescriptionId || !targetLanguage) {
      return res.status(400).json({ success: false, message: "Prescription ID and target language required." });
    }

    const wallet = await HealthWallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found." });
    }

    const prescription = wallet.prescriptions.id(prescriptionId);
    if (!prescription || !prescription.ocrText) {
      return res.status(404).json({ success: false, message: "No OCR text found. Run OCR first." });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a medical translator. Translate the following medical prescription text to ${targetLanguage}. Keep medical terminology accurate. Maintain the same format and structure.`,
        },
        {
          role: "user",
          content: prescription.ocrText,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 2048,
    });

    const translatedText = chatCompletion.choices[0]?.message?.content || "";

    prescription.translatedText = translatedText;
    prescription.ocrLanguage = targetLanguage;
    await wallet.save();

    res.status(200).json({
      success: true,
      data: { translatedText, targetLanguage },
      message: `Translated to ${targetLanguage} successfully!`,
    });
  } catch (err) {
    console.error("Translation Error:", err);
    res.status(500).json({ success: false, message: "Translation failed." });
  }
};

// ===== AI Analysis of OCR text =====
export const analyzeOcrPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.body;

    if (!prescriptionId) {
      return res.status(400).json({ success: false, message: "Prescription ID required." });
    }

    const wallet = await HealthWallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found." });
    }

    const prescription = wallet.prescriptions.id(prescriptionId);
    if (!prescription || !prescription.ocrText) {
      return res.status(404).json({ success: false, message: "No OCR text found. Run OCR first." });
    }

    // Use GROQ for deep AI analysis
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a highly experienced medical prescription analyzer AI with deep pharmaceutical and clinical knowledge. Analyze the prescription text thoroughly and return a JSON response with this exact structure:
{
  "medications": [
    {
      "name": "...",
      "dosage": "...",
      "frequency": "...",
      "duration": "...",
      "purpose": "Why this medicine is prescribed — explain clearly",
      "howItWorks": "Brief mechanism of action in simple terms",
      "sideEffects": ["common side effect 1", "common side effect 2"],
      "precautions": ["precaution 1", "precaution 2"],
      "foodInteractions": "Take before/after food, avoid certain foods etc."
    }
  ],
  "diagnosedConditions": ["condition 1"],
  "conditionExplanation": "Explain what the diagnosed condition is, why it occurs, and how serious it can be in simple language",
  "recommendedSpecialist": "Type of doctor to visit (e.g. Cardiologist, ENT Specialist)",
  "whyThisSpecialist": "Explain why this type of doctor is recommended for the condition",
  "severity": "Mild|Moderate|Severe|Critical",
  "warnings": ["important warning 1", "important warning 2"],
  "precautions": [
    "General precaution like rest, hydration etc.",
    "When to seek emergency care",
    "Activities to avoid during treatment"
  ],
  "dietaryAdvice": [
    "Foods to eat during recovery",
    "Foods and drinks to avoid",
    "Nutritional tips for faster recovery"
  ],
  "lifestyleRecommendations": [
    "Sleep and rest recommendations",
    "Exercise guidance during treatment",
    "Hygiene and preventive measures"
  ],
  "followUpActions": ["action 1", "action 2"],
  "whenToSeeDoctor": ["Red flag symptom 1 that needs immediate medical attention", "Red flag symptom 2"],
  "summary": "A comprehensive 2-3 sentence summary of the prescription, what it treats, and the overall treatment plan",
  "doctorName": "...",
  "hospitalName": "...",
  "prescriptionDate": "..."
}
Be thorough, accurate, and patient-friendly. Explain medical terms in simple language. If a field cannot be determined, use reasonable defaults based on the medications and conditions present. Return ONLY the JSON, no extra text.`,
        },
        {
          role: "user",
          content: prescription.ocrText,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 4096,
    });

    let analysisText = chatCompletion.choices[0]?.message?.content || "{}";

    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    let analysis;
    try {
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
    } catch {
      // Fallback to local engine
      analysis = analyzePrescriptionText(prescription.ocrText);
    }

    // Ensure all fields exist
    analysis.medications = (analysis.medications || []).map((m) => ({
      name: m.name || "Unknown",
      dosage: m.dosage || "",
      frequency: m.frequency || "",
      duration: m.duration || "",
      purpose: m.purpose || "",
      howItWorks: m.howItWorks || "",
      sideEffects: m.sideEffects || [],
      precautions: m.precautions || [],
      foodInteractions: m.foodInteractions || "",
    }));
    analysis.diagnosedConditions = analysis.diagnosedConditions || [];
    analysis.conditionExplanation = analysis.conditionExplanation || "";
    analysis.warnings = analysis.warnings || [];
    analysis.precautions = analysis.precautions || [];
    analysis.dietaryAdvice = analysis.dietaryAdvice || [];
    analysis.lifestyleRecommendations = analysis.lifestyleRecommendations || [];
    analysis.followUpActions = analysis.followUpActions || [];
    analysis.whenToSeeDoctor = analysis.whenToSeeDoctor || [];
    analysis.severity = analysis.severity || "Mild";
    analysis.recommendedSpecialist = analysis.recommendedSpecialist || "General Physician";
    analysis.whyThisSpecialist = analysis.whyThisSpecialist || "";
    analysis.summary = analysis.summary || "Analysis completed.";

    // Save analysis
    prescription.analysis = analysis;
    await wallet.save();

    res.status(200).json({
      success: true,
      data: analysis,
      message: "Prescription analyzed successfully!",
    });
  } catch (err) {
    console.error("Analysis Error:", err);
    res.status(500).json({ success: false, message: "Analysis failed." });
  }
};

// ===== Get all prescriptions =====
export const getPrescriptions = async (req, res) => {
  try {
    const wallet = await HealthWallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Sort by uploadedAt descending
    const sorted = [...wallet.prescriptions].sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );

    res.status(200).json({ success: true, data: sorted });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch prescriptions." });
  }
};

// ===== Delete a prescription =====
export const deletePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const wallet = await HealthWallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found." });
    }

    const prescription = wallet.prescriptions.id(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found." });
    }

    // Delete from Cloudinary
    if (prescription.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(prescription.cloudinaryId);
      } catch (e) {
        console.warn("Cloudinary delete failed:", e.message);
      }
    }

    // Remove from wallet
    wallet.prescriptions.pull(prescriptionId);
    await wallet.save();

    res.status(200).json({ success: true, message: "Prescription deleted successfully!" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete prescription." });
  }
};

// ===== Verify PIN =====
export const verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;

    const wallet = await HealthWallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found." });
    }

    if (!wallet.securityPin) {
      return res.status(200).json({ success: true, verified: true, message: "No PIN set." });
    }

    if (wallet.securityPin === pin) {
      return res.status(200).json({ success: true, verified: true, message: "PIN verified." });
    } else {
      return res.status(401).json({ success: false, verified: false, message: "Incorrect PIN." });
    }
  } catch (err) {
    console.error("PIN Verify Error:", err);
    res.status(500).json({ success: false, message: "Failed to verify PIN." });
  }
};
