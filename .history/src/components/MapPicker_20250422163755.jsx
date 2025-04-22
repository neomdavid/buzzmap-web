import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polygon,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Rough coordinates for Quezon City boundary (sample)
const quezonCityPolygon = [
  { lat: 14.7538, lng: 121.0426 },
  { lat: 14.7272, lng: 121.0906 },
  { lat: 14.6952, lng: 121.1191 },
  { lat: 14.6385, lng: 121.1019 },
  { lat: 14.6146, lng: 121.0563 },
  { lat: 14.6265, lng: 120.9901 },
  { lat: 14.6781, lng: 120.9938 },
  { lat: 14.7284, lng: 121.0093 },
];

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "geometry", "maps"],
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
      },
      () => {
        // Fallback center
        const fallback = { lat: 14.676, lng: 121.0437 };
        setCurrentPosition(fallback);
        setMarkerPosition(fallback);
      }
    );
  }, []);

  const handleMapClick = (e) => {
    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    const isWithinQC = window.google.maps.geometry.poly.containsLocation(
      new window.google.maps.LatLng(clickedLatLng.lat, clickedLatLng.lng),
      new window.google.maps.Polygon({ paths: quezonCityPolygon })
    );

    if (!isWithinQC) {
      alert("Please select a location within Quezon City.");
      return;
    }

    setMarkerPosition(clickedLatLng);
    onLocationSelect(clickedLatLng, "Quezon City");
  };

  return isLoaded && currentPosition ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition}
      zoom={13}
      onClick={handleMapClick}
    >
      {markerPosition && <Marker position={markerPosition} />}
      <Polygon
        paths={quezonCityPolygon}
        options={{
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.1,
        }}
      />
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
