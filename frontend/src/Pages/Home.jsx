import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Heart,
  Phone,
  MapPin,
  BookOpen,
  Shield,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";
import Navbar from "./Navbar";

import firstAidIcon from "@/assets/first-aid-icon.png";
import sosIcon from "@/assets/sos-icon.png";
import hospitalIcon from "@/assets/hospital-icon.png";

// ✅ use new Header

const Home = () => {
  return (
    <div className="min-h-screen  flex flex-col">
      {/* Navbar/Header */}

      <section className="relative overflow-hidden flex-grow min-h-[600px]">
        {/* Background image with smooth overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-75"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        {/* Gradient overlay for contrast */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/50 to-transparent"
          aria-hidden="true"
        />

        {/* Content container */}
        <div className="relative container mx-auto px-6 py-24 md:py-32 flex flex-col justify-center min-h-[600px] max-w-4xl text-center">
          {/* Highlight badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 self-center mb-6 shadow-lg">
            <Heart className="h-5 w-5 text-white" fill="currentColor" />
            <span className="text-sm font-semibold text-white uppercase tracking-wide drop-shadow-lg">
              One Click to Save a Life
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-xl mb-6">
            Emergency First-Aid & Nearest Help
          </h1>

          {/* Description text */}
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md mb-10">
            Get instant first-aid guidance, send emergency alerts, and find
            nearby hospitals. Every second counts in an emergency.
          </p>

          {/* Primary action buttons group */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center max-w-md mx-auto sm:max-w-none">
            <Link to="/emergency" className="w-full sm:w-auto">
              <Button
                size="xl"
                className="bg-emergency py-5 px-10 text-xl rounded-xl hover:bg-emergency-hover shadow-lg shadow-emergency/50 transition duration-300 flex items-center justify-center gap-3 emergency-pulse"
              >
                <AlertCircle className="h-6 w-6" />
                Emergency SOS
              </Button>
            </Link>
            <Link to="/first-aid" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="xl"
                className="px-10 py-5 text-xl rounded-xl border-white border-2 text-red-700 transition duration-300 flex items-center justify-center gap-3"
              >
                <BookOpen className="h-6 w-6" />
                First Aid Guide
              </Button>
            </Link>
          </div>

          {/* Secondary action */}
          <div className="mt-8">
            <Link to="/auth" className="inline-block">
              <Button
                variant="ghost"
                className="text-white hover:text-white/90 hover:bg-white/10 text-sm md:text-lg transition"
              >
                Sign in to save your medical profile →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Section heading */}
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
              Life-Saving Features at Your Fingertips
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Comprehensive emergency assistance designed to help you act
              quickly and confidently in critical situations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Card 1 - First Aid Guide */}
            <div className="p-8 hover:scale-105 duration-700 transition-all  border rounded-xl shadow-lg flex flex-col items-center bg-gradient-to-tr from-white to-blue-50">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-100 h-20 w-20 mb-6">
                <img src={firstAidIcon} alt="First Aid" className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                First-Aid Guide
              </h3>
              <p className="text-gray-700 mb-6 text-center max-w-xs">
                Step-by-step instructions with voice guidance for urgent
                situations.
              </p>
              <ul className="mb-8 space-y-3 w-full text-gray-700 text-sm">
                <li className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-blue-600" /> CPR & heart attack
                  response
                </li>
                <li className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-teal-600" /> Burns & wound
                  treatment
                </li>
                <li className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-green-600" /> Fractures &
                  injuries
                </li>
              </ul>
              <Link to="/first-aid" className="w-full">
                <button
                  type="button"
                  className="w-full py-3 text-lg font-semibold text-white bg-blue-700 rounded-lg transition-transform duration-300  hover:bg-blue-600"
                >
                  View Guide
                </button>
              </Link>
            </div>

            {/* Card 2 - Emergency SOS */}
            <div className="p-8 hover:scale-105 duration-700 transition-all  border rounded-xl shadow-lg flex flex-col items-center bg-gradient-to-tr from-white to-red-50">
              <div className="inline-flex items-center justify-center rounded-full bg-red-100 h-20 w-20 mb-6">
                <img src={sosIcon} alt="Emergency SOS" className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Emergency SOS
              </h3>
              <p className="text-gray-700 mb-6 text-center max-w-xs">
                One-click emergency alerts to notify contacts & share location.
              </p>
              <ul className="mb-8 space-y-3 w-full text-gray-700 text-sm">
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-red-600" /> Alert emergency
                  contacts instantly
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-pink-600" /> Share live
                  location automatically
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-rose-600" /> Fastest response
                  time
                </li>
              </ul>
              <Link to="/emergency" className="w-full">
                <button
                  type="button"
                  className="w-full py-3 text-lg font-semibold text-white bg-red-700 rounded-lg transition-transform duration-300 hover:bg-red-600"
                >
                  Activate SOS
                </button>
              </Link>
            </div>

            {/* Card 3 - Hospital Locator */}
            <div className="p-8 hover:scale-105 duration-700 transition-all  border rounded-xl shadow-lg flex flex-col items-center bg-gradient-to-tr from-white to-green-50">
              <div className="inline-flex items-center justify-center rounded-full bg-green-100 h-20 w-20 mb-6">
                <img
                  src={hospitalIcon}
                  alt="Hospital Locator"
                  className="h-12 w-12"
                />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Hospital Locator
              </h3>
              <p className="text-gray-700 mb-6 text-center max-w-xs">
                Quickly find nearest hospitals and get direct contact details.
              </p>
              <ul className="mb-8 space-y-3 w-full text-gray-700 text-sm">
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600" /> Nearby hospitals
                  & clinics
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-emerald-600" /> Direct contact
                  information
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-lime-600" /> Real-time
                  availability
                </li>
              </ul>
              <Link to="/hospitals" className="w-full">
                <button
                  type="button"
                  className="w-full py-3 text-lg font-semibold text-white bg-green-700 rounded-lg transition-transform duration-500   hover:bg-green-600"
                >
                  Find Hospitals
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <Card className="max-w-5xl mx-auto border-2 border-medical/20 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl hover:bg-white/40">
            <CardHeader className="text-center px-8 pt-12">
              <FileText className="h-14 w-14 text-medical mx-auto mb-5" />
              <CardTitle className="text-4xl font-extrabold text-gray-900">
                Create Your Medical Profile
              </CardTitle>
              <CardDescription className="text-lg text-gray-700 max-w-lg mx-auto mt-2">
                Store vital medical information for faster emergency response
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-10 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex hover:scale-105 duration-700 transition-all flex-col items-center bg-muted rounded-xl py-8 px-6 shadow-sm  hover:bg-muted/80">
                  <div className="h-16 w-16 rounded-full bg-medical/20 flex items-center justify-center mb-4">
                    <Shield className="h-9 w-9 text-medical" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    Blood Group
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Critical in emergencies
                  </p>
                </div>
                <div className="flex hover:scale-105 duration-700 transition-all flex-col items-center bg-muted rounded-xl py-8 px-6 shadow-sm  hover:bg-muted/80">
                  <div className="h-16 w-16 rounded-full bg-emergency/20 flex items-center justify-center mb-4">
                    <Heart className="h-9 w-9 text-emergency" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    Allergies
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Prevent complications
                  </p>
                </div>
                <div className="flex flex-col items-center bg-muted rounded-xl py-8 px-6 shadow-sm hover:scale-105 duration-700 transition-all hover:bg-muted/80">
                  <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                    <FileText className="h-9 w-9 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    Conditions
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Medical history
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link to="/profile">
                  <Button
                    variant="medical"
                    size="lg"
                    className="bg-gradient-to-r from-medical text-white to-medical/70 hover:from-medical/80 hover:to-medical/80 shadow-lg shadow-medical/50"
                  >
                    Set Up Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


      <section className="py-5  bg-cyan-950/5 to-slate-100">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-700">
              Our Impact at a Glance
            </h2>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
              Quick stats showing how we help people with instant guidance and
              reliable information.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card template */}
            {[
              {
                value: "24/7",
                label: "Available",
                iconBg: "bg-indigo-50",
                icon: (
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                    <path
                      d="M12 7v6l4 2"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
              },
              {
                value: "<30s",
                label: "Response Time",
                iconBg: "bg-rose-50",
                icon: (
                  <svg
                    className="h-6 w-6 text-rose-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                    <path
                      d="M12 8v5l3 2"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
              },
              {
                value: "100+",
                label: "First-Aid Guides",
                iconBg: "bg-emerald-50",
                icon: (
                  <svg
                    className="h-6 w-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9 12h6M12 15v-6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
              },
              {
                value: "1000+",
                label: "Hospitals Listed",
                iconBg: "bg-sky-50",
                icon: (
                  <svg
                    className="h-6 w-6 text-sky-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 21h18" strokeWidth="1.5" />
                    <path d="M7 3v18" strokeWidth="1.5" />
                    <path d="M17 3v18" strokeWidth="1.5" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 p-5 rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200"
              >
                <div
                  className={`flex-shrink-0 h-14 w-14 rounded-lg flex items-center justify-center ${item.iconBg}`}
                >
                  {item.icon}
                </div>
                <div className="text-left">
                  <div className="text-2xl md:text-2xl font-extrabold text-slate-900 leading-tight">
                    {item.value}
                  </div>
                  <div className="text-sm text-slate-500 font-medium mt-1">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-red-600 to-blue-600 flex justify-center items-center p-5 text-white">
        <p className="text-center text-sm">
          © 2025 Emergency Aid. All rights reserved. Stay safe and seek help
          when needed. Your health matters to us.
        </p>
      </section>

   
    </div>
  );
};

export default Home;