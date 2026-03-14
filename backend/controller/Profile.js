import { Profile } from "../model/Profile.model.js";
import HealthWallet from "../model/HealthWallet.model.js";

// Create or update profile (POST)
export const upsertProfile = async (req, res) => {
  try {
    const {
      Person_name,
      FullName,
      DateOfBirth,
      email,
      phone,
      bloodGroup,
      Height,
      Weight,
      OrganDonor,
      Allergies,
      CurrentMedications,
      MedicalConditions,
      InsuranceProvider,
      PolicyNumber,
      contactDetails,
      forWhom, // "myself" or "someone else"
    } = req.body;

    const userId = req.userId;

    // Validate required fields
    if (!Person_name || !FullName || !DateOfBirth || !email || !phone || !bloodGroup) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate contact details location if provided
    if (contactDetails && Array.isArray(contactDetails)) {
      for (const contact of contactDetails) {
        if (contact.location) {
          const { lat, lng } = contact.location;
          if (lat === undefined || lng === undefined) {
            return res.status(400).json({
              success: false,
              message: "Location must have both lat and lng",
            });
          }
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
              success: false,
              message: "Invalid latitude or longitude values",
            });
          }
        }
      }
    }

    // Check if profile already exists for this user and this Person_name type
    let existingProfile = await Profile.findOne({ user: userId, Person_name });

    if (existingProfile) {
      // Update existing profile
      Object.assign(existingProfile, {
        Person_name,
        FullName,
        DateOfBirth,
        email,
        phone,
        bloodGroup,
        Height,
        Weight,
        OrganDonor,
        Allergies,
        CurrentMedications,
        MedicalConditions,
        InsuranceProvider,
        PolicyNumber,
        contactDetails,
        forWhom,
      });

      await existingProfile.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: existingProfile,
      });
    }

    // Create new profile
    const newProfile = await Profile.create({
      user: userId,
      Person_name,
      FullName,
      DateOfBirth,
      email,
      phone,
      bloodGroup,
      Height,
      Weight,
      OrganDonor,
      Allergies,
      CurrentMedications,
      MedicalConditions,
      InsuranceProvider,
      PolicyNumber,
      contactDetails,
      forWhom,
    });

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: newProfile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating/updating profile",
      error: error.message,
    });
  }
};

// Update profile by ID (PUT)
export const updateProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existingProfile = await Profile.findOne({ _id: id, user: userId });
    if (!existingProfile) {
      return res.status(404).json({ success: false, message: "Profile not found or unauthorized" });
    }

    // Validate contact details location if provided in req.body
    if (req.body.contactDetails && Array.isArray(req.body.contactDetails)) {
      for (const contact of req.body.contactDetails) {
        if (contact.location) {
          const { lat, lng } = contact.location;
          if (lat === undefined || lng === undefined) {
            return res.status(400).json({
              success: false,
              message: "Location must have both lat and lng",
            });
          }
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
              success: false,
              message: "Invalid latitude or longitude values",
            });
          }
        }
      }
    }

    // Update fields from request body
    Object.assign(existingProfile, req.body);
    await existingProfile.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: existingProfile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

// Get profile by ID
export const profileDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const profile = await Profile.findOne({ _id: id, user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving profile",
      error: error.message,
    });
  }
};

// Get profile by Person_name (myself / someone else)
export const profileByPersonName = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.userId;

    const profile = await Profile.findOne({ user: userId, Person_name: type });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving profile",
      error: error.message,
    });
  }
};

// Save FCM Token
export const saveFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.userId;
    
    if (!fcmToken) {
        return res.status(400).json({ success: false, message: "FCM token is required" });
    }

    // We can update all profiles owned by this user or just a specific one
    // For now, let's update the "myself" profile
    const profile = await Profile.findOneAndUpdate(
        { user: userId, Person_name: "myself" },
        { fcmToken },
        { new: true }
    );

    if (!profile) {
        return res.status(404).json({ success: false, message: "Profile not found" });
    }

    return res.status(200).json({
        success: true,
        message: "FCM token saved successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
        success: false,
        message: "Server error while saving FCM token",
        error: error.message,
    });
  }
};

// Get profile + full health vault by profile ID (no auth — for emergency QR scan)
export const profileWithVault = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Fetch health wallet for the same user (don't block if missing)
    let vault = null;
    try {
      vault = await HealthWallet.findOne({ userId: profile.user });
    } catch (_) {
      vault = null;
    }

    return res.status(200).json({
      success: true,
      data: {
        profile,
        vault: vault ? {
          vaccinations: vault.vaccinations || [],
          treatmentHistory: vault.treatmentHistory || [],
          prescriptions: vault.prescriptions || [],
        } : null,
      }
    });
  } catch (error) {
    console.error("profileWithVault error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
