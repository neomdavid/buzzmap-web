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
import { useGetPatternRecognitionResultsQuery } from "../api/dengueApi"; // Import your API hook

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

const QC_CENTER = {
  lat: 14.676,
  lng: 121.0437,
};

// Updated color scheme based on pattern types
const PATTERN_COLORS = {
  spike: "#e53e3e", // Red for spikes
  gradual_rise: "#dd6b20", // Orange for gradual rise
  stability: "#38a169", // Green for stability
  decline: "#3182ce", // Blue for decline
  default: "#718096", // Gray for unknown
};

const DengueMap = ({
  height = "100%",
  zoom = 12,
  disableMapSwitch = false,
  defaultView = "roadmap",
}) => {
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [highlightedBarangay, setHighlightedBarangay] = useState(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  // Fetch pattern recognition data
  const { data: patternData, isLoading: patternsLoading } =
    useGetPatternRecognitionResultsQuery();

  useEffect(() => {
    // Load GeoJSON data
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
        return data;
      })
      .then((geoData) => {
        // Only process if we have both GeoJSON and pattern data
        if (patternData?.data) {
          processBarangayData(geoData, patternData.data);
        }
      });
  }, [patternData]); // Re-run when pattern data changes

  const processBarangayData = (geoData, patternResults) => {
    const colored = {
      ...geoData,
      features: geoData.features.map((f) => {
        // Find matching pattern data for this barangay
        const patternInfo = patternResults.find(
          (item) =>
            item.name?.toLowerCase() === f.properties.name?.toLowerCase()
        );

        // Determine pattern type and risk level
        let patternType =
          patternInfo?.triggered_pattern?.toLowerCase() || "default";
        let riskLevel = patternInfo?.risk_level || "unknown";

        // Get color based on pattern type
        const color = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;

        return {
          ...f,
          properties: {
            ...f.properties,
            patternType,
            riskLevel,
            color,
            alert: patternInfo?.alert || "No recent data",
            lastAnalysisTime: patternInfo?.last_analysis_time,
          },
        };
      }),
    };
    setBarangayData(colored);
  };

  const handlePolygonClick = (feature) => {
    const center = turf.center(feature.geometry);
    const { coordinates } = center.geometry;
    const [lng, lat] = coordinates;

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      mapRef.current.panTo({ lat, lng });
    }

    setSelectedBarangay(feature);
    setInfoWindowPosition({ lat, lng });
    setHighlightedBarangay(feature.properties.name);
  };

  if (!isLoaded || patternsLoading) return <p>Loading map...</p>;

  return (
    <div className="w-full" style={{ height: height }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={QC_CENTER}
        zoom={zoom}
        onLoad={(map) => (mapRef.current = map)}
        options={{
          mapTypeControl: !disableMapSwitch,
          mapTypeId: defaultView,
        }}
      >
        {/* Existing map elements */}
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

        {/* Barangay polygons with real data */}
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

            const isHighlighted =
              feature.properties.name === highlightedBarangay;

            return (
              <Polygon
                key={`${index}-${i}`}
                paths={path}
                options={{
                  strokeColor: isHighlighted
                    ? "#6194B0"
                    : feature.properties.color,
                  strokeOpacity: isHighlighted ? 0.9 : 0.6,
                  strokeWeight: isHighlighted ? 3.5 : 1,
                  fillOpacity: 0.5,
                  fillColor: feature.properties.color,
                  strokeDasharray: isHighlighted ? "4 4" : "0",
                }}
                onClick={() => handlePolygonClick(feature)}
              />
            );
          });
        })}

        {/* InfoWindow with real data */}
        {selectedBarangay && infoWindowPosition && (
          <InfoWindow
            position={infoWindowPosition}
            onCloseClick={() => setSelectedBarangay(null)}
          >
            <div
              className={`bg-white p-4 rounded-lg border-2 ${
                selectedBarangay.properties.patternType === "spike"
                  ? "border-error"
                  : selectedBarangay.properties.patternType === "gradual_rise"
                  ? "border-warning"
                  : selectedBarangay.properties.patternType === "decline"
                  ? "border-info"
                  : "border-success"
              } w-[50vw] max-w-160`}
            >
              <p
                className={`${
                  selectedBarangay.properties.patternType === "spike"
                    ? "text-error"
                    : selectedBarangay.properties.patternType === "gradual_rise"
                    ? "text-warning"
                    : selectedBarangay.properties.patternType === "decline"
                    ? "text-info"
                    : "text-success"
                } text-3xl font-bold`}
              >
                Barangay {selectedBarangay.properties.name}
              </p>

              <div className="mt-3 flex flex-col gap-1 text-black">
                <div className="flex items-center gap-3">
                  <div
                    className={`${
                      selectedBarangay.properties.patternType === "spike"
                        ? "text-error"
                        : selectedBarangay.properties.patternType ===
                          "gradual_rise"
                        ? "text-warning"
                        : selectedBarangay.properties.patternType === "decline"
                        ? "text-info"
                        : "text-success"
                    }`}
                  >
                    <Circle weight="fill" size={16} />
                  </div>
                  <p className="text-lg">
                    <span className="font-semibold">Status:</span>{" "}
                    {selectedBarangay.properties.alert || "No recent data"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="bg-white text-success translate-y-1.5">
                    <CheckCircle weight="fill" size={16} />
                  </div>
                  <p className="text-lg">
                    <span className="font-semibold">Pattern:</span>{" "}
                    {selectedBarangay.properties.patternType}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="text-primary translate-y-1.5">
                    <Question size={16} />
                  </div>
                  <p className="text-lg">
                    <span className="font-semibold">Last Analyzed:</span>{" "}
                    {new Date(
                      selectedBarangay.properties.lastAnalysisTime
                    ).toLocaleString() || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default DengueMap;
