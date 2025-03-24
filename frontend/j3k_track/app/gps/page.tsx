'use client'
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("../components/GoogleMap"), { ssr: false });

export default function Home() {
  const [location, setLocation] = useState({ lat: 13.7563, lng: 100.5018 }); // จุดหมายปลายทางคงที่
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
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

  return <Map destination={location} currentLocation={currentLocation} />;
}
