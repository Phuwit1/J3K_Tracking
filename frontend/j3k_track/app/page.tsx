// 'use client';

// import { useState } from 'react';

// export default function TrackingHistory() {
//   const [trackingCode, setTrackingCode] = useState('');
//   const [history, setHistory] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchHistory = async () => {
//     if (!trackingCode) return;
//     setLoading(true);
//     setError(null);
//     setHistory(null);
  
//     try {
//         const response = await fetch(`http://localhost:3004/history/tracking/${trackingCode}`);
//         console.log(trackingCode)
//         if (!response.ok) {
//         throw new Error('Parcel not found');
//       }
//       const data = await response.json();
//       setHistory(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-xl font-bold mb-4">Parcel Tracking</h1>
//       <input
//         type="text"
//         className="border p-2 w-full rounded-md"
//         placeholder="Enter tracking code"
//         value={trackingCode}
//         onChange={(e) => setTrackingCode(e.target.value)}
//       />
//       <button
//         onClick={fetchHistory}
//         className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md w-full"
//         disabled={loading}
//       >
//         {loading ? 'Loading...' : 'Track Parcel'}
//       </button>
      
//       {error && <p className="text-red-500 mt-2">{error}</p>}
      
//       {history && (
//         <div className="mt-4 border-t pt-4">
//           <h2 className="font-bold">Tracking Details</h2>
//           <p><strong>Tracking Code:</strong> {history.parcel.trackingCode}</p>
//           <p><strong>Origin:</strong> {history.parcel.origin}</p>
//           <p><strong>Destination:</strong> {history.parcel.destination}</p>
//           <h3 className="font-bold mt-3">History</h3>
//           <ul className="mt-2 space-y-2">
//             {history.history.map((record, index) => (
//               <li key={index} className="p-2 border rounded-md">
//                 <p><strong>Status:</strong> {record.status}</p>
//                 <p><strong>Location:</strong> {record.location}</p>
//                 <p><strong>Time:</strong> {new Date(record.timestamp).toLocaleString()}</p>
//                 <p>{record.description}</p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useState } from 'react';

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
    <div className="max-w-lg mx-auto p-6 bg-red-100 border-4 border-red-500 rounded-xl shadow-xl text-center font-serif">
      <h1 className="text-2xl font-bold text-red-700 mb-4">📦 追踪包裹 (Parcel Tracking)</h1>
      <p className="text-gray-700 mb-2">输入您的追踪号码 (Enter your tracking number)</p>
      <input
        type="text"
        className="border-2 border-red-400 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        placeholder="输入追踪号码 (Enter tracking code)"
        value={trackingCode}
        onChange={(e) => setTrackingCode(e.target.value)}
      />
      <button
        onClick={fetchHistory}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg w-full font-bold shadow-lg transition duration-300"
        disabled={loading}
      >
        {loading ? '加载中...' : '🔍 追踪包裹'}
      </button>
      
      {error && <p className="text-red-600 mt-2">❌ {error}</p>}
      
      {history && (
        <div className="mt-6 border-t-2 border-red-500 pt-4 text-left">
          <h2 className="text-xl font-bold text-red-700">📜 追踪详情 (Tracking Details)</h2>
          <p><strong>📌 追踪号码:</strong> {history.parcel.trackingCode}</p>
          <p><strong>📍 出发地:</strong> {history.parcel.origin}</p>
          <p><strong>🎯 目的地:</strong> {history.parcel.destination}</p>
          <h3 className="text-lg font-bold mt-3 text-red-700">📖 物流历史 (History)</h3>
          <ul className="mt-2 space-y-2">
            {history.history.map((record, index) => (
              <li key={index} className="p-3 border-2 border-red-400 bg-red-50 rounded-md shadow-md">
                <p><strong>🚀 状态:</strong> {record.status}</p>
                <p><strong>📍 位置:</strong> {record.location}</p>
                <p><strong>⏳ 时间:</strong> {new Date(record.timestamp).toLocaleString()}</p>
                <p className="italic">📝 {record.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}