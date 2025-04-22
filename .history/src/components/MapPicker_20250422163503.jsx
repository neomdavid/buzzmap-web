import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, Polygon } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);

  // Load Quezon City polygon boundary
  useEffect(() => {
    fetch("../geojson/quezon_city_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
      });
  }, []);

  // Get user location or fallback
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
        const fallback = { lat: 14.676, lng: 121.0437 }; // QC fallback
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
      new window.google.maps.Polygon({ paths: qcPolygonPaths })
    );

    if (!isWithinQC) {
      alert("Please select a location within Quezon City.");
      return;
    }

    setMarkerPosition(clickedLatLng);
    onLocationSelect(clickedLatLng, "Quezon City");
  };

  return currentPosition && qcPolygonPaths.length > 0 ? (
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
