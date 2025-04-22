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
  const [barangay, setBarangay] = useState("");
  const [isLocationPinned, setIsLocationPinned] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
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

        if (qcPolygonPaths.length > 0) {
          checkQCBoundary(coords);
        }

        geocodeLocation(coords);
      },
      () => {
        const fallback = { lat: 14.676, lng: 121.0437 };
        setCurrentPosition(fallback);
        setMarkerPosition(fallback);
        setZoomLevel(12);
        setIsOutsideQC(true);
      }
    );
  }, [qcPolygonPaths]);

  const checkQCBoundary = (coords) => {
    const polygon = new window.google.maps.Polygon({
      paths: qcPolygonPaths,
    });

    const latLng = new window.google.maps.LatLng(coords.lat, coords.lng);

    const isWithinQC = window.google.maps.geometry.poly.containsLocation(
      latLng,
      polygon
    );

    if (isWithinQC) {
      setZoomLevel(15);
      setIsOutsideQC(false);
    } else {
      setZoomLevel(12);
      setIsOutsideQC(true);
    }
  };

  const handleMapClick = (e) => {
    if (!isLoaded || qcPolygonPaths.length === 0) {
      console.warn("Map data not fully loaded");
      return;
    }

    const clickedLatLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

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
      setIsLocationPinned(true);
      geocodeLocation(clickedLatLng);
    } else {
      alert("Please select a location within Quezon City");
    }
  };

  const geocodeLocation = (coords) => {
    setIsGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    const latLng = new window.google.maps.LatLng(coords.lat, coords.lng);

    geocoder.geocode({ location: latLng }, (results, status) => {
      setIsGeocoding(false);

      if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
        console.log("Full geocoding results:", results);

        let barangayName = "Barangay not found";
        const addressComponents = results[0].address_components;

        // Try different component types to find barangay
        const possibleTypes = [
          "sublocality_level_1",
          "neighborhood",
          "administrative_area_level_3",
          "sublocality",
        ];

        for (const type of possibleTypes) {
          const component = addressComponents.find((c) =>
            c.types.includes(type)
          );
          if (component && component.long_name !== "Quezon City") {
            barangayName = component.long_name;
            break;
          }
        }

        setBarangay(barangayName);
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
        zoom={zoomLevel}
        onClick={handleMapClick}
        onLoad={(map) => (mapRef.current = map)}
        mapId="82d912d6b8b4c779"
      >
        <Polygon
          paths={qcPolygonPaths}
          options={{
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.1,
            zIndex: 1,
          }}
        />

        <Rectangle
          bounds={{
            north: 14.7406,
            south: 14.4795,
            east: 121.1535,
            west: 121.022,
          }}
          options={{
            fillColor: "#FFFFFF",
            fillOpacity: 0,
            strokeWeight: 0,
            clickable: true,
            zIndex: 2,
          }}
          onClick={handleMapClick}
        />

        {markerPosition && (
          <Marker
            position={markerPosition}
            title="Selected Location"
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}
      </GoogleMap>

      {isOutsideQC && (
        <div style={{ color: "red", marginTop: "10px" }}>
          Your current location is outside Quezon City. Please select a location
          within Quezon City.
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid #eee",
          borderRadius: "4px",
        }}
      >
        {markerPosition && (
          <div>
            <strong>Coordinates:</strong> {markerPosition.lat.toFixed(6)},{" "}
            {markerPosition.lng.toFixed(6)}
          </div>
        )}

        {isGeocoding ? (
          <div style={{ marginTop: "10px" }}>Detecting barangay...</div>
        ) : barangay ? (
          <div style={{ marginTop: "10px" }}>
            <strong>Barangay:</strong> {barangay}
          </div>
        ) : null}

        <div style={{ marginTop: "10px" }}>
          <label htmlFor="barangay">Confirm Barangay:</label>
          <input
            type="text"
            id="barangay"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            disabled={isLocationPinned}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </div>
      </div>
    </>
  ) : (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>Loading map data...</p>
    </div>
  );
};

export default MapPicker;
