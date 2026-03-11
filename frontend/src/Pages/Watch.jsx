import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function WatchBluetoothConnect() {
  const [device, setDevice] = useState(null);
  const [bpm, setBpm] = useState(null);
  const [status, setStatus] = useState("Not connected");
  const [connecting, setConnecting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const characteristicRef = useRef(null);

  // Connect to Bluetooth device (Heart Rate Service)
  const connectToWatch = async () => {
    try {
      setConnecting(true);
      setStatus("Requesting device...");

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
      });

      setDevice(device);
      setStatus("Connecting to GATT server...");
      const server = await device.gatt.connect();

      const service = await server.getPrimaryService("heart_rate");
      const characteristic = await service.getCharacteristic("heart_rate_measurement");
      characteristicRef.current = characteristic;

      // Listen for data
      characteristic.addEventListener("characteristicvaluechanged", handleHeartRateData);
      await characteristic.startNotifications();

      setStatus("Connected — receiving data...");
      setConnecting(false);

      // Disconnect cleanup
      device.addEventListener("gattserverdisconnected", onDisconnected);
    } catch (error) {
      console.error(error);
      setStatus("Connection failed or cancelled.");
      setConnecting(false);
    }
  };

  const handleHeartRateData = (event) => {
    const value = event.target.value;
    const heartRate = value.getUint8(1); // 2nd byte usually holds BPM
    setBpm(heartRate);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const onDisconnected = () => {
    setStatus("Disconnected");
    setDevice(null);
    setBpm(null);
  };

  const disconnectWatch = async () => {
    try {
      if (device && device.gatt.connected) {
        await device.gatt.disconnect();
        setStatus("Disconnected");
        setBpm(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => disconnectWatch();
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
      `}</style>

      <div className="w-full max-w-3xl bg-gradient-to-tr from-red-50 to-blue-50 rounded-2xl shadow-lg p-6 text-gray-900 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-red-600">
            <span className="text-red-500 text-3xl">⌚</span>
            Bluetooth Watch Connection
          </h2>
          <div className="text-sm text-blue-700">Live BPM from Smartwatch</div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          {/* BPM Circle */}
          <div className="relative">
            <div
              className={`w-48 h-48 rounded-full bg-gradient-to-b from-red-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold ${
                bpm ? "pulse" : ""
              }`}
            >
              {bpm ? <div className="text-5xl">{bpm}</div> : <div className="text-sm">-- BPM</div>}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
              BPM
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 items-center justify-center">
            <div className="text-gray-800 font-medium">{status}</div>

            {device ? (
              <Button
                onClick={disconnectWatch}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={connectToWatch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow"
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "Connect Watch"}
              </Button>
            )}

            {lastUpdated && (
              <div className="text-sm text-gray-600">
                Last updated: <span className="font-medium">{lastUpdated}</span>
              </div>
            )}
          </div>
        </div>

        {/* Instruction Box */}
        <div className="mt-8 p-4 bg-white/70 rounded-lg border text-sm text-gray-700">
          <p className="font-semibold text-blue-800 mb-2">Instructions:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Use Chrome or Edge on desktop or Android (not iPhone).</li>
            <li>Ensure your smartwatch supports the Heart Rate Service (UUID 0x180D).</li>
            <li>Keep Bluetooth enabled and allow the permission popup.</li>
            <li>After connecting, BPM will update in real time.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
