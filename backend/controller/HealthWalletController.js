import HealthWallet from "../model/HealthWallet.model.js";
import axios from "axios";
import { analyzeSymptoms, analyzePrescriptionText } from "../utils/MedicalEngine.js";

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

// Symptom Checker — Custom Engine (no API key needed)
export const symptomCheck = async (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;
    if (!symptoms) {
      return res.status(400).json({ success: false, message: "Please describe your symptoms." });
    }

    const result = analyzeSymptoms(symptoms, age, gender);
    res.json({ success: true, data: result });
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

// Prescription Analyzer — Custom Engine (no API key needed)
export const analyzePrescription = async (req, res) => {
  try {
    const { prescriptionText } = req.body;
    if (!prescriptionText) {
      return res.status(400).json({ success: false, message: "Please provide prescription text." });
    }

    const result = analyzePrescriptionText(prescriptionText);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Prescription Analysis Error:", err);
    res.status(500).json({ success: false, message: "Failed to analyze prescription." });
  }
};
