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
          OrganDonor: decoded.od || "",
          Allergies: decoded.al || "",
          CurrentMedications: decoded.med || "",
          MedicalConditions: decoded.mc || "",
          InsuranceProvider: decoded.ip || "",
          PolicyNumber: decoded.pn || "",
          contactDetails: (decoded.ec || []).map((c) => ({
            name: c.n || "",
            phoneNumber: c.p || "",
            relation: c.r || "",
          })),
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
        <div style={styles.bannerIcon}>🏥</div>
        <h1 style={styles.bannerTitle}>Emergency Medical Profile</h1>
        <p style={styles.bannerSub}>Critical info for first responders</p>
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
        Press to send emergency email with your live location & this person's medical info
      </p>

      {/* Profile Card */}
      <div style={styles.card}>
        {/* Person Info */}
        <div style={styles.personHeader}>
          <div style={styles.avatar}>
            {(profile.FullName || "?")[0].toUpperCase()}
          </div>
          <div>
            <h2 style={styles.personName}>{profile.FullName || "Unknown"}</h2>
            <p style={styles.personSub}>
              DOB: {profile.DateOfBirth || "N/A"} • {profile.phone || "N/A"}
            </p>
          </div>
        </div>

        {/* Vitals Grid */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🩸 Vital Information</h3>
          <div style={styles.vitalsGrid}>
            <div style={styles.vitalBox}>
              <span style={styles.vitalLabel}>Blood Group</span>
              <span style={styles.vitalValueRed}>{profile.bloodGroup || "N/A"}</span>
            </div>
            <div style={styles.vitalBox}>
              <span style={styles.vitalLabel}>Organ Donor</span>
              <span style={styles.vitalValue}>{profile.OrganDonor || "N/A"}</span>
            </div>
            <div style={styles.vitalBox}>
              <span style={styles.vitalLabel}>Height</span>
              <span style={styles.vitalValue}>{profile.Height ? `${profile.Height} cm` : "N/A"}</span>
            </div>
            <div style={styles.vitalBox}>
              <span style={styles.vitalLabel}>Weight</span>
              <span style={styles.vitalValue}>{profile.Weight ? `${profile.Weight} kg` : "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Allergies */}
        {profile.Allergies && (
          <div style={styles.alertSection}>
            <h3 style={styles.alertTitle}>⚠️ ALLERGIES</h3>
            <p style={styles.alertText}>{profile.Allergies}</p>
          </div>
        )}

        {/* Medications */}
        {profile.CurrentMedications && (
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>💊 Current Medications</h3>
            <p style={styles.infoText}>{profile.CurrentMedications}</p>
          </div>
        )}

        {/* Medical Conditions */}
        {profile.MedicalConditions && (
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>🏷️ Medical Conditions</h3>
            <p style={styles.infoText}>{profile.MedicalConditions}</p>
          </div>
        )}

        {/* Emergency Contacts */}
        {profile.contactDetails && profile.contactDetails.length > 0 && (
          <div style={styles.contactSection}>
            <h3 style={styles.contactTitle}>📞 Emergency Contacts</h3>
            {profile.contactDetails.map((c, i) => (
              <div key={i} style={styles.contactRow}>
                <div>
                  <div style={styles.contactName}>{c.name || `Contact ${i + 1}`}</div>
                  <div style={styles.contactRelation}>{c.relation || "N/A"}</div>
                </div>
                <a href={`tel:${c.phoneNumber}`} style={styles.callButton}>
                  📱 {c.phoneNumber || "N/A"}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Insurance */}
        {(profile.InsuranceProvider || profile.PolicyNumber) && (
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>🛡️ Insurance</h3>
            <p style={styles.infoText}>
              <strong>Provider:</strong> {profile.InsuranceProvider || "N/A"}<br />
              <strong>Policy:</strong> {profile.PolicyNumber || "N/A"}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={styles.footer}>
        Emergency medical profile • For authorized use only
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
  },
  banner: {
    textAlign: "center",
    padding: "20px 16px 12px",
  },
  bannerIcon: {
    fontSize: "40px",
    marginBottom: "8px",
  },
  bannerTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 4px",
    letterSpacing: "-0.5px",
  },
  bannerSub: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.6)",
    margin: 0,
  },
  sosButton: {
    display: "block",
    width: "100%",
    padding: "18px",
    fontSize: "20px",
    fontWeight: "800",
    color: "#fff",
    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    border: "3px solid rgba(255,255,255,0.3)",
    borderRadius: "16px",
    cursor: "pointer",
    marginTop: "12px",
    boxShadow: "0 0 30px rgba(220, 38, 38, 0.5), 0 4px 15px rgba(0,0,0,0.3)",
    animation: "pulse 2s infinite",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
  },
  sosButtonLoading: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    boxShadow: "0 0 30px rgba(245, 158, 11, 0.5)",
    animation: "none",
  },
  sosButtonSent: {
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    boxShadow: "0 0 30px rgba(22, 163, 74, 0.5)",
    animation: "none",
  },
  sosButtonError: {
    background: "linear-gradient(135deg, #dc2626, #991b1b)",
    animation: "none",
  },
  sosHint: {
    textAlign: "center",
    fontSize: "11px",
    color: "rgba(255,255,255,0.5)",
    margin: "8px 0 16px",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  personHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "20px",
    background: "rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  personName: {
    fontSize: "20px",
    fontWeight: "700",
    margin: "0 0 2px",
    color: "#fff",
  },
  personSub: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
    margin: 0,
  },
  section: {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    margin: "0 0 12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  vitalsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  vitalBox: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "12px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  vitalLabel: {
    display: "block",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "4px",
  },
  vitalValue: {
    display: "block",
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
  },
  vitalValueRed: {
    display: "block",
    fontSize: "24px",
    fontWeight: "800",
    color: "#ef4444",
  },
  alertSection: {
    margin: "0 20px",
    padding: "14px",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "12px",
    marginTop: "16px",
  },
  alertTitle: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#fca5a5",
    margin: "0 0 6px",
    textTransform: "uppercase",
  },
  alertText: {
    fontSize: "14px",
    color: "#fecaca",
    margin: 0,
    lineHeight: "1.4",
  },
  infoSection: {
    padding: "14px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  infoTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    margin: "0 0 6px",
  },
  infoText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.85)",
    margin: 0,
    lineHeight: "1.5",
  },
  contactSection: {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  contactTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#4ade80",
    margin: "0 0 12px",
  },
  contactRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    background: "rgba(74, 222, 128, 0.08)",
    borderRadius: "12px",
    marginBottom: "8px",
    border: "1px solid rgba(74, 222, 128, 0.15)",
  },
  contactName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
  },
  contactRelation: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.5)",
  },
  callButton: {
    padding: "8px 14px",
    background: "rgba(74, 222, 128, 0.15)",
    color: "#4ade80",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid rgba(74, 222, 128, 0.2)",
  },
  footer: {
    textAlign: "center",
    fontSize: "11px",
    color: "rgba(255,255,255,0.3)",
    padding: "20px 0",
    margin: 0,
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
