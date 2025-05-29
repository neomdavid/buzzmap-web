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
  north: 14.7800,
  south: 14.4500,
  east: 121.2000,
  west: 120.9800,
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

const REPORT_STATUS_COLORS = {
  low: "border-success bg-success/5",
  medium: "border-warning bg-warning/5",
  high: "border-error bg-error/5",
  unknown: "border-gray-400 bg-gray-100"
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

const INTERVENTION_TYPE_COLORS = {
  "Fogging": "#8b5cf6", // purple
  "Ovicidal-Larvicidal Trapping": "#f59e0b", // amber
  "Clean-up Drive": "#22c55e", // green
  "Education Campaign": "#3b82f6", // blue
  "default": "#6b7280" // gray
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

  // Add this helper function near the top of the component
  const panToWithOffset = (map, position, offsetY = 1230) => {
    const bounds = map.getBounds();
    if (!bounds) {
      map.panTo(position);
      return;
    }
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const latSpan = ne.lat() - sw.lat();
    const newLat = position.lat + latSpan * offsetY;
    map.panTo({ lat: newLat, lng: position.lng });
  };

  // Add this function to verify location using Google Maps Geocoding
  const verifyLocationWithGoogle = async (coords) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: coords },
          (results, status) => {
            if (status === 'OK') {
              resolve(results);
            } else {
              reject(new Error('Geocoding failed'));
            }
          }
        );
      });

      // Check if the location is in Quezon City
      const isInQuezonCity = response.some(result => 
        result.address_components.some(component => 
          component.long_name === 'Quezon City' && 
          component.types.includes('locality')
        )
      );

      if (isInQuezonCity) {
        return coords;
      }

      // If not in Quezon City, try to find the center of Quezon City
      const qcResponse = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { address: 'Quezon City, Philippines' },
          (results, status) => {
            if (status === 'OK') {
              resolve(results);
            } else {
              reject(new Error('Geocoding failed'));
            }
          }
        );
      });

      if (qcResponse && qcResponse[0] && qcResponse[0].geometry && qcResponse[0].geometry.location) {
        return {
          lat: qcResponse[0].geometry.location.lat(),
          lng: qcResponse[0].geometry.location.lng()
        };
      }

      return QC_CENTER;
    } catch (error) {
      console.error('Error in verifyLocationWithGoogle:', error);
      return QC_CENTER;
    }
  };

  // Add back the fetchData function
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
        const barangayGeoJson = await barangayResponse.json();

        // Process barangay data
        let processedBarangayData = barangayGeoJson;
        if (barangaysList) {
          processedBarangayData = {
            ...barangayGeoJson,
            features: barangayGeoJson.features.map((f) => {
              const geoJsonBarangayName = f.properties.name;
              const normalizedGeoJsonName = normalizeBarangayName(geoJsonBarangayName);
              const barangayListObj = barangaysList.find(
                b => normalizeBarangayName(b.name) === normalizedGeoJsonName
              );
              let patternType = barangayListObj?.status_and_recommendation?.pattern_based?.status?.toLowerCase();
              if (!patternType || patternType === "") patternType = "none";
              const color = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
              return {
                ...f,
                properties: {
                  ...f.properties,
                  displayName: geoJsonBarangayName,
                  patternType,
                  color,
                  alert: barangayListObj?.status_and_recommendation?.pattern_based?.alert ||
                         barangayListObj?.alert || "No recent data",
                  lastAnalysisTime: barangayListObj?.last_analysis_time,
                  status_and_recommendation: barangayListObj?.status_and_recommendation,
                  risk_level: barangayListObj?.risk_level,
                  pattern_data: barangayListObj?.pattern_data
                },
              };
            })
          };
        }
        setBarangayData(processedBarangayData);

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
        console.error('Error in fetchData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [barangaysList, posts]);

  // Update the location handling useEffect to handle errors better
  useEffect(() => {
    if (!currentPosition && isLoaded) {
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const initialPosition = { 
              lat: coords.latitude, 
              lng: coords.longitude 
            };

            // Verify location with Google Maps
            const verifiedPosition = await verifyLocationWithGoogle(initialPosition);
            
            setCurrentPosition(verifiedPosition);
            setUserMarker(verifiedPosition);
            
            if (mapRef.current) {
              panToWithOffset(mapRef.current, verifiedPosition, 0.15);
              mapRef.current.setZoom(15);
            }
          } catch (error) {
            console.error('Error getting location:', error);
            setCurrentPosition(QC_CENTER);
            setUserMarker(QC_CENTER);
            if (mapRef.current) {
              panToWithOffset(mapRef.current, QC_CENTER, 0.15);
              mapRef.current.setZoom(15);
            }
          }
        },
        async () => {
          try {
            // If geolocation fails, use Google Maps to get Quezon City center
            const qcPosition = await verifyLocationWithGoogle(QC_CENTER);
            setCurrentPosition(qcPosition);
            setUserMarker(qcPosition);
            toastWarn("Unable to get your location. Default location set to QC center.");
            if (mapRef.current) {
              panToWithOffset(mapRef.current, qcPosition, 0.15);
              mapRef.current.setZoom(15);
            }
          } catch (error) {
            console.error('Error getting QC center:', error);
            setCurrentPosition(QC_CENTER);
            setUserMarker(QC_CENTER);
            if (mapRef.current) {
              panToWithOffset(mapRef.current, QC_CENTER, 0.15);
              mapRef.current.setZoom(15);
            }
          }
        },
        geoOptions
      );
    }
  }, [isLoaded]);

  // Handle barangay selection
  const handleBarangaySelect = (e) => {
    const selectedBarangayName = e.target.value;

    if (!selectedBarangayName || !barangayData) return;

    const matchingBarangay = barangayData.features.find(feature => 
      feature.properties.name === selectedBarangayName
    );

    if (matchingBarangay) {
      const center = turf.center(matchingBarangay.geometry);
      const { coordinates } = center.geometry;
      const [lng, lat] = coordinates;

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        panToWithOffset(mapRef.current, { lat, lng }, 0.15);
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

  // Update showCurrentLocation function
  const showCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toastWarn("Geolocation is not supported by your browser");
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        
        // Verify location with Google Maps
        const verifiedLocation = await verifyLocationWithGoogle(position);
        
        setUserMarker(verifiedLocation);
        if (mapRef.current) {
          panToWithOffset(mapRef.current, verifiedLocation, 0.15);
          mapRef.current.setZoom(15);
        }
      },
      async () => {
        const verifiedLocation = await verifyLocationWithGoogle(QC_CENTER);
        setUserMarker(verifiedLocation);
        toastWarn("Unable to get your location");
        if (mapRef.current) {
          panToWithOffset(mapRef.current, verifiedLocation, 0.15);
          mapRef.current.setZoom(15);
        }
      },
      geoOptions
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

  // Helper to count breeding site reports for a barangay
  const getBreedingSiteCount = (barangayName) => {
    if (!posts || !barangayName) return 0;
    return posts.filter(
      post =>
        post.status === "Validated" &&
        post.barangay &&
        post.barangay.toLowerCase() === barangayName.toLowerCase()
    ).length;
  };

  const getBarangayFromList = (name) => {
    if (!barangaysList) return null;
    return barangaysList.find(
      b => normalizeBarangayName(b.name) === normalizeBarangayName(name)
    );
  };

  if (!isLoaded) return <LoadingSpinner size={32} className="h-screen" />;
  if (loading) return <LoadingSpinner size={32} className="h-screen" />;
  if (error) return <ErrorMessage error={error} className="m-4" />;
  if (!currentPosition) return <ErrorMessage error="Unable to get your location" className="m-4" />;

  return (
    <div className="relative h-[92.3vh] mt-[-9.5px]  w-[100vw] overflow-hidden">
      {/* Map container - full screen */}
      <div className="absolute inset-0 z-0 ">
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "100%",
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

            const barangayObj = getBarangayFromList(feature.properties.name);
            let patternType = (barangayObj?.status_and_recommendation?.pattern_based?.status || feature.properties.patternType || 'none').toLowerCase();
            if (!patternType || patternType === '') patternType = 'none';
            const patternColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;

            const isSelected = selectedBarangayFeature && selectedBarangayFeature.properties?.name === feature.properties?.name;
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
                    strokeColor: isSelected ? getDarkerColor(patternColor) : '#333',
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
                      panToWithOffset(mapRef.current, { lat, lng }, 0.15);
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
                        panToWithOffset(mapRef.current, {
                          lat: site.specific_location.coordinates[1],
                          lng: site.specific_location.coordinates[0],
                        }, 0.15);
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
              const displayName = feature.properties.displayName || feature.properties.name || 'Unknown Barangay';

              // Get the barangay object from the barangaysList
              const barangayObj = getBarangayFromList(feature.properties.name);
              // Pattern-based
              const patternBased = barangayObj?.status_and_recommendation?.pattern_based;
              // Use status for pattern (e.g., stability, spike, etc.)
              let patternType = (patternBased?.status || feature.properties.patternType || "none").toLowerCase();
              if (!patternType || patternType === "") patternType = "none";
              const patternCardColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
              // Report-based
              const reportBased = barangayObj?.status_and_recommendation?.report_based;
              const reportAlert = reportBased?.alert;
              const reportStatus = (reportBased?.status || "unknown").toLowerCase();
              const reportCardColor = REPORT_STATUS_COLORS[reportStatus] || REPORT_STATUS_COLORS.unknown;

              return (
                <InfoWindow
                  position={selectedBarangayCenter}
                  onCloseClick={() => {
                    setSelectedBarangayFeature(null);
                    setSelectedBarangayCenter(null);
                  }}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -30),
                    disableAutoPan: false,
                    maxWidth: 500
                  }}
                >
                  <div className="bg-white p-4 rounded-lg text-center h-auto">
                    <p className="text-4xl font-[900]" style={{ color: patternCardColor }}>
                      Barangay {displayName}
                    </p>
                    <div className="mt-3 flex flex-col gap-3 text-black">
                      {/* Pattern card */}
                      <div className="p-3 rounded-lg border-2" style={{ borderColor: patternCardColor }}>
                        <div>
                          <p className="text-sm font-medium text-gray-600 uppercase">Pattern</p>
                          <p className="text-lg font-semibold">
                            {patternType === 'none'
                              ? 'No pattern detected'
                              : patternType.charAt(0).toUpperCase() + patternType.slice(1).replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      {/* Breeding site reports card */}
                      <div className={`p-3 rounded-lg border-2 ${reportCardColor}`}>
                        <div>
                          <p className="text-sm font-medium text-gray-600 uppercase">Breeding Site Reports</p>
                          <p className="text-lg font-semibold">
                            {reportAlert && reportAlert.toLowerCase() !== "none"
                              ? reportAlert
                              : "No breeding site reported in this barangay."}
                          </p>
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
              options={{
                maxWidth: 500
              }}
            >
              <div className="bg-white p-4 rounded-lg text-primary text-center">
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
                  if (mapRef.current) {
                    panToWithOffset(mapRef.current, {
                      lat: intervention.specific_location.coordinates[1],
                      lng: intervention.specific_location.coordinates[0],
                    }, 0.15);
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
                pixelOffset: new window.google.maps.Size(0, -30),
                maxWidth: 500
              }}
            >
              <div className="p-3 flex flex-col items-center gap-1 font-normal bg-white rounded-md shadow-md text-primary">
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
      </div>

      {/* Top shadow overlay */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/10 to-transparent z-[1]" />

      {/* Floating controls card */}
      <div className="absolute top-4 left-10 z-10">
        <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-xl p-6 w-[400px] text-primary">
          <p className="text-3xl font-extrabold text-primary mb-2">Check your place</p>
          <p className="text-sm text-primary mb-4">
            Stay Protected. Look out for Dengue Outbreaks.
          </p>

          {/* Controls */}
          <div className="flex flex-col gap-3">
            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowBreedingSites(!showBreedingSites)}
                className={`w-full px-4 py-2 rounded-md shadow transition-colors ${
                  showBreedingSites
                    ? "bg-primary text-white"
                    : "bg-white text-primary hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {showBreedingSites ? "Hide Breeding Sites" : "Show Breeding Sites"}
              </button>
              <button
                onClick={() => {
                  setShowInterventions(!showInterventions);
                  if (showInterventions) setSelectedIntervention(null);
                }}
                className={`w-full px-4 py-2 rounded-md shadow transition-colors ${
                  showInterventions
                    ? "bg-primary text-white"
                    : "bg-white text-primary hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {showInterventions ? "Hide Interventions" : "Show Interventions"}
              </button>
            </div>

            {/* Barangay Select */}
            <select
              value={searchQuery}
              onChange={handleBarangaySelect}
              className="w-full px-4 py-2 rounded-md shadow bg-white text-primary border border-gray-200"
            >
              <option value="">Select a barangay</option>
              {barangaysList?.map((barangay) => (
                <option key={barangay._id} value={barangay.name}>
                  {barangay.name}
                </option>
              ))}
            </select>

            {/* Legends */}
            <div className="flex flex-col gap-3">
              {/* Pattern Types Legend */}
              <div className="bg-white rounded-md shadow px-4 py-3 border border-gray-200">
                <p className="font-semibold mb-2 text-primary">Pattern Types</p>
                <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
                  {Object.entries(PATTERN_COLORS)
                    .filter(([key]) => key !== 'default')
                    .sort(([aKey], [bKey]) => { 
                      const order = { none: 0, stability: 1, decline: 2, gradual_rise: 3, spike: 4 };
                      return order[aKey] - order[bKey];
                    })
                    .map(([pattern, color]) => (
                      <div key={pattern} className="flex items-center gap-1">
                        <span
                          style={{ backgroundColor: color, width: '12px', height: '12px' }}
                          className="inline-block"
                        />
                        <span className="text-xs text-primary">
                          {pattern.charAt(0).toUpperCase() + pattern.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Intervention Legend */}
              {showInterventions && (
                <div className="bg-white rounded-md shadow px-4 py-3 border border-gray-200">
                  <p className="font-semibold mb-2 text-primary">Intervention Status</p>
                  <div className="flex items-center justify-around sm:justify-start gap-2 flex-wrap">
                    {Object.entries(INTERVENTION_STATUS_COLORS)
                      .filter(([key]) => key !== 'default' && key !== 'completed')
                      .map(([status, color]) => (
                        <div key={status} className="flex items-center gap-1">
                          <span
                            style={{ backgroundColor: color }}
                            className="w-3 h-3 inline-block rounded-full"
                          />
                          <span className="text-xs text-primary">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location button */}
      <button
        onClick={showCurrentLocation}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-primary hover:bg-gray-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200 z-10"
      >
        <MapPin size={20} weight="fill" />
        Show Current Location
      </button>
    </div>
  );
};

export default Mapping;
