import axios from "axios";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import sendPushNotification from "../utils/pushNotification.js";

// ─── In-memory store for ambulance acceptance tokens (TTL: 30 min) ───────────
const patientStore = new Map();
const TOKEN_TTL_MS = 30 * 60 * 1000;

function storePatient(data) {
  const token = randomUUID();
  patientStore.set(token, data);
  setTimeout(() => patientStore.delete(token), TOKEN_TTL_MS);
  return token;
}

export const getNearestHospitals = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Coordinates are required" });
    }

    // Overpass API query for hospitals within 10 km radius
    const url = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:10000,${lat},${lng})["amenity"="hospital"];out;`;

    const response = await axios.get(url);

    if (!response.data.elements) {
      return res.status(500).json({ message: "No hospital data found" });
    }

    const hospitals = response.data.elements.map((el) => {
      const tags = el.tags || {};

      const addressParts = [
        tags["addr:housenumber"],
        tags["addr:street"],
        tags["addr:city"],
        tags["addr:postcode"],
        tags["addr:state"],
        tags["addr:country"],
      ].filter(Boolean);

      // Extract phone number from various OSM tags
      const phone =
        tags.phone ||
        tags["contact:phone"] ||
        tags["phone:emergency"] ||
        tags["contact:mobile"] ||
        null;

      // Extract other useful info
      const email = tags.email || tags["contact:email"] || null;
      const website = tags.website || tags["contact:website"] || null;
      const emergency = tags.emergency || null;
      const openingHours = tags.opening_hours || null;

      // Calculate distance from current location
      const distance = getDistanceFromLatLonInKm(lat, lng, el.lat, el.lon);

      return {
        id: el.id,
        name: tags.name || "Unknown Hospital",
        lat: el.lat,
        lon: el.lon,
        address: addressParts.join(", ") || "Address not available",
        phone,
        email,
        website,
        emergency,
        openingHours,
        distance,
      };
    });

    // Sort hospitals by nearest distance
    hospitals.sort((a, b) => a.distance - b.distance);

    // Return only the top 5 nearest hospitals
    const nearestFive = hospitals.slice(0, 5);

    res.status(200).json({
      message: "Nearby hospitals fetched successfully",
      count: nearestFive.length,
      data: nearestFive,
    });
  } catch (error) {
    console.error("Error fetching hospitals:", error.message);
    res.status(500).json({ message: "Failed to fetch nearby hospitals" });
  }
};

// Notify emergency contacts about the chosen hospital
export const notifyEmergencyContact = async (req, res) => {
  try {
    const {
      hospitalName,
      hospitalAddress,
      hospitalPhone,
      hospitalLat,
      hospitalLon,
      patientName,
      patientEmail,
      patientPhone,
      patientBloodGroup,
      patientAllergies,
      patientConditions,
      emergencyContacts,
    } = req.body;

    if (!emergencyContacts || emergencyContacts.length === 0) {
      return res
        .status(400)
        .json({ message: "No emergency contacts provided" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const hospitalMapLink = `https://www.google.com/maps?q=${hospitalLat},${hospitalLon}`;
    const hospitalDirectionsLink = `https://www.google.com/maps/dir/?api=1&destination=${hospitalLat},${hospitalLon}`;

    // Send email to each emergency contact
    const emailPromises = emergencyContacts.map((contact) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contact.email || patientEmail,
        subject: `🏥 Patient Alert: ${patientName || "A patient"} is heading to ${hospitalName}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 28px 24px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">🏥 Hospital Notification</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">
                A patient is being taken to the hospital below
              </p>
            </div>

            <!-- Patient Info -->
            <div style="padding: 24px;">
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 12px; color: #dc2626; font-size: 16px;">👤 Patient Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #374151; width: 140px;">Name:</td>
                    <td style="padding: 6px 0; color: #4b5563;">${patientName || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #374151;">Phone:</td>
                    <td style="padding: 6px 0; color: #4b5563;">${patientPhone || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #374151;">Blood Group:</td>
                    <td style="padding: 6px 0; color: #4b5563;">${patientBloodGroup || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #374151;">Allergies:</td>
                    <td style="padding: 6px 0; color: #4b5563;">${patientAllergies || "None reported"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #374151;">Conditions:</td>
                    <td style="padding: 6px 0; color: #4b5563;">${patientConditions || "None reported"}</td>
                  </tr>
                </table>
              </div>

              <!-- Hospital Info -->
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 12px; color: #1e40af; font-size: 16px;">🏥 Hospital Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #374151; width: 140px;">Hospital:</td>
                    <td style="padding: 6px 0; color: #4b5563; font-weight: 600;">${hospitalName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #374151;">Address:</td>
                    <td style="padding: 6px 0; color: #4b5563;">${hospitalAddress || "Address not available"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #374151;">Phone:</td>
                    <td style="padding: 6px 0; color: #4b5563;">${hospitalPhone || "Not available"}</td>
                  </tr>
                </table>
              </div>

              <!-- Action Buttons -->
              <div style="text-align: center; margin-top: 20px;">
                <a href="${hospitalMapLink}" 
                   style="display: inline-block; background: #1e40af; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 6px;">
                   📍 View Hospital on Map
                </a>
                <a href="${hospitalDirectionsLink}" 
                   style="display: inline-block; background: #16a34a; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 6px;">
                   🧭 Get Directions
                </a>
                ${hospitalPhone ? `
                <a href="tel:${hospitalPhone}" 
                   style="display: inline-block; background: #dc2626; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 6px;">
                   📞 Call Hospital
                </a>` : ""}
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f3f4f6; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated notification from Emergency Aid App.
              </p>
            </div>
          </div>
        `,
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    console.log(
      "Notification emails sent to:",
      emergencyContacts.map((c) => c.email || patientEmail).join(", ")
    );

    res.status(200).json({
      message: "Emergency contacts notified successfully",
      notifiedCount: emergencyContacts.length,
    });
  } catch (err) {
    console.error("Error notifying emergency contacts:", err.message);
    res
      .status(500)
      .json({ message: "Failed to notify emergency contacts", error: err.message });
  }
};

