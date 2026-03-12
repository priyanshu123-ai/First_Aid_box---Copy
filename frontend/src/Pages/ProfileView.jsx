import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

const ProfileView = () => {

  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sosStatus, setSosStatus] = useState("");
  const [hospitals, setHospitals] = useState([]);

  // Calculate distance
  const getDistance = (lat1, lon1, lat2, lon2) => {

    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(2);
  };

  useEffect(() => {

    const encodedData = searchParams.get("data");

    if (encodedData) {

      try {

        const decoded = JSON.parse(
          decodeURIComponent(escape(atob(encodedData)))
        );

        setProfile({
          FullName: decoded.n || "",
          DateOfBirth: decoded.dob || "",
          email: decoded.e || "",
          phone: decoded.p || "",
          bloodGroup: decoded.bg || "",
          Height: decoded.h || "",
          Weight: decoded.w || ""
        });

        setLoading(false);
        return;

      } catch (err) {
        console.log("QR decode error", err);
      }
    }

    const fetchProfile = async () => {

      try {

        const res = await axios.get(
          `http://localhost:4000/api/v3/profileDetail/${id}`
        );

        if (res.data?.data) {
          setProfile(res.data.data);
        } else {
          setError("Profile not found");
        }

      } catch (err) {

        console.error(err);
        setError("Failed to load profile");

      } finally {

        setLoading(false);

      }
    };

    if (id) fetchProfile();
    else {
      setError("No profile data found");
      setLoading(false);
    }

  }, [id, searchParams]);


  const handleSOS = async () => {

    const confirmSOS = window.confirm(
      "Are you sure you want to send Emergency SOS?"
    );

    if (!confirmSOS) return;

    setSosStatus("locating");

    try {

      const position = await new Promise((resolve, reject) => {

        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });

      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Overpass API
      const url = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:10000,${lat},${lng})["amenity"="hospital"];out;`;

      const hospitalRes = await axios.get(url);

      const nearbyHospitals = hospitalRes.data.elements
        .slice(0, 5)
        .map((h) => ({
          name: h.tags?.name || "Unknown Hospital",
          lat: h.lat,
          lng: h.lon,
          distance: getDistance(lat, lng, h.lat, h.lon)
        }));

      setHospitals(nearbyHospitals);

      // Send mail
      await axios.post("http://localhost:4000/api/v4/mail", {
        email: profile.email,
        name: profile.FullName,
        phoneNumber: profile.phone,
        location: { lat, lng },
        hospitals: nearbyHospitals
      });

      setSosStatus("sent");

    } catch (err) {

      console.error(err);

      setSosStatus("error");

      setTimeout(() => setSosStatus(""), 3000);

    }
  };


  if (loading) {

    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading Medical Profile...</p>
      </div>
    );

  }

  if (error || !profile) {

    return (
      <div style={styles.errorPage}>
        <div style={styles.errorCard}>
          <h2 style={styles.errorTitle}>Profile Not Found</h2>
          <p style={styles.errorText}>{error}</p>
        </div>
      </div>
    );

  }


  return (
    <div style={styles.page}>

      <div style={styles.banner}>
        <div style={styles.bannerIcon}>🚨</div>
        <h1 style={styles.bannerTitle}>Emergency SOS</h1>
        <p style={styles.bannerSub}>
          Press the button to send emergency alert
        </p>
      </div>


      <button
        onClick={handleSOS}
        disabled={sosStatus === "locating"}
        style={{
          ...styles.sosButton,
          ...(sosStatus === "locating" ? styles.sosButtonLoading : {}),
          ...(sosStatus === "sent" ? styles.sosButtonSent : {}),
          ...(sosStatus === "error" ? styles.sosButtonError : {})
        }}
      >

        {sosStatus === "locating"
          ? "📍 Getting Location..."
          : sosStatus === "sent"
            ? "✅ SOS Sent!"
            : sosStatus === "error"
              ? "❌ Failed - Try Again"
              : "🚨 SEND EMERGENCY SOS"}

      </button>

      <p style={styles.sosHint}>
        Sends emergency email with your live GPS location
      </p>


      {hospitals.length > 0 && (

        <div style={styles.hospitalBox}>

          <h2>🏥 Nearest Hospitals</h2>

          {hospitals.map((h, i) => (

            <div key={i} style={styles.hospitalCard}>

              <h3>{h.name}</h3>

              <p>📍 Distance: {h.distance} km away</p>

              <div style={{ display: "flex", gap: "10px" }}>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.directionBtn}
                >
                  Get Directions
                </a>

              </div>

            </div>

          ))}

        </div>

      )}

      <p style={styles.footer}>
        Emergency SOS • For authorized use only
      </p>

    </div>
  );
};


const styles = {

  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
    padding: "16px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },

  banner: {
    textAlign: "center"
  },

  bannerIcon: {
    fontSize: "60px"
  },

  bannerTitle: {
    fontSize: "28px",
    fontWeight: "800"
  },

  bannerSub: {
    fontSize: "14px",
    opacity: 0.7
  },

  sosButton: {
    width: "100%",
    maxWidth: "400px",
    padding: "24px",
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    background: "#dc2626",
    borderRadius: "20px",
    marginTop: "20px",
    cursor: "pointer"
  },

  sosButtonLoading: {
    background: "#f59e0b"
  },

  sosButtonSent: {
    background: "#16a34a"
  },

  sosButtonError: {
    background: "#991b1b"
  },

  sosHint: {
    fontSize: "12px",
    opacity: 0.6
  },

  hospitalBox: {
    width: "100%",
    maxWidth: "500px",
    marginTop: "30px"
  },

  hospitalCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "16px",
    borderRadius: "12px",
    marginTop: "12px"
  },

  directionBtn: {
    background: "#2563eb",
    padding: "8px 14px",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none"
  },

  footer: {
    marginTop: "40px",
    fontSize: "12px",
    opacity: 0.4
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column"
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #ccc",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },

  loadingText: {
    marginTop: "10px"
  },

  errorPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  errorCard: {
    background: "#222",
    padding: "40px",
    borderRadius: "20px"
  },

  errorTitle: {
    color: "#fca5a5"
  },

  errorText: {
    opacity: 0.7
  }

};

export default ProfileView;