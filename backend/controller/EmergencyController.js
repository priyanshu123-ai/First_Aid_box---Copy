import axios from "axios";
import nodemailer from "nodemailer";

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
