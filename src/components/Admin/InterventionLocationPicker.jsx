import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, Polygon } from '@react-google-maps/api';
import * as turf from '@turf/turf';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
  marginBottom: '1rem',
};

const QC_DEFAULT_CENTER = {
  lat: 14.6488, // Quezon City Hall
  lng: 121.0509,
};

const GOOGLE_MAPS_LIBRARIES = ['geometry', 'marker', 'places'];

const InterventionLocationPicker = ({ onPinChange, initialPin, focusCommand }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapRef = useRef(null);
  const [currentMarker, setCurrentMarker] = useState(null); // Internal state for the pin's {lat, lng}
  const [currentPinDetail, setCurrentPinDetail] = useState({ barangayName: '', isValid: false });
  const [qcBoundaryFeatures, setQcBoundaryFeatures] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [highlightedBarangayName, setHighlightedBarangayName] = useState('');
  const geocoderRef = useRef(null); // Ref for the geocoder instance
  const [isBoundaryDataLoaded, setIsBoundaryDataLoaded] = useState(false);

  const onPinChangeRef = useRef(onPinChange);
  useEffect(() => {
    onPinChangeRef.current = onPinChange;
  }, [onPinChange]);

  useEffect(() => {
    console.log('[InterventionLocationPicker] API Loaded:', isLoaded, 'Load Error:', loadError);
  }, [isLoaded, loadError]);

  useEffect(() => {
    console.log('[InterventionLocationPicker] Fetching boundary data...');
    fetch('/quezon_barangays_boundaries.geojson')
      .then((res) => res.json())
      .then((data) => {
        const filteredFeatures = data.features.filter(
          (feature) => feature.properties.name !== "Laging Handa"
        );
        setQcBoundaryFeatures(filteredFeatures);
        setIsBoundaryDataLoaded(true);
        console.log('[InterventionLocationPicker] QC Boundary data loaded. Features:', filteredFeatures.length);
      })
      .catch((error) => {
        console.error('[InterventionLocationPicker] Error loading boundary data:', error);
        setIsBoundaryDataLoaded(false);
      });
  }, []);

  // Effect 1: Synchronize initialPin prop to internal currentMarker state
  useEffect(() => {
    if (!isBoundaryDataLoaded) {
      console.log('[Picker - initialPin Sync] Boundary data not loaded yet, skipping initialPin sync');
      return;
    }

    if (initialPin) {
      if (currentMarker === null || 
          (currentMarker && (initialPin.lat !== currentMarker.lat || initialPin.lng !== currentMarker.lng))) {
        console.log(`[Picker - initialPin Sync] Setting currentMarker from initialPin:`, initialPin);
        setCurrentMarker({ lat: initialPin.lat, lng: initialPin.lng });
        if (mapRef.current) {
          mapRef.current.panTo({ lat: initialPin.lat, lng: initialPin.lng });
          mapRef.current.setZoom(18);
        }
      }
    } else if (currentMarker !== null) {
      console.log(`[Picker - initialPin Sync] Clearing currentMarker as initialPin is null`);
      setCurrentMarker(null);
    }
  }, [initialPin, isBoundaryDataLoaded]);

  const validateCoordinates = useCallback((latLng) => {
    if (!isBoundaryDataLoaded || !qcBoundaryFeatures.length) {
      console.log('[Picker DEBUG] Boundary data not loaded yet, cannot validate coordinates');
      return { barangayName: null, isValid: false, error: 'Boundary data not loaded' };
    }

    console.log('[Picker DEBUG] Validating coordinates:', latLng, 'against', qcBoundaryFeatures.length, 'boundary features');
    
    const point = turf.point([latLng.lng, latLng.lat]);
    let foundBarangayName = null;
    let isWithinAnyBarangay = false;

    for (const feature of qcBoundaryFeatures) {
      if (feature.geometry) {
        try {
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
            console.log('[Picker DEBUG] Point is inside barangay:', foundBarangayName);
            break;
          }
        } catch (e) {
          console.error('[Picker DEBUG] Error checking point in polygon:', e);
        }
      }
    }

    if (!isWithinAnyBarangay) {
      console.log('[Picker DEBUG] Point is not within any barangay');
      return { barangayName: null, isValid: false, error: 'Pinned location is outside Quezon City boundaries.' };
    }

    console.log('[Picker DEBUG] Validation successful for barangay:', foundBarangayName);
    return { barangayName: foundBarangayName, isValid: true, error: '' };
  }, [qcBoundaryFeatures, isBoundaryDataLoaded]);

  // Effect 2: Validate currentMarker and report to parent via onPinChange
  useEffect(() => {
    if (!isBoundaryDataLoaded) {
      console.log('[Picker DEBUG] Boundary data not loaded yet, skipping validation');
      return;
    }

    console.log(`[Picker DEBUG] Geocoding effect running. currentMarker:`, currentMarker, `isLoaded:`, isLoaded, `geocoderRef.current:`, geocoderRef.current);
    
    if (!isLoaded || !currentMarker) {
      if (!currentMarker) {
        console.log('[Picker DEBUG] No currentMarker in geocoding effect. Emitting null via onPinChange.');
        onPinChangeRef.current(null);
        setCurrentPinDetail({ barangayName: '', isValid: false });
        setErrorMessage('');
      }
      return;
    }

    const validation = validateCoordinates(currentMarker);
    console.log('[Picker DEBUG] Validation result:', validation);
    
    setCurrentPinDetail({ barangayName: validation.barangayName || '', isValid: validation.isValid });
    setErrorMessage(validation.error || '');

    if (validation.isValid && validation.barangayName) {
      if (geocoderRef.current) {
        console.log('[Picker DEBUG] Geocoder is available. Attempting geocode for:', currentMarker);
        geocoderRef.current.geocode({ location: currentMarker }, (results, status) => {
          console.log('[Picker DEBUG] Geocode callback. Status:', status, 'Results:', results);
          
          if (status === 'OK' && results && results[0]) {
            const formattedAddress = results[0].formatted_address;
            console.log('[Picker DEBUG] Geocoding successful. Formatted Address:', formattedAddress);
            
            const pinDataToEmit = {
              coordinates: [currentMarker.lng, currentMarker.lat],
              barangayName: validation.barangayName,
              isWithinQC: true,
              formattedAddress: formattedAddress,
            };
            console.log('[Picker DEBUG] Emitting valid pinData:', pinDataToEmit);
            onPinChangeRef.current(pinDataToEmit);
          } else {
            console.warn('[Picker DEBUG] Geocoding failed or no results. Status:', status);
            const pinDataToEmit = {
              coordinates: [currentMarker.lng, currentMarker.lat],
              barangayName: validation.barangayName,
              isWithinQC: true,
              formattedAddress: null,
            };
            console.log('[Picker DEBUG] Emitting pinData without address:', pinDataToEmit);
            onPinChangeRef.current(pinDataToEmit);
          }
        });
      } else {
        console.warn('[Picker DEBUG] Geocoder not initialized. Emitting pinData without address.');
        const pinDataToEmit = {
          coordinates: [currentMarker.lng, currentMarker.lat],
          barangayName: validation.barangayName,
          isWithinQC: true,
          formattedAddress: null,
        };
        console.log('[Picker DEBUG] Emitting pinData without geocoding:', pinDataToEmit);
        onPinChangeRef.current(pinDataToEmit);
      }
    } else {
      console.log('[Picker DEBUG] Pin validation failed. Emitting null. Validation:', validation);
      onPinChangeRef.current(null);
    }
  }, [currentMarker, validateCoordinates, isLoaded, isBoundaryDataLoaded]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    console.log("[Picker DEBUG] onMapLoad triggered. Map instance provided.");

    // The fact that onMapLoad is called means the core map script part has loaded.
    // We primarily need to check if the Geocoder service specifically is available on the window object.
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      try {
        geocoderRef.current = new window.google.maps.Geocoder();
        console.log('[Picker DEBUG] Google Maps Geocoder initialized successfully via onMapLoad.');
      } catch (e) {
        console.error('[Picker DEBUG] Error initializing Google Maps Geocoder in onMapLoad:', e);
        geocoderRef.current = null; 
      }
    } else {
      console.warn('[Picker DEBUG] Google Maps objects (window.google, window.google.maps, or window.google.maps.Geocoder) not available for Geocoder initialization immediately during onMapLoad. This might indicate a loading sequence issue.');
      geocoderRef.current = null; 
    }

    // Initial map centering logic can still use isLoaded from the hook for general API readiness if preferred,
    // or rely on initialPin/focusCommand as before.
    if (initialPin && initialPin.lat && initialPin.lng) { 
        map.panTo(initialPin);
        map.setZoom(18);
    } else if (currentMarker) { // Fallback if currentMarker exists but initialPin was not the trigger
        map.panTo(currentMarker);
        map.setZoom(18);
    } else if (focusCommand && focusCommand.type === 'barangay' && focusCommand.center) {
      map.panTo(focusCommand.center);
      map.setZoom(focusCommand.zoom || 15);
      // Highlight will be set by the focusCommand useEffect after mapRef is set
    }
  }, [initialPin, currentMarker, focusCommand]);

  // Effect 3: Handle focus commands from parent (primary driver for highlighting and map movement)
  useEffect(() => {
    // Ensure map is loaded before trying to pan or zoom
    if (!mapRef.current) return;

    if (focusCommand) {
      if (focusCommand.type === 'barangay' && focusCommand.center) {
        console.log('[Picker] Executing focusCommand (barangay):', focusCommand.name);
        mapRef.current.panTo(focusCommand.center);
        mapRef.current.setZoom(focusCommand.zoom || 15);
        setHighlightedBarangayName(focusCommand.name); // Set highlight based on dropdown

        // When focusing on a barangay (e.g., from dropdown), any existing pin in the picker should be cleared.
        // The modal is the source of truth for whether a pin is active via `initialPin`.
        // If the modal wants to focus on a barangay, it implies no specific pin is the target.
        if (currentMarker !== null) {
            console.log(`[Picker] focusCommand (barangay) '${focusCommand.name}' received. Clearing currentMarker.`);
            setCurrentMarker(null); // Clear picker's internal pin state.
        }

      } else if (focusCommand.type === 'pin' && focusCommand.lat && focusCommand.lng) {
        console.log('[Picker] Executing focusCommand (pin):', focusCommand);
        const newPin = { lat: focusCommand.lat, lng: focusCommand.lng };
        mapRef.current.panTo(newPin);
        mapRef.current.setZoom(focusCommand.zoom || 18);
        setCurrentMarker(newPin); // This will trigger validation and onPinChange
        // Highlight is not changed by focusing on a pin. It remains tied to barangay dropdown selection.
      }
    } else {
      // If focusCommand is null or undefined (e.g., parent clears selected barangay), clear highlight.
      setHighlightedBarangayName('');
    }
  }, [focusCommand]); // Dependency primarily on focusCommand. currentMarker removed as its change is an outcome.

  const handleMapClick = useCallback((event) => {
    const latLng = event.latLng;
    const newMarker = { lat: latLng.lat(), lng: latLng.lng() };
    console.log('[Picker] Map clicked, setting currentMarker:', newMarker);
    setCurrentMarker(newMarker); // This will trigger Effect 2
    
    if (mapRef.current) {
        mapRef.current.panTo(newMarker);
        mapRef.current.setZoom(18);
    }
  }, []);

  if (loadError) {
    return <div>Error loading map...</div>;
  }
  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  return (
    <div className="flex flex-col space-y-3">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={QC_DEFAULT_CENTER}
        zoom={12}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        options={{
            clickableIcons: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
        }}
      >
        {qcBoundaryFeatures.map((feature, index) => {
          const featureName = feature.properties.name;
          const isHighlighted = featureName === highlightedBarangayName;
          let paths = [];
          if (feature.geometry.type === 'Polygon') {
            paths = feature.geometry.coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }));
          } else if (feature.geometry.type === 'MultiPolygon') {
            paths = feature.geometry.coordinates[0][0].map(coord => ({ lat: coord[1], lng: coord[0] }));
          }
          return (
            <Polygon
              key={`${featureName}-${index}`}
              paths={paths}
              options={{
                fillColor: '#4A8D6E', // Default fill color, does not change
                fillOpacity: 0.1,    // Default fill opacity
                strokeColor: isHighlighted ? '#FF8C00' : '#276749', // Highlighted border is orange
                strokeWeight: isHighlighted ? 2 : 1,
                strokeOpacity: isHighlighted ? 0.8 : 0.3,
                clickable: false,
              }}
            />
          );
        })}
        {currentMarker && <MarkerF position={currentMarker} />}
      </GoogleMap>

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