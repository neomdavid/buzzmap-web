// This component previously used @react-google-maps/api and useGoogleMaps.
// It must be rewritten to use the plain Google Maps JS API if needed.
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useGoogleMaps } from "../../components/GoogleMapsProvider";
import { useGetPostByIdQuery, useGetPostsQuery, useGetNearbyReportsMutation, useGetBasicProfilesQuery } from "../../api/dengueApi";
import { skipToken } from "@reduxjs/toolkit/query";
import React, { useEffect, useState, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import profile1 from "../../assets/profile1.png";
import SideNavDetails from "../../components/Mapping/SideNavDetails";
import { RecentReportCard } from "../../components";
import stagnantIcon from "../../assets/icons/stagnant_water.svg";
import standingIcon from '../../assets/icons/standing_water.svg';
import garbageIcon from '../../assets/icons/garbage.svg';
import othersIcon from '../../assets/icons/others.svg';
import defaultProfile from "../../assets/default_profile.png";

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
  lng: 120.9842
};

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
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

const BREEDING_SITE_TYPE_ICONS = {
  "Stagnant Water": stagnantIcon,
  "Standing Water": standingIcon,
  "Uncollected Garbage or Trash": garbageIcon,
  "Others": othersIcon,
  "default": stagnantIcon
};

const SpecificLocation = () => {
  const { isLoaded } = useGoogleMaps();
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isValidId = id && /^[a-f\d]{24}$/i.test(id);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const infoWindowRef = useRef(null);
  const clustererRef = useRef(null);

  console.log("[DEBUG] SpecificLocation: isLoaded =", isLoaded);
  console.log("[DEBUG] SpecificLocation: state =", state);
  console.log("[DEBUG] SpecificLocation: id =", id);

  // Use report from navigation state if available, otherwise fetch by ID
  const breedingSite = state?.breedingSite;
  const { data: fetchedReport, isLoading, error } = useGetPostByIdQuery(
    !breedingSite && isValidId ? id : skipToken
  );

  // Use the report from state if available, otherwise from fetch
  const report = breedingSite || (fetchedReport?.data || fetchedReport);

  // Get all reports
  const { data: allReports = [] } = useGetPostsQuery();

  // Get nearby reports
  const [getNearbyReports] = useGetNearbyReportsMutation();
  const [nearbyReports, setNearbyReports] = useState([]);

  // Get basic profiles
  const { data: basicProfiles = [] } = useGetBasicProfilesQuery();

  // Helper function to get profile image
  const getProfileImage = (userId) => {
    const profile = basicProfiles.find(p => p._id === userId);
    return profile?.profilePhotoUrl || defaultProfile;
  };

  useEffect(() => {
    if (report?.specific_location?.coordinates) {
      const [lng, lat] = report.specific_location.coordinates;
      getNearbyReports({
        coordinates: [lng, lat],
        radius: 1, // Changed from 2 to 1 for 1km radius
      })
        .unwrap()
        .then((data) => {
          setNearbyReports(data);
        })
        .catch((error) => {
          console.error("Error fetching nearby reports:", error);
        });
    }
  }, [report, getNearbyReports]);

  console.log("[DEBUG] SpecificLocation: report =", report);
  console.log("[DEBUG] SpecificLocation: report coordinates =", report?.specific_location?.coordinates);

  // State for timeline
  const [range, setRange] = useState([0, 0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openPopups, setOpenPopups] = useState([]);

  // Get all report dates (sorted)
  const allDates = allReports
    .map((r) => new Date(r.date_and_time).getTime())
    .sort((a, b) => a - b);
  const minDate = allDates[0];
  const maxDate = allDates[allDates.length - 1];

  // When allDates changes, set the range to the latest report by default
  useEffect(() => {
    if (allDates.length > 0) {
      setRange([allDates[allDates.length - 1], allDates[allDates.length - 1]]);
    }
  }, [allDates.join(",")]);

  // Animate the slider
  useEffect(() => {
    if (!isPlaying) return;
    if (!range || range[1] >= maxDate) {
      setIsPlaying(false);
      return;
    }
    const step = 24 * 60 * 60 * 1000; // 1 day in ms
    const timer = setTimeout(() => {
      setRange(([start, end]) => [start, Math.min(end + step, maxDate)]);
    }, 500);
    return () => clearTimeout(timer);
  }, [isPlaying, range, maxDate]);

  // Filter reports by range and validation status
  const filteredReports = allReports.filter((r) => {
    if (allReports.length < 5) return r.status === "Validated";
    if (!range || !range.length) return r.status === "Validated";
    const t = new Date(r.date_and_time).getTime();
    return t >= range[0] && t <= range[1] && r.status === "Validated";
  });

  // Filter out the current report from recent reports and only show validated posts
  const recentReports = report 
    ? filteredReports.filter(r => r._id !== report._id)
    : [];

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !window.google) return;

    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: report?.specific_location?.coordinates 
        ? {
            lat: report.specific_location.coordinates[1],
            lng: report.specific_location.coordinates[0],
          }
        : { lat: 14.5995, lng: 120.9842 },
      zoom: 18,
      mapTypeId: "satellite",
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      zoomControl: true,
      mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID // Add Map ID
    });

    mapRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();

    // Initialize marker clusterer if available
    if (window.markerclusterer) {
      clustererRef.current = new window.markerclusterer.MarkerClusterer({
        map,
        markers: [],
        renderer: {
          render: ({ count, position }) => {
            return new window.google.maps.marker.AdvancedMarkerElement({
              position,
              content: new window.google.maps.marker.PinElement({
                background: "#14b8a6",
                borderColor: "#FFFFFF",
                scale: 1.2,
                label: {
                  text: String(count),
                  color: "white",
                  fontSize: "12px",
                },
              }).element,
            });
          },
        },
      });
    } else {
      console.warn("MarkerClusterer not available. Markers will not be clustered.");
    }

    return () => {
      // Cleanup markers and polylines
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      polylinesRef.current.forEach(line => line.setMap(null));
      polylinesRef.current = [];
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
    };
  }, [isLoaded, report]);

  // Add markers and polylines
  useEffect(() => {
    if (!mapRef.current || !window.google || !allReports.length) return;

    const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;

    // Clear existing markers and polylines
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach(line => line.setMap(null));
    polylinesRef.current = [];
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    // Add main report marker
    if (report?.specific_location?.coordinates) {
      const [lng, lat] = report.specific_location.coordinates;
      
      // Create custom icon for main marker
      const iconUrl = BREEDING_SITE_TYPE_ICONS[report.report_type] || BREEDING_SITE_TYPE_ICONS.default;
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

      // Create a container for the marker and label
      const container = document.createElement('div');
      container.style.position = 'relative';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'center';

      // Create the label
      const label = document.createElement('div');
      label.style.backgroundColor = '#FFFFFF';
      label.style.color = 'black';
      label.style.padding = '4px 13px';
      label.style.borderRadius = '10px';
      label.style.fontSize = '12px';
      label.style.fontWeight = '500';
      label.style.marginBottom = '4px';
      label.style.whiteSpace = 'nowrap';
      label.textContent = 'Selected Report';

      // Add the label and pin to the container
      container.appendChild(label);
      container.appendChild(pin.element);

      const mainMarker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat, lng },
        content: container,
        title: "Selected Location"
      });

      // Add info window for main marker
      const mainContent = document.createElement('div');
      mainContent.innerHTML = `
        <div class="bg-white p-4 rounded-lg text-primary text-center max-w-120 w-[50vw]">
          <p class="font-bold text-4xl font-extrabold mb-4 text-primary">
            ${report.report_type}
          </p>
          <div class="flex flex-col items-center mt-2 space-y-1 font-normal text-center">
            <p class="text-xl">
              <span class="font-bold">Barangay:</span> ${report.barangay}
            </p>
            <p class="text-xl">
              <span class="font-bold">Reported by:</span> ${report.isAnonymous ? "Anonymous" : report.user?.username || "Unknown"}
            </p>
            <p class="text-xl">
              <span class="font-bold">Reported:</span> ${getRelativeTime(report.date_and_time)}
            </p>
            <p class="text-xl">
              <span class="font-bold">Description:</span> ${report.description}
            </p>
            ${(report.images && report.images.length > 0) ? `<div class='mt-2 flex justify-center gap-2'>${report.images.map(img => `<img src='${img}' class='w-35 h-25 object-cover rounded border'/>`).join('')}</div>` : ''}
          </div>
        </div>
      `;

      mainMarker.addListener("gmp-click", () => {
        infoWindowRef.current.setContent(mainContent);
        infoWindowRef.current.open(mapRef.current, mainMarker);
      });

      markersRef.current.push(mainMarker);
    }

    // Add markers for filtered reports
    const markers = filteredReports.map(r => {
      if (!r.specific_location?.coordinates) return null;

      const [lng, lat] = r.specific_location.coordinates;
      
      // Create custom icon for nearby markers
      const iconUrl = BREEDING_SITE_TYPE_ICONS[r.report_type] || BREEDING_SITE_TYPE_ICONS.default;
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
        title: `${r.report_type} - ${r.status}`
      });

      // Add click listener for info window
      marker.addListener("gmp-click", () => {
        const content = document.createElement('div');
        content.innerHTML = `
          <div class="bg-white p-4 rounded-lg text-primary text-center max-w-120 w-[50vw]">
            <p class="font-bold text-4xl font-extrabold mb-4 text-primary">
              ${r.report_type}
            </p>
            <div class="flex flex-col items-center mt-2 space-y-1 font-normal text-center">
              <p class="text-xl">
                <span class="font-bold">Barangay:</span> ${r.barangay}
              </p>
              <p class="text-xl">
                <span class="font-bold">Reported by:</span> ${r.isAnonymous ? "Anonymous" : r.user?.username || "Unknown"}
              </p>
              <p class="text-xl">
                <span class="font-bold">Reported:</span> ${getRelativeTime(r.date_and_time)}
              </p>
              <p class="text-xl">
                <span class="font-bold">Description:</span> ${r.description}
              </p>
              ${(r.images && r.images.length > 0) ? `<div class='mt-2 flex justify-center gap-2'>${r.images.map(img => `<img src='${img}' class='w-35 h-25 object-cover rounded border'/>`).join('')}</div>` : ''}
            </div>
            <button 
              class="mt-4 px-4 py-2 bg-primary w-[40%] text-white rounded-lg shadow hover:bg-primary/80 hover:cursor-pointer font-bold"
              id="view-details-${r._id}"
            >View Details</button>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapRef.current, marker);

        // Add click handler after the content is added to the DOM
        setTimeout(() => {
          const button = document.getElementById(`view-details-${r._id}`);
          if (button) {
            button.addEventListener('click', () => {
              navigate(`/mapping/${r._id}`);
            });
          }
        }, 0);
      });

      return marker;
    }).filter(Boolean);

    // Add markers to clusterer if available, otherwise add directly to map
    if (clustererRef.current) {
      clustererRef.current.addMarkers(markers);
    } else {
      markers.forEach(marker => markersRef.current.push(marker));
    }

    // Add polylines from main report to each filtered report
    if (report?.specific_location?.coordinates) {
      const [mainLng, mainLat] = report.specific_location.coordinates;
      filteredReports.forEach(r => {
        if (!r.specific_location?.coordinates) return;

        const [lng, lat] = r.specific_location.coordinates;
        const polyline = new window.google.maps.Polyline({
          path: [
            { lat: mainLat, lng: mainLng },
            { lat, lng }
          ],
          strokeColor: "#F59E42",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          strokeDashArray: [8, 8],
          map: mapRef.current
        });

        polylinesRef.current.push(polyline);
      });
    }

  }, [filteredReports, report]);

  // Helper functions
  function getStatusColorClass(status) {
    switch (status) {
      case "Validated":
        return "text-green-600";
      case "Pending":
        return "text-yellow-600";
      case "Rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  if (!report && isLoading) {
    return <div>Loading report...</div>;
  }

  if (!report && error) {
    return <div className="text-center mt-10 text-red-500">Failed to load report.</div>;
  }

  if (!report) {
    return <div className="text-center mt-10 text-red-500">No breeding site data provided.</div>;
  }

  return (
    <main className="text-2xl mt-[-69px]">
      <div className="w-full h-[100vh] relative">
        {/* Timeline Range Slider UI */}
        {allReports.length >= 5 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 rounded-lg shadow-lg px-6 py-4 flex flex-col gap-2 items-center max-w-xl w-[90vw]">
            <div className="flex items-center gap-3 w-full">
              <label className="font-semibold text-base">Timeline:</label>
              <button
                className={`px-3 py-1 rounded ${isPlaying ? "bg-red-200" : "bg-green-200"} text-primary font-bold`}
                onClick={() => setIsPlaying((p) => !p)}
                type="button"
                disabled={!minDate || !maxDate}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
            </div>
            {minDate && maxDate && !isNaN(minDate) && !isNaN(maxDate) ? (
              <div className="w-full flex flex-col items-center">
                <Slider
                  range
                  min={minDate}
                  max={maxDate}
                  value={range}
                  onChange={setRange}
                  allowCross={false}
                  step={24 * 60 * 60 * 1000}
                  tipFormatter={formatDate}
                  trackStyle={[{ backgroundColor: "#2563eb" }]}
                  handleStyle={[
                    { borderColor: "#2563eb" },
                    { borderColor: "#2563eb" },
                  ]}
                />
                <div className="flex justify-between w-full text-xs mt-1">
                  <span>{formatDate(range[0])}</span>
                  <span>{formatDate(range[1])}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm mt-2">No reports available for timeline.</div>
            )}
          </div>
        )}
        <div id="map" style={containerStyle}></div>
      </div>
      <SideNavDetails
        report={report}
        nearbyCount={filteredReports.length}
        nearbyReports={filteredReports}
        radius={1}
        onViewCommunityClick={() => navigate('/community')}
        onPreventionTipsClick={() => navigate('/buzzline')}
      />
      <article className="absolute z-100000 flex flex-col text-primary right-[10px] bottom-0 md:max-w-[60vw] lg:max-w-[62vw] xl:max-w-[69vw] 2xl:max-w-[72vw]">
        <p className="text-[20px] text-white shadow-sm font-semibold text-left mb-2 w-full">
          Most Recent Reports
        </p>
        <section className="flex gap-x-2 text-[13px] overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {isLoading ? (
            <div className="text-gray-500 p-4">Loading reports...</div>
          ) : recentReports.length === 0 ? (
            <div className="text-gray-500 p-4">No recent reports found.</div>
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
                  username={r.user?.username || "Unknown"}
                  timestamp={rawDate ? getRelativeTime(rawDate) : ""}
                  date={formattedDate}
                  time={formattedTime}
                  reportType={r.report_type}
                  description={r.description}
                  onViewClick={() => navigate(`/mapping/${r._id}`)}
                />
              );
            })
          )}
        </section>
      </article>
    </main>
  );
};

export default SpecificLocation;