// Helper function to calculate distance between two coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const deg2rad = (deg) => deg * (Math.PI / 180);

  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}


export const triggerSOS = async (req, res) => {
  try {
    const { detail, location } = req.body;
    
    if (!detail || !location) {
        return res.status(400).json({ success: false, message: "User details and location are required" });
    }

    if (!detail.contactDetails || detail.contactDetails.length === 0) {
        return res.status(404).json({ success: false, message: "No emergency contacts found" });
    }

    // Prepare message content
    const title = "🚨 EMERGENCY ALERT 🚨";
    const body = `${detail.FullName || 'A user'} is in distress and has triggered an SOS alert. Please check the app for their live location.`;
    const locationUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

    // Array to keep track of successful pushes
    const successfulPushes = [];

    // Loop through contacts and find profiles matching their phone numbers
    for (const contact of detail.contactDetails) {
        // Find profile with this phone number
        // Clean the phone number string slightly if needed
        const contactPhone = contact.phoneNumber.trim(); 
        
        try {
            // Import Profile model lazily to avoid circular dependencies if any, otherwise import at top
            const { Profile } = await import("../model/Profile.model.js");
            
            // Note: In real scenarios, phone number formatting (e.g., country codes) should match
            const contactProfile = await Profile.findOne({ phone: contactPhone });

            if (contactProfile && contactProfile.fcmToken) {
                // We found a registered user with a device token
                await sendPushNotification(contactProfile.fcmToken, title, body, locationUrl);
                successfulPushes.push(contact.name);
            }
        } catch (err) {
            console.error(`Error processing contact ${contact.name}:`, err);
        }
    }

    res.status(200).json({ 
        success: true, 
        message: "Push alerts processed",
        notifiedContacts: successfulPushes
    });

  } catch (error) {
     console.error("SOS Trigger Error:", error);
     res.status(500).json({ success: false, message: "Server error triggering SOS push notifications" });
  }
};

