import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as turf from '@turf/turf';

// --- Google Maps dynamic script loader (copied from MapPicker.jsx) ---
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
// --- End loader ---

const QC_DEFAULT_CENTER = { lat: 14.6488, lng: 121.0509 };
const MAP_CONTAINER_STYLE = { width: '100%', height: '400px', borderRadius: '0.5rem' };

const InterventionLocationPicker = ({ 
  onPinChange, 
  initialPin,
  focusCommand,
  patternType,
  preselectedBarangay,
  highlightedBarangay,
  onBoundaryDataLoad 
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const overlaysRef = useRef([]);
  const [qcBoundaryFeatures, setQcBoundaryFeatures] = useState([]);
  const [isBoundaryDataLoaded, setIsBoundaryDataLoaded] = useState(false);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [currentPinDetail, setCurrentPinDetail] = useState({ barangayName: '', isValid: false });
  const [errorMessage, setErrorMessage] = useState('');
  const [highlightedBarangayName, setHighlightedBarangayName] = useState(highlightedBarangay || '');

  // Sync highlightedBarangayName with highlightedBarangay prop
  useEffect(() => {
    setHighlightedBarangayName(highlightedBarangay || '');
  }, [highlightedBarangay]);

  // Load barangay boundaries
  useEffect(() => {
    fetch('/quezon_barangays_boundaries.geojson')
      .then((res) => res.json())
      .then((data) => {
        const filteredFeatures = data.features.filter(
          (feature) => feature.properties.name !== "Laging Handa"
        );
        setQcBoundaryFeatures(filteredFeatures);
        setIsBoundaryDataLoaded(true);
      })
      .catch((error) => {
        setIsBoundaryDataLoaded(false);
      });
  }, []);

  // Helper: validate coordinates
  const validateCoordinates = useCallback((latLng) => {
    if (!isBoundaryDataLoaded || !qcBoundaryFeatures.length) {
      return { barangayName: null, isValid: false, error: 'Boundary data not loaded' };
    }
    const point = turf.point([latLng.lng, latLng.lat]);
    let foundBarangayName = null;
    let isWithinAnyBarangay = false;
    for (const feature of qcBoundaryFeatures) {
      if (feature.geometry) {
        let isInside = false;
        if (feature.geometry.type === 'Polygon') {
          isInside = turf.booleanPointInPolygon(point, feature);
        } else if (feature.geometry.type === 'MultiPolygon') {
          for (const polygonCoords of feature.geometry.coordinates) {
            const polygonFeature = turf.polygon(polygonCoords);
            if (turf.booleanPointInPolygon(point, polygonFeature)) {
              isInside = true;
              break;
            }
          }
        }
        if (isInside) {
          foundBarangayName = feature.properties.name || 'Unknown Barangay';
          isWithinAnyBarangay = true;
          break;
        }
      }
    }
    if (!isWithinAnyBarangay) {
      return { barangayName: null, isValid: false, error: 'Pinned location is outside Quezon City boundaries.' };
    }
    return { barangayName: foundBarangayName, isValid: true, error: '' };
  }, [qcBoundaryFeatures, isBoundaryDataLoaded]);

  // Effect: handle initialPin
  useEffect(() => {
    if (!isBoundaryDataLoaded) return;
    if (initialPin) {
      // Only update if the marker is different
      if (
        !currentMarker ||
        currentMarker.lat !== initialPin.lat ||
        currentMarker.lng !== initialPin.lng
      ) {
        setCurrentMarker({ lat: initialPin.lat, lng: initialPin.lng });
        if (mapInstance.current) {
          mapInstance.current.panTo({ lat: initialPin.lat, lng: initialPin.lng });
          mapInstance.current.setZoom(18);
        }
      }
    } else if (currentMarker !== null) {
      setCurrentMarker(null);
    }
  }, [initialPin, isBoundaryDataLoaded]);

  // Effect: validate currentMarker and emit to parent
  useEffect(() => {
    if (!isBoundaryDataLoaded) return;
    if (!currentMarker) {
      onPinChange(null);
      setCurrentPinDetail({ barangayName: '', isValid: false });
      setErrorMessage('');
      return;
    }
    const validation = validateCoordinates(currentMarker);
    setCurrentPinDetail({ barangayName: validation.barangayName || '', isValid: validation.isValid });
    setErrorMessage(validation.error || '');
    if (validation.isValid && validation.barangayName) {
      // Geocode address if possible
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: currentMarker }, (results, status) => {
          const formattedAddress = (status === 'OK' && results && results[0]) ? results[0].formatted_address : null;
          const pinDataToEmit = {
            coordinates: [currentMarker.lng, currentMarker.lat],
            barangayName: validation.barangayName,
            isWithinQC: true,
            formattedAddress,
          };
          onPinChange(pinDataToEmit);
        });
      } else {
        onPinChange({
          coordinates: [currentMarker.lng, currentMarker.lat],
          barangayName: validation.barangayName,
          isWithinQC: true,
          formattedAddress: null,
        });
      }
    } else {
      onPinChange(null);
    }
  }, [currentMarker, validateCoordinates, isBoundaryDataLoaded]);

  // Effect: handle focusCommand
  useEffect(() => {
    if (!mapInstance.current) return;
    if (focusCommand) {
      if (focusCommand.type === 'barangay' && focusCommand.center) {
        mapInstance.current.panTo(focusCommand.center);
        mapInstance.current.setZoom(focusCommand.zoom || 15);
        setHighlightedBarangayName(focusCommand.name);
        // Don't clear the existing pin when highlighting a barangay
        // The user should be able to see both the highlighted barangay and their existing pin
      } else if (focusCommand.type === 'pin' && focusCommand.lat && focusCommand.lng) {
        const newPin = { lat: focusCommand.lat, lng: focusCommand.lng };
        mapInstance.current.panTo(newPin);
        mapInstance.current.setZoom(focusCommand.zoom || 18);
        setCurrentMarker(newPin);
      }
    } else {
      setHighlightedBarangayName('');
    }
  }, [focusCommand]);

  // Map initialization
  useEffect(() => {
    if (!isBoundaryDataLoaded) return;
    if (!mapRef.current || mapInstance.current) return;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    loadGoogleMapsScript(apiKey).then(() => {
      if (!(window.google && window.google.maps)) return;
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: QC_DEFAULT_CENTER,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      // Draw polygons and marker
      drawMapFeatures(mapInstance.current, qcBoundaryFeatures, highlightedBarangayName, currentMarker);
      // Click handler
      mapInstance.current.addListener('click', (e) => {
        const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setCurrentMarker(coords);
        mapInstance.current.panTo(coords);
        mapInstance.current.setZoom(18);
        drawMapFeatures(mapInstance.current, qcBoundaryFeatures, highlightedBarangayName, coords);
      });
    });
  }, [isBoundaryDataLoaded]);

  // Redraw polygons/marker when highlight or marker changes
  useEffect(() => {
    if (!isBoundaryDataLoaded || !mapInstance.current) return;
    drawMapFeatures(mapInstance.current, qcBoundaryFeatures, highlightedBarangayName, currentMarker);
  }, [highlightedBarangayName, currentMarker, isBoundaryDataLoaded, qcBoundaryFeatures]);

  // Draw polygons and marker
  function drawMapFeatures(map, features, highlightedBarangayName, markerPos) {
    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];
    // Pattern color map
    const patternColors = {
      spike: { stroke: '#ef4444', fill: '#fee2e2' }, // red
      gradual_rise: { stroke: '#f59e42', fill: '#fef3c7' }, // yellow/orange
      stability: { stroke: '#3b82f6', fill: '#dbeafe' }, // blue
      decline: { stroke: '#22c55e', fill: '#bbf7d0' }, // green
      none: { stroke: '#6b7280', fill: '#f3f4f6' }, // gray
    };
    const highlightColor = patternColors[patternType] || patternColors.none;
    features.forEach((feature) => {
      const geometry = feature.geometry;
      const coordsArray = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
      coordsArray.forEach((polygonCoords) => {
        const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
        const isHighlighted = highlightedBarangayName && feature.properties.name === highlightedBarangayName;
        const polygon = new window.google.maps.Polygon({
          paths: path,
          strokeColor: isHighlighted ? '#FF8C00' : '#276749',
          strokeOpacity: isHighlighted ? 0.8 : 0.3,
          strokeWeight: isHighlighted ? 2 : 1,
          fillOpacity: 0.1,
          fillColor: isHighlighted ? '#FF8C00' : '#4A8D6E',
          map,
          zIndex: isHighlighted ? 10 : 1,
          clickable: false,
        });
        overlaysRef.current.push(polygon);
      });
    });
    // Draw marker
    if (markerPos) {
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new window.google.maps.Marker({
        position: markerPos,
        map,
        title: 'Pinned Location',
      });
    } else {
      if (markerRef.current) markerRef.current.setMap(null);
    }
  }

  // Update the style function to use highlightedBarangay
  const style = useCallback((feature) => {
    const barangayName = feature.properties.BRGY_NAME;
    return {
      fillColor: barangayName === highlightedBarangay ? '#ff0000' : '#3388ff',
      fillOpacity: barangayName === highlightedBarangay ? 0.3 : 0.1,
      color: barangayName === highlightedBarangay ? '#ff0000' : '#3388ff',
      weight: barangayName === highlightedBarangay ? 3 : 1,
      opacity: 1
    };
  }, [highlightedBarangay]);

  return (
    <div className="flex flex-col space-y-3">
      <div ref={mapRef} style={MAP_CONTAINER_STYLE} className="w-full h-[300px] rounded-lg border border-gray-200" />
      {errorMessage && (
        <p className="text-sm text-error bg-error/10 p-2 rounded-md">{errorMessage}</p>
      )}
      {currentPinDetail.isValid && currentPinDetail.barangayName && !errorMessage && (
        <p className="text-sm text-success bg-success/10 p-2 rounded-md">
          Pinned in Barangay: <strong>{currentPinDetail.barangayName}</strong>
        </p>
      )}
      {currentMarker && (
        <div className="text-xs text-gray-500">
          Pinned Location - Lat: {currentMarker.lat.toFixed(6)}, Lng: {currentMarker.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default InterventionLocationPicker; 