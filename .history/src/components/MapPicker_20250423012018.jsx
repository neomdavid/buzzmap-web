import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polygon,
  useJsApiLoader,
} from "@react-google-maps/api";
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
  const [polygons, setPolygons] = useState([]); // Store polygons for rendering

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
      const polygonsToRender = []; // Array to store polygons to render

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
          }

          // Add the polygon for rendering
          polygonsToRender.push(coordinates);
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
            }

            // Add the polygon for rendering
            polygonsToRender.push(coordinates);
          }
        }
      }

      // Update the state with polygons to render
      setPolygons(polygonsToRender);
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

      {/* Render each polygon on the map */}
      {polygons.map((coords, index) => (
        <Polygon
          key={index}
          paths={coords}
          options={{
            fillColor: "#0000FF",
            fillOpacity: 0.3,
            strokeColor: "#0000FF",
            strokeOpacity: 1,
            strokeWeight: 2,
          }}
        />
      ))}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
