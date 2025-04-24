import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Polygon, Rectangle, Marker } from "@react-google-maps/api";

// Container style for the map
const containerStyle = {
  width: "100%",
  height: "100%",
};

// Quezon City bounding box coordinates
const QC_BOUNDS = {
  north: 14.7406,
  south: 14.4795,
  east: 121.1535,
  west: 121.022,
};

// Dummy data for risk levels in barangays (for illustration purposes)
const barangayRiskData = [
  { name: "Barangay 1", lat: 14.6, lng: 121.05, risk: "high" },
  { name: "Barangay 2", lat: 14.65, lng: 121.08, risk: "medium" },
  { name: "Barangay 3", lat: 14.7, lng: 121.1, risk: "low" },
];

const DengueMap = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null); // Track selected pin
  const mapRef = useRef(null);

  useEffect(() => {
    // Fetch QC polygon boundaries (assuming this file exists in the public directory)
    fetch("/quezon_city_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
      });

    // Default location centered on Quezon City
    const fallback = { lat: 14.676, lng: 121.0437 };
    setCurrentPosition(fallback);
  }, []);

  const handleMarkerDragEnd = (e) => {
    const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setSelectedPin(newPosition); // Update the position of the pin when dragged
  };

  if (!currentPosition) return <p>Loading map...</p>;

  return (
    <div className="w-full z-[10] h-[68vh] rounded-md shadow-md relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={13}
        options={{
          gestureHandling: "auto", // Allow map interaction
          draggable: true, // Enable dragging
          scrollwheel: true, // Enable zooming with scroll
        }}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/* Quezon City polygon */}
        <Polygon
          paths={qcPolygonPaths}
          options={{
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.05,
          }}
        />

        {/* Quezon City rectangle bounds */}
        <Rectangle
          bounds={QC_BOUNDS}
          options={{
            fillOpacity: 0,
            strokeWeight: 0,
            clickable: false,
            zIndex: 2,
          }}
        />

        {/* Markers for the barangays with different risk levels */}
        {barangayRiskData.map((barangay, index) => (
          <Marker
            key={index}
            position={{ lat: barangay.lat, lng: barangay.lng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor:
                barangay.risk === "high"
                  ? "#FF0000"
                  : barangay.risk === "medium"
                  ? "#FFA500"
                  : "#008000",
              fillOpacity: 1,
              strokeWeight: 0,
            }}
            title={barangay.name}
          />
        ))}

        {/* Marker for the current user's position */}
        <Marker
          position={currentPosition}
          draggable
          onDragEnd={handleMarkerDragEnd}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#0000FF",
            fillOpacity: 1,
            strokeWeight: 0,
          }}
        />
      </GoogleMap>
    </div>
  );
};

export default DengueMap;
