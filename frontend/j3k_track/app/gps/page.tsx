'use client'
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from 'next-auth/react'

const Map = dynamic(() => import("../components/GoogleMap"), { ssr: false });

export default function Home() {
  const [location, setLocation] = useState({ lat: 13.7563, lng: 100.5018 }); // จุดหมายปลายทางคงที่
  const [currentLocation, setCurrentLocation] = useState(null);
  const { data: session, status, update } = useSession()

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
    //   console.log("Session:", session);
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

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  console.log(session)
  // ถ้า role เป็น "admin" ให้ส่ง currentLocation ไปให้ Map
  const sendCurrentLocation = session?.user?.role === "admin" ? currentLocation : null;

  return <Map destination={location} currentLocation={sendCurrentLocation} />;
}
