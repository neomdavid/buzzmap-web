import { DengueMapNoInfo } from "@/components";
import { MapPinLine, Circle, CheckCircle, Hourglass, MagnifyingGlass, Upload } from "phosphor-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useGetInterventionsInProgressQuery, useGetPostsQuery, useGetAllInterventionsQuery, useGetBarangaysQuery } from "@/api/dengueApi";
import * as turf from '@turf/turf';

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
  const mapRef = useRef(null);
  const modalRef = useRef(null);
  const streetViewModalRef = useRef(null);
  const mapContainerRef = useRef(null);
  const importModalRef = useRef(null);
  const { data: posts } = useGetPostsQuery();
  const { data: allInterventionsData, isLoading: isLoadingAllInterventions } = useGetAllInterventionsQuery();
  const { data: barangaysList, isLoading: isLoadingBarangays } = useGetBarangaysQuery();

  useEffect(() => {
    if(allInterventionsData) {
      console.log("[DengueMapping DEBUG] Raw allInterventionsData received:", JSON.stringify(allInterventionsData, null, 2));
    }
  }, [allInterventionsData]);

  const { data: interventionsInProgress } = useGetInterventionsInProgressQuery(
    selectedBarangay?.properties?.displayName?.toLowerCase().replace(/\s+/g, '') || '',
    {
      skip: !selectedBarangay,
    }
  );

  // Get nearby reports when a barangay is selected
  const nearbyReports = useMemo(() => {
    console.log('Selected Barangay:', selectedBarangay);
    console.log('All Posts:', posts);

    if (!selectedBarangay || !posts) {
      console.log('No selected barangay or posts available');
      return [];
    }

    const selectedCenter = turf.center(selectedBarangay.geometry);
    const selectedPoint = turf.point(selectedCenter.geometry.coordinates);
    console.log('Selected Point:', selectedPoint);

    // Create a Set to track unique combinations
    const uniqueReports = new Set();

    const filteredPosts = posts.filter(post => {
      // Only include validated posts with coordinates
      if (post.status !== "Validated" || !post.specific_location?.coordinates) {
        console.log('Skipping post - Invalid status or no coordinates:', post);
        return false;
      }

      // Create a unique key for this report
      const uniqueKey = `${post.specific_location.coordinates.join(',')}-${post.description}`;
      
      // Skip if we've already seen this combination
      if (uniqueReports.has(uniqueKey)) {
        return false;
      }
      
      // Add to our set of seen combinations
      uniqueReports.add(uniqueKey);

      // Create a point for the post location
      const postPoint = turf.point(post.specific_location.coordinates);
      
      // Calculate distance in kilometers
      const distance = turf.distance(selectedPoint, postPoint);
      console.log(`Distance for ${post.barangay}:`, distance, 'km');
      
      // Return posts within 2km radius
      return distance <= 2;
    });

    console.log('Filtered Posts:', filteredPosts);

    const nearbyReportsWithDistance = filteredPosts
      .map(post => ({
        ...post,
        distance: turf.distance(selectedPoint, turf.point(post.specific_location.coordinates))
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Get top 3 nearest reports

    console.log('Final Nearby Reports:', nearbyReportsWithDistance);
    return nearbyReportsWithDistance;
  }, [selectedBarangay, posts]);

  // Memoized list of active (not completed) interventions
  const activeInterventions = useMemo(() => {
    if (!allInterventionsData) return [];
    
    // Log all unique status values for debugging
    const uniqueStatuses = new Set(allInterventionsData.map(i => i.status?.toLowerCase()));
    console.log("[DengueMapping DEBUG] All unique status values:", Array.from(uniqueStatuses));
    
    const filtered = allInterventionsData.filter(intervention => {
      const status = intervention.status?.toLowerCase();
      // Log each intervention's status for debugging
      console.log("[DengueMapping DEBUG] Intervention status:", {
        id: intervention._id,
        status: status,
        originalStatus: intervention.status
      });
      
      // Consider an intervention active if it's not completed/complete
      const isActive = status !== 'completed' && status !== 'complete';
      return isActive;
    });
    
    console.log("[DengueMapping DEBUG] Filtered activeInterventions (before sort):", JSON.stringify(filtered, null, 2));
    const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log("[DengueMapping DEBUG] Sorted activeInterventions:", JSON.stringify(sorted, null, 2));
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
      if (!selectedBarangay?.properties?.displayName) {
        setRecentReports([]);
        return;
      }
      try {
        const barangayName = selectedBarangay.properties.displayName.trim();
        const response = await fetch("http://localhost:4000/api/v1/barangays/get-recent-reports-for-barangay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barangay_name: barangayName })
        });
        if (!response.ok) throw new Error("Failed to fetch recent reports");
        const data = await response.json();
        console.log('[Recent Reports API Response]', data); // Debug log
        const caseCounts = data?.reports?.case_counts || {};
        const reportsArr = Object.entries(caseCounts).map(([date, count]) => ({ date, count }));
        console.log('[Parsed Recent Reports]', reportsArr); // Debug log
        setRecentReports(reportsArr);
      } catch (err) {
        console.error('[Recent Reports Fetch Error]', err); // Debug log
        setRecentReports([]);
      }
    }
    fetchRecentReports();
  }, [selectedBarangay]);

  const handleBarangaySelect = (barangay) => {
    setSelectedBarangay(barangay);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const handleShowOnMap = (item, type) => {
    console.log('handleShowOnMap called with item:', item, 'type:', type);
    console.log('Map ref current:', mapRef.current);
    
    setSelectedMapItem({ type, item });

    let coordinates;
    if (type === 'report' && item.specific_location?.coordinates) {
      coordinates = item.specific_location.coordinates;
    } else if (type === 'intervention' && item.specific_location?.coordinates) {
      coordinates = item.specific_location.coordinates;
    }

    if (mapRef.current && coordinates) {
      const position = {
        lat: coordinates[1],
        lng: coordinates[0]
      };
      console.log('Attempting to pan to position:', position);
      
      mapRef.current.panTo(position);
      mapRef.current.setZoom(17);

      if (mapContainerRef.current) {
        mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      console.error('Map reference is not available or coordinates missing');
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
      case 'spike':
        return 'border-error';
      case 'gradual_rise':
        return 'border-warning';
      case 'decline':
        return 'border-success';
      case 'stability':
        return 'border-info';
      default:
        return 'border-gray-400';
    }
  };

  // Helper function to get text color based on pattern
  const getPatternTextColor = (patternType) => {
    switch (patternType?.toLowerCase()) {
      case 'spike':
        return 'text-error';
      case 'gradual_rise':
        return 'text-warning';
      case 'decline':
        return 'text-success';
      case 'stability':
        return 'text-info';
      default:
        return 'text-gray-400';
    }
  };

  // Helper function to get background color based on risk level
  const getRiskLevelBgColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'bg-error';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-gray-400';
    }
  };

  // Helper function to get background color based on pattern type
  const getPatternBgColor = (patternType) => {
    switch (patternType?.toLowerCase()) {
      case 'spike':
        return 'bg-error';
      case 'gradual_rise':
        return 'bg-warning';
      case 'decline':
        return 'bg-success';
      case 'stability':
        return 'bg-info';
      default:
        return 'bg-gray-400'; 
    }
  };

  const openStreetViewModal = () => {
    const streetViewElement = streetViewModalRef.current;
    if (streetViewElement && selectedFullReport?.specific_location?.coordinates?.length === 2) {
      streetViewElement.showModal();

      new window.google.maps.StreetViewPanorama(
        streetViewElement.querySelector("#street-view-container"),
        {
          position: { 
            lat: selectedFullReport.specific_location.coordinates[1], 
            lng: selectedFullReport.specific_location.coordinates[0] 
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
        </div>
        
        {/* <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Upload size={20} />
          Import CSV
        </button> */}
      </div>

      <div className="flex h-[50vh] mb-4" ref={mapContainerRef}>
        <DengueMapNoInfo 
          ref={mapRef}
          onBarangaySelect={handleBarangaySelect}
          searchQuery={searchQuery}
          onSearchClear={handleSearchClear}
          selectedMapItem={selectedMapItem}
          activeInterventions={activeInterventions}
          isLoadingInterventions={isLoadingAllInterventions}
          barangaysList={barangaysList}
          onPropsDebug={{ activeInterventions, isLoadingAllInterventions, selectedMapItem }}
        />
      </div>
      <p className="text-left text-primary text-lg font-extrabold flex items-center gap-2 mb-8">
        <div className="text-success">
          <MapPinLine  size={16} />
        </div>
        Click on a Barangay to view details
      </p>
      <div className="grid grid-cols-10 gap-10">
        <div className={`col-span-4 border-2 ${getBorderColor(selectedBarangay?.properties?.patternType)} rounded-2xl flex flex-col p-4 gap-1`}>
          <p className="text-center font-semibold text-base-content">Selected Barangay - Dengue Overview</p>
          <p className={`text-center font-bold ${getPatternTextColor(selectedBarangay?.properties?.patternType)} text-4xl mb-2`}>
            {selectedBarangay ? `Barangay ${selectedBarangay.properties.displayName}` : 'Select a Barangay'}
          </p>
          <p className={`text-center font-semibold text-white text-lg uppercase mb-4 px-4 py-1 rounded-full inline-block mx-auto ${getPatternBgColor(selectedBarangay?.properties?.patternType)}`}>
            {selectedBarangay
              ? selectedBarangay.properties.patternType
                ? (selectedBarangay.properties.patternType.charAt(0).toUpperCase() + selectedBarangay.properties.patternType.slice(1).replace('_', ' '))
                : 'NO PATTERN DETECTED'
              : 'NO BARANGAY SELECTED'
            }
          </p>
          <div className="w-[90%] mx-auto flex flex-col text-black gap-2">
            {/* Pattern-Based */}
            {selectedBarangay?.properties?.status_and_recommendation?.pattern_based &&
              selectedBarangay.properties.status_and_recommendation.pattern_based.status &&
              selectedBarangay.properties.status_and_recommendation.pattern_based.status.trim() !== "" && (
                <>
                  <p className="font-bold text-lg text-primary mb-1">Pattern-Based</p>
                  {selectedBarangay.properties.status_and_recommendation.pattern_based.alert && (
                    <p className=""><span className="font-bold">Alert: </span>
                      {selectedBarangay.properties.status_and_recommendation.pattern_based.alert.replace(
                        new RegExp(`^${selectedBarangay.properties.displayName}:?\\s*`, "i"),
                        ""
                      )}
                    </p>
                  )}
                  {selectedBarangay.properties.status_and_recommendation.pattern_based.recommendation && (
                    <p className=""><span className="font-bold">Recommendation: </span>
                      {selectedBarangay.properties.status_and_recommendation.pattern_based.recommendation}
                    </p>
                  )}
                  <hr className="border-t border-gray-200 my-2" />
                </>
            )}
            {/* Report-Based */}
            {selectedBarangay?.properties?.status_and_recommendation?.report_based &&
              selectedBarangay.properties.status_and_recommendation.report_based.status &&
              selectedBarangay.properties.status_and_recommendation.report_based.status.trim() !== "" && (
                <>
                  <p className="font-bold text-lg text-primary mb-1">Report-Based</p>
                  {/* Status as badge with label */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-bold">Status:</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-white text-md font-bold capitalize ${(() => {
                      const status = selectedBarangay.properties.status_and_recommendation.report_based.status.toLowerCase();
                      if (status === 'low') return 'bg-success';
                      if (status === 'medium') return 'bg-warning';
                      if (status === 'high') return 'bg-error';
                      return 'bg-gray-400';
                    })()}`}>{selectedBarangay.properties.status_and_recommendation.report_based.status}</span>
                  </div>
                  {selectedBarangay.properties.status_and_recommendation.report_based.alert && (
                    <p className=""><span className="font-bold">Alert: </span>
                      {selectedBarangay.properties.status_and_recommendation.report_based.alert}
                    </p>
                  )}
                  {selectedBarangay.properties.status_and_recommendation.report_based.recommendation && (
                    <p className=""><span className="font-bold">Recommendation: </span>
                      {selectedBarangay.properties.status_and_recommendation.report_based.recommendation}
                    </p>
                  )}
                  <hr className="border-t border-gray-200 my-2" />
                </>
            )}
            {/* Death Priority */}
            {selectedBarangay?.properties?.status_and_recommendation?.death_priority &&
              selectedBarangay.properties.status_and_recommendation.death_priority.status &&
              selectedBarangay.properties.status_and_recommendation.death_priority.status.trim() !== "" && (
                <>
                  <p className="font-bold text-primary mb-1 text-lg">Death Priority</p>
                  <p className=""><span className="font-bold">Status: </span>
                    {selectedBarangay.properties.status_and_recommendation.death_priority.status}
                  </p>
                  {selectedBarangay.properties.status_and_recommendation.death_priority.alert && (
                    <p className=""><span className="font-bold">Alert: </span>
                      {selectedBarangay.properties.status_and_recommendation.death_priority.alert}
                    </p>
                  )}
                  {selectedBarangay.properties.status_and_recommendation.death_priority.recommendation && (
                    <p className=""><span className="font-bold">Recommendation: </span>
                      {selectedBarangay.properties.status_and_recommendation.death_priority.recommendation}
                    </p>
                  )}
                  <hr className="border-t border-gray-200 my-2" />
                </>
            )}
            {/* Recent Reports */}
            <div>
              <p className="mt-1"><span className="font-bold">Recent Reports: </span></p>
              <div className="w-[80%] mx-auto mt-1">
                {recentReports.length > 0 ? (
                  recentReports.map((r, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div><Circle size={16} color="red" weight="fill" /></div>
                      <p><span className="font-semibold">{r.date}: </span> {r.count} new case{r.count > 1 ? 's' : ''}</p>
                    </div>
                  ))
                ) : (
                  // Only show 'No recent reports' if there is no Report-Based section
                  !(
                    selectedBarangay?.properties?.status_and_recommendation?.report_based &&
                    selectedBarangay.properties.status_and_recommendation.report_based.status &&
                    selectedBarangay.properties.status_and_recommendation.report_based.status.trim() !== ""
                  ) && (
                    <p className="text-gray-500 italic">No recent reports</p>
                  )
                )}
              </div>
            </div>
            <hr className="border-t border-gray-200 my-2" />
            {/* Interventions in Progress */}
            <p className=""><span className="text-primary font-bold text-lg">Interventions in Progress: </span>  </p>
            <div className="w-[80%] mx-auto mt-1">
              {interventionsInProgress && interventionsInProgress.length > 0 ? (
                interventionsInProgress.map((intervention) => (
                  <div key={intervention._id} className="flex gap-2 items-start mb-2">
                    <div className="text-success mt-[2px]">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p>
                        <span className="font-semibold">
                          {new Date(intervention.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric'
                          })}: 
                        </span> 
                        {' '+intervention.interventionType}
                      </p>
                      <p className="text-sm text-gray-600">
                        Personnel: {intervention.personnel}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-lg">No interventions in progress</p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            {/* <button className="bg-primary rounded-full text-white px-4 py-1 text-[11px] hover:bg-primary/80 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer">
              View Full Report
            </button> */}
          </div>
        </div>
        <div className="col-span-6 flex flex-col gap-2">
          <p className="text-[30px] text-base-content font-bold">Reports nearby</p>
          {nearbyReports.length > 0 ? (
            nearbyReports.map((report, index) => (
              <div key={index} className="flex flex-col items-start bg-white rounded-2xl p-4 text-black gap-2 w-full">
                <p className={`${
                  report.report_type === "Breeding Site" ? "bg-info" :
                  report.report_type === "Standing Water" ? "bg-warning" :
                  "bg-error"
                } rounded-2xl px-3 py-2 font-semibold text-white mb-1`}>
                  {report.barangay} - {report.report_type}
                </p>
                <p>
                  <span className="font-bold ml-1.5">Distance: </span>
                  {(report.distance * 1000).toFixed(0)}m away
                </p>
                <p>
                  <span className="font-bold ml-1.5">Reported: </span>
                  {new Date(report.date_and_time).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <div className="flex gap-2 items-start w-full">
                  <div className={`shrink-0 mt-1 ${
                    report.report_type === "Breeding Site" ? "text-info" :
                    report.report_type === "Standing Water" ? "text-warning" :
                    "text-error"
                  }`}>
                    <Circle size={16} weight="fill" />
                  </div>
                  <p
                    className="flex-1 min-w-0 overflow-hidden break-words"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-word',
                    }}
                  >
                    {report.description}
                  </p>
                </div>
                <div className="flex justify-end w-full gap-2">
                  <button 
                    onClick={() => handleShowOnMap(report, 'report')}
                    className="bg-info rounded-full text-white px-4 py-1 text-[11px] hover:bg-info/80 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    Show on Map
                  </button>
                  <button 
                    onClick={() => handleViewFullReport(report)}
                    className="bg-primary rounded-full text-white px-4 py-1 text-[11px] hover:bg-primary/80 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    View Full Report
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
      <dialog ref={modalRef} className="modal transition-transform duration-300 ease-in-out">
        <div className="modal-box bg-white rounded-3xl shadow-2xl w-9/12 max-w-4xl p-12 relative">
          <button
            className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => setShowFullReport(false)}
          >
            ✕
          </button>

          <p className="text-center text-3xl font-bold mb-6">Full Report Details</p>
          <p className="text-left text-2xl font-bold mb-6">Report Details</p>
          <hr className="text-accent/50 mb-6" />

          <div className="space-y-2">
            {/* Report Type Badge */}
            <div className={`inline-block rounded-full px-4 py-2 text-white ${
              selectedFullReport?.report_type === "Breeding Site" ? "bg-info" :
              selectedFullReport?.report_type === "Standing Water" ? "bg-warning" :
              "bg-error"
            }`}>
              {selectedFullReport?.report_type}
            </div>

            {/* Location Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold mb-2 text-xl">Location Details</p>
              <p><span className="font-medium">Barangay:</span> {selectedFullReport?.barangay}</p>
              <p><span className="font-medium">Coordinates:</span> {selectedFullReport?.specific_location.coordinates.join(', ')}</p>
            </div>

            {/* Report Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold mb-2 text-xl">Report Details</p>
              <p><span className="font-medium">Reported by:</span> {selectedFullReport?.user?.username}</p>
              <p><span className="font-medium">Date and Time:</span> {new Date(selectedFullReport?.date_and_time).toLocaleString()}</p>
              <p><span className="font-medium">Status:</span> {selectedFullReport?.status}</p>
              <p><span className="font-medium">Description:</span> {selectedFullReport?.description}</p>
            </div>

            {/* Images Section */}
            {selectedFullReport?.images && selectedFullReport.images.length > 0 && (
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
                    handleShowOnMap(selectedFullReport, 'report');
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
          {selectedFullReport?.images && selectedFullReport.images.length > 0 && (
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
            <p className="text-gray-600 mb-2">Upload a CSV file containing dengue case data.</p>
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
            
            {importError && (
              <p className="text-error mt-2">{importError}</p>
            )}
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
