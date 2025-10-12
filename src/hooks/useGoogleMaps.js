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
  const maxRetries = 50; // Reduced from 100 to 5 seconds (50 * 100ms)
  const initializationTimeoutRef = useRef(null);
  const lastSuccessfulInitRef = useRef(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const initializeMap = (options = {}) => {
    if (!isMountedRef.current) return;

    // Clear any existing timeout
    if (initializationTimeoutRef.current) {
      clearTimeout(initializationTimeoutRef.current);
      initializationTimeoutRef.current = null;
    }

    // Check if we recently had a successful initialization (within 2 seconds)
    const now = Date.now();
    if (
      lastSuccessfulInitRef.current &&
      now - lastSuccessfulInitRef.current < 2000
    ) {
      // If we recently had a successful init, don't retry immediately
      return;
    }

    // Check retry limit to prevent infinite loops
    if (retryCountRef.current >= maxRetries) {
      // Only set error if we haven't had a successful initialization recently
      if (
        !lastSuccessfulInitRef.current ||
        now - lastSuccessfulInitRef.current > 5000
      ) {
        setError("Failed to initialize map after maximum retries");
      }
      return;
    }

    // Ensure map ref is available and attached to DOM
    if (!mapRef.current || !document.contains(mapRef.current)) {
      retryCountRef.current++;
      initializationTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          initializeMap(options);
        }
      }, 100);
      return;
    }

    // Additional check: ensure the element has dimensions
    const rect = mapRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      retryCountRef.current++;
      initializationTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          initializeMap(options);
        }
      }, 100);
      return;
    }

    // Ensure Google Maps and marker library are fully loaded
    if (!window.google?.maps?.Map || !window.google?.maps?.marker) {
      retryCountRef.current++;
      initializationTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          initializeMap(options);
        }
      }, 100);
      return;
    }

    // Reset retry count on successful initialization
    retryCountRef.current = 0;
    lastSuccessfulInitRef.current = now;

    // Only create map if not already created or invalid
    if (!mapInstance.current || !isValidMapInstance(mapInstance.current)) {
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

        // Small delay to ensure map is fully initialized before setting ready
        setTimeout(() => {
          if (isMountedRef.current) {
            setMapReady(true);
            setError(null); // Clear any previous errors on successful initialization
          }
        }, 100);
      } catch (err) {
        if (isMountedRef.current) {
          // Only set error if this is a genuine failure, not a race condition
          console.warn(
            "[useGoogleMaps] Map initialization attempt failed:",
            err
          );
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
          if (isMountedRef.current) {
            setError("Failed to load Google Maps");
          }
        });
    }
  };

  const cleanup = () => {
    // Clear any pending initialization timeout
    if (initializationTimeoutRef.current) {
      clearTimeout(initializationTimeoutRef.current);
      initializationTimeoutRef.current = null;
    }

    if (mapInstance.current) {
      cleanupMapInstance(mapInstance.current);
      mapInstance.current = null;
      setMapReady(false);
    }

    // Reset retry count and error state
    retryCountRef.current = 0;
    setError(null);
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
