import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polygon,
  useJsApiLoader,
} from "@react-google-maps/api";

// Define the coordinates for Quezon City's boundary
const QC_BOUNDS = [
  { lat: 14.8, lng: 121.0 },
  { lat: 14.8, lng: 121.2 },
  { lat: 14.5, lng: 121.2 },
  { lat: 14.5, lng: 121.0 },
  { lat: 14.8, lng: 121.0 },
];

// Container style for the map
const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Add this in your .env
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentPosition(coords);
        setMarkerPosition(coords);
        fetchBarangay(coords); // Fill default barangay
      },
      () => alert("Failed to get current position")
    );
  }, []);

  const handleMapClick = (e) => {
    const coords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarkerPosition(coords);
    fetchBarangay(coords);
  };

  const fetchBarangay = async (coords) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${
        coords.lng
      }&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    const barangayComponent = data.results[0]?.address_components.find(
      (comp) =>
        comp.types.includes("sublocality") || comp.types.includes("political")
    );
    if (barangayComponent) {
      onLocationSelect(coords, barangayComponent.long_name);
    }
  };

  return isLoaded && currentPosition ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition}
      zoom={16}
      onClick={handleMapClick}
    >
      {markerPosition && <Marker position={markerPosition} />}

      {/* Draw the QC boundary as a polygon */}
      <Polygon
        paths={QC_BOUNDS}
        options={{
          strokeColor: "#FF0000", // Red border for the boundary
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000", // Red fill for the boundary area
          fillOpacity: 0.1, // Transparent fill
        }}
      />
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
