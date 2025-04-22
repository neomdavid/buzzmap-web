import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import * as turf from "@turf/turf";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null); // GeoJSON data for barangays

  const { isLoaded } = useGoogleMaps();

  // Fetch the GeoJSON file from public folder (useEffect only runs once)
  useEffect(() => {
    fetch("/quezon_barangays_boundaries.geojson")
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data))
      .catch((error) => console.error("Failed to load GeoJSON", error));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentPosition(coords);
        setMarkerPosition(coords);
        fetchBarangay(coords); // Fill default barangay
      },
      () => alert("Failed to get current position")
    );
  }, []);

  const handleMapClick = (e) => {
    const coords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarkerPosition(coords);
    fetchBarangay(coords);
  };

  const fetchBarangay = (coords) => {
    if (geoJsonData) {
      const point = turf.point([coords.lng, coords.lat]);

      // Loop through each barangay and check if the point is inside the boundary
      for (let feature of geoJsonData.features) {
        const polygon = turf.polygon(feature.geometry.coordinates);
        if (turf.booleanPointInPolygon(point, polygon)) {
          const barangayName = feature.properties.name; // Assuming the barangay name is stored in 'properties'
          onLocationSelect(coords, barangayName);
          console.log("Barangay selected:", barangayName);
          return;
        }
      }
      alert("This location is outside Quezon City boundaries.");
    }
  };

  return isLoaded && currentPosition ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition}
      zoom={16}
      onClick={handleMapClick}
    >
      {markerPosition && <Marker position={markerPosition} />}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
