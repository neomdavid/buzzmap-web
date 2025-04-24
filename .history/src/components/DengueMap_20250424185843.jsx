import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Polygon,
  Marker,
  Rectangle,
  InfoWindow,
} from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import * as turf from "@turf/turf";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const QC_BOUNDS = {
  north: 14.7406,
  south: 14.4795,
  east: 121.1535,
  west: 121.022,
};

const RISK_COLORS = {
  High: "#e53e3e", // Red
  Medium: "#dd6b20", // Orange
  Low: "#38a169", // Green
};

const DengueMap = ({ qcPolygonPaths, barangayData }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [selectedBarangayInfo, setSelectedBarangayInfo] = useState(null);
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  // Debug: Log initial props
  console.log("DengueMap props:", { qcPolygonPaths, barangayData });

  useEffect(() => {
    console.log("Initializing map...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const p = { lat: coords.latitude, lng: coords.longitude };
        console.log("Got user location:", p);
        setCurrentPosition(p);
        setMarkerPosition(p);
      },
      (error) => {
        console.error("Geolocation error:", error);
        const fallback = { lat: 14.676, lng: 121.0437 };
        console.log("Using fallback location:", fallback);
        setCurrentPosition(fallback);
        setMarkerPosition(fallback);
      }
    );
  }, []);

  const handleMapClick = (e) => {
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    console.log("Map clicked at:", coords);
    setMarkerPosition(coords);
    handleLocationSelect(coords);
  };

  const handleLocationSelect = (coords) => {
    console.log("Checking location:", coords);

    // Boundary check
    if (
      coords.lat < QC_BOUNDS.south ||
      coords.lat > QC_BOUNDS.north ||
      coords.lng < QC_BOUNDS.west ||
      coords.lng > QC_BOUNDS.east
    ) {
      console.log("Location outside QC bounds");
      alert("You are outside Quezon City.");
      return false;
    }

    if (!barangayData) {
      console.error("No barangay data available");
      return false;
    }

    console.log("Processing barangay data...");
    const pt = turf.point([coords.lng, coords.lat]);

    // Debug: Log total barangays
    console.log(`Total barangays to check: ${barangayData.features.length}`);

    for (let f of barangayData.features) {
      // Debug: Log current barangay being checked
      console.group(`Checking barangay: ${f.properties?.name || "Unnamed"}`);
      console.log("Barangay properties:", f.properties);
      console.log("Geometry type:", f.geometry.type);

      let polys = [];
      if (f.geometry.type === "Polygon") {
        polys = [f.geometry.coordinates];
      } else if (f.geometry.type === "MultiPolygon") {
        polys = f.geometry.coordinates;
      } else {
        console.warn("Unsupported geometry type:", f.geometry.type);
        console.groupEnd();
        continue;
      }

      // Debug: Check risk level
      const riskLevel = f.properties?.risk;
      console.log("Risk level:", riskLevel);
      if (!riskLevel) {
        console.warn("No risk level defined for this barangay");
      }

      for (let polyCoords of polys) {
        try {
          let ring = [...polyCoords[0]];
          const [x0, y0] = ring[0];
          const [xn, yn] = ring[ring.length - 1];
          if (x0 !== xn || y0 !== yn) ring.push(ring[0]);

          const poly = turf.polygon([ring]);
          const isInside = turf.booleanPointInPolygon(pt, poly);

          console.log("Point inside polygon:", isInside);

          if (isInside) {
            console.log(`Found matching barangay: ${f.properties.name}`);
            setSelectedBarangayInfo({
              name: f.properties.name,
              position: coords,
              risk: f.properties.risk,
            });
            console.groupEnd();
            return true;
          }
        } catch (error) {
          console.error("Error processing polygon:", error);
        }
      }
      console.groupEnd();
    }

    console.log("Location is in QC but not inside any barangay.");
    return true;
  };

  if (!isLoaded) {
    console.log("Google Maps not loaded yet");
    return <p>Loading Google Maps API...</p>;
  }

  if (!currentPosition) {
    console.log("Waiting for current position");
    return <p>Getting your location...</p>;
  }

  if (!barangayData) {
    console.log("Waiting for barangay data");
    return <p>Loading barangay data...</p>;
  }

  console.log("Rendering map with current position:", currentPosition);

  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(map) => {
          console.log("Map loaded");
          mapRef.current = map;
        }}
      >
        {qcPolygonPaths?.length > 0 && (
          <Polygon
            paths={qcPolygonPaths}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#FF0000",
              fillOpacity: 0.05,
            }}
          />
        )}

        <Rectangle
          bounds={QC_BOUNDS}
          options={{
            fillOpacity: 0,
            strokeWeight: 0,
            clickable: false,
            zIndex: 2,
          }}
        />

        {barangayData.features.map((feature, index) => {
          const geometry = feature.geometry;
          const coordsArray =
            geometry.type === "Polygon"
              ? [geometry.coordinates]
              : geometry.type === "MultiPolygon"
              ? geometry.coordinates
              : [];

          // Debug: Verify feature properties
          if (!feature.properties) {
            console.warn(`Feature ${index} has no properties`);
          }

          const riskLevel = feature.properties?.risk;
          const riskColor = RISK_COLORS[riskLevel] || "#38a169";

          console.log(
            `Rendering ${
              feature.properties?.name || `Feature ${index}`
            } with color ${riskColor}`
          );

          return coordsArray.map((polygonCoords, i) => {
            try {
              const path = polygonCoords[0].map(([lng, lat]) => ({
                lat,
                lng,
              }));

              return (
                <Polygon
                  key={`${index}-${i}`}
                  paths={path}
                  options={{
                    strokeColor: "#333",
                    strokeOpacity: 0.6,
                    strokeWeight: 1,
                    fillOpacity: 0.5,
                    fillColor: riskColor,
                  }}
                />
              );
            } catch (error) {
              console.error(`Error rendering polygon ${index}-${i}:`, error);
              return null;
            }
          });
        })}

        {markerPosition && <Marker position={markerPosition} />}

        {selectedBarangayInfo && (
          <InfoWindow
            position={selectedBarangayInfo.position}
            onCloseClick={() => setSelectedBarangayInfo(null)}
          >
            <div>
              <strong className="text-3xl p-3 text-primary font-semibold">
                {selectedBarangayInfo.name}
              </strong>
              <p>Risk Level: {selectedBarangayInfo.risk}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default DengueMap;
