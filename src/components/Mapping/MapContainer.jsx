import React, { useRef, useEffect } from "react";
import { useGoogleMaps } from "../../hooks/useGoogleMaps";
import { useInterventions } from "../../hooks/useInterventions";
import {
  USER_PATTERN_COLORS_MAP,
  INTERVENTION_STATUS_COLORS,
  INTERVENTION_TYPE_ICONS,
  BREEDING_SITE_TYPE_ICONS,
  normalizeBarangayName,
  QC_CENTER,
} from "../../utils/mapOverlays";
import * as turf from "@turf/turf";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";

const MapContainer = ({
  barangaysList,
  posts,
  allInterventionsData,
  barangayData,
  loading,
  showBreedingSites,
  showInterventions,
  selectedBarangayFeature,
  setSelectedBarangayFeature,
  setShowControlPanel,
}) => {
  // Debug: Log the color map to verify it's loaded correctly
  console.log("USER_PATTERN_COLORS_MAP loaded:", USER_PATTERN_COLORS_MAP);
  console.log("no_change color value:", USER_PATTERN_COLORS_MAP.no_change);
  const mapRef = useRef(null);
  const overlaysRef = useRef([]);
  const infoWindowRef = useRef(null);
  const markerClusterRef = useRef(null);
  const isMountedRef = useRef(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

  // Process breeding sites from posts data
  const breedingSites = React.useMemo(() => {
    if (!posts) return [];

    const validPosts = Array.isArray(posts?.posts)
      ? posts.posts
      : Array.isArray(posts)
      ? posts
      : [];

    return validPosts.filter(
      (post) =>
        post.status === "Validated" &&
        post.specific_location &&
        Array.isArray(post.specific_location.coordinates) &&
        post.specific_location.coordinates.length === 2
    );
  }, [posts]);

  const { interventions } = useInterventions(allInterventionsData);
  const { mapInstance, mapReady, createMap, isValidMap } = useGoogleMaps(
    apiKey,
    mapId,
    mapRef
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize map when data is ready
  useEffect(() => {
    if (!barangayData || !isMountedRef.current) {
      return;
    }

    if (mapInstance && isValidMap()) {
      console.log("Map already initialized, skipping...");
      return;
    }

    console.log("Starting map initialization...");
    createMap();
  }, [barangayData, createMap, mapInstance, isValidMap]);

  // Show info window when barangay is selected from dropdown
  useEffect(() => {
    console.log("Dropdown selection effect triggered:", {
      mapInstance: !!mapInstance,
      isValidMap: isValidMap(),
      selectedBarangayFeature: !!selectedBarangayFeature,
      infoWindowRef: !!infoWindowRef.current,
    });

    if (
      !mapInstance ||
      !isValidMap() ||
      !selectedBarangayFeature ||
      !infoWindowRef.current
    ) {
      console.log("Early return from dropdown effect");
      return;
    }

    const infoWindow = infoWindowRef.current;

    // Close any existing info window
    infoWindow.close();

    // Find the center of the selected barangay
    if (selectedBarangayFeature.geometry) {
      try {
        // Use turf.js to calculate the center properly
        const center = turf.center(selectedBarangayFeature.geometry);
        const [lng, lat] = center.geometry.coordinates;

        // Validate coordinates before using them
        if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
          console.error("Invalid coordinates calculated:", { lat, lng });
          return;
        }

        // Pan to the selected barangay and zoom in
        mapInstance.panTo({ lat, lng });
        mapInstance.setZoom(15);

        // Find matching barangay in barangaysList for pattern data
        let barangayObj = barangaysList?.find(
          (b) =>
            normalizeBarangayName(b.name) ===
            normalizeBarangayName(selectedBarangayFeature.properties.name)
        );

        let patternBased =
          barangayObj?.status_and_recommendation?.pattern_based;
        let patternType = (
          patternBased?.status ||
          selectedBarangayFeature.properties.patternType ||
          "none"
        ).toLowerCase();

        // Debug logging for pattern type
        console.log("Pattern debug:", {
          barangayName: selectedBarangayFeature.properties.name,
          patternBased: patternBased,
          patternType: patternType,
          originalStatus: patternBased?.status,
          fallbackPatternType: selectedBarangayFeature.properties.patternType,
        });

        if (!patternType || patternType === "") patternType = "no_change";

        // Debug logging for color selection
        console.log("Color selection debug:", {
          patternType: patternType,
          availableColors: Object.keys(USER_PATTERN_COLORS_MAP),
          selectedColor: USER_PATTERN_COLORS_MAP[patternType],
          fallbackColor: USER_PATTERN_COLORS_MAP.default,
          noChangeColor: USER_PATTERN_COLORS_MAP.no_change,
          finalColor:
            patternType === "no_change" ||
            !patternType ||
            patternType === "" ||
            patternType === "none"
              ? USER_PATTERN_COLORS_MAP.no_change
              : USER_PATTERN_COLORS_MAP[patternType] ||
                USER_PATTERN_COLORS_MAP.default,
        });

        // Ensure no_change, empty status, and none status get the same blue color
        let patternCardColor;
        if (
          patternType === "no_change" ||
          !patternType ||
          patternType === "" ||
          patternType === "none"
        ) {
          patternCardColor = USER_PATTERN_COLORS_MAP.no_change;
          console.log("Using no_change color:", patternCardColor);
        } else {
          patternCardColor =
            USER_PATTERN_COLORS_MAP[patternType] ||
            USER_PATTERN_COLORS_MAP.default;
          console.log("Using pattern-specific color:", patternCardColor);
        }

        let reportBased = barangayObj?.status_and_recommendation?.report_based;
        let reportAlert = reportBased?.alert;
        let reportStatus = (reportBased?.status || "unknown").toLowerCase();
        let reportCardColor =
          reportStatus === "high"
            ? "border-error bg-error/5"
            : reportStatus === "medium"
            ? "border-warning bg-warning/5"
            : reportStatus === "low"
            ? "border-success bg-success/5"
            : "border-gray-400 bg-gray-100";

        // Create info window content
        const content = document.createElement("div");
        content.innerHTML = `
          <div class="bg-white p-4 rounded-lg text-center h-auto">
            <p class="text-4xl font-[900]" style="color:${patternCardColor}">Barangay ${
          selectedBarangayFeature.properties.displayName ||
          selectedBarangayFeature.properties.name ||
          "Unknown Barangay"
        }</p>
            <div class="mt-3 flex flex-col gap-3 text-black">
              <div class="p-3 rounded-lg border-2" style="border-color:${patternCardColor}">
                <div>
                  <p class="text-sm font-medium text-gray-600 uppercase">Status</p>
                  <p class="text-lg font-semibold">
                    ${
                      patternType === "no_change"
                        ? "No Change"
                        : patternType === "increase"
                        ? "Increasing"
                        : patternType === "decrease"
                        ? "Decreasing"
                        : "No Change"
                    }
                  </p>
                </div>
              </div>
              <div class="p-3 rounded-lg border-2 ${reportCardColor}">
                <div>
                  <p class="text-sm font-medium text-gray-600 uppercase">Breeding Site Reports</p>
                  <p class="text-lg font-semibold">
                    ${
                      reportAlert && reportAlert.toLowerCase() !== "none"
                        ? reportAlert
                        : "No breeding site reported in this barangay."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        `;

        infoWindow.setContent(content);
        infoWindow.setPosition({ lat, lng });

        // Debug logging
        console.log("Opening info window at:", { lat, lng });
        console.log("Info window content:", content.innerHTML);

        // Open the info window on the map
        infoWindow.open(mapInstance);

        // Remove highlight and InfoWindow when closed
        infoWindow.addListener("closeclick", () => {
          setSelectedBarangayFeature(null);
        });
      } catch (error) {
        console.error("Error calculating barangay center:", error);
        return;
      }
    }
  }, [
    selectedBarangayFeature,
    mapInstance,
    isValidMap,
    barangaysList,
    setSelectedBarangayFeature,
  ]);

  // Update map content when data changes
  useEffect(() => {
    if (!mapInstance || !isValidMap() || !barangayData) {
      return;
    }

    console.log("Updating map with new data...");

    // Clean up previous overlays
    overlaysRef.current.forEach((o) => {
      if (o && typeof o.setMap === "function") {
        o.setMap(null);
      }
    });
    overlaysRef.current = [];

    const map = mapInstance;

    // --- InfoWindow instance (only one open at a time) ---
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({
        maxWidth: 500,
      });
    }
    const infoWindow = infoWindowRef.current;
    // Don't close the info window here as it might interfere with dropdown selection
    // infoWindow.close();

    // --- Draw barangay polygons ---
    barangayData.features.forEach((feature) => {
      const geometry = feature.geometry;
      const coordsArray =
        geometry.type === "Polygon"
          ? [geometry.coordinates]
          : geometry.type === "MultiPolygon"
          ? geometry.coordinates
          : [];

      // Find matching barangay in barangaysList
      let barangayObj = barangaysList?.find(
        (b) =>
          normalizeBarangayName(b.name) ===
          normalizeBarangayName(feature.properties.name)
      );

      let patternType = (
        barangayObj?.status_and_recommendation?.pattern_based?.status ||
        feature.properties.patternType ||
        feature.properties.pattern_type ||
        "none"
      ).toLowerCase();

      // Debug logging for initial polygon pattern type
      console.log("Initial polygon pattern debug:", {
        barangayName: feature.properties.name,
        patternType: patternType,
        originalStatus:
          barangayObj?.status_and_recommendation?.pattern_based?.status,
        fallbackPatternType:
          feature.properties.patternType || feature.properties.pattern_type,
      });

      if (!patternType || patternType === "" || patternType === "none")
        patternType = "no_change";

      // Debug logging for color selection
      console.log("Initial polygon color debug:", {
        patternType: patternType,
        availableColors: Object.keys(USER_PATTERN_COLORS_MAP),
        selectedColor: USER_PATTERN_COLORS_MAP[patternType],
        fallbackColor: USER_PATTERN_COLORS_MAP.default,
      });

      // Ensure no_change, empty status, and none status get the same blue color
      let patternColor;
      if (
        patternType === "no_change" ||
        !patternType ||
        patternType === "" ||
        patternType === "none"
      ) {
        patternColor = USER_PATTERN_COLORS_MAP.no_change;
        console.log("Initial polygon using no_change color:", patternColor);
      } else {
        patternColor =
          USER_PATTERN_COLORS_MAP[patternType] ||
          USER_PATTERN_COLORS_MAP.default;
        console.log(
          "Initial polygon using pattern-specific color:",
          patternColor
        );
      }

      coordsArray.forEach((polygonCoords) => {
        const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));

        // Highlight if selected
        const isSelected =
          selectedBarangayFeature &&
          normalizeBarangayName(selectedBarangayFeature.properties.name) ===
            normalizeBarangayName(feature.properties.name);

        const polygon = new window.google.maps.Polygon({
          paths: path,
          strokeColor: isSelected ? patternColor : "#333",
          strokeOpacity: isSelected ? 1 : 0.6,
          strokeWeight: isSelected ? 4 : 1,
          fillOpacity: 0.5,
          fillColor: patternColor,
          map,
          zIndex: isSelected ? 2 : 1,
        });

        polygon.addListener("click", (e) => {
          // Don't show barangay info if breeding sites or interventions are being displayed
          if (showBreedingSites || showInterventions) {
            return;
          }

          // Center of polygon
          const center = turf.center(feature.geometry);
          const [lng, lat] = center.geometry.coordinates;
          if (mapInstance) {
            mapInstance.panTo({ lat, lng });
            mapInstance.setZoom(15);
          }

          // Hide control panel on md screens and lower
          if (
            window.matchMedia &&
            window.matchMedia("(max-width: 768px)").matches
          ) {
            setShowControlPanel(false);
          }

          setSelectedBarangayFeature(feature); // highlight

          let barangayObj = barangaysList?.find(
            (b) =>
              normalizeBarangayName(b.name) ===
              normalizeBarangayName(feature.properties.name)
          );

          let patternBased =
            barangayObj?.status_and_recommendation?.pattern_based;
          let patternType = (
            patternBased?.status ||
            feature.properties.patternType ||
            "none"
          ).toLowerCase();

          // Debug logging for polygon click pattern type
          console.log("Polygon click pattern debug:", {
            barangayName: feature.properties.name,
            patternBased: patternBased,
            patternType: patternType,
            originalStatus: patternBased?.status,
            fallbackPatternType: feature.properties.patternType,
          });

          if (!patternType || patternType === "" || patternType === "none")
            patternType = "no_change";

          // Debug logging for color selection
          console.log("Polygon click color debug:", {
            patternType: patternType,
            availableColors: Object.keys(USER_PATTERN_COLORS_MAP),
            selectedColor: USER_PATTERN_COLORS_MAP[patternType],
            fallbackColor: USER_PATTERN_COLORS_MAP.default,
          });

          // Ensure no_change, empty status, and none status get the same blue color
          let patternCardColor;
          if (
            patternType === "no_change" ||
            !patternType ||
            patternType === "" ||
            patternType === "none"
          ) {
            patternCardColor = USER_PATTERN_COLORS_MAP.no_change;
            console.log(
              "Polygon click using no_change color:",
              patternCardColor
            );
          } else {
            patternCardColor =
              USER_PATTERN_COLORS_MAP[patternType] ||
              USER_PATTERN_COLORS_MAP.default;
            console.log(
              "Polygon click using pattern-specific color:",
              patternCardColor
            );
          }

          let reportBased =
            barangayObj?.status_and_recommendation?.report_based;
          let reportAlert = reportBased?.alert;
          let reportStatus = (reportBased?.status || "unknown").toLowerCase();
          let reportCardColor =
            reportStatus === "high"
              ? "border-error bg-error/5"
              : reportStatus === "medium"
              ? "border-warning bg-warning/5"
              : reportStatus === "low"
              ? "border-success bg-success/5"
              : "border-gray-400 bg-gray-100";

          // Use a div with Tailwind classes for InfoWindow content
          const content = document.createElement("div");
          content.innerHTML = `
          <div class="bg-white p-4 rounded-lg text-center h-auto">
            <p class="text-4xl font-[900]" style="color:${patternCardColor}">Barangay ${
            feature.properties.displayName ||
            feature.properties.name ||
            "Unknown Barangay"
          }</p>
            <div class="mt-3 flex flex-col gap-3 text-black">
              <div class="p-3 rounded-lg border-2" style="border-color:${patternCardColor}">
                    <div>
                  <p class="text-sm font-medium text-gray-600 uppercase">Status</p>
                  <p class="text-lg font-semibold">
                    ${
                      patternType === "no_change"
                        ? "No Change"
                        : patternType === "increase"
                        ? "Increasing"
                        : patternType === "decrease"
                        ? "Decreasing"
                        : "No Change"
                    }
                      </p>
                    </div>
                  </div>
              <div class="p-3 rounded-lg border-2 ${reportCardColor}">
                    <div>
                  <p class="text-sm font-medium text-gray-600 uppercase">Breeding Site Reports</p>
                  <p class="text-lg font-semibold">
                    ${
                      reportAlert && reportAlert.toLowerCase() !== "none"
                        ? reportAlert
                        : "No breeding site reported in this barangay."
                    }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
        `;
          infoWindow.setContent(content);
          infoWindow.setPosition({ lat, lng });
          infoWindow.open(map);

          // Remove highlight and InfoWindow when closed
          infoWindow.addListener("closeclick", () => {
            setSelectedBarangayFeature(null);
          });
        });

        overlaysRef.current.push(polygon);
      });
    });

    // --- Draw breeding site markers with clustering ---
    let breedingMarkers = [];
    if (
      showBreedingSites &&
      breedingSites.length > 0 &&
      window.google.maps.marker
    ) {
      const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
      breedingMarkers = breedingSites.map((site) => {
        // Use the correct SVG icon for the breeding site type
        const iconUrl =
          BREEDING_SITE_TYPE_ICONS[site.report_type] ||
          BREEDING_SITE_TYPE_ICONS.default;
        const glyphImg = document.createElement("img");
        glyphImg.src = iconUrl;
        glyphImg.style.width = "28px";
        glyphImg.style.height = "28px";
        glyphImg.style.objectFit = "contain";
        glyphImg.style.backgroundColor = "#FFFFFF";
        glyphImg.style.borderRadius = "100%";
        glyphImg.style.padding = "2px";

        const pin = new PinElement({
          glyph: glyphImg,
          background: "#FF6347",
          borderColor: "#FF6347",
          scale: 1.5,
        });

        const marker = new AdvancedMarkerElement({
          map,
          position: {
            lat: site.specific_location.coordinates[1],
            lng: site.specific_location.coordinates[0],
          },
          content: pin.element,
          title: site.report_type || "Breeding Site",
        });

        marker.addListener("click", () => {
          // Close barangay info window if open
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
            setSelectedBarangayFeature(null);
          }

          // Pan to marker position and zoom in
          if (mapInstance) {
            mapInstance.panTo({
              lat: site.specific_location.coordinates[1],
              lng: site.specific_location.coordinates[0],
            });
            mapInstance.setZoom(17);
          }

          // Hide control panel on md screens and lower
          if (
            window.matchMedia &&
            window.matchMedia("(max-width: 768px)").matches
          ) {
            setShowControlPanel(false);
          }

          // Use a div with Tailwind classes for InfoWindow content
          const content = document.createElement("div");
          content.innerHTML = `
          <div class="bg-white p-4 rounded-lg text-primary text-center max-w-120 w-[50vw]">
            <p class="font-bold text-4xl font-extrabold mb-4 text-primary">
              ${site.report_type || "Breeding Site"}
            </p>
            <div class="flex flex-col items-center mt-2 space-y-1 font-normal text-center">
              <p class="text-xl">
                <span class="font-bold">Barangay:</span> ${site.barangay || ""}
              </p>
              <p class="text-xl">
                <span class="font-bold">Reported by:</span> ${
                  site.user?.username || ""
                }
              </p>
              <p class="text-xl">
                <span class="font-bold">Date:</span> ${
                  site.date_and_time
                    ? new Date(site.date_and_time).toLocaleDateString()
                    : ""
                }
              </p>
              <p class="text-xl">
                <span class="font-bold">Description:</span> ${
                  site.description || ""
                }
              </p>
              ${
                site.images && site.images.length > 0
                  ? `<div class='mt-2 flex justify-center gap-2'>${site.images
                      .map(
                        (img) =>
                          `<img src='${img}' class='w-35 h-25 object-cover rounded border'/>`
                      )
                      .join("")}</div>`
                  : ""
              }
            </div>
            <button class="mt-4 px-4 py-2 bg-primary w-[40%] text-white rounded-lg shadow hover:bg-primary/80 hover:cursor-pointer font-bold" onclick="window.location.href='/mapping/${
              site._id
            }'">View Details</button>
          </div>
        `;
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        });

        return marker;
      });

      // Cluster the markers
      if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
        if (markerClusterRef.current) markerClusterRef.current.setMap(null);
        markerClusterRef.current = new window.markerClusterer.MarkerClusterer({
          markers: breedingMarkers,
          map,
        });
      } else {
        // fallback: just show markers
        breedingMarkers.forEach((m) => m.setMap(map));
      }
      overlaysRef.current.push(...breedingMarkers);
    }

    // --- Draw intervention markers ---
    if (showInterventions && interventions.length > 0) {
      console.log("[DEBUG] Drawing intervention markers:", interventions);

      // Check if marker library is available
      if (!window.google?.maps?.marker) {
        console.error("[DEBUG] Marker library not available");
        return;
      }

      const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;

      interventions.forEach((intervention) => {
        console.log("[DEBUG] Creating marker for intervention:", intervention);

        try {
          const iconUrl =
            INTERVENTION_TYPE_ICONS[intervention.type] ||
            INTERVENTION_TYPE_ICONS.default;
          const glyphImg = document.createElement("img");
          glyphImg.src = iconUrl;
          glyphImg.style.width = "28px";
          glyphImg.style.height = "28px";
          glyphImg.style.objectFit = "contain";
          glyphImg.style.backgroundColor = "#FFFFFF";
          glyphImg.style.borderRadius = "100%";
          glyphImg.style.padding = "2px";

          const pin = new PinElement({
            glyph: glyphImg,
            background: "#1893F8",
            borderColor: "#1893F8",
            scale: 1.5,
          });

          const marker = new AdvancedMarkerElement({
            map,
            position: {
              lat: intervention.specific_location.coordinates[1],
              lng: intervention.specific_location.coordinates[0],
            },
            content: pin.element,
            title: intervention.type || "Intervention",
          });

          marker.addListener("click", () => {
            // Close barangay info window if open
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
              setSelectedBarangayFeature(null);
            }

            // Pan to marker position and zoom in
            if (mapInstance) {
              mapInstance.panTo({
                lat: intervention.specific_location.coordinates[1],
                lng: intervention.specific_location.coordinates[0],
              });
              mapInstance.setZoom(17);
            }

            // Hide control panel on md screens and lower
            if (
              window.matchMedia &&
              window.matchMedia("(max-width: 768px)").matches
            ) {
              setShowControlPanel(false);
            }

            // Use a div with Tailwind classes for InfoWindow content
            const content = document.createElement("div");
            content.innerHTML = `
            <div class="bg-white p-4 rounded-lg text-primary text-center max-w-120 w-[50vw]">
              <p class="font-bold text-4xl font-extrabold mb-4 text-primary">
                ${intervention.type || "Intervention"}
              </p>
              <div class="flex flex-col items-center mt-2 space-y-1 font-normal text-center">
                <p class="text-lg"><span class="font-bold">Status:</span> ${
                  intervention.status || ""
                }</p>
                <p class="text-lg"><span class="font-bold">Date:</span> ${
                  intervention.date_and_time
                    ? new Date(intervention.date_and_time).toLocaleDateString()
                    : ""
                }</p>
                <p class="text-lg"><span class="font-bold">Description:</span> ${
                  intervention.description || ""
                }</p>
                <p class="text-lg"><span class="font-bold">Personnel:</span> ${
                  intervention.personnel || ""
                }</p>
              </div>
            </div>
          `;

            if (!infoWindowRef.current) {
              infoWindowRef.current = new window.google.maps.InfoWindow({
                maxWidth: 500,
              });
            }
            const infoWindow = infoWindowRef.current;
            infoWindow.setContent(content);
            infoWindow.setPosition({
              lat: intervention.specific_location.coordinates[1],
              lng: intervention.specific_location.coordinates[0],
            });
            infoWindow.open(map, marker);
          });

          overlaysRef.current.push(marker);
        } catch (error) {
          console.error("[DEBUG] Error creating marker:", error);
        }
      });
    }
  }, [
    mapInstance,
    barangayData,
    breedingSites,
    showBreedingSites,
    showInterventions,
    interventions,
    selectedBarangayFeature,
    barangaysList,
    setShowControlPanel,
    isValidMap,
  ]);

  // Show loading spinner if map isn't ready
  if (loading) {
    return (
      <LoadingSpinner
        size={32}
        className="h-screen"
        message="Loading map data..."
      />
    );
  }

  return (
    <div
      ref={mapRef}
      id="map"
      className="w-full h-full"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    />
  );
};

export default MapContainer;
