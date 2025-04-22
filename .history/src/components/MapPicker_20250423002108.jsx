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
  const [isOutsideQC, setIsOutsideQC] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [barangay, setBarangay] = useState(""); // State for barangay name
  const [isLocationPinned, setIsLocationPinned] = useState(false); // Track if location is pinned
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

        // Reverse Geocoding to get the address and barangay name
        geocodeLocation(coords);

        // Check if the current location is within the QC boundary
        const polygon = new window.google.maps.Polygon({
          paths: qcPolygonPaths,
        });

        const latLng = new window.google.maps.LatLng(coords.lat, coords.lng);

        const isWithinQC = window.google.maps.geometry.poly.containsLocation(
          latLng,
          polygon
        );

        if (isWithinQC) {
          setZoomLevel(15); // Zoom in if within QC
          setIsOutsideQC(false);
        } else {
          setZoomLevel(12); // Zoom out if outside QC
          setIsOutsideQC(true);
        }
      },
      () => {
        const fallback = { lat: 14.676, lng: 121.0437 }; // Fallback to a default location
        setCurrentPosition(fallback);
        setMarkerPosition(fallback);
        setZoomLevel(12); // Set default zoom if location fetch fails
        setIsOutsideQC(true); // Default to outside QC if location is unavailable
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

    // Reverse Geocoding to get the address and barangay name for clicked location
    geocodeLocation(clickedLatLng);

    // Check if the clicked location is within the QC boundary (Polygon)
    const polygon = new window.google.maps.Polygon({
      paths: qcPolygonPaths,
    });

    const latLng = new window.google.maps.LatLng(
      clickedLatLng.lat,
      clickedLatLng.lng
    );

    const isWithinQC = window.google.maps.geometry.poly.containsLocation(
      latLng,
      polygon
    );

    if (isWithinQC) {
      setMarkerPosition(clickedLatLng);
      onLocationSelect(clickedLatLng, "Quezon City");
      setIsLocationPinned(true); // Mark location as pinned
    } else {
      alert("Please select a location within Quezon City");
    }
  };

  // Function to reverse geocode location and get barangay
  const geocodeLocation = (coords) => {
    const geocoder = new window.google.maps.Geocoder();
    const latLng = new window.google.maps.LatLng(coords.lat, coords.lng);

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
        let barangayName = "";

        // Look through address components to find the barangay
        for (let i = 0; i < results[0].address_components.length; i++) {
          const component = results[0].address_components[i];
          if (component.types.includes("sublocality_level_1")) {
            barangayName = component.long_name;
            break;
          }
        }

        // If no specific barangay is found, use the city name as fallback
        if (!barangayName) {
          barangayName =
            results[0].address_components.find((component) =>
              component.types.includes("locality")
            )?.long_name || "Barangay not found";
        }

        setBarangay(barangayName); // Set barangay name in state
      } else {
        console.error("Geocoding failed:", status);
        setBarangay("Barangay not found");
      }
    });
  };

  return isLoaded && currentPosition && qcPolygonPaths.length ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={zoomLevel} // Dynamically set zoom based on location
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
          <Marker position={markerPosition} title="Selected Location" />
        )}
      </GoogleMap>

      {/* Display message when outside QC */}
      {isOutsideQC && (
        <div style={{ color: "red", marginTop: "10px" }}>
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

      {/* Display barangay name */}
      {barangay && (
        <div style={{ marginTop: "10px" }}>
          Barangay: <strong>{barangay}</strong>
        </div>
      )}

      {/* Input fields (disabled if location is pinned) */}
      <div style={{ marginTop: "10px" }}>
        <label htmlFor="barangay">Barangay:</label>
        <input
          type="text"
          id="barangay"
          value={barangay}
          onChange={(e) => setBarangay(e.target.value)}
          disabled={isLocationPinned} // Disable input when location is pinned
        />
      </div>
    </>
  ) : (
    <p>Loading map data...</p>
  );
};

export default MapPicker;
