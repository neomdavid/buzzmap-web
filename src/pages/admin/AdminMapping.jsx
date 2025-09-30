import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPostByIdQuery,
  useGetBasicProfilesQuery,
  useGetBarangaysQuery,
} from "../../api/dengueApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGoogleMaps } from "../../components/GoogleMapsProvider";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/authSlice.js";
import { toastSuccess } from "../../utils.jsx";
import { IconCaretDownFilled } from "@tabler/icons-react";
import {
  House,
  ChartBar,
  MapPin,
  CheckCircle,
  Megaphone,
  UsersThree,
  UserCircle,
} from "phosphor-react";
import { LogoNamed, RecentReportCard } from "../../components";
import AdminSideNavDetails from "../../components/Mapping/AdminSideNavDetails";
import stagnantIcon from "../../assets/icons/stagnant_water.svg?url";
import standingIcon from "../../assets/icons/standing_water.svg?url";
import garbageIcon from "../../assets/icons/garbage.svg?url";
import othersIcon from "../../assets/icons/others.svg?url";
import defaultProfile from "../../assets/default_profile.png";
import center from "@turf/center";

const containerStyle = {
  width: "100%",
  height: "100vh",
  position: "absolute",
  top: 0,
  left: 0,
};

// Default center (Manila coordinates)
const defaultCenter = {
  lat: 14.5995,
  lng: 120.9842,
};

// Pattern colors (darker versions for better visibility)
const PATTERN_COLORS = {
  spike: "#D32F2F", // darker red (error)
  gradual_rise: "#FB8C00", // darker orange (warning)
  decline: "#388E3C", // darker green (success)
  stability: "#0288D1", // darker blue (info)
  none: "#10B981", // emerald-500 green for no pattern (QC base overlay)
  default: "#4a5568", // darker gray (fallback)
};

// Helper function to normalize barangay names for comparison
function normalizeBarangayName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\bsr\.?\b/g, "") // Remove sr. or sr
    .replace(/\bjr\.?\b/g, "") // Remove jr. or jr
    .replace(/[.\-']/g, "") // Remove periods, hyphens, apostrophes
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

// Function to draw barangay polygons with pattern colors
function drawBarangayPolygons(
  map,
  geoJsonData,
  barangaysList,
  highlightedBarangayName
) {
  if (!map || !geoJsonData || !window.google) return [];

  const polygons = [];

  geoJsonData.features.forEach((feature) => {
    const geometry = feature.geometry;
    const barangayName = feature.properties.name;
    const isHighlighted = highlightedBarangayName === barangayName;

    // Find matching barangay in barangaysList for pattern data
    let barangayObj = barangaysList?.find(
      (b) =>
        normalizeBarangayName(b.name) === normalizeBarangayName(barangayName)
    );

    // Get pattern type
    let patternType = (
      barangayObj?.status_and_recommendation?.pattern_based?.status ||
      feature.properties.patternType ||
      feature.properties.pattern_type ||
      "none"
    ).toLowerCase();

    if (!patternType || patternType === "") patternType = "none";
    // Force all barangays to use the QC emerald overlay color
    const patternColor = PATTERN_COLORS.none;

    // Handle both Polygon and MultiPolygon geometries
    const coordsArray =
      geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];

    coordsArray.forEach((polygonCoords) => {
      const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));

      const polygon = new window.google.maps.Polygon({
        paths: path,
        strokeColor: isHighlighted ? "#10B981" : patternColor,
        strokeOpacity: isHighlighted ? 1.0 : 0.8,
        strokeWeight: isHighlighted ? 4 : 2,
        fillOpacity: isHighlighted ? 0.18 : 0.4,
        fillColor: isHighlighted ? "#10B981" : patternColor,
        map,
        zIndex: isHighlighted ? 10 : 1,
        clickable: false,
        // Add dotted stroke pattern for highlighted barangay
        ...(isHighlighted && {
          strokePattern: [
            {
              icon: {
                path: "M 0,-1 0,1",
                strokeOpacity: 1,
                scale: 4,
              },
              offset: "0",
              repeat: "20px",
            },
          ],
        }),
      });

      polygons.push(polygon);
    });
  });

  return polygons;
}

