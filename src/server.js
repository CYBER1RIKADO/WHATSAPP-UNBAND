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
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rate limiting
const requestLog = new Map();
const RATE_LIMIT = 1; // 1 request per number per day
const RATE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

// Unban request endpoint with improved error handling
app.post("/send-unban-request", async (req, res) => {
  const { phoneNumber, reason } = req.body;

  // Basic validation
  if (!phoneNumber || !phoneNumber.match(/\+94[0-9]{9}/)) {
    return res.status(400).json({ message: "Phone number එක වැරදියි. (+94XXXXXXXXX format use කරන්න)🙂" });
  }

  // Rate limiting check
  const now = Date.now();
  const log = requestLog.get(phoneNumber) || { count: 0, timestamp: 0 };
  if (now - log.timestamp < RATE_WINDOW) {
    if (log.count >= RATE_LIMIT) {
      return res.status(429).json({ message: "වැඩිය requests යැව්වා. හෙට ආයෙ උත්සාහ කරන්න.😒😪" });
    }
  } else {
    log.count = 0;
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
    // Test email sending
    await transporter.verify(); // Check if transporter is working
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "support@whatsapp.com",
      subject: `Unban Request for ${phoneNumber}`,
      text: message,
    });
    console.log(`Email sent successfully to ${phoneNumber}`);
    res.json({ message: "Unban request එක successfully ගියා! 🎉" });
  } catch (error) {
    console.error("Email error:", error.message); // Log error for debugging
    res.status(500).json({ message: "Request එක යවන්න බැරි වෙන්නෙ නෑ. ආයෙ උත්සාහ කරපන් 😒🎈. (Error: " + error.message + ")" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server එක port ${PORT} එකේ run වෙනවා`));
