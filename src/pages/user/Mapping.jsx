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
import { useGetPatternRecognitionResultsQuery, useGetBarangaysQuery, useGetPostsQuery, useGetAllInterventionsQuery } from "../../api/dengueApi";
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

// Intervention status color mapping (similar to DengueMap.jsx)
const INTERVENTION_STATUS_COLORS = {
  scheduled: "#8b5cf6", // Purple-500
  ongoing: "#f59e0b",   // Amber-500
  default: "#6b7280",  // Gray-500 (for other statuses like 'pending' or if status is missing)
  // Add 'completed' if you ever decide to show them, though current logic filters them out
  // completed: "#10b981", // Emerald-500 
};

const Mapping = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedBarangayFeature, setSelectedBarangayFeature] = useState(null);
  const [selectedBarangayCenter, setSelectedBarangayCenter] = useState(null);
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

  // State for interventions
  const [showInterventions, setShowInterventions] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  // Get pattern recognition data
  const { data: patternData } = useGetPatternRecognitionResultsQuery();
  
  // Get all barangays
  const { data: barangaysList, isLoading: isLoadingBarangays } = useGetBarangaysQuery();

  // Get posts
  const { data: posts } = useGetPostsQuery();

  // Get all interventions
  const { data: allInterventionsData, isLoading: isLoadingAllInterventions } = useGetAllInterventionsQuery();

  // Memoized list of active (not completed) interventions
  const activeInterventions = React.useMemo(() => {
    if (!allInterventionsData) return [];
    const filtered = allInterventionsData.filter(intervention => {
      const status = intervention.status?.toLowerCase();
      return status !== 'completed' && status !== 'complete';
    });
    // Optional: Sort by date if needed, e.g., most recent first
    // return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    return filtered;
  }, [allInterventionsData]);

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
                  alert: patternInfo?.status_and_recommendation?.report_based?.alert || patternInfo?.alert || 'No recent data',
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
        setSelectedBarangayFeature(matchingBarangay);
        setSelectedBarangayCenter({ lat, lng });
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
            setSelectedBarangayFeature(f);
            setSelectedBarangayCenter({ lat: coords.lat, lng: coords.lng });
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

      <div className="w-full max-w-md mb-4 flex gap-2"> {/* Use flex and gap for button layout */}
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
        <button // New button for interventions
          onClick={() => {
            setShowInterventions(!showInterventions);
            if (showInterventions) setSelectedIntervention(null); // Clear selection when hiding
          }}
          className={`w-full px-4 py-2 rounded-md shadow transition-colors ${
            showInterventions
              ? "bg-white text-primary"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          {showInterventions ? "Hide Interventions" : "Show Interventions"}
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

      {/* Container for Legends */}
      <div className="w-full max-w-md mb-4 flex flex-col sm:flex-row gap-4">
        {/* Updated Legend for Pattern Types */}
        <div className="flex-1 bg-white text-black rounded-md shadow px-4 py-3">
          <p className="font-semibold mb-2 text-center sm:text-left">Pattern Types</p>
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
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
                    style={{ backgroundColor: color, width: '12px', height: '12px' }}
                    className="inline-block"
                  />
                  <span className="text-xs">
                    {pattern.charAt(0).toUpperCase() + pattern.slice(1).replace('_', ' ')}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Intervention Legend - Moved here */}
        {showInterventions && (
          <div className="flex-1 bg-white text-black rounded-md shadow px-4 py-3">
            <p className="font-semibold mb-2 text-center sm:text-left">Intervention Status</p>
            <div className="flex items-center justify-around sm:justify-start gap-2 flex-wrap">
              {Object.entries(INTERVENTION_STATUS_COLORS)
                .filter(([key]) => key !== 'default' && key !== 'completed') // Show relevant statuses
                .map(([status, color]) => (
                  <div key={status} className="flex items-center gap-1">
                    <span
                      style={{ backgroundColor: color }}
                      className="w-3 h-3 inline-block rounded-full"
                    />
                    <span className="text-xs">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
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
            setSelectedBarangayFeature(null);
            setSelectedBarangayCenter(null);
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

            const isSelected = selectedBarangayFeature && selectedBarangayFeature.properties?.name === feature.properties?.name;
            return coordsArray.map((polygonCoords, i) => {
              const path = polygonCoords[0].map(([lng, lat]) => ({
                lat,
                lng,
              }));
              const patternColor = PATTERN_COLORS[feature.properties.patternType?.toLowerCase()] || PATTERN_COLORS.default;
              return (
                <Polygon
                  key={`${index}-${i}`}
                  paths={path}
                  options={{
                    strokeColor: isSelected ? getDarkerColor(patternColor) : "#333",
                    strokeOpacity: isSelected ? 1 : 0.6,
                    strokeWeight: isSelected ? 3 : 1,
                    fillOpacity: 0.5,
                    fillColor: patternColor, 
                    clickable: true,
                  }}
                  onClick={(e) => {
                    e.stop();
                    setSelectedBarangayFeature(feature);
                    const center = turf.center(feature.geometry);
                    const { coordinates } = center.geometry;
                    const [lng, lat] = coordinates;
                    setSelectedBarangayCenter({ lat, lng });
                    setSelectedBarangayId(`${index}-${i}`);
                    if (mapRef.current && lat && lng && !isNaN(lat) && !isNaN(lng)) {
                      mapRef.current.panTo({ lat, lng });
                    }
                  }}
                />
              );
            });
          })}

          {/* Show breeding site markers when enabled, now with clustering */}
          {showBreedingSites && (
            <MarkerClusterer
              styles={[{
                url: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m3.png', // m3.png is a redder icon
                height: 66,
                width: 66,
                textColor: 'white',
                textSize: 12,
              }]}
              options={{
                gridSize: 30,
                // imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' // Ensure clusters can turn red
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
                    icon={
                      isLoaded && window.google && window.google.maps && window.google.maps.SymbolPath && window.google.maps.Point
                        ? {
                            path: window.google.maps.SymbolPath.MAP_PIN, 
                            fillColor: "#DC2626", // RED for breeding sites
                            fillOpacity: 1,
                            strokeColor: "#ffffff", 
                            strokeWeight: 1.5,
                            scale: 1.3, 
                            anchor: new window.google.maps.Point(12, 24), 
                          }
                        : undefined // Fallback to default icon if google.maps parts are not ready
                    }
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

          {/* Render InfoWindow for selected barangay feature (DengueMap style) */}
          {selectedBarangayFeature && selectedBarangayCenter && (
            (() => {
              const feature = selectedBarangayFeature;
              const patternType = feature.properties.patternType?.toLowerCase() || 'none';
              const displayName = feature.properties.displayName || feature.properties.name || 'Unknown Barangay';
              return (
                <InfoWindow
                  position={selectedBarangayCenter}
                  onCloseClick={() => {
                    setSelectedBarangayFeature(null);
                    setSelectedBarangayCenter(null);
                  }}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -30),
                    disableAutoPan: false
                  }}
                >
                  <div className="bg-white p-4 rounded-lg text-center h-auto" style={{ width: "50vw" }}>
                    <p className="text-4xl font-[900]" style={{ color: PATTERN_COLORS[patternType] || PATTERN_COLORS.default }}>
                      Barangay {displayName}
                    </p>
                    <div className="mt-3 flex flex-col gap-3 text-black">
                      <div className={`p-3 rounded-lg border-2 ${
                        patternType === 'spike'
                          ? 'border-error bg-error/5'
                          : patternType === 'gradual_rise'
                          ? 'border-warning bg-warning/5'
                          : patternType === 'decline'
                          ? 'border-success bg-success/5'
                          : patternType === 'stability'
                          ? 'border-info bg-info/5'
                          : 'border-gray-400 bg-gray-100'
                      }`}>
                        <div>
                          <p className="text-sm font-medium text-gray-600 uppercase">Pattern</p>
                          <p className="text-lg font-semibold">
                            {patternType === 'none'
                              ? 'No pattern detected'
                              : patternType.charAt(0).toUpperCase() + patternType.slice(1).replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border-2 border-primary/30 bg-primary/5">
                        <div>
                          <p className="text-sm font-medium text-gray-600 uppercase">Alert</p>
                          <p className="text-lg font-semibold">{feature.properties.alert || 'No recent data'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              );
            })()
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
              <div className="bg-white p-4 rounded-lg text-primary w-[50vw] text-center">
                <p className="font-bold text-4xl font-extrabold mb-4 text-primary">
                  {selectedBreedingSite.report_type}
                </p>
                <div className="flex flex-col items-center mt-2 space-y-1 font-normal text-center">
                  <p className="text-xl">
                    <span className="font-bold">Barangay:</span>{" "}
                    {selectedBreedingSite.barangay}
                  </p>
                  <p className="text-xl">
                    <span className="font-bold">Reported by:</span>{" "}
                    {selectedBreedingSite.user?.username || ""}
                  </p>
                  <p className="text-xl">
                    <span className="font-bold">Date:</span>{" "}
                    {new Date(selectedBreedingSite.date_and_time).toLocaleDateString()}
                  </p>
                  <p className="text-xl">
                    <span className="font-bold">Description:</span>{" "}
                    {selectedBreedingSite.description}
                  </p>
                  {selectedBreedingSite.images && selectedBreedingSite.images.length > 0 && (
                    <div className="mt-2 flex  justify-center gap-2">
                      {selectedBreedingSite.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`evidence-${idx + 1}`}
                          className="w-35 h-25 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="mt-4 px-4 py-2 bg-primary w-[40%] text-white rounded-lg shadow hover:bg-primary/80 hover:cursor-pointer font-bold"
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

          {/* Show intervention markers and InfoWindow when enabled */}
          {showInterventions && activeInterventions && activeInterventions.map((intervention) => {
            if (!intervention.specific_location?.coordinates || intervention.specific_location.coordinates.length !== 2) {
              console.warn("Skipping intervention due to missing/invalid coordinates:", intervention);
              return null;
            }
            const statusKey = intervention.status?.toLowerCase() || 'default';
            const markerColor = INTERVENTION_STATUS_COLORS[statusKey] || INTERVENTION_STATUS_COLORS.default;

            return (
              <Marker
                key={intervention._id}
                position={{
                  lat: intervention.specific_location.coordinates[1],
                  lng: intervention.specific_location.coordinates[0],
                }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: markerColor,
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#fff",
                }}
                onClick={() => {
                  setSelectedIntervention(intervention);
                  // Optionally pan to the marker
                  if (mapRef.current) {
                    mapRef.current.panTo({
                      lat: intervention.specific_location.coordinates[1],
                      lng: intervention.specific_location.coordinates[0],
                    });
                  }
                }}
              />
            );
          })}

          {showInterventions && selectedIntervention && selectedIntervention.specific_location?.coordinates && (
            <InfoWindow
              position={{
                lat: selectedIntervention.specific_location.coordinates[1],
                lng: selectedIntervention.specific_location.coordinates[0],
              }}
              onCloseClick={() => setSelectedIntervention(null)}
              options={{
                pixelOffset: new window.google.maps.Size(0, -30), // Adjust as needed
              }}
            >
              <div className="p-3 flex flex-col items-center gap-1 font-normal bg-white rounded-md shadow-md w-64 text-primary w-[50vw]">
                <p className="text-4xl font-extrabold text-primary mb-2">{selectedIntervention.interventionType}</p>
                <div className="text-lg flex items-center gap-2">
                  <span className="font-bold">Status:</span>
                  <span
                    className="px-3 py-1 rounded-full text-white font-bold text-sm"
                    style={{
                      backgroundColor:
                        INTERVENTION_STATUS_COLORS[(selectedIntervention.status || '').toLowerCase()] || INTERVENTION_STATUS_COLORS.default,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    {selectedIntervention.status}
                  </span>
                </div>
                <p className="text-lg text-center"><span className="font-bold">Barangay:</span> {selectedIntervention.barangay}</p>
                {selectedIntervention.address && <p className="text-lg text-center "><span className="font-bold text-center">Address:</span> {selectedIntervention.address}</p>}
                <p className="text-lg">
                  <span className="font-bold">Date:</span>{' '}
                  {new Date(selectedIntervention.date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
                <p className="text-lg"><span className="font-bold">Personnel:</span> {selectedIntervention.personnel}</p>
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
