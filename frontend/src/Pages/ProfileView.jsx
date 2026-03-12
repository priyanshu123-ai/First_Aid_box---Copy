import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

const ProfileView = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sosStatus, setSosStatus] = useState(""); // "", "locating", "sent", "error"

  useEffect(() => {
    // Try to decode data from URL query parameter (embedded in QR code)
    const encodedData = searchParams.get("data");
    if (encodedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
        setProfile({
          FullName: decoded.n || "",
          DateOfBirth: decoded.dob || "",
          email: decoded.e || "",
          phone: decoded.p || "",
          bloodGroup: decoded.bg || "",
          Height: decoded.h || "",
          Weight: decoded.w || "",
          // OrganDonor: decoded.od || "",
          // Allergies: decoded.al || "",
          // CurrentMedications: decoded.med || "",
          // MedicalConditions: decoded.mc || "",
          // InsuranceProvider: decoded.ip || "",
          // PolicyNumber: decoded.pn || "",
          // contactDetails: (decoded.ec || []).map((c) => ({
          //   name: c.n || "",
          //   phoneNumber: c.p || "",
          //   relation: c.r || "",
          // })),
        });
        setLoading(false);
        return;
      } catch (err) {
        console.error("Failed to decode QR data:", err);
      }
    }

    // Fallback: fetch from API by ID
    const fetchProfile = async () => {
      try {
        setLoading(true);
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
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    } else {
      setError("No profile data found.");
      setLoading(false);
    }
  }, [id, searchParams]);

  const handleSOS = async () => {
    setSosStatus("locating");
    try {
      // Get live GPS location
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Send SOS email via backend Nodemailer
      await axios.post("http://localhost:4000/api/v4/mail", {
        email: profile.email,
        name: profile.FullName || "Unknown Person",
        relation: "Emergency SOS Alert",
        phoneNumber: profile.phone || "N/A",
        location: { lat, lng },
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
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Profile Not Found</h2>
          <p style={styles.errorText}>{error || "Unable to load profile."}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Emergency Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerIcon}>🚨</div>
        <h1 style={styles.bannerTitle}>Emergency SOS</h1>
        <p style={styles.bannerSub}>Press the button to send an emergency alert email</p>
      </div>

      {/* SOS Button */}
      <button
        onClick={handleSOS}
        disabled={sosStatus === "locating"}
        style={{
          ...styles.sosButton,
          ...(sosStatus === "locating" ? styles.sosButtonLoading : {}),
          ...(sosStatus === "sent" ? styles.sosButtonSent : {}),
          ...(sosStatus === "error" ? styles.sosButtonError : {}),
        }}
      >
        {sosStatus === "locating" ? "📍 Getting Location..." :
         sosStatus === "sent" ? "✅ SOS Sent!" :
         sosStatus === "error" ? "❌ Failed - Try Again" :
         "🚨 SEND EMERGENCY SOS"}
      </button>
      <p style={styles.sosHint}>
        Sends emergency email with your live GPS location
      </p>

      {/* Footer */}
      <p style={styles.footer}>
        Emergency SOS • For authorized use only
      </p>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    padding: "16px",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    textAlign: "center",
    padding: "20px 16px 12px",
  },
  bannerIcon: {
    fontSize: "60px",
    marginBottom: "12px",
  },
  bannerTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  bannerSub: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    margin: 0,
  },
  sosButton: {
    display: "block",
    width: "100%",
    maxWidth: "400px",
    padding: "24px",
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    border: "3px solid rgba(255,255,255,0.3)",
    borderRadius: "20px",
    cursor: "pointer",
    marginTop: "20px",
    boxShadow: "0 0 40px rgba(220, 38, 38, 0.5), 0 4px 20px rgba(0,0,0,0.3)",
    animation: "pulse 2s infinite",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
  },
  sosButtonLoading: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    boxShadow: "0 0 40px rgba(245, 158, 11, 0.5)",
    animation: "none",
  },
  sosButtonSent: {
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    boxShadow: "0 0 40px rgba(22, 163, 74, 0.5)",
    animation: "none",
  },
  sosButtonError: {
    background: "linear-gradient(135deg, #dc2626, #991b1b)",
    animation: "none",
  },
  sosHint: {
    textAlign: "center",
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    margin: "12px 0 0",
  },
  footer: {
    textAlign: "center",
    fontSize: "11px",
    color: "rgba(255,255,255,0.3)",
    padding: "20px 0",
    margin: 0,
    marginTop: "auto",
  },
  loadingPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(255,255,255,0.1)",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  loadingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "15px",
  },
  errorPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  errorCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    maxWidth: "400px",
    border: "1px solid rgba(239,68,68,0.3)",
  },
  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  errorTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#fca5a5",
    margin: "0 0 8px",
  },
  errorText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    margin: 0,
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.02); opacity: 0.9; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProfileView;
