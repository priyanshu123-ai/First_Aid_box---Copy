// -------------------- IMPORTS --------------------
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {Flame,Heart,Bone,AlertTriangle,Volume2,Camera,Video,X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import VideoCall from "./VideoCall";
import { useNavigate } from "react-router-dom";

// -------------------- COMPONENT --------------------
const FirstAid = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedLang, setSelectedLang] = useState("en-IN");
  const [selectedVoice, setSelectedVoice] = useState(null);

  const navigate = useNavigate();

  const [capturedMedia, setCapturedMedia] = useState({});
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  const [userQuery, setUserQuery] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // -------------------- VOICES --------------------
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      toast.error("Voice guidance not supported in this browser.");
      return;
    }

    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const allVoices = synth.getVoices();
      setVoices(allVoices);

      if (!selectedVoice && allVoices.length > 0) {
        const defaultVoice =
          allVoices.find((v) => v.lang === selectedLang) ||
          allVoices.find((v) =>
            v.lang.startsWith(selectedLang.split("-")[0])
          ) ||
          allVoices.find((v) => v.name.toLowerCase().includes("hindi")) ||
          allVoices.find((v) => v.name.toLowerCase().includes("india")) ||
          allVoices[0];

        setSelectedVoice(defaultVoice);
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, [selectedLang, selectedVoice]);

  // -------------------- VOICE GUIDE --------------------
  const handleVoiceGuidance = (title, steps) => {
    if (!window.speechSynthesis) {
      toast.error("Speech synthesis not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(true);

    const textToSpeak = `${title}. ${steps.join(". ")}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = selectedLang;
    }

    utterance.rate =
      selectedLang === "hi-IN" ? 0.9 : selectedLang === "ta-IN" ? 0.92 : 0.95;
    utterance.pitch = selectedLang === "hi-IN" ? 1.1 : 1;

    utterance.onend = () => {
      setIsPlaying(false);
      toast.info(`Voice guidance for ${title} completed.`);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error("Error playing voice guidance.");
    };

    window.speechSynthesis.speak(utterance);
    toast.success(
      `Speaking in ${selectedLang} using ${
        selectedVoice?.name || "default voice"
      }`
    );
  };

  const availableVoices = voices.filter((v) =>
    v.lang.startsWith(selectedLang.split("-")[0])
  );

  // -------------------- VIDEO GENERATION --------------------
  const handleGenerateVideo = async () => {
    if (!userQuery) return toast.error("Please enter a query");

    try {
      setLoadingVideo(true);

      const res = await fetch("http://localhost:4000/api/v2/Image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      const data = await res.json();

      if (data.success && data.videoUrl) {
        setGeneratedVideo(data.videoUrl);
        toast.success("Video generated successfully!");
      } else {
        toast.error(data.message || "Video generation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating video");
    } finally {
      setLoadingVideo(false);
    }
  };

  const handlePhotoCapture = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const photoUrl = reader.result;
      setSelectedImage(photoUrl);
      toast.success("Photo selected successfully!");
    };

    reader.readAsDataURL(file);
  };

  const removeMedia = (guideId, index) => {
    setCapturedMedia((prev) => ({
      ...prev,
      [guideId]: prev[guideId].filter((_, i) => i !== index),
    }));
    toast.info("Removed media");
  };

  // -------------------- FIRST AID GUIDES --------------------
  const firstAidGuides = [
    {
      id: "cpr",
      title: "CPR & Heart Attack",
      icon: Heart,
      color: "text-red-600",
      videoUrl: "https://www.youtube.com/embed/zF_36GYLcMM",
      steps: [
        "Call emergency services immediately (911 or local emergency number)",
        "Check if the person is responsive and breathing",
        "Place the person on their back on a firm surface",
        "Place the heel of one hand on the center of the chest",
        "Place your other hand on top and interlock fingers",
        "Push hard and fast - at least 2 inches deep",
        "Perform 30 chest compressions at 100-120 per minute",
        "Give 2 rescue breaths if trained",
        "Continue until help arrives or person starts breathing",
      ],
    },
    {
      id: "burns",
      title: "Burns Treatment",
      icon: Flame,
      color: "text-orange-500",
      videoUrl: "https://www.youtube.com/embed/CYfPd5ELHyU",
      steps: [
        "Remove the person from the heat source immediately",
        "Cool the burn under running water for 10-20 minutes",
        "Remove jewelry or tight clothing before swelling starts",
        "Cover the burn with a clean, dry cloth or sterile bandage",
        "Do NOT apply ice, butter, or ointments",
        "Do NOT break any blisters",
        "For severe burns, seek immediate medical attention",
        "Keep the person warm with a blanket (avoid burned areas)",
        "Monitor for signs of shock",
      ],
    },
    {
      id: "fractures",
      title: "Fractures & Injuries",
      icon: Bone,
      color: "text-blue-600",
      videoUrl: "https://www.youtube.com/embed/L7z7BgZfhJM",
      steps: [
        "Call emergency services for severe fractures",
        "Do NOT try to realign the bone",
        "Immobilize the injured area",
        "Apply ice packs to reduce swelling (20 minutes on, 20 off)",
        "Use padding to support the injured area",
        "Create a splint using firm materials if needed",
        "Elevate the injured limb above heart level if possible",
        "Monitor circulation - check for numbness or color changes",
        "Keep the person still and comfortable until help arrives",
      ],
    },
    {
      id: "choking",
      title: "Choking Response",
      icon: AlertTriangle,
      color: "text-yellow-600",
      videoUrl: "https://www.youtube.com/embed/7CgtIgSyAiU",
      steps: [
        "Ask 'Are you choking?' - if they can't speak, it's serious",
        "Stand behind the person and wrap arms around their waist",
        "Make a fist with one hand above the navel",
        "Grasp the fist with your other hand",
        "Give quick, upward thrusts (Heimlich maneuver)",
        "Repeat until object is dislodged",
        "For unconscious person, begin CPR",
        "Call emergency services if choking persists",
        "Even if successful, seek medical evaluation",
      ],
    },
  ];

  if (isVideoCallOpen) {
    return <VideoCall onClose={() => setIsVideoCallOpen(false)} />;
  }

  // -------------------- UI --------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-4xl md:text-5xl font-semibold mb-2 text-blue-700">
            First-Aid Guide
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Step-by-step emergency instructions with multilingual voice
            guidance.
          </p>
        </div>

        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          {/* Language Selector */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Language</label>
            <select
              className="border rounded-lg px-4 py-2 bg-white shadow-sm focus:ring focus:ring-blue-300"
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                setSelectedVoice(null);
              }}
            >
              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
              <option value="hi-IN">Hindi</option>
              <option value="ta-IN">Tamil</option>
              <option value="fr-FR">French</option>
              <option value="es-ES">Spanish</option>
            </select>
          </div>

          {/* Heart Rate Button */}
          <Button
            onClick={() => navigate("/heart")}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-base font-medium transition-transform hover:scale-105"
          >
            <Heart className="w-5 h-5" /> Heart Rate Pulse Calculate
          </Button>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="burns" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-10">
            {firstAidGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <TabsTrigger
                  key={guide.id}
                  value={guide.id}
                  className="flex flex-col items-center gap-1 p-3 bg-white data-[state=active]:bg-blue-100 data-[state=active]:shadow rounded-lg hover:shadow-md transition-all"
                >
                  <Icon className={`h-6 w-6 ${guide.color}`} />
                  <span className="text-sm font-medium">{guide.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Each Guide Content */}
          {firstAidGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <TabsContent key={guide.id} value={guide.id}>
                <Card className="shadow-lg border border-gray-200 rounded-xl">
                  <CardHeader className="flex flex-col gap-6">
                    {/* Guide Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-blue-50">
                          <Icon className={`h-8 w-8 ${guide.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-semibold text-gray-800">
                            {guide.title}
                          </CardTitle>
                          <CardDescription>
                            Follow these steps carefully
                          </CardDescription>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-4">
                        <Button
                          onClick={() =>
                            handleVoiceGuidance(guide.title, guide.steps)
                          }
                          disabled={isPlaying}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-5 px-5 rounded-lg shadow-md flex items-center gap-2"
                        >
                          <Volume2 className="h-5 w-5" />
                          {isPlaying ? "Playing..." : "Voice Guide"}
                        </Button>

                        <Button
                          onClick={() => setIsVideoCallOpen(true)}
                          className="bg-red-600 hover:bg-red-700 text-white py-5 px-5 rounded-lg shadow-md flex items-center gap-2"
                        >
                          <Video className="h-5 w-5" /> Video Call
                        </Button>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <h3 className="font-semibold text-lg text-gray-700">
                        Generate Video from Image
                      </h3>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoCapture}
                        className="border rounded-lg px-4 py-2 bg-white shadow-sm"
                      />

                      {selectedImage && (
                        <div className="flex flex-col gap-2">
                          <h4 className="font-medium text-gray-600">Preview</h4>
                          <img
                            src={selectedImage}
                            alt="Selected"
                            className="max-w-full rounded-lg border shadow-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Query Video */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <h3 className="font-semibold text-lg text-gray-700">
                        Generate Video from Query
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Enter your query..."
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          className="flex-1 border rounded-lg px-4 py-2 bg-white shadow-sm"
                        />
                        <button
                          onClick={handleGenerateVideo}
                          disabled={loadingVideo || !userQuery}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm disabled:opacity-50"
                        >
                          {loadingVideo ? "Generating..." : "Generate Video"}
                        </button>
                      </div>

                      {generatedVideo && (
                        <div className="mt-4 aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                          <video
                            controls
                            autoPlay
                            loop
                            muted
                            className="w-full h-full object-cover"
                          >
                            <source src={generatedVideo} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  {/* Steps */}
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Step-by-Step Instructions
                      </h4>
                      <div className="space-y-3">
                        {guide.steps.map((step, index) => (
                          <div
                            key={index}
                            className="flex gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                            <p className="text-sm leading-relaxed text-gray-700">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default FirstAid;