const BREEDING_SITE_TYPE_ICONS = {
  "Stagnant Water": stagnantIcon,
  "Standing Water": standingIcon,
  "Uncollected Garbage or Trash": garbageIcon,
  Others: othersIcon,
  default: stagnantIcon,
};

const AdminMapping = () => {
  const { isLoaded } = useGoogleMaps();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isValidId = id && /^[a-f\d]{24}$/i.test(id);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const infoWindowRef = useRef(null);
  const overlayRef = useRef(null);
  const clustererRef = useRef(null);
  const clusterCirclesRef = useRef([]);
  const clusterLabelsRef = useRef([]);

  // State for barangay boundary data
  const [barangayGeoJsonData, setBarangayGeoJsonData] = useState(null);
  const [highlightedBarangay, setHighlightedBarangay] = useState(null);
  const [selectedBarangayId, setSelectedBarangayId] = useState("");
  const barangayPolygonsRef = useRef([]);

  // Get admin user from Redux store
  const userFromStore = useSelector((state) => state.auth?.user);
  const user = userFromStore || { name: "Admin", email: "admin@example.com" };

  // Fetch report data
  const {
    data: fetchedReport,
    isLoading,
    error,
  } = useGetPostByIdQuery(!isValidId ? skipToken : id);

  // Use the fetched report
  const report = fetchedReport?.data || fetchedReport;

  // Grouped reports (individual + clusters)
  const [groupedReportsData, setGroupedReportsData] = useState(null);
  useEffect(() => {
    async function fetchGrouped() {
      try {
        const res = await fetch(
          "https://buzzmap-backend.onrender.com/api/v1/reports/grouped"
        );
        const json = await res.json();
        setGroupedReportsData(json || null);
      } catch (e) {
        console.error("[AdminMapping] Failed to fetch grouped reports", e);
        setGroupedReportsData(null);
      }
    }
    fetchGrouped();
  }, []);

  // When switching to a different report, default-highlight its barangay
  useEffect(() => {
    if (report?.barangay) {
      setHighlightedBarangay(report.barangay);
    } else {
      setHighlightedBarangay(null);
    }
  }, [report?._id]);

  // Recent reports sourced from grouped endpoint (individual + clusters flattened), validated only and excluding current
  const recentReports = useMemo(() => {
    const individuals = groupedReportsData?.individual_reports || [];
    const clusterMembers = (groupedReportsData?.clusters || [])
      .flatMap((c) => c?.reports || [])
      .filter(Boolean);
    const all = [...individuals, ...clusterMembers];
    const filtered = all.filter((r) => r?.status === "Validated");
    return report ? filtered.filter((r) => r._id !== report._id) : filtered;
  }, [groupedReportsData, report?._id]);

  // Get basic profiles
  const { data: basicProfiles = [] } = useGetBasicProfilesQuery();

  // Get barangays list for pattern data
  const { data: barangaysList = [] } = useGetBarangaysQuery();
  // Initialize map container and info window (already declared above)

  // Preload SVG icons
  useEffect(() => {
    const iconsToPreload = Object.values(BREEDING_SITE_TYPE_ICONS);
    iconsToPreload.forEach((iconUrl) => {
      const img = new Image();
      img.src = iconUrl;
    });
  }, []);

  // Load barangay boundary data (state already declared above)

  useEffect(() => {
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => setBarangayGeoJsonData(data))
      .catch(() => {});
  }, []);

  // Helper to get profile image
  const getProfileImage = (userId) => {
    const profile = basicProfiles.find((p) => p._id === userId);
    return profile?.profilePhotoUrl || defaultProfile;
  };

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !window.google) return;
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;
    const map = new window.google.maps.Map(mapContainer, {
      center: report?.specific_location?.coordinates
        ? {
            lat: report.specific_location.coordinates[1],
            lng: report.specific_location.coordinates[0],
          }
        : defaultCenter,
      zoom: 18,
      mapTypeId: "satellite",
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      zoomControl: true,
      mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
    });
    mapRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();
    if (window.markerclusterer) {
      clustererRef.current = new window.markerclusterer.MarkerClusterer({
        map,
        markers: [],
      });
    }
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      polylinesRef.current.forEach((l) => l.setMap(null));
      polylinesRef.current = [];
      barangayPolygonsRef.current.forEach((p) => p.setMap(null));
      barangayPolygonsRef.current = [];
      if (clustererRef.current) clustererRef.current.clearMarkers();
      try {
        if (overlayRef.current) {
          overlayRef.current.setMap(null);
          overlayRef.current = null;
        }
        clusterCirclesRef.current.forEach((c) => c.setMap(null));
        clusterCirclesRef.current = [];
        clusterLabelsRef.current.forEach((l) => l.setMap && l.setMap(null));
        clusterLabelsRef.current = [];
      } catch (_) {}
    };
  }, [isLoaded, report]);

  // Add markers
  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach((l) => l.setMap(null));
    polylinesRef.current = [];
    if (clustererRef.current) clustererRef.current.clearMarkers();

    if (report?.specific_location?.coordinates) {
      const [lng, lat] = report.specific_location.coordinates;
      const mainColor = report?.isInCluster ? "#8B5CF6" : "#FF6347"; // violet if clustered
      const iconUrl =
        BREEDING_SITE_TYPE_ICONS[report.report_type] ||
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
        background: mainColor,
        borderColor: mainColor,
        scale: 1.5,
      });
      const container = document.createElement("div");
      container.style.position = "relative";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";
      const label = document.createElement("div");
      label.style.backgroundColor = "#FFFFFF";
      label.style.color = "black";
      label.style.padding = "4px 13px";
      label.style.borderRadius = "10px";
      label.style.fontSize = "12px";
      label.style.fontWeight = "500";
      label.style.marginBottom = "4px";
      label.style.whiteSpace = "nowrap";
      label.textContent = "Selected Report";
      container.appendChild(label);
      // Wrap the pin to add a status indicator like in DengueMapping
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";
      wrapper.appendChild(pin.element);
      const status = (report?.status || "").toLowerCase();
      let dotColor = null;
      if (status.includes("pending")) dotColor = "#f59e0b"; // amber
      else if (status.includes("validated") || status.includes("resolved"))
        dotColor = "#10b981"; // green
      else if (status.includes("rejected")) dotColor = "#dc2626"; // red
      if (dotColor) {
        const dot = document.createElement("span");
        dot.style.position = "absolute";
        dot.style.right = "1px";
        dot.style.top = "1px";
        dot.style.width = "8px";
        dot.style.height = "8px";
        dot.style.borderRadius = "9999px";
        dot.style.background = dotColor;
        dot.style.border = "1px solid #fff";
        wrapper.appendChild(dot);
      }
      container.appendChild(wrapper);
      const mainMarker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat, lng },
        content: container,
        title: "Selected Location",
      });
      markersRef.current.push(mainMarker);
    }

    if (report?.specific_location?.coordinates) {
      // Do not draw connecting lines to nearby reports
    }
  }, [report]);

  // Skip cluster circles/labels: only selected report should show
  useEffect(() => {
    clusterCirclesRef.current.forEach((c) => c.setMap(null));
    clusterCirclesRef.current = [];
    clusterLabelsRef.current.forEach((l) => l.setMap && l.setMap(null));
    clusterLabelsRef.current = [];
  }, []);

  // Draw polygons on highlight
  useEffect(() => {
    if (!mapRef.current || !barangayGeoJsonData || !isLoaded) return;
    barangayPolygonsRef.current.forEach((p) => p.setMap(null));
    barangayPolygonsRef.current = drawBarangayPolygons(
      mapRef.current,
      barangayGeoJsonData,
      barangaysList,
      highlightedBarangay
    );
  }, [
    barangayGeoJsonData,
    barangaysList,
    highlightedBarangay,
    report,
    isLoaded,
  ]);

  // Barangay select handler
  const handleBarangaySelect = useCallback(
    (barangay) => {
      if (mapRef.current && barangay && barangayGeoJsonData) {
        const barangayName = barangay.displayName || barangay.name;
        // Update highlighted barangay immediately so UI reflects selection
        if (barangayName) {
          setHighlightedBarangay(barangayName);
        }
        // Persist selected id so dropdown remains on chosen option
        if (barangay._id) {
          setSelectedBarangayId(barangay._id);
        }

        // Find matching feature using normalized comparison to tolerate punctuation/case variants
        const norm = (s) => normalizeBarangayName(s || "");
        const selectedFeature = barangayGeoJsonData.features.find(
          (f) => norm(f.properties.name) === norm(barangayName)
        );
        if (selectedFeature && selectedFeature.geometry) {
          try {
            const { type, coordinates } = selectedFeature.geometry;
            const bounds = new window.google.maps.LatLngBounds();
            const addCoordsToBounds = (coords) => {
              // coords is [lng, lat]
              if (Array.isArray(coords) && coords.length === 2) {
                bounds.extend(
                  new window.google.maps.LatLng(coords[1], coords[0])
                );
              }
            };
            if (type === "Polygon") {
              // coordinates: [ [ [lng,lat], ... ] ]
              coordinates[0].forEach(addCoordsToBounds);
            } else if (type === "MultiPolygon") {
              // coordinates: [ [ [ [lng,lat], ... ] ], ... ]
              coordinates.forEach((poly) => {
                if (Array.isArray(poly) && poly[0]) {
                  poly[0].forEach(addCoordsToBounds);
                }
              });
            }
            if (!bounds.isEmpty()) {
              mapRef.current.fitBounds(bounds, 60);
              try {
                let centerLatLng = null;
                try {
                  const centroid = center(selectedFeature);
                  const [cLng, cLat] = centroid?.geometry?.coordinates || [];
                  if (typeof cLat === "number" && typeof cLng === "number") {
                    centerLatLng = new window.google.maps.LatLng(cLat, cLng);
                  }
                } catch (_) {}
                if (!centerLatLng) {
                  centerLatLng = bounds.getCenter();
                }
                // Remove previous overlay
                if (overlayRef.current) {
                  overlayRef.current.setMap(null);
                  overlayRef.current = null;
                }
                // Create custom overlay
                class NameOverlay extends window.google.maps.OverlayView {
                  constructor(position, labelHtml) {
                    super();
                    this.position = position;
                    this.container = document.createElement("div");
                    this.container.style.position = "absolute";
                    this.container.style.pointerEvents = "auto";
                    this.container.innerHTML = labelHtml;
                  }
                  onAdd() {
                    const panes = this.getPanes();
                    panes.floatPane.appendChild(this.container);
                    const closeBtn =
                      this.container.querySelector(".overlay-close-btn");
                    if (closeBtn) {
                      closeBtn.addEventListener("click", () => {
                        try {
                          this.setMap(null);
                          if (overlayRef.current === this)
                            overlayRef.current = null;
                        } catch (_) {}
                      });
                    }
                  }
                  draw() {
                    const projection = this.getProjection();
                    if (!projection) return;
                    const point = projection.fromLatLngToDivPixel(
                      this.position
                    );
                    if (!point) return;
                    const { offsetWidth, offsetHeight } = this.container;
                    this.container.style.left = `${Math.round(
                      point.x - offsetWidth / 2
                    )}px`;
                    this.container.style.top = `${Math.round(
                      point.y - offsetHeight - 16
                    )}px`;
                  }
                  onRemove() {
                    if (this.container && this.container.parentNode) {
                      this.container.parentNode.removeChild(this.container);
                    }
                    this.container = null;
                  }
                }
                const labelHtml = `
                  <div style="
                    padding:12px 18px;
                    border-radius:8px;
                    background: #245261;
                    color:#fff;
                    font-weight:900;
                    font-size:20px;
                    letter-spacing:0.3px;
                    border:1px solid rgba(255,255,255,0.3);
                    box-shadow: 0 12px 36px rgba(0,0,0,0.3);
                    white-space: nowrap;
                    position: relative;
                  ">
                    ${barangayName}
                    <button class="overlay-close-btn" style="
                      position:absolute;right:6px;top:7px;
                      width:12px;height:12px;display:flex;align-items:center;justify-content:center;
                      border-radius:9999px;border:0.8px solid rgba(255,255,255,0.45);
                      background: rgba(255,255,255,0.12);color:#fff;cursor:pointer;
                      font-size:12px;line-height:10px;
                    " aria-label="Close">✕</button>
                  </div>`;
                const overlay = new NameOverlay(centerLatLng, labelHtml);
                overlay.setMap(mapRef.current);
                overlayRef.current = overlay;
              } catch {}
            }
          } catch {}
        }
      }
    },
    [barangayGeoJsonData]
  );

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col gap-6 items-center justify-center">
        <span className="loading loading-spinner loading-xl"></span>
        <p className="text-primary text-3xl font-semibold">Loading map...</p>
      </div>
    );
  }

  if (!report && isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col gap-2 items-center justify-center">
        <span className="loading loading-spinner loading-xl"></span>
        <p className="text-primary text-3xl font-semibold">Loading report...</p>
      </div>
    );
  }

  if (!report && error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Failed to load report.
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center mt-10 text-red-500">
        No breeding site data provided.
      </div>
    );
  }

  return (
    <main className="text-2xl relative">
      <div className="w-full h-[100-vh] relative z-[-1]">
        <div id="map" style={containerStyle} className="h-[100vh]"></div>
      </div>

      {/* Floating admin navbar (top-right) */}
      <nav className="z-[1100] fixed right-6 top-6 text-white text-sm bg-primary/80 backdrop-blur-md py-2.5 px-3 rounded-2xl shadow-lg flex items-center gap-x-1">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center  cursor-pointer gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 transition"
          title="Dashboard"
        >
          <House size={18} weight="fill" />
          <span className="hidden md:inline">Dashboard</span>
        </button>
        <button
          onClick={() => navigate("/admin/analytics")}
          className="flex items-center cursor-pointer gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 transition"
          title="Analytics"
        >
          <ChartBar size={18} weight="fill" />
          <span className="hidden md:inline">Analytics</span>
        </button>
        <button
          onClick={() => navigate("/admin/mapping")}
          className="flex items-center cursor-pointer gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 transition"
          title="Mapping"
        >
          <MapPin size={18} weight="fill" />
          <span className="hidden md:inline">Mapping</span>
        </button>
        <button
          onClick={() => navigate("/admin/reportsverification")}
          className="flex items-center cursor-pointer gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 transition"
          title="Verification"
        >
          <CheckCircle size={18} weight="fill" />
          <span className="hidden md:inline">Verification</span>
        </button>
        <button
          onClick={() => navigate("/admin/interventions")}
          className="flex items-center cursor-pointer gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 transition"
          title="Interventions"
        >
          <Megaphone size={18} weight="fill" />
          <span className="hidden md:inline">Interventions</span>
        </button>
        <button
          onClick={() => navigate("/admin/cea")}
          className="flex items-center cursor-pointer gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 transition"
          title="CEA"
        >
          <UsersThree size={18} weight="fill" />
          <span className="hidden md:inline">CEA</span>
        </button>
        <div className="ml-2 pl-3 border-l border-white/20 flex items-center  gap-2">
          <UserCircle size={20} weight="fill" />
          <span className="font-semibold">{user?.name}</span>
        </div>
      </nav>
      <AdminSideNavDetails
        report={report}
        nearbyCount={recentReports.length}
        nearbyReports={recentReports}
        radius={1}
        onBarangaySelect={handleBarangaySelect}
        selectedBarangay={selectedBarangayId || highlightedBarangay}
      />
      {/* Only selected report is displayed; nearby and legend hidden */}
    </main>
  );
};

export default AdminMapping;
