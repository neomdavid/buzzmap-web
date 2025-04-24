import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Polygon, Marker, Rectangle } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import * as turf from "@turf/turf";
import { toastWarn } from "../utils.jsx";

const containerStyle = {
  width: "100%",
  height: "400px",
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
  const [barangayData, setBarangayData] = useState(null);
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
        const userLocation = { lat: coords.latitude, lng: coords.longitude };
        const isInsideQC =
          userLocation.lat >= QC_BOUNDS.south &&
          userLocation.lat <= QC_BOUNDS.north &&
          userLocation.lng >= QC_BOUNDS.west &&
          userLocation.lng <= QC_BOUNDS.east;

        if (!isInsideQC) {
          toastWarn("You are currently outside Quezon City.");
        }

        setCurrentPosition(userLocation);
        setMarkerPosition(isInsideQC ? userLocation : null);
      },
      () => {
        const fallback = { lat: 14.676, lng: 121.0437 };
        setCurrentPosition(fallback);
        setMarkerPosition(null);
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
      toastWarn("Please select a location within Quezon City");
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
      alert("This location is inside QC but outside any barangay.");
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

  if (!isLoaded || !currentPosition) return <p>Loading map...</p>;

  return (
    <div style={{ position: "relative" }}>
      <ToastContainer position="top-center" style={{ zIndex: 999999 }} />
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

      <GoogleMap
        mapContainerStyle={{
          ...containerStyle,
        }}
        center={currentPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(map) => (mapRef.current = map)}
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
          bounds={QC_BOUNDS}
          options={{
            fillOpacity: 0,
            strokeWeight: 0,
            clickable: true,
            zIndex: 2,
          }}
          onClick={handleMapClick}
        />

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
