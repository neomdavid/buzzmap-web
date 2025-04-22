import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Polygon, useJsApiLoader } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
const containerStyle = {
  width: "100%",
  height: "400px",
};

// Move the libraries array outside the component for performance
const googleMapLibraries = ["geometry", "marker"];

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize the Google Maps API loader
  const { isLoaded } = useGoogleMaps();

  // Load Quezon City polygon coordinates
  useEffect(() => {
    fetch("/quezon_city_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
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

  // Create or update the marker when position changes
  useEffect(() => {
    if (isLoaded && markerPosition && mapRef.current) {
      try {
        // Clean up existing marker
        if (markerRef.current) {
          markerRef.current.map = null;
        }

        // Check if the marker module is available
        if (window.google && window.google.maps && window.google.maps.marker) {
          // Create a pin element for the marker
          const pinElement = document.createElement("div");
          pinElement.className = "pin";
          pinElement.style.width = "30px";
          pinElement.style.height = "30px";
          pinElement.style.borderRadius = "50% 50% 50% 0";
          pinElement.style.backgroundColor = "#0066ff";
          pinElement.style.transform = "rotate(-45deg)";
          pinElement.style.position = "relative";
          pinElement.style.top = "-15px";
          pinElement.style.left = "-15px";

          // Add a center dot
          const pinInner = document.createElement("div");
          pinInner.style.width = "14px";
          pinInner.style.height = "14px";
          pinInner.style.borderRadius = "50%";
          pinInner.style.backgroundColor = "white";
          pinInner.style.position = "absolute";
          pinInner.style.top = "8px";
          pinInner.style.left = "8px";

          pinElement.appendChild(pinInner);

          // Create the advanced marker
          const { AdvancedMarkerElement } = window.google.maps.marker;
          if (AdvancedMarkerElement) {
            markerRef.current = new AdvancedMarkerElement({
              position: markerPosition,
              map: mapRef.current,
              content: pinElement,
              title: "Selected Location",
            });

            console.log("Advanced marker created:", markerRef.current);
          } else {
            console.error("AdvancedMarkerElement not available");

            // Fallback to traditional marker if needed
            markerRef.current = new window.google.maps.Marker({
              position: markerPosition,
              map: mapRef.current,
              title: "Selected Location",
            });
          }
        } else {
          console.error("Google Maps marker module not available");
        }
      } catch (error) {
        console.error("Error creating marker:", error);
      }
    }
  }, [isLoaded, markerPosition]);

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
    }
  };

  // Store map reference when map is loaded
  const onLoad = (map) => {
    console.log("Map loaded");
    mapRef.current = map;
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
