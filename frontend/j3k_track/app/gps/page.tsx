'use client'
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

const Map = dynamic(() => import("../components/GoogleMap"), { ssr: false });

export default function Home() {
  const [location, setLocation] = useState(""); // Initialize location as empty string
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams(); // Hook สำหรับดึง query parameters
  const trackingCode = searchParams.get('trackingCode'); // ดึง trackingCode จาก URL

  // Function to fetch parcel data by tracking code
  const fetchParcelData = async (trackingCode) => {
    try {
      const response = await fetch(`http://localhost:3004/history/tracking/${trackingCode}`);
      if (!response.ok) {
        throw new Error('Parcel not found');
      }
      const data = await response.json();
      return data.parcel; // Assuming recipientAddress is in parcel data
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
        if (parcelData && parcelData.recipientAddress) { // Assuming recipientAddress field exists
          setLocation(parcelData.recipientAddress); // Set location to recipientAddress
        } else {
          console.log("Recipient address not found or parcel data fetch failed.");
          // Handle case where recipientAddress is not available
          window.alert("ไม่พบข้อมูลที่อยู่ปลายทางสำหรับพัสดุนี้"); // Display alert to user
          setLocation(""); // Set location to empty string
        }
      };
      getRecipientAddress();
    } else {
      // If no trackingCode, set location to empty string as default
      setLocation(""); // Default location as empty string if no trackingCode
    }
  }, [trackingCode]);


  // Fetch coordinates for a given location
  const getCoordinates = async (location) => {
    if (!location) return; // Exit if location is empty
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Use your actual Google Maps API key here
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${apiKey}`);
    const data = await response.json();
    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      setDestinationCoordinates({ lat, lng });
    } else {
      console.error("Error fetching coordinates:", data.status, data); // Log data for more details
      setDestinationCoordinates(null); // Clear destinationCoordinates if geocoding fails
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
    } else {
      setDestinationCoordinates(null); // Clear destinationCoordinates if location is empty
    }

    return () => navigator.geolocation.clearWatch(watchId);
  }, [location]); // Depend on location so it refetches coordinates when location changes

  // If role is "admin", send currentLocation to Map
  const sendCurrentLocation = session?.user?.role === "admin" ? currentLocation : null;

  return <Map destination={destinationCoordinates} currentLocation={sendCurrentLocation} />;
}