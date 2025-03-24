import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import axios from "axios";
// import { sendSMS } from "./smsService.js"; // ต้องใส่ .js

const app = express();

// ✅ เปิดให้ Frontend (`http://localhost:3000`) ใช้ API ได้
app.use(cors({
  origin: 'http://localhost:3000', // อนุญาตเฉพาะ Frontend ของคุณ
  methods: ['GET', 'POST'], // อนุญาตเฉพาะ method ที่ใช้
}));

app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// กำหนด URL ของ Parcel Service
const PARCEL_SERVICE_URL = process.env.PARCEL_SERVICE_URL || 'http://localhost:3001';

// ฟังก์ชั่นสำหรับดึงข้อมูลจาก Parcel Service ด้วย ID
async function getParcelById(parcelId) {
  try {
    const response = await axios.get(`${PARCEL_SERVICE_URL}/parcel/${parcelId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching parcel info:', error.message);
    throw new Error('Could not fetch parcel information');
  }
}

// ฟังก์ชั่นสำหรับดึงข้อมูลจาก Parcel Service ด้วย tracking code
async function getParcelByTrackingCode(trackingCode) {
  try {
    const response = await axios.get(`${PARCEL_SERVICE_URL}/parcel?trackingCode=${trackingCode}`);
    if (response.data && response.data.length > 0) {
      return response.data[0]; // คืนค่ารายการแรกที่พบ
    }
    throw new Error('Parcel not found');
  } catch (error) {
    console.error('Error fetching parcel info:', error.message);
    throw new Error('Could not fetch parcel information');
  }
}

app.get('/test', (req, res) => {
  res.send('Server is running');
});

// endpoint สำหรับส่งอีเมล์ทั่วไป
app.post('/send-email', (req, res) => {
  const { from, to, subject, text } = req.body;
  
  const mailOptions = {
    from: from || process.env.DEFAULT_EMAIL || 'youremail@gmail.com',
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

// endpoint สำหรับส่งอีเมล์ไปยังอีเมล์ที่เก็บอยู่ใน Parcel ด้วย parcelId
app.post('/send-parcel-email-by-id', async (req, res) => {
  try {
    const { parcelId, subject, text, notifyType } = req.body;
    
    if (!parcelId) {
      return res.status(400).json({ success: false, error: 'Parcel ID is required' });
    }
    
    // ดึงข้อมูล parcel
    const parcelInfo = await getParcelById(parcelId);
    
    if (!parcelInfo.email) {
      return res.status(400).json({ success: false, error: 'Parcel has no email address' });
    }
    
    // สร้างหัวข้อและเนื้อหาอีเมล์จากข้อมูลที่มี
    const emailSubject = subject || `แจ้งสถานะพัสดุหมายเลข ${parcelInfo.trackingCode}`;
    const emailText = text || `เรียนท่านลูกค้า,\n\nพัสดุของคุณหมายเลข ${parcelInfo.trackingCode} กำลังถูกจัดส่ง\n\nจาก: ${parcelInfo.origin}\nถึง: ${parcelInfo.destination}\n\nผู้ส่ง: ${parcelInfo.senderName}\nผู้รับ: ${parcelInfo.recipientName}\n\nขอบคุณที่ใช้บริการ`;
    
    const mailOptions = {
      from: process.env.DEFAULT_EMAIL || 'youremail@gmail.com',
      to: parcelInfo.email,
      subject: emailSubject,
      text: emailText
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      } else {
        // ถ้าต้องการส่ง SMS ด้วย
        if (notifyType === 'both' || notifyType === 'sms') {
          try {
            // ส่ง request ไปที่ notify-parcel endpoint ของตัวเอง
            axios.post(`http://localhost:3003/notify-parcel`, {
              senderPhone: parcelInfo.senderPhone,
              recipientPhone: parcelInfo.recipientPhone,
              parcelId: parcelInfo.id
            });
          } catch (smsError) {
            console.error('Error sending SMS notification:', smsError);
            // ไม่ต้อง return error ถ้าส่ง SMS ไม่สำเร็จ แต่ส่งอีเมล์สำเร็จแล้ว
          }
        }
        
        return res.json({ success: true, message: 'Email sent: ' + info.response });
      }
    });
    
  } catch (error) {
    console.error('Error in send-parcel-email-by-id:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// endpoint สำหรับส่งอีเมล์ไปยังอีเมล์ที่เก็บอยู่ใน Parcel ด้วย tracking code
app.post('/send-parcel-email-by-tracking', async (req, res) => {
  try {
    const { trackingCode, subject, text, notifyType } = req.body;
    
    if (!trackingCode) {
      return res.status(400).json({ success: false, error: 'Tracking code is required' });
    }
    
    // ดึงข้อมูล parcel
    const parcelInfo = await getParcelByTrackingCode(trackingCode);
    
    if (!parcelInfo.email) {
      return res.status(400).json({ success: false, error: 'Parcel has no email address' });
    }
    
    // สร้างหัวข้อและเนื้อหาอีเมล์จากข้อมูลที่มี
    const emailSubject = subject || `แจ้งสถานะพัสดุหมายเลข ${parcelInfo.trackingCode}`;
    const emailText = text || `เรียนท่านลูกค้า,\n\nพัสดุของคุณหมายเลข ${parcelInfo.trackingCode} กำลังถูกจัดส่ง\n\nจาก: ${parcelInfo.origin}\nถึง: ${parcelInfo.destination}\n\nผู้ส่ง: ${parcelInfo.senderName}\nผู้รับ: ${parcelInfo.recipientName}\n\nขอบคุณที่ใช้บริการ`;
    
    const mailOptions = {
      from: process.env.DEFAULT_EMAIL || 'youremail@gmail.com',
      to: parcelInfo.email,
      subject: emailSubject,
      text: emailText
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      } else {
        // ถ้าต้องการส่ง SMS ด้วย
        if (notifyType === 'both' || notifyType === 'sms') {
          try {
            // ส่ง request ไปที่ notify-parcel endpoint ของตัวเอง
            axios.post(`http://localhost:3003/notify-parcel`, {
              senderPhone: parcelInfo.senderPhone,
              recipientPhone: parcelInfo.recipientPhone,
              parcelId: parcelInfo.id
            });
          } catch (smsError) {
            console.error('Error sending SMS notification:', smsError);
            // ไม่ต้อง return error ถ้าส่ง SMS ไม่สำเร็จ แต่ส่งอีเมล์สำเร็จแล้ว
          }
        }
        
        return res.json({ success: true, message: 'Email sent: ' + info.response });
      }
    });
    
  } catch (error) {
    console.error('Error in send-parcel-email-by-tracking:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/notify-parcel', async (req, res) => {
  try {
    const { senderPhone, recipientPhone, parcelId, trackingCode } = req.body;

    // ตัวแปรสำหรับเก็บข้อมูล parcel
    let parcelInfo = null;
    
    // ดึงข้อมูล parcel ถ้ามี parcelId หรือ trackingCode
    if (parcelId) {
      try {
        parcelInfo = await getParcelById(parcelId);
      } catch (err) {
        console.warn("Could not fetch parcel details by ID:", err.message);
      }
    } else if (trackingCode) {
      try {
        parcelInfo = await getParcelByTrackingCode(trackingCode);
      } catch (err) {
        console.warn("Could not fetch parcel details by tracking code:", err.message);
      }
    }

    // สร้างข้อความที่จะส่ง
    let message;
    if (parcelInfo) {
      message = `พัสดุหมายเลข ${parcelInfo.trackingCode} ถูกจัดส่งจาก ${parcelInfo.origin} ไปยัง ${parcelInfo.destination} อยู่ระหว่างการจัดส่ง`;
    } else {
      message = "พัสดุของคุณอยู่ระหว่างการจัดส่ง";
    }

    // ส่ง SMS ให้ผู้รับ
    if (recipientPhone) {
      await sendSMS(recipientPhone, message);
    }
    
    // ส่ง SMS ให้ผู้ส่ง (ถ้ามี)
    if (senderPhone) {
      const senderMessage = parcelInfo 
        ? `พัสดุหมายเลข ${parcelInfo.trackingCode} ที่คุณส่งไปยัง ${parcelInfo.recipientName} อยู่ในระหว่างการจัดส่ง`
        : "พัสดุที่คุณส่งอยู่ระหว่างการจัดส่ง";
      await sendSMS(senderPhone, senderMessage);
    }

    res.status(200).json({ message: 'SMS sent successfully' });
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
});

app.listen(3003, () => {
  console.log('Server started on port 3003');
});