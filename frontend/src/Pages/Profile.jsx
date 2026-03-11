import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
import { User, Heart, FileText, Shield, Phone, Plus, Trash2, Edit, Download, Activity } from "lucide-react";
import { EmergencyContext } from "@/context/EmergecyCon";

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
    { id: Date.now(), name: "", phoneNumber: "", relation: "" },
  ]);

  const [editMode, setEditMode] = useState(true);
  const [profileId, setProfileId] = useState(null);

  // Fetch profile by Person_name
//   const fetchProfile = async (person) => {
//     try {
//     const res = await axios.get(
//   `http://localhost:4000/api/v3/profile/person/${person}`,
//   { withCredentials: true }
// );

//       if (res.data?.data) {
//         const data = res.data.data;
//         setForm(data);
//         setEmergencyContacts(
//           data.contactDetails?.map((c) => ({
//             id: Date.now() + Math.random(),
//             name: c.name,
//             phoneNumber: c.phoneNumber,
//             relation: c.relation,
//           })) || [{ id: Date.now(), name: "", phoneNumber: "", relation: "" }]
//         );
//         setProfileId(data._id);
//         setEditMode(false); // show card view if data exists
//       } else {
//         setForm((prev) => ({ ...prev, Person_name: person }));
//         setEmergencyContacts([{ id: Date.now(), name: "", phoneNumber: "", relation: "" }]);
//         setProfileId(null);
//         setEditMode(true); // show form if no data
//       }
//     } catch (err) {
//       console.error(err);
//       setEditMode(true);
//     }
//   };

  // useEffect(() => {
  //   fetchProfile(form.Person_name);
  // }, []);

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
      { id: Date.now() + Math.random(), name: "", phoneNumber: "", relation: "" },
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

      setForm(res.data.data);
      setEmergencyContacts(
        res.data.data.contactDetails?.map((c) => ({
          id: Date.now() + Math.random(),
          name: c.name,
          phoneNumber: c.phoneNumber,
          relation: c.relation,
        })) || [{ id: Date.now(), name: "", phoneNumber: "", relation: "" }]
      );
      setDetail(res.data.data);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    }
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
                    <div key={c.id} className="p-2 rounded bg-background/50">
                      <p><strong>{c.name || `Contact ${index + 1}`}</strong> ({c.relation || "N/A"})</p>
                      <p className="text-muted-foreground">{c.phoneNumber || "No phone"}</p>
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
            </CardContent>

            {/* Actions */}
            <div className="border-t p-6 bg-muted/20 flex justify-between gap-3">
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="default" onClick={handleDownloadCard} className="bg-gradient-emergency shadow-glow">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;
