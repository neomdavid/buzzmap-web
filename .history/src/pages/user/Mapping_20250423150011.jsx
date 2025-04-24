import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Polygon,
  Marker,
  Rectangle,
  InfoWindow,
} from "@react-google-maps/api";
import { useGoogleMaps } from "../../components/GoogleMapsProvider";
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

const RISK_LEVELS = ["High", "Medium", "Low"];
const RISK_COLORS = {
  High: "#e53e3e",
  Medium: "#dd6b20",
  Low: "#38a169",
};

const assignRiskLevel = () => RISK_LEVELS[Math.floor(Math.random() * 3)];

const Mapping = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedBarangayInfo, setSelectedBarangayInfo] = useState(null);
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
      });

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const p = { lat: coords.latitude, lng: coords.longitude };
        setCurrentPosition(p);
        setMarkerPosition(p);
        handleLocationSelect(p);
      },
      () => {
        const fallback = { lat: 14.676, lng: 121.0437 };
        setCurrentPosition(fallback);
        setMarkerPosition(fallback);
      }
    );
  }, []);

  const handleLocationSelect = (coords) => {
    if (
      coords.lat < QC_BOUNDS.south ||
      coords.lat > QC_BOUNDS.north ||
      coords.lng < QC_BOUNDS.west ||
      coords.lng > QC_BOUNDS.east
    ) {
      alert("Please select a location within Quezon City.");
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
            console.log("Selected location:", coords);
            console.log("Barangay:", f.properties.name);
            return true;
          }
        }
      }
      alert("Location is in QC but not inside any barangay.");
      return true;
    }
    return true;
  };

  const handleMapClick = (e) => {
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    if (handleLocationSelect(coords)) {
      setMarkerPosition(coords);
      setSelectedBarangayInfo(null); // Hide InfoWindow on manual pin
    }
  };

  const toggleFullScreen = () => setIsFullScreen((prev) => !prev);

  if (!isLoaded || !currentPosition) return <p>Loading map...</p>;

  return (
    <div className="flex flex-col pt-8 px-8 items-center bg-primary text-white h-[96vh] mt-[-13px] text-center">
      <h1 className="text-7xl md:text-8xl">Check your place</h1>
      <p className="text-lg md:text-xl mb-4">
        Stay Protected. Look out for Dengue Outbreaks.
      </p>

      <select
        onChange={(e) => {
          const selected = barangayData?.features.find(
            (f) => f.properties.name === e.target.value
          );
          if (selected) {
            const centroid = turf.centroid(selected);
            const [lng, lat] = centroid.geometry.coordinates;
            const position = { lat, lng };
            mapRef.current?.panTo(position);
            mapRef.current?.setZoom(15);
            setSelectedBarangayInfo({
              name: selected.properties.name,
              position,
            });
          }
        }}
        className="text-black w-full max-w-md mb-4 px-4 py-4 rounded-md text-2xl shadow bg-white"
      >
        <option value="">Search barangay</option>
        {barangayData?.features.map((f, idx) => (
          <option key={idx} value={f.properties.name}>
            {f.properties.name}
          </option>
        ))}
      </select>

      <div className="bg-white text-black rounded-md shadow p-6 w-full max-w-md mb-4 text-left">
        <p className="font-semibold mb-2 text-2xl">Risk Levels</p>
        <div className="flex justify-between w-full text-2xl">
          {RISK_LEVELS.map((level) => (
            <div key={level} className="flex items-center gap-2">
              <span
                style={{ backgroundColor: RISK_COLORS[level] }}
                className="w-6 h-6 inline-block rounded"
              />
              {level}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full z-[10] h-[68vh] rounded-md shadow-md relative">
        <button
          onClick={toggleFullScreen}
          className="absolute top-2 right-2 z-[1000] text-sm bg-white text-black px-3 py-1 rounded shadow"
        >
          {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>

        <GoogleMap
          mapContainerStyle={{
            ...containerStyle,
            height: isFullScreen ? "100vh" : "100%",
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
              fillOpacity: 0.05,
            }}
          />

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
                    fillColor: feature.properties.color,
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
              <div className="text-primary font-bold text-3xl px-10">
                <strong>{selectedBarangayInfo.name}</strong>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default Mapping;
