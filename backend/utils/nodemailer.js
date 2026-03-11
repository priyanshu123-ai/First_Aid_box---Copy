import nodemailer from "nodemailer";

export const alert = async (req, res) => {
  try {
    const { email, name, relation, phoneNumber, location } = req.body;

    if (!email || !location) {
      return res.status(400).json({ message: "Email and location required" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

  const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: "🚨 Emergency SOS Alert!",
  html: `
    <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px; border-radius:8px;">
      <h2 style="color:#d32f2f; text-align:center;">🚨 Emergency SOS Alert</h2>
      <p style="font-size:16px;">An SOS alert has been triggered for <strong>${name || "your contact"}</strong>.</p>
      
      <table style="width:100%; margin-top:10px; border-collapse:collapse;">
        <tr>
          <td style="padding:8px; font-weight:bold;">Relation:</td>
          <td style="padding:8px;">${relation || "Not specified"}</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold;">Phone:</td>
          <td style="padding:8px;">${phoneNumber || "N/A"}</td>
        </tr>
      </table>

      <div style="margin-top:20px; text-align:center;">
        <a href="https://www.google.com/maps?q=${location.lat},${location.lng}" 
           style="display:inline-block; background:#d32f2f; color:#fff; padding:12px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">
           📍 View Location on Google Maps
        </a>

         <a href="https://stunning-speculoos-18716f.netlify.app/" 
           style="display:inline-block; background:#d32f2f; color:#fff; padding:12px 20px; margin : 20px;text-decoration:none; border-radius:5px; font-weight:bold;">
           📍 View User Details
        </a>
      </div>

      <p style="margin-top:20px; font-size:14px; color:#555;">
        Please contact them immediately if possible.
      </p>

      <hr style="margin-top:20px; border:none; border-top:1px solid #ccc;" />
      <p style="font-size:12px; text-align:center; color:#999;">
        This is an automated SOS alert from your Emergency App.
      </p>
    </div>
  `,
};


    await transporter.sendMail(mailOptions);

    console.log("Mail sent to:", email);

    res.status(200).json({ message: "SOS email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email", error: err.message });
  }
};
