import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Polygon, Marker, Rectangle } from "@react-google-maps/api";
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
  const { isLoaded } = useGoogleMaps();

  // Load boundaries and verify data
  useEffect(() => {
    fetch("/quezon_city_boundaries.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch boundaries");
        return res.json();
      })
      .then((data) => {
        if (!data.features?.[0]?.geometry?.coordinates) {
          throw new Error("Invalid GeoJSON structure");
        }
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        console.log("Loaded QC coordinates:", coords);
        setQcPolygonPaths(coords);
      })
      .catch((error) => console.error("Boundary loading error:", error));
  }, []);

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

  // Handle map click event
  const handleMapClick = (e) => {
    if (!isLoaded) {
      console.warn("Maps API not loaded");
      return;
    }

    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    // Check if the clicked location is within the QC boundary
    if (
      clickedLatLng.lat >= 14.4795 &&
      clickedLatLng.lat <= 14.7406 &&
      clickedLatLng.lng >= 121.022 &&
      clickedLatLng.lng <= 121.1535
    ) {
      setMarkerPosition(clickedLatLng);
      onLocationSelect(clickedLatLng, "Quezon City");
    } else {
      alert("Please select a location within Quezon City");
    }
  };

  return isLoaded && currentPosition && qcPolygonPaths.length ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(map) => (mapRef.current = map)}
        mapId="82d912d6b8b4c779"
      >
        {/* Polygon for Quezon City boundary */}
        <Polygon
          paths={qcPolygonPaths}
          options={{
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.1,
            zIndex: 1, // Polygon beneath the clickable layer
          }}
        />

        {/* Invisible Rectangle for handling clicks on the map */}
        <Rectangle
          bounds={{
            north: 14.7406,
            south: 14.4795,
            east: 121.1535,
            west: 121.022,
          }}
          options={{
            fillColor: "#FFFFFF",
            fillOpacity: 0, // Fully transparent
            strokeWeight: 0, // No visible border
            clickable: true, // Make sure it's clickable
            zIndex: 2, // Ensure it sits on top of the polygon
          }}
          onClick={handleMapClick} // Handle click event on the invisible rectangle
        />

        {/* Marker for selected location */}
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
