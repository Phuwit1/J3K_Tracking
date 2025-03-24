import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';  // ✅ เพิ่ม CORS

const app = express();
const prisma = new PrismaClient();

// ✅ เปิดให้ Frontend (`http://localhost:3000`) ใช้ API ได้
app.use(cors({
  origin: 'http://localhost:3000', // อนุญาตเฉพาะ Frontend ของคุณ
  methods: ['GET', 'POST'], // อนุญาตเฉพาะ method ที่ใช้
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
app.get('/parcel-status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.status.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!data) {
      return res.status(404).json({ error: 'Parcel status update not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 📌 PUT: อัปเดตข้อมูลสถานะพัสดุ
app.put('/parcel-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { parcelId, status, updatedBy, location } = req.body;

    const updatedData = await prisma.status.update({
      where: {
        id: Number(id),
      },
      data: {
        parcelId,
        status,
        updatedBy,
        location,
      },
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
