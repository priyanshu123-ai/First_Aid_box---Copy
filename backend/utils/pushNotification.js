import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Because this is an ES module and serviceAccountKey.json is outside the src, we dynamically read it.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = join(__dirname, "../config/serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendPushNotification = async (token, title, body, url = "https://stunning-speculoos-18716f.netlify.app/") => {
  const message = {
    notification: { title, body },
    token: token, // This is the unique device token from the frontend
    webpush: {
      fcmOptions: {
        link: url,
      },
      notification: {
        click_action: url
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent push message:", response);
  } catch (error) {
    console.error("Error sending push message:", error);
  }
};

export default sendPushNotification;