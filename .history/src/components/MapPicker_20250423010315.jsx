// components/MapPicker.jsx
import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);

  const { isLoaded } = useGoogleMaps();

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
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
