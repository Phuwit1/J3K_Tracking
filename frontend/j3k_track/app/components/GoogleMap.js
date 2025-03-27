import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const GoogleMapComponent = ({ destination, currentLocation }) => {

  useEffect(() => {
    
  }, [currentLocation, destination]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={mapContainerStyle} center={destination} zoom={14}>
        {/* หมุดตำแหน่งคงที่ */}
        <Marker position={destination} label="📍" />

        {/* หมุดตำแหน่งปัจจุบัน */}
        {currentLocation && <Marker position={currentLocation} label="🚚" />}

      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
