import express from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const app = express();
const prisma = new PrismaClient();
const PARCEL_SERVICE_URL = process.env.PARCEL_SERVICE_URL || 'http://localhost:3001';

app.use(express.json());

// Function สำหรับเรียกข้อมูลพัสดุด้วย tracking code จาก parcel service
async function getParcelByTrackingCode(trackingCode) {
  try {
    const response = await axios.get(`${PARCEL_SERVICE_URL}/parcel?trackingCode=${trackingCode}`);
    if (response.data && response.data.length > 0) {
      return response.data[0]; // เนื่องจาก API คืนค่าเป็น array
    }
    return null;
  } catch (error) {
    console.error('Error fetching parcel data:', error.message);
    return null;
  }
}

// Function สำหรับเรียกข้อมูลพัสดุด้วย ID จาก parcel service
async function getParcelById(parcelId) {
  try {
    const response = await axios.get(`${PARCEL_SERVICE_URL}/parcel/${parcelId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error fetching parcel data:', error.message);
    throw error;
  }
}

// GET: ดึงประวัติทั้งหมดของพัสดุที่ระบุด้วย tracking code
app.get('/history/tracking/:trackingCode', async (req, res) => {
  try {
    const { trackingCode } = req.params;
    
    // ดึงข้อมูลพัสดุจาก parcel service
    const parcel = await getParcelByTrackingCode(trackingCode);
    
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    // ดึงประวัติทั้งหมดของพัสดุนั้น
    const historyRecords = await prisma.history.findMany({
      where: { parcelId: parcel.id },
      orderBy: { timestamp: 'desc' }
    });
    
    res.json({
      parcel,
      history: historyRecords
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET: ดึงประวัติทั้งหมดของพัสดุที่ระบุด้วย parcel ID
app.get('/history/parcel/:id', async (req, res) => {
  try {
    const parcelId = Number(req.params.id);
    
    // ตรวจสอบว่าพัสดุมีอยู่จริงหรือไม่
    const parcel = await getParcelById(parcelId);
    
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    // ดึงประวัติทั้งหมดของพัสดุนั้น
    const historyRecords = await prisma.history.findMany({
      where: { parcelId },
      orderBy: { timestamp: 'desc' }
    });
    
    res.json({
      parcel,
      history: historyRecords
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET: ดึงข้อมูลประวัติทั้งหมด (อาจจำกัดจำนวนหรือเพิ่ม pagination)
app.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const historyRecords = await prisma.history.findMany({
      take: Number(limit),
      skip,
      orderBy: { timestamp: 'desc' }
    });
    
    // นับจำนวนรายการทั้งหมด
    const total = await prisma.history.count();
    
    res.json({
      data: historyRecords,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST: เพิ่มประวัติการขนส่งใหม่สำหรับพัสดุ (โดยใช้ tracking code)
app.post('/history/tracking', async (req, res) => {
  try {
    const { trackingCode, status, location, description } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
    if (!trackingCode || !status || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ดึงข้อมูลพัสดุจาก parcel service
    const parcel = await getParcelByTrackingCode(trackingCode);

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }

    // สร้างประวัติใหม่
    const history = await prisma.history.create({
      data: {
        parcelId: parcel.id,
        status,
        location,
        description: description || ''
      }
    });

    res.status(201).json({
      message: 'History record created successfully',
      data: history
    });
  } catch (error) {
    console.error('Error creating history record:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST: เพิ่มประวัติการขนส่งใหม่สำหรับพัสดุ (โดยใช้ parcel ID)
app.post('/history/parcel', async (req, res) => {
  try {
    const { parcelId, status, location, description } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
    if (!parcelId || !status || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ตรวจสอบว่าพัสดุมีอยู่จริงหรือไม่
    const parcel = await getParcelById(Number(parcelId));

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }

    // สร้างประวัติใหม่
    const history = await prisma.history.create({
      data: {
        parcelId: Number(parcelId),
        status,
        location,
        description: description || ''
      }
    });

    res.status(201).json({
      message: 'History record created successfully',
      data: history
    });
  } catch (error) {
    console.error('Error creating history record:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`History service is running on http://localhost:${PORT}`);
});