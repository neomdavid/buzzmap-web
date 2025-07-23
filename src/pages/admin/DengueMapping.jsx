import {
  MapPinLine,
  Circle,
  CheckCircle,
  Hourglass,
  MagnifyingGlass,
  Upload,
  Clock,
} from "phosphor-react";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  useGetInterventionsInProgressQuery,
  useGetPostsQuery,
  useGetAllInterventionsQuery,
  useGetBarangaysQuery,
  useGetRecentReportsForBarangayMutation,
} from "@/api/dengueApi";
import * as turf from "@turf/turf";
import MapOnly from "../../components/Mapping/MapOnly";
import stagnantIcon from "../../assets/icons/stagnant_water.svg";
import standingIcon from "../../assets/icons/standing_water.svg";
import garbageIcon from "../../assets/icons/garbage.svg";
import othersIcon from "../../assets/icons/others.svg";

// Define QC_CENTER constant for default map position
const QC_CENTER = {
  lat: 14.676, // Quezon City's approximate center latitude
  lng: 121.0437, // Quezon City's approximate center longitude
};

// Add this helper function before the DengueMapping component
const normalizeBarangayName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/barangay\s+/i, "") // Remove "Barangay" prefix
    .replace(/\s+/g, "") // Remove all spaces
    .replace(/[^a-z0-9]/g, ""); // Remove special characters
};

// Add breeding site type icon mapping
const BREEDING_SITE_TYPE_ICONS = {
  "Stagnant Water": stagnantIcon,
  "Standing Water": standingIcon,
  "Uncollected Garbage or Trash": garbageIcon,
  Others: othersIcon,
  default: stagnantIcon,
};

