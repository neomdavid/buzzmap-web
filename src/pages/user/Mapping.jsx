import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Polygon,
  Marker,
  Rectangle,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";
import { useGoogleMaps } from "../../components/GoogleMapsProvider";
import * as turf from "@turf/turf";
import { toastWarn } from "../../utils.jsx";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useGetPatternRecognitionResultsQuery, useGetBarangaysQuery, useGetPostsQuery } from "../../api/dengueApi";
import { MapPin } from "phosphor-react";
import { useNavigate } from "react-router-dom";

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

// Helper function to normalize barangay names for comparison
const normalizeBarangayName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\bsr\.?\b/g, '') // Remove sr. or sr
    .replace(/\bjr\.?\b/g, '') // Remove jr. or jr
    // Add more replacements if needed, e.g., for Roman numerals or other common variations
    .replace(/[.\-']/g, '')    // Remove periods, hyphens, apostrophes
    .replace(/\s+/g, ' ')      // Normalize multiple spaces to single space
    .trim();
};

const PATTERN_COLORS = {
  spike: "#e53e3e",        // red (error)
  gradual_rise: "#dd6b20", // orange (warning)
  decline: "#38a169",      // green (success)
  stability: "#3182ce",    // blue (info)
  none: "#718096",         // gray (default for no pattern)
  default: "#718096",      // gray (fallback)
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
  const [userMarker, setUserMarker] = useState(null);
  const [showBreedingSites, setShowBreedingSites] = useState(false);
  const [breedingSites, setBreedingSites] = useState([]);
  const [selectedBreedingSite, setSelectedBreedingSite] = useState(null);
  const [selectedBarangayId, setSelectedBarangayId] = useState(null);
  const navigate = useNavigate();

  // Get pattern recognition data
  const { data: patternData } = useGetPatternRecognitionResultsQuery();
  
  // Get all barangays
  const { data: barangaysList, isLoading: isLoadingBarangays } = useGetBarangaysQuery();

  // Get posts
  const { data: posts } = useGetPostsQuery();

  console.log('Barangays List:', barangaysList); // Debug barangays list
  console.log('Pattern Data:', patternData); // Debug pattern data

  // Create a separate function for location handling
  const handleLocation = (coords) => {
    // Check if location is within QC bounds
    if (
      coords.lat < QC_BOUNDS.south ||
      coords.lat > QC_BOUNDS.north ||
      coords.lng < QC_BOUNDS.west ||
      coords.lng > QC_BOUNDS.east
    ) {
      setCurrentPosition(QC_CENTER);
      toastWarn("Location is outside Quezon City.");
      mapRef.current?.panTo(QC_CENTER);
      return false;
    }
    return true;
  };

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
              const geoJsonBarangayName = feature.properties.name;
              const normalizedGeoJsonName = normalizeBarangayName(geoJsonBarangayName);
              console.log(`Processing GeoJSON barangay: '${geoJsonBarangayName}' (Normalized: '${normalizedGeoJsonName}')`);
              
              const patternInfo = patternData.data.find(item => {
                const patternItemName = item.name;
                const normalizedPatternName = normalizeBarangayName(patternItemName);
                // console.log(`Comparing with pattern item: '${patternItemName}' (Normalized: '${normalizedPatternName}')`); // Uncomment for deep debugging
                return normalizedPatternName === normalizedGeoJsonName;
              });

              if (!patternInfo) {
                console.log(`No pattern found for barangay: '${geoJsonBarangayName}'`);
              }

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

        // Get user location - only once
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const p = { lat: coords.latitude, lng: coords.longitude };
            if (handleLocation(p)) {
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

        // Process breeding sites
        if (posts) {
          const validatedSites = posts.filter(post => {
            return post.status === "Validated" &&
              post.specific_location &&
              Array.isArray(post.specific_location.coordinates) &&
              post.specific_location.coordinates.length === 2;
          });
          setBreedingSites(validatedSites);
        }
      } catch (err) {
        console.error('Error in fetchData:', err); // Debug errors
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patternData, posts]);

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

  const showCurrentLocation = () => {
    if (!navigator.geolocation) {
      toastWarn("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        
        // Check if location is within QC bounds
        if (
          position.lat < QC_BOUNDS.south ||
          position.lat > QC_BOUNDS.north ||
          position.lng < QC_BOUNDS.west ||
          position.lng > QC_BOUNDS.east
        ) {
          toastWarn("Your location is outside Quezon City");
          return;
        }

        // Set the user marker
        setUserMarker(position);
        
        // Pan the map to the user's location
        if (mapRef.current) {
          mapRef.current.panTo(position);
          mapRef.current.setZoom(15); // Zoom in a bit to show the location better
        }
      },
      () => {
        toastWarn("Unable to get your location");
      }
    );
  };

  // Add this helper function at the top of your component
  const getDarkerColor = (color) => {
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Darken the color by reducing RGB values
    const darkenAmount = 0.3; // Adjust this value to control darkness
    const darkerR = Math.floor(r * (1 - darkenAmount));
    const darkerG = Math.floor(g * (1 - darkenAmount));
    const darkerB = Math.floor(b * (1 - darkenAmount));
    
    // Convert back to hex
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  };

  if (!isLoaded) return <LoadingSpinner size={32} className="h-screen" />;
  if (loading) return <LoadingSpinner size={32} className="h-screen" />;
  if (error) return <ErrorMessage error={error} className="m-4" />;
  if (!currentPosition) return <ErrorMessage error="Unable to get your location" className="m-4" />;

  return (
    <div className="flex flex-col pt-8 px-8 items-center bg-primary text-white h-[93vh] mt-[-13px] text-center pb-5">
      <h1 className="text-7xl md:text-8xl">Check your place</h1>
      <p className="text-lg md:text-xl mb-4">
        Stay Protected. Look out for Dengue Outbreaks.
      </p>

      <div className="w-full max-w-md mb-4">
        <button
          onClick={() => setShowBreedingSites(!showBreedingSites)}
          className={`w-full px-4 py-2 rounded-md shadow transition-colors ${
            showBreedingSites
              ? "bg-white text-primary"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          {showBreedingSites ? "Hide Breeding Sites" : "Show Breeding Sites"}
        </button>
      </div>

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

      {/* Updated Legend for Pattern Types */}
      <div className="bg-white text-black rounded-md shadow px-4 py-3 w-full max-w-md mb-4">
        <p className="font-semibold mb-2">Pattern Types</p>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {Object.entries(PATTERN_COLORS)
            .filter(([key]) => key !== 'default') // Exclude 'default' from legend
            .sort(([aKey], [bKey]) => { 
              // Updated order: None, Stability, Decline, Gradual Rise, Spike
              const order = { none: 0, stability: 1, decline: 2, gradual_rise: 3, spike: 4 };
              return order[aKey] - order[bKey];
            })
            .map(([pattern, color]) => (
              <div key={pattern} className="flex items-center gap-1">
                <span
                  style={{ backgroundColor: color }}
                  className="w-3 h-3 inline-block rounded-full"
                />
                <span className="text-xs">
                  {pattern.charAt(0).toUpperCase() + pattern.slice(1).replace('_', ' ')}
                </span>
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
          onClick={() => {
            setSelectedBarangayInfo(null);
            setSelectedBarangayId(null);
          }}
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
              const isSelected = selectedBarangayId === `${index}-${i}`;
              // Use patternType for color determination
              const patternColor = PATTERN_COLORS[feature.properties.patternType?.toLowerCase()] || PATTERN_COLORS.default;
              
              return (
                <Polygon
                  key={`${index}-${i}`}
                  paths={path}
                  options={{
                    // Use patternColor for stroke and fill
                    strokeColor: isSelected ? getDarkerColor(patternColor) : "#333",
                    strokeOpacity: isSelected ? 1 : 0.6,
                    strokeWeight: isSelected ? 3 : 1,
                    fillOpacity: 0.5,
                    fillColor: patternColor, 
                    clickable: true,
                  }}
                  onClick={(e) => {
                    // Stop event propagation to prevent the map click handler from firing
                    e.stop();
                    
                    const center = turf.center(feature.geometry);
                    const { coordinates } = center.geometry;
                    const [lng, lat] = coordinates;

                    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                      console.error('Invalid coordinates:', { lat, lng });
                      return;
                    }

                    // Set the selected barangay ID
                    setSelectedBarangayId(`${index}-${i}`);

                    setSelectedBarangayInfo({
                      name: feature.properties.name || 'Unknown Barangay',
                      position: { lat, lng },
                      riskLevel: feature.properties.riskLevel || 'low',
                      patternType: feature.properties.patternType || 'none',
                      alert: feature.properties.alert || 'No recent data'
                    });

                    if (mapRef.current) {
                      mapRef.current.panTo({ lat, lng });
                    }
                  }}
                />
              );
            });
          })}

          {/* Show breeding site markers when enabled, now with clustering */}
          {showBreedingSites && (
            <MarkerClusterer options={{ gridSize: 30 }}>
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
                      fillColor: "#2563eb",
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: "#fff",
                    }}
                    onClick={() => {
                      setSelectedBreedingSite(site);
                      if (mapRef.current) {
                        mapRef.current.panTo({
                          lat: site.specific_location.coordinates[1],
                          lng: site.specific_location.coordinates[0],
                        });
                        mapRef.current.setZoom(17);
                      }
                    }}
                  />
                ))
              }
            </MarkerClusterer>
          )}

          {selectedBarangayInfo && (
            <InfoWindow
              position={selectedBarangayInfo.position}
              onCloseClick={() => setSelectedBarangayInfo(null)}
              options={{
                pixelOffset: new window.google.maps.Size(0, -30),
                maxWidth: 640,
                disableAutoPan: false
              }}
            >
              <div
                className="bg-white p-4 rounded-lg text-center"
                style={{
                  // Use patternType for border color
                  border: `3px solid ${PATTERN_COLORS[selectedBarangayInfo.patternType?.toLowerCase()] || PATTERN_COLORS.default}`,
                  width: "50vw",
                  maxWidth: 640,
                }}
              >
                <p
                  className={`text-3xl font-bold`}
                  style={{
                    // Use patternType for title color
                    color: PATTERN_COLORS[selectedBarangayInfo.patternType?.toLowerCase()] || PATTERN_COLORS.default
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
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Show breeding site InfoWindow when enabled */}
          {showBreedingSites && selectedBreedingSite && (
            <InfoWindow
              position={{
                lat: selectedBreedingSite.specific_location.coordinates[1],
                lng: selectedBreedingSite.specific_location.coordinates[0],
              }}
              onCloseClick={() => setSelectedBreedingSite(null)}
            >
              <div className="bg-white p-4 rounded-lg border-2 w-[300px] text-center text-black">
                <p className="font-bold text-lg mb-2 text-primary">
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
                    {new Date(selectedBreedingSite.date_and_time).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Description:</span>{" "}
                    {selectedBreedingSite.description}
                  </p>
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
                <button
                  className="mt-4 px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/80"
                  onClick={() => {
                    navigate(`/mapping/${selectedBreedingSite._id}`, {
                      state: { breedingSite: selectedBreedingSite }
                    });
                  }}
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}

          {/* Add the user location marker */}
          {userMarker && (
            <Marker
              position={userMarker}
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#4F46E5" fill-opacity="0.2"/>
                    <circle cx="12" cy="12" r="4" fill="#4F46E5"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 12),
              }}
            />
          )}
        </GoogleMap>

        {/* Add the location button */}
        <button
          onClick={showCurrentLocation}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-primary hover:bg-gray-100 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200"
        >
          <MapPin size={20} weight="fill" />
          Show Current Location
        </button>
      </div>
    </div>
  );
};

export default Mapping;