export const notifyHospital = async (req, res) => {
  try {
    const {
      email,
      patientName,
      location,
      bloodGroup,
      allergies,
      criticalDisease,
      emergencyContact,
      emergencyContactName,
      hospitalName,
      hospitalDistance,
    } = req.body;

    if (!email || !location) {
      return res.status(400).json({ message: "Email and location are required" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Array.isArray(email) ? email.join(",") : email,
      subject: `🚨 AMBULANCE REQUEST — Patient Incoming: ${patientName || "Unknown Patient"}`,
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background:#f3f4f6; font-family:'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:24px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 6px 30px rgba(0,0,0,0.12);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#0f172a,#1e3a8a); padding:32px 24px; text-align:center;">
                    <div style="font-size:52px; margin-bottom:8px;">🚑</div>
                    <h1 style="color:#ffffff; margin:0 0 6px; font-size:24px; font-weight:800; letter-spacing:1px;">AMBULANCE REQUEST</h1>
                    <p style="color:#93c5fd; margin:0; font-size:14px;">A patient requires immediate medical assistance</p>
                  </td>
                </tr>

                <!-- Alert Banner -->
                <tr>
                  <td style="background:#dc2626; padding:12px 24px; text-align:center;">
                    <p style="color:#fff; margin:0; font-size:15px; font-weight:700;">⚠️ URGENT — Please respond immediately</p>
                  </td>
                </tr>

                <!-- Patient Info -->
                <tr>
                  <td style="padding:28px 28px 0;">
                    <h2 style="color:#1e3a8a; margin:0 0 14px; font-size:17px; border-bottom:2px solid #bfdbfe; padding-bottom:8px;">👤 Patient Details</h2>
                    <table style="width:100%; border-collapse:collapse;">
                      <tr style="background:#f8faff;">
                        <td style="padding:10px 12px; font-weight:700; color:#374151; width:42%;">Full Name</td>
                        <td style="padding:10px 12px; color:#111827; font-weight:600;">${patientName || "Not provided"}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Blood Group</td>
                        <td style="padding:10px 12px;">
                          <span style="background:#dc2626; color:#fff; padding:3px 12px; border-radius:20px; font-weight:700; font-size:14px;">${bloodGroup || "Unknown"}</span>
                        </td>
                      </tr>
                      <tr style="background:#fff7f7;">
                        <td style="padding:10px 12px; font-weight:700; color:#dc2626;">⚠️ Major Allergies</td>
                        <td style="padding:10px 12px; color:#b91c1c; font-weight:600;">${allergies || "None reported"}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Critical Disease</td>
                        <td style="padding:10px 12px; color:#111827;">${criticalDisease || "None reported"}</td>
                      </tr>
                      <tr style="background:#f8faff;">
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Emergency Contact</td>
                        <td style="padding:10px 12px; color:#111827;">
                          ${emergencyContactName ? `<strong>${emergencyContactName}</strong><br>` : ""}
                          <a href="tel:${emergencyContact}" style="color:#1e40af; font-weight:700;">${emergencyContact || "Not provided"}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Location -->
                <tr>
                  <td style="padding:24px 28px 0;">
                    <h2 style="color:#1e3a8a; margin:0 0 14px; font-size:17px; border-bottom:2px solid #bfdbfe; padding-bottom:8px;">📍 Patient Location</h2>
                    <div style="text-align:center; margin:16px 0;">
                      <a href="${mapsLink}"
                        style="display:inline-block; background:#1e40af; color:#fff; padding:14px 36px;
                               text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">
                        📍 View Patient Location on Google Maps
                      </a>
                    </div>
                    <p style="color:#6b7280; font-size:12px; text-align:center; margin:4px 0 0;">Coordinates: ${location.lat}, ${location.lng}</p>
                  </td>
                </tr>

                <!-- Nearest Hospital -->
                ${hospitalName ? `
                <tr>
                  <td style="padding:20px 28px 0;">
                    <h2 style="color:#1e3a8a; margin:0 0 14px; font-size:17px; border-bottom:2px solid #bfdbfe; padding-bottom:8px;">🏥 Nearest Hospital Identified</h2>
                    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:16px;">
                      <p style="margin:0; font-weight:700; color:#1e40af; font-size:15px;">${hospitalName}</p>
                      ${hospitalDistance ? `<p style="margin:6px 0 0; color:#6b7280; font-size:13px;">📏 Distance: ${hospitalDistance} km from patient</p>` : ""}
                    </div>
                  </td>
                </tr>` : ""}

                <!-- Footer -->
                <tr>
                  <td style="background:#f3f4f6; padding:20px 28px; text-align:center; margin-top:24px; border-top:1px solid #e5e7eb;">
                    <p style="margin:0; font-size:12px; color:#9ca3af;">
                      This is an automated Hospital Notification from <strong>Emergency First Aid App</strong>.<br/>
                      Please dispatch an ambulance immediately upon receiving this alert.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("Hospital notification email sent to:", email);

    res.status(200).json({ message: "Hospital notified successfully" });
  } catch (err) {
    console.error("notifyHospital error:", err.message);
    res.status(500).json({ message: "Failed to notify hospital", error: err.message });
  }
};

// ─── Call Ambulance: initial "Will you accept?" email ─────────────────────────
export const callAmbulance = async (req, res) => {
  try {
    const {
      hospitalName,
      patientName,
      location,
      bloodGroup,
      allergies,
      criticalDisease,
      emergencyContact,
      emergencyContactName,
      dateOfBirth,
      medications,
      organDonor,
      height,
      weight,
      insuranceProvider,
      policyNumber,
      vaccinations,
      treatmentHistory,
    } = req.body;

    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Store ALL patient data with token
    const token = storePatient({
      hospitalName,
      patientName,
      location,
      bloodGroup,
      allergies,
      criticalDisease,
      emergencyContact,
      emergencyContactName,
      dateOfBirth,
      medications,
      organDonor,
      height,
      weight,
      insuranceProvider,
      policyNumber,
      vaccinations: vaccinations || [],
      treatmentHistory: treatmentHistory || [],
    });

    const acceptUrl = `http://localhost:4000/api/v4/accept-patient?token=${token}`;
    const mapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "ashishjha97099@gmail.com",
      subject: `🚨 EMERGENCY — Ambulance Request from ${hospitalName || "Nearest Hospital"}`,
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background:#f3f4f6; font-family:'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:24px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 6px 30px rgba(0,0,0,0.12);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#7f1d1d,#dc2626); padding:32px 24px; text-align:center;">
                    <div style="font-size:56px; margin-bottom:8px;">🚨</div>
                    <h1 style="color:#fff; margin:0 0 6px; font-size:26px; font-weight:800;">EMERGENCY ALERT</h1>
                    <p style="color:#fca5a5; margin:0; font-size:14px;">An ambulance has been requested for a patient</p>
                  </td>
                </tr>

                <!-- Urgent Banner -->
                <tr>
                  <td style="background:#dc2626; padding:10px 24px; text-align:center;">
                    <p style="color:#fff; margin:0; font-size:15px; font-weight:700;">⚠️ Hospital: ${hospitalName || "Nearest Available"} — Please respond immediately</p>
                  </td>
                </tr>

                <!-- Patient Summary -->
                <tr>
                  <td style="padding:28px 28px 0;">
                    <h2 style="color:#991b1b; margin:0 0 14px; font-size:17px; border-bottom:2px solid #fecaca; padding-bottom:8px;">👤 Patient Overview</h2>
                    <table style="width:100%; border-collapse:collapse;">
                      <tr style="background:#fef2f2;">
                        <td style="padding:10px 12px; font-weight:700; color:#374151; width:42%;">Name</td>
                        <td style="padding:10px 12px; color:#111827; font-weight:600;">${patientName || "Not provided"}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Blood Group</td>
                        <td style="padding:10px 12px;">
                          <span style="background:#dc2626; color:#fff; padding:3px 12px; border-radius:20px; font-weight:700; font-size:14px;">${bloodGroup || "Unknown"}</span>
                        </td>
                      </tr>
                      <tr style="background:#fef2f2;">
                        <td style="padding:10px 12px; font-weight:700; color:#dc2626;">⚠️ Allergies</td>
                        <td style="padding:10px 12px; color:#b91c1c; font-weight:600;">${allergies || "None reported"}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Critical Disease</td>
                        <td style="padding:10px 12px; color:#111827;">${criticalDisease || "None reported"}</td>
                      </tr>
                      <tr style="background:#fef2f2;">
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Emergency Contact</td>
                        <td style="padding:10px 12px;">
                          ${emergencyContactName ? `<strong>${emergencyContactName}</strong><br>` : ""}
                          <a href="tel:${emergencyContact}" style="color:#1e40af; font-weight:700;">${emergencyContact || "Not provided"}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Location -->
                <tr>
                  <td style="padding:20px 28px 0;">
                    <h2 style="color:#991b1b; margin:0 0 14px; font-size:17px; border-bottom:2px solid #fecaca; padding-bottom:8px;">📍 Emergency Location</h2>
                    <div style="text-align:center; margin:16px 0;">
                      <a href="${mapsLink}"
                        style="display:inline-block; background:#1e40af; color:#fff; padding:14px 36px;
                               text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">
                        📍 View Location on Google Maps
                      </a>
                    </div>
                    <p style="color:#6b7280; font-size:12px; text-align:center; margin:4px 0 0;">
                      Coordinates: ${location.lat}, ${location.lng}
                    </p>
                  </td>
                </tr>

                <!-- Accept CTA -->
                <tr>
                  <td style="padding:28px 28px;">
                    <div style="background:#f0fdf4; border:2px solid #86efac; border-radius:14px; padding:24px; text-align:center;">
                      <p style="margin:0 0 6px; font-size:18px; font-weight:800; color:#15803d;">Will you accept this patient?</p>
                      <p style="margin:0 0 20px; color:#6b7280; font-size:13px;">Clicking Yes will send you the full medical profile and health vault data</p>
                      <a href="${acceptUrl}"
                        style="display:inline-block; background:linear-gradient(135deg,#15803d,#16a34a); color:#fff;
                               padding:18px 48px; text-decoration:none; border-radius:12px;
                               font-weight:800; font-size:18px; letter-spacing:0.5px;
                               box-shadow:0 4px 20px rgba(22,163,74,0.4);">
                        ✅ Yes, Accept Patient
                      </a>
                      <p style="margin:16px 0 0; font-size:11px; color:#9ca3af;">This link expires in 30 minutes</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f3f4f6; padding:16px; text-align:center; border-top:1px solid #e5e7eb;">
                    <p style="margin:0; font-size:12px; color:#9ca3af;">
                      Automated alert from <strong>Emergency First Aid App</strong>. Please respond immediately.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Ambulance request email sent. Token:", token);
    res.status(200).json({ message: "Ambulance request sent successfully" });
  } catch (err) {
    console.error("callAmbulance error:", err.message);
    res.status(500).json({ message: "Failed to send ambulance request", error: err.message });
  }
};

// ─── Accept Patient: triggered by Yes button in email ─────────────────────────
export const acceptPatient = async (req, res) => {
  const { token } = req.query;

  if (!token || !patientStore.has(token)) {
    return res.status(400).send(`
      <html><body style="font-family:Arial,sans-serif; text-align:center; padding:60px; background:#fef2f2;">
        <h1 style="color:#dc2626;">⚠️ Invalid or Expired Link</h1>
        <p style="color:#6b7280;">This acceptance link has expired or is invalid. Please request a new ambulance from the patient's emergency page.</p>
      </body></html>
    `);
  }

  const data = patientStore.get(token);
  patientStore.delete(token); // One-time use

  const {
    hospitalName, patientName, location, bloodGroup, allergies,
    criticalDisease, emergencyContact, emergencyContactName,
    dateOfBirth, medications, organDonor,
    height, weight, insuranceProvider, policyNumber,
    vaccinations, treatmentHistory,
  } = data;

  // Build vaccination table HTML
  const vaccinationRows = (vaccinations || []).length > 0
    ? (vaccinations).map(v => `
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #dcfce7;">${v.name || "—"}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #dcfce7;">${v.date || "—"}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #dcfce7;">${v.provider || "—"}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #dcfce7;">${v.batchNumber || "—"}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" style="padding:10px 12px; color:#6b7280; text-align:center;">No vaccination records</td></tr>`;

  const treatmentRows = (treatmentHistory || []).length > 0
    ? (treatmentHistory).map(t => `
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #dcfce7;">${t.condition || "—"}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #dcfce7;">${t.doctor || "—"}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #dcfce7;">${t.hospital || "—"}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #dcfce7;">${t.date || "—"}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #dcfce7;">${t.notes || "—"}</td>
        </tr>`).join("")
    : `<tr><td colspan="5" style="padding:10px 12px; color:#6b7280; text-align:center;">No treatment history</td></tr>`;


  const mapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "ashishjha97099@gmail.com",
      subject: `✅ Patient Accepted — Full Medical Profile: ${patientName || "Unknown Patient"}`,
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background:#f0fdf4; font-family:'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4; padding:24px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 6px 30px rgba(0,0,0,0.12);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#14532d,#16a34a); padding:32px 24px; text-align:center;">
                    <div style="font-size:52px; margin-bottom:8px;">✅</div>
                    <h1 style="color:#fff; margin:0 0 6px; font-size:24px; font-weight:800;">PATIENT ACCEPTED</h1>
                    <p style="color:#bbf7d0; margin:0; font-size:14px;">Full medical profile and health vault — ${hospitalName || "Hospital"}</p>
                  </td>
                </tr>

                <!-- Confirmation Banner -->
                <tr>
                  <td style="background:#15803d; padding:10px 24px; text-align:center;">
                    <p style="color:#fff; margin:0; font-size:14px; font-weight:700;">🚑 Ambulance dispatched — prepare for incoming patient</p>
                  </td>
                </tr>

                <!-- Basic Info -->
                <tr>
                  <td style="padding:28px 28px 0;">
                    <h2 style="color:#15803d; margin:0 0 14px; font-size:17px; border-bottom:2px solid #bbf7d0; padding-bottom:8px;">👤 Patient Details</h2>
                    <table style="width:100%; border-collapse:collapse;">
                      <tr style="background:#f0fdf4;">
                        <td style="padding:10px 12px; font-weight:700; color:#374151; width:42%;">Full Name</td>
                        <td style="padding:10px 12px; color:#111827; font-weight:600;">${patientName || "Not provided"}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Date of Birth</td>
                        <td style="padding:10px 12px; color:#111827;">${dateOfBirth || "Not provided"}</td>
                      </tr>
                      <tr style="background:#f0fdf4;">
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Emergency Contact</td>
                        <td style="padding:10px 12px; color:#111827;">
                          ${emergencyContactName ? `<strong>${emergencyContactName}</strong><br>` : ""}
                          <a href="tel:${emergencyContact}" style="color:#1e40af; font-weight:700;">${emergencyContact || "Not provided"}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Health Vault: Core Stats -->
                <tr>
                  <td style="padding:24px 28px 0;">
                    <h2 style="color:#15803d; margin:0 0 14px; font-size:17px; border-bottom:2px solid #bbf7d0; padding-bottom:8px;">🏥 Full Health Vault</h2>
                    <table style="width:100%; border-collapse:collapse;">
                      <tr style="background:#f0fdf4;">
                        <td style="padding:10px 12px; font-weight:700; color:#374151; width:42%;">Blood Group</td>
                        <td style="padding:10px 12px;">
                          <span style="background:#dc2626; color:#fff; padding:3px 14px; border-radius:20px; font-weight:800; font-size:15px;">${bloodGroup || "Unknown"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Height</td>
                        <td style="padding:10px 12px; color:#111827;">${height || "Not provided"}</td>
                      </tr>
                      <tr style="background:#f0fdf4;">
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Weight</td>
                        <td style="padding:10px 12px; color:#111827;">${weight || "Not provided"}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; font-weight:700; color:#dc2626;">⚠️ Major Allergies</td>
                        <td style="padding:10px 12px; color:#b91c1c; font-weight:600;">${allergies || "None reported"}</td>
                      </tr>
                      <tr style="background:#f0fdf4;">
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Critical Disease</td>
                        <td style="padding:10px 12px; color:#111827;">${criticalDisease || "None reported"}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Current Medications</td>
                        <td style="padding:10px 12px; color:#111827;">${medications || "None reported"}</td>
                      </tr>
                      <tr style="background:#f0fdf4;">
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Organ Donor</td>
                        <td style="padding:10px 12px; color:#111827;">${organDonor || "Not specified"}</td>
                      </tr>
                      ${insuranceProvider ? `
                      <tr>
                        <td style="padding:10px 12px; font-weight:700; color:#374151;">Insurance Provider</td>
                        <td style="padding:10px 12px; color:#111827;">${insuranceProvider}${policyNumber ? ` — Policy: ${policyNumber}` : ""}</td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>

                <!-- Vaccination Records -->
                <tr>
                  <td style="padding:20px 28px 0;">
                    <h2 style="color:#15803d; margin:0 0 14px; font-size:17px; border-bottom:2px solid #bbf7d0; padding-bottom:8px;">💉 Vaccination Records</h2>
                    <table style="width:100%; border-collapse:collapse; font-size:13px;">
                      <thead>
                        <tr style="background:#dcfce7;">
                          <th style="padding:8px 12px; text-align:left; color:#15803d;">Vaccine</th>
                          <th style="padding:8px 12px; text-align:left; color:#15803d;">Date</th>
                          <th style="padding:8px 12px; text-align:left; color:#15803d;">Provider/Hospital</th>
                          <th style="padding:8px 12px; text-align:left; color:#15803d;">Batch No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${vaccinationRows}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Treatment History -->
                <tr>
                  <td style="padding:20px 28px 0;">
                    <h2 style="color:#15803d; margin:0 0 14px; font-size:17px; border-bottom:2px solid #bbf7d0; padding-bottom:8px;">🩺 Treatment History</h2>
                    <table style="width:100%; border-collapse:collapse; font-size:13px;">
                      <thead>
                        <tr style="background:#dcfce7;">
                          <th style="padding:8px 12px; text-align:left; color:#15803d;">Condition</th>
                          <th style="padding:8px 12px; text-align:left; color:#15803d;">Doctor</th>
                          <th style="padding:8px 12px; text-align:left; color:#15803d;">Hospital</th>
                          <th style="padding:8px 12px; text-align:left; color:#15803d;">Date</th>
                          <th style="padding:8px 12px; text-align:left; color:#15803d;">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${treatmentRows}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Accident Location -->
                <tr>
                  <td style="padding:24px 28px 0;">
                    <h2 style="color:#15803d; margin:0 0 14px; font-size:17px; border-bottom:2px solid #bbf7d0; padding-bottom:8px;">📍 Accident Location</h2>
                    <div style="text-align:center; margin:16px 0;">
                      <a href="${mapsLink}"
                        style="display:inline-block; background:#1e40af; color:#fff; padding:14px 36px;
                               text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">
                        📍 Open Accident Location on Google Maps
                      </a>
                    </div>
                    <p style="color:#6b7280; font-size:12px; text-align:center; margin:4px 0 0;">
                      Coordinates: ${location.lat}, ${location.lng}
                    </p>
                  </td>
                </tr>


                <!-- Footer -->
                <tr>
                  <td style="background:#f3f4f6; padding:20px; text-align:center; margin-top:24px; border-top:1px solid #e5e7eb;">
                    <p style="margin:0; font-size:12px; color:#9ca3af;">
                      Patient confirmation from <strong>Emergency First Aid App</strong>.<br/>
                      Please prepare the emergency team immediately upon receiving this.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Patient acceptance confirmation email sent for token:", token);

    // Return a nice HTML page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Accepted</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg,#14532d,#16a34a); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
          .card { background:#fff; border-radius:20px; padding:48px 40px; text-align:center; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
          .icon { font-size:72px; margin-bottom:16px; }
          h1 { color:#15803d; font-size:28px; font-weight:800; margin-bottom:12px; }
          p { color:#6b7280; font-size:15px; line-height:1.6; }
          .badge { display:inline-block; background:#f0fdf4; border:1px solid #86efac; color:#15803d; padding:8px 20px; border-radius:20px; font-weight:700; margin-top:20px; font-size:14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✅</div>
          <h1>Patient Accepted!</h1>
          <p>The full medical profile and health vault data has been sent to your inbox.<br>Please prepare your emergency team immediately.</p>
          <div class="badge">🚑 Ambulance Dispatched</div>
        </div>
      </body>
      </html>
    `);

  } catch (err) {
    console.error("acceptPatient error:", err.message);
    res.status(500).send(`
      <html><body style="font-family:Arial,sans-serif; text-align:center; padding:60px;">
        <h1 style="color:#dc2626;">Error</h1>
        <p>Failed to send confirmation email: ${err.message}</p>
      </body></html>
    `);
  }
};
