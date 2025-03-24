'use client';

import { useState } from 'react';

export default function ParcelForm() {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    senderName: '',
    senderAddress: '',
    senderPhone: '',
    recipientName: '',
    recipientAddress: '',
    recipientPhone: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:3001/parcel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create parcel');
      }

      const data = await response.json();
      setSuccess(`Parcel created! Tracking Code: ${data.trackingCode}`);
      setFormData({
        origin: '', destination: '', senderName: '', senderAddress: '', senderPhone: '',
        recipientName: '', recipientAddress: '', recipientPhone: '', email: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-xl shadow-md border border-gray-300 mt-10">
      <h2 className="text-2xl font-bold text-center text-red-600 mb-4">📦 เพิ่มพัสดุใหม่</h2>
      {success && <p className="text-green-600 text-center">✅ {success}</p>}
      {error && <p className="text-red-600 text-center">❌ {error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="origin" value={formData.origin} onChange={handleChange} placeholder="📍 ต้นทาง" className="input" required />
          <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="🎯 ปลายทาง" className="input" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="senderName" value={formData.senderName} onChange={handleChange} placeholder="👤 ชื่อผู้ส่ง" className="input" required />
          <input type="text" name="senderPhone" value={formData.senderPhone} onChange={handleChange} placeholder="📞 เบอร์ผู้ส่ง" className="input" required />
        </div>
        <textarea name="senderAddress" value={formData.senderAddress} onChange={handleChange} placeholder="🏠 ที่อยู่ผู้ส่ง" className="input" required />
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} placeholder="👤 ชื่อผู้รับ" className="input" required />
          <input type="text" name="recipientPhone" value={formData.recipientPhone} onChange={handleChange} placeholder="📞 เบอร์ผู้รับ" className="input" required />
        </div>
        <textarea name="recipientAddress" value={formData.recipientAddress} onChange={handleChange} placeholder="🏠 ที่อยู่ผู้รับ" className="input" required />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="✉️ อีเมลแจ้งเตือน" className="input" required />
        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold" disabled={loading}>
          {loading ? '⏳ กำลังบันทึก...' : '📩 บันทึกพัสดุ'}
        </button>
      </form>
    </div>
  );
}
