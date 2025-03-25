"use client";
import { useState } from "react";
import Card from "../../components/update/card";
import Input  from "../../components/update/input";
import Select  from "../../components/update/select";
import SelectItem from "../../components/update/select-item";
import Textarea from "../../components/update/textarea";
import Button from "../../components/update/button";


interface Parcel {
    id: string;
    senderName: string;
    recipientName: string;
    trackingCode: string;
  }

  interface ParcelStatus {
    status: string;
  }
  

export default function UpdateStatus() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:3001/parcel?trackingCode=${trackingNumber}`);
      const parceldata = await response.json();
      if (!response.ok) throw new Error("ไม่พบข้อมูลพัสดุ");


      const response2 = await fetch(`http://localhost:3002/parcel-status/${parceldata[0].id}`);
      
      if (parceldata.length === 0) {
        throw new Error("ไม่พบข้อมูลพัสดุ");
      }
      const statusdata2: ParcelStatus = await response2.json();

      console.log("STATUS : " + statusdata2.status);

      setStatus(statusdata2.status);
      setParcel(parceldata[0]);
    } catch (error) {
      setParcel(null);
      alert(error.message);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      // ตรวจสอบว่ามีข้อมูลพัสดุก่อน
      if (!parcel || !parcel.trackingCode) {
        alert("กรุณาค้นหาข้อมูลพัสดุก่อนอัปเดตสถานะ");
        return;
      }
      
      // บันทึกสถานะใหม่
      const response = await fetch(`http://localhost:3002/parcel-status/${parcel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

    console.log("Parcel data before update:", parcel);
    console.log("trackingCode value:", parcel.trackingCode);
    
    const trackingCodeToUse = parcel.trackingCode || trackingNumber;

    if (!trackingCodeToUse) {
        alert("ไม่พบรหัสติดตามพัสดุ");
        return;
    }
      
      if (!response.ok) throw new Error("อัปเดตสถานะไม่สำเร็จ");
      
      const responsehistory = await fetch(`http://localhost:3004/history/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingCode: trackingCodeToUse,
          status: status,
          location: "Bangdick",
          description: "GANGBANG"
        }),
      });
      
      if (!responsehistory.ok) {
        console.error("บันทึกประวัติไม่สำเร็จ");
      }
      
      alert("อัปเดตสถานะสำเร็จ");
    } catch (error) {
      alert("Error");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <Card>
        <h2 className="text-center text-lg font-semibold mb-4">อัปเดตสถานะพัสดุ</h2>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="กรอกหมายเลขพัสดุ"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleSearch}>ค้นหา</Button>
        </div>

        {parcel && (
          <Card>
            <p className="text-sm"><strong>หมายเลขพัสดุ:</strong> {parcel.id}</p>
            <p className="text-sm"><strong>ผู้ส่ง:</strong> {parcel.senderName}</p>
            <p className="text-sm"><strong>ผู้รับ:</strong> {parcel.recipientName}</p>
            <p className="text-sm"><strong>สถานะปัจจุบัน:</strong> {status || "ไม่พบสถานะ" }</p>
            <Select value={status} onValueChange={(value) => setStatus(String(value))} className="mt-4">
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="DELIVERED">DELIVERED</SelectItem>
              <SelectItem value="IN_TRANSIT">IN_TRANSIT</SelectItem>
              <SelectItem value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</SelectItem>
              <SelectItem value="EXCEPTION">EXCEPTION</SelectItem>
            </Select>
            <Button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={handleUpdateStatus}>
              บันทึกสถานะ
            </Button>
          </Card>
        )}
      </Card>
    </div>
  );
}
