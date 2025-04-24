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

const DengueMap = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [selectedBarangayInfo, setSelectedBarangayInfo] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);

        // Load QC boundaries
        const qcRes = await fetch("/quezon_city_boundaries.geojson");
        if (!qcRes.ok) throw new Error("Failed to load QC boundaries");
        const qcData = await qcRes.json();
        const qcCoords = qcData.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(qcCoords);

        // Load barangay data
        const brgyRes = await fetch("/quezon_barangays_boundaries.geojson");
        if (!brgyRes.ok) throw new Error("Failed to load barangay data");
        const brgyData = await brgyRes.json();

        // Process barangay data with risk levels
        const processedBrgyData = {
          ...brgyData,
          features: brgyData.features.map((f) => ({
            ...f,
            properties: {
              ...f.properties,
              risk: f.properties.risk || "Medium", // Default to Medium if not specified
              color: RISK_COLORS[f.properties.risk] || "#dd6b20",
            },
          })),
        };
        setBarangayData(processedBrgyData);
      } catch (err) {
        console.error("Failed to load map data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();

    // Get user location
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const p = { lat: coords.latitude, lng: coords.longitude };
        setCurrentPosition(p);
        setMarkerPosition(p);
      },
      () => {
        const fallback = { lat: 14.676, lng: 121.0437 }; // Center of Quezon City
        setCurrentPosition(fallback);
        setMarkerPosition(fallback);
      }
    );
  }, []);

  const handleMapClick = (e) => {
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPosition(coords);
    handleLocationSelect(coords);
  };

  const handleLocationSelect = (coords) => {
    if (
      coords.lat < QC_BOUNDS.south ||
      coords.lat > QC_BOUNDS.north ||
      coords.lng < QC_BOUNDS.west ||
      coords.lng > QC_BOUNDS.east
    ) {
      alert("You are outside Quezon City.");
      return false;
    }

    if (!barangayData) {
      console.error("No barangay data available");
      return false;
    }

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
          setSelectedBarangayInfo({
            name: f.properties.name,
            position: coords,
            risk: f.properties.risk,
          });
          return true;
        }
      }
    }
    alert("Location is in QC but not inside any barangay.");
    return true;
  };

  if (!isLoaded) return <p>Loading Google Maps API...</p>;
  if (!currentPosition) return <p>Getting your location...</p>;
  if (loading) return <p>Loading map data...</p>;
  if (error) return <p>Error loading map: {error}</p>;

  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(map) => (mapRef.current = map)}
      >
        {qcPolygonPaths.length > 0 && (
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

        {barangayData?.features.map((feature, index) => {
          const geometry = feature.geometry;
          const coordsArray =
            geometry.type === "Polygon"
              ? [geometry.coordinates]
              : geometry.type === "MultiPolygon"
              ? geometry.coordinates
              : [];

          const riskColor = RISK_COLORS[feature.properties.risk] || "#38a169";

          return coordsArray.map((polygonCoords, i) => {
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
