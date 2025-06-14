const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Set in environment variables
    pass: process.env.EMAIL_PASS, // Set in environment variables
  },
});

// Rate limiting (basic, for demo)
const requestLog = new Map();
const RATE_LIMIT = 1; // 1 request per number per day
const RATE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in ms

// Unban request endpoint
app.post("/send-unban-request", async (req, res) => {
  const { phoneNumber, reason } = req.body;

  // Basic validation
  if (!phoneNumber || !phoneNumber.match(/\+94[0-9]{9}/)) {
    return res.status(400).json({ message: "Invalid phone number format." });
  }

  // Rate limiting check
  const now = Date.now();
  const log = requestLog.get(phoneNumber) || { count: 0, timestamp: 0 };
  if (now - log.timestamp < RATE_WINDOW) {
    if (log.count >= RATE_LIMIT) {
      return res.status(429).json({ message: "Too many requests. Try again tomorrow." });
    }
  } else {
    log.count = 0; // Reset after window
    log.timestamp = now;
  }
  log.count += 1;
  requestLog.set(phoneNumber, log);

  // Email content
  const message = `
    Subject: Unban Request for Phone Number ${phoneNumber}
    
    Dear WhatsApp Support Team,
    
    My phone number (${phoneNumber}) was banned, possibly due to ${reason || "unknown reasons"}. 
    I sincerely apologize for any violation of WhatsApp's policies and assure you that I will comply with all terms moving forward. 
    Please review my account and kindly unban my number.
    
    Thank you,
    WhatsUnban User
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "support@whatsapp.com",
      subject: `Unban Request for ${phoneNumber}`,
      text: message,
    });
    res.json({ message: "Unban request sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Error sending request. Try again later." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
