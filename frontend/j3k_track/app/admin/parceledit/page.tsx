"use client";

import { useState } from "react";
import axios from "axios";

export default function EditParcelPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchParcel = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const response = await axios.get(`http://localhost:3001/parcel?trackingCode=${trackingCode}`);
      if (response.data.length > 0) {
        setParcel(response.data[0]);
      } else {
        setError("Parcel not found (未找到包裹)");
        setParcel(null);
      }
    } catch (err) {
      setError("Error fetching parcel. Please try again. (获取包裹信息错误，请重试)");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParcel((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.put(`http://localhost:3001/parcel/${parcel.id}`, parcel);
      setSuccess(true);
      setParcel(null);
      setTrackingCode("");
    } catch (err) {
      setError("Failed to update parcel. Please try again. (更新包裹失败，请重试)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-red-50 shadow-lg rounded-lg border-2 border-red-200">
      <h1 className="text-xl font-semibold mb-4 text-red-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Parcel (编辑包裹)
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">Parcel updated successfully! Please enter a new tracking code. (包裹更新成功！请输入新的追踪码)</p>}

      {!parcel ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="Enter Tracking Code (输入追踪码)"
            className="w-full p-2 border rounded mb-4 border-red-300 focus:border-red-500"
          />
          <button
            onClick={fetchParcel}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching... (搜索中...)
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search (搜索)
              </>
            )}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow-md">
          <input 
            type="text" 
            name="origin" 
            value={parcel.origin} 
            onChange={handleChange} 
            placeholder="Origin (始发地)" 
            className="w-full p-2 border rounded border-red-300 focus:border-red-500" 
            required 
          />
          <input 
            type="text" 
            name="destination" 
            value={parcel.destination} 
            onChange={handleChange} 
            placeholder="Destination (目的地)" 
            className="w-full p-2 border rounded border-red-300 focus:border-red-500" 
            required 
          />
          <input 
            type="text" 
            name="senderName" 
            value={parcel.senderName} 
            onChange={handleChange} 
            placeholder="Sender Name (发件人姓名)" 
            className="w-full p-2 border rounded border-red-300 focus:border-red-500" 
            required 
          />
          <input 
            type="text" 
            name="senderAddress" 
            value={parcel.senderAddress} 
            onChange={handleChange} 
            placeholder="Sender Address (发件人地址)" 
            className="w-full p-2 border rounded border-red-300 focus:border-red-500" 
            required 
          />
          <input 
            type="text" 
            name="recipientName" 
            value={parcel.recipientName} 
            onChange={handleChange} 
            placeholder="Recipient Name (收件人姓名)" 
            className="w-full p-2 border rounded border-red-300 focus:border-red-500" 
            required 
          />
          <input 
            type="text" 
            name="recipientAddress" 
            value={parcel.recipientAddress} 
            onChange={handleChange} 
            placeholder="Recipient Address (收件人地址)" 
            className="w-full p-2 border rounded border-red-300 focus:border-red-500" 
            required 
          />
          <input 
            type="text" 
            name="senderPhone" 
            value={parcel.senderPhone} 
            onChange={handleChange} 
            placeholder="Sender Phone (发件人电话)" 
            className="w-full p-2 border rounded border-red-300 focus:border-red-500" 
            required 
          />
          <input 
            type="text" 
            name="recipientPhone" 
            value={parcel.recipientPhone} 
            onChange={handleChange} 
            placeholder="Recipient Phone (收件人电话)" 
            className="w-full p-2 border rounded border-red-300 focus:border-red-500" 
            required 
          />
          <input 
            type="email" 
            name="email" 
            value={parcel.email} 
            onChange={handleChange} 
            placeholder="Email (电子邮件)" 
            className="w-full p-2 border rounded border-red-300 focus:border-red-500" 
            required 
          />
          <button 
            type="submit" 
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 flex items-center justify-center" 
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating... (更新中...)
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Update Parcel (更新包裹)
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}