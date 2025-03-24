import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const GoogleMapComponent = ({ destination, currentLocation }) => {
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    if (currentLocation && destination) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: currentLocation,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error("Error fetching directions", result);
          }
        }
      );
    }
  }, [currentLocation, destination]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={mapContainerStyle} center={destination} zoom={14}>
        {/* หมุดตำแหน่งคงที่ */}
        <Marker position={destination} label="📍" />

        {/* หมุดตำแหน่งปัจจุบัน */}
        {currentLocation && <Marker position={currentLocation} label="🚚" />}

        {/* แสดงเส้นทาง */}
        {/* {directions && <DirectionsRenderer directions={directions} />} */}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
