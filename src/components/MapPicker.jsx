import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import * as turf from "@turf/turf";

const QC_CENTER = { lat: 14.676, lng: 121.0437 };
const QC_BOUNDS = {
  north: 14.7406,
  south: 14.3795,
  east: 121.1535,
  west: 120.822,
};

const HIGHLIGHT_COLOR = '#2563eb'; // blue for highlight
const HIGHLIGHT_STROKE = '#111827'; // dark for border

// Utility to load Google Maps JS API ONCE
let googleMapsScriptLoadingPromise = null;
function loadGoogleMapsScript(apiKey) {
  if (window.google && window.google.maps && window.google.maps.Map) {
    return Promise.resolve();
  }
  if (googleMapsScriptLoadingPromise) {
    return googleMapsScriptLoadingPromise;
  }
  googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
    if (document.getElementById('google-maps-script')) {
      const check = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
  return googleMapsScriptLoadingPromise;
}

const MapPicker = forwardRef(({ onLocationSelect, defaultCoordinates, selectedBarangay }, ref) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const overlaysRef = useRef([]);
  const [barangayData, setBarangayData] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [highlightedBarangay, setHighlightedBarangay] = useState(null); // Only for search highlight

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load barangay boundaries
  useEffect(() => {
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        setBarangayData(data);
        setIsDataLoaded(true);
      })
      .catch((error) => {
        setToast({ type: "error", message: "Failed to load barangay boundaries" });
      });
  }, []);

  // Helper: find barangay by point
  function findBarangay(coords, geojson) {
    if (!geojson) return null;
    const pt = turf.point([coords.lng, coords.lat]);
    let firstFeature = geojson.features[0];
    if (firstFeature) {
      let bbox = turf.bbox(firstFeature);
      console.log('[MapPicker DEBUG] First polygon bbox:', bbox, 'Click:', [coords.lng, coords.lat]);
    }
    for (let feature of geojson.features) {
      let polys = [];
      if (feature.geometry.type === "Polygon") {
        polys = [feature.geometry.coordinates];
      } else if (feature.geometry.type === "MultiPolygon") {
        polys = feature.geometry.coordinates;
      }
      for (let polyCoords of polys) {
        let ring = [...polyCoords[0]];
        if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
          ring.push(ring[0]);
        }
        const poly = turf.polygon([ring]);
        if (turf.booleanPointInPolygon(pt, poly)) {
          return feature.properties.name;
        }
      }
    }
    return null;
  }

  // Draw polygons and marker
  function drawMapFeatures(map, barangayData, highlightedBarangayName, markerPos) {
    console.log('[MapPicker DEBUG] Drawing map features:', { highlightedBarangayName, markerPos });
    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];
    barangayData.features.forEach((feature) => {
      const geometry = feature.geometry;
      const coordsArray = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
      coordsArray.forEach((polygonCoords) => {
        const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
        // Only highlight if highlightedBarangayName matches
        const isHighlighted = highlightedBarangayName && feature.properties.name === highlightedBarangayName;
        const polygon = new window.google.maps.Polygon({
          paths: path,
          strokeColor: isHighlighted ? HIGHLIGHT_STROKE : '#333',
          strokeOpacity: isHighlighted ? 1 : 0.7,
          strokeWeight: isHighlighted ? 3 : 1,
          fillOpacity: isHighlighted ? 0.1 : 0.1, // Always fill with base color
          fillColor: isHighlighted ? HIGHLIGHT_COLOR : '#3182ce', // Highlighted or base color
          map,
          zIndex: isHighlighted ? 10 : 1,
          clickable: false,
        });
        overlaysRef.current.push(polygon);
      });
    });
    // Draw marker
    if (markerPos) {
      console.log('[MapPicker DEBUG] Placing marker at:', markerPos);
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new window.google.maps.Marker({
        position: markerPos,
        map,
        title: "Selected Location",
      });
    } else {
      if (markerRef.current) markerRef.current.setMap(null);
    }
  }

  // Expose panToBarangay method to parent
  useImperativeHandle(ref, () => ({
    panToBarangay: (barangayName) => {
      if (!barangayData || !mapInstance.current) return;
      const feature = barangayData.features.find(f => f.properties.name === barangayName);
      if (!feature) return;
      // Get all coordinates for the polygon/multipolygon
      let coords = [];
      if (feature.geometry.type === "Polygon") {
        coords = feature.geometry.coordinates[0];
      } else if (feature.geometry.type === "MultiPolygon") {
        coords = feature.geometry.coordinates[0][0];
      }
      // Compute bounds
      const bounds = new window.google.maps.LatLngBounds();
      coords.forEach(([lng, lat]) => bounds.extend({ lat, lng }));
      mapInstance.current.fitBounds(bounds);
      mapInstance.current.setZoom(16);
      setHighlightedBarangay(barangayName);
    }
  }));

  // Load Google Maps and initialize
  useEffect(() => {
    if (!isDataLoaded) return;
    loadGoogleMapsScript(apiKey).then(() => {
      if (!mapRef.current) return;
      if (!mapInstance.current) {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: QC_CENTER,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
      }
      const map = mapInstance.current;
      drawMapFeatures(map, barangayData, highlightedBarangay, markerPosition);
      // Click handler
      map.addListener('click', (e) => {
        const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        console.log('[MapPicker DEBUG] Map clicked at:', coords);
        // Check if point is within QC bounds
        const isInQC = coords.lat >= QC_BOUNDS.south && coords.lat <= QC_BOUNDS.north && coords.lng >= QC_BOUNDS.west && coords.lng <= QC_BOUNDS.east;
        if (!isInQC) {
          setToast({ type: "error", message: "Please click a location within Quezon City" });
          console.log('[MapPicker DEBUG] Click outside QC bounds');
          return;
        }
        // Find which barangay contains this point
        const barangayName = findBarangay(coords, barangayData);
        console.log('[MapPicker DEBUG] Found barangay:', barangayName);
        if (barangayName) {
          setMarkerPosition(coords);
          setHighlightedBarangay(null); // Do not highlight on pin
          if (onLocationSelect) {
            console.log('[MapPicker DEBUG] Calling onLocationSelect:', coords, barangayName);
            onLocationSelect(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`, barangayName);
          }
          setToast({ type: "success", message: `Location set in ${barangayName}` });
          drawMapFeatures(map, barangayData, null, coords); // No highlight
        } else {
          setToast({ type: "error", message: "Selected location is not within any barangay boundary" });
          console.log('[MapPicker DEBUG] No barangay found for click');
        }
      });
      // If defaultCoordinates is provided, set marker
      if (defaultCoordinates) {
        const [lat, lng] = defaultCoordinates.split(",").map((c) => parseFloat(c.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          setMarkerPosition({ lat, lng });
          map.setCenter({ lat, lng });
          map.setZoom(17);
          drawMapFeatures(map, barangayData, null, { lat, lng }); // No highlight
        }
      }
    });
    // Cleanup overlays on unmount or data change
    return () => {
      overlaysRef.current.forEach(o => o.setMap(null));
      overlaysRef.current = [];
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, [isDataLoaded, apiKey, defaultCoordinates, barangayData]);

  // Redraw polygons/marker when highlightedBarangay or markerPosition changes
  useEffect(() => {
    if (!isDataLoaded || !mapInstance.current || !barangayData) return;
    drawMapFeatures(mapInstance.current, barangayData, highlightedBarangay, markerPosition);
  }, [highlightedBarangay, markerPosition, isDataLoaded, barangayData]);

  // Toast timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="relative w-full h-[400px]">
      {toast && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg shadow-md text-sm z-50 text-white text-[14px] text-center transition-opacity duration-500 opacity-100 ${toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-yellow-500"}`}>{toast.message}</div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg border border-gray-200" />
    </div>
  );
});

export default MapPicker;
