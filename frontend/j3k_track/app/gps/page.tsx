'use client'
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

const Map = dynamic(() => import("../components/GoogleMap"), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[500px] bg-red-50 border-4 border-red-600 rounded-xl">
      <div className="text-center">
        <span className="text-4xl">🗺️</span>
        <p className="text-xl text-red-600 font-bold mt-4">Loading Map 加载地图...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const [location, setLocation] = useState(""); 
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get('trackingCode');

  // Function to fetch parcel data by tracking code
  const fetchParcelData = async (trackingCode) => {
    try {
      const response = await fetch(`http://localhost:3004/history/tracking/${trackingCode}`);
      if (!response.ok) {
        throw new Error('Parcel not found');
      }
      const data = await response.json();
      return data.parcel;
    } catch (error) {
      console.error("Error fetching parcel data:", error);
      return null;
    }
  };

  // Fetch recipientAddress based on trackingCode when trackingCode changes
  useEffect(() => {
    if (trackingCode) {
      const getRecipientAddress = async () => {
        const parcelData = await fetchParcelData(trackingCode);
        if (parcelData && parcelData.recipientAddress) {
          setLocation(parcelData.recipientAddress);
        } else {
          console.log("Recipient address not found or parcel data fetch failed.");
          window.alert("ไม่พบข้อมูลที่อยู่ปลายทางสำหรับพัสดุนี้");
          setLocation("");
        }
      };
      getRecipientAddress();
    } else {
      setLocation("");
    }
  }, [trackingCode]);

  // Fetch coordinates for a given location
  const getCoordinates = async (location) => {
    if (!location) return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${apiKey}`);
    const data = await response.json();
    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      setDestinationCoordinates({ lat, lng });
    } else {
      console.error("Error fetching coordinates:", data.status, data);
      setDestinationCoordinates(null);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data) {
          await update();
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    if (location) {
      getCoordinates(location);
    } else {
      setDestinationCoordinates(null);
    }

    return () => navigator.geolocation.clearWatch(watchId);
  }, [location]);

  // Prepare page details
  const pageTitle = trackingCode 
    ? `Tracking Parcel: ${trackingCode}` 
    : 'Parcel Tracking GPS';

  return (
    <div 
      className="max-w-4xl mx-auto p-6 bg-red-50 border-4 border-red-600 rounded-xl shadow-2xl"
      style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23FF0000\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\'/%3E%3C/g%3E%3C/svg%3E")',
      }}
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-red-600 flex items-center justify-center">
          🗺️ {pageTitle} 包裹追踪GPS
        </h1>
        {location && (
          <p className="text-lg text-gray-700 mt-2">
            📍 Destination: {location} | 目的地: {location}
          </p>
        )}
      </div>

      <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border-2 border-red-600">
        <Map 
          destination={destinationCoordinates} 
          currentLocation={session?.user?.role === "admin" ? currentLocation : null} 
        />
      </div>

      {/* Additional Information Section */}
      <div className="mt-6 bg-white border border-red-300 rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          🚚 Tracking Details | 追踪详情
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-gray-700">
              🏷️ Tracking Code | 追踪号码
            </p>
            <p className="text-red-600">{trackingCode || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">
              📍 Current Status | 当前状态
            </p>
            <p className="text-green-600">En Route | 运输中</p>
          </div>
        </div>
      </div>
    </div>
  );
}