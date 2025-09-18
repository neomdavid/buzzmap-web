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
  useGetPostsQuery,
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
import * as turf from "@turf/turf";

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
  none: "#BDBDBD", // darker gray (default for no pattern)
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
    const patternColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;

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
        strokeColor: isHighlighted ? "#c9c9c9" : patternColor,
        strokeOpacity: isHighlighted ? 1.0 : 0.8,
        strokeWeight: isHighlighted ? 4 : 2,
        fillOpacity: isHighlighted ? 0 : 0.4,
        fillColor: patternColor,
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
  const clustererRef = useRef(null);

  // State for barangay boundary data
  const [barangayGeoJsonData, setBarangayGeoJsonData] = useState(null);
  const [highlightedBarangay, setHighlightedBarangay] = useState(null);
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

  // Get all reports
  const { data: allReports = [] } = useGetPostsQuery();

  // When switching to a different report, default-highlight its barangay
  useEffect(() => {
    if (report?.barangay) {
      setHighlightedBarangay(report.barangay);
    } else {
      setHighlightedBarangay(null);
    }
  }, [report?._id]);

  // Calculate nearby reports using frontend distance calculation
  const nearbyReports = useMemo(() => {
    if (report?.specific_location?.coordinates && allReports?.length > 0) {
      const [currentLng, currentLat] = report.specific_location.coordinates;
      const radiusKm = 1; // 1 km radius

      const nearby = allReports.filter((r) => {
        // Skip the current report
        if (r._id === report._id) return false;

        // Skip reports without coordinates
        if (!r.specific_location?.coordinates) return false;

        const [rLng, rLat] = r.specific_location.coordinates;
        const distance = calculateDistance(currentLat, currentLng, rLat, rLng);

        return distance <= radiusKm;
      });

      return nearby;
    } else {
      return [];
    }
  }, [
    report?._id,
    report?.specific_location?.coordinates?.[0],
    report?.specific_location?.coordinates?.[1],
    allReports,
  ]);

  // Use nearby reports (calculated on frontend) and filter by validation status
  const filteredReports = useMemo(() => {
    return Array.isArray(nearbyReports)
      ? nearbyReports.filter((r) => r.status === "Validated")
      : [];
  }, [nearbyReports]);

  // Filter out the current report from recent reports and only show validated posts
  const recentReports = useMemo(() => {
    return report ? filteredReports.filter((r) => r._id !== report._id) : [];
  }, [filteredReports, report?._id]);

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
    };
  }, [isLoaded, report]);

  // Add markers, polylines
  useEffect(() => {
    if (!mapRef.current || !window.google || !allReports.length) return;
    const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach((l) => l.setMap(null));
    polylinesRef.current = [];
    if (clustererRef.current) clustererRef.current.clearMarkers();

    if (report?.specific_location?.coordinates) {
      const [lng, lat] = report.specific_location.coordinates;
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
        background: "#FF6347",
        borderColor: "#FF6347",
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
      container.appendChild(pin.element);
      const mainMarker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat, lng },
        content: container,
        title: "Selected Location",
      });
      markersRef.current.push(mainMarker);
    }

    const allValidatedReports = allReports.filter(
      (r) => r.status === "Validated" && r._id !== report._id
    );
    const markers = allValidatedReports
      .map((r) => {
        if (!r.specific_location?.coordinates) return null;
        const [lng, lat] = r.specific_location.coordinates;
        const iconUrl =
          BREEDING_SITE_TYPE_ICONS[r.report_type] ||
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
          map: mapRef.current,
          position: { lat, lng },
          content: pin.element,
          title: `${r.report_type} - ${r.status}`,
        });
        marker.addListener("gmp-click", () => {
          const content = document.createElement("div");
          content.innerHTML = `
            <div class="bg-white p-4 rounded-lg text-primary text-center max-w-120 w-[50vw]">
              <p class="font-bold text-4xl font-extrabold mb-4 text-primary">${
                r.report_type
              }</p>
              <div class="flex flex-col items-center mt-2 space-y-1 font-normal text-center">
                <p class="text-xl"><span class="font-bold">Barangay:</span> ${
                  r.barangay
                }</p>
                <p class="text-xl"><span class="font-bold">Reported by:</span> ${
                  r.isAnonymous ? r.anonymousId : r.user?.username || "Unknown"
                }</p>
                <p class="text-xl"><span class="font-bold">Reported:</span> ${getRelativeTime(
                  r.date_and_time
                )}</p>
                <p class="text-xl"><span class="font-bold">Description:</span> ${
                  r.description
                }</p>
              </div>
              <button class="mt-4 px-4 py-2 bg-primary w-[40%] text-white rounded-lg shadow hover:bg-primary/80 hover:cursor-pointer font-bold" id="view-details-${
                r._id
              }">View Details</button>
            </div>`;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapRef.current, marker);
          setTimeout(() => {
            const button = document.getElementById(`view-details-${r._id}`);
            if (button) {
              button.addEventListener("click", () =>
                navigate(`/admin/mapping/${r._id}`)
              );
            }
          }, 0);
        });
        return marker;
      })
      .filter(Boolean);
    if (clustererRef.current) {
      clustererRef.current.addMarkers(markers);
    } else {
      markers.forEach((m) => markersRef.current.push(m));
    }

    if (report?.specific_location?.coordinates) {
      const [mainLng, mainLat] = report.specific_location.coordinates;
      filteredReports.forEach((r) => {
        if (!r.specific_location?.coordinates) return;
        const [lng, lat] = r.specific_location.coordinates;
        const polyline = new window.google.maps.Polyline({
          path: [
            { lat: mainLat, lng: mainLng },
            { lat, lng },
          ],
          strokeColor: "#F59E42",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          map: mapRef.current,
        });
        polylinesRef.current.push(polyline);
      });
    }
  }, [allReports, filteredReports, report]);

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
        const selectedFeature = barangayGeoJsonData.features.find(
          (f) => f.properties.name === barangayName
        );
        if (selectedFeature && selectedFeature.geometry) {
          try {
            const center = turf.centerOfMass(selectedFeature);
            const [lng, lat] = center.geometry.coordinates || [];
            if (lat && lng) {
              const centerLatLng = new window.google.maps.LatLng(lat, lng);
              mapRef.current.panTo(centerLatLng);
              mapRef.current.setZoom(15);
              setHighlightedBarangay(barangayName);
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
          onClick={() => navigate("/admin/denguemapping")}
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
        nearbyCount={filteredReports.length}
        nearbyReports={filteredReports}
        radius={1}
        onBarangaySelect={handleBarangaySelect}
        selectedBarangay={highlightedBarangay}
      />
      <article className="absolute z-100000 flex flex-col text-primary right-[10px] bottom-0 md:max-w-[60vw] lg:max-w-[62vw] xl:max-w-[69vw] 2xl:max-w-[72vw]">
        <p className="text-[20px] text-white shadow-sm font-semibold text-left mb-2 w-full">
          Nearby Reports
        </p>
        <section className="flex gap-x-2 text-[13px] overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {isLoading ? (
            <div className="text-gray-500 p-4">Loading reports...</div>
          ) : recentReports.length === 0 ? (
            <div className="text-gray-500 p-4">No nearby reports found.</div>
          ) : (
            recentReports.map((r) => {
              const rawDate = r.date_and_time;
              const formattedDate = rawDate
                ? new Date(rawDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "";
              const formattedTime = rawDate
                ? new Date(rawDate).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "";
              return (
                <RecentReportCard
                  key={r._id}
                  profileImage={getProfileImage(r.user?._id)}
                  username={
                    r.isAnonymous ? "Anonymous" : r.user?.username || "Unknown"
                  }
                  timestamp={rawDate ? getRelativeTime(rawDate) : ""}
                  date={formattedDate}
                  time={formattedTime}
                  reportType={r.report_type}
                  description={r.description}
                  onViewClick={() => navigate(`/admin/mapping/${r._id}`)}
                />
              );
            })
          )}
        </section>
      </article>
    </main>
  );
};

export default AdminMapping;
