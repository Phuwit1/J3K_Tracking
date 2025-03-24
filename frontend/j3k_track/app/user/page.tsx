"use client";

import React, { useState } from "react";

export default function FindParcel() {
    const [trackingCode, setTrackingCode] = useState("");
    const [parcelData, setParcelData] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        setError(null);
        setParcelData(null);
        try {
            const response = await fetch(`http://localhost:3004/history/tracking/${trackingCode}`);
            if (!response.ok) {
                throw new Error("ไม่พบข้อมูลพัสดุ");
            }
            const data = await response.json();
            setParcelData(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">ตรวจสอบพัสดุ</h1>
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <input
                    type="text"
                    placeholder="กรอกหมายเลขพัสดุ"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                    onClick={handleSearch}
                    className="w-full mt-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                >
                    ค้นหา
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {parcelData && (
                    <div className="mt-4 p-3 bg-gray-200 rounded-md">
                        <p><strong>สถานะ:</strong> {parcelData.status}</p>
                        <p><strong>ตำแหน่งล่าสุด:</strong> {parcelData.location}</p>
                        <p><strong>วันที่อัปเดตล่าสุด:</strong> {parcelData.lastUpdated}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
