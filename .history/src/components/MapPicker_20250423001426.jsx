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
  const [isOutsideQC, setIsOutsideQC] = useState(false); // Track if the current location is outside QC
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

        // Check if the current location is within the QC boundary
        const polygon = new window.google.maps.Polygon({
          paths: qcPolygonPaths,
        });

        const latLng = new window.google.maps.LatLng(coords.lat, coords.lng);

        const isWithinQC = window.google.maps.geometry.poly.containsLocation(
          latLng,
          polygon
        );

        setIsOutsideQC(!isWithinQC); // Update the flag
      },
      () => {
        const fallback = { lat: 14.676, lng: 121.0437 };
        setCurrentPosition(fallback);
        setMarkerPosition(fallback);
      }
    );
  }, [qcPolygonPaths]);

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

    // Check if the clicked location is within the QC boundary (Polygon)
    const polygon = new window.google.maps.Polygon({
      paths: qcPolygonPaths,
    });

    const latLng = new window.google.maps.LatLng(
      clickedLatLng.lat,
      clickedLatLng.lng
    );

    // Use the polygon containsLocation method to check if the click is within the boundary
    const isWithinQC = window.google.maps.geometry.poly.containsLocation(
      latLng,
      polygon
    );

    if (isWithinQC) {
      setMarkerPosition(clickedLatLng);
      onLocationSelect(clickedLatLng, "Quezon City");
      setIsOutsideQC(false); // Location inside QC
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
              url: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png", // Regular red pin
              scaledSize: new window.google.maps.Size(40, 70), // Scale the pin to be larger
              anchor: new window.google.maps.Point(20, 70), // Anchor the pin at the bottom
            }}
          />
        )}
      </GoogleMap>

      {/* Message if the current location is outside Quezon City */}
      {isOutsideQC && (
        <div
          style={{
            marginTop: "10px",
            color: "red",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Your current location is outside Quezon City. Please select a location
          within Quezon City.
        </div>
      )}

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
