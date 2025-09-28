import { useState, useEffect, useRef } from "react";
import {
  loadGoogleMapsScript,
  createMapInstance,
  cleanupMapInstance,
  isValidMapInstance,
} from "../utils/googleMapsLoader";

export const useGoogleMaps = (apiKey, mapId, mapRef) => {
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(null);
  const mapInstance = useRef(null);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const maxRetries = 100; // Maximum 10 seconds of retries (100 * 100ms)

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const initializeMap = (options = {}) => {
    if (!isMountedRef.current) return;

    // Check retry limit to prevent infinite loops
    if (retryCountRef.current >= maxRetries) {
      console.error("Max retries reached for map initialization");
      setError("Failed to initialize map after maximum retries");
      return;
    }

    // Ensure map ref is available and attached to DOM
    if (!mapRef.current || !document.contains(mapRef.current)) {
      console.log(
        `Map ref not ready or not in DOM, retrying in 100ms... (attempt ${
          retryCountRef.current + 1
        }/${maxRetries})`
      );
      console.log("Debug - mapRef.current:", mapRef.current);
      console.log(
        "Debug - document.contains:",
        mapRef.current ? document.contains(mapRef.current) : "ref is null"
      );
      retryCountRef.current++;
      setTimeout(() => {
        if (isMountedRef.current) {
          initializeMap(options);
        }
      }, 100);
      return;
    }

    // Additional check: ensure the element has dimensions
    const rect = mapRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.log(
        `Map element has no dimensions, retrying in 100ms... (attempt ${
          retryCountRef.current + 1
        }/${maxRetries})`
      );
      retryCountRef.current++;
      setTimeout(() => {
        if (isMountedRef.current) {
          initializeMap(options);
        }
      }, 100);
      return;
    }

    // Ensure Google Maps and marker library are fully loaded
    if (!window.google?.maps?.Map || !window.google?.maps?.marker) {
      console.log(
        `Google Maps not fully loaded, retrying in 100ms... (attempt ${
          retryCountRef.current + 1
        }/${maxRetries})`
      );
      retryCountRef.current++;
      setTimeout(() => {
        if (isMountedRef.current) {
          initializeMap(options);
        }
      }, 100);
      return;
    }

    // Reset retry count on successful initialization
    retryCountRef.current = 0;

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
          ...options,
        });
        console.log("Map instance created successfully");

        // Small delay to ensure map is fully initialized before setting ready
        setTimeout(() => {
          if (isMountedRef.current) {
            setMapReady(true);
          }
        }, 100);
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
    if (window.google?.maps?.Map && window.google?.maps?.marker) {
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
            // Wait for marker library to be available
            const waitForMarkerLibrary = () => {
              return new Promise((resolve) => {
                const checkReady = () => {
                  if (window.google?.maps?.Map && window.google?.maps?.marker) {
                    resolve();
                  } else {
                    setTimeout(checkReady, 50);
                  }
                };
                checkReady();
              });
            };

            waitForMarkerLibrary().then(() => {
              if (isMountedRef.current) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                  if (isMountedRef.current) {
                    initializeMap(options);
                  }
                }, 100);
              }
            });
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
    isValidMap: () => isValidMapInstance(mapInstance.current),
  };
};
