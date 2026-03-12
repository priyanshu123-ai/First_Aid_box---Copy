import axios from "axios";
import sendPushNotification from "../utils/pushNotification.js";

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

      // Calculate distance from current location
      const distance = getDistanceFromLatLonInKm(lat, lng, el.lat, el.lon);

      return {
        id: el.id,
        name: tags.name || "Unknown Hospital",
        lat: el.lat,
        lon: el.lon,
        address: addressParts.join(", ") || "Address not available",
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
