import { useState, useEffect, useRef } from 'react';
import { loadGoogleMapsScript, createMapInstance, cleanupMapInstance, isValidMapInstance } from '../utils/googleMapsLoader';

export const useGoogleMaps = (apiKey, mapId, mapRef) => {
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(null);
  const mapInstance = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const initializeMap = (options = {}) => {
    if (!isMountedRef.current) return;

    // Ensure map ref is available and attached to DOM
    if (!mapRef.current) {
      console.log("Map ref not ready, retrying in 100ms...");
      setTimeout(() => {
        if (isMountedRef.current) {
          initializeMap(options);
        }
      }, 100);
      return;
    }

    console.log("Google Maps script loaded");
    
    // Only create map if not already created or invalid
    if (!mapInstance.current || !isValidMapInstance(mapInstance.current)) {
      console.log("Creating new map instance...");
      
      try {
        mapInstance.current = createMapInstance(mapRef.current, {
          center: { lat: 14.676, lng: 121.0437 }, // QC_CENTER
          zoom: 13,
          mapId: mapId || undefined,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          ...options
        });
        console.log("Map instance created successfully");
        setMapReady(true);
      } catch (err) {
        console.error("Error creating map instance:", err);
        if (isMountedRef.current) {
          setError("Failed to initialize map");
        }
        return;
      }
    }

    return mapInstance.current;
  };

  const createMap = (options = {}) => {
    // Check if Google Maps is already loaded
    if (window.google?.maps?.Map) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (isMountedRef.current) {
          initializeMap(options);
        }
      }, 100);
    } else {
      // Load Google Maps script if not already loaded
      loadGoogleMapsScript(apiKey)
        .then(() => {
          if (isMountedRef.current) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
              if (isMountedRef.current) {
                initializeMap(options);
              }
            }, 100);
          }
        })
        .catch((err) => {
          console.error("Error loading Google Maps script:", err);
          if (isMountedRef.current) {
            setError("Failed to load Google Maps");
          }
        });
    }
  };

  const cleanup = () => {
    if (mapInstance.current) {
      console.log("Cleaning up map instance...");
      cleanupMapInstance(mapInstance.current);
      mapInstance.current = null;
      setMapReady(false);
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    mapInstance: mapInstance.current,
    mapReady,
    error,
    createMap,
    cleanup,
    isValidMap: () => isValidMapInstance(mapInstance.current)
  };
};
