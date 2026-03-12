import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Syringe, FileText, Search, Bot, Plus, Trash2, Star,
  MapPin, Phone, Clock, Shield, Lock, Unlock, Loader2,
  AlertTriangle, ChevronRight, Stethoscope, Activity,
  Camera, Upload, Eye, Globe, Image, X,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

const SPECIALTIES = [
  "General Physician", "Cardiologist", "Dermatologist", "Orthopedic",
  "ENT Specialist", "Neurologist", "Psychiatrist", "Gynecologist",
  "Pediatrician", "Ophthalmologist", "Dentist", "Urologist",
  "Gastroenterologist", "Pulmonologist", "Oncologist", "Endocrinologist",
  "Rheumatologist", "Nephrologist", "Allergist", "Surgeon",
];

const TABS = [
  { id: "wallet", label: "Health Wallet", icon: Shield },
  { id: "vault", label: "Rx Vault", icon: Camera },
  { id: "doctors", label: "Find Doctors", icon: Search },
  { id: "symptoms", label: "Symptom Checker", icon: Bot },
  { id: "prescription", label: "Rx Analyzer", icon: FileText },
];

const LANGUAGES = [
  "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati",
  "Kannada", "Malayalam", "Punjabi", "Odia", "Urdu", "English",
];

const HealthWallet = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("wallet");

  // ===== Health Wallet State =====
  const [profile, setProfile] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletSaving, setWalletSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [savedPin, setSavedPin] = useState("");
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState("");

  // ===== Doctor Search State =====
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(false);

  // ===== Symptom Checker State =====
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const [symptomLoading, setSymptomLoading] = useState(false);

  // ===== Prescription Analyzer State =====
  const [prescriptionText, setPrescriptionText] = useState("");
  const [rxResult, setRxResult] = useState(null);
  const [rxLoading, setRxLoading] = useState(false);

  // ===== Prescription Vault State =====
  const [savedRx, setSavedRx] = useState([]);
  const [rxUploading, setRxUploading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [rxTitle, setRxTitle] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultPin, setVaultPin] = useState("");

  // Fetch profile + wallet data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setWalletLoading(true);
        // Fetch profile
        const profileRes = await axios.get(
          "http://localhost:4000/api/v3/profile/person/myself",
          { withCredentials: true }
        );
        if (profileRes.data?.data) setProfile(profileRes.data.data);

        // Fetch wallet
        const walletRes = await axios.get(
          "http://localhost:4000/api/v5/health-wallet",
          { withCredentials: true }
        );
        if (walletRes.data?.data) {
          setVaccinations(walletRes.data.data.vaccinations || []);
          setTreatments(walletRes.data.data.treatmentHistory || []);
          setSavedPin(walletRes.data.data.securityPin || "");
          if (!walletRes.data.data.securityPin) setIsLocked(false);
        }
      } catch (err) {
        if (err.response?.status !== 404) console.error(err);
        setIsLocked(false);
      } finally {
        setWalletLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUnlock = () => {
    if (pin === savedPin) {
      setIsLocked(false);
      setPin("");
      toast.success("Wallet unlocked!");
    } else {
      toast.error("Incorrect PIN");
    }
  };

  const handleSetPin = async () => {
    if (newPin.length < 4) {
      toast.error("PIN must be at least 4 digits");
      return;
    }
    try {
      await axios.post(
        "http://localhost:4000/api/v5/health-wallet",
        { securityPin: newPin },
        { withCredentials: true }
      );
      setSavedPin(newPin);
      setNewPin("");
      setSettingPin(false);
      toast.success("Security PIN set!");
    } catch (err) {
      toast.error("Failed to set PIN");
    }
  };

  const addVaccination = () => {
    setVaccinations([...vaccinations, { name: "", date: "", provider: "", batchNumber: "" }]);
  };

  const removeVaccination = (index) => {
    setVaccinations(vaccinations.filter((_, i) => i !== index));
  };

  const updateVaccination = (index, field, value) => {
    const updated = [...vaccinations];
    updated[index][field] = value;
    setVaccinations(updated);
  };

  const addTreatment = () => {
    setTreatments([...treatments, { condition: "", doctor: "", hospital: "", date: "", notes: "" }]);
  };

  const removeTreatment = (index) => {
    setTreatments(treatments.filter((_, i) => i !== index));
  };

  const updateTreatment = (index, field, value) => {
    const updated = [...treatments];
    updated[index][field] = value;
    setTreatments(updated);
  };

  const saveWallet = async () => {
    setWalletSaving(true);
    try {
      await axios.post(
        "http://localhost:4000/api/v5/health-wallet",
        { vaccinations, treatmentHistory: treatments },
        { withCredentials: true }
      );
      toast.success("Health wallet saved!");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setWalletSaving(false);
    }
  };

  // ===== Doctor Search =====
  const searchDoctors = async () => {
    if (!specialty || !city) {
      toast.error("Select a specialty and enter a city");
      return;
    }
    setDoctorLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:4000/api/v5/doctor-search?specialty=${encodeURIComponent(specialty)}&city=${encodeURIComponent(city)}`
      );
      setDoctors(res.data?.data || []);
      if (res.data?.data?.length === 0) toast.info("No doctors found. Try a different city.");
    } catch (err) {
      toast.error("Search failed. Try again.");
    } finally {
      setDoctorLoading(false);
    }
  };

  // ===== Symptom Checker =====
  const checkSymptoms = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }
    setSymptomLoading(true);
    setDiagnosis(null);
    try {
      const res = await axios.post("http://localhost:4000/api/v5/symptom-check", {
        symptoms,
        age,
        gender,
      });
      if (res.data?.data) setDiagnosis(res.data.data);
    } catch (err) {
      toast.error("Failed to analyze symptoms. Try again.");
    } finally {
      setSymptomLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "mild": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "moderate": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "severe": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "critical": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  // ===== Prescription Analyzer =====
  const analyzePrescription = async () => {
    if (!prescriptionText.trim()) {
      toast.error("Please enter prescription or report text");
      return;
    }
    setRxLoading(true);
    setRxResult(null);
    try {
      const res = await axios.post("http://localhost:4000/api/v5/analyze-prescription", {
        prescriptionText,
      });
      if (res.data?.data) setRxResult(res.data.data);
    } catch (err) {
      toast.error("Failed to analyze. Try again.");
    } finally {
      setRxLoading(false);
    }
  };

  // ===== Prescription Vault Functions =====
  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v5/prescriptions", { withCredentials: true });
      if (res.data?.data) setSavedRx(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "vault" && vaultUnlocked) fetchPrescriptions();
  }, [activeTab, vaultUnlocked]);

  const handleVaultUnlock = async () => {
    if (!savedPin) { setVaultUnlocked(true); return; }
    try {
      const res = await axios.post("http://localhost:4000/api/v5/verify-pin", { pin: vaultPin }, { withCredentials: true });
      if (res.data?.verified) { setVaultUnlocked(true); setVaultPin(""); toast.success("Vault unlocked!"); }
      else toast.error("Incorrect PIN");
    } catch { toast.error("Incorrect PIN"); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image too large. Max 10MB."); return; }
    setRxUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await axios.post("http://localhost:4000/api/v5/prescription/upload",
            { imageBase64: reader.result, title: rxTitle || "Prescription" },
            { withCredentials: true }
          );
          if (res.data?.data) {
            setSavedRx((prev) => [res.data.data, ...prev]);
            setSelectedRx(res.data.data);
            setRxTitle("");
            toast.success("Prescription uploaded!");
          }
        } catch (err) { toast.error("Upload failed."); }
        setRxUploading(false);
      };
      reader.readAsDataURL(file);
    } catch { setRxUploading(false); toast.error("Upload failed."); }
  };

  const handleOcr = async (id) => {
    setOcrLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/v5/prescription/ocr", { prescriptionId: id }, { withCredentials: true });
      if (res.data?.data?.ocrText) {
        setSelectedRx((prev) => ({ ...prev, ocrText: res.data.data.ocrText }));
        setSavedRx((prev) => prev.map((r) => r._id === id ? { ...r, ocrText: res.data.data.ocrText } : r));
        toast.success("Text extracted!");
      }
    } catch { toast.error("OCR failed. Try again."); }
    setOcrLoading(false);
  };

  const handleAiAnalysis = async (id) => {
    setAiLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/v5/prescription/analyze", { prescriptionId: id }, { withCredentials: true });
      if (res.data?.data) {
        setSelectedRx((prev) => ({ ...prev, analysis: res.data.data }));
        setSavedRx((prev) => prev.map((r) => r._id === id ? { ...r, analysis: res.data.data } : r));
        toast.success("Analysis complete!");
      }
    } catch { toast.error("Analysis failed."); }
    setAiLoading(false);
  };

  const handleTranslate = async (id) => {
    if (!targetLang) { toast.error("Select a language"); return; }
    setTranslateLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/v5/prescription/translate",
        { prescriptionId: id, targetLanguage: targetLang }, { withCredentials: true });
      if (res.data?.data?.translatedText) {
        setSelectedRx((prev) => ({ ...prev, translatedText: res.data.data.translatedText }));
        toast.success(`Translated to ${targetLang}!`);
      }
    } catch { toast.error("Translation failed."); }
    setTranslateLoading(false);
  };

  const handleDeleteRx = async (id) => {
    if (!confirm("Delete this prescription?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/v5/prescription/${id}`, { withCredentials: true });
      setSavedRx((prev) => prev.filter((r) => r._id !== id));
      if (selectedRx?._id === id) setSelectedRx(null);
      toast.success("Deleted!");
    } catch { toast.error("Delete failed."); }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-gradient-emergency shadow-glow">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Health Wallet</h1>
          <p className="text-muted-foreground mt-2">
            Your complete health records, doctor search & AI symptom checker
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-muted/50 p-1.5 mb-6 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === tab.id
                  ? "bg-background shadow-md text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* =================== TAB 1: HEALTH WALLET =================== */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            {walletLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-medical" />
              </div>
            ) : isLocked ? (
              <Card className="max-w-md mx-auto shadow-emergency">
                <CardContent className="py-12 text-center space-y-6">
                  <Lock className="h-16 w-16 text-medical mx-auto" />
                  <h2 className="text-2xl font-bold">Wallet Locked</h2>
                  <p className="text-muted-foreground">Enter your security PIN to view health records</p>
                  <div className="flex gap-2 max-w-xs mx-auto">
                    <Input
                      type="password"
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                      maxLength={8}
                    />
                    <Button onClick={handleUnlock} className="bg-gradient-emergency">
                      <Unlock className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Profile Summary */}
                {profile && (
                  <Card className="shadow-lg border-medical/20">
                    <CardHeader className="bg-gradient-to-r from-medical/10 to-medical/5">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-medical" />
                        Medical Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-emergency/5 border border-emergency/20 text-center">
                          <p className="text-xs text-muted-foreground uppercase">Blood Type</p>
                          <p className="text-2xl font-bold text-emergency">{profile.bloodGroup || "N/A"}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30 border text-center">
                          <p className="text-xs text-muted-foreground uppercase">Height</p>
                          <p className="text-lg font-semibold">{profile.Height ? `${profile.Height} cm` : "N/A"}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30 border text-center">
                          <p className="text-xs text-muted-foreground uppercase">Weight</p>
                          <p className="text-lg font-semibold">{profile.Weight ? `${profile.Weight} kg` : "N/A"}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30 border text-center">
                          <p className="text-xs text-muted-foreground uppercase">Organ Donor</p>
                          <p className="text-lg font-semibold capitalize">{profile.OrganDonor || "N/A"}</p>
                        </div>
                      </div>
                      {profile.Allergies && (
                        <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                          <p className="text-sm font-semibold text-destructive flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" /> Allergies
                          </p>
                          <p className="text-sm mt-1">{profile.Allergies}</p>
                        </div>
                      )}
                      {profile.CurrentMedications && (
                        <div className="mt-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                          <p className="text-sm font-semibold">Current Medications</p>
                          <p className="text-sm mt-1 text-muted-foreground">{profile.CurrentMedications}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Security PIN */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Security PIN: {savedPin ? "✅ Set" : "❌ Not set"}</span>
                  </div>
                  {settingPin ? (
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="New PIN (4+ digits)"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="w-40"
                        maxLength={8}
                      />
                      <Button size="sm" onClick={handleSetPin}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setSettingPin(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setSettingPin(true)}>
                      {savedPin ? "Change PIN" : "Set PIN"}
                    </Button>
                  )}
                </div>

                {/* Vaccination Records */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Syringe className="h-5 w-5 text-medical" />
                        Vaccination Records
                      </CardTitle>
                      <Button size="sm" onClick={addVaccination} className="bg-medical hover:bg-medical/90">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {vaccinations.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No vaccination records yet. Click "Add" to start.</p>
                    ) : (
                      <div className="space-y-4">
                        {vaccinations.map((v, i) => (
                          <div key={i} className="p-4 rounded-lg border bg-muted/10 space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-muted-foreground">Vaccination #{i + 1}</span>
                              <Button size="sm" variant="ghost" onClick={() => removeVaccination(i)} className="text-destructive h-6 w-6 p-0">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Vaccine Name</Label>
                                <Input placeholder="e.g. Covishield" value={v.name} onChange={(e) => updateVaccination(i, "name", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs">Date</Label>
                                <Input type="date" value={v.date} onChange={(e) => updateVaccination(i, "date", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs">Provider/Hospital</Label>
                                <Input placeholder="e.g. AIIMS Delhi" value={v.provider} onChange={(e) => updateVaccination(i, "provider", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs">Batch Number</Label>
                                <Input placeholder="e.g. ABV1234" value={v.batchNumber} onChange={(e) => updateVaccination(i, "batchNumber", e.target.value)} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Treatment History */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-medical" />
                        Treatment History
                      </CardTitle>
                      <Button size="sm" onClick={addTreatment} className="bg-medical hover:bg-medical/90">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {treatments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No treatment history yet. Click "Add" to start.</p>
                    ) : (
                      <div className="space-y-4">
                        {treatments.map((t, i) => (
                          <div key={i} className="p-4 rounded-lg border bg-muted/10 space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-muted-foreground">Treatment #{i + 1}</span>
                              <Button size="sm" variant="ghost" onClick={() => removeTreatment(i)} className="text-destructive h-6 w-6 p-0">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Condition</Label>
                                <Input placeholder="e.g. Dengue Fever" value={t.condition} onChange={(e) => updateTreatment(i, "condition", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs">Doctor</Label>
                                <Input placeholder="e.g. Dr. Sharma" value={t.doctor} onChange={(e) => updateTreatment(i, "doctor", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs">Hospital</Label>
                                <Input placeholder="e.g. Max Hospital" value={t.hospital} onChange={(e) => updateTreatment(i, "hospital", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs">Date</Label>
                                <Input type="date" value={t.date} onChange={(e) => updateTreatment(i, "date", e.target.value)} />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Notes</Label>
                              <Textarea placeholder="Treatment details, medications prescribed..." value={t.notes} onChange={(e) => updateTreatment(i, "notes", e.target.value)} rows={2} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Save Button */}
                <Button
                  onClick={saveWallet}
                  disabled={walletSaving}
                  className="w-full py-6 text-lg bg-gradient-emergency shadow-glow"
                >
                  {walletSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Shield className="h-5 w-5 mr-2" />}
                  {walletSaving ? "Saving..." : "Save Health Wallet"}
                </Button>
              </>
            )}
          </div>
        )}

        {/* =================== TAB 2: PRESCRIPTION VAULT =================== */}
        {activeTab === "vault" && (
          <div className="space-y-6">
            {!vaultUnlocked && savedPin ? (
              <Card className="max-w-md mx-auto shadow-emergency">
                <CardContent className="py-12 text-center space-y-6">
                  <Lock className="h-16 w-16 text-medical mx-auto" />
                  <h2 className="text-2xl font-bold">Rx Vault Locked</h2>
                  <p className="text-muted-foreground">Enter your security PIN to access prescriptions</p>
                  <div className="flex gap-2 max-w-xs mx-auto">
                    <Input type="password" placeholder="Enter PIN" value={vaultPin}
                      onChange={(e) => setVaultPin(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleVaultUnlock()} maxLength={8} />
                    <Button onClick={handleVaultUnlock} className="bg-gradient-emergency">
                      <Unlock className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Upload Section */}
                <Card className="shadow-lg border-medical/20">
                  <CardHeader className="bg-gradient-to-r from-medical/10 to-medical/5">
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-medical" />
                      Upload Prescription
                    </CardTitle>
                    <CardDescription>
                      Upload a photo of your prescription — AI will extract text and analyze medications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Title (optional)</Label>
                        <Input placeholder="e.g. Dr. Sharma - Feb 2026" value={rxTitle}
                          onChange={(e) => setRxTitle(e.target.value)} />
                      </div>
                      <div className="flex items-end">
                        <label className="w-full cursor-pointer">
                          <input type="file" accept="image/*" capture="environment" className="hidden"
                            onChange={handleImageUpload} disabled={rxUploading} />
                          <div className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-white transition-all ${rxUploading ? "bg-gray-400" : "bg-gradient-emergency hover:opacity-90 shadow-glow"}`}>
                            {rxUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {rxUploading ? "Uploading..." : "Upload / Capture"}
                          </div>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Prescription Detail View */}
                {selectedRx && (
                  <Card className="shadow-lg border-2 border-medical/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5 text-medical" />
                          {selectedRx.title || "Prescription"}
                        </CardTitle>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedRx(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        Uploaded: {new Date(selectedRx.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Image Preview */}
                      <div className="rounded-lg overflow-hidden border bg-muted/10">
                        <img src={selectedRx.imageUrl} alt="Prescription" className="w-full max-h-96 object-contain" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => handleOcr(selectedRx._id)} disabled={ocrLoading}
                          className="bg-blue-600 hover:bg-blue-700">
                          {ocrLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                          {ocrLoading ? "Extracting..." : "Extract Text (OCR)"}
                        </Button>
                        {selectedRx.ocrText && (
                          <Button onClick={() => handleAiAnalysis(selectedRx._id)} disabled={aiLoading}
                            className="bg-purple-600 hover:bg-purple-700">
                            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Stethoscope className="h-4 w-4 mr-1" />}
                            {aiLoading ? "Analyzing..." : "AI Analysis"}
                          </Button>
                        )}
                        <Button onClick={() => handleDeleteRx(selectedRx._id)} variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>

                      {/* OCR Result */}
                      {selectedRx.ocrText && (
                        <div className="space-y-3">
                          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <p className="text-sm font-semibold text-blue-600 flex items-center gap-1 mb-2">
                              <FileText className="h-4 w-4" /> Extracted Text (OCR)
                            </p>
                            <pre className="text-sm whitespace-pre-wrap text-foreground/80 font-mono leading-relaxed max-h-64 overflow-y-auto">{selectedRx.ocrText}</pre>
                          </div>

                          {/* Translation */}
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label className="text-xs">Translate to</Label>
                              <Select value={targetLang} onValueChange={setTargetLang}>
                                <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                                <SelectContent>
                                  {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={() => handleTranslate(selectedRx._id)} disabled={translateLoading}
                              className="bg-green-600 hover:bg-green-700">
                              {translateLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Globe className="h-4 w-4 mr-1" />}
                              Translate
                            </Button>
                          </div>
                          {selectedRx.translatedText && (
                            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                              <p className="text-sm font-semibold text-green-600 mb-2">🌐 Translated Text</p>
                              <pre className="text-sm whitespace-pre-wrap text-foreground/80 font-mono leading-relaxed max-h-64 overflow-y-auto">{selectedRx.translatedText}</pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Analysis Result */}
                      {selectedRx.analysis && selectedRx.analysis.summary && (
                        <div className="space-y-3">
                          {/* Summary */}
                          <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                            <p className="text-sm font-semibold text-purple-600 mb-2">🤖 AI Analysis Summary</p>
                            <p className="text-sm">{selectedRx.analysis.summary}</p>
                          </div>

                          {/* Severity */}
                          {selectedRx.analysis.severity && (
                            <div className={`p-3 rounded-xl border-2 text-center ${getSeverityColor(selectedRx.analysis.severity)}`}>
                              <p className="text-xs uppercase tracking-wider font-medium">Severity</p>
                              <p className="text-2xl font-bold mt-1">{selectedRx.analysis.severity}</p>
                            </div>
                          )}

                          {/* Condition Explanation */}
                          {selectedRx.analysis.conditionExplanation && (
                            <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                              <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1 mb-2">📋 What is this condition?</p>
                              <p className="text-sm text-foreground/80 leading-relaxed">{selectedRx.analysis.conditionExplanation}</p>
                            </div>
                          )}

                          {/* Diagnosed Conditions */}
                          {selectedRx.analysis.diagnosedConditions?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedRx.analysis.diagnosedConditions.map((c, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full bg-medical/10 text-medical text-sm font-medium border border-medical/20">{c}</span>
                              ))}
                            </div>
                          )}

                          {/* Medications — Enhanced */}
                          {selectedRx.analysis.medications?.length > 0 && (
                            <Card>
                              <CardHeader><CardTitle className="text-base">💊 Medications — Detailed Breakdown</CardTitle></CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {selectedRx.analysis.medications.map((m, i) => (
                                    <div key={i} className="p-4 rounded-lg border bg-muted/10 space-y-2">
                                      <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-base">{m.name}</h4>
                                        <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">{m.dosage}</span>
                                      </div>
                                      {(m.frequency || m.duration) && (
                                        <div className="flex gap-3 text-xs text-muted-foreground">
                                          {m.frequency && <span>⏰ {m.frequency}</span>}
                                          {m.duration && <span>📅 {m.duration}</span>}
                                        </div>
                                      )}
                                      {m.purpose && (
                                        <div className="p-2 rounded bg-blue-500/5 border border-blue-500/10">
                                          <p className="text-xs font-semibold text-blue-600">Why prescribed:</p>
                                          <p className="text-sm text-foreground/80">{m.purpose}</p>
                                        </div>
                                      )}
                                      {m.howItWorks && (
                                        <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/10">
                                          <p className="text-xs font-semibold text-cyan-600">How it works:</p>
                                          <p className="text-sm text-foreground/80">{m.howItWorks}</p>
                                        </div>
                                      )}
                                      {m.foodInteractions && (
                                        <p className="text-xs text-amber-600 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">🍽️ {m.foodInteractions}</p>
                                      )}
                                      {m.sideEffects?.length > 0 && (
                                        <div className="text-xs">
                                          <span className="font-medium text-orange-600">⚠️ Side effects: </span>
                                          <span className="text-muted-foreground">{m.sideEffects.join(", ")}</span>
                                        </div>
                                      )}
                                      {m.precautions?.length > 0 && (
                                        <div className="text-xs">
                                          <span className="font-medium text-red-600">🛡️ Precautions: </span>
                                          <span className="text-muted-foreground">{m.precautions.join(", ")}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Warnings */}
                          {selectedRx.analysis.warnings?.length > 0 && (
                            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                              <p className="text-sm font-semibold text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Warnings</p>
                              <ul className="mt-2 space-y-1">
                                {selectedRx.analysis.warnings.map((w, i) => <li key={i} className="text-sm text-destructive/80">• {w}</li>)}
                              </ul>
                            </div>
                          )}

                          {/* Precautions */}
                          {selectedRx.analysis.precautions?.length > 0 && (
                            <Card className="border-amber-500/20">
                              <CardHeader className="bg-amber-500/5"><CardTitle className="text-base">🛡️ Precautions</CardTitle></CardHeader>
                              <CardContent>
                                <ul className="space-y-1.5">
                                  {selectedRx.analysis.precautions.map((p, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />{p}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          )}

                          {/* Dietary Advice */}
                          {selectedRx.analysis.dietaryAdvice?.length > 0 && (
                            <Card className="border-green-500/20">
                              <CardHeader className="bg-green-500/5"><CardTitle className="text-base">🥗 Dietary Advice</CardTitle></CardHeader>
                              <CardContent>
                                <ul className="space-y-1.5">
                                  {selectedRx.analysis.dietaryAdvice.map((d, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{d}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          )}

                          {/* Lifestyle Recommendations */}
                          {selectedRx.analysis.lifestyleRecommendations?.length > 0 && (
                            <Card className="border-violet-500/20">
                              <CardHeader className="bg-violet-500/5"><CardTitle className="text-base">🏃 Lifestyle Recommendations</CardTitle></CardHeader>
                              <CardContent>
                                <ul className="space-y-1.5">
                                  {selectedRx.analysis.lifestyleRecommendations.map((l, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />{l}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          )}

                          {/* When to See Doctor — Emergency Red Flags */}
                          {selectedRx.analysis.whenToSeeDoctor?.length > 0 && (
                            <div className="p-4 rounded-lg bg-red-500/5 border-2 border-red-500/20">
                              <p className="text-sm font-bold text-red-600 flex items-center gap-1 mb-2">🚨 When to See a Doctor Immediately</p>
                              <ul className="space-y-1.5">
                                {selectedRx.analysis.whenToSeeDoctor.map((r, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-red-600/80"><AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Follow-up Actions */}
                          {selectedRx.analysis.followUpActions?.length > 0 && (
                            <Card>
                              <CardHeader><CardTitle className="text-base">📋 Follow-Up Actions</CardTitle></CardHeader>
                              <CardContent>
                                <ul className="space-y-1">
                                  {selectedRx.analysis.followUpActions.map((a, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-4 w-4 text-medical shrink-0 mt-0.5" />{a}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          )}

                          {/* Recommended Specialist — Enhanced */}
                          {selectedRx.analysis.recommendedSpecialist && (
                            <Card className="shadow-md border-medical/20">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Stethoscope className="h-6 w-6 text-medical" />
                                    <div>
                                      <p className="text-sm text-muted-foreground">Recommended Specialist</p>
                                      <p className="font-semibold text-lg">{selectedRx.analysis.recommendedSpecialist}</p>
                                      {selectedRx.analysis.whyThisSpecialist && (
                                        <p className="text-xs text-muted-foreground mt-1">{selectedRx.analysis.whyThisSpecialist}</p>
                                      )}
                                    </div>
                                  </div>
                                  <Button size="sm" onClick={() => { setSpecialty(selectedRx.analysis.recommendedSpecialist); setActiveTab("doctors"); }}
                                    className="bg-medical hover:bg-medical/90">
                                    Find <ChevronRight className="h-4 w-4 ml-1" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Prescription Gallery */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-medical" />
                      Saved Prescriptions ({savedRx.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {savedRx.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No prescriptions saved yet. Upload your first one above!</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {savedRx.map((rx) => (
                          <div key={rx._id}
                            onClick={() => setSelectedRx(rx)}
                            className={`group cursor-pointer rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${selectedRx?._id === rx._id ? "border-medical shadow-md" : "border-transparent hover:border-medical/30"}`}>
                            <div className="aspect-[3/4] bg-muted/20 overflow-hidden">
                              <img src={rx.imageUrl} alt={rx.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="p-2 space-y-1">
                              <p className="text-sm font-medium truncate">{rx.title || "Prescription"}</p>
                              <p className="text-xs text-muted-foreground">{new Date(rx.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                              <div className="flex gap-1">
                                {rx.ocrText && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">OCR ✓</span>}
                                {rx.analysis?.summary && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600">AI ✓</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* =================== TAB 3: DOCTOR SEARCH =================== */}
        {activeTab === "doctors" && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-medical" />
                  Find Doctors in India
                </CardTitle>
                <CardDescription>
                  Real-time hospital search powered by OpenStreetMap — works for any city in India
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Label>Specialty</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1">
                    <Label>City / Area</Label>
                    <Input
                      placeholder="e.g. Mumbai, Delhi, Patna"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchDoctors()}
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      onClick={searchDoctors}
                      disabled={doctorLoading}
                      className="w-full bg-gradient-emergency"
                    >
                      {doctorLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                      {doctorLoading ? "Searching..." : "Search Doctors"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Results */}
            {doctors.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{doctors.length} hospitals/clinics found</p>
                {doctors.map((doc, i) => (
                  <Card key={i} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{doc.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {doc.address}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {doc.distance && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                                📍 {doc.distance} km away
                              </span>
                            )}
                            {doc.rating !== "N/A" && (
                              <span className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <strong>{doc.rating}</strong>
                              </span>
                            )}
                            {doc.isOpen !== null && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.isOpen ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
                                {doc.isOpen ? "Open Now" : "Closed"}
                              </span>
                            )}
                            {doc.phone && (
                              <a href={`tel:${doc.phone}`} className="flex items-center gap-1 text-xs text-medical">
                                <Phone className="h-3 w-3" /> {doc.phone}
                              </a>
                            )}
                          </div>
                        </div>
                        {doc.location && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${doc.location.lat},${doc.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <Button size="sm" variant="outline" className="text-medical border-medical/30">
                              <MapPin className="h-4 w-4 mr-1" /> Directions
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================== TAB 3: SYMPTOM CHECKER =================== */}
        {activeTab === "symptoms" && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-medical" />
                  AI Symptom Checker
                </CardTitle>
                <CardDescription>
                  Describe your symptoms and our AI will suggest possible causes and recommended specialists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 text-sm">
                  <p className="font-semibold text-warning">⚠️ Disclaimer</p>
                  <p className="text-muted-foreground mt-1">
                    This is an AI assistant and NOT a substitute for professional medical advice.
                    Always consult a qualified doctor for accurate diagnosis.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Your Age</Label>
                    <Input placeholder="e.g. 25" value={age} onChange={(e) => setAge(e.target.value)} />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Describe Your Symptoms</Label>
                  <Textarea
                    placeholder="e.g. I have a headache for 3 days, mild fever, and body pain. My throat feels sore and I have a runny nose..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={checkSymptoms}
                  disabled={symptomLoading}
                  className="w-full py-5 bg-gradient-emergency"
                >
                  {symptomLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Analyzing symptoms...
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-5 w-5 mr-2" />
                      Check Symptoms
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Diagnosis Results */}
            {diagnosis && (
              <div className="space-y-4">
                {/* Severity */}
                {diagnosis.severity && (
                  <div className={`p-4 rounded-xl border-2 text-center ${getSeverityColor(diagnosis.severity)}`}>
                    <p className="text-xs uppercase tracking-wider font-medium">Severity Level</p>
                    <p className="text-3xl font-bold mt-1">{diagnosis.severity}</p>
                  </div>
                )}

                {/* Possible Causes */}
                {diagnosis.possibleCauses && (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">Possible Causes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {diagnosis.possibleCauses.map((cause, i) => (
                          <div key={i} className="p-3 rounded-lg border bg-muted/10">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{cause.name}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cause.probability === "High" ? "bg-red-500/10 text-red-500" :
                                  cause.probability === "Medium" ? "bg-yellow-500/10 text-yellow-600" :
                                    "bg-green-500/10 text-green-600"
                                }`}>
                                {cause.probability} probability
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{cause.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommended Specialist */}
                {diagnosis.recommendedSpecialist && (
                  <Card className="shadow-md border-medical/20">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="h-6 w-6 text-medical" />
                        <div>
                          <p className="text-sm text-muted-foreground">Recommended Specialist</p>
                          <p className="font-semibold text-lg">{diagnosis.recommendedSpecialist}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSpecialty(diagnosis.recommendedSpecialist);
                          setActiveTab("doctors");
                        }}
                        className="bg-medical hover:bg-medical/90"
                      >
                        Find <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Immediate Actions */}
                {diagnosis.immediateActions && (
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg">Recommended Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {diagnosis.immediateActions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="h-4 w-4 text-medical shrink-0 mt-0.5" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Disclaimer */}
                <div className="p-4 rounded-lg bg-muted/30 border text-center">
                  <p className="text-xs text-muted-foreground">
                    {diagnosis.disclaimer || "This is an AI-generated analysis. Always consult a qualified healthcare professional."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================== TAB 4: PRESCRIPTION ANALYZER =================== */}
        {activeTab === "prescription" && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-medical" />
                  AI Prescription & Report Analyzer
                </CardTitle>
                <CardDescription>
                  Paste your prescription or medical report text — AI will analyze medications, conditions, and recommend specialists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Prescription / Medical Report Text</Label>
                  <Textarea
                    placeholder={`Paste your prescription here, e.g.:\n\nRx:\nTab. Paracetamol 500mg - 1 tab TDS x 5 days\nTab. Azithromycin 500mg - 1 tab OD x 3 days\nSyp. Ambroxol - 5ml TDS\n\nDiagnosis: Upper Respiratory Tract Infection\nAdvice: Rest, plenty of fluids, follow up in 5 days`}
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                    rows={8}
                  />
                </div>

                <Button
                  onClick={analyzePrescription}
                  disabled={rxLoading}
                  className="w-full py-5 bg-gradient-emergency"
                >
                  {rxLoading ? (
                    <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing prescription...</>
                  ) : (
                    <><FileText className="h-5 w-5 mr-2" /> Analyze Prescription</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Prescription Results */}
            {rxResult && (
              <div className="space-y-4">
                {/* Summary */}
                {rxResult.summary && (
                  <Card className="shadow-md border-medical/20">
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold text-medical">Summary</p>
                      <p className="text-sm mt-1">{rxResult.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Severity */}
                {rxResult.severity && (
                  <div className={`p-4 rounded-xl border-2 text-center ${getSeverityColor(rxResult.severity)}`}>
                    <p className="text-xs uppercase tracking-wider font-medium">Severity</p>
                    <p className="text-2xl font-bold mt-1">{rxResult.severity}</p>
                  </div>
                )}

                {/* Medications */}
                {rxResult.medications && rxResult.medications.length > 0 && (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">💊 Medications Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {rxResult.medications.map((med, i) => (
                          <div key={i} className="p-3 rounded-lg border bg-muted/10">
                            <div className="flex justify-between">
                              <h4 className="font-semibold">{med.name}</h4>
                              <span className="text-xs text-muted-foreground">{med.dosage}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Purpose: {med.purpose}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Diagnosed Conditions */}
                {rxResult.diagnosedConditions && rxResult.diagnosedConditions.length > 0 && (
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg">🏷️ Diagnosed Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {rxResult.diagnosedConditions.map((c, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full bg-medical/10 text-medical text-sm font-medium border border-medical/20">
                            {c}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommended Specialist */}
                {rxResult.recommendedSpecialist && (
                  <Card className="shadow-md border-medical/20">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="h-6 w-6 text-medical" />
                        <div>
                          <p className="text-sm text-muted-foreground">Recommended Specialist</p>
                          <p className="font-semibold text-lg">{rxResult.recommendedSpecialist}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSpecialty(rxResult.recommendedSpecialist);
                          setActiveTab("doctors");
                        }}
                        className="bg-medical hover:bg-medical/90"
                      >
                        Find <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Warnings */}
                {rxResult.warnings && rxResult.warnings.length > 0 && (
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-sm font-semibold text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Warnings
                    </p>
                    <ul className="mt-2 space-y-1">
                      {rxResult.warnings.map((w, i) => (
                        <li key={i} className="text-sm text-destructive/80">• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-up Actions */}
                {rxResult.followUpActions && rxResult.followUpActions.length > 0 && (
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg">Follow-Up Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {rxResult.followUpActions.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="h-4 w-4 text-medical shrink-0 mt-0.5" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthWallet;
