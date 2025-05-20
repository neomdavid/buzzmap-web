import { useLocation, useParams, useNavigate } from "react-router-dom";
import { GoogleMap, Marker, Polyline, InfoWindow, OverlayView, MarkerClusterer } from "@react-google-maps/api";
import SideNavDetails from "../../components/Mapping/SideNavDetails";
import { useGoogleMaps } from "../../components/GoogleMapsProvider";
import { useGetPostByIdQuery, useGetPostsQuery, useGetNearbyReportsMutation } from "../../api/dengueApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { DengueMap, RecentReportCard } from "../../components";
import profile1 from "../../assets/profile1.png";
import { useMemo, useEffect, useState } from "react";
import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const containerStyle = {
  width: "100%",
  height: "100%",
};

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

const SpecificLocation = () => {
  const { isLoaded } = useGoogleMaps();
  const { state } = useLocation();
  const { id } = useParams();
  const isValidId = id && /^[a-f\d]{24}$/i.test(id);
  const navigate = useNavigate();

  // Use report from navigation state if available, otherwise fetch by ID
  const breedingSite = state?.breedingSite;
  const { data: fetchedReport, isLoading, error } = useGetPostByIdQuery(
    !breedingSite && isValidId ? id : skipToken
  );

  // Use the report from state if available, otherwise from fetch
  const report = breedingSite || fetchedReport;

  // Nearby reports state
  const [getNearbyReports, { data: nearbyData, isLoading: isNearbyLoading }] = useGetNearbyReportsMutation();

  // Fetch nearby reports when report is available
  useEffect(() => {
    if (report?._id) {
      getNearbyReports({
        reportId: report._id,
        status: "Validated",
        radius: 2, // or 3, or whatever radius you want in km
      });
    }
  }, [report?._id, getNearbyReports]);

  // Log the response from the backend
  useEffect(() => {
    console.log("Nearby reports API response:", nearbyData);
  }, [nearbyData]);

  const nearbyReports = nearbyData?.reports || [];
  const nearbyCount = nearbyData?.count || 0;

  // Get all report dates (sorted)
  const allDates = useMemo(
    () =>
      nearbyReports
        .map((r) => new Date(r.date_and_time).getTime())
        .sort((a, b) => a - b),
    [nearbyReports]
  );
  const minDate = allDates[0];
  const maxDate = allDates[allDates.length - 1];

  // Range slider state: [startTimestamp, endTimestamp]
  const [range, setRange] = useState([minDate, maxDate]);
  const [isPlaying, setIsPlaying] = useState(false);

  // When allDates changes, set the range to the latest report by default
  useEffect(() => {
    if (allDates.length > 0) {
      // Default: show only the latest report
      setRange([allDates[allDates.length - 1], allDates[allDates.length - 1]]);
    }
  }, [allDates.join(",")]); // join to trigger effect when array content changes

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

  // Filter reports by range
  const filteredNearbyReports = useMemo(() => {
    // If slider is not shown, show all nearby reports
    if (nearbyReports.length < 5) return nearbyReports;
    if (!range || !range.length) return nearbyReports;
    return nearbyReports.filter((r) => {
      const t = new Date(r.date_and_time).getTime();
      return t >= range[0] && t <= range[1];
    });
  }, [nearbyReports, range]);

  // Track open popups (none open by default)
  const [openPopups, setOpenPopups] = useState([]);

  // Group nearby reports by coordinates
  const groupedNearbyReports = useMemo(() => groupReportsByCoordinates(nearbyReports), [nearbyReports]);
  const [openGroupKey, setOpenGroupKey] = useState(null);

  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    if (report?.specific_location?.coordinates) {
      setMapCenter({
        lat: report.specific_location.coordinates[1],
        lng: report.specific_location.coordinates[0],
      });
    }
  }, [report?._id]);

  if (!report && isLoading) {
    return <div>Loading report...</div>;
  }
  if (!report && error) {
    return <div className="text-center mt-10 text-red-500">Failed to load report.</div>;
  }
  if (!report) {
    return <div className="text-center mt-10 text-red-500">No breeding site data provided.</div>;
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  // Helper to format date
  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <main className="text-2xl mt-[-69px]">
      <div className="w-full h-[100vh] relative">
        {/* Timeline Range Slider UI - only show if there are at least 5 nearby reports */}
        {Array.isArray(nearbyReports) && nearbyReports.length >= 5 && (
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
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={18}
          mapTypeId="satellite"
        >
          {/* Main selected report marker */}
          <Marker position={mapCenter} />

          {/* Clustered markers for filtered nearby reports */}
          <MarkerClusterer>
            {(clusterer) =>
              filteredNearbyReports.map((r) => {
                const markerPosition = {
                  lat: r.specific_location.coordinates[1],
                  lng: r.specific_location.coordinates[0],
                };
                return (
                  <React.Fragment key={r._id}>
                    <Marker
                      position={markerPosition}
                      clusterer={clusterer}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 6,
                        fillColor: "#14b8a6",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#fff",
                      }}
                      onClick={() => setOpenPopups((prev) => [...prev, r._id])}
                    />
                    {openPopups.includes(r._id) && (
                      <OverlayView
                        position={markerPosition}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                      >
                        <div
                          className="bg-white border border-primary rounded-lg shadow-lg p-2 text-primary text-xs max-w-[220px] min-w-[120px] relative"
                          style={{
                            transform: "translate(-50%, -120%)",
                            pointerEvents: "auto",
                            zIndex: 10,
                          }}
                        >
                          <button
                            className="absolute top-1 right-1 text-lg font-bold text-primary/60 hover:text-primary"
                            onClick={() =>
                              setOpenPopups((prev) => prev.filter((id) => id !== r._id))
                            }
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              lineHeight: 1,
                            }}
                            aria-label="Close popup"
                          >
                            ×
                          </button>
                          <div className="font-bold mb-1">{r.report_type}</div>
                          <div className="mb-1">
                            <span className="font-semibold">Barangay:</span> {r.barangay}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold">Date:</span>{" "}
                            {new Date(r.date_and_time).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                            <br />
                            <span className="font-semibold">Time:</span>{" "}
                            {new Date(r.date_and_time).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold">By:</span>{" "}
                            {r.isAnonymous ? "Anonymous" : r.user?.username || "Unknown"}
                          </div>
                          <div>
                            <span className="font-semibold">Description:</span>{" "}
                            {r.description.length > 60
                              ? r.description.slice(0, 60) + "..."
                              : r.description}
                          </div>
                          <button
                            className="mt-2 px-3 py-1 bg-primary text-white rounded hover:bg-primary/80 transition"
                            onClick={() => {
                              navigate(`/mapping/${r._id}`);
                            }}
                          >
                            Move Here
                          </button>
                        </div>
                      </OverlayView>
                    )}
                  </React.Fragment>
                );
              })
            }
          </MarkerClusterer>

          {/* Lines from selected report to each filtered nearby report */}
          {filteredNearbyReports.map((r) => (
            <Polyline
              key={`line-${r._id}`}
              path={[
                mapCenter,
                {
                  lat: r.specific_location.coordinates[1],
                  lng: r.specific_location.coordinates[0],
                },
              ]}
              options={{
                strokeColor: "#F59E42",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                zIndex: 2,
                strokeDashArray: [8, 8],
              }}
            />
          ))}
        </GoogleMap>
      </div>
      <SideNavDetails
        report={report}
        nearbyCount={filteredNearbyReports.length}
        nearbyReports={filteredNearbyReports}
        radius={2}
      />
      <article className="absolute z-100000 flex flex-col text-primary right-[10px] bottom-0 md:max-w-[60vw] lg:max-w-[62vw] xl:max-w-[69vw] 2xl:max-w-[72vw] ">
        <p className="text-[20px] text-white shadow-sm font-semibold text-left mb-2 w-full">
          Most Recent Reports
        </p>
        <section className="flex gap-x-2 text-[13px] overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {isNearbyLoading ? (
            <div className="text-gray-500 p-4">Loading nearby reports...</div>
          ) : filteredNearbyReports.length === 0 ? (
            <div className="text-gray-500 p-4">No recent reports found.</div>
          ) : (
            filteredNearbyReports.map((r) => {
              // Debug: log the raw date_and_time and the formatted date/time
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

              console.log("Report ID:", r._id);
              console.log("Raw date_and_time:", rawDate);
              console.log("Formatted date:", formattedDate);
              console.log("Formatted time:", formattedTime);

              return (
                <RecentReportCard
                  key={r._id}
                  profileImage={r.user?.profileImage || profile1}
                  username={r.user?.username || "Unknown"}
                  timestamp={
                    r.date_and_time
                      ? getRelativeTime(r.date_and_time)
                      : ""
                  }
                  date={formattedDate}
                  time={formattedTime}
                  reportType={r.report_type}
                  description={r.description}
                />
              );
            })
          )}
        </section>
      </article>
    </main>
  );
};

// Helper function
function groupReportsByCoordinates(reports) {
  const groups = {};
  reports.forEach((r) => {
    const key = `${r.specific_location.coordinates[1]},${r.specific_location.coordinates[0]}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  return groups;
}

export default SpecificLocation;
