import React, { useState, useEffect, useRef, useCallback } from "react";
import center from "@turf/center";
import { useGetBarangaysQuery } from "../../api/dengueApi";
import {
  getPatternColor,
  normalizePatternType,
} from "../../utils/patternConfig";

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
    if (document.getElementById("google-maps-script")) {
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
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
  return googleMapsScriptLoadingPromise;
}
// --- End loader ---

const QC_DEFAULT_CENTER = { lat: 14.6488, lng: 121.0509 };
const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "400px",
  borderRadius: "0.5rem",
};

const InterventionLocationPicker = ({
  onPinChange,
  initialPin,
  focusCommand,
  patternType,
  preselectedBarangay,
  highlightedBarangay,
  onBoundaryDataLoad,
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const overlaysRef = useRef([]);
  const [qcBoundaryFeatures, setQcBoundaryFeatures] = useState([]);
  const [isBoundaryDataLoaded, setIsBoundaryDataLoaded] = useState(false);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [currentPinDetail, setCurrentPinDetail] = useState({
    barangayName: "",
    isValid: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [highlightedBarangayName, setHighlightedBarangayName] = useState(
    highlightedBarangay || ""
  );
  const highlightedBarangayRef = useRef(highlightedBarangay);
  const errorTimeoutRef = useRef(null);

  // Sync highlightedBarangayName with highlightedBarangay prop
  useEffect(() => {
    console.log(
      "[DEBUG] InterventionLocationPicker received highlightedBarangay:",
      highlightedBarangay
    );
    setHighlightedBarangayName(highlightedBarangay || "");
    highlightedBarangayRef.current = highlightedBarangay;
    console.log(
      "[DEBUG] Set highlightedBarangayName to:",
      highlightedBarangay || ""
    );
    console.log(
      "[DEBUG] highlightedBarangayRef.current is now:",
      highlightedBarangayRef.current
    );

    // Clear marker when barangay changes
    if (highlightedBarangay) {
      console.log("Clearing marker due to barangay change");
      setCurrentMarker(null);
      setErrorMessage("");
    }
  }, [highlightedBarangay]);

  // Load barangay boundaries
  useEffect(() => {
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        setQcBoundaryFeatures(data.features);
        setIsBoundaryDataLoaded(true);
      })
      .catch((error) => {
        setIsBoundaryDataLoaded(false);
      });
  }, []);

  // Helper: validate coordinates
  const validateCoordinates = useCallback(
    (latLng) => {
      console.log(
        "[DEBUG] validateCoordinates called with highlightedBarangay:",
        highlightedBarangayRef.current
      );
      if (!isBoundaryDataLoaded || !qcBoundaryFeatures.length) {
        return {
          barangayName: null,
          isValid: false,
          error: "Boundary data not loaded",
        };
      }
      const point = turf.point([latLng.lng, latLng.lat]);
      let foundBarangayName = null;
      let isWithinAnyBarangay = false;
      for (const feature of qcBoundaryFeatures) {
        if (feature.geometry) {
          let isInside = false;
          try {
            if (feature.geometry.type === "Polygon") {
              // First, try to fix the polygon if it has common issues
              let validFeature = feature;
              const coords = feature.geometry.coordinates[0];

              if (coords && coords.length > 0) {
                const firstCoord = coords[0];
                const lastCoord = coords[coords.length - 1];

                // Check if the ring is not closed and fix it
                if (
                  firstCoord[0] !== lastCoord[0] ||
                  firstCoord[1] !== lastCoord[1]
                ) {
                  console.log(
                    "Fixing unclosed polygon ring for",
                    feature.properties.name
                  );
                  // Close the ring by adding the first coordinate at the end
                  const fixedCoords = [...coords, firstCoord];
                  validFeature = {
                    ...feature,
                    geometry: {
                      ...feature.geometry,
                      coordinates: [fixedCoords],
                    },
                  };
                }
              }

              // Now try to validate the (possibly fixed) polygon
              try {
                isInside = turf.booleanPointInPolygon(point, validFeature);
                if (validFeature !== feature) {
                  console.log(
                    "Successfully used fixed polygon for",
                    feature.properties.name
                  );
                }
              } catch (validationError) {
                console.warn(
                  "Polygon validation failed for",
                  feature.properties.name,
                  "even after fixing:",
                  validationError.message
                );
                continue;
              }
            } else if (feature.geometry.type === "MultiPolygon") {
              // First, try to fix each polygon in the MultiPolygon
              const fixedPolygonCoords = feature.geometry.coordinates.map(
                (ring) => {
                  if (ring.length > 0) {
                    const firstCoord = ring[0];
                    const lastCoord = ring[ring.length - 1];
                    if (
                      firstCoord[0] !== lastCoord[0] ||
                      firstCoord[1] !== lastCoord[1]
                    ) {
                      console.log(
                        "Fixing unclosed ring in MultiPolygon for",
                        feature.properties.name
                      );
                      return [...ring, firstCoord];
                    }
                  }
                  return ring;
                }
              );

              // Try to create a valid MultiPolygon feature
              let validMultiPolygonFeature = feature;
              if (
                JSON.stringify(fixedPolygonCoords) !==
                JSON.stringify(feature.geometry.coordinates)
              ) {
                validMultiPolygonFeature = {
                  ...feature,
                  geometry: {
                    ...feature.geometry,
                    coordinates: fixedPolygonCoords,
                  },
                };
                console.log(
                  "Using fixed MultiPolygon for",
                  feature.properties.name
                );
              }

              // Now try to validate each polygon in the MultiPolygon
              for (const polygonCoords of validMultiPolygonFeature.geometry
                .coordinates) {
                try {
                  const polygonFeature = turf.polygon(polygonCoords);
                  if (turf.booleanPointInPolygon(point, polygonFeature)) {
                    isInside = true;
                    break;
                  }
                } catch (multiPolygonError) {
                  console.warn(
                    "Error in MultiPolygon ring for",
                    feature.properties.name,
                    multiPolygonError
                  );
                  continue;
                }
              }
            }

            // Debug logging for Laging Handa specifically
            if (feature.properties.name === "Laging Handa") {
              console.log("Checking Laging Handa polygon:", {
                featureName: feature.properties.name,
                geometryType: feature.geometry.type,
                isInside,
                coordinates: latLng,
                point: point,
              });
            }
          } catch (error) {
            console.warn(
              "Error checking point in polygon for feature:",
              feature.properties.name,
              error
            );
            // Skip this feature if there's an error
            continue;
          }
          if (isInside) {
            foundBarangayName = feature.properties.name || "Unknown Barangay";
            isWithinAnyBarangay = true;
            console.log("Point is inside barangay:", {
              barangayName: foundBarangayName,
              coordinates: latLng,
              featureName: feature.properties.name,
            });
            break;
          }
        }
      }
      if (!isWithinAnyBarangay) {
        // Fallback: Check if point is within Quezon City bounding box
        const qcBounds = {
          north: 14.8,
          south: 14.5,
          east: 121.2,
          west: 120.9,
        };

        const isWithinQCBounds =
          latLng.lat >= qcBounds.south &&
          latLng.lat <= qcBounds.north &&
          latLng.lng >= qcBounds.west &&
          latLng.lng <= qcBounds.east;

        if (!isWithinQCBounds) {
          return {
            barangayName: null,
            isValid: false,
            error: "Pinned location is outside Quezon City boundaries.",
          };
        }

        // If within QC bounds but not in any barangay, allow it but show warning
        console.warn(
          "Point is within QC bounds but not in any barangay polygon"
        );
        foundBarangayName = "Unknown Barangay";
        isWithinAnyBarangay = true;
      }
      // Enforce highlightedBarangay only - use case-insensitive and trimmed comparison
      if (highlightedBarangayRef.current && foundBarangayName) {
        // More robust normalization - remove extra spaces, normalize unicode, and handle special characters
        const normalizedFound = foundBarangayName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .normalize("NFD") // Normalize unicode
          .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics

        const normalizedHighlighted = highlightedBarangayRef.current
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .normalize("NFD") // Normalize unicode
          .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics

        // Debug logging with more details
        console.log("Barangay name comparison:", {
          foundBarangayName,
          highlightedBarangay: highlightedBarangayRef.current,
          normalizedFound,
          normalizedHighlighted,
          match: normalizedFound === normalizedHighlighted,
          foundLength: foundBarangayName.length,
          highlightedLength: highlightedBarangayRef.current.length,
          foundCharCodes: foundBarangayName
            .split("")
            .map((c) => c.charCodeAt(0)),
          highlightedCharCodes: highlightedBarangayRef.current
            .split("")
            .map((c) => c.charCodeAt(0)),
        });

        // Try exact match first
        if (normalizedFound !== normalizedHighlighted) {
          // Try a more flexible comparison - check if one contains the other
          const foundWords = normalizedFound.split(" ");
          const highlightedWords = normalizedHighlighted.split(" ");

          // Check if all words in highlighted are found in the found name
          const isFlexibleMatch = highlightedWords.every((word) =>
            foundWords.some(
              (foundWord) =>
                foundWord.includes(word) || word.includes(foundWord)
            )
          );

          console.log("Flexible match check:", {
            foundWords,
            highlightedWords,
            isFlexibleMatch,
          });

          if (!isFlexibleMatch) {
            return {
              barangayName: foundBarangayName,
              isValid: false,
              error: `Pin must be within ${highlightedBarangayRef.current} only`,
            };
          } else {
            console.log("Using flexible match for barangay validation");
          }
        }
      }

      // If no highlighted barangay is set, allow pinning anywhere within QC
      if (!highlightedBarangayRef.current && foundBarangayName) {
        console.log("No highlighted barangay set, allowing pin anywhere in QC");
      }
      return { barangayName: foundBarangayName, isValid: true, error: "" };
    },
    [qcBoundaryFeatures, isBoundaryDataLoaded]
  );

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
          mapInstance.current.panTo({
            lat: initialPin.lat,
            lng: initialPin.lng,
          });
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
      setCurrentPinDetail({ barangayName: "", isValid: false });
      setErrorMessage("");
      return;
    }
    const validation = validateCoordinates(currentMarker);
    setCurrentPinDetail({
      barangayName: validation.barangayName || "",
      isValid: validation.isValid,
    });
    setErrorMessage(validation.error || "");
    if (validation.isValid && validation.barangayName) {
      // Geocode address if possible
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: currentMarker }, (results, status) => {
          const formattedAddress =
            status === "OK" && results && results[0]
              ? results[0].formatted_address
              : null;
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
      if (focusCommand.type === "barangay" && focusCommand.center) {
        mapInstance.current.panTo(focusCommand.center);
        mapInstance.current.setZoom(focusCommand.zoom || 15);
        setHighlightedBarangayName(focusCommand.name);
      } else if (
        focusCommand.type === "pin" &&
        focusCommand.lat &&
        focusCommand.lng
      ) {
        const newPin = { lat: focusCommand.lat, lng: focusCommand.lng };
        mapInstance.current.panTo(newPin);
        mapInstance.current.setZoom(focusCommand.zoom || 18);
        setCurrentMarker(newPin);
      }
    } else {
      setHighlightedBarangayName("");
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
        mapTypeId: "roadmap",
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "road",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
      // Draw polygons and marker
      drawMapFeatures(
        mapInstance.current,
        qcBoundaryFeatures,
        highlightedBarangayName,
        currentMarker
      );

      // Apply any existing focus command immediately after init
      if (focusCommand) {
        if (focusCommand.type === "barangay" && focusCommand.center) {
          mapInstance.current.panTo(focusCommand.center);
          mapInstance.current.setZoom(focusCommand.zoom || 15);
          setHighlightedBarangayName(focusCommand.name);
        } else if (
          focusCommand.type === "pin" &&
          focusCommand.lat &&
          focusCommand.lng
        ) {
          const newPin = { lat: focusCommand.lat, lng: focusCommand.lng };
          setCurrentMarker(newPin);
          mapInstance.current.panTo(newPin);
          mapInstance.current.setZoom(focusCommand.zoom || 18);
        }
      }

      // Click handler with barangay enforcement
      mapInstance.current.addListener("click", (e) => {
        const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        console.log("Map clicked at:", coords);
        console.log(
          "Current highlightedBarangayName:",
          highlightedBarangayName
        );
        console.log("Current highlightedBarangay prop:", highlightedBarangay);
        console.log(
          "Current highlightedBarangayRef:",
          highlightedBarangayRef.current
        );
        console.log(
          "Boundary data loaded:",
          isBoundaryDataLoaded,
          "Features count:",
          qcBoundaryFeatures.length
        );

        const validation = validateCoordinates(coords);
        console.log("Validation result:", validation);

        if (!validation.isValid) {
          // Show inline message and do not place marker
          console.log("Validation failed, showing error:", validation.error);
          setErrorMessage(validation.error || "Invalid location");

          // Clear any existing timeout
          if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
          }

          // Clear error message after 5 seconds
          errorTimeoutRef.current = setTimeout(() => {
            setErrorMessage("");
            errorTimeoutRef.current = null;
          }, 5000);
          return;
        }
        // Place marker only when valid and within highlighted barangay (if provided)
        console.log("Setting current marker to:", coords);
        setCurrentMarker(coords);

        // Clear any existing error timeout and error message
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
          errorTimeoutRef.current = null;
        }
        setErrorMessage(""); // Clear any error message

        mapInstance.current.panTo(coords);
        mapInstance.current.setZoom(18);
        console.log("Calling drawMapFeatures with coords:", coords);
        drawMapFeatures(
          mapInstance.current,
          qcBoundaryFeatures,
          highlightedBarangayName,
          coords
        );
      });
    });
  }, [isBoundaryDataLoaded]);

  // Redraw polygons/marker when highlight or marker changes
  useEffect(() => {
    if (!isBoundaryDataLoaded || !mapInstance.current) return;
    console.log(
      "useEffect redraw triggered with currentMarker:",
      currentMarker
    );
    drawMapFeatures(
      mapInstance.current,
      qcBoundaryFeatures,
      highlightedBarangayName,
      currentMarker
    );
  }, [
    highlightedBarangayName,
    currentMarker,
    isBoundaryDataLoaded,
    qcBoundaryFeatures,
  ]);

  // Draw polygons and marker
  function drawMapFeatures(map, features, highlightedBarangayName, markerPos) {
    console.log("drawMapFeatures called with markerPos:", markerPos);
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
    // Pattern color map - use centralized configuration
    const patternColors = {
      spike: { stroke: "#ef4444", fill: "#fee2e2" }, // red
      increase: { stroke: "#f59e42", fill: "#fef3c7" }, // yellow/orange
      decrease: { stroke: "#22c55e", fill: "#bbf7d0" }, // green
      low_level_activity: { stroke: "#3b82f6", fill: "#dbeafe" }, // blue
      no_change: { stroke: "#6b7280", fill: "#f3f4f6" }, // gray
      none: { stroke: "#6b7280", fill: "#f3f4f6" }, // gray
    };
    const highlightColor = patternColors[patternType] || patternColors.none;
    features.forEach((feature) => {
      const geometry = feature.geometry;
      const coordsArray =
        geometry.type === "Polygon"
          ? [geometry.coordinates]
          : geometry.type === "MultiPolygon"
          ? geometry.coordinates
          : [];
      coordsArray.forEach((polygonCoords) => {
        const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
        const isHighlighted =
          highlightedBarangayName &&
          feature.properties.name === highlightedBarangayName;
        const polygon = new window.google.maps.Polygon({
          paths: path,
          strokeColor: isHighlighted ? "#FF8C00" : "#276749",
          strokeOpacity: isHighlighted ? 0.8 : 0.3,
          strokeWeight: isHighlighted ? 2 : 1,
          fillOpacity: 0.1,
          fillColor: isHighlighted ? "#FF8C00" : "#4A8D6E",
          map,
          zIndex: isHighlighted ? 10 : 1,
          clickable: false,
        });
        overlaysRef.current.push(polygon);
      });
    });
    // Draw marker
    if (markerPos) {
      console.log("Creating marker at position:", markerPos);
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new window.google.maps.Marker({
        position: markerPos,
        map,
        title: "Pinned Location",
      });
      console.log("Marker created:", markerRef.current);
    } else {
      console.log("No marker position provided, removing existing marker");
      if (markerRef.current) markerRef.current.setMap(null);
    }
  }

  // Update the style function to use highlightedBarangay
  const style = useCallback(
    (feature) => {
      const barangayName = feature.properties.BRGY_NAME;
      return {
        fillColor: barangayName === highlightedBarangay ? "#ff0000" : "#3388ff",
        fillOpacity: barangayName === highlightedBarangay ? 0.3 : 0.1,
        color: barangayName === highlightedBarangay ? "#ff0000" : "#3388ff",
        weight: barangayName === highlightedBarangay ? 3 : 1,
        opacity: 1,
      };
    },
    [highlightedBarangay]
  );

  return (
    <div className="flex flex-col space-y-3">
      <div
        ref={mapRef}
        style={MAP_CONTAINER_STYLE}
        className="w-full h-[300px] rounded-lg border border-gray-200"
      />
      {errorMessage && (
        <p className="text-sm text-error bg-error/10 p-2 rounded-md">
          {errorMessage}
        </p>
      )}
      {currentPinDetail.isValid &&
        currentPinDetail.barangayName &&
        !errorMessage && (
          <p className="text-sm text-success bg-success/10 p-2 rounded-md">
            Pinned in Barangay: <strong>{currentPinDetail.barangayName}</strong>
          </p>
        )}
      {currentMarker && (
        <div className="text-xs text-gray-500">
          Pinned Location - Lat: {currentMarker.lat.toFixed(6)}, Lng:{" "}
          {currentMarker.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default InterventionLocationPicker;
