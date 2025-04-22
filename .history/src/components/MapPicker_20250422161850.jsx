import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polygon,
  useJsApiLoader,
} from "@react-google-maps/api";
import { containsLocation } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [barangayPolygons, setBarangayPolygons] = useState([]);
  const [quezonCityPolygons, setQuezonCityPolygons] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["geometry"], // Add the geometry library
  });

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
        // Default to Quezon City center if geolocation fails
        const qcCenter = { lat: 14.676, lng: 121.0437 };
        setCurrentPosition(qcCenter);
        setMarkerPosition(qcCenter);
      }
    );

    // Load the GeoJSON data
    const loadGeoJSON = async () => {
      try {
        const response = await fetch("/quezon_city.geojson");
        const geojson = await response.json();

        const polygons = geojson.features.flatMap((feature) => {
          const { type, coordinates } = feature.geometry;

          if (type === "Polygon") {
            return [
              {
                name: feature.properties.name,
                path: coordinates[0].map(([lng, lat]) => ({ lat, lng })),
              },
            ];
          }

          if (type === "MultiPolygon") {
            return coordinates.map((polygon) => ({
              name: feature.properties.name,
              path: polygon[0].map(([lng, lat]) => ({ lat, lng })),
            }));
          }

          return [];
        });

        setBarangayPolygons(polygons);
        setQuezonCityPolygons(polygons); // Use the same polygons for boundary check
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
      }
    };

    loadGeoJSON();
  }, []);

  const handleMapClick = async (e) => {
    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    // Check if the clicked location is within any Quezon City polygon
    const isWithinQC = quezonCityPolygons.some((polygon) => {
      return window.google.maps.geometry.poly.containsLocation(
        new window.google.maps.LatLng(clickedLatLng.lat, clickedLatLng.lng),
        new window.google.maps.Polygon({ paths: polygon.path })
      );
    });

    if (!isWithinQC) {
      alert("Please select a location within Quezon City");
      return;
    }

    setMarkerPosition(clickedLatLng);

    // Try to get the barangay name from our polygons first
    const clickedBarangay = barangayPolygons.find((polygon) =>
      window.google.maps.geometry.poly.containsLocation(
        new window.google.maps.LatLng(clickedLatLng.lat, clickedLatLng.lng),
        new window.google.maps.Polygon({ paths: polygon.path })
      )
    );

    if (clickedBarangay) {
      onLocationSelect(clickedLatLng, clickedBarangay.name);
    } else {
      // Fallback to Google's geocoding if we can't find the barangay in our data
      fetchBarangay(clickedLatLng);
    }
  };

  const fetchBarangay = async (coords) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
          coords.lat
        },${coords.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      const barangayComponent = data.results[0]?.address_components.find(
        (comp) =>
          comp.types.includes("sublocality") || comp.types.includes("political")
      );
      if (barangayComponent) {
        onLocationSelect(coords, barangayComponent.long_name);
      } else {
        onLocationSelect(coords, "Quezon City");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      onLocationSelect(coords, "Quezon City");
    }
  };

  return isLoaded && currentPosition ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition}
      zoom={14}
      onClick={handleMapClick}
      options={{
        restriction: {
          latLngBounds: {
            north: 14.8,
            south: 14.5,
            east: 121.2,
            west: 120.9,
          },
          strictBounds: true,
        },
      }}
    >
      {markerPosition && <Marker position={markerPosition} />}
      {barangayPolygons.map((poly, i) => (
        <Polygon
          key={i}
          paths={poly.path}
          options={{
            strokeColor: "#4285F4",
            strokeOpacity: 0.6,
            strokeWeight: 1.5,
            fillColor: "#4285F4",
            fillOpacity: 0.1,
          }}
        />
      ))}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
