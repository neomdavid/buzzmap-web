import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Polygon, Marker, Rectangle } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import * as turf from "@turf/turf";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const fullscreenStyle = {
  width: "100%",
  height: "100vh", // Make the map full height when in fullscreen mode
};

const QC_BOUNDS = {
  north: 14.7406,
  south: 14.4795,
  east: 121.1535,
  west: 121.022,
};

const RISK_LEVELS = ["High", "Medium", "Low"];
const RISK_COLORS = {
  High: "#e53e3e",
  Medium: "#dd6b20",
  Low: "#38a169",
};

const assignRiskLevel = () => RISK_LEVELS[Math.floor(Math.random() * 3)];

export default function MapPicker({ onLocationSelect }) {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [barangayData, setBarangayData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false); // Track fullscreen state
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    fetch("/quezon_city_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
      })
      .catch(console.error);

    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const colored = {
          ...data,
          features: data.features.map((f) => {
            const risk = assignRiskLevel();
            return {
              ...f,
              properties: {
                ...f.properties,
                color: RISK_COLORS[risk],
                riskLevel: risk,
              },
            };
          }),
        };
        setBarangayData(colored);
      })
      .catch(console.error);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const p = { lat: coords.latitude, lng: coords.longitude };
        setCurrentPosition(p);
        setMarkerPosition(p);
        handleSelection(p);
      },
      () => {
        const p = { lat: 14.676, lng: 121.0437 };
        setCurrentPosition(p);
        setMarkerPosition(p);
      }
    );
  }, []);

  const handleSelection = (coords) => {
    if (
      coords.lat < QC_BOUNDS.south ||
      coords.lat > QC_BOUNDS.north ||
      coords.lng < QC_BOUNDS.west ||
      coords.lng > QC_BOUNDS.east
    ) {
      alert("Please select a location within Quezon City");
      return false;
    }

    if (barangayData) {
      const pt = turf.point([coords.lng, coords.lat]);
      for (let f of barangayData.features) {
        let polys = [];
        if (f.geometry.type === "Polygon") {
          polys = [f.geometry.coordinates];
        } else if (f.geometry.type === "MultiPolygon") {
          polys = f.geometry.coordinates;
        }
        for (let polyCoords of polys) {
          let ring = [...polyCoords[0]];
          const [x0, y0] = ring[0];
          const [xn, yn] = ring[ring.length - 1];
          if (x0 !== xn || y0 !== yn) ring.push(ring[0]);
          const poly = turf.polygon([ring]);
          if (turf.booleanPointInPolygon(pt, poly)) {
            onLocationSelect(coords, f.properties.name);
            return true;
          }
        }
      }
      alert("This location is inside QC but outside any barangay polygon.");
      return true;
    }

    return true;
  };

  const handleMapClick = (e) => {
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    if (handleSelection(coords)) {
      setMarkerPosition(coords);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!isLoaded || !currentPosition) return <p>Loading map...</p>;

  return (
    <div style={{ position: "relative" }}>
      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          padding: "8px 12px",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>

      {/* Barangay search dropdown */}
      <select
        onChange={(e) => {
          const barangayName = e.target.value;
          const selected = barangayData?.features.find(
            (f) => f.properties.name === barangayName
          );
          if (selected) {
            let lng, lat;
            if (selected.geometry.type === "Polygon") {
              [lng, lat] = selected.geometry.coordinates[0][0];
            } else {
              [lng, lat] = selected.geometry.coordinates[0][0][0];
            }
            mapRef.current?.panTo({ lat, lng });
            mapRef.current?.setZoom(15);
          }
        }}
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          padding: "6px 10px",
          fontSize: "14px",
          borderRadius: "6px",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          border: "1px solid #ccc",
        }}
      >
        <option value="">Search barangay</option>
        {barangayData?.features.map((f, idx) => (
          <option key={idx} value={f.properties.name}>
            {f.properties.name}
          </option>
        ))}
      </select>

      {/* Risk Level Legend outside the map container */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "white",
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          fontSize: "14px",
          zIndex: 1000,
        }}
      >
        <strong>Risk Level</strong>
        <div>
          <span
            style={{
              backgroundColor: RISK_COLORS.High,
              display: "inline-block",
              width: 12,
              height: 12,
              marginRight: 6,
            }}
          />{" "}
          High
        </div>
        <div>
          <span
            style={{
              backgroundColor: RISK_COLORS.Medium,
              display: "inline-block",
              width: 12,
              height: 12,
              marginRight: 6,
            }}
          />{" "}
          Medium
        </div>
        <div>
          <span
            style={{
              backgroundColor: RISK_COLORS.Low,
              display: "inline-block",
              width: 12,
              height: 12,
              marginRight: 6,
            }}
          />{" "}
          Low
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={isFullscreen ? fullscreenStyle : containerStyle}
        center={currentPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/* QC boundary */}
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

        {/* Transparent overlay */}
        <Rectangle
          bounds={QC_BOUNDS}
          options={{
            fillOpacity: 0,
            strokeWeight: 0,
            clickable: true,
            zIndex: 2,
          }}
          onClick={handleMapClick}
        />

        {/* Barangay borders */}
        {Array.isArray(barangayData?.features) &&
          barangayData.features.map((feature, index) => {
            const geometry = feature.geometry;
            const coordsArray =
              geometry.type === "Polygon"
                ? [geometry.coordinates]
                : geometry.type === "MultiPolygon"
                ? geometry.coordinates
                : [];

            return coordsArray.map((polygonCoords, i) => {
              if (!Array.isArray(polygonCoords[0])) return null;

              const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
              return (
                <Polygon
                  key={`${index}-${i}`}
                  paths={path}
                  options={{
                    strokeColor: "#333",
                    strokeOpacity: 0.6,
                    strokeWeight: 1,
                    fillOpacity: 0.5,
                    fillColor: feature.properties.color,
                    zIndex: 0,
                  }}
                />
              );
            });
          })}

        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </div>
  );
}
