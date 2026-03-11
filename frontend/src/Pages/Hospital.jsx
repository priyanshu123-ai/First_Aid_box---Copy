

import React, { useState } from "react";
import axios from "axios";
import { MapPin, Navigation, Phone, Star } from "lucide-react";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";



//hospitals

// User marker (blue dot)
const userIcon = new L.Icon({
  iconUrl:
    "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png",
  iconSize: [15, 15],
  iconAnchor: [7, 7],
});

// Hospital marker (red pin)
const hospitalIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/marker.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Hospital() {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("❌ Geolocation not supported by this browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        toast.success("✅ Location fetched successfully!");

        try {
          const response = await axios.get(
            "http://localhost:4000/api/v4/location",
            {
              params: { lat: coords.lat, lng: coords.lng },
            }
          );

          console.log("Hospitals response:", response);

          if (response.data?.data?.length) {
            setNearestHospitals(response.data.data);
          } else {
            toast.info("No hospitals found nearby");
          }
        } catch (err) {
          console.error(err);
          toast.error("❌ Failed to fetch nearby hospitals");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn(error);
        setLoading(false);
        toast.warning("⚠️ Location access denied, showing default area...");
        // fallback default city (Bangalore)
        setUserLocation({ lat: 12.9716, lng: 77.5946 });
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className=" text-lg md:text-3xl font-bold">🏥 Nearby Hospitals</h1>
        <p className="text-gray-500">
          Click below to find hospitals closest to your current location.
        </p>
      </div>

      {/* Button */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <button
          onClick={handleGetLocation}
          className={`transition-all duration-300 ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-3 rounded-lg font-medium shadow-md text-base sm:text-lg`}
          disabled={loading}
        >
          {loading ? "Fetching..." : "📍 Use My Location"}
        </button>
      </div>

      {/* Map Section */}
      <div className="max-w-6xl mx-auto mb-10 bg-white rounded-2xl shadow p-4">
        {userLocation ? (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: "400px", width: "100%", borderRadius: "12px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />

            {/* User marker */}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>You are here</Popup>
            </Marker>

            {/* Hospital markers */}
            {nearestHospitals.map((hospital, i) => (
              <Marker
                key={i}
                position={[hospital.lat, hospital.lon]}
                icon={hospitalIcon}
              >
                <Popup>
                  <div>
                    <strong>{hospital.name}</strong>
                    <br />
                    {hospital.address}
                    <br />
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline block mt-1"
                    >
                      Directions
                    </a>
                    <a
                      href={`tel:${hospital.phone || ""}`}
                      className="text-green-600 underline block mt-1"
                    >
                      Call
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <MapPin className="w-10 h-10 mb-3 text-blue-500" />
            <h2 className="text-lg font-semibold">Interactive Map</h2>
            <p>Map view will show hospital locations once you share your location.</p>
          </div>
        )}
      </div>

      {/* 🏥 Hospitals List */}
      {nearestHospitals.length > 0 && (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-semibold mb-4">🏥 Nearest Hospitals</h2>
          <p className="text-gray-500 mb-6">
            Found {nearestHospitals.length} medical facilities near you
          </p>
          <div className="space-y-5">
            {nearestHospitals.map((hospital, index) => (
              <div
                key={index}
                className="border border-gray-200 p-5 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center hover:shadow-lg transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{hospital.name}</h3>
                    <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
                      24/7 Emergency
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {hospital.address}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-yellow-500 text-sm">
                    <Star className="w-4 h-4" /> {hospital.rating || "4.5"} ★
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    Distance: {hospital.distance?.toFixed(2) || "—"} km away
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
                  <a
                    href={`tel:${hospital.phone}`}
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                  >
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    <Navigation className="w-4 h-4" /> Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Emergency Footer */}
      <div className="max-w-6xl mx-auto mt-10 bg-gradient-to-r from-red-600 to-blue-600 text-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">🚨 Emergency:</span>
          <span className="font-bold text-xl">911</span>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <span>Poison Control:</span>
          <span className="font-semibold underline">1-800-222-1222</span>
        </div>
      </div>
    </div>
  );
}

export default Hospital;
