// components/MapPicker.jsx
import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Polygon, Marker, Rectangle } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import * as turf from "@turf/turf";

const containerStyle = {
  width: "100%",
  height: "500px",
  position: "relative",
};

const QC_BOUNDS = {
  north: 14.7406,
  south: 14.4795,
  east: 121.1535,
  west: 121.022,
};

const riskColors = {
  high: "rgba(255, 0, 0, 0.4)",
  medium: "rgba(255, 165, 0, 0.4)",
  low: "rgba(0, 128, 0, 0.4)",
};

const assignRandomRisk = () => {
  const risks = ["high", "medium", "low"];
  return risks[Math.floor(Math.random() * risks.length)];
};

export default function MapPicker({ onLocationSelect }) {
  const [currentPosition, setCurrentPosition] = useState({
    lat: 14.676,
    lng: 121.0437,
  });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [search, setSearch] = useState("");
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
      });

    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const colored = {
          ...data,
          features: data.features.map((f) => ({
            ...f,
            properties: {
              ...f.properties,
              risk: assignRandomRisk(),
            },
          })),
        };
        setBarangayData(colored);
      });

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const p = { lat: coords.latitude, lng: coords.longitude };
        setCurrentPosition(p);
        setMarkerPosition(p);
        handleSelection(p);
      },
      () => {
        setMarkerPosition(currentPosition);
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
        const polys =
          f.geometry.type === "Polygon"
            ? [f.geometry.coordinates]
            : f.geometry.type === "MultiPolygon"
            ? f.geometry.coordinates
            : [];

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

      alert("Inside QC but outside any barangay polygon.");
    }

    return true;
  };

  const handleMapClick = (e) => {
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    if (handleSelection(coords)) {
      setMarkerPosition(coords);
    }
  };

  const handlePolygonClick = (feature) => {
    const center = turf.center(feature.geometry).geometry.coordinates;
    setCurrentPosition({ lat: center[1], lng: center[0] });
    setSelectedBarangay(feature.properties.name);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(e.target.value);

    const match = barangayData?.features.find((f) =>
      f.properties.name.toLowerCase().includes(query)
    );
    if (match) {
      const center = turf.center(match.geometry).geometry.coordinates;
      setCurrentPosition({ lat: center[1], lng: center[0] });
    }
  };

  if (!isLoaded || !currentPosition) return <p>Loading map...</p>;

  return (
    <div style={{ position: "relative" }}>
      <input
        value={search}
        onChange={handleSearchChange}
        placeholder="Search Barangay..."
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          padding: "6px 12px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          backgroundColor: "white",
          fontSize: "14px",
        }}
      />

      <GoogleMap
        mapContainerStyle={containerStyle}
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
              const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
              const isSelected = selectedBarangay === feature.properties.name;
              return (
                <Polygon
                  key={`${index}-${i}`}
                  paths={path}
                  options={{
                    strokeColor: isSelected ? "#000" : "#333",
                    strokeWeight: isSelected ? 3 : 1,
                    fillOpacity: 0.5,
                    fillColor: riskColors[feature.properties.risk] || "gray",
                    zIndex: 0,
                  }}
                  onClick={() => handlePolygonClick(feature)}
                />
              );
            });
          })}

        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "6px",
          fontSize: "14px",
          boxShadow: "0 0 6px rgba(0,0,0,0.2)",
          zIndex: 10,
        }}
      >
        <strong>Legend</strong>
        <div>
          <span
            style={{
              background: riskColors.high,
              padding: "2px 8px",
              marginRight: 6,
            }}
          ></span>
          High Risk
        </div>
        <div>
          <span
            style={{
              background: riskColors.medium,
              padding: "2px 8px",
              marginRight: 6,
            }}
          ></span>
          Medium Risk
        </div>
        <div>
          <span
            style={{
              background: riskColors.low,
              padding: "2px 8px",
              marginRight: 6,
            }}
          ></span>
          Low Risk
        </div>
      </div>
    </div>
  );
}
