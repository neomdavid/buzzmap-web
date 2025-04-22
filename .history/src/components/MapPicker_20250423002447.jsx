import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px",
};

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [barangay, setBarangay] = useState("");
  const [isLocationPinned, setIsLocationPinned] = useState(false); // Track if the location is pinned

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
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
        fetchBarangay(coords); // Auto fill on load
      },
      () => alert("Failed to get current location")
    );
  }, []);

  const handleMapClick = (e) => {
    const coords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarkerPosition(coords);
    fetchBarangay(coords);
    setIsLocationPinned(true); // Set location as pinned
  };

  const fetchBarangay = async (coords) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${
        coords.lng
      }&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    const result = data.results[0];
    const barangayComponent = result?.address_components.find(
      (comp) =>
        comp.types.includes("sublocality") || comp.types.includes("political")
    );
    if (barangayComponent) {
      setBarangay(barangayComponent.long_name); // Set barangay name
      onLocationSelect(coords, barangayComponent.long_name); // Pass location and barangay to the parent
    } else {
      setBarangay("Barangay not found"); // Handle case where barangay is not found
    }
  };

  return isLoaded && currentPosition ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={16}
        onClick={handleMapClick}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>

      {/* Input fields disabled if location is pinned */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={barangay}
          disabled={isLocationPinned}
          placeholder="Barangay"
        />
        <input
          type="text"
          disabled={isLocationPinned}
          placeholder="Other info"
        />
      </div>

      {barangay && (
        <div style={{ marginTop: "10px" }}>
          Selected Barangay: <strong>{barangay}</strong>
        </div>
      )}
    </>
  ) : (
    <p className="text-center">Loading map...</p>
  );
};

export default MapPicker;
