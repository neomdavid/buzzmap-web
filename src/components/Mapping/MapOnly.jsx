import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  useGetBarangaysQuery,
  useGetAdminBarangaysQuery,
  useGetPostsQuery,
  useGetGroupedReportsQuery,
} from "../../api/dengueApi";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import cleanUpIcon from "../../assets/icons/cleanup.svg";
import foggingIcon from "../../assets/icons/fogging.svg";
import educationIcon from "../../assets/icons/education.svg";
import trappingIcon from "../../assets/icons/trapping.svg";
import { getInterventionIcon } from "../../utils/mapOverlays";
import stagnantIcon from "../../assets/icons/stagnant_water.svg";
import garbageIcon from "../../assets/icons/garbage.svg";
import othersIcon from "../../assets/icons/others.svg";
import allIcon from "../../assets/all.svg";
import {
  loadGoogleMapsScript,
  createMapInstance,
  cleanupMapInstance,
  isValidMapInstance,
} from "../../utils/googleMapsLoader";
import { ADMIN_PATTERN_COLORS_MAP } from "../../utils/mapOverlays";

// Use admin pattern colors from mapOverlays
const PATTERN_COLORS = ADMIN_PATTERN_COLORS_MAP;

// Add darker versions of pattern colors for admin patterns
const PATTERN_COLORS_DARK = {
  spike: "#c53030", // Darker red
  increase: "#b45309", // Darker orange
  decrease: "#2f855a", // Darker green
  low_level_activity: "#2c5282", // Darker blue
  no_change: "#4a5568", // Darker gray
  none: "#4a5568", // Darker gray
  default: "#4a5568", // Darker gray
};

