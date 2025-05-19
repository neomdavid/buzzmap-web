import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  GoogleMap,
  Polygon,
  Rectangle,
  InfoWindow,
  Marker,
  MarkerClustererF,
} from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import * as turf from "@turf/turf";
import { useGetPatternRecognitionResultsQuery, useGetPostsQuery } from "../api/dengueApi";
import DengueMapLegend from "./DengueMapLegend";

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

const PATTERN_COLORS = {
  spike: "#e53e3e", // error - red
  gradual_rise: "#dd6b20", // warning - orange
  decline: "#38a169", // success - green
  stability: "#3182ce", // info - blue
  default: "#718096", // gray
};

// Intervention status color mapping
const INTERVENTION_STATUS_COLORS = {
  scheduled: "#8b5cf6", // Purple-500
  ongoing: "#f59e0b",   // Amber-500
  default: "#6b7280",  // Gray-500
};

// Risk level color mapping - To be removed if not used elsewhere
/*
const RISK_LEVEL_COLORS = {
  high: "#e53e3e",      // red
  medium: "#dd6b20",    // orange
  low: "#38a169",       // green
  unknown: "#718096",   // gray
};
*/

// Breeding site type color mapping
const BREEDING_SITE_TYPE_COLORS = {
  "Breeding Site": "#2563eb",      // blue
  "Standing Water": "#14b8a6",     // teal
  "Infestation": "#e11d48",        // red
};

// Helper function to extract barangay name from GeoJSON feature
const getBarangayName = (feature) => {
  // Case 1: Direct name in properties
  if (feature.properties?.name) {
    return feature.properties.name;
  }

  // Case 2: Name in @relations array
  if (feature.properties?.["@relations"]) {
    const relation = feature.properties["@relations"].find(
      (rel) => rel.reltags?.name
    );
    if (relation?.reltags?.name) {
      return relation.reltags.name;
    }
  }
  // Case 3: Try to extract from other properties
  return feature.properties?.ref || feature.id || "Unknown";
};

