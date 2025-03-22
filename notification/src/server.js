require("dotenv").config();
const express = require('express');
const nodemailer = require('nodemailer'); // นำเข้า nodemailer
const bodyParser = require('body-parser');
const { sendSMS } = require('./smsService'); 


const app = express();
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({ // ตรวจสอบว่าตัวแปรนี้อยู่หลังจาก require
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

app.get('/test', (req, res) => {
  res.send();
});

app.post('/send-email', (req, res) => {
  const { to, subject, text } = req.body;
  
  const mailOptions = {
    from: 'youremail@gmail.com',
    to,
    subject,
    text
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.json({ success: true, message: 'Email sent: ' + info.response });
    }
  });
});

app.post('/notify-parcel', async (req, res) => {
    try {
      const { senderPhone, recipientPhone } = req.body;
  
      // ข้อความที่ต้องการส่ง (สามารถปรับให้เหมาะสม)
      const message = `ครวยยยยย`;
  
      // ส่ง SMS ให้ผู้ส่งหรือผู้รับ (สามารถปรับเพื่อส่งให้ทั้งสองได้)
      await sendSMS(recipientPhone, message);
  
      res.status(200).json({ message: 'SMS sent successfully' });
    } catch (error) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ error: 'Failed to send SMS', details: error.message });
    }
  });


app.listen(3003, () => {
  console.log('Server started on port 3003');
});
