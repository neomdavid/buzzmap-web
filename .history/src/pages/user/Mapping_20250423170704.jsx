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
const darkerColor = {
  High: "#c53030",
  Medium: "#c05621",
  Low: "#2f855a",
};

const assignRiskLevel = () => RISK_LEVELS[Math.floor(Math.random() * 3)];

const Mapping = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(""); // Track dropdown selection
  const [selectedRiskLevel, setSelectedRiskLevel] = useState(""); // Track selected risk level
  const [breedingGrounds, setBreedingGrounds] = useState([]); // State for reported breeding grounds
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

    if (selectedOption === "Breeding Grounds" && handleLocationSelect(coords)) {
      // Add the breeding ground pin
      setBreedingGrounds((prev) => [...prev, coords]);
      setMarkerPosition(coords);
    }
  };

  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value);
    setSelectedRiskLevel(""); // Reset risk level if changing to "Breeding Grounds"
  };

  const handleRiskLevelChange = (e) => {
    setSelectedRiskLevel(e.target.value);
  };

  if (!isLoaded || !currentPosition) return <p>Loading map...</p>;

  return (
    <div className="flex flex-col pt-8 px-8 items-center bg-primary text-white h-[95.5vh] mt-[-13px] text-center">
      <h1 className="text-7xl md:text-8xl">Check your place</h1>
      <p className="text-lg md:text-xl mb-4">
        Stay Protected. Look out for Dengue Outbreaks.
      </p>

      {/* Dropdown for selecting action */}
      <select
        onChange={handleDropdownChange}
        value={selectedOption}
        className="text-black w-full max-w-md mb-4 px-4 py-4 rounded-md text-xl shadow bg-white"
      >
        <option value="">Select Action</option>
        <option value="Dengue Case Risk Level">Dengue Case Risk Level</option>
        <option value="Breeding Grounds">Report Breeding Ground</option>
      </select>

      {selectedOption === "Dengue Case Risk Level" && (
        <div className="mb-4">
          <label className="mr-4">Select Risk Level: </label>
          <select
            onChange={handleRiskLevelChange}
            value={selectedRiskLevel}
            className="text-black px-4 py-2 rounded-md text-xl shadow bg-white"
          >
            <option value="">Select Risk Level</option>
            {RISK_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="w-full z-[10] h-[68vh] rounded-md shadow-md relative">
        <GoogleMap
          mapContainerStyle={{
            ...containerStyle,
            height: "100%",
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
                    strokeColor: darkerColor[feature.properties.riskLevel],
                    strokeOpacity: 0.6,
                    strokeWeight: 1,
                    fillOpacity: 0.5,
                    fillColor: feature.properties.color,
                  }}
                />
              );
            });
          })}

          {selectedOption === "Dengue Case Risk Level" && selectedRiskLevel && (
            <Marker
              position={markerPosition}
              icon={{
                url: "/path/to/custom/icon.png", // optional custom icon for dengue case
                scaledSize: new window.google.maps.Size(30, 30),
              }}
            />
          )}

          {selectedOption === "Breeding Grounds" &&
            breedingGrounds.map((coords, index) => (
              <Marker
                key={index}
                position={coords}
                icon={{
                  url: "/path/to/custom/icon.png", // optional custom icon for breeding ground
                  scaledSize: new wi  ndow.google.maps.Size(30, 30),
                }}
              />
            ))}
        </GoogleMap>
      </div>
    </div>
  );
};

export default Mapping;
