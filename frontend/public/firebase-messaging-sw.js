/* eslint-env serviceworker */
/* global importScripts, firebase */

// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCYTRTmmaRvLJiD2XOMmevOMK6osAKjpCU",
  authDomain: "emergency-aid-3c8a5.firebaseapp.com",
  projectId: "emergency-aid-3c8a5",
  storageBucket: "emergency-aid-3c8a5.firebasestorage.app",
  messagingSenderId: "178078329527",
  appId: "1:178078329527:web:197ff60a2c9d1002bfbb32",
  measurementId: "G-94V61ZPKSN"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg', // Update icon path as needed
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});