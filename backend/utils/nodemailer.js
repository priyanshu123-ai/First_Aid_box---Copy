import nodemailer from "nodemailer";

export const alert = async (req, res) => {
  try {
    const {
      email,
      name,
      phoneNumber,
      bloodGroup,
      allergies,
      medications,
      conditions,
      dateOfBirth,
      organDonor,
      location,
      hospitals,
    } = req.body;

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

    const mapsLink =
      typeof location === "string"
        ? location
        : `https://www.google.com/maps?q=${location.lat},${location.lng}`;

    const hospitalsHtml =
      hospitals && hospitals.length > 0
        ? `
      <div style="margin-top:20px;">
        <h3 style="color:#b71c1c; border-bottom:2px solid #ffcdd2; padding-bottom:6px;">🏥 Nearby Hospitals</h3>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#ffebee;">
              <th style="padding:8px; text-align:left;">Hospital</th>
              <th style="padding:8px; text-align:left;">Distance</th>
              <th style="padding:8px; text-align:left;">Directions</th>
            </tr>
          </thead>
          <tbody>
            ${hospitals
              .map(
                (h) => `
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">${h.name}</td>
                <td style="padding:8px;">${h.distance} km</td>
                <td style="padding:8px;">
                  <a href="https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}"
                    style="color:#d32f2f; font-weight:bold;">📍 Get Directions</a>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`
        : `<p style="color:#888;">No nearby hospitals found at the time of alert.</p>`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Array.isArray(email) ? email.join(",") : email,
      subject: `🚨 EMERGENCY SOS — ${name || "Someone"} needs immediate help!`,
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background:#f5f5f5; font-family:Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#b71c1c,#d32f2f); padding:30px; text-align:center;">
                    <div style="font-size:48px;">🚨</div>
                    <h1 style="color:#ffffff; margin:10px 0 4px; font-size:26px;">EMERGENCY SOS ALERT</h1>
                    <p style="color:#ffcdd2; margin:0; font-size:15px;">Immediate assistance required</p>
                  </td>
                </tr>

                <!-- Patient info -->
                <tr>
                  <td style="padding:24px 30px 0;">
                    <h2 style="color:#b71c1c; margin:0 0 16px; font-size:18px; border-bottom:2px solid #ffcdd2; padding-bottom:8px;">
                      👤 Patient Information
                    </h2>
                    <table style="width:100%; border-collapse:collapse;">
                      <tr style="background:#fafafa;">
                        <td style="padding:9px 12px; font-weight:bold; color:#555; width:40%;">Full Name</td>
                        <td style="padding:9px 12px; color:#222;">${name || "N/A"}</td>
                      </tr>
                      <tr>
                        <td style="padding:9px 12px; font-weight:bold; color:#555;">Phone</td>
                        <td style="padding:9px 12px; color:#222;">${phoneNumber || "N/A"}</td>
                      </tr>
                      <tr style="background:#fafafa;">
                        <td style="padding:9px 12px; font-weight:bold; color:#555;">Date of Birth</td>
                        <td style="padding:9px 12px; color:#222;">${dateOfBirth || "N/A"}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Medical info -->
                <tr>
                  <td style="padding:20px 30px 0;">
                    <h2 style="color:#b71c1c; margin:0 0 16px; font-size:18px; border-bottom:2px solid #ffcdd2; padding-bottom:8px;">
                      🏥 Medical Information
                    </h2>
                    <table style="width:100%; border-collapse:collapse;">
                      <tr style="background:#fafafa;">
                        <td style="padding:9px 12px; font-weight:bold; color:#555; width:40%;">Blood Group</td>
                        <td style="padding:9px 12px;">
                          <span style="background:#d32f2f; color:#fff; padding:3px 10px; border-radius:20px; font-weight:bold;">${bloodGroup || "Unknown"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:9px 12px; font-weight:bold; color:#555;">Organ Donor</td>
                        <td style="padding:9px 12px; color:#222;">${organDonor || "N/A"}</td>
                      </tr>
                      <tr style="background:#fafafa;">
                        <td style="padding:9px 12px; font-weight:bold; color:#555;">⚠️ Allergies</td>
                        <td style="padding:9px 12px; color:#c62828; font-weight:500;">${allergies || "None reported"}</td>
                      </tr>
                      <tr>
                        <td style="padding:9px 12px; font-weight:bold; color:#555;">Medications</td>
                        <td style="padding:9px 12px; color:#222;">${medications || "None reported"}</td>
                      </tr>
                      <tr style="background:#fafafa;">
                        <td style="padding:9px 12px; font-weight:bold; color:#555;">Conditions</td>
                        <td style="padding:9px 12px; color:#222;">${conditions || "None reported"}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Location CTA -->
                <tr>
                  <td style="padding:24px 30px 0;">
                    <h2 style="color:#b71c1c; margin:0 0 16px; font-size:18px; border-bottom:2px solid #ffcdd2; padding-bottom:8px;">
                      📍 Live Location
                    </h2>
                    <div style="text-align:center; margin:12px 0;">
                      <a href="${mapsLink}"
                        style="display:inline-block; background:#d32f2f; color:#fff; padding:14px 32px;
                               text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px;">
                        📍 View on Google Maps
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Nearby hospitals -->
                <tr>
                  <td style="padding:20px 30px 0;">
                    ${hospitalsHtml}
                  </td>
                </tr>

                <!-- View profile CTA -->
                <tr>
                  <td style="padding:20px 30px;">
                    <div style="text-align:center;">
                      <a href="https://stunning-speculoos-18716f.netlify.app/"
                        style="display:inline-block; background:#1565c0; color:#fff; padding:12px 28px;
                               text-decoration:none; border-radius:8px; font-weight:bold; font-size:15px;">
                        🔍 View Full Profile Details
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f5f5f5; padding:16px; text-align:center; border-top:1px solid #eee;">
                    <p style="margin:0; font-size:12px; color:#999;">
                      This is an automated SOS alert from the Emergency First Aid App.<br/>
                      Please respond immediately if you receive this message.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("SOS Mail sent to:", email);

    res.status(200).json({ message: "SOS email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email", error: err.message });
  }
};
