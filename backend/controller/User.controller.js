

import { User } from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import QRCode from "qrcode"; // ✅ new import

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ success: false, message: "User already exists, please login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // ✅ Use localhost URL for QR code during development
    const profileURL = `https://first-aid-box-6.onrender.com`;
    const qrCodeDataURL = await QRCode.toDataURL(profileURL);

    user.qrCode = qrCodeDataURL;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully with QR code",
      user,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};





export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found, please register first",
      });
    }

    // ✅ Fix here — add await
    const matchedPassword = await bcrypt.compare(password, user.password);

    if (!matchedPassword) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // ✅ Generate QR code as BASE64 (same as registration)
    const profileURL = `https://first-aid-box-6.onrender.com`;
    const qrCodeDataURL = await QRCode.toDataURL(profileURL);

    // ✅ Sign JWT
    const tokenData = { userId: user._id };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // ✅ Send same type of data as register
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
      })
      .json({
        success: true,
        message: "User logged in successfully",
        user,
        qrCode: qrCodeDataURL, // ✅ consistent naming with register
      });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      // Add 'secure: true' if using HTTPS
    });

    return res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getCurrentUser = async(req,res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json(user);
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
    
  }
}
