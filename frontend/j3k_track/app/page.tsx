// page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link'; // Import Link component

export default function TrackingHistory() {
  const [trackingCode, setTrackingCode] = useState('');
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!trackingCode) return;
    setLoading(true);
    setError(null);
    setHistory(null);

    try {
      const response = await fetch(`http://localhost:3004/history/tracking/${trackingCode}`);
      if (!response.ok) {
        throw new Error('Parcel not found');
      }
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white border-4 border-redCustom rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-redCustom mb-8 text-center">📦 追踪包裹 (Parcel Tracking)</h1>

      <form className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">请输入您的追踪号码 (Enter your tracking number)</label>
          <input
            type="text"
            className="w-full p-3 border-2 border-redCustom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-center"
            placeholder="输入追踪号码 (Enter tracking code)"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          className="w-full bg-redCustom hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-xl transition duration-300"
          disabled={loading}
        >
          {loading ? '加载中...' : '🔍 追踪包裹'}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4 text-lg text-center">❌ {error}</p>}

      {history && (
        <div className="mt-8 border-t-4 border-gold-600 pt-6">
          <h2 className="text-2xl font-bold text-redCustom mb-4">📜 追踪详情 (Tracking Details)</h2>
          <div className="space-y-4">
            <p className="text-lg"><strong>📌 追踪号码:</strong> {history.parcel.trackingCode}</p>
            <p className="text-lg"><strong>📍 出发地:</strong> {history.parcel.origin}</p>
            <p className="text-lg"><strong>🎯 目的地:</strong> {history.parcel.destination}</p>
          </div>

          <h3 className="text-xl font-bold mt-6 text-redCustom">📖 物流历史 (History)</h3>
          <ul className="mt-4 space-y-4">
            {history.history.map((record, index) => (
              <li key={index} className="p-4 border-2 border-redCustom bg-red-50 rounded-lg shadow-md">
                <p className="text-lg"><strong>🚀 状态:</strong> {record.status}</p>
                <p className="text-lg"><strong>📍 位置:</strong> {record.location}</p>
                <p className="text-lg"><strong>⏳ 时间:</strong> {new Date(record.timestamp).toLocaleString()}</p>
                <p className="italic text-sm">📝 {record.description}</p>
                {/* เพิ่มปุ่ม "ดูแผนที่" พร้อม Link */}
                <div className="mt-2">
                  <Link href={`/gps?trackingCode=${history.parcel.trackingCode}`} legacyBehavior>
                    <a className="inline-block bg-gold-500 hover:bg-gold-700 text-white py-2 px-4 rounded-lg font-bold text-sm">
                      🗺️ ดูแผนที่
                    </a>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}