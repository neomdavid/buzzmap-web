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

// Move the libraries array outside the component for performance
const googleMapLibraries = ["geometry"];

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);

  // Initialize the Google Maps API loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: googleMapLibraries, // Using the static library array
  });

  // Load Quezon City polygon coordinates
  useEffect(() => {
    fetch("/quezon_city_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
      });
  }, []);

  // Get the user's current location
  useEffect(() => {
    const handlePosition = (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentPosition(coords);
      setMarkerPosition(coords);
    };

    const handleError = () => {
      // Default location fallback if user denies permission
      const fallback = { lat: 14.676, lng: 121.0437 };
      setCurrentPosition(fallback);
      setMarkerPosition(fallback);
    };

    navigator.geolocation.getCurrentPosition(handlePosition, handleError);
  }, []);

  // Handle map click event and check if location is inside Quezon City
  const handleMapClick = (e) => {
    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    const polygon = new window.google.maps.Polygon({ paths: qcPolygonPaths });
    const isWithinQC = window.google.maps.geometry.poly.containsLocation(
      new window.google.maps.LatLng(clickedLatLng.lat, clickedLatLng.lng),
      polygon
    );

    if (!isWithinQC) {
      alert("Please select a location within Quezon City.");
      return;
    }

    setMarkerPosition(clickedLatLng);
    onLocationSelect(clickedLatLng, "Quezon City");
  };

  // Return the map if it is loaded and all necessary data is available
  return isLoaded && currentPosition && qcPolygonPaths.length > 0 ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition}
      zoom={13}
      onClick={handleMapClick}
    >
      {markerPosition && <Marker position={markerPosition} />}
      <Polygon
        paths={qcPolygonPaths}
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