const INTERVENTION_TYPE_ICONS = {
  All: allIcon,
  all: allIcon,
  Fogging: foggingIcon,
  "Ovicidal-Larvicidal Trapping": trappingIcon,
  "Clean-up Drive": cleanUpIcon,
  "Education Campaign": educationIcon,
  default: foggingIcon,
};
const BREEDING_SITE_TYPE_ICONS = {
  "Stagnant Water": stagnantIcon,
  "Standing Water": stagnantIcon, // Use same icon as stagnant water
  "Uncollected Garbage or Trash": garbageIcon,
  Others: othersIcon,
  default: stagnantIcon,
};
function normalizeBarangayName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\bsr\.?\b/g, "")
    .replace(/\bjr\.?\b/g, "")
    .replace(/[.\-']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
const QC_CENTER = { lat: 14.676, lng: 121.0437 };

const MapOnly = forwardRef(
  (
    {
      showBreedingSites = true,
      showInterventions = false,
      style = {},
      className = "",
      selectedBarangay = null,
      onBarangaySelect = null,
      interventions = [],
      clusters = [], // optional list of clusters with center and counts
      onMarkerClick = null,
      useAdminEndpoint = false, // New prop to determine which endpoint to use
      recentOnly = false, // Show only recent validated reports markers
      recentCount = 5, // How many recent markers to show when recentOnly is true
      recentPosts = null, // Optional: provide the same recent posts as table
      baseUrl = "/mapping",
      // User map controls
      validatedOnly = false,
      hideClusterOverlays = false,
      suppressClusterStyling = false,
    },
    ref
  ) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const overlaysRef = useRef([]);
    const markerClusterRef = useRef(null);
    const isMountedRef = useRef(true);
    const infoWindowRef = useRef(null);
    const [error, setError] = useState(null);
    const [barangayData, setBarangayData] = useState(null);
    const [breedingSites, setBreedingSites] = useState([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    // Use admin endpoint if specified, otherwise use user endpoint
    const { data: barangaysList } = useAdminEndpoint
      ? useGetAdminBarangaysQuery()
      : useGetBarangaysQuery();
    const { data: posts } = useGetPostsQuery();
    const { data: groupedReports } = useGetGroupedReportsQuery();
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
    const [infoWindow, setInfoWindow] = useState(null);
    const effectiveBaseUrl = useRef(null);
    if (effectiveBaseUrl.current === null) {
      if (baseUrl && typeof baseUrl === "string" && baseUrl.length > 0) {
        effectiveBaseUrl.current = baseUrl;
      } else {
        const path =
          typeof window !== "undefined" ? window.location.pathname : "";
        effectiveBaseUrl.current = path.includes("/admin")
          ? "/admin/mapping"
          : "/mapping";
      }
      try {
        console.debug("[MapOnly] Base URL debug", {
          propBaseUrl: baseUrl,
          effectiveBaseUrl: effectiveBaseUrl.current,
          locationPath:
            typeof window !== "undefined"
              ? window.location.pathname
              : "(no-window)",
        });
      } catch (_) {}
    }
    const clusterOverlaysRef = useRef([]);
    const breedingMarkersRef = useRef([]);

    useEffect(() => {
      return () => {
        isMountedRef.current = false;
        if (mapInstance.current) {
          overlaysRef.current.forEach((o) => o.setMap(null));
          overlaysRef.current = [];
          clusterOverlaysRef.current.forEach((o) => o.setMap && o.setMap(null));
          clusterOverlaysRef.current = [];
          if (markerClusterRef.current) {
            try {
              markerClusterRef.current.setMap(null);
            } catch (_) {}
            markerClusterRef.current = null;
          }
          breedingMarkersRef.current = [];
          cleanupMapInstance(mapInstance.current);
          mapInstance.current = null;
        }
      };
    }, []);

    useEffect(() => {
      const fetchData = async () => {
        if (!isMountedRef.current) return;
        try {
          const barangayResponse = await fetch(
            "/quezon_barangays_boundaries.geojson"
          );
          if (!barangayResponse.ok)
            throw new Error("Failed to load barangay data");
          const barangayGeoJson = await barangayResponse.json();
          if (isMountedRef.current) {
            setBarangayData(barangayGeoJson);
          }
          // Prefer grouped endpoint: include individuals and cluster members
          if (groupedReports) {
            const individuals = Array.isArray(groupedReports.individual_reports)
              ? groupedReports.individual_reports
              : [];
            const clusterMembers = Array.isArray(groupedReports.clusters)
              ? groupedReports.clusters.flatMap((c) =>
                  Array.isArray(c.reports)
                    ? c.reports.filter(
                        (r) =>
                          r?.specific_location &&
                          Array.isArray(r.specific_location.coordinates) &&
                          r.specific_location.coordinates.length === 2
                      )
                    : []
                )
              : [];
            let merged = [...individuals, ...clusterMembers];
            if (validatedOnly) {
              merged = merged.filter((r) => r?.status === "Validated");
            }
            if (isMountedRef.current) {
              setBreedingSites(merged);
            }
          } else if (posts) {
            const validPosts = Array.isArray(posts?.posts)
              ? posts.posts
              : Array.isArray(posts)
              ? posts
              : [];
            const validatedSites = validPosts.filter((post) => {
              const hasCoords =
                post.specific_location &&
                Array.isArray(post.specific_location.coordinates) &&
                post.specific_location.coordinates.length === 2;
              if (!hasCoords) return false;
              if (validatedOnly) return post.status === "Validated";
              return post.status === "Validated" || post.isInCluster === true;
            });
            if (isMountedRef.current) {
              setBreedingSites(validatedSites);
            }
          } else if (isMountedRef.current) {
            setBreedingSites([]);
          }
        } catch (err) {
          if (isMountedRef.current) {
            setError(err.message);
          }
        }
      };
      fetchData();
    }, [barangaysList, posts, groupedReports]);

    useImperativeHandle(
      ref,
      () => ({
        panTo: (position) => {
          if (mapInstance.current) {
            mapInstance.current.panTo(position);
          }
        },
        setZoom: (zoom) => {
          if (mapInstance.current) {
            mapInstance.current.setZoom(zoom);
          }
        },
        showInfoWindow: (content, position) => {
          if (!infoWindowRef.current) {
            infoWindowRef.current = new window.google.maps.InfoWindow({
              maxWidth: 500,
            });
          }
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.setPosition(position);
          infoWindowRef.current.open(mapInstance.current);
        },
      }),
      []
    );

    useEffect(() => {
      let map,
        overlays = [];
      setMapLoaded(false);
      loadGoogleMapsScript(apiKey)
        .then(() => {
          if (!isMountedRef.current) return;
          overlaysRef.current.forEach((o) => o.setMap(null));
          overlaysRef.current = [];
          clusterOverlaysRef.current.forEach((o) => o.setMap && o.setMap(null));
          clusterOverlaysRef.current = [];
          if (markerClusterRef.current) {
            try {
              markerClusterRef.current.setMap(null);
            } catch (_) {}
            markerClusterRef.current = null;
          }
          breedingMarkersRef.current = [];
          if (!mapInstance.current) {
            try {
              mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: QC_CENTER,
                zoom: 13,
                mapId: mapId || undefined,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
              });
              window.google.maps.event.addListenerOnce(
                mapInstance.current,
                "tilesloaded",
                () => {
                  setMapLoaded(true);
                }
              );
            } catch (err) {
              if (isMountedRef.current) {
                setError("Failed to initialize map");
              }
              return;
            }
          } else {
            window.google.maps.event.addListenerOnce(
              mapInstance.current,
              "tilesloaded",
              () => {
                setMapLoaded(true);
              }
            );
          }
          map = mapInstance.current;
          if (!map || !barangayData || !barangaysList) {
            return;
          }

          // Clear existing overlays
          overlays.forEach((overlay) => overlay.setMap(null));
          overlays.length = 0;

          // Create polygons for each barangay
          barangayData.features.forEach((feature) => {
            const geometry = feature.geometry;
            const coordsArray =
              geometry.type === "Polygon"
                ? [geometry.coordinates]
                : geometry.type === "MultiPolygon"
                ? geometry.coordinates
                : [];

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
            if (!patternType || patternType === "") patternType = "none";

            // Normalize pattern types for admin maps to handle variations
            if (useAdminEndpoint) {
              // Handle common pattern type variations
              if (patternType.includes("low_level"))
                patternType = "low_level_activity";
              if (
                patternType.includes("gradual") ||
                patternType.includes("rise") ||
                patternType === "increase"
              )
                patternType = "increase";
              if (patternType.includes("decline") || patternType === "decrease")
                patternType = "decrease";
              if (
                patternType.includes("stability") ||
                patternType.includes("stable")
              )
                patternType = "low_level_activity";
              if (patternType.includes("spike")) patternType = "spike";
              if (patternType.includes("no_change") || patternType === "none")
                patternType = "no_change";
            }

            const patternColor =
              PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
            const patternColorDark =
              PATTERN_COLORS_DARK[patternType] || PATTERN_COLORS_DARK.default;

            // Check if this feature is the selected barangay
            const isSelected =
              selectedBarangay &&
              normalizeBarangayName(feature.properties.name) ===
                normalizeBarangayName(selectedBarangay.properties?.name);

            coordsArray.forEach((polygonCoords) => {
              const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));

              const polygon = new window.google.maps.Polygon({
                paths: path,
                strokeColor: isSelected ? patternColorDark : patternColor,
                strokeOpacity: isSelected ? 1 : 0.7,
                strokeWeight: isSelected ? 6 : 1,
                fillOpacity: 0.5,
                fillColor: patternColor,
                map,
                zIndex: isSelected ? 10 : 1,
              });

              // Add click listener
              polygon.addListener("click", () => {
                if (onBarangaySelect) {
                  const selectedFeature = {
                    ...feature,
                    properties: {
                      ...feature.properties,
                      displayName: feature.properties.name,
                      patternType,
                      color: patternColor,
                      status_and_recommendation:
                        barangayObj?.status_and_recommendation,
                      risk_level: barangayObj?.risk_level,
                      pattern_data: barangayObj?.pattern_data,
                    },
                  };
                  onBarangaySelect(selectedFeature);
                }
              });

              overlays.push(polygon);
            });
          });

          let breedingMarkers = [];
          if (
            showBreedingSites &&
            breedingSites.length > 0 &&
            window.google.maps.marker
          ) {
            const { AdvancedMarkerElement, PinElement } =
              window.google.maps.marker;
            let sitesToRender = breedingSites;
            if (recentOnly) {
              if (Array.isArray(recentPosts) && recentPosts.length > 0) {
                const recentIdSet = new Set(
                  recentPosts.map((p) => p._id).filter(Boolean)
                );
                sitesToRender = breedingSites.filter((site) =>
                  recentIdSet.has(site._id)
                );
              } else {
                sitesToRender = [...breedingSites]
                  .sort((a, b) => {
                    const da = new Date(
                      a.date_and_time || a.createdAt || 0
                    ).getTime();
                    const db = new Date(
                      b.date_and_time || b.createdAt || 0
                    ).getTime();
                    return db - da;
                  })
                  .slice(0, Math.max(0, recentCount || 0));
              }
            }

            // Compute slight offsets for markers with identical coordinates to avoid exact overlap
            const groupCounts = new Map();
            sitesToRender.forEach((s) => {
              const key = `${s.specific_location.coordinates[1].toFixed(
                6
              )},${s.specific_location.coordinates[0].toFixed(6)}`;
              groupCounts.set(key, (groupCounts.get(key) || 0) + 1);
            });
            const groupIndex = new Map();

            breedingMarkers = sitesToRender.map((site) => {
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

              // Indicator styling: cluster members use violet unless suppressed
              const isValidated = site.status === "Validated";
              const isClusterMember = site.isInCluster === true;
              const pin = new PinElement({
                glyph: glyphImg,
                background:
                  suppressClusterStyling || !isClusterMember
                    ? "#FF6347"
                    : "#8B5CF6",
                borderColor:
                  suppressClusterStyling || !isClusterMember
                    ? "#FF6347"
                    : "#8B5CF6",
                scale: 1.5,
              });

              // Wrap the pin in a container to add a small status dot indicator
              const markerContent = document.createElement("div");
              markerContent.style.position = "relative";
              markerContent.appendChild(pin.element);

              const statusStr =
                typeof site.status === "string" ? site.status : "";
              const isPending = statusStr.toLowerCase().includes("pending");
              const isRejected = statusStr === "Rejected";

              // Add status badge for ALL reports (individual and cluster members) unless validatedOnly
              if (!validatedOnly && (isPending || isValidated || isRejected)) {
                const badge = document.createElement("div");
                badge.style.position = "absolute";
                badge.style.top = "-2px";
                badge.style.right = "0px";
                badge.style.width = "10px";
                badge.style.height = "10px";
                badge.style.display = "block";
                badge.style.backgroundColor = isPending
                  ? "#f59e0b" // orange for pending
                  : isRejected
                  ? "#dc2626" // red for rejected
                  : "#10b981"; // green for validated
                badge.style.border = "1px solid #FFFFFF";
                badge.style.borderRadius = "9999px";
                badge.style.boxShadow = "0 0 2px rgba(0,0,0,0.3)";
                markerContent.appendChild(badge);
              }

              // Determine adjusted position if overlapping at the exact same coordinates
              const originalLat = site.specific_location.coordinates[1];
              const originalLng = site.specific_location.coordinates[0];
              const key = `${originalLat.toFixed(6)},${originalLng.toFixed(6)}`;
              const count = groupCounts.get(key) || 1;
              let adjLat = originalLat;
              let adjLng = originalLng;
              if (count > 1) {
                const idx = groupIndex.get(key) || 0;
                groupIndex.set(key, idx + 1);
                const angle = (2 * Math.PI * idx) / count;
                const radiusMeters = 8; // small ring radius
                const metersPerDegLat = 111320; // approx
                const metersPerDegLng =
                  111320 * Math.cos((originalLat * Math.PI) / 180);
                adjLat =
                  originalLat +
                  (radiusMeters * Math.sin(angle)) / metersPerDegLat;
                adjLng =
                  originalLng +
                  (radiusMeters * Math.cos(angle)) / metersPerDegLng;
              }

              const marker = new AdvancedMarkerElement({
                map,
                position: {
                  lat: adjLat,
                  lng: adjLng,
                },
                content: markerContent,
                collisionBehavior:
                  window.google?.maps?.marker?.CollisionBehavior
                    ?.REQUIRED_AND_HIDES_OPTIONAL,
                title:
                  (site.report_type || "Breeding Site") +
                  (isClusterMember ? " (Cluster)" : "") +
                  (isPending
                    ? " (Pending)"
                    : isValidated
                    ? " (Validated)"
                    : ""),
              });

              if (!validatedOnly) {
                marker.addListener("click", () => {
                  // Close existing info window if open
                  if (infoWindow) {
                    infoWindow.close();
                  }

                  // Pan to marker position and zoom in
                  if (mapInstance.current) {
                    mapInstance.current.panTo({
                      lat: site.specific_location.coordinates[1],
                      lng: site.specific_location.coordinates[0],
                    });
                    mapInstance.current.setZoom(17);
                  }

                  // Use a div with Tailwind classes for InfoWindow content
                  const content = document.createElement("div");
                  content.innerHTML = `
              <div class=\"bg-white p-4 rounded-lg text-primary text-center max-w-120 w-[50vw]\">
                <p class=\"font-bold text-4xl font-extrabold mb-4 text-primary\">
                  ${site.report_type || "Breeding Site"}
                </p>
                <div class=\"flex flex-col items-center mt-2 space-y-1 font-normal text-center\">
                  ${
                    isClusterMember
                      ? '<div class="mb-1"><span class="px-2 py-1 rounded-full text-white text-xs font-bold" style="background-color:#8B5CF6">Cluster Member</span></div>'
                      : ""
                  }
                  <p class=\"text-xl\">
                    <span class=\"font-bold\">Barangay:</span> ${
                      site.barangay || ""
                    }
                  </p>
                  <p class=\"text-xl\">
                    <span class=\"font-bold\">Reported by:</span> ${
                      site.user?.username || ""
                    }
                  </p>
                  <p class=\"text-xl\">
                    <span class=\"font-bold\">Date:</span> ${
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
                  <p class=\"text-xl\">
                    <span class=\"font-bold\">Description:</span> ${
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
                <button data-report-id=\"${
                  site._id
                }\" id=\"bm-view-details-btn\" class=\"mt-4 px-4 py-2 bg-primary w-[40%] text-white rounded-lg shadow hover:bg-primary/80 hover:cursor-pointer font-bold\">View Details</button>
              </div>
            `;

                  try {
                    console.debug("[MapOnly] InfoWindow open", {
                      reportId: site._id,
                      isClusterMember,
                      status: site.status,
                      propBaseUrl: baseUrl,
                      effectiveBaseUrl: effectiveBaseUrl.current,
                      locationPath:
                        typeof window !== "undefined"
                          ? window.location.pathname
                          : "(no-window)",
                    });
                  } catch (_) {}

                  // Attach explicit button click handler with robust base URL choice
                  try {
                    const btn = content.querySelector("#bm-view-details-btn");
                    if (btn) {
                      btn.addEventListener("click", () => {
                        try {
                          const reportId = String(site._id || "");
                          const path =
                            window &&
                            window.location &&
                            window.location.pathname
                              ? window.location.pathname
                              : "";
                          const derived =
                            path.indexOf("/admin") > -1
                              ? "/admin/mapping"
                              : "/mapping";
                          const finalBase =
                            effectiveBaseUrl.current &&
                            typeof effectiveBaseUrl.current === "string" &&
                            effectiveBaseUrl.current.length > 0
                              ? effectiveBaseUrl.current
                              : baseUrl &&
                                typeof baseUrl === "string" &&
                                baseUrl.length > 0
                              ? baseUrl
                              : derived;
                          console.debug("[MapOnly] Navigate click (listener)", {
                            reportId,
                            path,
                            derived,
                            baseProp: baseUrl,
                            effectiveBase: effectiveBaseUrl.current,
                            finalBase,
                          });
                          window.location.href = `${finalBase}/${reportId}`;
                        } catch (e) {
                          console.error(
                            "[MapOnly] Navigate click error (listener)",
                            e
                          );
                          window.location.href = `/mapping/${site._id}`;
                        }
                      });
                    }
                  } catch (e) {
                    console.error("[MapOnly] Failed to bind click listener", e);
                  }

                  infoWindow.setContent(content);
                  infoWindow.setPosition({
                    lat: site.specific_location.coordinates[1],
                    lng: site.specific_location.coordinates[0],
                  });

                  infoWindow.open(map, marker);
                });
              }

              return marker;
            });
            // Disable default MarkerClusterer; manage visibility with zoom + cluster circles
            breedingMarkers.forEach((m) => m.setMap(map));
            overlays.push(...breedingMarkers);
            breedingMarkersRef.current = breedingMarkers;
          }

          // Draw intervention markers
          if (
            showInterventions &&
            interventions.length > 0 &&
            window.google.maps.marker
          ) {
            const { AdvancedMarkerElement, PinElement } =
              window.google.maps.marker;
            const interventionMarkers = interventions
              .filter((intervention) => {
                const status = intervention.status?.toLowerCase();
                return status === "ongoing" || status === "scheduled";
              })
              .map((intervention) => {
                // Debug: log the raw intervention data used for the marker/info window
                try {
                  console.debug(
                    "[MapOnly] Rendering intervention marker:",
                    intervention
                  );
                } catch (_) {}
                const iconUrl = getInterventionIcon(
                  intervention.interventionType || intervention.type
                );
                const glyphImg = document.createElement("img");
                glyphImg.src = iconUrl;
                glyphImg.alt = `${
                  intervention.interventionType ||
                  intervention.type ||
                  "Intervention"
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
                  title: intervention.interventionType,
                });

                marker.addListener("click", () => {
                  try {
                    console.debug(
                      "[MapOnly] Clicked intervention marker (raw object):",
                      intervention
                    );
                  } catch (_) {}
                  // Close existing info window if open
                  if (infoWindow) {
                    infoWindow.close();
                  }

                  // Pan to marker position and zoom in
                  if (mapInstance.current) {
                    mapInstance.current.panTo({
                      lat: intervention.specific_location.coordinates[1],
                      lng: intervention.specific_location.coordinates[0],
                    });
                    mapInstance.current.setZoom(17);
                  }

                  // Use a div with Tailwind classes for InfoWindow content
                  const content = document.createElement("div");
                  const dateValue =
                    intervention.date ||
                    intervention.date_and_time ||
                    intervention.createdAt ||
                    intervention.updatedAt ||
                    null;
                  const description =
                    intervention.description || intervention.details || "";
                  const address =
                    intervention.address || intervention.location || "";
                  content.innerHTML = `
                <div class="p-3 flex flex-col items-center gap-1 font-normal bg-white text-center rounded-md shadow-md text-primary">
                  <p class="text-4xl font-extrabold text-primary mb-2">${
                    intervention.interventionType ||
                    intervention.type ||
                    "Intervention"
                  }</p>
                  <div class="text-lg flex items-center gap-2">
                    <span class="font-bold">Status:</span>
                    <span class="px-3 py-1 rounded-full text-white font-bold text-sm" style="background-color:#FF6347;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                      ${intervention.status || ""}
                    </span>
                  </div>
                  <p class="text-lg text-center"><span class="font-bold">Barangay:</span> ${
                    intervention.barangay || ""
                  }</p>
                  ${
                    address
                      ? `<p class="text-lg text-center"><span class="font-bold text-center">Address:</span> ${address}</p>`
                      : ""
                  }
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
                      ? `<p class="text-lg text-center"><span class="font-bold">Description:</span> ${description}</p>`
                      : ""
                  }
                </div>
              `;

                  infoWindow.setContent(content);
                  infoWindow.setPosition({
                    lat: intervention.specific_location.coordinates[1],
                    lng: intervention.specific_location.coordinates[0],
                  });

                  infoWindow.open(map, marker);
                });

                return marker;
              });
            overlays.push(...interventionMarkers);
          }

          // Draw cluster center indicators (optional)
          try {
            clusterOverlaysRef.current.forEach(
              (o) => o.setMap && o.setMap(null)
            );
            clusterOverlaysRef.current = [];
            if (
              !hideClusterOverlays &&
              Array.isArray(clusters) &&
              clusters.length > 0
            ) {
              clusters.forEach((c) => {
                // True cluster members only
                const memberReports = Array.isArray(c.reports)
                  ? c.reports.filter(
                      (r) =>
                        r?.isInCluster === true &&
                        r?.exclude_from_clustering !== true &&
                        (r?.cluster === c._id || r?.cluster === c.id)
                    )
                  : [];

                const count = memberReports.length;
                if (count === 0) return;
                // Color by resolved state: prefer backend isResolved, fallback to counts
                const totalInCluster = count;
                const resolvedInCluster =
                  (typeof c.resolvedCount === "number" && c.resolvedCount) ||
                  (typeof c?.breakdown?.resolved_reports === "number"
                    ? c.breakdown.resolved_reports
                    : memberReports.filter((r) => r?.isResolved === true)
                        .length);
                const isResolvedCluster =
                  typeof c.isResolved === "boolean"
                    ? c.isResolved
                    : totalInCluster > 0 &&
                      resolvedInCluster === totalInCluster;
                // If all member reports are Validated, show green; else red
                const allValidated =
                  memberReports.length > 0 &&
                  memberReports.every((r) => r?.status === "Validated");
                const color =
                  isResolvedCluster || allValidated ? "#10b981" : "#dc2626";

                // Compute coords list for members
                const coords = memberReports
                  .map((r) =>
                    r?.specific_location?.coordinates
                      ? {
                          lat: r.specific_location.coordinates[1],
                          lng: r.specific_location.coordinates[0],
                        }
                      : r?.coordinates
                  )
                  .filter(
                    (p) =>
                      p &&
                      typeof p.lat === "number" &&
                      typeof p.lng === "number"
                  );

                // Determine circle center: prefer backend center; fallback to average of member coords
                let centerLat = c?.center?.lat;
                let centerLng = c?.center?.lng;
                if (
                  typeof centerLat !== "number" ||
                  typeof centerLng !== "number"
                ) {
                  const sum = coords.reduce(
                    (acc, p) => {
                      acc.lat += p.lat;
                      acc.lng += p.lng;
                      return acc;
                    },
                    { lat: 0, lng: 0 }
                  );
                  centerLat = sum.lat / coords.length;
                  centerLng = sum.lng / coords.length;
                }

                let bounds;
                if (coords.length > 0 && window.google?.maps?.LatLngBounds) {
                  bounds = new window.google.maps.LatLngBounds();
                  coords.forEach((p) => bounds.extend(p));
                }

                // Estimate radius in meters from center to farthest point with padding
                let radiusMeters = 15; // default smaller radius
                if (coords.length > 0) {
                  const metersPerDegLat = 111320;
                  const metersPerDegLng =
                    111320 * Math.cos((centerLat * Math.PI) / 180);
                  let maxMeters = 0;
                  coords.forEach((p) => {
                    const dLatM = Math.abs(p.lat - centerLat) * metersPerDegLat;
                    const dLngM = Math.abs(p.lng - centerLng) * metersPerDegLng;
                    const dist = Math.sqrt(dLatM * dLatM + dLngM * dLngM);
                    if (dist > maxMeters) maxMeters = dist;
                  });
                  radiusMeters = Math.max(8, maxMeters + 6); // reduced padding & min radius
                }

                // Draw a map circle that scales with zoom
                if (window.google?.maps?.Circle) {
                  const circle = new window.google.maps.Circle({
                    strokeColor: color,
                    strokeOpacity: 0.9,
                    strokeWeight: 2,
                    fillColor: color,
                    fillOpacity: 0.12,
                    center: { lat: centerLat, lng: centerLng },
                    radius: radiusMeters,
                    map,
                  });
                  clusterOverlaysRef.current.push(circle);

                  circle.addListener("click", () => {
                    if (mapInstance.current) {
                      if (bounds) {
                        mapInstance.current.fitBounds(bounds, 80);
                      } else {
                        mapInstance.current.panTo({
                          lat: centerLat,
                          lng: centerLng,
                        });
                        mapInstance.current.setZoom(16);
                      }
                    }
                  });
                }

                // Add a small count badge at the center
                const container = document.createElement("div");
                container.style.position = "relative";
                const label = document.createElement("div");
                label.textContent = String(count);
                label.style.minWidth = "18px";
                label.style.height = "18px";
                label.style.padding = "0 4px";
                label.style.borderRadius = "9999px";
                label.style.background = "#ffffff";
                label.style.border = `2px solid ${color}`;
                label.style.color = "#111827";
                label.style.fontSize = "12px";
                label.style.fontWeight = "800";
                label.style.display = "flex";
                label.style.alignItems = "center";
                label.style.justifyContent = "center";
                label.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
                container.appendChild(label);

                if (window.google?.maps?.marker?.AdvancedMarkerElement) {
                  const { AdvancedMarkerElement } = window.google.maps.marker;
                  const badgeMarker = new AdvancedMarkerElement({
                    map,
                    position: { lat: centerLat, lng: centerLng },
                    content: container,
                    title: `Cluster (${count})`,
                  });
                  badgeMarker.addListener("click", () => {
                    if (mapInstance.current) {
                      if (bounds) {
                        mapInstance.current.fitBounds(bounds, 80);
                      } else {
                        mapInstance.current.panTo({
                          lat: centerLat,
                          lng: centerLng,
                        });
                        mapInstance.current.setZoom(16);
                      }
                    }
                  });
                  clusterOverlaysRef.current.push(badgeMarker);
                }
              });
            }
          } catch (e) {
            // no-op if marker library missing
          }

          overlaysRef.current = overlays;

          // Toggle visibility based on zoom: always show circles; toggle report markers
          const updateVisibility = () => {
            try {
              const visibleMap = showBreedingSites ? map : null;
              // Show/hide individual report markers based on toggle
              breedingMarkersRef.current.forEach((m) => m.setMap(visibleMap));
              // Show/hide cluster overlays based on toggle
              clusterOverlaysRef.current.forEach(
                (o) => o.setMap && o.setMap(visibleMap)
              );
            } catch (_) {}
          };
          updateVisibility();
          if (map && map.addListener) {
            window.google.maps.event.addListener(
              map,
              "zoom_changed",
              updateVisibility
            );
          }
        })
        .catch((err) => {
          if (isMountedRef.current) {
            setError("Failed to load Google Maps");
          }
        });
      return () => {
        overlaysRef.current.forEach((o) => o.setMap(null));
        overlaysRef.current = [];
        if (markerClusterRef.current) {
          try {
            markerClusterRef.current.setMap(null);
          } catch (_) {}
          markerClusterRef.current = null;
        }
      };
    }, [
      barangayData,
      barangaysList,
      selectedBarangay,
      onBarangaySelect,
      clusters,
    ]);

    // React to Breeding Sites toggle without redrawing map
    useEffect(() => {
      const map = mapInstance.current;
      const visibleMap = showBreedingSites ? map : null;
      try {
        breedingMarkersRef.current.forEach((m) => m.setMap(visibleMap));
        clusterOverlaysRef.current.forEach(
          (o) => o.setMap && o.setMap(visibleMap)
        );
      } catch (_) {}
    }, [showBreedingSites]);

    // Add this effect to initialize the info window
    useEffect(() => {
      if (window.google && window.google.maps) {
        const newInfoWindow = new window.google.maps.InfoWindow({
          maxWidth: 500,
        });
        setInfoWindow(newInfoWindow);
      }
    }, []);

    // Add debug for selectedBarangay changes
    useEffect(() => {}, [selectedBarangay]);

    return (
      <div
        className={className}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: 300,
          ...style,
        }}
      >
        <div
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          id="map-only"
        />
        {error && (
          <ErrorMessage error={error} className="absolute top-2 left-2 z-20" />
        )}
      </div>
    );
  }
);

export default MapOnly;
