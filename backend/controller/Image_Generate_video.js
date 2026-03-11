// backend/controllers/videoController.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const generateVideoFromImage = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: "Query is required" });

    const response = await axios.get("https://api.pexels.com/videos/search", {
      headers: { Authorization: process.env.PEXELS_API_KEY },
      params: { query, per_page: 1 },
    });

    const videoUrl = response.data.videos[0]?.video_files[0]?.link;
    if (!videoUrl) return res.status(404).json({ success: false, message: "Video not found" });

    res.json({ success: true, videoUrl });
  } catch (error) {
    console.error("❌ Error fetching video:", error.message);
    res.status(500).json({ success: false, message: "Video fetching failed" });
  }
};
