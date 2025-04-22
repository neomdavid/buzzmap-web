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

  // Define QC boundaries (approximate rough bounding box)
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

    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    console.log("Clicked Coordinates:", clickedLatLng);

    // Check if the clicked point is within QC rough bounding box
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
