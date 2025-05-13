import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Polygon,
  Rectangle,
  InfoWindow,
} from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import * as turf from "@turf/turf";
import { useGetPatternRecognitionResultsQuery, useGetBarangaysQuery } from "../api/dengueApi";

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

const RISK_LEVEL_COLORS = {
  low: "#38a169",       // green
  medium: "#dd6b20",    // orange
  high: "#e53e3e",      // red
};

const RiskMap = ({ height = "400px" }) => {
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [selectedBarangayInfo, setSelectedBarangayInfo] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(QC_CENTER);
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  const { data: patternData } = useGetPatternRecognitionResultsQuery();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch QC boundaries
      const qcResponse = await fetch("/quezon_city_boundaries.geojson");
      const qcData = await qcResponse.json();
      const coords = qcData.features[0].geometry.coordinates[0].map(
        ([lng, lat]) => ({ lat, lng })
      );
      setQcPolygonPaths(coords);

      // Fetch barangay data
      const barangayResponse = await fetch("/quezon_barangays_boundaries.geojson");
      const barangayData = await barangayResponse.json();

      // Process barangay data with pattern recognition results
      if (patternData?.data) {
        const processedData = {
          ...barangayData,
          features: barangayData.features.map(feature => {
            const barangayName = feature.properties.name;
            const patternInfo = patternData.data.find(item => 
              item.name?.toLowerCase() === barangayName?.toLowerCase()
            );

            return {
              ...feature,
              properties: {
                ...feature.properties,
                riskLevel: patternInfo?.risk_level?.toLowerCase() || 'unknown',
                patternType: patternInfo?.triggered_pattern?.toLowerCase() || 'none',
                alert: patternInfo?.alert || 'No recent data',
                lastAnalysisTime: patternInfo?.last_analysis_time
              }
            };
          })
        };
        setBarangayData(processedData);
      } else {
        setBarangayData(barangayData);
      }
    };

    fetchData();
  }, [patternData]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{
        ...containerStyle,
        height,
      }}
      center={currentPosition}
      zoom={12}
      onLoad={(map) => (mapRef.current = map)}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        scaleControl: false,
        rotateControl: false,
        clickableIcons: false,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "poi.medical",
            elementType: "all",
            stylers: [{ visibility: "on" }]
          },
          {
            featureType: "poi.health",
            elementType: "all",
            stylers: [{ visibility: "on" }]
          },
          {
            featureType: "poi.hospital",
            elementType: "all",
            stylers: [{ visibility: "on" }]
          },
          {
            featureType: "transit",
            elementType: "all",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "administrative.locality",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          },
          {
            featureType: "administrative.neighborhood",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
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
                fillColor: RISK_LEVEL_COLORS[feature.properties.riskLevel] || RISK_LEVEL_COLORS.low,
              }}
              onClick={() => {
                const center = turf.center(feature.geometry);
                const { coordinates } = center.geometry;
                const [lng, lat] = coordinates;
                setSelectedBarangayInfo({
                  name: feature.properties.name,
                  position: { lat, lng },
                  riskLevel: feature.properties.riskLevel,
                  patternType: feature.properties.patternType,
                  alert: feature.properties.alert
                });
              }}
            />
          );
        });
      })}

      {selectedBarangayInfo && (
        <InfoWindow
          position={selectedBarangayInfo.position}
          onCloseClick={() => setSelectedBarangayInfo(null)}
        >
          <div
            className="bg-white p-4 rounded-lg text-center"
            style={{
              border: `3px solid ${
                RISK_LEVEL_COLORS[selectedBarangayInfo.riskLevel] || RISK_LEVEL_COLORS.low
              }`,
              width: "50vw",
              maxWidth: 640,
            }}
          >
            <p
              className={`text-3xl font-bold`}
              style={{
                color: RISK_LEVEL_COLORS[selectedBarangayInfo.riskLevel] || RISK_LEVEL_COLORS.low
              }}
            >
              Barangay {selectedBarangayInfo.name}
            </p>

            <div className="mt-3 flex flex-col gap-3 text-black">
              {/* Status Card */}
              <div className="p-3 rounded-lg border-2 border-gray-400 bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    <span className="inline-block w-4 h-4 rounded-full"></span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-lg font-semibold">
                      {selectedBarangayInfo.alert
                        ? selectedBarangayInfo.alert.replace(
                            new RegExp(`^${selectedBarangayInfo.name}:?\\s*`, "i"),
                            ""
                          )
                        : "No recent data"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Pattern and Risk Level Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Pattern Card */}
                <div className="p-3 rounded-lg border-2 border-gray-400 bg-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400">
                      <span className="inline-block w-4 h-4 rounded-full"></span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pattern</p>
                      <p className="text-lg font-semibold">
                        {selectedBarangayInfo.alert === "No recent data"
                          ? "No recent data"
                          : selectedBarangayInfo.patternType === "none" 
                          ? "No pattern detected" 
                          : selectedBarangayInfo.patternType.charAt(0).toUpperCase() + 
                            selectedBarangayInfo.patternType.slice(1).replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Risk Level Card */}
                <div className="p-3 rounded-lg border-2 border-gray-400 bg-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400">
                      <span className="inline-block w-4 h-4 rounded-full"></span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Risk Level</p>
                      <p className="text-lg font-semibold">
                        {selectedBarangayInfo.riskLevel?.toUpperCase() || "UNKNOWN"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default RiskMap; 