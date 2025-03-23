import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import axios from 'axios';
import cors from 'cors';  // ✅ เพิ่ม CORS

const app = express();
const prisma = new PrismaClient();


// ✅ เปิดให้ Frontend (`http://localhost:3000`) ใช้ API ได้
app.use(cors({
  origin: 'http://localhost:3000', // อนุญาตเฉพาะ Frontend ของคุณ
  methods: ['GET', 'POST'], // อนุญาตเฉพาะ method ที่ใช้
}));

app.use(express.json()); // รองรับ JSON request body


const NOTIFICATION_SERVICE_URL = "http://localhost:3003/notify-parcel";

// 📌 GET: ค้นหาพัสดุด้วย search params
app.get('/parcel', async (req, res) => {
  try {
    const { trackingCode } = req.query;

    const parcels = await prisma.parcel.findMany({
      where: {
        trackingCode: trackingCode
          ? { contains: trackingCode, mode: 'insensitive' }
          : undefined,
      },
    });

    res.json(parcels);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 📌 POST: สร้างข้อมูลพัสดุใหม่
app.post('/parcel', async (req, res) => {
  try {
    const trackingCode =
      'j3k' + crypto.randomUUID().replace(/-/g, '').substring(0, 10);
    const {
      origin,
      destination,
      senderName,
      senderAddress,
      recipientName,
      recipientAddress,
      senderPhone,
      recipientPhone,
      email,
    } = req.body;

    const newData = await prisma.parcel.create({
      data: {
        trackingCode,
        origin,
        destination,
        senderName,
        senderAddress,
        recipientName,
        recipientAddress,
        senderPhone,
        recipientPhone,
        email,
      },
    });

    await axios.post('http://localhost:3003/notify-parcel', {
      senderPhone,
      recipientPhone,
    });

    res.json(newData);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 📌 GET: ดึงข้อมูลพัสดุโดยใช้ ID
app.get('/parcel/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.parcel.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!data) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 📌 PUT: อัปเดตข้อมูลพัสดุ
app.put('/parcel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      trackingCode,
      origin,
      destination,
      senderName,
      senderAddress,
      recipientName,
      recipientAddress,
      senderPhone,
      recipientPhone,
      email,
    } = req.body;

    const updatedData = await prisma.parcel.update({
      where: {
        id: Number(id),
      },
      data: {
        trackingCode,
        origin,
        destination,
        senderName,
        senderAddress,
        recipientName,
        recipientAddress,
        senderPhone,
        recipientPhone,
        email,
      },
    });

    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 📌 DELETE: ลบข้อมูลพัสดุ
app.delete('/parcel/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleteData = await prisma.parcel.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({ message: 'Parcel deleted successfully', data: deleteData });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


// 📌 ตั้งค่า Port และรันเซิร์ฟเวอร์
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