const DengueMap = ({
  height = "100%",
  zoom = 12,
  disableMapSwitch = false,
  defaultView = "roadmap",
  showLegends = true,
  onBarangaySelect,
  handlePolygonClick: customHandlePolygonClick,
  searchQuery = "",
  CustomInfoWindow,
  getPolygonOptions,
  selectedMapItem,
  onMapLoad,
  activeInterventions,
  isLoadingInterventions,
  initialFocusBarangayName,
  hideTabs = false,
}) => {
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [highlightedBarangay, setHighlightedBarangay] = useState(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [initialFocusApplied, setInitialFocusApplied] = useState(false);
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  const { data: patternData, isLoading: patternsLoading } =
    useGetPatternRecognitionResultsQuery();

  const { data: posts, isLoading: isLoadingPosts } = useGetPostsQuery();
  
  // Add logging for posts data
  useEffect(() => {
    console.log("[DengueMap DEBUG] Posts data received:", posts);
  }, [posts]);

  // Add logging for activeInterventions prop
  useEffect(() => {
    console.log("[DengueMap DEBUG] activeInterventions prop received:", {
      activeInterventions,
      isLoadingInterventions,
      type: typeof activeInterventions,
      isArray: Array.isArray(activeInterventions),
      length: activeInterventions?.length
    });
  }, [activeInterventions, isLoadingInterventions]);

  // Initialize breeding sites from posts
  useEffect(() => {
    if (posts) {
      const breedingSitesFromPosts = posts.filter(post => 
        post.status === "Validated" && 
        post.specific_location?.coordinates &&
        (post.report_type === "Breeding Site" || post.report_type === "Standing Water" || post.report_type === "Infestation")
      );
      console.log("[DengueMap DEBUG] Filtered breeding sites:", breedingSitesFromPosts);
      setBreedingSites(breedingSitesFromPosts);
    }
  }, [posts]);

  const [activeTab, setActiveTab] = useState("cases");
  const [breedingSites, setBreedingSites] = useState([]);
  const [selectedBreedingSite, setSelectedBreedingSite] = useState(null);
  const [selectedBreedingBarangay, setSelectedBreedingBarangay] = useState(null);
  const [breedingBarangayInfoWindow, setBreedingBarangayInfoWindow] = useState(null);
  const [selectedBreedingSitesBarangay, setSelectedBreedingSitesBarangay] = useState(null);
  const [breedingSitesInfoWindowPosition, setBreedingSitesInfoWindowPosition] = useState(null);

  const breedingSitesCountByBarangay = React.useMemo(() => {
    const counts = {};
    breedingSites.forEach(site => {
      if (site.barangay) {
        counts[site.barangay] = (counts[site.barangay] || 0) + 1;
      }
    });
    return counts;
  }, [breedingSites]);

  // State to track which barangay marker is selected
  const [selectedBarangayMarker, setSelectedBarangayMarker] = useState(null);

  // State for selected intervention and its InfoWindow
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  // Log initialFocusBarangayName prop
  useEffect(() => {
    console.log("[DengueMap DEBUG] Received initialFocusBarangayName prop:", initialFocusBarangayName);
  }, [initialFocusBarangayName]);

  useEffect(() => {
    console.log("[DengueMap DEBUG] Fetching GeoJSON and processing barangayData. patternsLoading:", patternsLoading);
    if (!patternsLoading && patternData?.data) { // Only process if patternData is loaded
      fetch("/quezon_barangays_boundaries.geojson")
        .then((res) => res.json())
        .then((geoJsonData) => { // Renamed to avoid confusion with 'data' from RTK
          // const coords = geoJsonData.features[0].geometry.coordinates[0].map(
          //   ([lng, lat]) => ({ lat, lng })
          // );
          // setQcPolygonPaths(coords); // qcPolygonPaths seems unused later for individual barangays
          processBarangayData(geoJsonData, patternData.data);
        })
        .catch(err => console.error("Error fetching or processing GeoJSON:", err));
    } else if (!patternsLoading && !patternData?.data) {
      console.warn("[DengueMap DEBUG] Pattern data not available for processing GeoJSON yet, or no data.");
      // Potentially fetch GeoJSON anyway and set barangayData without patterns if needed
      // fetch("/quezon_barangays_boundaries.geojson").then(res => res.json()).then(geoJsonData => processBarangayData(geoJsonData, []));
    }
  }, [patternData, patternsLoading]); // Depends on patternData and its loading state

  const processBarangayData = useCallback((geoData, patternResults) => { // Memoize this if it's stable
    console.log("[DengueMap DEBUG] processBarangayData called");
    const colored = {
      ...geoData,
      features: geoData.features.map((f) => {
        const barangayName = getBarangayName(f);
        const normalizedBarangayName = barangayName.toLowerCase().replace(/[^a-z0-9]/g, "");
        let foundPatternInfo = patternResults.find((item) => {
          const normalizedItemName = item.name?.toLowerCase().replace(/[^a-z0-9]/g, "");
          return normalizedItemName === normalizedBarangayName;
        });
        if (!foundPatternInfo) {
         foundPatternInfo = patternResults.find((item) => { // Corrected variable name
            const normalizedItemName = item.name?.toLowerCase().replace("barangay", "").replace(/[^a-z0-9]/g, "").trim();
            return normalizedItemName === normalizedBarangayName;
          });
        }
        let patternType = foundPatternInfo?.triggered_pattern?.toLowerCase() || "None";
        const color = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
        return {
          ...f,
          properties: {
            ...f.properties,
            displayName: barangayName,
            patternType,
            color,
            alert: foundPatternInfo?.alert || "No recent data",
            lastAnalysisTime: foundPatternInfo?.last_analysis_time,
          },
        };
      }),
    };
    setBarangayData(colored);
  }, []); // Empty dependency array if getBarangayName and PATTERN_COLORS are stable and defined outside

  const defaultHandlePolygonClick = useCallback((feature) => {
    console.log("[DengueMap DEBUG] defaultHandlePolygonClick for:", feature?.properties?.displayName);
    if (!mapRef.current) return;
    const center = turf.center(feature.geometry);
    const { coordinates } = center.geometry;
    const [lng, lat] = coordinates;
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) mapRef.current.panTo({ lat, lng });
    setSelectedBarangay(feature);
    setInfoWindowPosition({ lat, lng });
    setHighlightedBarangay(feature?.properties?.displayName);
    if (onBarangaySelect) onBarangaySelect(feature);
  }, [onBarangaySelect]);

  // Use custom handler if provided, otherwise use default
  const handlePolygonClick = customHandlePolygonClick || defaultHandlePolygonClick;

  // Helper to zoom to a barangay
  const zoomToBarangay = (feature) => {
    const geometry = feature.geometry;
    let bounds = new window.google.maps.LatLngBounds();
    const coordsArray =
      geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];
    coordsArray.forEach((polygonCoords) => {
      polygonCoords[0].forEach(([lng, lat]) => {
        bounds.extend({ lat, lng });
      });
    });
    mapRef.current.fitBounds(bounds);
  };

  // Add this effect to handle search
  useEffect(() => {
    if (!searchQuery || !mapRef.current || !barangayData) return;

    // Find the barangay that matches the search query
    const matchingBarangay = barangayData.features.find(feature => 
      feature.properties.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchingBarangay) {
      // Center the map on the matching barangay
      const center = turf.center(matchingBarangay.geometry);
      const { coordinates } = center.geometry;
      const [lng, lat] = coordinates;

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14); // Zoom in a bit to focus on the barangay
        
        // Select the barangay
        setSelectedBarangay(matchingBarangay);
        setInfoWindowPosition({ lat, lng });
        
        if (onBarangaySelect) {
          onBarangaySelect(matchingBarangay);
        }
      }
    }
  }, [searchQuery, barangayData, onBarangaySelect]);

  // Effect for initial focus
  useEffect(() => {
    if (initialFocusBarangayName && barangayData && !initialFocusApplied && mapRef.current) {
      console.log("[DengueMap DEBUG] APPLYING INITIAL FOCUS:", initialFocusBarangayName);
      const barangayNameToFind = initialFocusBarangayName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchingFeature = barangayData.features.find(feature => {
        const displayNameNormalized = feature.properties.displayName?.toLowerCase().replace(/[^a-z0-9]/g, "");
        const nameNormalized = feature.properties.name?.toLowerCase().replace(/[^a-z0-9]/g, "");
        return displayNameNormalized === barangayNameToFind || nameNormalized === barangayNameToFind;
      });

      if (matchingFeature) {
        defaultHandlePolygonClick(matchingFeature);
      } else {
        console.warn("[DengueMap DEBUG] Initial focus barangay NOT FOUND:", initialFocusBarangayName);
      }
      setInitialFocusApplied(true); // CRITICAL: Set this regardless of find, to run only once per name
    } else {
      // Log why it didn't apply
      if (!initialFocusApplied) { // Only log if we haven't applied focus yet for this component instance
         console.log("[DengueMap DEBUG] Conditions for initial focus NOT YET MET or ALREADY APPLIED.", {
            initialFocusBarangayName: !!initialFocusBarangayName,
            barangayData: !!barangayData,
            initialFocusApplied,
            mapRefCurrent: !!mapRef.current
        });
      }
    }
  }, [initialFocusBarangayName, barangayData, initialFocusApplied, defaultHandlePolygonClick]);

  // Add logging for selectedReport
  useEffect(() => {
    console.log('DengueMap received selectedMapItem:', selectedMapItem);
    if (selectedMapItem) {
      const { type, item } = selectedMapItem;
      if (type === 'report' && item?.specific_location?.coordinates) {
        console.log("DengueMap: selectedMapItem is a report", item);
      } else if (type === 'intervention' && item?.specific_location?.coordinates) {
        setActiveTab('interventions');
        setSelectedIntervention(item);
        console.log("DengueMap: selectedMapItem is an intervention", item);
      } else {
        setSelectedIntervention(null);
      }
    }
  }, [selectedMapItem]);

  // Update the handleMapLoad function
  const handleMapLoad = (map) => {
    console.log('GoogleMap loaded in DengueMap');
    mapRef.current = map;
    if (onMapLoad) {
      onMapLoad(map);
    }
  };

  if (!isLoaded) return <p>Loading Google Maps API...</p>;
  if (patternsLoading && !barangayData) { 
    return <p>Loading map data...</p>;
  }

  const patternType = (selectedBarangay?.properties?.patternType || "").toLowerCase().trim();

  const infoWindowBorderClass =
    selectedBarangay?.properties?.alert === "No recent data"
      ? "border-gray-400"
      : patternType === "spike"
      ? "border-error"
      : patternType === "gradual_rise"
      ? "border-warning"
      : patternType === "decline"
      ? "border-success"
      : patternType === "stability"
      ? "border-info"
      : "border-gray-400";

  const infoWindowTitleClass =
    selectedBarangay?.properties?.alert === "No recent data"
      ? "text-gray-400"
      : patternType === "spike"
      ? "text-error"
      : patternType === "gradual_rise"
      ? "text-warning"
      : patternType === "decline"
      ? "text-success"
      : patternType === "stability"
      ? "text-info"
      : "text-gray-400";

  return (
    <div className="w-full relative" style={{ height: height }}>
      {/* Tabs - Only render if hideTabs is false */}
      {!hideTabs && (
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <button
            onClick={() => setActiveTab("cases")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "cases"
                ? "bg-primary text-white"
                : "bg-white/90 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Dengue Cases
          </button>
          <button
            onClick={() => setActiveTab("breeding-sites")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "breeding-sites"
                ? "bg-primary text-white"
                : "bg-white/90 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Breeding Sites
          </button>
          <button
            onClick={() => setActiveTab("interventions")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "interventions"
                ? "bg-primary text-white"
                : "bg-white/90 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Interventions
          </button>
        </div>
      )}

      {/* Conditional rendering for the map itself based on pattern data loading */}
      {patternsLoading ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p>Loading map data...</p>
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={QC_CENTER}
          zoom={zoom}
          onLoad={handleMapLoad}
          options={{
            mapTypeControl: false,
            mapTypeId: defaultView,
          }}
        >
          {/* Rectangle (optional, can keep or remove) */}
          <Rectangle
            bounds={QC_BOUNDS}
            options={{
              fillOpacity: 0,
              strokeWeight: 0,
              clickable: false,
              zIndex: 2,
            }}
          />

          {/* Always render all barangay polygons with dengue cases coloring */}
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

              // Get the color based on pattern type
              const patternType = (feature?.properties?.patternType || "none").toLowerCase();
              const color = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;

              // Use custom polygon options if provided
              const options = getPolygonOptions 
                ? getPolygonOptions(feature)
                : {
                    strokeColor: color,
                    strokeOpacity: 1,
                    strokeWeight: 1,
                    fillOpacity: 0.5,
                    fillColor: color,
                    zIndex: 5,
                  };

              return (
                <Polygon
                  key={`${index}-${i}`}
                  paths={path}
                  options={options}
                  onClick={() => handlePolygonClick(feature)}
                />
              );
            });
          })}

          {/* InfoWindow for selected barangay in breeding sites tab */}
          {activeTab === "breeding-sites" && selectedBreedingSitesBarangay && breedingSitesInfoWindowPosition && (
            <InfoWindow
              position={breedingSitesInfoWindowPosition}
              onCloseClick={() => setSelectedBreedingSitesBarangay(null)}
            >
              <div
                className="rounded-xl shadow-lg bg-white px-5 py-4 min-w-[180px] border-2 text-center"
                style={{
                  maxWidth: 240,
                  //borderColor: // This section for breeding sites InfoWindow might still use RISK_LEVEL_COLORS or a similar logic
                  //  RISK_LEVEL_COLORS[
                  //    (selectedBreedingSitesBarangay?.properties?.riskLevel || "unknown").toLowerCase()
                  //  ] || RISK_LEVEL_COLORS.unknown,
                  // TEMP: Default border for breeding site InfoWindow until its logic is clarified or removed
                  borderColor: PATTERN_COLORS.default, 
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg"
                      style={{
                        // color: // This section for breeding sites InfoWindow might still use RISK_LEVEL_COLORS
                        //  RISK_LEVEL_COLORS[
                        //    (selectedBreedingSitesBarangay?.properties?.riskLevel || "unknown").toLowerCase()
                        //  ] || RISK_LEVEL_COLORS.unknown,
                        // TEMP: Default color for breeding site InfoWindow title
                        color: PATTERN_COLORS.default,
                      }}
                    >
                      {selectedBreedingSitesBarangay.properties.displayName ||
                        selectedBreedingSitesBarangay.properties.name}
                    </span>
                  </div>
                  <div className="text-gray-700 text-base font-medium mb-1">
                    {(() => {
                      const barangayName =
                        selectedBreedingSitesBarangay.properties.displayName ||
                        selectedBreedingSitesBarangay.properties.name;
                      const count = breedingSitesCountByBarangay[barangayName] || 0;
                      return count > 0
                        ? (
                            <span>
                              <span className="font-bold">{count}</span>
                              {" "}
                              reported breeding site{count !== 1 ? "s" : ""}
                            </span>
                          )
                        : <span className="text-gray-400">No reported breeding sites</span>;
                    })()}
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* InfoWindow for selected barangay in cases tab (dengue info) */}
          {activeTab === "cases" && selectedBarangay && infoWindowPosition && (
            <InfoWindow
              position={infoWindowPosition}
              onCloseClick={() => setSelectedBarangay(null)}
            >
              {CustomInfoWindow ? (
                <CustomInfoWindow
                  feature={selectedBarangay}
                  position={infoWindowPosition}
                  onClose={() => setSelectedBarangay(null)}
                />
              ) : (
                <div
                  className="bg-white p-4 rounded-lg text-center"
                  style={{
                    border: `3px solid ${
                      PATTERN_COLORS[
                        (selectedBarangay?.properties?.patternType || "none").toLowerCase()
                      ] || PATTERN_COLORS.default
                    }`,
                    width: "50vw",
                    maxWidth: 640,
                  }}
                >
                  <p
                    className={`${infoWindowTitleClass} text-3xl font-bold`}
                  >
                    Barangay {selectedBarangay.properties.name}
                  </p>

                  <div className="mt-3 flex flex-col gap-3 text-black">
                    {/* Status Card */}
                    <div className={`p-3 rounded-lg border-2 ${
                      selectedBarangay.properties.alert === "No recent data"
                        ? "border-gray-400 bg-gray-100"
                        : selectedBarangay.properties.patternType === "spike"
                        ? "border-error bg-error/5"
                        : selectedBarangay.properties.patternType === "gradual_rise"
                        ? "border-warning bg-warning/5"
                        : selectedBarangay.properties.patternType === "decline"
                        ? "border-success bg-success/5"
                        : selectedBarangay.properties.patternType === "stability"
                        ? "border-info bg-info/5"
                        : "border-gray-400 bg-gray-100"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`${
                          selectedBarangay.properties.alert === "No recent data"
                            ? "text-gray-400"
                          : selectedBarangay.properties.patternType === "spike"
                          ? "text-error"
                          : selectedBarangay.properties.patternType === "gradual_rise"
                          ? "text-warning"
                          : selectedBarangay.properties.patternType === "decline"
                          ? "text-success"
                          : selectedBarangay.properties.patternType === "stability"
                          ? "text-info"
                          : "text-gray-400"
                        }`}>
                          <span className="inline-block w-4 h-4 rounded-full"></span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Status</p>
                          <p className="text-lg font-semibold">
                            {selectedBarangay.properties.alert
                              ? selectedBarangay.properties.alert.replace(
                                  new RegExp(`^${selectedBarangay.properties.name}:?\\s*`, "i"),
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
                        selectedBarangay.properties.alert === "No recent data"
                          ? "border-gray-400 bg-gray-100"
                          : selectedBarangay.properties.patternType === "spike"
                          ? "border-error bg-error/5"
                          : selectedBarangay.properties.patternType === "gradual_rise"
                          ? "border-warning bg-warning/5"
                          : selectedBarangay.properties.patternType === "decline"
                          ? "border-success bg-success/5"
                          : selectedBarangay.properties.patternType === "stability"
                          ? "border-info bg-info/5"
                          : "border-gray-400 bg-gray-100"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`${
                            selectedBarangay.properties.alert === "No recent data"
                              ? "text-gray-400"
                            : selectedBarangay.properties.patternType === "spike"
                            ? "text-error"
                            : selectedBarangay.properties.patternType === "gradual_rise"
                            ? "text-warning"
                            : selectedBarangay.properties.patternType === "decline"
                            ? "text-success"
                            : selectedBarangay.properties.patternType === "stability"
                            ? "text-info"
                            : "text-gray-400"
                          }`}>
                            <span className="inline-block w-4 h-4 rounded-full"></span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Pattern</p>
                            <p className="text-lg font-semibold">
                              {selectedBarangay.properties.alert === "No recent data"
                                ? "No recent data"
                                : selectedBarangay.properties.patternType === "none" 
                                ? "No pattern detected" 
                                : selectedBarangay.properties.patternType.charAt(0).toUpperCase() + 
                                  selectedBarangay.properties.patternType.slice(1).replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Last Analyzed Card */}
                    <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          <span className="inline-block w-4 h-4 rounded-full"></span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Last Analyzed</p>
                          <p className="text-lg font-semibold">
                            {isNaN(
                              new Date(
                                selectedBarangay.properties.lastAnalysisTime
                              ).getTime()
                            )
                              ? "N/A"
                              : new Date(
                                  selectedBarangay.properties.lastAnalysisTime
                                ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </InfoWindow>
          )}

          {/* Render breeding site pins and their InfoWindows ONLY in breeding sites tab */}
          {activeTab === "breeding-sites" && (
            isLoadingPosts ? (
              <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white p-2 rounded shadow">Loading breeding sites...</p>
            ) : breedingSites.length > 0 ? (
              <MarkerClustererF
                styles={[{
                  url: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m3.png',
                  height: 66,
                  width: 66,
                  textColor: 'white',
                  textSize: 12,
                }]}
                options={{
                  gridSize: 40,
                  minimumClusterSize: 2,
                }}
              >
                {(clusterer) =>
                  breedingSites.map((site, index) => (
                    <Marker
                      key={index}
                      position={{
                        lat: site.specific_location.coordinates[1],
                        lng: site.specific_location.coordinates[0],
                      }}
                      clusterer={clusterer}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: BREEDING_SITE_TYPE_COLORS[site.report_type] || "#2563eb",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#ffffff",
                      }}
                      onClick={() => {
                        console.log("Breeding site details:", site);
                        setSelectedBreedingSite(site);
                        setSelectedBarangayMarker(null);
                        if (mapRef.current) {
                          mapRef.current.panTo({
                            lat: site.specific_location.coordinates[1],
                            lng: site.specific_location.coordinates[0],
                          });
                        }
                      }}
                    />
                  ))
                }
              </MarkerClustererF>
            ) : (
              <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white p-2 rounded shadow">No breeding sites to display.</p>
            )
          )}

          {activeTab === "breeding-sites" && selectedBreedingSite && (
            <InfoWindow
              position={{
                lat: selectedBreedingSite.specific_location.coordinates[1],
                lng: selectedBreedingSite.specific_location.coordinates[0],
              }}
              onCloseClick={() => setSelectedBreedingSite(null)}
            >
              <div
                className="bg-white p-4 rounded-lg border-2 w-[300px] text-center"
                style={{
                  borderColor: BREEDING_SITE_TYPE_COLORS[selectedBreedingSite.report_type] || "#2563eb",
                }}
              >
                <p
                  className="font-bold text-lg mb-2"
                  style={{
                    color: BREEDING_SITE_TYPE_COLORS[selectedBreedingSite.report_type] || "#2563eb",
                  }}
                >
                  {selectedBreedingSite.report_type}
                </p>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">Barangay:</span>{" "}
                    {selectedBreedingSite.barangay}
                  </p>
                  <p>
                    <span className="font-medium">Reported by:</span>{" "}
                    {selectedBreedingSite.user?.username || ""}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {selectedBreedingSite.date_and_time
                      ? new Date(selectedBreedingSite.date_and_time).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "long",
                          }
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Description:</span>{" "}
                    {selectedBreedingSite.description}
                  </p>
                  {/* Show images if available */}
                  {selectedBreedingSite.images && selectedBreedingSite.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedBreedingSite.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`evidence-${idx + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Show selected report marker - This might need adjustment based on selectedMapItem */}
          {selectedMapItem && selectedMapItem.type === 'report' && (
            <>
              {console.log('Rendering selected report marker from selectedMapItem:', selectedMapItem.item)}
              <Marker
                position={{
                  lat: selectedMapItem.item.specific_location.coordinates[1],
                  lng: selectedMapItem.item.specific_location.coordinates[0]
                }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: BREEDING_SITE_TYPE_COLORS[selectedMapItem.item.report_type] || "#e53e3e", // Adjusted fallback
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#fff",
                }}
              />
            </>
          )}

          {/* Render active intervention markers */} 
          {activeTab === 'interventions' && (
            isLoadingInterventions ? (
              <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white p-2 rounded shadow">Loading interventions...</p>
            ) : activeInterventions && Array.isArray(activeInterventions) && activeInterventions.length > 0 ? (
              <>
                {console.log("[DengueMap DEBUG] Active interventions data:", {
                  data: activeInterventions,
                  length: activeInterventions.length,
                  firstItem: activeInterventions[0],
                  hasCoordinates: activeInterventions[0]?.specific_location?.coordinates,
                  activeTab,
                  isLoadingInterventions
                })}
                <MarkerClustererF
                  styles={[{
                    url: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m3.png',
                    height: 66,
                    width: 66,
                    textColor: 'white',
                    textSize: 12,
                  }]}
                  options={{
                    gridSize: 40,
                    minimumClusterSize: 2,
                  }}
                >
                  {(clusterer) =>
                    activeInterventions.map((intervention, index) => {
                      console.log("[DengueMap DEBUG] Processing intervention:", {
                        id: intervention._id,
                        status: intervention.status,
                        coordinates: intervention.specific_location?.coordinates,
                        interventionType: intervention.interventionType,
                        date: intervention.date
                      });
                      
                      if (!intervention.specific_location?.coordinates) {
                        console.log("[DengueMap DEBUG] Skipping intervention due to missing coordinates:", intervention);
                        return null;
                      }
                      
                      return (
                        <Marker
                          key={intervention._id || index}
                          position={{
                            lat: intervention.specific_location.coordinates[1],
                            lng: intervention.specific_location.coordinates[0],
                          }}
                          clusterer={clusterer}
                          icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: INTERVENTION_STATUS_COLORS[intervention.status?.toLowerCase()] || INTERVENTION_STATUS_COLORS.default,
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#ffffff",
                          }}
                          onClick={() => {
                            console.log("[DengueMap DEBUG] Intervention clicked:", intervention);
                            setSelectedIntervention(intervention);
                            setSelectedBarangayMarker(null);
                            if (mapRef.current) {
                              mapRef.current.panTo({
                                lat: intervention.specific_location.coordinates[1],
                                lng: intervention.specific_location.coordinates[0],
                              });
                            }
                          }}
                        />
                      );
                    })
                  }
                </MarkerClustererF>
              </>
            ) : (
              <>
                {console.log("[DengueMap DEBUG] No active interventions. Data received:", {
                  activeInterventions,
                  isLoadingInterventions,
                  isArray: Array.isArray(activeInterventions),
                  hasData: !!activeInterventions,
                  length: activeInterventions?.length,
                  activeTab,
                  type: typeof activeInterventions
                })}
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white p-2 rounded shadow">No active interventions to display.</p>
              </>
            )
          )}

          {/* InfoWindow for SELECTED intervention */} 
          {activeTab === 'interventions' && selectedIntervention && selectedIntervention.specific_location?.coordinates && (
            <InfoWindow
              position={{
                lat: selectedIntervention.specific_location.coordinates[1],
                lng: selectedIntervention.specific_location.coordinates[0],
              }}
              onCloseClick={() => {
                console.log("[DengueMap DEBUG] Closing intervention InfoWindow");
                setSelectedIntervention(null);
              }}
            >
              <div className="p-3 bg-white rounded-md shadow-md w-64">
                <p className="text-lg font-bold text-primary mb-1">{selectedIntervention.interventionType}</p>
                <p className="text-sm"><span className="font-semibold">Status:</span> {selectedIntervention.status}</p>
                <p className="text-sm"><span className="font-semibold">Barangay:</span> {selectedIntervention.barangay}</p>
                {selectedIntervention.address && <p className="text-sm"><span className="font-semibold">Address:</span> {selectedIntervention.address}</p>}
                <p className="text-sm"><span className="font-semibold">Date:</span> {new Date(selectedIntervention.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                <p className="text-sm"><span className="font-semibold">Personnel:</span> {selectedIntervention.personnel}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )} {/* End of patternsLoading conditional rendering */}

      {/* Legends - only show when showLegends prop is true and we're on cases tab */}
      {showLegends && activeTab === "cases" && (
        <div className="absolute top-16 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-3">Pattern Recognition</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span style={{ backgroundColor: PATTERN_COLORS.spike, width: '12px', height: '12px' }} className="inline-block"></span>
                <span>Spike</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ backgroundColor: PATTERN_COLORS.gradual_rise, width: '12px', height: '12px' }} className="inline-block"></span>
                <span>Gradual Rise</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ backgroundColor: PATTERN_COLORS.decline, width: '12px', height: '12px' }} className="inline-block"></span>
                <span>Decline</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ backgroundColor: PATTERN_COLORS.stability, width: '12px', height: '12px' }} className="inline-block"></span>
                <span>Stability</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breeding Sites Count - only show when on breeding sites tab */}
      {activeTab === "breeding-sites" && (
        <div className="absolute top-16 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Breeding Sites</p>
            <p className="text-gray-600">Total: {breedingSites.length}</p>
          </div>
        </div>
      )}

      {/* Breeding Sites Legend (add this in breeding sites tab) */}
      {activeTab === "breeding-sites" && (
        <div className="absolute top-16 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-3">Breeding Site Types</p>
            <div className="space-y-2">
              {Object.entries(BREEDING_SITE_TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: color }}></span>
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Intervention Legend (add this for interventions tab) */}
      {showLegends && activeTab === "interventions" && (
        <div className="absolute top-16 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-3">Intervention Status</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: INTERVENTION_STATUS_COLORS.scheduled }}></span>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: INTERVENTION_STATUS_COLORS.ongoing }}></span>
                <span>Ongoing</span>
              </div>
              {/* Add other statuses if needed */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DengueMap;
