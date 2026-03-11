import React from "react";
import {
  User,
  Heart,
  FileText,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Pill,
  AlertCircle,
  Hospital as HospitalIcon,
  Clock,
  Mail,
  Droplet,
  Weight,
  Ruler,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Hospital = () => {
  const navigate = useNavigate();

  // ===== Dummy User Data =====
  const userDetail = {
    FullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    DateOfBirth: "1990-05-15",
    bloodGroup: "O+",
    Height: 175,
    Weight: 70,
    OrganDonor: "yes",
    Allergies: "Peanuts, Pollen",
    CurrentMedications: "Ibuprofen 200mg daily",
    MedicalConditions: "Asthma",
    InsuranceProvider: "HealthCare Inc.",
    PolicyNumber: "HC123456789",
    contactDetails: [
      { name: "Jane Doe", relation: "Wife", phoneNumber: "+1234567891" },
      { name: "Mike Doe", relation: "Brother", phoneNumber: "+1234567892" },
    ],
  };

  const sessions = [
    { date: "2025-10-13T09:00:00", duration: 60, averageHeartRate: 72, averageSpO2: 98 },
    { date: "2025-10-12T09:00:00", duration: 45, averageHeartRate: 75, averageSpO2: 97 },
    { date: "2025-10-11T09:00:00", duration: 30, averageHeartRate: 70, averageSpO2: 99 },
  ];

  const userProfile = {
    fullName: userDetail.FullName,
    email: userDetail.email,
    phone: userDetail.phone,
    dateOfBirth: userDetail.DateOfBirth,
    bloodType: userDetail.bloodGroup,
    height: userDetail.Height,
    weight: userDetail.Weight,
    organDonor: userDetail.OrganDonor,
  };

  const medicalInfo = {
    allergies: userDetail.Allergies,
    currentMedications: userDetail.CurrentMedications,
    medicalConditions: userDetail.MedicalConditions,
  };

  const insuranceInfo = {
    provider: userDetail.InsuranceProvider,
    policyNumber: userDetail.PolicyNumber,
  };

  const emergencyContacts = userDetail.contactDetails;

  const vitalStats = sessions.length
    ? {
        lastHeartRate: sessions[sessions.length - 1].averageHeartRate,
        lastSpO2: sessions[sessions.length - 1].averageSpO2,
        lastCheckDate: new Date(sessions[sessions.length - 1].date).toLocaleDateString(),
      }
    : {
        lastHeartRate: "--",
        lastSpO2: "--",
        lastCheckDate: "--",
      };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-blue-100 rounded-full shadow-lg">
              <HospitalIcon className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700">Medical Dashboard</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your comprehensive health information and medical records
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button onClick={() => navigate("/")} size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
            <Heart className="h-5 w-5" /> Heart Rate Monitor
          </Button>
          <Button onClick={() => navigate("/emergency")} size="lg" className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg">
            <AlertCircle className="h-5 w-5" /> Emergency SOS
          </Button>
          <Button onClick={() => navigate("/first-aid")} variant="outline" size="lg" className="gap-2 border-2 border-blue-600 text-blue-700 hover:bg-blue-50 shadow-lg">
            <FileText className="h-5 w-5" /> First Aid Guide
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
     <TabsList className="grid w-full grid-cols-4 mb-8  bg-white shadow-lg rounded-xl border border-gray-200">
  <TabsTrigger
    value="profile"
    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-center py-3 w-full"
  >
    Profile
  </TabsTrigger>
  <TabsTrigger
    value="vitals"
    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-center py-3 w-full"
  >
    Vitals
  </TabsTrigger>
  <TabsTrigger
    value="history"
    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-center py-3 w-full"
  >
    History
  </TabsTrigger>
  <TabsTrigger
    value="contacts"
    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-center py-3 w-full"
  >
    Contacts
  </TabsTrigger>
</TabsList>


          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card className="border-l-4 border-l-blue-600 bg-red-600 hover:shadow-xl py-3 transition-shadow duration-300 bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span className="font-medium">{userProfile.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span className="font-medium">{userProfile.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Blood Type:</span>
                    <Badge variant="outline" className="gap-1">
                      <Droplet className="h-3 w-3" />
                      {userProfile.bloodType}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organ Donor:</span>
                    <Badge variant={userProfile.organDonor === "yes" ? "default" : "secondary"}>
                      {userProfile.organDonor}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-sm">{userProfile.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{userProfile.phone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Physical Stats */}
              <Card className="border-l-4 border-l-green-600 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Activity className="h-5 w-5" />
                    Physical Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Height</span>
                    </div>
                    <span className="text-2xl font-bold">{userProfile.height} <span className="text-sm text-muted-foreground">cm</span></span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Weight className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Weight</span>
                    </div>
                    <span className="text-2xl font-bold">{userProfile.weight} <span className="text-sm text-muted-foreground">kg</span></span>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Info Cards */}
              <Card className="border-l-4 border-l-red-600 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{medicalInfo.allergies}</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-600 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Pill className="h-5 w-5" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{medicalInfo.currentMedications}</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-600 md:col-span-2 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <FileText className="h-5 w-5" />
                    Medical Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{medicalInfo.medicalConditions}</p>
                </CardContent>
              </Card>

              {/* Insurance */}
              <Card className="border-l-4 border-l-blue-600 md:col-span-2 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <FileText className="h-5 w-5" />
                    Insurance Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium">{insuranceInfo.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Policy Number:</span>
                    <span className="font-medium">{insuranceInfo.policyNumber}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-red-50 border-2 border-red-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-red-700">
                    <Heart className="h-6 w-6" />
                    Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-bold text-red-600">{vitalStats.lastHeartRate}</p>
                  <p className="text-gray-600 mt-2 font-semibold">BPM</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-blue-700">
                    <Activity className="h-6 w-6" />
                    Oxygen Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-bold text-blue-600">{vitalStats.lastSpO2}</p>
                  <p className="text-gray-600 mt-2 font-semibold">SpO₂ %</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-green-50 border-2 border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-green-700">
                    <Clock className="h-6 w-6" />
                    Last Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-medium text-green-700">{vitalStats.lastCheckDate}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {sessions.map((s, i) => (
              <Card key={i} className="hover:shadow-xl transition-shadow duration-300 bg-gradient-to-r from-white to-blue-50 border-l-4 border-l-blue-600">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1 font-semibold">Date</p>
                      <p className="font-bold text-gray-800">{new Date(s.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1 font-semibold">Duration</p>
                      <p className="font-bold text-gray-800">{s.duration}s</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1 font-semibold">Heart Rate</p>
                      <p className="font-bold text-red-600">{s.averageHeartRate} BPM</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1 font-semibold">SpO₂</p>
                      <p className="font-bold text-blue-600">{s.averageSpO2}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            {emergencyContacts.map((c, i) => (
              <Card key={i} className="hover:shadow-xl transition-shadow duration-300 bg-gradient-to-r from-white to-red-50 border-l-4 border-l-red-600">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="space-y-2">
                      <p className="font-bold text-xl text-gray-800">{c.name}</p>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">{c.relation}</Badge>
                      <p className="text-gray-600 flex items-center gap-2 mt-2 font-medium">
                        <Phone className="h-4 w-4" />
                        {c.phoneNumber}
                      </p>
                    </div>
                    <Button
                      onClick={() => window.open(`tel:${c.phoneNumber}`, "_self")}
                      className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                    >
                      <Phone className="h-4 w-4" />
                      Call Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Hospital;
