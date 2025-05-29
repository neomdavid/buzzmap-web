import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, InfoWindow, Polygon } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import { CustomModalToast } from "./";
import * as turf from "@turf/turf";
import { useGetPatternRecognitionResultsQuery } from "../api/dengueApi";
import { MapPin } from "phosphor-react";

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Update the QC_BOUNDS to match the actual barangay boundaries
const QC_BOUNDS = {
  north: 14.7406,
  south: 14.3795,
  east: 121.1535,
  west: 120.822,
};

const QC_CENTER = {
  lat: 14.676,
  lng: 121.0437,
};

const RISK_LEVEL_COLORS = {
  high: "#e53e3e",      // red
  medium: "#dd6b20",    // orange
  low: "#38a169",       // green
  unknown: "#718096",   // gray
};

// Add this near the top, after QC_BOUNDS and QC_CENTER
const WORLD_BOUNDS = [
  { lat: 90, lng: -180 },
  { lat: 90, lng: 180 },
  { lat: -90, lng: 180 },
  { lat: -90, lng: -180 },
  { lat: 90, lng: -180 }
];

export default function MapPicker({ onLocationSelect, bounds, defaultCity, defaultCoordinates }) {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [barangayData, setBarangayData] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);
  const [barangayHoles, setBarangayHoles] = useState([]);
  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();
  const [zoom, setZoom] = useState(13); // default zoom

  // Add the pattern recognition query
  const { data: patternDataRaw } = useGetPatternRecognitionResultsQuery();
  const patternData = patternDataRaw?.data || [];

  // // Add debug logs
  // useEffect(() => {
  //   console.log('Pattern Recognition Data:', {
  //     raw: patternDataRaw,
  //     processed: patternData,
  //     firstItem: patternData[0],
  //     length: patternData.length
  //   });
  // }, [patternDataRaw, patternData]);

  // Add toast timeout cleanup
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
        setToastType(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    setCurrentPosition(QC_CENTER);
    
    // Load barangay boundaries
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        setBarangayData(data);
        setIsDataLoaded(true);
        // Prepare holes for the mask
        if (data.features && data.features.length > 0) {
          const holes = data.features.map((feature) => {
            if (feature.geometry.type === "Polygon") {
              return feature.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
            } else if (feature.geometry.type === "MultiPolygon") {
              // Use the first polygon in MultiPolygon
              return feature.geometry.coordinates[0][0].map(([lng, lat]) => ({ lat, lng }));
            }
            return null;
          }).filter(Boolean);
          setBarangayHoles(holes);
        }
      })
      .catch(error => {
        console.error('Error loading barangay boundaries:', error);
      });
  }, []);

  // Set marker position if defaultCoordinates is provided
  useEffect(() => {
    if (defaultCoordinates) {
      const [lat, lng] = defaultCoordinates.split(",").map((c) => parseFloat(c.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        setMarkerPosition({ lat, lng });
        setCurrentPosition({ lat, lng });
        setZoom(18); // Zoom in when default coordinates are set
      }
    }
  }, [defaultCoordinates]);

  const findBarangay = (coords) => {
    if (!barangayData || !isDataLoaded) {
      return null;
    }

    const pt = turf.point([coords.lng, coords.lat]);
    let foundBarangay = null;

    for (let feature of barangayData.features) {
      let polys = [];
      if (feature.geometry.type === "Polygon") {
        polys = [feature.geometry.coordinates];
      } else if (feature.geometry.type === "MultiPolygon") {
        polys = feature.geometry.coordinates;
      }

      for (let polyCoords of polys) {
        let ring = [...polyCoords[0]];
        if (ring[0][0] !== ring[ring.length - 1][0] || 
            ring[0][1] !== ring[ring.length - 1][1]) {
          ring.push(ring[0]);
        }
        const poly = turf.polygon([ring]);
        
        if (turf.booleanPointInPolygon(pt, poly)) {
          foundBarangay = feature.properties.name;
          break;
        }
      }
      if (foundBarangay) break;
    }

    return foundBarangay;
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
    
    map.addListener('click', (e) => {
      const coords = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      
      // Only proceed if data is loaded
      if (!isDataLoaded) {
        setToastMessage("Please wait for the map data to load");
        setToastType("warning");
        return;
      }

      // Check if point is within QC bounds
      const isInQC = coords.lat >= QC_BOUNDS.south && 
                     coords.lat <= QC_BOUNDS.north && 
                     coords.lng >= QC_BOUNDS.west && 
                     coords.lng <= QC_BOUNDS.east;

      if (!isInQC) {
        setToastMessage("Please click a location within Quezon City");
        setToastType("error");
        return;
      }

      // Find which barangay contains this point
      const barangayName = findBarangay(coords);
      
      if (barangayName) {
        // Store the barangay name in state
        setSelectedBarangay(barangayName);
        
        // Set marker position
        setMarkerPosition(coords);
        
        // Format coordinates as string for NewPostModal
        const coordString = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
        
        // Pass both coordinates and barangay name
        onLocationSelect(coordString, barangayName);
        
        // Show success toast
        setToastMessage(`Location set in ${barangayName}`);
        setToastType("success");
      } else {
        // Show error toast if click is inside QC but not in a barangay
        setToastMessage("Selected location is not within any barangay boundary");
        setToastType("error");
      }
    });
  };

  const getRiskColor = (barangayName) => {
    if (!barangayName) return { stroke: "#718096", fill: "#718096" };
    if (!patternData || !Array.isArray(patternData)) return { stroke: "#718096", fill: "#718096" };

    const barangayData = patternData.find(item => {
      if (!item || !item.name) return false;
      return item.name.toLowerCase() === barangayName.toLowerCase();
    });

    if (!barangayData || !barangayData.risk_level) return { stroke: "#718096", fill: "#718096" };

    const riskLevel = barangayData.risk_level.toLowerCase();
    const color = RISK_LEVEL_COLORS[riskLevel] || RISK_LEVEL_COLORS.unknown;
    return { stroke: color, fill: color };
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setToastMessage("Geolocation is not supported by your browser");
      setToastType("error");
      return;
    }

    setToastMessage("Getting your location...");
    setToastType("warning");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Check if point is within QC bounds
        const isInQC = coords.lat >= QC_BOUNDS.south && 
                       coords.lat <= QC_BOUNDS.north && 
                       coords.lng >= QC_BOUNDS.west && 
                       coords.lng <= QC_BOUNDS.east;

        if (!isInQC) {
          setToastMessage("Your current location is outside Quezon City");
          setToastType("error");
          return;
        }

        // Find which barangay contains this point
        const barangayName = findBarangay(coords);
        
        if (barangayName) {
          // Store the barangay name in state
          setSelectedBarangay(barangayName);
          
          // Set marker position
          setMarkerPosition(coords);
          
          // Format coordinates as string for NewPostModal
          const coordString = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
          
          // Pass both coordinates and barangay name
          onLocationSelect(coordString, barangayName);
          
          // Show success toast
          setToastMessage(`Location set in ${barangayName}`);
          setToastType("success");

          // Center map on current location
          if (mapRef.current) {
            mapRef.current.panTo(coords);
          }
        } else {
          setToastMessage("Your current location is not within any barangay boundary");
          setToastType("error");
        }
      },
      (error) => {
        setToastMessage("Unable to retrieve your location");
        setToastType("error");
      }
    );
  };

  if (!isLoaded || !currentPosition || !isDataLoaded) {
    return <p>Loading map and barangay data...</p>;
  }

  return (
    <div className="relative">
      {toastMessage && (
        <div
          className={`absolute top-3 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg shadow-md text-sm z-50 text-white text-[14px] text-center transition-opacity duration-500 opacity-100 ${
            toastType === "success" 
              ? "bg-success" 
              : toastType === "error" 
              ? "bg-error" 
              : "bg-warning"
          }`}
        >
          {toastType === "success" ? (
            <>Location set in <strong>{selectedBarangay}</strong></>
          ) : (
            toastMessage
          )}
        </div>
      )}
      <div className="absolute top-3 right-3 z-[9999]">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            getCurrentLocation();
          }}
          title="Use Current Location"
          className="bg-white text-primary hover:bg-gray-300 hover:cursor-pointer p-2 rounded-full shadow-lg flex items-center justify-center w-10 h-10 transition-all duration-200 border border-gray-200"
        >
          <MapPin size={28} weight="fill" className="text-primary" />
        </button>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={zoom}
        onLoad={handleMapLoad}
        options={{
          clickableIcons: false,
          gestureHandling: 'greedy',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        }}
      >
        {/* No mask, no barangay polygons */}
        {markerPosition && (
          <Marker
            position={markerPosition}
            options={{
              clickable: false
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
