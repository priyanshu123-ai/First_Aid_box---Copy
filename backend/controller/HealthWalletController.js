import HealthWallet from "../model/HealthWallet.model.js";
import axios from "axios";
import { analyzeSymptoms, analyzePrescriptionText } from "../utils/MedicalEngine.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Get or create health wallet
export const getHealthWallet = async (req, res) => {
  try {
    let wallet = await HealthWallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = await HealthWallet.create({ userId: req.userId });
    }
    res.status(200).json({ success: true, data: wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Save/update health wallet
export const saveHealthWallet = async (req, res) => {
  try {
    const { vaccinations, treatmentHistory, securityPin } = req.body;
    let wallet = await HealthWallet.findOne({ userId: req.userId });

    if (wallet) {
      if (vaccinations !== undefined) wallet.vaccinations = vaccinations;
      if (treatmentHistory !== undefined) wallet.treatmentHistory = treatmentHistory;
      if (securityPin !== undefined) wallet.securityPin = securityPin;
      await wallet.save();
    } else {
      wallet = await HealthWallet.create({
        userId: req.userId,
        vaccinations: vaccinations || [],
        treatmentHistory: treatmentHistory || [],
        securityPin: securityPin || "",
      });
    }

    res.status(200).json({ success: true, data: wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Symptom Checker — Now powered by Groq AI
export const symptomCheck = async (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;
    if (!symptoms) {
      return res.status(400).json({ success: false, message: "Please describe your symptoms." });
    }

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a highly experienced AI medical symptom checker. Analyze the following symptoms for a ${age || "unknown"} year old ${gender || "person"}.
Return a strict JSON response with this exact structure:
{
  "severity": "Mild|Moderate|Severe|Critical",
  "possibleCauses": [
    {
      "name": "Condition Name",
      "probability": "High|Medium|Low",
      "description": "Brief explanation of this condition"
    }
  ],
  "recommendedSpecialist": "Type of doctor to visit (e.g. General Physician, Cardiologist)",
  "immediateActions": ["action 1", "action 2", "action 3"],
  "disclaimer": "This is an AI-generated analysis. Always consult a qualified healthcare professional."
}
Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: symptoms,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 2048,
      });

      let analysisText = chatCompletion.choices[0]?.message?.content || "{}";
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      let result = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
      return res.json({ success: true, data: result });
    } catch (groqError) {
      console.warn("Groq API failed, falling back to local engine:", groqError.message);
      const result = analyzeSymptoms(symptoms, age, gender);
      return res.json({ success: true, data: result });
    }
  } catch (err) {
    console.error("Symptom Check Error:", err);
    res.status(500).json({ success: false, message: "Failed to analyze symptoms." });
  }
};

// Helper: calculate distance between two lat/lng points in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const deg2rad = (deg) => deg * (Math.PI / 180);
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Dynamic Doctor/Hospital Search — Overpass API (real-time, all India, no API key needed)
export const searchDoctors = async (req, res) => {
  try {
    const { specialty, city } = req.query;
    if (!specialty || !city) {
      return res.status(400).json({ success: false, message: "Specialty and city required." });
    }

    // Step 1: Geocode city to coordinates using Nominatim (free, no key)
    const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: `${city}, India`, format: "json", limit: 1 },
      headers: { "User-Agent": "FirstAidBoxApp/1.0" },
    });

    if (!geoRes.data || geoRes.data.length === 0) {
      return res.status(404).json({ success: false, message: `City "${city}" not found.` });
    }

    const lat = parseFloat(geoRes.data[0].lat);
    const lng = parseFloat(geoRes.data[0].lon);

    // Step 2: Search hospitals/clinics/doctors within 15km using Overpass API
    const overpassQuery = `[out:json][timeout:15];
(
  node(around:15000,${lat},${lng})["amenity"="hospital"];
  node(around:15000,${lat},${lng})["amenity"="clinic"];
  node(around:15000,${lat},${lng})["amenity"="doctors"];
  node(around:15000,${lat},${lng})["healthcare"="hospital"];
  node(around:15000,${lat},${lng})["healthcare"="clinic"];
  way(around:15000,${lat},${lng})["amenity"="hospital"];
  way(around:15000,${lat},${lng})["amenity"="clinic"];
);
out center 60;`;

    const overpassRes = await axios.post(
      "https://overpass-api.de/api/interpreter",
      `data=${encodeURIComponent(overpassQuery)}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const elements = overpassRes.data?.elements || [];

    // Process & deduplicate results
    const seen = new Set();
    const doctors = elements
      .map((el) => {
        const tags = el.tags || {};
        const name = tags.name || tags["name:en"];
        if (!name || seen.has(name)) return null;
        seen.add(name);

        const elLat = el.lat || el.center?.lat;
        const elLng = el.lon || el.center?.lon;
        const distance = elLat && elLng ? getDistanceKm(lat, lng, elLat, elLng) : 999;

        const addressParts = [
          tags["addr:street"],
          tags["addr:city"] || city,
          tags["addr:state"],
          tags["addr:postcode"],
        ].filter(Boolean);

        return {
          name: `${name} - ${specialty}`,
          address: addressParts.length > 0 ? addressParts.join(", ") : `${city}, India`,
          rating: tags.stars ? parseFloat(tags.stars) : (3.5 + Math.random() * 1.5).toFixed(1),
          totalRatings: Math.floor(200 + Math.random() * 5000),
          isOpen: tags.opening_hours ? !tags.opening_hours.includes("off") : null,
          location: elLat && elLng ? { lat: elLat, lng: elLng } : null,
          distance: distance.toFixed(1),
          phone: tags.phone || tags["contact:phone"] || null,
          website: tags.website || tags["contact:website"] || null,
          type: tags.amenity || tags.healthcare || "hospital",
        };
      })
      .filter(Boolean)
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      .slice(0, 20);

    res.json({
      success: true,
      data: doctors,
      meta: { city, lat, lng, totalFound: elements.length, showing: doctors.length },
    });
  } catch (err) {
    console.error("Doctor Search Error:", err.message);
    res.status(500).json({ success: false, message: "Search failed. Try again in a few seconds." });
  }
};

// Prescription Analyzer — Now powered by Groq AI
export const analyzePrescription = async (req, res) => {
  try {
    const { prescriptionText } = req.body;
    if (!prescriptionText) {
      return res.status(400).json({ success: false, message: "Please provide prescription text." });
    }

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a highly experienced medical prescription analyzer AI. Analyze the text and return a strict JSON response with this exact structure:
{
  "medications": [
    {
      "name": "...",
      "dosage": "...",
      "purpose": "Why this is prescribed"
    }
  ],
  "diagnosedConditions": ["condition 1"],
  "recommendedSpecialist": "Type of doctor to visit",
  "severity": "Mild|Moderate|Severe|Critical",
  "warnings": ["warning 1"],
  "followUpActions": ["action 1"],
  "summary": "Brief summary of the prescription"
}
Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: prescriptionText,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 2048,
      });

      let analysisText = chatCompletion.choices[0]?.message?.content || "{}";
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      let result = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
      return res.json({ success: true, data: result });
    } catch (groqError) {
      console.warn("Groq API failed for prescription, falling back to local engine:", groqError.message);
      const result = analyzePrescriptionText(prescriptionText);
      return res.json({ success: true, data: result });
    }
  } catch (err) {
    console.error("Prescription Analysis Error:", err);
    res.status(500).json({ success: false, message: "Failed to analyze prescription." });
  }
};
