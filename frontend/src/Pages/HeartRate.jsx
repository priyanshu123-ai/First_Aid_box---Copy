import { Button } from "@/components/ui/button";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HeartRateChecker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [bpm, setBpm] = useState(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("Please place your finger on the camera");
  const navigate = useNavigate();

  const runningRef = useRef(false);
  const frameCounterRef = useRef(0);
  const [samplesCount, setSamplesCount] = useState(0);
  const torchOnRef = useRef(false);

  const redValuesRef = useRef([]);
  const timestampsRef = useRef([]);
  const animationRef = useRef(null);
  const last4Ref = useRef([]);

  // Start camera
  const startCamera = async () => {
    try {
      const constraints = { video: { facingMode: "environment" } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Try enabling torch if available
      try {
        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          await track.applyConstraints({ advanced: [{ torch: true }] });
          torchOnRef.current = true;
        }
      } catch (e) {
        // ignore if not supported
      }
    } catch (err) {
      alert("Camera access denied or unavailable!");
      console.error(err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    try {
      if (torchOnRef.current && stream) {
        const [track] = stream.getVideoTracks();
        track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
        torchOnRef.current = false;
      }
    } catch (e) {}
  };

  // Analyze frames for both finger detection + heart rate
  const analyze = () => {
    const ctx = canvasRef.current.getContext("2d");
    const width = 60;
    const height = 60;

    const captureFrame = () => {
      if (!runningRef.current) return;

      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const frame = ctx.getImageData(0, 0, width, height);

      // Calculate average brightness (R+G+B)
      let totalBrightness = 0;
      for (let i = 0; i < frame.data.length; i += 4) {
        totalBrightness +=
          (frame.data[i] + frame.data[i + 1] + frame.data[i + 2]) / 3;
      }
      const avgBrightness = totalBrightness / (frame.data.length / 4);

      // ✅ Detect if finger is placed (dark frame)
      if (avgBrightness < 60) {
        // Finger detected
        if (message !== "Measuring... hold still") {
          setMessage("Measuring... hold still");
        }

        // Continue heart rate detection
        const avgRed = frame.data
          .filter((_, i) => i % 4 === 0)
          .reduce((a, b) => a + b, 0) /
          (frame.data.length / 4);

        redValuesRef.current.push(avgRed);
        timestampsRef.current.push(Date.now());

        const now = Date.now();
        while (timestampsRef.current.length && timestampsRef.current[0] < now - 10000) {
          timestampsRef.current.shift();
          redValuesRef.current.shift();
        }

        frameCounterRef.current++;
        if (frameCounterRef.current % 8 === 0) {
          setSamplesCount(timestampsRef.current.length);
        }

        if (timestampsRef.current.length >= 25) {
          const raw = redValuesRef.current;
          const smoothed = [];
          const maWindow = 5;
          for (let i = 0; i < raw.length; i++) {
            let start = Math.max(0, i - Math.floor(maWindow / 2));
            let end = Math.min(raw.length - 1, i + Math.floor(maWindow / 2));
            let sumWindow = 0;
            for (let j = start; j <= end; j++) sumWindow += raw[j];
            const ma = sumWindow / (end - start + 1);
            smoothed.push(raw[i] - ma);
          }

          const ema = [];
          const alpha = 0.25;
          for (let i = 0; i < smoothed.length; i++) {
            if (i === 0) ema.push(smoothed[i]);
            else ema.push(alpha * smoothed[i] + (1 - alpha) * ema[i - 1]);
          }

          const mean = ema.reduce((a, b) => a + b, 0) / ema.length;
          const variance =
            ema.reduce((a, b) => a + (b - mean) * (b - mean), 0) / ema.length;
          const std = Math.sqrt(variance);
          const threshold = mean + Math.max(0.18 * std, 0.015);

          const peakTimes = [];
          const minPeakDistanceMs = 400;
          for (let i = 1; i < ema.length - 1; i++) {
            if (ema[i] > ema[i - 1] && ema[i] > ema[i + 1] && ema[i] > threshold) {
              const t = timestampsRef.current[i];
              const last = peakTimes.length ? peakTimes[peakTimes.length - 1] : 0;
              if (t - last >= minPeakDistanceMs) peakTimes.push(t);
            }
          }

          const intervals = [];
          for (let i = 1; i < peakTimes.length; i++) {
            intervals.push((peakTimes[i] - peakTimes[i - 1]) / 1000);
          }
          const validIntervals = intervals.filter((iv) => iv >= 0.5 && iv <= 1.0);
          if (validIntervals.length >= 1) {
            const sorted = validIntervals.slice().sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            const medianInterval =
              sorted.length % 2 === 1
                ? sorted[mid]
                : (sorted[mid - 1] + sorted[mid]) / 2;
            const bpmEstimate = 60 / medianInterval;
            const rounded = Math.round(bpmEstimate);

            if (rounded >= 60 && rounded <= 120) {
              last4Ref.current.unshift(rounded);
              if (last4Ref.current.length > 4) last4Ref.current.pop();

              const recent = last4Ref.current.slice().sort((a, b) => a - b);
              const m = Math.floor(recent.length / 2);
              const displayBpm =
                recent.length % 2 === 1
                  ? recent[m]
                  : Math.round((recent[m - 1] + recent[m]) / 2);
              setBpm(displayBpm);
            }
          }
        }
      } else {
        // ❌ Finger not detected
        setMessage("Please place your finger properly on the camera");
        redValuesRef.current = [];
        timestampsRef.current = [];
        setBpm(null);
      }

      animationRef.current = requestAnimationFrame(captureFrame);
    };

    captureFrame();
  };

  const startMeasurement = () => {
    setRunning(true);
    runningRef.current = true;
    setMessage("Please place your finger on the camera");
    redValuesRef.current = [];
    timestampsRef.current = [];
    last4Ref.current = [];
    setBpm(null);

    startCamera().then(() => {
      if (videoRef.current) {
        canvasRef.current.width = 60;
        canvasRef.current.height = 60;
        const onPlay = () => {
          analyze();
          videoRef.current.removeEventListener("playing", onPlay);
        };
        videoRef.current.addEventListener("playing", onPlay);
      }
    });
  };

  const stopMeasurement = () => {
    setRunning(false);
    runningRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    stopCamera();
    setMessage("Measurement stopped");
  };

  useEffect(() => {
    return () => stopMeasurement();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8 flex items-center justify-center">
      <style>{`
        .pulse { animation: pulse 1s infinite ease-in-out; }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.95; }
          100% { transform: scale(1); opacity: 1; }
        }
        .ring { box-shadow: 0 0 0 8px rgba(59,130,246,0.06), 0 8px 40px rgba(239,68,68,0.06); }
      `}</style>

      <div className="w-full max-w-4xl bg-gradient-to-tr from-red-50 to-blue-50 rounded-2xl shadow-lg p-6 text-gray-900 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-3 text-red-600">
            <span className="text-red-500 text-3xl">❤</span>
            Heart Rate Checker
          </h1>
          <div className="text-sm text-blue-700">Mobile recommended — cover lens</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col items-center">
            <div className="relative w-72 h-72 rounded-xl overflow-hidden border-4 border-blue-600 ring">
              <video ref={videoRef} className="w-full h-full object-cover bg-black" playsInline muted />
              <div className="absolute left-2 top-2 bg-white/70 text-xs px-2 py-1 rounded text-blue-800">
                {running ? "Measuring" : "Preview"}
              </div>
              {!running && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/80 text-sm text-blue-900 px-3 py-1 rounded">
                    Cover lens with finger
                  </div>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} width="60" height="60" className="hidden"></canvas>

            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-sm text-red-700">{message}</p>
              <div className="flex items-center gap-3">
                {running ? (
                  <button
                    onClick={stopMeasurement}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={startMeasurement}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
                  >
                    Start
                  </button>
                )}

                <div className="text-sm text-gray-700">
                  {running ? (
                    <div className="text-red-600">
                      ● Measuring... samples: <span className="font-medium">{samplesCount}</span>
                    </div>
                  ) : (
                    <div>Steps: 1) Cover lens 2) Hold still 3) Wait 5–10s</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div
                  className={`w-40 h-40 rounded-full bg-gradient-to-b from-red-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold ${
                    bpm ? "pulse" : ""
                  }`}
                >
                  {bpm ? (
                    <div className="text-5xl">{bpm}</div>
                  ) : (
                    <div className="text-sm text-white/90">--</div>
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
                  BPM
                </div>
              </div>

              <div className="text-sm text-gray-700 text-center">
                {bpm ? (
                  <div className="text-blue-800 font-medium">Estimated heart rate</div>
                ) : (
                  <div className="text-gray-600">Waiting for stable reading</div>
                )}
              </div>

              {last4Ref.current.length > 0 && (
                <div className="mt-3 w-full">
                  <div className="text-xs text-gray-600 mb-2">Last readings</div>
                  <div className="flex gap-2 justify-center">
                    {last4Ref.current.map((r, i) => (
                      <div
                        key={i}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                      >
                        {r} BPM
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          className="mt-5 bg-emergency py-5 px-10 text-xl rounded-xl hover:bg-emergency-hover shadow-lg shadow-emergency/50 transition duration-300 flex items-center justify-center gap-3 emergency-pulse"
          onClick={() => navigate("/watch")}
        >
          Click if you want to integrate with watch
        </Button>
      </div>
    </div>
  );
};

export default HeartRateChecker;





// import { Button } from "@/components/ui/button";
// import React, { useRef, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const HeartRateChecker = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [bpm, setBpm] = useState(null);
//   const [running, setRunning] = useState(false);
//   // runtime refs for reliable loop control

//   const navigate = useNavigate();
//   const runningRef = useRef(false);
//   const frameCounterRef = useRef(0);
//   const [samplesCount, setSamplesCount] = useState(0);
//   const torchOnRef = useRef(false);

//   // persistent buffers and control refs
//   const redValuesRef = useRef([]); // stores raw avg red samples
//   const timestampsRef = useRef([]);
//   const animationRef = useRef(null);
//   const last4Ref = useRef([]); // last 4 BPM results

//   // Start camera
//   const startCamera = async () => {
//     try {
//       // prefer rear camera for finger-on-camera scenarios
//       const constraints = { video: { facingMode: "environment" } };
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       videoRef.current.srcObject = stream;
//       // start playing (do NOT await indefinitely; rely on 'playing' listener)
//       videoRef.current.play().catch(() => {});

//       // attempt to turn on torch (if supported)
//       try {
//         const [track] = stream.getVideoTracks();
//         const capabilities = track.getCapabilities ? track.getCapabilities() : {};
//         if (capabilities.torch) {
//           await track.applyConstraints({ advanced: [{ torch: true }] });
//           torchOnRef.current = true;
//         }
//       } catch (e) {
//         // torch not available; ignore
//       }
//     } catch (err) {
//       alert("Camera access denied or unavailable!");
//       console.error(err);
//     }
//   };

//   // Analyze frames for heart rate
//   const analyze = () => {
//     const ctx = canvasRef.current.getContext("2d");
//     // smaller processing size for faster compute
//     const width = 60;
//     const height = 60;

//     const captureFrame = () => {
//       // use ref for stable control across renders
//       if (!runningRef.current) return;

//       // draw a small area to process fewer pixels
//       ctx.drawImage(videoRef.current, 0, 0, width, height);
//       const frame = ctx.getImageData(0, 0, width, height);
//       // compute average red value
//       let sum = 0;
//       for (let i = 0; i < frame.data.length; i += 4) {
//         sum += frame.data[i];
//       }
//       const avgRed = sum / (frame.data.length / 4);

//       // push into persistent buffers
//       redValuesRef.current.push(avgRed);
//       timestampsRef.current.push(Date.now());

//       // keep only last 10 seconds of data
//       const now = Date.now();
//       while (timestampsRef.current.length && timestampsRef.current[0] < now - 10000) {
//         timestampsRef.current.shift();
//         redValuesRef.current.shift();
//       }

//       // update a lightweight sample counter for UI every few frames
//       frameCounterRef.current++;
//       if (frameCounterRef.current % 8 === 0) {
//         setSamplesCount(timestampsRef.current.length);
//       }

//       // process when we have enough samples
//       if (timestampsRef.current.length >= 25) { // faster response: ~1-2s depending on fps
//         // detrend with short moving average and apply simple smoothing (EMA)
//         const raw = redValuesRef.current;
//         const smoothed = [];
//         const maWindow = 5;
//         for (let i = 0; i < raw.length; i++) {
//           // short moving average for detrending
//           let start = Math.max(0, i - Math.floor(maWindow / 2));
//           let end = Math.min(raw.length - 1, i + Math.floor(maWindow / 2));
//           let sumWindow = 0;
//           for (let j = start; j <= end; j++) sumWindow += raw[j];
//           const ma = sumWindow / (end - start + 1);
//           // detrended value
//           smoothed.push(raw[i] - ma);
//         }

//         // apply EMA to reduce noise (slightly faster response)
//         const ema = [];
//         const alpha = 0.25;
//         for (let i = 0; i < smoothed.length; i++) {
//           if (i === 0) ema.push(smoothed[i]);
//           else ema.push(alpha * smoothed[i] + (1 - alpha) * ema[i - 1]);
//         }

//         // compute mean and std to pick a dynamic threshold
//         const mean = ema.reduce((a, b) => a + b, 0) / ema.length;
//         const variance = ema.reduce((a, b) => a + (b - mean) * (b - mean), 0) / ema.length;
//         const std = Math.sqrt(variance);
//         const threshold = mean + Math.max(0.18 * std, 0.015); // dynamic threshold tuned for speed

//         // detect peaks: local maxima above threshold with a minimum distance between peaks
//         const peakTimes = [];
//         const minPeakDistanceMs = 400; // avoid multiple peaks per beat (~0.4s)
//         for (let i = 1; i < ema.length - 1; i++) {
//           if (ema[i] > ema[i - 1] && ema[i] > ema[i + 1] && ema[i] > threshold) {
//             const t = timestampsRef.current[i];
//             const last = peakTimes.length ? peakTimes[peakTimes.length - 1] : 0;
//             if (t - last >= minPeakDistanceMs) peakTimes.push(t);
//           }
//         }

//         // compute intervals and BPMs
//         const intervals = [];
//         for (let i = 1; i < peakTimes.length; i++) {
//           intervals.push((peakTimes[i] - peakTimes[i - 1]) / 1000); // seconds
//         }

//         // filter intervals to valid user range: 60-120 BPM -> 0.5s - 1.0s
//         const validIntervals = intervals.filter((iv) => iv >= 0.5 && iv <= 1.0);
        
//         if (validIntervals.length >= 1) {
//           // median of valid intervals
//           const sorted = validIntervals.slice().sort((a, b) => a - b);
//           const mid = Math.floor(sorted.length / 2);
//           const medianInterval = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
//           const bpmEstimate = 60 / medianInterval;
//           const rounded = Math.round(bpmEstimate);

//           // only accept BPMs inside 60-120 (user-requested range)
//           if (rounded >= 60 && rounded <= 120) {
//             // push into last4 and keep only 4 values
//             last4Ref.current.unshift(rounded);
//             if (last4Ref.current.length > 4) last4Ref.current.pop();

//             // compute median of last4 for stable display
//             const recent = last4Ref.current.slice().sort((a, b) => a - b);
//             const m = Math.floor(recent.length / 2);
//             const displayBpm = recent.length % 2 === 1 ? recent[m] : Math.round((recent[m - 1] + recent[m]) / 2);
//             setBpm(displayBpm);
//           }
//         }
//       }

//       animationRef.current = requestAnimationFrame(captureFrame);
//     };

//     captureFrame();
//   };

//   const startMeasurement = () => {
//     setRunning(true);
//     runningRef.current = true;
//     // reset buffers
//     redValuesRef.current = [];
//     timestampsRef.current = [];
//     last4Ref.current = [];
//     setBpm(null);

//     startCamera().then(() => {
//       // wait until video is playing then analyze
//       if (videoRef.current) {
//         // ensure canvas size matches the processing size
//         canvasRef.current.width = 60;
//         canvasRef.current.height = 60;
//         // if already playing, start analyze; otherwise start when 'playing' event fires
//         if (!videoRef.current.paused) {
//           analyze();
//         } else {
//           const onPlay = () => {
//             analyze();
//             videoRef.current.removeEventListener("playing", onPlay);
//           };
//           videoRef.current.addEventListener("playing", onPlay);
//         }
//       }
//     });
//   };

//   const stopMeasurement = () => {
//     setRunning(false);
//     runningRef.current = false;
//     // stop animation loop
//     if (animationRef.current) {
//       cancelAnimationFrame(animationRef.current);
//       animationRef.current = null;
//     }
//     const stream = videoRef.current?.srcObject;
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//       videoRef.current.srcObject = null;
//     }
//     // turn off torch if we turned it on
//     try {
//       if (torchOnRef.current && stream) {
//         const [track] = stream.getVideoTracks();
//         track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
//         torchOnRef.current = false;
//       }
//     } catch (e) {}
//   };

//   useEffect(() => {
//     return () => stopMeasurement(); // cleanup on unmount
//   }, []);

//   return (
//     <div className="min-h-screen bg-white p-8 flex items-center justify-center">
//       <style>{`
//         .pulse { animation: pulse 1s infinite ease-in-out; }
//         @keyframes pulse {
//           0% { transform: scale(1); opacity: 1; }
//           50% { transform: scale(1.06); opacity: 0.95; }
//           100% { transform: scale(1); opacity: 1; }
//         }
//         .ring { box-shadow: 0 0 0 8px rgba(59,130,246,0.06), 0 8px 40px rgba(239,68,68,0.06); }
//       `}</style>

//       <div className="w-full max-w-4xl bg-gradient-to-tr from-red-50 to-blue-50 rounded-2xl shadow-lg p-6 text-gray-900 border border-gray-100">
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-2xl font-bold flex items-center gap-3 text-red-600">
//             <span className="text-red-500 text-3xl">❤</span>
//             Heart Rate Checker
//           </h1>
//           <div className="text-sm text-blue-700">Mobile recommended — cover lens</div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Video preview */}
//           <div className="md:col-span-2 flex flex-col items-center">
//             <div className="relative w-72 h-72 rounded-xl overflow-hidden border-4 border-blue-600 ring">
//               <video
//                 ref={videoRef}
//                 className="w-full h-full object-cover bg-black"
//                 playsInline
//                 muted
//               />
//               <div className="absolute left-2 top-2 bg-white/70 text-xs px-2 py-1 rounded text-blue-800">
//                 {running ? "Measuring" : "Preview"}
//               </div>
//               {!running && (
//                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                   <div className="bg-white/80 text-sm text-blue-900 px-3 py-1 rounded">Cover lens with finger</div>
//                 </div>
//               )}
//             </div>

//             <canvas ref={canvasRef} width="60" height="60" className="hidden"></canvas>

//             <div className="mt-4 flex items-center gap-3">
//               {running ? (
//                 <button
//                   onClick={stopMeasurement}
//                   className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow"
//                 >
//                   Stop
//                 </button>
//               ) : (
//                 <button
//                   onClick={startMeasurement}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
//                 >
//                   Start
//                 </button>
//               )}

//               <div className="text-sm text-gray-700">
//                 {running ? (
//                   <div className="text-red-600">● Measuring... samples: <span className="font-medium">{samplesCount}</span></div>
//                 ) : (
//                   <div>Steps: 1) Cover lens 2) Hold still 3) Wait 5–10s</div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* BPM Card */}
//           <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100">
//             <div className="flex flex-col items-center gap-3">
//               <div className="relative">
//                 <div className={`w-40 h-40 rounded-full bg-gradient-to-b from-red-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold ${bpm ? "pulse" : ""}`}>
//                   {bpm ? (
//                     <div className="text-5xl">{bpm}</div>
//                   ) : (
//                     <div className="text-sm text-white/90">--</div>
//                   )}
//                 </div>
//                 <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
//                   BPM
//                 </div>
//               </div>

//               <div className="text-sm text-gray-700 text-center">
//                 {bpm ? (
//                   <div className="text-blue-800 font-medium">Estimated heart rate</div>
//                 ) : (
//                   <div className="text-gray-600">Waiting for stable reading</div>
//                 )}
//               </div>

//               {last4Ref.current.length > 0 && (
//                 <div className="mt-3 w-full">
//                   <div className="text-xs text-gray-600 mb-2">Last readings</div>
//                   <div className="flex gap-2 justify-center">
//                     {last4Ref.current.map((r, i) => (
//                       <div key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm">{r} BPM</div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//         <Button
//   className="mt-5 bg-emergency py-5 px-10 text-xl rounded-xl hover:bg-emergency-hover shadow-lg shadow-emergency/50 transition duration-300 flex items-center justify-center gap-3 emergency-pulse"
//   onClick={() => navigate("/watch")}
// >
//   Click if you want to integrate with watch
// </Button>

      
//       </div>

//     </div>
//   );
// };

// export default HeartRateChecker;  