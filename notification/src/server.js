require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MAILTRAP_API_URL = "https://send.api.mailtrap.io/api/send";

app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await axios.post(
      MAILTRAP_API_URL,
      {
        to: [{ email: to }],
        from: { email: "no-reply@example.com", name: "Your Service" },
        subject,
        text,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.MAILTRAP_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ message: "Email sent successfully", data: response.data });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
