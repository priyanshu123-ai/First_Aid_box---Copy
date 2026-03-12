import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Heart, FileText, Shield, Phone, Mail, Plus, Trash2, Edit, Download, Activity, QrCode, Loader2, AlertCircle, MapPin } from "lucide-react";
import { EmergencyContext } from "@/context/EmergecyCon";
import MapPicker from "@/components/MapPicker";

const Profile = () => {
  const { setDetail } = useContext(EmergencyContext);

  const [form, setForm] = useState({
    Person_name: "myself",
    FullName: "",
    DateOfBirth: "",
    email: "",
    phone: "",
    bloodGroup: "",
    Height: "",
    Weight: "",
    OrganDonor: "",
    Allergies: "",
    CurrentMedications: "",
    MedicalConditions: "",
    InsuranceProvider: "",
    PolicyNumber: "",
  });

  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: Date.now(), name: "", phoneNumber: "", relation: "", location: null },
  ]);

  const [editMode, setEditMode] = useState(true);
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);

  // Fetch profile by Person_name
  const fetchProfile = async (person) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:4000/api/v3/profile/person/${person}`,
        { withCredentials: true }
      );

      if (res.data?.data) {
        const data = res.data.data;
        setForm({
          Person_name: data.Person_name || person,
          FullName: data.FullName || "",
          DateOfBirth: data.DateOfBirth || "",
          email: data.email || "",
          phone: data.phone || "",
          bloodGroup: data.bloodGroup || "",
          Height: data.Height || "",
          Weight: data.Weight || "",
          OrganDonor: data.OrganDonor || "",
          Allergies: data.Allergies || "",
          CurrentMedications: data.CurrentMedications || "",
          MedicalConditions: data.MedicalConditions || "",
          InsuranceProvider: data.InsuranceProvider || "",
          PolicyNumber: data.PolicyNumber || "",
        });
        setEmergencyContacts(
          data.contactDetails?.length > 0
            ? data.contactDetails.map((c) => ({
                id: Date.now() + Math.random(),
                name: c.name,
                phoneNumber: c.phoneNumber,
                relation: c.relation,
                location: c.location || null,
              }))
            : [{ id: Date.now(), name: "", phoneNumber: "", relation: "", location: null }]
        );
        setProfileId(data._id);
        setDetail(data);
        setEditMode(false); // show card view if data exists
      } else {
        setForm((prev) => ({ ...prev, Person_name: person }));
        setEmergencyContacts([{ id: Date.now(), name: "", phoneNumber: "", relation: "", location: null }]);
        setProfileId(null);
        setEditMode(true); // show form if no data
      }
    } catch (err) {
      // 404 means no profile yet — that's fine, show the form
      if (err.response?.status === 404) {
        setForm((prev) => ({ ...prev, Person_name: person }));
        setEmergencyContacts([{ id: Date.now(), name: "", phoneNumber: "", relation: "", location: null }]);
        setProfileId(null);
        setEditMode(true);
      } else {
        console.error(err);
        toast.error("Failed to load profile");
        setEditMode(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(form.Person_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });
  const handleSelectChange = (field, value) => setForm({ ...form, [field]: value });

  const handleContactChange = (id, field, value) => {
    setEmergencyContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([
      ...emergencyContacts,
      { id: Date.now() + Math.random(), name: "", phoneNumber: "", relation: "", location: null },
    ]);
  };

  const removeEmergencyContact = (id) => {
    setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        contactDetails: emergencyContacts.map((c) => ({
          name: c.name,
          phoneNumber: c.phoneNumber,
          relation: c.relation,
          ...(c.location ? { location: c.location } : {}),
        })),
      };

      let res;
      if (profileId) {
        res = await axios.put(
          `http://localhost:4000/api/v3/profile/${profileId}`,
          payload,
          { withCredentials: true }
        );
        toast.success("Profile updated successfully!");
      } else {
        res = await axios.post(
          "http://localhost:4000/api/v3/profile",
          payload,
          { withCredentials: true }
        );
        setProfileId(res.data.data._id);
        toast.success("Profile created successfully!");
      }

      setForm({
        Person_name: res.data.data.Person_name || form.Person_name,
        FullName: res.data.data.FullName || "",
        DateOfBirth: res.data.data.DateOfBirth || "",
        email: res.data.data.email || "",
        phone: res.data.data.phone || "",
        bloodGroup: res.data.data.bloodGroup || "",
        Height: res.data.data.Height || "",
        Weight: res.data.data.Weight || "",
        OrganDonor: res.data.data.OrganDonor || "",
        Allergies: res.data.data.Allergies || "",
        CurrentMedications: res.data.data.CurrentMedications || "",
        MedicalConditions: res.data.data.MedicalConditions || "",
        InsuranceProvider: res.data.data.InsuranceProvider || "",
        PolicyNumber: res.data.data.PolicyNumber || "",
      });
      setEmergencyContacts(
        res.data.data.contactDetails?.length > 0
          ? res.data.data.contactDetails.map((c) => ({
              id: Date.now() + Math.random(),
              name: c.name,
              phoneNumber: c.phoneNumber,
              relation: c.relation,
              location: c.location || null,
            }))
          : [{ id: Date.now(), name: "", phoneNumber: "", relation: "", location: null }]
      );
      if (!profileId) setProfileId(res.data.data._id);
      setDetail(res.data.data);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    }
  };

  const getProfileQrData = () => {
    // Encode profile data as base64 in a URL so the scanned page can show data + SOS button
    const profileData = {
      n: form.FullName,
      dob: form.DateOfBirth,
      e: form.email,
      p: form.phone,
      bg: form.bloodGroup,
      h: form.Height,
      w: form.Weight,
      od: form.OrganDonor,
      al: form.Allergies,
      med: form.CurrentMedications,
      mc: form.MedicalConditions,
      ip: form.InsuranceProvider,
      pn: form.PolicyNumber,
      ec: emergencyContacts
        .filter((c) => c.name || c.phoneNumber)
        .map((c) => ({ n: c.name, p: c.phoneNumber, r: c.relation, l: c.location })),
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(profileData))));
    return `${window.location.origin}/profile-view?data=${encoded}`;
  };

  const handleDownloadCard = () => {
    const input = document.getElementById("profileCardPreview");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Medical_Profile.pdf");
    });
  };

  const handleSOS = async () => {
    setSosLoading(true);
    try {
      // Get live location
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
      const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

      // Build emergency contacts email list
      const contactEmails = emergencyContacts
        .filter((c) => c.email)
        .map((c) => c.email);

      const contactDetails = emergencyContacts
        .filter((c) => c.name || c.phoneNumber)
        .map((c) => `${c.name} (${c.relation}): ${c.phoneNumber}`)
        .join(", ");

      const message = `🚨 EMERGENCY SOS ALERT!\n\n` +
        `${form.FullName || "Someone"} needs IMMEDIATE HELP!\n\n` +
        `📍 LIVE LOCATION:\n${mapsLink}\n\n` +
        `🏥 MEDICAL INFO:\n` +
        `Blood Group: ${form.bloodGroup || "N/A"}\n` +
        `Allergies: ${form.Allergies || "None"}\n` +
        `Medications: ${form.CurrentMedications || "None"}\n` +
        `Conditions: ${form.MedicalConditions || "None"}\n\n` +
        `📞 Emergency Contacts: ${contactDetails || "None saved"}\n\n` +
        `Phone: ${form.phone || "N/A"}\n` +
        `This is an automated emergency alert.`;

      // Send email via backend
      await axios.post(
        "http://localhost:4000/api/v4/mail",
        {
          email: [...contactEmails, form.email].filter(Boolean), // Include all emergency emails and the user's email
          subject: `🚨 EMERGENCY SOS - ${form.FullName || "User"} needs help!`,
          message: message,
          location: mapsLink,
        },
        { withCredentials: true }
      );

      toast.success("🚨 SOS Alert sent! Help is on the way.");
    } catch (err) {
      console.error(err);
      if (err.code === 1 || err.message?.includes("denied")) {
        toast.error("Location access denied. Please enable location permissions.");
      } else {
        toast.error("Failed to send SOS. Check your connection.");
      }
    } finally {
      setSosLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-medical mx-auto" />
          <p className="text-lg text-muted-foreground">Loading your medical profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 overflow-x-hidden">
      {/* Header */}
      <div className="container mx-auto px-4 max-w-4xl mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-emergency">Medical Profile</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Store your medical information for faster emergency response
          </p>
        </div>

        {/* Profile Type Toggle */}
        <div className="flex justify-center mb-8">
          <Button
            variant={form.Person_name === "myself" ? "default" : "outline"}
            onClick={() => fetchProfile("myself")}
            className="rounded-r-none"
          >
            Myself
          </Button>
        </div>
      </div>

      {editMode ? (
        // ============= FORM VIEW =============
        <form onSubmit={handleSaveProfile}>
          <div className="container mx-auto px-4 max-w-4xl space-y-6">
            {/* Personal Information */}
            <Card className="shadow-card border-l-4 border-l-medical">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-medical/10">
                    <User className="h-6 w-6 text-medical" />
                  </div>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Basic details for identification</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="FullName">Full Name</Label>
                    <Input id="FullName" value={form.FullName} onChange={handleChange} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="DateOfBirth">Date of Birth</Label>
                    <Input id="DateOfBirth" type="date" value={form.DateOfBirth} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="shadow-card border-l-4 border-l-emergency">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emergency/10">
                    <Heart className="h-6 w-6 text-emergency" />
                  </div>
                  <div>
                    <CardTitle>Medical Information</CardTitle>
                    <CardDescription>Critical health details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select value={form.bloodGroup} onValueChange={(v) => handleSelectChange("bloodGroup", v)}>
                      <SelectTrigger id="bloodGroup">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Height">Height (cm)</Label>
                    <Input id="Height" type="number" value={form.Height} onChange={handleChange} placeholder="170" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="Weight">Weight (kg)</Label>
                    <Input id="Weight" type="number" value={form.Weight} onChange={handleChange} placeholder="70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="OrganDonor">Organ Donor</Label>
                    <Select value={form.OrganDonor} onValueChange={(v) => handleSelectChange("OrganDonor", v)}>
                      <SelectTrigger id="OrganDonor">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Allergies">Allergies</Label>
                  <Textarea
                    id="Allergies"
                    value={form.Allergies}
                    onChange={handleChange}
                    placeholder="List any allergies (medications, food, environmental)"
                    className="min-h-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="CurrentMedications">Current Medications</Label>
                  <Textarea
                    id="CurrentMedications"
                    value={form.CurrentMedications}
                    onChange={handleChange}
                    placeholder="List all current medications and dosages"
                    className="min-h-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="MedicalConditions">Medical Conditions</Label>
                  <Textarea
                    id="MedicalConditions"
                    value={form.MedicalConditions}
                    onChange={handleChange}
                    placeholder="List chronic conditions, past surgeries, or important medical history"
                    className="min-h-20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="shadow-card border-l-4 border-l-success">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Phone className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <CardTitle>Emergency Contacts</CardTitle>
                      <CardDescription>People to contact in case of emergency</CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEmergencyContact}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {emergencyContacts.map((c, index) => (
                  <div key={c.id} className="p-4 border rounded-lg bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Contact {index + 1}</span>
                      {emergencyContacts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmergencyContact(c.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={c.name}
                          onChange={(e) => handleContactChange(c.id, "name", e.target.value)}
                          placeholder="Contact name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          type="tel"
                          value={c.phoneNumber}
                          onChange={(e) => handleContactChange(c.id, "phoneNumber", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Relation</Label>
                        <Input
                          value={c.relation}
                          onChange={(e) => handleContactChange(c.id, "relation", e.target.value)}
                          placeholder="e.g., Spouse, Parent"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-dashed mt-4">
                      <MapPicker
                        location={c.location}
                        onChange={(loc) => handleContactChange(c.id, "location", loc)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card className="shadow-card border-l-4 border-l-warning">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Shield className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle>Insurance Information</CardTitle>
                    <CardDescription>Health insurance details (optional)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="InsuranceProvider">Insurance Provider</Label>
                    <Input
                      id="InsuranceProvider"
                      value={form.InsuranceProvider}
                      onChange={handleChange}
                      placeholder="Provider name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="PolicyNumber">Policy Number</Label>
                    <Input
                      id="PolicyNumber"
                      value={form.PolicyNumber}
                      onChange={handleChange}
                      placeholder="Policy number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button type="submit" size="lg" className="bg-gradient-emergency shadow-emergency">
                <FileText className="h-5 w-5 mr-2" />
                Save Medical Profile
              </Button>
            </div>

            {/* Privacy Notice */}
            <Card className="border-medical/30 bg-medical/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-medical shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Your medical information is encrypted and securely stored. It will only be shared with emergency contacts and medical personnel in emergency situations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      ) : (
        // ============= CARD VIEW =============
        <div className="container mx-auto px-4 max-w-4xl">
          <Card id="profileCardPreview" className="shadow-emergency border-2 border-medical/20 bg-gradient-to-br from-card via-card to-medical/5">
            <CardHeader className="border-b bg-gradient-emergency text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-white/20">
                    <Activity className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-white">Medical Profile Card</CardTitle>
                    <CardDescription className="text-white/80">Emergency Medical Information</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-medical/5 border border-medical/20">
                  <h3 className="font-semibold text-medical mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {form.FullName || "N/A"}</p>
                    <p><strong>DOB:</strong> {form.DateOfBirth || "N/A"}</p>
                    <p><strong>Email:</strong> {form.email || "N/A"}</p>
                    <p><strong>Phone:</strong> {form.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emergency/5 border border-emergency/20">
                  <h3 className="font-semibold text-emergency mb-3 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Vital Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Blood Group:</strong> {form.bloodGroup || "N/A"}</p>
                    <p><strong>Height:</strong> {form.Height ? `${form.Height} cm` : "N/A"}</p>
                    <p><strong>Weight:</strong> {form.Weight ? `${form.Weight} kg` : "N/A"}</p>
                    <p><strong>Organ Donor:</strong> {form.OrganDonor || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Medical Details */}
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <h3 className="font-semibold text-warning mb-3">Medical History</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Allergies:</strong>
                    <p className="text-muted-foreground mt-1">{form.Allergies || "None reported"}</p>
                  </div>
                  <div>
                    <strong>Current Medications:</strong>
                    <p className="text-muted-foreground mt-1">{form.CurrentMedications || "None reported"}</p>
                  </div>
                  <div>
                    <strong>Medical Conditions:</strong>
                    <p className="text-muted-foreground mt-1">{form.MedicalConditions || "None reported"}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contacts
                </h3>
                <div className="space-y-2 text-sm">
                  {emergencyContacts.map((c, index) => (
                    <div key={c.id} className="p-3 rounded bg-background/50 space-y-2">
                      <p><strong>{c.name || `Contact ${index + 1}`}</strong> ({c.relation || "N/A"})</p>
                      <div className="flex flex-col gap-1">
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {c.phoneNumber || "No phone"}
                      </p>
                      {c.location && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2 border border-border">
                          <p className="flex items-center gap-1 font-medium text-foreground mb-1">
                            <MapPin className="h-3 w-3 text-medical" /> Wait Point
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <span>Lat: {c.location.lat.toFixed(6)}</span>
                            <span>Lng: {c.location.lng.toFixed(6)}</span>
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${c.location.lat},${c.location.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-medical hover:underline mt-1 block"
                          >
                            View in Maps
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance */}
              <div className="p-4 rounded-lg bg-muted/30 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Provider:</strong> {form.InsuranceProvider || "N/A"}</p>
                  <p><strong>Policy Number:</strong> {form.PolicyNumber || "N/A"}</p>
                </div>
              </div>

              {/* QR Code Section */}
              {profileId && (
                <div className="p-6 rounded-lg bg-gradient-to-br from-medical/5 to-emergency/5 border-2 border-dashed border-medical/30">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex items-center gap-2 text-medical">
                      <QrCode className="h-6 w-6" />
                      <h3 className="font-semibold text-lg">Scan for Emergency Info</h3>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Scan this QR code with any phone — your complete medical profile will appear directly. No internet needed.
                    </p>
                    <div className="p-4 bg-white rounded-xl shadow-lg">
                      <QRCodeSVG
                        value={getProfileQrData()}
                        size={200}
                        level="L"
                        includeMargin={true}
                        fgColor="#1a1a2e"
                        bgColor="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Actions */}
            <div className="border-t p-6 bg-muted/20 space-y-4">
              {/* SOS Emergency Button */}
              <Button
                onClick={handleSOS}
                disabled={sosLoading}
                className="w-full py-6 text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse hover:animate-none rounded-xl"
              >
                <AlertCircle className="h-6 w-6 mr-2" />
                {sosLoading ? "Sending SOS..." : "🚨 EMERGENCY SOS"}
              </Button>
              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="default" onClick={handleDownloadCard} className="bg-gradient-emergency shadow-glow">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;