const DengueMapping = () => {
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMapItem, setSelectedMapItem] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);
  const [selectedFullReport, setSelectedFullReport] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [showBreedingSites, setShowBreedingSites] = useState(true);
  const [showInterventions, setShowInterventions] = useState(false);
  const mapOnlyRef = useRef(null);
  const mapRef = useRef(null);
  const modalRef = useRef(null);
  const streetViewModalRef = useRef(null);
  const mapContainerRef = useRef(null);
  const importModalRef = useRef(null);
  const { data: posts } = useGetPostsQuery();
  const { data: allInterventionsData, isLoading: isLoadingAllInterventions } =
    useGetAllInterventionsQuery();
  const { data: barangaysList, isLoading: isLoadingBarangays } =
    useGetBarangaysQuery();

  // Add filtered barangays state
  const [filteredBarangays, setFilteredBarangays] = useState([]);

  const [getRecentReports] = useGetRecentReportsForBarangayMutation();
  const [recentDengueCases, setRecentDengueCases] = useState(null);

  useEffect(() => {
    if (allInterventionsData) {
      console.log(
        "[DengueMapping DEBUG] Raw allInterventionsData received:",
        JSON.stringify(allInterventionsData, null, 2)
      );
    }
  }, [allInterventionsData]);

  const { data: interventionsData } = useGetInterventionsInProgressQuery(
    selectedBarangay?.properties?.name || "",
    {
      skip: !selectedBarangay?.properties?.name,
    }
  );

  // Add debug for raw posts data
  useEffect(() => {
    console.log("[DEBUG] Raw posts data:", posts);
  }, [posts]);

  // Get nearby reports when a barangay is selected
  const nearbyReports = useMemo(() => {
    console.log("[DEBUG] Calculating nearby reports");
    console.log("[DEBUG] Selected Barangay:", selectedBarangay);
    console.log("[DEBUG] All Posts:", posts);

    if (!selectedBarangay || !posts) {
      console.log("[DEBUG] No selected barangay or posts available");
      return [];
    }

    // Create a Set to track unique combinations
    const uniqueReports = new Set();

    // Handle both possible API response shapes
    const allPostsArray = Array.isArray(posts?.posts)
      ? posts.posts
      : Array.isArray(posts)
      ? posts
      : [];
    console.log("[DEBUG] Filtered allPostsArray:", allPostsArray);

    const filteredPosts = allPostsArray.filter((post) => {
      // Debug each post's properties
      console.log("[DEBUG] Checking post:", {
        id: post._id,
        status: post.status,
        hasCoordinates: !!post.specific_location?.coordinates,
        coordinates: post.specific_location?.coordinates,
        barangay: post.barangay,
      });

      // Only include validated posts with coordinates
      if (
        !post ||
        post.status !== "Validated" ||
        !post.specific_location?.coordinates
      ) {
        console.log(
          "[DEBUG] Skipping post - Invalid status or no coordinates:",
          post
        );
        return false;
      }

      // Create a unique key for this report
      const uniqueKey = `${post.specific_location.coordinates.join(",")}-${
        post.description
      }`;

      // Skip if we've already seen this combination
      if (uniqueReports.has(uniqueKey)) {
        return false;
      }

      // Add to our set of seen combinations
      uniqueReports.add(uniqueKey);

      // If the barangay has coordinates, calculate distance
      if (selectedBarangay.geometry?.coordinates) {
        const center = turf.center(selectedBarangay.geometry);
        const [barangayLng, barangayLat] = center.geometry.coordinates;
        const [postLng, postLat] = post.specific_location.coordinates;

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = ((postLat - barangayLat) * Math.PI) / 180;
        const dLon = ((postLng - barangayLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((barangayLat * Math.PI) / 180) *
            Math.cos((postLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Return posts within 2km radius
        return distance <= 2;
      }

      // If no coordinates, just check if the barangay names match
      return (
        post.barangay &&
        selectedBarangay.properties?.name &&
        normalizeBarangayName(post.barangay) ===
          normalizeBarangayName(selectedBarangay.properties.name)
      );
    });

    console.log("[DEBUG] Filtered Posts:", filteredPosts);

    const nearbyReportsWithDistance = filteredPosts
      .map((post) => {
        let distance = 0;
        if (selectedBarangay.geometry?.coordinates) {
          const center = turf.center(selectedBarangay.geometry);
          const [barangayLng, barangayLat] = center.geometry.coordinates;
          const [postLng, postLat] = post.specific_location.coordinates;

          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in km
          const dLat = ((postLat - barangayLat) * Math.PI) / 180;
          const dLon = ((postLng - barangayLng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((barangayLat * Math.PI) / 180) *
              Math.cos((postLat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distance = R * c;
        }
        return {
          ...post,
          distance,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Get top 3 nearest reports

    console.log("[DEBUG] Final Nearby Reports:", nearbyReportsWithDistance);
    return nearbyReportsWithDistance;
  }, [selectedBarangay, posts]);

  // Memoized list of active (not completed) interventions
  const activeInterventions = useMemo(() => {
    if (!allInterventionsData) return [];

    // Log all unique status values for debugging
    const uniqueStatuses = new Set(
      allInterventionsData.map((i) => i.status?.toLowerCase())
    );
    console.log(
      "[DengueMapping DEBUG] All unique status values:",
      Array.from(uniqueStatuses)
    );

    const filtered = allInterventionsData.filter((intervention) => {
      const status = intervention.status?.toLowerCase();
      // Log each intervention's status for debugging
      console.log("[DengueMapping DEBUG] Intervention status:", {
        id: intervention._id,
        status: status,
        originalStatus: intervention.status,
      });

      // Consider an intervention active if it's not completed/complete
      const isActive = status !== "completed" && status !== "complete";
      return isActive;
    });

    console.log(
      "[DengueMapping DEBUG] Filtered activeInterventions (before sort):",
      JSON.stringify(filtered, null, 2)
    );
    const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log(
      "[DengueMapping DEBUG] Sorted activeInterventions:",
      JSON.stringify(sorted, null, 2)
    );
    return sorted;
  }, [allInterventionsData]);

  // Add this effect to handle modal
  useEffect(() => {
    if (showFullReport && selectedFullReport) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [showFullReport, selectedFullReport]);

  useEffect(() => {
    async function fetchRecentReports() {
      if (!selectedBarangay?.name) {
        setRecentReports([]);
        return;
      }
      try {
        const barangayName = selectedBarangay.name.trim();
        const BASE_URL =
          import.meta.env.VITE_MODE === "PROD" ||
          import.meta.env.MODE === "PROD"
            ? import.meta.env.VITE_API_BASE_URL
            : "http://localhost:4000/";
        console.log(
          "[DEBUG] Fetching recent reports for:",
          barangayName,
          "from",
          BASE_URL
        );
        const response = await fetch(
          `${BASE_URL}api/v1/barangays/get-recent-reports-for-barangay`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barangay_name: barangayName }),
          }
        );
        if (!response.ok) throw new Error("Failed to fetch recent reports");
        const data = await response.json();
        console.log("[DEBUG] Recent Reports API Response:", data); // Debug log
        const caseCounts = data?.reports?.case_counts || {};
        const reportsArr = Object.entries(caseCounts).map(([date, count]) => ({
          date,
          count,
        }));
        setRecentReports(reportsArr);
      } catch (err) {
        console.error("[DEBUG] Recent Reports Fetch Error:", err); // Debug log
        setRecentReports([]);
      }
    }
    fetchRecentReports();
  }, [selectedBarangay]);

  // Add this effect to fetch recent dengue cases when a barangay is selected
  useEffect(() => {
    const fetchRecentDengueCases = async () => {
      if (selectedBarangay?.properties?.name) {
        try {
          const response = await getRecentReports(
            selectedBarangay.properties.name
          ).unwrap();
          setRecentDengueCases(response.reports.case_counts);
        } catch (error) {
          console.error("[DEBUG] Error fetching recent dengue cases:", error);
        }
      }
    };

    fetchRecentDengueCases();
  }, [selectedBarangay, getRecentReports]);

  // Add search handler
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!barangaysList) return;

    const filtered = barangaysList.filter(
      (barangay) =>
        barangay.name.toLowerCase().includes(query.toLowerCase()) ||
        barangay.displayName?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBarangays(filtered);
  };

  // Add debug logging for barangaysList
  useEffect(() => {
    console.log("[DEBUG] Current barangaysList:", barangaysList);
  }, [barangaysList]);

  const handleBarangaySelect = (barangay) => {
    if (!barangay) return;

    // If this is a GeoJSON feature (clicked on map)
    if (barangay.type === "Feature") {
      // Find matching barangay from barangaysList
      const matching = barangaysList?.find(
        (b) =>
          normalizeBarangayName(b.name) ===
          normalizeBarangayName(barangay.properties?.name)
      );

      // Merge the data, ensuring all properties are properly set
      const merged = {
        ...barangay,
        properties: {
          ...barangay.properties,
          name: barangay.properties?.name,
          displayName: matching?.displayName || barangay.properties?.name,
          patternType:
            matching?.status_and_recommendation?.pattern_based?.status ||
            barangay.properties?.patternType ||
            "none",
          status_and_recommendation:
            matching?.status_and_recommendation ||
            barangay.properties?.status_and_recommendation,
          risk_level: matching?.risk_level || barangay.properties?.risk_level,
          pattern_data:
            matching?.pattern_data || barangay.properties?.pattern_data,
        },
      };

      setSelectedBarangay(merged);

      // Pan logic
      if (mapOnlyRef.current && barangay.geometry?.coordinates) {
        try {
          const center = turf.center(barangay.geometry);
          const [lng, lat] = center.geometry.coordinates;
          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            mapOnlyRef.current.panTo({ lat, lng });
            mapOnlyRef.current.setZoom(15);
          }
        } catch (error) {
          mapOnlyRef.current.panTo(QC_CENTER);
          mapOnlyRef.current.setZoom(13);
        }
      }
      return;
    }

    // If this is from the dropdown, find the matching GeoJSON feature
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((geoData) => {
        const feature = geoData.features.find(
          (f) =>
            normalizeBarangayName(f.properties.name) ===
            normalizeBarangayName(barangay.name)
        );

        if (feature) {
          // Create a GeoJSON feature with the barangay data
          const geoJSONFeature = {
            type: "Feature",
            properties: {
              ...feature.properties,
              name: barangay.name,
              displayName: barangay.displayName || barangay.name,
              patternType:
                barangay.status_and_recommendation?.pattern_based?.status ||
                "none",
              status_and_recommendation: barangay.status_and_recommendation,
              risk_level: barangay.risk_level,
              pattern_data: barangay.pattern_data,
            },
            geometry: feature.geometry,
          };

          // Call handleBarangaySelect again with the GeoJSON feature
          handleBarangaySelect(geoJSONFeature);
        }
      })
      .catch((error) => {
        console.error("[DEBUG] Error fetching GeoJSON:", error);
      });
  };

  // Add debug logging for selectedBarangay
  useEffect(() => {
    console.log("[DEBUG] Selected barangay updated:", selectedBarangay);
  }, [selectedBarangay]);

  // Add debug for posts
  useEffect(() => {
    console.log("[DEBUG] posts data:", posts);
  }, [posts]);

  // Add debug for nearbyReports
  useEffect(() => {
    console.log("[DEBUG] nearbyReports:", nearbyReports);
  }, [nearbyReports]);

  const handleShowOnMap = (item, type) => {
    setSelectedMapItem({ type, item });
    let coordinates;
    if (type === "report" && item.specific_location?.coordinates) {
      coordinates = item.specific_location.coordinates;
    } else if (type === "intervention" && item.specific_location?.coordinates) {
      coordinates = item.specific_location.coordinates;
    }
    if (mapOnlyRef.current && coordinates) {
      const position = {
        lat: coordinates[1],
        lng: coordinates[0],
      };
      mapOnlyRef.current.panTo(position);
      mapOnlyRef.current.setZoom(17);
      if (mapContainerRef.current) {
        mapContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  // Add handler for viewing full report
  const handleViewFullReport = (report) => {
    setSelectedFullReport(report);
    setShowFullReport(true);
  };

  // Helper function to get border color based on pattern
  const getBorderColor = (patternType) => {
    switch (patternType?.toLowerCase()) {
      case "spike":
        return "border-error";
      case "gradual_rise":
        return "border-warning";
      case "decline":
        return "border-success";
      case "stability":
        return "border-info";
      default:
        return "border-gray-400";
    }
  };

  // Helper function to get text color based on pattern
  const getPatternTextColor = (patternType) => {
    switch (patternType?.toLowerCase()) {
      case "spike":
        return "text-error";
      case "gradual_rise":
        return "text-warning";
      case "decline":
        return "text-success";
      case "stability":
        return "text-info";
      default:
        return "text-gray-400";
    }
  };

  // Helper function to get background color based on risk level
  const getRiskLevelBgColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "high":
        return "bg-error";
      case "medium":
        return "bg-warning";
      case "low":
        return "bg-success";
      default:
        return "bg-gray-400";
    }
  };

  // Helper function to get background color based on pattern type
  const getPatternBgColor = (patternType) => {
    switch (patternType?.toLowerCase()) {
      case "spike":
        return "bg-error";
      case "gradual_rise":
        return "bg-warning";
      case "decline":
        return "bg-success";
      case "stability":
        return "bg-info";
      default:
        return "bg-gray-400";
    }
  };

  const openStreetViewModal = () => {
    const streetViewElement = streetViewModalRef.current;
    if (
      streetViewElement &&
      selectedFullReport?.specific_location?.coordinates?.length === 2
    ) {
      streetViewElement.showModal();

      new window.google.maps.StreetViewPanorama(
        streetViewElement.querySelector("#street-view-container"),
        {
          position: {
            lat: selectedFullReport.specific_location.coordinates[1],
            lng: selectedFullReport.specific_location.coordinates[0],
          },
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
        }
      );
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setImportError("");
    } else {
      setImportError("Please select a valid CSV file");
      setCsvFile(null);
    }
  };

  const handleImport = async () => {
    if (!csvFile) {
      setImportError("Please select a CSV file first");
      return;
    }
    setIsImporting(true);
    setImportError("");

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      // TODO: Replace with your actual API endpoint
      const response = await fetch("/api/dengue/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to import CSV file");
      }

      // Close modal and reset state
      setShowImportModal(false);
      setCsvFile(null);

      // Refresh data
      // TODO: Add your data refresh logic here
    } catch (error) {
      setImportError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  // Add debug logging for interventions error
  useEffect(() => {
    if (interventionsData && interventionsData.length > 0) {
      console.log("[DEBUG] Interventions data:", interventionsData);
    }
  }, [interventionsData]);

  return (
    <main className="flex flex-col w-full">
      <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[78%]">
        Dengue Mapping
      </p>

      <div className="relative mb-4 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search barangay..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full md:w-[300px] pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <MagnifyingGlass
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          {/* Search Results Dropdown */}
          {searchQuery && filteredBarangays.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              {filteredBarangays.map((barangay) => (
                <div
                  key={barangay._id}
                  onClick={() => {
                    handleBarangaySelect(barangay);
                    setSearchQuery("");
                    setFilteredBarangays([]);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-primary"
                >
                  {barangay.displayName || barangay.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex h-[50vh] mb-4" ref={mapContainerRef}>
        <MapOnly
          ref={mapOnlyRef}
          showBreedingSites={showBreedingSites}
          showInterventions={showInterventions}
          selectedBarangay={selectedBarangay}
          onBarangaySelect={handleBarangaySelect}
          interventions={showInterventions ? activeInterventions : []}
          style={{ height: "100%", width: "100%" }}
          onMarkerClick={(item, type) => {
            if (type === "report") {
              setSelectedFullReport(item);
              setShowFullReport(true);
            } else if (type === "intervention") {
              // Create and show info window for intervention
              const content = document.createElement("div");
              content.innerHTML = `
                <div class="p-3 flex flex-col items-center gap-1 font-normal bg-white text-center rounded-md shadow-md text-primary">
                  <p class="text-4xl font-extrabold text-primary mb-2">${
                    item.interventionType || "Intervention"
                  }</p>
                  <div class="text-lg flex items-center gap-2">
                    <span class="font-bold">Status:</span>
                    <span class="px-3 py-1 rounded-full text-white font-bold text-sm" style="background-color:#FF6347;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                      ${item.status || ""}
                    </span>
                  </div>
                  <p class="text-lg text-center"><span class="font-bold">Barangay:</span> ${
                    item.barangay || ""
                  }</p>
                  ${
                    item.address
                      ? `<p class="text-lg text-center"><span class="font-bold text-center">Address:</span> ${item.address}</p>`
                      : ""
                  }
                  <p class="text-lg"><span class="font-bold">Date:</span> ${
                    item.date
                      ? new Date(item.date).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : ""
                  }</p>
                  <p class="text-lg"><span class="font-bold">Personnel:</span> ${
                    item.personnel || ""
                  }</p>
                </div>
              `;
              if (mapOnlyRef.current) {
                mapOnlyRef.current.showInfoWindow(content, {
                  lat: item.specific_location.coordinates[1],
                  lng: item.specific_location.coordinates[0],
                });
              }
            }
          }}
        />
      </div>
      <p className="text-left text-primary text-lg font-extrabold flex items-center gap-2 mb-8">
        <div className="text-success">
          <MapPinLine size={16} />
        </div>
        Click on a Barangay to view details
      </p>
      <div className="h-auto grid grid-cols-10 gap-10">
        <div
          className={`col-span-4 border-2 ${getBorderColor(
            selectedBarangay?.properties?.patternType
          )} rounded-2xl flex flex-col p-4 gap-1`}
        >
          <p className="text-center font-semibold text-base-content">
            Selected Barangay - Dengue Overview
          </p>
          <p
            className={`text-center font-bold ${getPatternTextColor(
              selectedBarangay?.properties?.patternType
            )} text-4xl mb-4 mt-2`}
          >
            {selectedBarangay
              ? `Barangay ${
                  selectedBarangay.properties?.displayName ||
                  selectedBarangay.properties?.name
                }`
              : "Select a Barangay"}
          </p>
          <p
            className={`text-center font-semibold text-white text-lg uppercase mb-4 px-4 py-1 rounded-full inline-block mx-auto ${getPatternBgColor(
              selectedBarangay?.properties?.patternType
            )}`}
          >
            {selectedBarangay
              ? selectedBarangay.properties?.patternType
                ? selectedBarangay.properties.patternType
                    .charAt(0)
                    .toUpperCase() +
                  selectedBarangay.properties.patternType
                    .slice(1)
                    .replace(/_/g, " ")
                : "NO PATTERN DETECTED"
              : "NO BARANGAY SELECTED"}
          </p>
          <div className="w-[90%] mx-auto flex flex-col text-black gap-2">
            {/* Pattern-Based */}
            {selectedBarangay?.status_and_recommendation?.pattern_based &&
              selectedBarangay.status_and_recommendation.pattern_based.status &&
              selectedBarangay.status_and_recommendation.pattern_based.status.trim() !==
                "" && (
                <>
                  <p className="font-bold text-lg text-primary mb-1">
                    Pattern-Based
                  </p>
                  {selectedBarangay.status_and_recommendation.pattern_based
                    .alert && (
                    <p className="">
                      <span className="font-bold">Alert: </span>
                      {selectedBarangay.status_and_recommendation.pattern_based.alert.replace(
                        new RegExp(
                          `^${
                            selectedBarangay.properties?.displayName ||
                            selectedBarangay.properties?.name
                          }:?\\s*`,
                          "i"
                        ),
                        ""
                      )}
                    </p>
                  )}
                  {selectedBarangay.status_and_recommendation.pattern_based
                    .recommendation && (
                    <p className="">
                      <span className="font-bold">Recommendation: </span>
                      {
                        selectedBarangay.status_and_recommendation.pattern_based
                          .recommendation
                      }
                    </p>
                  )}
                  <hr className="border-t border-gray-200 my-2" />
                </>
              )}
            {/* Report-Based */}
            {selectedBarangay?.status_and_recommendation?.report_based &&
              selectedBarangay.status_and_recommendation.report_based.status &&
              selectedBarangay.status_and_recommendation.report_based.status.trim() !==
                "" && (
                <>
                  <p className="font-bold text-lg text-primary mb-1">
                    Report-Based
                  </p>
                  {/* Status as badge with label */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-bold">Status:</span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-white text-md font-bold capitalize ${(() => {
                        const status =
                          selectedBarangay.status_and_recommendation.report_based.status.toLowerCase();
                        if (status === "low") return "bg-success";
                        if (status === "medium") return "bg-warning";
                        if (status === "high") return "bg-error";
                        return "bg-gray-400";
                      })()}`}
                    >
                      {
                        selectedBarangay.status_and_recommendation.report_based
                          .status
                      }
                    </span>
                  </div>
                  {selectedBarangay.status_and_recommendation.report_based
                    .alert && (
                    <p className="">
                      <span className="font-bold">Alert: </span>
                      {
                        selectedBarangay.status_and_recommendation.report_based
                          .alert
                      }
                    </p>
                  )}
                  {selectedBarangay.status_and_recommendation.report_based
                    .recommendation && (
                    <p className="">
                      <span className="font-bold">Recommendation: </span>
                      {
                        selectedBarangay.status_and_recommendation.report_based
                          .recommendation
                      }
                    </p>
                  )}
                  <hr className="border-t border-gray-200 my-2" />
                </>
              )}
            {/* Death Priority */}
            {selectedBarangay?.status_and_recommendation?.death_priority &&
              selectedBarangay.status_and_recommendation.death_priority
                .status &&
              selectedBarangay.status_and_recommendation.death_priority.status.trim() !==
                "" && (
                <>
                  <p className="font-bold text-primary mb-1 text-lg">
                    Death Priority
                  </p>
                  <p className="">
                    <span className="font-bold">Status: </span>
                    {
                      selectedBarangay.status_and_recommendation.death_priority
                        .status
                    }
                  </p>
                  {selectedBarangay.status_and_recommendation.death_priority
                    .alert && (
                    <p className="">
                      <span className="font-bold">Alert: </span>
                      {
                        selectedBarangay.status_and_recommendation
                          .death_priority.alert
                      }
                    </p>
                  )}
                  {selectedBarangay.status_and_recommendation.death_priority
                    .recommendation && (
                    <p className="">
                      <span className="font-bold">Recommendation: </span>
                      {
                        selectedBarangay.status_and_recommendation
                          .death_priority.recommendation
                      }
                    </p>
                  )}
                  <hr className="border-t border-gray-200 my-2" />
                </>
              )}
            {/* Pattern Based Alert */}
            {barangaysList?.find(
              (b) => b.name === selectedBarangay?.properties?.name
            )?.status_and_recommendation?.pattern_based?.alert && (
              <div>
                <p className="text-md text-center text-gray-700 font-normal">
                  {
                    barangaysList.find(
                      (b) => b.name === selectedBarangay?.properties?.name
                    )?.status_and_recommendation?.pattern_based?.alert
                  }
                </p>
              </div>
            )}
            {/* Recent Dengue Cases */}
            {recentDengueCases && Object.keys(recentDengueCases).length > 0 && (
              <div className="mb-2">
                <p className="mt-1">
                  <span className="font-bold text-lg">
                    Recent Dengue Cases:{" "}
                  </span>
                </p>
                <div className="mt-3 flex flex-col space-y-3 ml-4">
                  {/* Dengue Cases List */}
                  {Object.entries(recentDengueCases).map(([date, count]) => (
                    <div key={date} className="flex gap-2 items-center">
                      <div>
                        <Circle size={16} color="red" weight="fill" />
                      </div>
                      <p className="font-bold">
                        {date}:{" "}
                        <span className="font-normal">
                          {count} case{count > 1 ? "s" : ""}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
                <hr className="border-t border-gray-200 my-2" />
              </div>
            )}
            {/* Interventions Section */}
            {interventionsData && interventionsData.length > 0 && (
              <>
                {/* Ongoing Interventions */}
                {interventionsData.filter((i) => i.status === "Ongoing")
                  .length > 0 && (
                  <>
                    <p className="font-bold text-lg text-primary mb-1">
                      Ongoing Interventions:
                    </p>
                    <div className="flex flex-col space-y-2 ml-4">
                      {interventionsData
                        .filter((i) => i.status === "Ongoing")
                        .map((intervention) => (
                          <div
                            key={intervention._id}
                            className="flex text-md gap-2 items-center"
                          >
                            <div className="text-success">
                              <CheckCircle size={16} />
                            </div>
                            <p className="font-bold">
                              {new Date(intervention.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                              :{" "}
                              <span className="font-normal">
                                {intervention.interventionType}
                              </span>
                            </p>
                          </div>
                        ))}
                    </div>
                    <hr className="border-t border-gray-200 my-2" />
                  </>
                )}

                {/* Scheduled Interventions */}
                {interventionsData.filter((i) => i.status === "Scheduled")
                  .length > 0 && (
                  <>
                    <p className="font-bold text-lg text-primary mb-1">
                      Scheduled Interventions:
                    </p>
                    <div className="flex flex-col space-y-2 ml-4">
                      {interventionsData
                        .filter((i) => i.status === "Scheduled")
                        .map((intervention) => (
                          <div
                            key={intervention._id}
                            className="flex text-md gap-2 items-center"
                          >
                            <div className="text-warning">
                              <Clock size={16} />
                            </div>
                            <p className="font-bold">
                              {new Date(intervention.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                              :{" "}
                              <span className="font-normal">
                                {intervention.interventionType}
                              </span>
                            </p>
                          </div>
                        ))}
                    </div>
                    <hr className="border-t border-gray-200 my-2" />
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end">
            {/* <button className="bg-primary rounded-full text-white px-4 py-1 text-[11px] hover:bg-primary/80 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer">
              View Full Report
            </button> */}
          </div>
        </div>
        <div className="col-span-6 flex flex-col gap-2">
          <p className="text-[30px] text-base-content font-bold">
            Reports nearby
          </p>
          {nearbyReports.length > 0 ? (
            nearbyReports.map((report, index) => (
              <div
                key={index}
                className="flex flex-col items-start bg-white rounded-2xl p-4 text-black gap-2 w-full"
              >
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={
                      BREEDING_SITE_TYPE_ICONS[report.report_type] ||
                      BREEDING_SITE_TYPE_ICONS.default
                    }
                    alt={report.report_type}
                    className="w-8 h-8"
                  />
                  <p className="font-semibold text-lg">
                    {report.barangay} - {report.report_type}
                  </p>
                </div>
                <p>
                  <span className="font-bold ml-1.5">Distance: </span>
                  {(report.distance * 1000).toFixed(0)}m away
                </p>
                <p>
                  <span className="font-bold ml-1.5">Reported: </span>
                  {new Date(report.date_and_time).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-bold ml-1.5">Description: </span>
                  {report.description}
                </p>
                <div className="flex justify-end w-full gap-2">
                  <button
                    onClick={() => handleViewFullReport(report)}
                    className="bg-white text-primary border-1 rounded-full  px-4 py-1 text-[11px] hover:cursor-pointer hover:bg-primary/30 transition-all duration-200"
                  >
                    View Full Report
                  </button>
                  <button
                    onClick={() => handleShowOnMap(report, "report")}
                    className="bg-primary rounded-full text-white px-4 py-1 text-[11px] hover:bg-primary/80 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    Show on Map
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-start bg-white rounded-2xl p-4 text-black gap-2">
              <p className="text-gray-500 italic">No nearby reports found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Report Modal */}
      <dialog
        ref={modalRef}
        className="modal transition-transform duration-300 ease-in-out"
      >
        <div className="modal-box bg-white rounded-3xl shadow-2xl w-9/12 max-w-4xl p-12 relative">
          <button
            className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => setShowFullReport(false)}
          >
            ✕
          </button>

          <p className="text-center text-3xl font-bold mb-6">
            Full Report Details
          </p>
          <p className="text-left text-2xl font-bold mb-6">Report Details</p>
          <hr className="text-accent/50 mb-6" />

          <div className="space-y-2">
            {/* Report Type Badge */}
            <div
              className={`inline-block rounded-full px-4 py-2 text-white ${
                selectedFullReport?.report_type === "Breeding Site"
                  ? "bg-info"
                  : selectedFullReport?.report_type === "Standing Water"
                  ? "bg-warning"
                  : "bg-error"
              }`}
            >
              {selectedFullReport?.report_type}
            </div>

            {/* Location Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold mb-2 text-xl">Location Details</p>
              <p>
                <span className="font-medium">Barangay:</span>{" "}
                {selectedFullReport?.barangay}
              </p>
              <p>
                <span className="font-medium">Coordinates:</span>{" "}
                {selectedFullReport?.specific_location.coordinates.join(", ")}
              </p>
            </div>

            {/* Report Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold mb-2 text-xl">Report Details</p>
              <p>
                <span className="font-medium">Reported by:</span>{" "}
                {selectedFullReport?.user?.username}
              </p>
              <p>
                <span className="font-medium">Date and Time:</span>{" "}
                {new Date(selectedFullReport?.date_and_time).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {selectedFullReport?.status}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {selectedFullReport?.description}
              </p>
            </div>

            {/* Images Section */}
            {selectedFullReport?.images &&
              selectedFullReport.images.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-bold mb-2 text-xl">Evidence Images</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedFullReport.images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={openStreetViewModal}
                className="btn bg-primary text-white hover:bg-primary/80 transition-colors"
              >
                View Street View
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFullReport(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleShowOnMap(selectedFullReport, "report");
                    setShowFullReport(false);
                  }}
                  className="bg-info text-white px-4 py-2 rounded-lg hover:bg-info/80 transition-colors"
                >
                  Show on Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </dialog>

      {/* StreetView Modal */}
      <dialog ref={streetViewModalRef} className="modal">
        <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-5xl p-6 py-14 relative max-h-[85vh] overflow-y-auto">
          <button
            className="absolute top-4 right-4 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => streetViewModalRef.current.close()}
          >
            ✕
          </button>

          {/* Reported Photos Section */}
          {selectedFullReport?.images &&
            selectedFullReport.images.length > 0 && (
              <div className="mb-6">
                <p className="text-xl font-bold mb-4">Reported Photos</p>
                <div className="grid grid-cols-3 gap-4">
                  {selectedFullReport.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        alt={`Reported Photo ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* StreetView Container */}
          <div className="space-y-4">
            <p className="text-xl font-bold">Street View</p>
            <div
              id="street-view-container"
              className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg"
            />
          </div>
        </div>
      </dialog>

      {/* Import Modal */}
      <dialog ref={importModalRef} className="modal" open={showImportModal}>
        <div className="modal-box bg-white rounded-3xl shadow-3xl w-9/12 max-w-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">Import Dengue Cases</h3>

          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              Upload a CSV file containing dengue case data.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              The CSV should include the following columns:
              <br />- Barangay
              <br />- Date
              <br />- Number of Cases
              <br />- Location (optional)
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
            />

            {importError && <p className="text-error mt-2">{importError}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowImportModal(false);
                setCsvFile(null);
                setImportError("");
              }}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="btn btn-primary"
              disabled={!csvFile || isImporting}
            >
              {isImporting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Importing...
                </>
              ) : (
                "Import"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
};

export default DengueMapping;
