const express = require("express");
const { sendEmail } = require("./emailService");

const app = express();
app.use(express.json());

// API สำหรับแจ้งเตือนการสร้างพัสดุใหม่
app.post("/notify-parcel", async (req, res) => {
  const { email, parcelId, sender, receiver, status } = req.body;

  if (!email || !parcelId || !sender || !receiver || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const subject = `Parcel Created: ${parcelId}`;
  const message = `
    A new parcel has been created.
    - 📦 Parcel ID: ${parcelId}
    - 📤 Sender: ${sender}
    - 📥 Receiver: ${receiver}
    - 🚀 Status: ${status}

    Thank you for using our service.
  `;

  try {
    await sendEmail(email, subject, message);
    res.status(200).json({ success: "Parcel notification sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email notification" });
  }
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Notification Service is running on port ${PORT}`);
});
