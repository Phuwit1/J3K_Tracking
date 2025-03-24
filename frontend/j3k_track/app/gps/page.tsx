'use client'
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from 'next-auth/react';

const Map = dynamic(() => import("../components/GoogleMap"), { ssr: false });

export default function Home() {
  const [location, setLocation] = useState("ห้างสรรพสินค้าพารากอน"); // Static destination
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const { data: session, status, update } = useSession();

  // Fetch coordinates for a given location
  const getCoordinates = async (location) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Use your actual Google Maps API key here
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${apiKey}`);
    const data = await response.json();
    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      setDestinationCoordinates({ lat, lng });
    } else {
      console.error("Error fetching coordinates:", data.status);
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

    // Get coordinates for the location (e.g., "Bangkok")
    if (location) {
      getCoordinates(location);
    }

    return () => navigator.geolocation.clearWatch(watchId);
  }, [location]);

  // If role is "admin", send currentLocation to Map
  const sendCurrentLocation = session?.user?.role === "admin" ? currentLocation : null;

  return <Map destination={destinationCoordinates} currentLocation={sendCurrentLocation} />;
}
