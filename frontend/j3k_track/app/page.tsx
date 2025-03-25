// page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

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
    <div className="max-w-2xl mx-auto p-8 bg-red-50 border-4 border-red-600 rounded-xl shadow-2xl" 
         style={{
           backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23FF0000\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\'/%3E%3C/g%3E%3C/svg%3E")',
         }}
    >
      <h1 className="text-3xl font-bold text-red-600 mb-8 text-center flex items-center justify-center">
        📦 J3kTracking (包裹追踪)
      </h1>

      <form className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">
            Enter Your Tracking Number 输入追踪号码
          </label>
          <input
            type="text"
            className="w-full p-3 border-2 border-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-center shadow-md"
            placeholder="Tracking Code 追踪号码"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-xl transition duration-300 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>🔄 Loading 加载中...</>
          ) : (
            <>
              🔍 Track Parcel 追踪包裹
            </>
          )}
        </button>
      </form>

      {error && (
        <p className="text-red-600 mt-4 text-lg text-center flex items-center justify-center">
          ❌ {error}
        </p>
      )}

      {history && (
        <div className="mt-8 border-t-4 border-yellow-600 pt-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
            🕰️ Tracking Details 追踪详情
          </h2>
          <div className="space-y-4">
            <p className="text-lg flex items-center">
              🏷️ <strong>Tracking Code 追踪号码:</strong> {history.parcel.trackingCode}
            </p>
            <p className="text-lg flex items-center">
              🚩 <strong>Origin 出发地:</strong> {history.parcel.origin}
            </p>
            <p className="text-lg flex items-center">
              🏁 <strong>Destination 目的地:</strong> {history.parcel.destination}
            </p>
          </div>

          <h3 className="text-xl font-bold mt-6 text-red-600 flex items-center">
            📋 History 物流历史
          </h3>

          <div className="mt-4 text-center">
            <Link href={history ? `/gps?trackingCode=${history.parcel.trackingCode}` : '#'} legacyBehavior>
              <a
                className={`inline-block bg-yellow-500 text-white py-2 px-4 rounded-lg font-bold text-xl ${!history || !history.history.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-700'}`}
                aria-disabled={!history || !history.history.length}
              >
                🗺️ Track on Map 在地图上追踪
              </a>
            </Link>
          </div>

          <ul className="mt-4 space-y-4">
            {history.history.map((record, index) => (
              <li 
                key={index} 
                className="p-4 border-2 border-red-600 bg-white rounded-lg shadow-md transform transition hover:scale-105"
              >
                <p className="text-lg flex items-center">
                  📦 <strong>Status 状态:</strong> {record.status}
                </p>
                <p className="text-lg flex items-center">
                  📍 <strong>Location 位置:</strong> {record.location}
                </p>
                <p className="text-lg flex items-center">
                  🕒 <strong>Time 时间:</strong> {new Date(record.timestamp).toLocaleString()}
                </p>
                <p className="italic text-sm text-gray-600 mt-2">
                  📝 {record.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}