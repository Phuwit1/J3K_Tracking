require("dotenv").config();
const express = require('express');
const nodemailer = require('nodemailer'); // นำเข้า nodemailer
const bodyParser = require('body-parser');

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

app.listen(3000, () => {
  console.log('Server started on port 3000');
});