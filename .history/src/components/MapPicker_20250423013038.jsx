import React, { useEffect, useState } from "react";
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
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]); // Quezon City boundary paths

  const { isLoaded } = useGoogleMaps();

  // Fetch the GeoJSON file from public folder (useEffect only runs once)
  useEffect(() => {
    fetch("/quezon_barangays_boundaries.geojson")
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data))
      .catch((error) => console.error("Failed to load GeoJSON", error));

    // Fetch Quezon City boundary GeoJSON data
    fetch("/quezon_city_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
      })
      .catch((error) =>
        console.error("Failed to load QC boundary data", error)
      );

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
        const geometry = feature.geometry;
        if (geometry && geometry.type === "Polygon") {
          // Ensure the polygon is closed by checking if the first and last coordinates are the same
          let coordinates = geometry.coordinates[0];
          if (
            (coordinates &&
              coordinates[0][0] !== coordinates[coordinates.length - 1][0]) ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1]
          ) {
            // Close the polygon by adding the first coordinate to the end
            coordinates.push(coordinates[0]);
          }

          // Now, check if the point is inside the polygon
          const polygon = turf.polygon([coordinates]);
          if (turf.booleanPointInPolygon(point, polygon)) {
            const barangayName = feature.properties.name; // Assuming the barangay name is stored in 'properties'
            onLocationSelect(coords, barangayName);
            console.log("Barangay selected:", barangayName);
            return;
          }
        } else if (geometry && geometry.type === "MultiPolygon") {
          // Handle MultiPolygon geometry type
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

  return isLoaded && currentPosition ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition}
      zoom={16}
      onClick={handleMapClick}
    >
      {/* Display Quezon City boundary polygon */}
      {qcPolygonPaths.length > 0 && (
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
      )}

      {/* Marker for selected location */}
      {markerPosition && <Marker position={markerPosition} />}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
