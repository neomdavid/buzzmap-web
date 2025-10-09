import React, { useRef, useEffect } from "react";
import { useGoogleMaps } from "../../hooks/useGoogleMaps";
import { useInterventions } from "../../hooks/useInterventions";
import {
  USER_PATTERN_COLORS_MAP,
  INTERVENTION_STATUS_COLORS,
  INTERVENTION_TYPE_ICONS,
  getInterventionIcon,
  BREEDING_SITE_TYPE_ICONS,
  normalizeBarangayName,
  QC_CENTER,
} from "../../utils/mapOverlays";
import center from "@turf/center";
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
  baseUrl = "/map", // Default to user map URL
}) => {
  // Debug: Log the color map to verify it's loaded correctly

  const mapRef = useRef(null);
  const overlaysRef = useRef([]);
  const infoWindowRef = useRef(null);
  const markerClusterRef = useRef(null);
  const isMountedRef = useRef(true);
  const isInitializingRef = useRef(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

  // Treat certain common variants as equivalent (e.g., with/without 'Sr')
  const namesAreEquivalent = (nameA, nameB) => {
    const a = normalizeBarangayName(nameA || "");
    const b = normalizeBarangayName(nameB || "");
    if (a === b) return true;
    const stripSr = (s) => s.replace(/sr$/i, "");
    return stripSr(a) === stripSr(b);
  };

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
  // Only show ongoing and scheduled interventions on the user map
  const activeInterventions = React.useMemo(() => {
    return Array.isArray(interventions)
      ? interventions.filter((i) => {
          const status = (i.status || "").toLowerCase();
          return status === "ongoing" || status === "scheduled";
        })
      : [];
  }, [interventions]);
  const { mapInstance, mapReady, createMap, isValidMap, error } = useGoogleMaps(
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

  // Debug: Track when mapRef is set
  useEffect(() => {
    console.log("[MapContainer] mapRef changed:", mapRef.current);
    if (mapRef.current) {
      console.log("[MapContainer] mapRef is now set, element:", mapRef.current);
      console.log(
        "[MapContainer] element in DOM:",
        document.contains(mapRef.current)
      );
    }
  }, [mapRef.current]);

  // Initialize map when data is ready
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (!barangayData) return;
    if (isInitializingRef.current) return; // Prevent multiple initializations

    if (mapInstance && isValidMap()) {
      console.log("Map already initialized, skipping...");
      return;
    }

    console.log("Starting map initialization...");
    isInitializingRef.current = true;

    // Wait for Google Maps to be fully loaded before creating map
    const waitForGoogleMaps = () => {
      return new Promise((resolve) => {
        const checkReady = () => {
          if (window.google?.maps?.Map && window.google?.maps?.marker) {
            console.log("[MapContainer] Google Maps fully loaded");
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });
    };

    // Additional delay to ensure DOM is fully rendered
    const waitForDOM = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("[MapContainer] DOM should be ready now");
          console.log("[MapContainer] mapRef.current:", mapRef.current);
          console.log(
            "[MapContainer] document.contains:",
            mapRef.current ? document.contains(mapRef.current) : "ref is null"
          );
          resolve();
        }, 500); // Give extra time for DOM rendering
      });
    };

    const initializeMap = async () => {
      try {
        await waitForGoogleMaps();
        await waitForDOM(); // Wait for DOM to be ready
        if (isMountedRef.current) {
          createMap();
          isInitializingRef.current = false; // Reset initialization flag
        }
      } catch (error) {
        console.error("[MapContainer] Error waiting for Google Maps:", error);
        isInitializingRef.current = false; // Reset on error
      }
    };

    initializeMap();
  }, [barangayData]); // Remove createMap, mapInstance, isValidMap from dependencies

  // Show info window when barangay is selected from dropdown
  useEffect(() => {
    console.log("[MapContainer] Dropdown selection effect triggered:", {
      hasMapInstance: !!mapInstance,
      isValidMap: isValidMap(),
      hasSelectedBarangayFeature: !!selectedBarangayFeature,
      hasInfoWindow: !!infoWindowRef.current,
      selectedBarangayName: selectedBarangayFeature?.properties?.name,
    });

    if (!mapInstance || !isValidMap() || !selectedBarangayFeature) {
      console.log(
        "[MapContainer] Early return from dropdown effect (missing deps)"
      );
      return;
    }

    if (!infoWindowRef.current) {
      console.log(
        "[MapContainer] Creating InfoWindow instance (dropdown effect)"
      );
      infoWindowRef.current = new window.google.maps.InfoWindow({
        maxWidth: 500,
      });
    }

    const infoWindow = infoWindowRef.current;

    // Close any existing info window
    infoWindow.close();

    // Find the center of the selected barangay
    if (selectedBarangayFeature.geometry) {
      try {
        const centerFeature = center(selectedBarangayFeature.geometry);
        const [lng, lat] = centerFeature.geometry.coordinates;
        console.log("[MapContainer] Dropdown center computed:", { lat, lng });

        if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
          console.error("[MapContainer] Invalid coordinates calculated:", {
            lat,
            lng,
          });
          return;
        }

        mapInstance.panTo({ lat, lng });
        mapInstance.setZoom(15);

        // Find matching barangay in barangaysList for pattern data
        let barangayObj = barangaysList?.find((b) =>
          namesAreEquivalent(b.name, selectedBarangayFeature.properties.name)
        );
        console.log("[MapContainer] Dropdown matched API barangay:", {
          selectedName: selectedBarangayFeature.properties.name,
          matchedName: barangayObj?.name,
          found: !!barangayObj,
        });

        let patternBased =
          barangayObj?.status_and_recommendation?.pattern_based;
        let patternType = (
          patternBased?.status ||
          selectedBarangayFeature.properties.patternType ||
          "none"
        ).toLowerCase();

        console.log("[MapContainer] Dropdown pattern details:", {
          patternType,
          patternBased,
          reportBased: barangayObj?.status_and_recommendation?.report_based,
          deathPriority: barangayObj?.status_and_recommendation?.death_priority,
          statusAndRec: barangayObj?.status_and_recommendation,
        });

        if (!patternType || patternType === "") patternType = "no_change";

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

        const patternCardColor =
          patternType === "no_change" ||
          !patternType ||
          patternType === "" ||
          patternType === "none"
            ? USER_PATTERN_COLORS_MAP.no_change
            : USER_PATTERN_COLORS_MAP[patternType] ||
              USER_PATTERN_COLORS_MAP.default;

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
        console.log("[MapContainer] Opening InfoWindow (dropdown) at:", {
          lat,
          lng,
        });
        infoWindow.open(mapInstance);

        infoWindow.addListener("closeclick", () => {
          setSelectedBarangayFeature(null);
          if (mapInstance) {
            mapInstance.panTo({ lat: 14.676, lng: 121.0437 });
            mapInstance.setZoom(13);
          }
        });
      } catch (error) {
        console.error(
          "[MapContainer] Error calculating barangay center:",
          error
        );
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

    // Ensure map container is properly mounted
    if (!mapRef.current || !document.contains(mapRef.current)) {
      console.log("Map container not ready, skipping update...");
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
      let barangayObj = barangaysList?.find((b) =>
        namesAreEquivalent(b.name, feature.properties.name)
      );

      let patternType = (
        barangayObj?.status_and_recommendation?.pattern_based?.status ||
        feature.properties.patternType ||
        feature.properties.pattern_type ||
        "none"
      ).toLowerCase();

      if (!patternType || patternType === "" || patternType === "none")
        patternType = "no_change";

      // Ensure no_change, empty status, and none status get the same blue color
      let patternColor;
      if (
        patternType === "no_change" ||
        !patternType ||
        patternType === "" ||
        patternType === "none"
      ) {
        patternColor = USER_PATTERN_COLORS_MAP.no_change;
      } else {
        patternColor =
          USER_PATTERN_COLORS_MAP[patternType] ||
          USER_PATTERN_COLORS_MAP.default;
      }

      coordsArray.forEach((polygonCoords) => {
        const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));

        // Highlight if selected
        const isSelected =
          selectedBarangayFeature &&
          namesAreEquivalent(
            selectedBarangayFeature.properties.name,
            feature.properties.name
          );

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
          const centerFeature = center(feature.geometry);
          const [lng, lat] = centerFeature.geometry.coordinates;
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

          let barangayObj = barangaysList?.find((b) =>
            namesAreEquivalent(b.name, feature.properties.name)
          );
          console.log("[MapContainer] Polygon click - matching API barangay:", {
            featureName: feature.properties.name,
            matchedName: barangayObj?.name,
            found: !!barangayObj,
          });

          let patternBased =
            barangayObj?.status_and_recommendation?.pattern_based;
          let patternType = (
            patternBased?.status ||
            feature.properties.patternType ||
            "none"
          ).toLowerCase();

          console.log("[MapContainer] Polygon click pattern details:", {
            patternType,
            patternBased,
            reportBased: barangayObj?.status_and_recommendation?.report_based,
            deathPriority:
              barangayObj?.status_and_recommendation?.death_priority,
            statusAndRec: barangayObj?.status_and_recommendation,
          });

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
                  <div class="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <p class="text-gray-600 mb-1">Color Legend:</p>
                    <div class="flex justify-center gap-4 text-xs">
                      <div class="flex items-center gap-1">
                        <div class="w-3 h-3 rounded" style="background-color: #e53e3e;"></div>
                        <span>Increasing</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <div class="w-3 h-3 rounded" style="background-color: #38a169;"></div>
                        <span>Decreasing</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <div class="w-3 h-3 rounded" style="background-color: #718096;"></div>
                        <span>Stable</span>
                      </div>
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
            // Pan out to show full view
            if (mapInstance) {
              mapInstance.panTo({ lat: 14.676, lng: 121.0437 });
              mapInstance.setZoom(13);
            }
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
      window.google?.maps?.marker
    ) {
      const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
      breedingMarkers = breedingSites.map((site) => {
        // Use the correct SVG icon for the breeding site type
        const iconUrl =
          BREEDING_SITE_TYPE_ICONS[site.report_type] ||
          BREEDING_SITE_TYPE_ICONS.default;
        const glyphImg = document.createElement("img");
        glyphImg.src = iconUrl;
        glyphImg.alt = `${site.report_type || "Breeding Site"} icon`;
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

        // Ensure map instance is valid before creating marker
        if (!map || !isValidMap()) {
          console.warn(
            "[MapContainer] Invalid map instance, skipping marker creation"
          );
          return null;
        }

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
            // Pan out to show full view
            if (mapInstance) {
              mapInstance.panTo({ lat: 14.676, lng: 121.0437 });
              mapInstance.setZoom(13);
            }
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
                    ? new Date(site.date_and_time).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
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
                        (img, idx) =>
                          `<img src='${img}' alt='Breeding site photo ${
                            idx + 1
                          }' class='w-35 h-25 object-cover rounded border'/>`
                      )
                      .join("")}</div>`
                  : ""
              }
            </div>
            <button id="view-details-${
              site._id
            }" class="mt-4 px-4 py-2 bg-primary w-[40%] text-white rounded-lg shadow hover:bg-primary/80 hover:cursor-pointer font-bold">View Details</button>
          </div>
        `;
          infoWindow.setContent(content);
          infoWindow.open(map, marker);

          // Attach navigation handler programmatically to satisfy CSP
          const viewBtn = content.querySelector(`#view-details-${site._id}`);
          if (viewBtn) {
            viewBtn.addEventListener(
              "click",
              (e) => {
                e.preventDefault();
                window.location.href = `${baseUrl}/${site._id}`;
              },
              { once: true }
            );
          }

          // Add close event handler to pan out when info window is closed
          infoWindow.addListener("closeclick", () => {
            // Pan out to show full view
            if (mapInstance) {
              mapInstance.panTo({ lat: 14.676, lng: 121.0437 });
              mapInstance.setZoom(13);
            }
          });
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
    if (showInterventions && activeInterventions.length > 0) {
      console.log("[DEBUG] Drawing intervention markers:", activeInterventions);

      // Check if marker library is available
      if (!window.google?.maps?.marker) {
        console.error("[DEBUG] Marker library not available");
        return;
      }

      const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;

      activeInterventions.forEach((intervention) => {
        console.log("[DEBUG] Creating marker for intervention:", intervention);

        try {
          // Ensure map instance is valid before creating marker
          if (!map || !isValidMap()) {
            console.warn(
              "[MapContainer] Invalid map instance, skipping intervention marker creation"
            );
            return;
          }

          const iconUrl = getInterventionIcon(
            intervention.type || intervention.interventionType
          );
          const glyphImg = document.createElement("img");
          glyphImg.src = iconUrl;
          glyphImg.alt = `${
            intervention.type || intervention.interventionType || "Intervention"
          } icon`;
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
            try {
              console.debug(
                "[User/MapContainer] Clicked intervention marker (raw object):",
                intervention
              );
            } catch (_) {}
            // Close barangay info window if open
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
              setSelectedBarangayFeature(null);
              // Pan out to show full view
              if (mapInstance) {
                mapInstance.panTo({ lat: 14.676, lng: 121.0437 });
                mapInstance.setZoom(13);
              }
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
            const dateValue =
              intervention.date_and_time ||
              intervention.date ||
              intervention.createdAt ||
              intervention.updatedAt ||
              null;
            const description =
              intervention.description || intervention.details || "";
            content.innerHTML = `
            <div class="bg-white p-4 rounded-lg text-primary text-center max-w-120 w-[50vw]">
              <p class="font-bold text-4xl font-extrabold mb-4 text-primary">
                ${
                  intervention.type ||
                  intervention.interventionType ||
                  "Intervention"
                }
              </p>
              <div class="flex flex-col items-center mt-2 space-y-1 font-normal text-center">
                <p class="text-lg"><span class="font-bold">Status:</span> ${
                  intervention.status || ""
                }</p>
                ${
                  dateValue
                    ? `<p class="text-lg"><span class="font-bold">Date:</span> ${new Date(
                        dateValue
                      ).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}</p>`
                    : ""
                }
                ${
                  description
                    ? `<p class=\"text-lg\"><span class=\"font-bold\">Description:</span> ${description}</p>`
                    : ""
                }
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

            // Add close event handler to pan out when info window is closed
            infoWindow.addListener("closeclick", () => {
              // Pan out to show full view
              if (mapInstance) {
                mapInstance.panTo({ lat: 14.676, lng: 121.0437 });
                mapInstance.setZoom(13);
              }
            });
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

  // Show error if map failed to initialize
  if (error) {
    return (
      <ErrorMessage
        message="Failed to load map. Please refresh the page."
        className="h-screen"
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Always render the map container so ref can be attached */}
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

      {/* Show loading spinner as overlay when map isn't ready */}
      {loading || !mapReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <LoadingSpinner size={32} message="Loading map data..." />
        </div>
      ) : null}
    </div>
  );
};

export default MapContainer;
