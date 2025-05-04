import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Polygon,
  Rectangle,
  InfoWindow,
} from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import * as turf from "@turf/turf";
import { Circle, CheckCircle, Question } from "phosphor-react";

// Helper function to determine classes based on risk level
const getRiskClasses = (riskLevel) => {
  const classes = {
    High: {
      border: "border-error",
      text: "text-error",
      icon: "text-error",
    },
    Medium: {
      border: "border-warning",
      text: "text-warning",
      icon: "text-warning",
    },
    Low: {
      border: "border-success",
      text: "text-success",
      icon: "text-success",
    },
  };
  return classes[riskLevel] || classes.Low; // Default to Low if no match
};

const containerStyle = {
  width: "100%",
  height: "100%", // This will be overwritten by the height prop
};

const QC_BOUNDS = {
  north: 14.7406,
  south: 14.4795,
  east: 121.1535,
  west: 121.022,
};

const QC_CENTER = {
  lat: 14.676,
  lng: 121.0437,
};

const RISK_LEVELS = ["High", "Medium", "Low"];
const RISK_COLORS = {
  High: "#e53e3e",
  Medium: "#dd6b20",
  Low: "#38a169",
};

const assignRiskLevel = () => {
  const risk = RISK_LEVELS[Math.floor(Math.random() * RISK_LEVELS.length)];
  return { level: risk, color: RISK_COLORS[risk] };
};

const DengueMap = ({
  height = "100%", // Default height to 100%
  zoom = 12, // Default zoom level
  disableMapSwitch = false, // Whether to disable map/satellite option
  defaultView = "roadmap", // Default map view ("roadmap" or "satellite")
}) => {
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null); // Track selected Barangay
  const [highlightedBarangay, setHighlightedBarangay] = useState(null); // Track highlighted Barangay
  const [infoWindowPosition, setInfoWindowPosition] = useState(null); // Track position for InfoWindow
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    fetch("/quezon_barangays_boundaries.geojson")
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
            const { level, color } = assignRiskLevel();
            return {
              ...f,
              properties: {
                ...f.properties,
                riskLevel: level,
                color,
              },
            };
          }),
        };
        setBarangayData(colored);
      });
  }, []);

  const handlePolygonClick = (feature) => {
    // Get the center of the polygon (geometry) using Turf.js
    const center = turf.center(feature.geometry);
    const { coordinates } = center.geometry;

    // Ensure valid lat and lng values before passing to panTo
    const [lng, lat] = coordinates;
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      mapRef.current.panTo({ lat, lng }); // Pan the map to the valid center coordinates
    }

    // Set selected Barangay data to show in the info window
    setSelectedBarangay(feature);
    setInfoWindowPosition({ lat, lng }); // Update InfoWindow position to center

    // Set the clicked barangay as highlighted
    setHighlightedBarangay(feature.properties.name);
  };

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="w-full" style={{ height: height }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={QC_CENTER}
        zoom={zoom}
        onLoad={(map) => (mapRef.current = map)}
        options={{
          mapTypeControl: !disableMapSwitch, // Disable the map/satellite switch if the prop is true
          mapTypeId: defaultView, // Set default map view (roadmap or satellite)
        }}
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

          const { border, text, icon } = getRiskClasses(
            feature.properties.riskLevel
          ); // Get the dynamic classes for the risk level

          return coordsArray.map((polygonCoords, i) => {
            const path = polygonCoords[0].map(([lng, lat]) => ({
              lat,
              lng,
            }));

            // Highlight the clicked barangay
            const isHighlighted =
              feature.properties.name === highlightedBarangay;

            return (
              <Polygon
                key={`${index}-${i}`}
                paths={path}
                options={{
                  strokeColor: isHighlighted
                    ? lightenColor(feature.properties.color, 50) // Lighten the color for highlight
                    : feature.properties.color, // Keep the original color for non-highlighted
                  strokeOpacity: isHighlighted ? 0.9 : 0.6, // Increase opacity for highlighted
                  strokeWeight: isHighlighted ? 4 : 1, // Make border thicker for highlighted
                  fillOpacity: 0.5,
                  fillColor: feature.properties.color,
                  strokeDasharray: isHighlighted ? "4 4" : "0", // Dotted line for highlighted
                }}
                onClick={() => handlePolygonClick(feature)} // Add click handler
              />
            );
          });
        })}

        {/* Display customized InfoWindow for selected Barangay */}
        {selectedBarangay && infoWindowPosition && (
          <InfoWindow
            position={infoWindowPosition} // Set position from state
            onCloseClick={() => setSelectedBarangay(null)} // Close the info window
          >
            <div className="bg-white p-4 rounded-lg border-2 max-w-xs shadow-md absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
              <p className="text-3xl font-bold">
                Barangay {selectedBarangay.properties.name}
              </p>
              <div className="mt-3 flex flex-col gap-1 text-black">
                <div className="flex items-center gap-3">
                  <div className={icon}>
                    <Circle weight="fill" size={16} />
                  </div>
                  <p className="text-lg">
                    <span className="font-semibold">Dengue Cases:</span> 20+
                    reported in the past 2 weeks
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-white text-success translate-y-1.5">
                    <CheckCircle weight="fill" size={16} />
                  </div>
                  <p className="text-lg">
                    <span className="font-semibold">Recommendation:</span>{" "}
                    "Immediate fogging and community awareness drive required."
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="text-primary translate-y-1.5">
                    <Question size={16} />
                  </div>
                  <p className="text-lg">
                    <span className="font-semibold">Rationale:</span> Barangay
                    Payatas has seen a significant rise in dengue cases, with
                    over 20 new cases in the past two weeks. Urgent action is
                    needed to control the outbreak and prevent further spread.
                    Focus on areas with high mosquito density and stagnant water
                    sources
                  </p>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Floating div on the right side */}
      <div className="absolute right-4 top-1/4 bg-white p-4 rounded-lg shadow-md z-20">
        <p className="text-lg font-semibold">Information</p>
        <p>Click on a Barangay to view details.</p>
      </div>
    </div>
  );
};

export default DengueMap;
