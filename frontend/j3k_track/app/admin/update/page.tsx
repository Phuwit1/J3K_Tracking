"use client";
import { useState } from "react";
import Card from "../../components/update/card";
import Input from "../../components/update/input";
import Select from "../../components/update/select";
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
      if (!response.ok) throw new Error("Parcel information not found (未找到包裹信息)");
      if (parceldata.length === 0) {
        throw new Error("Parcel information not found (未找到包裹信息)");
      }

      setParcel(parceldata[0]);

      const response2 = await fetch(`http://localhost:3002/parcel-status/${parceldata[0].id}`);
      const statusdata2: ParcelStatus = await response2.json();
      console.log("Status: " + statusdata2.status);
      setStatus(statusdata2.status);

    } catch (error) {
      setParcel(null);
      alert(error.message);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      if (!parcel || !parcel.trackingCode) {
        alert("Please search for parcel information before updating status (请先搜索包裹信息再更新状态)");
        return;
      }

      const response = await fetch(`http://localhost:3002/parcel-status/${parcel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Status update failed (状态更新失败)");

      const getDescription = (status) => {
        switch (status) {
          case "PENDING":
            return "Your parcel is being prepared for shipping (您的包裹正在准备发货)";
          case "IN_TRANSIT":
            return "Parcel is in transit (包裹正在运输中)";
          case "OUT_FOR_DELIVERY":
            return "Parcel is out for delivery (包裹即将送达)";
          case "DELIVERED":
            return "Parcel has been successfully delivered (包裹已成功送达)";
          case "EXCEPTION":
            return "An issue occurred during shipping, please contact customer service (发货过程中遇到问题，请联系客户服务)";
          default:
            return "Unknown status, please check again (未知状态，请再次检查)";
        }
      };

      const responseHistory = await fetch(`http://localhost:3004/history/parcel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId: parcel.id,
          status: status,
          location: note,
          description: getDescription(status),
        }),
      });

      if (!responseHistory.ok) {
        console.error("Failed to record history (记录历史失败)");
      }

      alert("Status updated successfully (状态更新成功)");
    } catch (error) {
      console.error("❌ Server Error (服务器错误):", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-red-50">
      <Card className="shadow-xl border-2 border-red-300">
        <h2 className="text-center text-lg font-semibold mb-4 text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          J3k Parcel Status Update (包裹状态更新)
        </h2>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter Tracking Number (输入包裹追踪号)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="border-red-300 focus:border-red-500"
          />
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white flex items-center" 
            onClick={handleSearch}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search (搜索)
          </Button>
        </div>

        {parcel && (
          <Card className="bg-white border-red-200 border-2">
            <div className="space-y-2">
              <p className="text-sm text-gray-700"><strong>Parcel Number (包裹号):</strong> {parcel.id}</p>
              <p className="text-sm text-gray-700"><strong>Sender (发件人):</strong> {parcel.senderName}</p>
              <p className="text-sm text-gray-700"><strong>Recipient (收件人):</strong> {parcel.recipientName}</p>
              <p className="text-sm text-gray-700"><strong>Current Status (当前状态):</strong> {status || "Status Not Found (未找到状态)"}</p>
            </div>
            
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(String(value))} 
              className="mt-4 border-red-300"
            >
              <SelectItem value="PENDING">Pending (待处理)</SelectItem>
              <SelectItem value="DELIVERED">Delivered (已送达)</SelectItem>
              <SelectItem value="IN_TRANSIT">In Transit (运输中)</SelectItem>
              <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery (即将送达)</SelectItem>
              <SelectItem value="EXCEPTION">Exception (异常)</SelectItem>
            </Select>
            
            <Textarea
              placeholder="Enter Location Notes (输入位置备注)"
              value={note}
              onChange={(e:any) => setNote(e.target.value)}
              className="mt-4 border-red-300 focus:border-red-500"
            />
            
            <Button 
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center" 
              onClick={handleUpdateStatus}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update Status (更新状态)
            </Button>
          </Card>
        )}
      </Card>
    </div>
  );
}