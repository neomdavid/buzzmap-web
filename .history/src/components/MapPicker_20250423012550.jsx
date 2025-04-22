import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, Polygon } from "@react-google-maps/api";
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
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]); // Quezon City boundary
  const [isOutsideQC, setIsOutsideQC] = useState(false); // Whether the location is outside QC
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  // Load boundaries and verify data
  useEffect(() => {
    // Load the GeoJSON file for barangays
    fetch("/quezon_barangays_boundaries.geojson")
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data))
      .catch((error) => console.error("Failed to load GeoJSON", error));

    // Load the GeoJSON for Quezon City boundaries
    fetch("/quezon_city_boundaries.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch boundaries");
        return res.json();
      })
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
      })
      .catch((error) => console.error("Boundary loading error:", error));

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentPosition(coords);
        setMarkerPosition(coords);
        checkIfInsideQC(coords);
      },
      () => {
        const fallback = { lat: 14.676, lng: 121.0437 }; // Fallback to a default location
        setCurrentPosition(fallback);
        setMarkerPosition(fallback);
        setIsOutsideQC(true); // Default to outside QC if location is unavailable
      }
    );
  }, []);

  // Function to check if the point is inside Quezon City boundary
  const checkIfInsideQC = (coords) => {
    if (window.google && window.google.maps) {
      const polygon = new window.google.maps.Polygon({
        paths: qcPolygonPaths,
      });

      const latLng = new window.google.maps.LatLng(coords.lat, coords.lng);
      const isWithinQC = window.google.maps.geometry.poly.containsLocation(
        latLng,
        polygon
      );

      if (isWithinQC) {
        setIsOutsideQC(false);
      } else {
        setIsOutsideQC(true);
      }
    } else {
      console.error("Google Maps API not loaded.");
    }
  };

  // Handle map click event
  const handleMapClick = (e) => {
    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    // Check if the clicked location is within the QC boundary
    checkIfInsideQC(clickedLatLng);

    // Update marker position
    setMarkerPosition(clickedLatLng);

    // Call the function to fetch barangay name based on clicked location
    fetchBarangay(clickedLatLng);
  };

  const fetchBarangay = (coords) => {
    if (geoJsonData) {
      const point = turf.point([coords.lng, coords.lat]);

      // Loop through each barangay and check if the point is inside the boundary
      for (let feature of geoJsonData.features) {
        const geometry = feature.geometry;
        if (geometry && geometry.type === "Polygon") {
          let coordinates = geometry.coordinates[0];
          if (
            (coordinates &&
              coordinates[0][0] !== coordinates[coordinates.length - 1][0]) ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1]
          ) {
            coordinates.push(coordinates[0]);
          }

          const polygon = turf.polygon([coordinates]);
          if (turf.booleanPointInPolygon(point, polygon)) {
            const barangayName = feature.properties.name;
            onLocationSelect(coords, barangayName);
            console.log("Barangay selected:", barangayName);
            return;
          }
        } else if (geometry && geometry.type === "MultiPolygon") {
          for (let coordsArray of geometry.coordinates) {
            let coordinates = coordsArray[0];
            if (
              (coordinates &&
                coordinates[0][0] !== coordinates[coordinates.length - 1][0]) ||
              coordinates[0][1] !== coordinates[coordinates.length - 1][1]
            ) {
              coordinates.push(coordinates[0]);
            }

            const polygon = turf.polygon([coordinates]);
            if (turf.booleanPointInPolygon(point, polygon)) {
              const barangayName = feature.properties.name;
              onLocationSelect(coords, barangayName);
              console.log("Barangay selected:", barangayName);
              return;
            }
          }
        }
      }
      alert("This location is outside Quezon City boundaries.");
    }
  };

  return isLoaded && currentPosition && qcPolygonPaths.length ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={16}
        onClick={handleMapClick}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/* Display Quezon City boundary polygon */}
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

        {/* Marker for selected location */}
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>

      {/* Message if outside QC */}
      {isOutsideQC && (
        <div style={{ color: "red", marginTop: "10px" }}>
          Your current location is outside Quezon City. Please select a location
          within Quezon City.
        </div>
      )}
    </>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
