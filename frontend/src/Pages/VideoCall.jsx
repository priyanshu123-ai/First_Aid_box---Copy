import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Video, Mic, MicOff, VideoOff } from "lucide-react";

const VideoCall = ({ onClose }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalStream(stream);

        // For now, mirror local stream as remote
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        alert("Could not access camera/microphone.");
      }
    };

    initCall();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsCameraOff(!isCameraOff);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
      <div className="absolute top-4 right-4">
        <Button variant="destructive" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-5xl px-4">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full sm:w-1/2 aspect-video bg-black rounded-lg border"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full sm:w-1/2 aspect-video bg-black rounded-lg border"
        />
      </div>

      <div className="flex gap-4 mt-6">
        <Button onClick={toggleMute} variant={isMuted ? "destructive" : "secondary"}>
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button
          onClick={toggleCamera}
          variant={isCameraOff ? "destructive" : "secondary"}
        >
          {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
      </div>


     
    </div>
  );
};

export default VideoCall;
