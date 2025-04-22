import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Polygon, Marker } from "@react-google-maps/api";
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

  const handleMapClick = (e) => {
    console.log("--- New Map Click ---");

    // Basic click verification
    console.log("Raw click coordinates:", e.latLng.toString());

    if (!isLoaded) {
      console.warn("Maps API not loaded");
      return;
    }

    if (!qcPolygonPaths.length) {
      console.warn("QC boundaries not loaded");
      return;
    }

    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    try {
      console.log(
        "Creating polygon with paths:",
        qcPolygonPaths.slice(0, 3),
        "..."
      );
      const polygon = new window.google.maps.Polygon({ paths: qcPolygonPaths });

      console.log("Testing point:", clickedLatLng);
      const latLng = new window.google.maps.LatLng(
        clickedLatLng.lat,
        clickedLatLng.lng
      );
      const isWithinQC = window.google.maps.geometry.poly.containsLocation(
        latLng,
        polygon
      );

      console.log("Contains location result:", isWithinQC);

      if (isWithinQC) {
        console.log("Valid QC location - placing marker");
        setMarkerPosition(clickedLatLng);
        onLocationSelect(clickedLatLng, "Quezon City");
      } else {
        console.log("Outside QC boundaries");
        alert("Please select within Quezon City");
      }
    } catch (error) {
      console.error("Polygon check failed:", error);
      alert("Boundary check error - please try again");
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
        options={{
          disableDoubleClickZoom: true, // Prevent double-click zooming
        }}
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
