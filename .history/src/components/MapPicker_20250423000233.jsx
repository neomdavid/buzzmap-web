import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, Rectangle } from "@react-google-maps/api";
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

  // Define QC boundaries with LatLngBounds
  const qcBounds = {
    north: 14.739, // Northern boundary
    south: 14.551, // Southern boundary
    east: 121.075, // Eastern boundary
    west: 121.009, // Western boundary
  };

  // Get user location
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

  const handleMapClick = (e) => {
    console.log("--- New Map Click ---");

    // Basic click verification
    console.log("Raw click coordinates:", e.latLng.toString());

    if (!isLoaded) {
      console.warn("Maps API not loaded");
      return;
    }

    if (!qcBounds) {
      console.warn("QC bounds not loaded");
      return;
    }

    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    // Check if the clicked point is within QC bounds
    if (
      clickedLatLng.lat >= qcBounds.south &&
      clickedLatLng.lat <= qcBounds.north &&
      clickedLatLng.lng >= qcBounds.west &&
      clickedLatLng.lng <= qcBounds.east
    ) {
      console.log("Valid QC location - placing marker");
      setMarkerPosition(clickedLatLng);
      onLocationSelect(clickedLatLng, "Quezon City");
    } else {
      console.log("Outside QC boundaries");
      alert("Please select within Quezon City");
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
        {/* Rectangle to highlight QC area */}
        <Rectangle
          bounds={qcBounds}
          options={{
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.1,
          }}
        />
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
