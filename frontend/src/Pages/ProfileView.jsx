import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProfileView = () => {

  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vault, setVault] = useState(null); // full health wallet (vaccinations, treatments)

  // Location & hospitals
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  // Button statuses
  const [sosStatus, setSosStatus] = useState("");
  const [ambulanceStatuses, setAmbulanceStatuses] = useState({});

  // Distance helper (Haversine formula)
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

  // ─── Load profile + full vault from DB (no sensitive data in URL) ──────────
  useEffect(() => {
    if (!id) {
      setError("No profile ID found. Please scan a valid QR code.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/v3/profile-with-vault/${id}`
        );
        if (res.data?.data?.profile) {
          setProfile(res.data.data.profile);
          setVault(res.data.data.vault || null);
        } else {
          setError("Profile not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);


  // ─── Auto-fetch GPS + hospitals once profile is loaded ────────────────────
  const fetchHospitals = useCallback(async () => {
    if (!navigator.geolocation) return;

    setHospitalsLoading(true);
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        })
      );

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setUserLocation({ lat, lng });

      const url = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:10000,${lat},${lng})["amenity"="hospital"];out;`;
      const res = await axios.get(url, { timeout: 8000 });
      const elements = res.data.elements || [];

      const sorted = elements
        .map(h => ({
          name: h.tags?.name || "Unknown Hospital",
          lat: h.lat,
          lng: h.lon,
          distance: getDistance(lat, lng, h.lat, h.lon)
        }))
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
        .slice(0, 5);

      setHospitals(sorted);
    } catch (err) {
      console.warn("Auto hospital fetch failed:", err.message);
    } finally {
      setHospitalsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) fetchHospitals();
  }, [profile, fetchHospitals]);

  // ─── SOS Handler ──────────────────────────────────────────────────────────
  const handleSOS = async () => {
    setSosStatus("sending");
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

      const validContacts = (profile.contactDetails || [])
        .map(c => ({
          name: c.name,
          email: c.email,
          location: c.location,
        }))
        .filter(c => c.email && c.email.trim() !== "");

      let targetEmails = [];
      if (validContacts.length > 0) {
        const withLocation = validContacts.filter(c => c.location);
        if (withLocation.length > 0) {
          let nearest = withLocation[0];
          let minDist = parseFloat(getDistance(lat, lng, nearest.location.lat, nearest.location.lng));
          for (let i = 1; i < withLocation.length; i++) {
            const d = parseFloat(getDistance(lat, lng, withLocation[i].location.lat, withLocation[i].location.lng));
            if (d < minDist) { minDist = d; nearest = withLocation[i]; }
          }
          targetEmails = [nearest.email];
        } else {
          targetEmails = validContacts.map(c => c.email);
        }
      }

      await axios.post("http://localhost:4000/api/v4/mail", {
        email: targetEmails,
        name: profile.FullName,
        phoneNumber: profile.phone,
        bloodGroup: profile.bloodGroup,
        allergies: profile.Allergies,
        medications: profile.CurrentMedications,
        conditions: profile.MedicalConditions,
        dateOfBirth: profile.DateOfBirth,
        organDonor: profile.OrganDonor,
        location: { lat, lng },
        hospitals: hospitals
      });

      setSosStatus("sent");
      setTimeout(() => setSosStatus(""), 4000);
    } catch (err) {
      console.error("SOS error:", err);
      setSosStatus("error");
      setTimeout(() => setSosStatus(""), 4000);
    }
  };

  // ─── Call Ambulance Handler (per hospital) ────────────────────────────────
  const handleCallAmbulance = async (hospital, index) => {
    setAmbulanceStatuses(prev => ({ ...prev, [index]: "sending" }));

    try {
      const ecList = profile.contactDetails || [];
      const firstEc = ecList[0];
      const emergencyContactName = firstEc?.name || "";
      const emergencyContact = firstEc?.phoneNumber || "";

      const loc = userLocation || { lat: hospital.lat, lng: hospital.lng };

      await axios.post("http://localhost:4000/api/v4/call-ambulance", {
        hospitalName: hospital.name,
        patientName: profile.FullName,
        location: loc,
        bloodGroup: profile.bloodGroup,
        allergies: profile.Allergies || "",
        criticalDisease: profile.MedicalConditions || "",
        emergencyContact,
        emergencyContactName,
        dateOfBirth: profile.DateOfBirth || "",
        medications: profile.CurrentMedications || "",
        organDonor: profile.OrganDonor || "",
        // ── Full Health Vault (from /profile-with-vault/:id DB fetch) ──
        height: profile.Height || "",
        weight: profile.Weight || "",
        insuranceProvider: profile.InsuranceProvider || "",
        policyNumber: profile.PolicyNumber || "",
        vaccinations: vault?.vaccinations || [],
        treatmentHistory: vault?.treatmentHistory || [],
      });

      setAmbulanceStatuses(prev => ({ ...prev, [index]: "sent" }));
    } catch (err) {
      console.error("Call Ambulance error:", err);
      setAmbulanceStatuses(prev => ({ ...prev, [index]: "error" }));
      setTimeout(() =>
        setAmbulanceStatuses(prev => ({ ...prev, [index]: "" })), 4000
      );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.spinner}></div>
        <p style={s.loadingText}>Loading Medical Profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={s.errorPage}>
        <div style={s.errorCard}>
          <h2 style={s.errorTitle}>Profile Not Found</h2>
          <p style={s.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* ── Banner ─────────────────────────────────────── */}
      <div style={s.banner}>
        <div style={s.bannerIcon}>🚨</div>
        <h1 style={s.bannerTitle}>Emergency SOS</h1>
        <p style={s.bannerSub}>Press the button below to send emergency alert</p>
      </div>

      {/* ── SOS Button ─────────────────────────────────── */}
      <button
        id="sos-btn"
        onClick={handleSOS}
        disabled={sosStatus === "sending"}
        style={{
          ...s.sosBtn,
          ...(sosStatus === "sending" ? s.sosBtnLoading : {}),
          ...(sosStatus === "sent" ? s.sosBtnSent : {}),
          ...(sosStatus === "error" ? s.sosBtnError : {}),
        }}
      >
        {sosStatus === "sending"
          ? "📍 Sending SOS..."
          : sosStatus === "sent"
            ? "✅ SOS Sent!"
            : sosStatus === "error"
              ? "❌ Failed — Try Again"
              : "🚨 SEND EMERGENCY SOS"}
      </button>

      <p style={s.hint}>Sends emergency alert to your nearest emergency contact</p>

      {/* ── Divider ────────────────────────────────────── */}
      <div style={s.divider}>
        <div style={s.dividerLine}></div>
        <span style={s.dividerText}>🏥 Nearest Hospitals</span>
        <div style={s.dividerLine}></div>
      </div>

      {/* ── Hospitals ──────────────────────────────────── */}
      {hospitalsLoading ? (
        <div style={s.hospitalLoadingBox}>
          <div style={s.smallSpinner}></div>
          <p style={s.hospitalLoadingText}>Finding nearby hospitals...</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div style={s.noHospitalBox}>
          <p style={s.noHospitalText}>
            📍 Allow location access to find nearby hospitals
          </p>
          <button onClick={fetchHospitals} style={s.retryBtn}>
            🔄 Retry Location
          </button>
        </div>
      ) : (
        <div style={s.hospitalList}>
          {hospitals.map((h, i) => {
            const status = ambulanceStatuses[i] || "";
            return (
              <div key={i} id={`hospital-card-${i}`} style={s.hospitalCard}>

                {/* Hospital Info */}
                <div style={s.hospitalHeader}>
                  <div style={s.hospitalName}>{h.name}</div>
                  <div style={s.distanceBadge}>{h.distance} km</div>
                </div>

                {/* Actions */}
                <div style={s.cardActions}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={s.dirBtn}
                  >
                    📍 Directions
                  </a>

                  <button
                    onClick={() => handleCallAmbulance(h, i)}
                    disabled={status === "sending" || status === "sent"}
                    style={{
                      ...s.ambBtn,
                      ...(status === "sending" ? s.ambBtnLoading : {}),
                      ...(status === "sent" ? s.ambBtnSent : {}),
                      ...(status === "error" ? s.ambBtnError : {}),
                    }}
                  >
                    {status === "sending"
                      ? "📡 Notifying..."
                      : status === "sent"
                        ? "✅ Notified!"
                        : status === "error"
                          ? "❌ Retry"
                          : "🚑 Call Ambulance"}
                  </button>
                </div>

                {/* Status message */}
                {status === "sent" && (
                  <p style={s.sentMsg}>
                    ✉️ Hospital notified — check email to accept the patient
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p style={s.footer}>Emergency SOS • For authorized use only</p>

    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = {

  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#24243e 100%)",
    padding: "20px 16px 40px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },

  banner: { textAlign: "center", marginBottom: "4px" },
  bannerIcon: { fontSize: "56px" },
  bannerTitle: { fontSize: "26px", fontWeight: "800", margin: "4px 0 0" },
  bannerSub: { fontSize: "13px", opacity: 0.65, margin: "6px 0 0" },

  sosBtn: {
    width: "100%",
    maxWidth: "400px",
    padding: "22px 24px",
    fontSize: "20px",
    fontWeight: "800",
    color: "#fff",
    background: "#dc2626",
    borderRadius: "18px",
    marginTop: "20px",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 6px 24px rgba(220,38,38,0.5)",
    transition: "transform 0.1s",
    letterSpacing: "0.5px",
  },
  sosBtnLoading: { background: "#f59e0b", boxShadow: "0 6px 24px rgba(245,158,11,0.4)" },
  sosBtnSent: { background: "#16a34a", boxShadow: "0 6px 24px rgba(22,163,74,0.4)" },
  sosBtnError: { background: "#991b1b" },

  hint: { fontSize: "12px", opacity: 0.55, marginTop: "8px", textAlign: "center" },

  divider: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: "480px",
    margin: "28px 0 16px",
    gap: "12px",
  },
  dividerLine: { flex: 1, height: "1px", background: "rgba(255,255,255,0.2)" },
  dividerText: { fontSize: "13px", opacity: 0.7, whiteSpace: "nowrap", fontWeight: "600" },

  hospitalLoadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "28px",
    opacity: 0.75,
  },
  smallSpinner: {
    width: "28px",
    height: "28px",
    border: "3px solid rgba(255,255,255,0.2)",
    borderTop: "3px solid #a78bfa",
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
  },
  hospitalLoadingText: { marginTop: "10px", fontSize: "13px", opacity: 0.7 },

  noHospitalBox: { textAlign: "center", padding: "24px 16px", opacity: 0.8 },
  noHospitalText: { fontSize: "14px", marginBottom: "12px" },
  retryBtn: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    padding: "10px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  hospitalList: { width: "100%", maxWidth: "480px" },

  hospitalCard: {
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "16px",
    padding: "16px 18px",
    marginBottom: "14px",
  },

  hospitalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "14px",
    gap: "8px",
  },
  hospitalName: {
    fontSize: "15px",
    fontWeight: "700",
    lineHeight: "1.4",
    flex: 1,
  },
  distanceBadge: {
    background: "rgba(167,139,250,0.25)",
    border: "1px solid rgba(167,139,250,0.4)",
    color: "#c4b5fd",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  cardActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  dirBtn: {
    background: "rgba(37,99,235,0.25)",
    border: "1px solid rgba(37,99,235,0.4)",
    color: "#93c5fd",
    padding: "9px 14px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  ambBtn: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
    background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 3px 14px rgba(37,99,235,0.35)",
  },
  ambBtnLoading: { background: "#f59e0b", boxShadow: "none" },
  ambBtnSent: { background: "linear-gradient(135deg,#166534,#16a34a)", cursor: "default" },
  ambBtnError: { background: "#991b1b" },

  sentMsg: {
    fontSize: "12px",
    color: "#86efac",
    marginTop: "10px",
    textAlign: "center",
    opacity: 0.9,
  },

  footer: { marginTop: "36px", fontSize: "11px", opacity: 0.35 },

  // Loading / Error pages
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    background: "linear-gradient(160deg,#0f0c29,#302b63,#24243e)",
    color: "#fff",
  },
  spinner: {
    width: "44px",
    height: "44px",
    border: "4px solid rgba(255,255,255,0.15)",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: { marginTop: "14px", opacity: 0.7 },

  errorPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(160deg,#0f0c29,#302b63,#24243e)",
  },
  errorCard: {
    background: "#1e1e2e",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  errorTitle: { color: "#fca5a5", marginBottom: "8px" },
  errorText: { opacity: 0.6, color: "#fff" },
};

export default ProfileView;