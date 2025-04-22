import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  // Define the bounding box for Quezon City
  const QC_BOUNDS = {
    north: 14.7406, // Northernmost point of QC
    south: 14.4795, // Southernmost point of QC
    east: 121.1535, // Easternmost point of QC
    west: 121.022, // Westernmost point of QC
  };

  // Get the user's current location
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
        const fallback = { lat: 14.676, lng: 121.0437 };
        setCurrentPosition(fallback);
        setMarkerPosition(fallback);
      }
    );
  }, []);

  // Handle map click event to restrict location to Quezon City
  const handleMapClick = (e) => {
    if (!isLoaded) {
      console.warn("Maps API not loaded");
      return;
    }

    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    // Check if the clicked location is within the QC bounding box
    if (
      clickedLatLng.lat >= QC_BOUNDS.south &&
      clickedLatLng.lat <= QC_BOUNDS.north &&
      clickedLatLng.lng >= QC_BOUNDS.west &&
      clickedLatLng.lng <= QC_BOUNDS.east
    ) {
      setMarkerPosition(clickedLatLng);
      onLocationSelect(clickedLatLng, "Quezon City");
    } else {
      alert("Please select a location within Quezon City");
    }
  };

  return isLoaded && currentPosition ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(map) => (mapRef.current = map)}
        mapId="82d912d6b8b4c779"
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            title="Selected Location"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "white",
            }}
          />
        )}
      </GoogleMap>
      {markerPosition && (
        <div style={{ marginTop: "10px" }}>
          Selected: {markerPosition.lat.toFixed(6)},{" "}
          {markerPosition.lng.toFixed(6)}
        </div>
      )}
    </>
  ) : (
    <p>Loading map data...</p>
  );
};

export default MapPicker;
