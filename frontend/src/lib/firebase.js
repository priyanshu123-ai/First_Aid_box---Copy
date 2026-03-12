// First Aid App Firebase Init
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

const firebaseConfig = {
  apiKey: "AIzaSyCYTRTmmaRvLJiD2XOMmevOMK6osAKjpCU", // Ideally, move to .env
  authDomain: "emergency-aid-3c8a5.firebaseapp.com",
  projectId: "emergency-aid-3c8a5",
  storageBucket: "emergency-aid-3c8a5.firebasestorage.app",
  messagingSenderId: "178078329527",
  appId: "1:178078329527:web:197ff60a2c9d1002bfbb32",
  measurementId: "G-94V61ZPKSN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestFirebaseToken = async (userEmail) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { 
        // VAPID KEY: You MUST generate a proper Web Push certificate (VAPID key)
        // in your Firebase Console > Project Settings > Cloud Messaging > Web configuration
        // Replace this placeholder or move it to .env
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BN8HFS4D6u4WdaFJcvaXBMzCInKeHNRaGVtX6L_b_4-GCbsCCrpsq_AHnacSVShmq_qyiF1eOpkr-puTEFi9ksw" 
      });

      console.log("FCM Token generated:", token);

      if (userEmail) {
         // Save to backend matching the updated ProfileRoute and controller
         await axios.post("http://localhost:4000/api/v3/profile/token", {
            email: userEmail,
            fcmToken: token
         });
         console.log("Token sent to backend successfully.");
      }
      return token;
    } else {
      console.log("Notification permission denied.");
    }
  } catch (error) {
    console.error("Error retrieving Firebase token:", error);
  }
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
