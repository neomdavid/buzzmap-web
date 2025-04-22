import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Polygon,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Move the libraries array outside the component for performance
const googleMapLibraries = ["geometry"];

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [map, setMap] = useState(null);

  // Initialize the Google Maps API loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: googleMapLibraries,
  });

  // Load Quezon City polygon coordinates
  useEffect(() => {
    fetch("/quezon_city_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
      })
      .catch((error) => {
        console.error("Error loading boundaries:", error);
      });
  }, []);

  // Get the user's current location
  useEffect(() => {
    const handlePosition = (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentPosition(coords);
      setMarkerPosition(coords);
    };

    const handleError = () => {
      // Default location fallback if user denies permission
      const fallback = { lat: 14.676, lng: 121.0437 };
      setCurrentPosition(fallback);
      setMarkerPosition(fallback);
    };

    navigator.geolocation.getCurrentPosition(handlePosition, handleError);
  }, []);

  // Handle map click event and check if location is inside Quezon City
  const handleMapClick = (e) => {
    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    if (isLoaded && qcPolygonPaths.length > 0) {
      const polygon = new window.google.maps.Polygon({ paths: qcPolygonPaths });
      const isWithinQC = window.google.maps.geometry.poly.containsLocation(
        new window.google.maps.LatLng(clickedLatLng.lat, clickedLatLng.lng),
        polygon
      );

      if (!isWithinQC) {
        alert("Please select a location within Quezon City.");
        return;
      }

      setMarkerPosition(clickedLatLng);
      onLocationSelect(clickedLatLng, "Quezon City");
      console.log("Marker position set to:", clickedLatLng);
    }
  };

  // Custom marker icon to make it more visible
  const markerIcon = {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: "#4285F4",
    fillOpacity: 1,
    scale: 10,
    strokeColor: "#FFFFFF",
    strokeWeight: 2,
  };

  // Store map reference when map is loaded
  const onLoad = (mapInstance) => {
    console.log("Map loaded");
    setMap(mapInstance);
  };

  return isLoaded && currentPosition && qcPolygonPaths.length > 0 ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={onLoad}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            icon={markerIcon}
            visible={true}
            options={{
              // Using an explicit SVG icon as fallback if the symbol doesn't work
              icon:
                markerIcon.path === 0
                  ? {
                      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%234285F4'><circle cx='12' cy='12' r='10' stroke='white' stroke-width='2'/></svg>",
                      scaledSize: new window.google.maps.Size(30, 30),
                      anchor: new window.google.maps.Point(15, 15),
                    }
                  : markerIcon,
            }}
          />
        )}
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
      {markerPosition && (
        <div style={{ marginTop: "10px" }}>
          Selected location: {markerPosition.lat.toFixed(6)},{" "}
          {markerPosition.lng.toFixed(6)}
        </div>
      )}
    </>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
