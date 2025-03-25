//parcelstatus
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';  // ✅ เพิ่ม CORS
import axios from 'axios';

const app = express();
const prisma = new PrismaClient();

// ✅ เปิดให้ Frontend (`http://localhost:3000`) ใช้ API ได้
app.use(cors({
  origin: 'http://localhost:3000', // อนุญาตเฉพาะ Frontend ของคุณ
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'], // อนุญาตเฉพาะ method ที่ใช้
}));


app.use(express.json()); // รองรับ JSON request body

// 📌 GET: ดึงข้อมูลอัปเดตสถานะพัสดุโดยใช้ parcelId
app.get('/parcel-status', async (req, res) => {
  try {
    const { parcelId } = req.query;

    const data = await prisma.status.findMany({
      where: {
        parcelid: parcelId
          ? { contains: parcelId, mode: 'insensitive' }
          : undefined,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 📌 POST: เพิ่มข้อมูลอัปเดตสถานะพัสดุ
app.post('/parcel-status', async (req, res) => {
  try {
    const { parcelId, status, updatedBy, location } = req.body;

    const newData = await prisma.status.create({
      data: {
        parcelId,
        status,
        updatedBy,
        location,
      },
    });

    res.json(newData);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 📌 GET: ดึงข้อมูลอัปเดตสถานะพัสดุโดยใช้ ID
app.get('/parcel-status/:trackingCode', async (req, res) => {
  try {
    const { trackingCode } = req.params;
    const data = await prisma.status.findFirst({
      where: {
        parcelId: parseInt(trackingCode), // แปลง parcel.id เป็น integer
      },
    });
    if (!data) {
      return res.status(404).json({ error: 'Parcel status not found' });
    }

    res.json(data); // ส่งข้อมูลสถานะกลับไป
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


// 📌 PUT: อัปเดตข้อมูลสถานะพัสดุ
app.put('/parcel-status/:parcelId', async (req, res) => {
  try {
    const { parcelId } = req.params;
    const { status } = req.body;

    console.log("parcelId:", parcelId);
    console.log("Status:", status);


    const existingRecord = await prisma.status.findFirst({
      where: {
        parcelId: Number(parcelId),
      },
    });

    if (!existingRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // อัปเดตข้อมูลที่พบ
    const updatedData = await prisma.status.update({
      where: {
        id: existingRecord.id,  // ใช้ id ของรายการที่ค้นพบ
      },
      data: {
        status,  // อัปเดตสถานะ
      },
    });

    const parcelResponse = await axios.get(`http://localhost:3001/parcel/${parcelId}`);
    const parcel = parcelResponse.data;

    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    const senderPhone = parcel.senderPhone;
    const recipientPhone = parcel.recipientPhone;
    const recipientEmail = parcel.email;

    console.log("recipient", recipientPhone);
    console.log("recipient email:", recipientEmail);

    // ✅ เรียก API แจ้งเตือนอีเมล
    if (recipientEmail) {
      await axios.post('http://localhost:3003/send-parcel-email-by-id', {
        parcelId,
        subject: `อัปเดตสถานะพัสดุ: ${parcel.trackingCode}`,
        text: `เรียนท่านลูกค้า,\n\n\
ขอเรียนให้ท่านทราบว่า พัสดุของท่าน หมายเลขติดตามพัสดุ ${parcel.trackingCode} \
ขณะนี้มีการอัปเดตสถานะล่าสุดเป็น: "${status}".\n\n\
ท่านสามารถติดตามสถานะพัสดุเพิ่มเติมได้ที่เว็บไซต์ของเรา http://localhost:3000\n\n\
ขอขอบพระคุณที่ใช้บริการของเรา\n\
ทีมงานฝ่ายจัดส่งพัสดุ`,
        notifyType: "both", // แจ้งทั้งอีเมลและ SMS
      });
    }

    await axios.post('http://localhost:3003/notify-parcel', {
      senderPhone,
      recipientPhone,
    });


    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 📌 DELETE: ลบข้อมูลอัปเดตสถานะพัสดุ
app.delete('/parcel-status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleteData = await prisma.status.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({ message: 'Parcel status update deleted successfully', data: deleteData });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 📌 ตั้งค่า Port และรันเซิร์ฟเวอร์
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
