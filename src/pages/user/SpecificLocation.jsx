import { useLocation, useParams } from "react-router-dom";
import { GoogleMap, Marker } from "@react-google-maps/api";
import SideNavDetails from "../../components/Mapping/SideNavDetails";
import { useGoogleMaps } from "../../components/GoogleMapsProvider";
import { useGetPostByIdQuery, useGetPostsQuery, useGetNearbyReportsMutation } from "../../api/dengueApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { DengueMap, RecentReportCard } from "../../components";
import profile1 from "../../assets/profile1.png";
import { useMemo, useEffect, useState } from "react";
import React from "react";

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

  if (!report && isLoading) {
    return <div>Loading report...</div>;
  }
  if (!report && error) {
    return <div className="text-center mt-10 text-red-500">Failed to load report.</div>;
  }
  if (!report) {
    return <div className="text-center mt-10 text-red-500">No breeding site data provided.</div>;
  }

  const position = {
    lat: report.specific_location.coordinates[1],
    lng: report.specific_location.coordinates[0],
  };

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <main className="text-2xl mt-[-69px]">
      <div className="w-full h-[100vh]">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={18}
        >
          <Marker position={position} />
        </GoogleMap>
      </div>
      <SideNavDetails
        report={report}
        nearbyCount={nearbyCount}
        nearbyReports={nearbyReports}
      />
      <article className="absolute z-100000 flex flex-col text-primary right-[10px] bottom-0 md:max-w-[60vw] lg:max-w-[62vw] xl:max-w-[69vw] 2xl:max-w-[72vw] ">
        <p className="text-[20px] font-semibold text-left mb-2 w-full">
          Most Recent Reports
        </p>
        <section className="flex gap-x-2 text-[13px] overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {isNearbyLoading ? (
            <div className="text-gray-500 p-4">Loading nearby reports...</div>
          ) : nearbyReports.length === 0 ? (
            <div className="text-gray-500 p-4">No recent reports found.</div>
          ) : (
            nearbyReports.map((r) => {
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

export default SpecificLocation;
