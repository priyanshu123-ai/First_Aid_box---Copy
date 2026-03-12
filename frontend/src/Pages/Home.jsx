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
    <div className="min-h-screen flex flex-col">
      {/* Navbar/Header */}

      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden flex-grow min-h-[650px]">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        {/* Rich gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/70 to-blue-900/40"
          aria-hidden="true"
        />
        {/* Decorative blurred circles */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-emergency/20 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-medical/15 rounded-full blur-3xl" aria-hidden="true" />

        {/* Content container */}
        <div className="relative container mx-auto px-6 py-24 md:py-36 flex flex-col justify-center min-h-[650px] max-w-4xl text-center">
          {/* Highlight badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 self-center mb-8 shadow-lg">
            <Heart className="h-5 w-5 text-emergency" fill="currentColor" />
            <span className="text-sm font-semibold text-white/95 uppercase tracking-widest">
              One Click to Save a Life
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] text-white mb-6 tracking-tight">
            Emergency First-Aid
            <span className="block text-gradient-emergency">&amp; Nearest Help</span>
          </h1>

          {/* Description text */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-12 font-light">
            Get instant first-aid guidance, send emergency alerts, and find
            nearby hospitals. Every second counts in an emergency.
          </p>

          {/* Primary action buttons group */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            <Link to="/emergency" className="w-full sm:w-auto">
              <Button
                size="xl"
                className="w-full sm:w-auto bg-gradient-to-r from-emergency to-red-600 py-5 px-10 text-lg rounded-2xl hover:from-red-600 hover:to-red-700 shadow-xl shadow-red-500/30 transition-all duration-300 flex items-center justify-center gap-3 emergency-pulse hover:shadow-2xl hover:shadow-red-500/40"
              >
                <AlertCircle className="h-6 w-6" />
                Emergency SOS
              </Button>
            </Link>
            <Link to="/first-aid" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto px-10 py-5 text-lg rounded-2xl border-2 border-white/30 text-white bg-white/5 backdrop-blur-sm hover:bg-white/15 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <BookOpen className="h-6 w-6" />
                First Aid Guide
              </Button>
            </Link>
          </div>

          {/* Secondary action */}
          <div className="mt-10">
            <Link to="/auth" className="inline-block">
              <Button
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10 text-sm md:text-base transition-all rounded-xl"
              >
                Sign in to save your medical profile →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────── FEATURES ─────────── */}
      <section className="w-full py-24 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Section heading */}
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emergency mb-4 bg-red-50 px-4 py-1.5 rounded-full">Core Features</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              Life-Saving Features at Your Fingertips
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
              Comprehensive emergency assistance designed to help you act
              quickly and confidently in critical situations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 - First Aid Guide */}
            <div className="group p-8 rounded-2xl shadow-card border border-slate-100 flex flex-col items-center bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 h-20 w-20 mb-6 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-500">
                  <img src={firstAidIcon} alt="First Aid" className="h-10 w-10 brightness-0 invert" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  First-Aid Guide
                </h3>
                <p className="text-slate-500 mb-6 text-center text-sm leading-relaxed">
                  Step-by-step instructions with voice guidance for urgent
                  situations.
                </p>
                <ul className="mb-8 space-y-3 w-full text-slate-600 text-sm">
                  <li className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-4 w-4 text-blue-600" />
                    </div>
                    CPR & heart attack response
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    Burns & wound treatment
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    Fractures & injuries
                  </li>
                </ul>
                <Link to="/first-aid" className="w-full">
                  <button
                    type="button"
                    className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800"
                  >
                    View Guide
                  </button>
                </Link>
              </div>
            </div>

            {/* Card 2 - Emergency SOS */}
            <div className="group p-8 rounded-2xl shadow-card border border-slate-100 flex flex-col items-center bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 h-20 w-20 mb-6 shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-500">
                  <img src={sosIcon} alt="Emergency SOS" className="h-10 w-10 brightness-0 invert" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Emergency SOS
                </h3>
                <p className="text-slate-500 mb-6 text-center text-sm leading-relaxed">
                  One-click emergency alerts to notify contacts & share location.
                </p>
                <ul className="mb-8 space-y-3 w-full text-slate-600 text-sm">
                  <li className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-red-600" />
                    </div>
                    Alert emergency contacts instantly
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-red-600" />
                    </div>
                    Share live location automatically
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-red-600" />
                    </div>
                    Fastest response time
                  </li>
                </ul>
                <Link to="/emergency" className="w-full">
                  <button
                    type="button"
                    className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:from-red-700 hover:to-red-800"
                  >
                    Activate SOS
                  </button>
                </Link>
              </div>
            </div>

            {/* Card 3 - Hospital Locator */}
            <div className="group p-8 rounded-2xl shadow-card border border-slate-100 flex flex-col items-center bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 h-20 w-20 mb-6 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-500">
                  <img
                    src={hospitalIcon}
                    alt="Hospital Locator"
                    className="h-10 w-10 brightness-0 invert"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Hospital Locator
                </h3>
                <p className="text-slate-500 mb-6 text-center text-sm leading-relaxed">
                  Quickly find nearest hospitals and get direct contact details.
                </p>
                <ul className="mb-8 space-y-3 w-full text-slate-600 text-sm">
                  <li className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                    </div>
                    Nearby hospitals & clinics
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-emerald-600" />
                    </div>
                    Direct contact information
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-emerald-600" />
                    </div>
                    Real-time availability
                  </li>
                </ul>
                <Link to="/hospitals" className="w-full">
                  <button
                    type="button"
                    className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:from-emerald-700 hover:to-emerald-800"
                  >
                    Find Hospitals
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── MEDICAL PROFILE CTA ─────────── */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container mx-auto px-6">
          <Card className="max-w-5xl mx-auto border border-slate-200/60 bg-white rounded-3xl shadow-card hover:shadow-xl transition-shadow duration-500 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-medical via-emergency to-medical" />
            <CardHeader className="text-center px-8 pt-14">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-medical to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-extrabold text-slate-900">
                Create Your Medical Profile
              </CardTitle>
              <CardDescription className="text-base text-slate-500 max-w-lg mx-auto mt-3 leading-relaxed">
                Store vital medical information for faster emergency response
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-8 md:px-12 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="group flex flex-col items-center bg-slate-50/80 rounded-2xl py-8 px-6 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-slate-200 hover:-translate-y-1 transition-all duration-500">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5 text-slate-900">
                    Blood Group
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Critical in emergencies
                  </p>
                </div>
                <div className="group flex flex-col items-center bg-slate-50/80 rounded-2xl py-8 px-6 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-slate-200 hover:-translate-y-1 transition-all duration-500">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 shadow-md shadow-red-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5 text-slate-900">
                    Allergies
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Prevent complications
                  </p>
                </div>
                <div className="group flex flex-col items-center bg-slate-50/80 rounded-2xl py-8 px-6 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-slate-200 hover:-translate-y-1 transition-all duration-500">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5 text-slate-900">
                    Conditions
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Medical history
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link to="/profile">
                  <Button
                    variant="medical"
                    size="lg"
                    className="bg-gradient-to-r from-medical to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 px-10 py-3 rounded-xl text-base transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    Set Up Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─────────── STATS ─────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-medical mb-4 bg-blue-50 px-4 py-1.5 rounded-full">Statistics</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Our Impact at a Glance
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed">
              Quick stats showing how we help people with instant guidance and
              reliable information.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card template */}
            {[
              {
                value: "24/7",
                label: "Available",
                iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
                icon: (
                  <svg
                    className="h-5 w-5 text-white"
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
                iconBg: "bg-gradient-to-br from-rose-500 to-rose-600",
                icon: (
                  <svg
                    className="h-5 w-5 text-white"
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
                iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
                icon: (
                  <svg
                    className="h-5 w-5 text-white"
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
                iconBg: "bg-gradient-to-br from-sky-500 to-sky-600",
                icon: (
                  <svg
                    className="h-5 w-5 text-white"
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
                className="group flex items-center gap-4 p-5 rounded-2xl bg-white shadow-card border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center shadow-md ${item.iconBg} group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-extrabold text-slate-900 leading-tight">
                    {item.value}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wide">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-emergency" fill="currentColor" />
            <span className="text-white font-bold text-sm">Emergency Aid</span>
          </div>
          <p className="text-center text-slate-400 text-xs max-w-lg">
            © 2025 Emergency Aid. All rights reserved. Stay safe and seek help
            when needed. Your health matters to us.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Emergency: <strong className="text-white">112</strong></span>
            <span className="text-slate-600">|</span>
            <span>Ambulance: <strong className="text-white">108</strong></span>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;