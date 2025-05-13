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
import { toastWarn } from "../../utils.jsx";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useGetPatternRecognitionResultsQuery, useGetBarangaysQuery } from "../../api/dengueApi";

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

const Mapping = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedBarangayInfo, setSelectedBarangayInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  // Get pattern recognition data
  const { data: patternData } = useGetPatternRecognitionResultsQuery();
  
  // Get all barangays
  const { data: barangaysList, isLoading: isLoadingBarangays } = useGetBarangaysQuery();

  console.log('Barangays List:', barangaysList); // Debug barangays list
  console.log('Pattern Data:', patternData); // Debug pattern data

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch QC boundaries
        const qcResponse = await fetch("/quezon_city_boundaries.geojson");
        if (!qcResponse.ok) throw new Error('Failed to load QC boundaries');
        const qcData = await qcResponse.json();
        const coords = qcData.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);

        // Fetch barangay data
        const barangayResponse = await fetch("/quezon_barangays_boundaries.geojson");
        if (!barangayResponse.ok) throw new Error('Failed to load barangay data');
        const barangayData = await barangayResponse.json();

        console.log('Raw Barangay Data:', barangayData); // Debug raw barangay data

        // Process barangay data with pattern recognition results
        if (patternData?.data) {
          console.log('Processing with pattern data:', patternData.data); // Debug pattern data processing
          
          const processedData = {
            ...barangayData,
            features: barangayData.features.map(feature => {
              const barangayName = feature.properties.name;
              console.log('Processing barangay:', barangayName); // Debug each barangay
              
              const patternInfo = patternData.data.find(item => {
                console.log('Comparing with pattern item:', item); // Debug comparison
                return item.name?.toLowerCase() === barangayName?.toLowerCase();
              });

              console.log('Found pattern info:', patternInfo); // Debug found pattern info

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
          console.log('Processed Data:', processedData); // Debug final processed data
          setBarangayData(processedData);
        } else {
          console.log('No pattern data available, using raw barangay data'); // Debug no pattern data case
          setBarangayData(barangayData);
        }

        // Get user location
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const p = { lat: coords.latitude, lng: coords.longitude };
            
            // Check if location is within QC bounds
            if (
              p.lat < QC_BOUNDS.south ||
              p.lat > QC_BOUNDS.north ||
              p.lng < QC_BOUNDS.west ||
              p.lng > QC_BOUNDS.east
            ) {
              setCurrentPosition(QC_CENTER);
              toastWarn("Location is outside Quezon City.");
              mapRef.current?.panTo(QC_CENTER);
            } else {
              setCurrentPosition(p);
              handleLocationSelect(p);
            }
          },
          () => {
            setCurrentPosition(QC_CENTER);
            toastWarn("Unable to get your location. Default location set to QC center.");
            mapRef.current?.panTo(QC_CENTER);
          }
        );
      } catch (err) {
        console.error('Error in fetchData:', err); // Debug errors
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patternData]);

  // Handle barangay selection
  const handleBarangaySelect = (e) => {
    const selectedBarangayName = e.target.value;
    console.log('Selected Barangay:', selectedBarangayName); // Debug selected barangay

    if (!selectedBarangayName || !barangayData) return;

    const matchingBarangay = barangayData.features.find(feature => 
      feature.properties.name === selectedBarangayName
    );

    console.log('Matching Barangay Feature:', matchingBarangay); // Debug matching feature

    if (matchingBarangay) {
      const center = turf.center(matchingBarangay.geometry);
      const { coordinates } = center.geometry;
      const [lng, lat] = coordinates;

      console.log('Found coordinates:', { lat, lng }); // Debug coordinates

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(15);
        setSelectedBarangayInfo({
          name: matchingBarangay.properties.name,
          position: { lat, lng },
          riskLevel: matchingBarangay.properties.riskLevel,
          patternType: matchingBarangay.properties.patternType,
          alert: matchingBarangay.properties.alert
        });
      }
    }
  };

  const handleLocationSelect = (coords) => {
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
            setSelectedBarangayInfo({
              name: f.properties.name,
              position: coords,
              riskLevel: f.properties.riskLevel,
              patternType: f.properties.patternType,
              alert: f.properties.alert
            });
            return true;
          }
        }
      }
      toastWarn("Location is in QC but not inside any barangay.");
      return true;
    }
    return true;
  };

  const toggleFullScreen = () => setIsFullScreen((prev) => !prev);

  if (!isLoaded) return <LoadingSpinner size={32} className="h-screen" />;
  if (loading) return <LoadingSpinner size={32} className="h-screen" />;
  if (error) return <ErrorMessage error={error} className="m-4" />;
  if (!currentPosition) return <ErrorMessage error="Unable to get your location" className="m-4" />;

  return (
    <div className="flex flex-col pt-8 px-8 items-center bg-primary text-white h-[91.8vh] mt-[-13px] text-center">
      <h1 className="text-7xl md:text-8xl">Check your place</h1>
      <p className="text-lg md:text-xl mb-4">
        Stay Protected. Look out for Dengue Outbreaks.
      </p>

      <div className="w-full max-w-md mb-4">
        <select
          value={searchQuery}
          onChange={handleBarangaySelect}
          className="w-full px-4 py-2 rounded-md shadow bg-white text-black"
        >
          <option value="">Select a barangay</option>
          {barangaysList?.map((barangay) => (
            <option key={barangay._id} value={barangay.name}>
              {barangay.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white text-black rounded-md shadow px-4 py-3 w-full max-w-md mb-4">
        <p className="font-semibold mb-2">Risk Levels</p>
        <div className="flex items-center justify-between gap-4">
          {Object.entries(RISK_LEVEL_COLORS)
            .sort(([a], [b]) => {
              const order = { low: 0, medium: 1, high: 2 };
              return order[a] - order[b];
            })
            .map(([level, color]) => (
              <div key={level} className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: color }}
                  className="w-4 h-4 inline-block rounded"
                />
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </div>
            ))}
        </div>
      </div>

      <div className="w-full z-[10] h-[68vh] rounded-md shadow-md relative">
      

        <GoogleMap
          mapContainerStyle={{
            ...containerStyle,
            height: isFullScreen ? "100vh" : "100%",
          }}
          center={currentPosition}
          zoom={13}
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
                    fillColor: RISK_LEVEL_COLORS[feature.properties.riskLevel] || RISK_LEVEL_COLORS.unknown,
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
                    RISK_LEVEL_COLORS[selectedBarangayInfo.riskLevel] || RISK_LEVEL_COLORS.unknown
                  }`,
                  width: "50vw",
                  maxWidth: 640,
                }}
              >
                <p
                  className={`text-3xl font-bold`}
                  style={{
                    color: RISK_LEVEL_COLORS[selectedBarangayInfo.riskLevel] || RISK_LEVEL_COLORS.unknown
                  }}
                >
                  Barangay {selectedBarangayInfo.name}
                </p>

                <div className="mt-3 flex flex-col gap-3 text-black">
                  {/* Status Card */}
                  <div className={`p-3 rounded-lg border-2 ${
                    selectedBarangayInfo.alert === "No recent data"
                      ? "border-gray-400 bg-gray-100"
                      : selectedBarangayInfo.patternType === "spike"
                      ? "border-error bg-error/5"
                      : selectedBarangayInfo.patternType === "gradual_rise"
                      ? "border-warning bg-warning/5"
                      : selectedBarangayInfo.patternType === "decline"
                      ? "border-success bg-success/5"
                      : selectedBarangayInfo.patternType === "stability"
                      ? "border-info bg-info/5"
                      : "border-gray-400 bg-gray-100"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`${
                        selectedBarangayInfo.alert === "No recent data"
                          ? "text-gray-400"
                        : selectedBarangayInfo.patternType === "spike"
                        ? "text-error"
                        : selectedBarangayInfo.patternType === "gradual_rise"
                        ? "text-warning"
                        : selectedBarangayInfo.patternType === "decline"
                        ? "text-success"
                        : selectedBarangayInfo.patternType === "stability"
                        ? "text-info"
                        : "text-gray-400"
                      }`}>
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
                    <div className={`p-3 rounded-lg border-2 ${
                      selectedBarangayInfo.alert === "No recent data"
                        ? "border-gray-400 bg-gray-100"
                        : selectedBarangayInfo.patternType === "spike"
                        ? "border-error bg-error/5"
                        : selectedBarangayInfo.patternType === "gradual_rise"
                        ? "border-warning bg-warning/5"
                        : selectedBarangayInfo.patternType === "decline"
                        ? "border-success bg-success/5"
                        : selectedBarangayInfo.patternType === "stability"
                        ? "border-info bg-info/5"
                        : "border-gray-400 bg-gray-100"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`${
                          selectedBarangayInfo.alert === "No recent data"
                            ? "text-gray-400"
                          : selectedBarangayInfo.patternType === "spike"
                          ? "text-error"
                          : selectedBarangayInfo.patternType === "gradual_rise"
                          ? "text-warning"
                          : selectedBarangayInfo.patternType === "decline"
                          ? "text-success"
                          : selectedBarangayInfo.patternType === "stability"
                          ? "text-info"
                          : "text-gray-400"
                        }`}>
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
                    <div className={`p-3 rounded-lg border-2 ${
                      selectedBarangayInfo.riskLevel === "high"
                        ? "border-error bg-error/5"
                        : selectedBarangayInfo.riskLevel === "medium"
                        ? "border-warning bg-warning/5"
                        : "border-success bg-success/5"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`${
                          selectedBarangayInfo.riskLevel === "high"
                            ? "text-error"
                            : selectedBarangayInfo.riskLevel === "medium"
                            ? "text-warning"
                            : "text-success"
                        }`}>
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
      </div>
    </div>
  );
};

export default Mapping;
