import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Polygon,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const mapRef = useRef(null);

  // Initialize the Google Maps API loader
  const { isLoaded } = useGoogleMaps();

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
    console.log("Map clicked:", clickedLatLng); // Add this

    if (isLoaded && qcPolygonPaths.length > 0) {
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
    }
  };

  // Store map reference when map is loaded
  const onLoad = (map) => {
    console.log("Map loaded");
    mapRef.current = map;
  };

  return isLoaded && currentPosition && qcPolygonPaths.length > 0 ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={onLoad}
        mapId="82d912d6b8b4c779 " // <-- your new Map ID here
      >
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
        {markerPosition && (
          <Marker position={markerPosition} title="Selected Location" />
        )}
      </GoogleMap>
      {markerPosition && (
        <div style={{ marginTop: "10px" }}>
          Selected location: {markerPosition.lat.toFixed(6)},{" "}
          {markerPosition.lng.toFixed(6)}
        </div>
      )}
    </>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
