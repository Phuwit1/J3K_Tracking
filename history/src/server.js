import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json()); // Middleware รองรับ JSON request body

// GET: ดึงข้อมูลพัสดุทั้งหมด
app.get('/history', async (req, res) => {
  try {
    const history = await prisma.history.findMany({
      where: { parcelId: { not: null}}
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST: เพิ่มประวัติการขนส่งใหม่สำหรับพัสดุ
app.post('/history', async (req, res) => {
  try {
    const { trackingCode, status, location, description } = req.body;

    const parcel = await prisma.history.findMany({
      where: { trackingCode: trackingCode },
    });

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }

    const history = await prisma.history.create({
      data: {
        parcelId: parcel.id,
        status,
        location,
        description,
      },
    });

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
