import React, { useState, useEffect } from "react";
import {
  useRemoveReportsFromClusterMutation,
  useResolveReportsMutation,
} from "@/api/dengueApi";
import { toast } from "react-toastify";
import { CheckCircle, Circle, MapPinLine, Hourglass } from "phosphor-react";
import ImageExpansionModal from "../ImageExpansionModal";

const ClusterDetailsModal = ({
  showClusterDetailsModal,
  selectedCluster,
  setShowClusterDetailsModal,
  getSeverityColor,
  formatDateRange,
  getReportTypeColor,
  selectedReports,
  resolvedReports,
  rejectedReports,
  pendingRejections,
  handleReportSelection,
  handleClusterResolution,
  openBulkConfirm,
  getSelectedReportsCount,
  getUnselectedReportsCount,
  getRejectedReportsCount,
  getResolvedReportsCount,
  hasResolvedReports,
  mapOnlyRef,
  highlightReportMarker,
  canFormSubCluster,
  getRemainingReports,
  refetchSpecificCluster,
  refetchGroupedReports,
  refetchClusters,
}) => {
  if (!showClusterDetailsModal || !selectedCluster) return null;

  // Handle both old and new API response structures
  const clusterData = selectedCluster.data || selectedCluster;
  const reports = clusterData.reports || [];

  // Local UI-only state: pending remove confirmations and removed report ids
  const [pendingRemovals, setPendingRemovals] = useState([]);
  const [removedReportIds, setRemovedReportIds] = useState([]);
  const [removingId, setRemovingId] = useState(null);
  const [removeReportsFromCluster, { isLoading: isRemoving }] =
    useRemoveReportsFromClusterMutation();
  const [resolveReports, { isLoading: isResolving }] =
    useResolveReportsMutation();

  // Image expansion modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Address geocoding state
  const [reportAddresses, setReportAddresses] = useState({});

  // Geocode addresses when modal opens and reports are available
  useEffect(() => {
    if (showClusterDetailsModal && reports.length > 0) {
      reports.forEach((report) => {
        const reportId = report._id || report.id;
        const coordinates =
          report.specific_location?.coordinates || report.coordinates;

        if (
          coordinates &&
          coordinates.length === 2 &&
          !reportAddresses[reportId]
        ) {
          geocodeCoordinates(coordinates, reportId);
        }
      });
    }
  }, [showClusterDetailsModal, reports]);

  const isPendingRemoval = (id) => pendingRemovals.includes(id);
  const isLocallyRemoved = (id) => removedReportIds.includes(id);

  // Image expansion modal handlers
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Geocode coordinates to address
  const geocodeCoordinates = (coordinates, reportId) => {
    if (
      !coordinates ||
      coordinates.length !== 2 ||
      !window.google?.maps?.Geocoder
    ) {
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const latLng = new window.google.maps.LatLng(
      coordinates[1], // latitude
      coordinates[0] // longitude
    );

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        // Get a cleaner address by removing city and country parts
        const formattedAddress = results[0].formatted_address;
        const addressParts = formattedAddress.split(",");

        // Remove the last 2 parts (usually city and country) to get a more specific address
        const specificAddress = addressParts.slice(0, -2).join(",").trim();

        setReportAddresses((prev) => ({
          ...prev,
          [reportId]: specificAddress || formattedAddress,
        }));
      } else {
        setReportAddresses((prev) => ({
          ...prev,
          [reportId]: "Address not found",
        }));
      }
    });
  };

  const requestRemoveFromCluster = (id) => {
    if (!isPendingRemoval(id)) setPendingRemovals((prev) => [...prev, id]);
  };

  const cancelRemoveFromCluster = (id) => {
    setPendingRemovals((prev) => prev.filter((x) => x !== id));
  };

  const confirmRemoveFromCluster = async (id) => {
    try {
      setRemovingId(id);
      const response = await removeReportsFromCluster({
        clusterId,
        reportIds: [id],
        permanentlyExclude: true,
        resetStatus: false,
      }).unwrap();
      toast.success(
        response?.message || "Report removed from cluster successfully"
      );

      // Optimistically update local UI while data refetches
      setRemovedReportIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setPendingRemovals((prev) => prev.filter((x) => x !== id));
      if (selectedReports?.includes?.(id)) {
        handleReportSelection(id, "deselect");
      }
      if (typeof refetchSpecificCluster === "function") {
        refetchSpecificCluster();
      }
      if (typeof refetchGroupedReports === "function") {
        refetchGroupedReports();
      }
      if (typeof refetchClusters === "function") {
        refetchClusters();
      }
    } catch (error) {
      console.error("[Cluster] Failed to remove report from cluster:", error);
      const msg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Request failed";
      toast.error(`Failed to remove: ${msg}`);
      // Keep pending state so user can retry or cancel
    } finally {
      setRemovingId(null);
    }
  };

  const markResolved = async (id) => {
    try {
      await resolveReports({
        clusterId,
        reportIds: [id],
        isResolved: true,
      }).unwrap();
      toast.success("Marked as resolved");
      if (selectedReports?.includes?.(id)) {
        handleReportSelection(id, "deselect");
      }
      if (typeof refetchSpecificCluster === "function") {
        refetchSpecificCluster();
      }
      if (typeof refetchGroupedReports === "function") {
        refetchGroupedReports();
      }
      if (typeof refetchClusters === "function") {
        refetchClusters();
      }
    } catch (error) {
      const msg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Request failed";
      toast.error(`Failed to resolve: ${msg}`);
    }
  };

  // Helper: determine if a report is removed from cluster (local or backend)
  const isReportRemoved = (report) => {
    const id = report._id || report.id;
    return isLocallyRemoved(id) || report.exclude_from_clustering === true;
  };
  // Keep showing all reports; visually mark removed ones and disable actions
  const effectiveReports = reports;
  const dateRange = clusterData.date_range || {};
  const barangay =
    clusterData.barangay || clusterData.barangays?.[0] || "Unknown";
  const clusterId = clusterData._id || clusterData.id;
  const severity = clusterData.severity || "medium";

  // Debug: Log the actual date values to see what we're working with
  console.log("ClusterDetailsModal - Debug date values:", {
    dateRange,
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    clusterData: clusterData,
    selectedCluster: selectedCluster,
  });

  // Debug: Log individual report dates
  console.log(
    "ClusterDetailsModal - Individual report dates:",
    reports.map((r) => ({
      id: r._id || r.id,
      date_and_time: r.date_and_time,
      date: r.date,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      allDateFields: Object.keys(r).filter((key) =>
        key.toLowerCase().includes("date")
      ),
    }))
  );

  // Alternative: Calculate date range from individual reports if date_range is not reliable
  const calculateDateRangeFromReports = () => {
    if (!reports || reports.length === 0)
      return { start_date: null, end_date: null };

    // Helper function to parse date strings more reliably (same as formatDateRange)
    const parseDate = (dateString) => {
      if (!dateString) return null;

      // Handle the specific format "10/3/2025, 8:30:01 AM"
      if (typeof dateString === "string" && dateString.includes(",")) {
        // Split by comma to separate date and time
        const [datePart, timePart] = dateString.split(",");
        if (datePart && timePart) {
          // Parse the date part (M/D/YYYY format)
          const [month, day, year] = datePart.trim().split("/");
          if (month && day && year) {
            // Create date with explicit month/day/year (month is 0-indexed)
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
        }
      }

      // Fallback to standard Date parsing
      return new Date(dateString);
    };

    const dates = reports
      .map((r) => r.date_and_time || r.date)
      .filter(Boolean)
      .map((d) => parseDate(d))
      .filter((d) => d && !isNaN(d.getTime()));

    if (dates.length === 0) return { start_date: null, end_date: null };

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    console.log("ClusterDetailsModal - Calculated date range from reports:", {
      minDate: minDate.toISOString(),
      maxDate: maxDate.toISOString(),
      minDateFormatted: minDate.toLocaleDateString(),
      maxDateFormatted: maxDate.toLocaleDateString(),
    });

    return {
      start_date: minDate.toISOString(),
      end_date: maxDate.toISOString(),
    };
  };

  // Use calculated date range instead of potentially unreliable API date_range
  const finalDateRange = calculateDateRangeFromReports();

  // Check if cluster is resolved (no unprocessed reports)
  const breakdown = clusterData.breakdown || {};
  const totalReportsCount = Array.isArray(reports) ? reports.length : 0;
  const unprocessedCount =
    clusterData.unprocessed_count !== undefined
      ? clusterData.unprocessed_count
      : Math.max(
          0,
          totalReportsCount -
            ((breakdown.validated_reports || 0) +
              (breakdown.rejected_reports || 0) +
              (breakdown.resolved_reports || 0) +
              (breakdown.excluded_reports || 0))
        );
  // Treat "processed" as actually resolved within the cluster
  const resolvedCount =
    breakdown.resolved_reports !== undefined
      ? breakdown.resolved_reports
      : reports.filter((r) => r?.isResolved === true).length;

  // Individual validation/rejection no longer used in modal

  // Cluster is resolved when all reports are processed at cluster level (no unprocessed)
  const totalProcessedCount = resolvedCount;
  const isClusterResolved =
    resolvedCount === totalReportsCount && totalReportsCount > 0;

  // Derived counts for summary
  const selectableReportIds = new Set(
    effectiveReports
      .filter((r) => !isReportRemoved(r))
      .map((r) => r._id || r.id)
      .filter((id) => id)
  );
  const localSelectedCount = selectedReports.filter((id) =>
    selectableReportIds.has(id)
  ).length;
  const localRejectedCount = rejectedReports.filter((id) =>
    selectableReportIds.has(id)
  ).length;
  const localResolvedCount = resolvedReports.filter((id) =>
    selectableReportIds.has(id)
  ).length;

  const localUnselectedCount = Math.max(
    0,
    selectableReportIds.size -
      localSelectedCount -
      localRejectedCount -
      localResolvedCount
  );

  // Precompute IDs eligible for resolve-all (exclude removed & validated sub-cluster)
  const resolveAllIds = Array.from(selectableReportIds);
  const isClusterTooSmall = resolveAllIds.length <= 1 && !isClusterResolved;

  return (
    <dialog
      id="cluster-verification-modal"
      className="modal z-[1000]"
      open={showClusterDetailsModal}
    >
      <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-7xl p-0 max-h-[95vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isClusterResolved ? (
                <CheckCircle size={24} className="text-success" />
              ) : (
                <Hourglass size={24} className="text-warning" />
              )}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-primary">
                Cluster Verification: {barangay}
              </p>
              <p className="text-sm text-gray-600">
                {effectiveReports.length} reports •{" "}
                {finalDateRange.start_date && finalDateRange.end_date
                  ? formatDateRange(
                      finalDateRange.start_date,
                      finalDateRange.end_date
                    )
                  : "Date range unavailable"}
              </p>
            </div>
          </div>
          <form method="dialog">
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => setShowClusterDetailsModal(false)}
            >
              ✕
            </button>
          </form>
        </div>

        {/* Verification Summary Bar */}
        <div className="bg-info/10 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="stat">
                <div className="stat-title text-sm">Total Reports</div>
                <div className="stat-value text-2xl">{reports.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title text-sm">Resolved Reports</div>
                <div className="stat-value text-2xl text-success">
                  {resolvedCount}
                </div>
              </div>
              {/* Removed individual selected/unselected stats */}
            </div>
            {isClusterResolved ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-2 px-4 py-2 bg-success text-white font-medium rounded-lg ">
                  <CheckCircle size={16} weight="fill" />
                  <p className="font-bold">
                    Cluster Resolved
                    <span className="font-normal">
                      {" "}
                      ({totalProcessedCount} reports processed)
                    </span>
                  </p>
                </div>
              </div>
            ) : isClusterTooSmall ? (
              <div className="w-full">
                <div className="px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm">
                  This cluster now contains only one report and is no longer
                  considered a cluster. No further actions are available here.
                </div>
              </div>
            ) : !hasResolvedReports() ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleClusterResolution("resolve-selected");
                  }}
                  className="btn btn-success btn-sm"
                  disabled={localSelectedCount === 0}
                >
                  <CheckCircle size={16} />
                  Resolve Selected ({localSelectedCount})
                </button>
                {resolveAllIds.length >= 2 && (
                  <button
                    onClick={() => {
                      openBulkConfirm("resolve-all");
                    }}
                    className="btn btn-primary btn-sm"
                    disabled={resolveAllIds.length === 0}
                  >
                    <CheckCircle size={16} />
                    Resolve All ({resolveAllIds.length})
                  </button>
                )}
                {resolveAllIds.length === 1 && (
                  <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm">
                    This cluster now contains only one report and is no longer
                    considered a cluster.
                  </div>
                )}
                {/* Reject All removed per updated flow */}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="badge badge-success badge-lg">
                  <CheckCircle size={16} />
                  {getResolvedReportsCount()} Reports Resolved
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex h-[calc(95vh-200px)]">
          {/* Left Panel - Reports List */}
          <div className="w-2/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <p className="text-lg font-bold text-primary mb-4">
                Reports to Select
              </p>
              <div className="space-y-4">
                {reports.map((report) => {
                  // Handle both old and new report structures
                  const reportId = report._id || report.id;
                  const reportType = report.report_type || report.type;
                  const reportDescription =
                    report.description || report.desc || report.content || "";
                  const reportDate = report.date_and_time || report.date;

                  const reportStatus = report.status || "Pending";
                  const reportImages = report.images || [];
                  const reportLocation =
                    report.barangay || report.location || "";
                  const reportCoordinates =
                    report.specific_location?.coordinates || report.coordinates;
                  const isAnonymous = report.isAnonymous || false;
                  const reportedBy = isAnonymous
                    ? "Anonymous"
                    : report.user?.username || "User";

                  // Derived UI state
                  const isSelected = selectedReports.includes(reportId);
                  const isRemoved = isReportRemoved(report);
                  const isRejected =
                    rejectedReports.includes(reportId) ||
                    reportStatus === "Rejected";
                  const isValidated =
                    resolvedReports.includes(reportId) ||
                    reportStatus === "Validated";

                  const statusBadgeClass =
                    reportStatus === "Validated"
                      ? "badge-success"
                      : reportStatus === "Pending"
                      ? "badge-warning"
                      : reportStatus === "Rejected"
                      ? "badge-error"
                      : "badge-info";

                  return (
                    <div
                      key={reportId}
                      className={`card shadow-md border-2 transition-all relative ${
                        isRemoved
                          ? "border-gray-300 bg-gray-100 opacity-70"
                          : isSelected
                          ? "border-success bg-success/5"
                          : "border-base-300 hover:border-primary/50 bg-base-100"
                      }`}
                    >
                      <div className="card-body p-4">
                        {/* Selection Indicator - Fixed positioning */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          {isRemoved ? (
                            <div className="badge badge-ghost badge-sm">
                              Removed from Cluster
                            </div>
                          ) : isSelected ? (
                            <div className="badge badge-success badge-sm">
                              <CheckCircle size={12} />
                              Selected
                            </div>
                          ) : null}
                        </div>

                        {/* Report Header */}
                        <div className="flex items-start justify-between mb-3 pr-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-4 w-4 rounded-full ${
                                isRemoved
                                  ? "bg-gray-400"
                                  : isRejected
                                  ? "bg-error"
                                  : isValidated
                                  ? "bg-success"
                                  : "bg-warning"
                              }`}
                            />
                            <div>
                              <h4 className="font-semibold text-primary">
                                {reportType}
                              </h4>
                              {reportDescription && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {reportDescription}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Status badges moved to top-right corner */}
                          </div>
                        </div>

                        {/* Report Images */}
                        {reportImages && reportImages.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-2">
                              Reported Images:
                            </p>
                            <div className="flex gap-2 overflow-x-auto">
                              {reportImages.map((image, idx) => (
                                <img
                                  key={idx}
                                  src={image}
                                  alt={`Report ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleImageClick(image)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Report Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div>
                            <span className="text-gray-600">Reported by:</span>
                            <p className="font-medium">{reportedBy}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p className="font-medium">
                              {reportDate
                                ? new Date(reportDate).toLocaleString()
                                : "Date unavailable"}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Location:</span>
                            <p className="font-medium">
                              {reportAddresses[reportId] ? (
                                reportAddresses[reportId]
                              ) : reportCoordinates &&
                                reportCoordinates.length === 2 ? (
                                <span className="text-gray-500 italic">
                                  Loading address...
                                </span>
                              ) : (
                                reportLocation
                              )}
                            </p>
                          </div>
                          {reportDescription && (
                            <div className="col-span-2">
                              <span className="text-gray-600">
                                Description:
                              </span>
                              <p className="font-medium">{reportDescription}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {!isRemoved && !isClusterTooSmall && (
                            <>
                              {!rejectedReports.includes(reportId) && (
                                <>
                                  {/* Toggle select/unselect */}
                                  {!pendingRejections.includes(reportId) &&
                                    (() => {
                                      const isResolvedInCluster =
                                        report.isResolved === true;
                                      return (
                                        <button
                                          onClick={() => {
                                            if (!isResolvedInCluster) {
                                              handleReportSelection(
                                                reportId,
                                                isSelected
                                                  ? "deselect"
                                                  : "select"
                                              );
                                            }
                                          }}
                                          className={`btn btn-sm ${
                                            isResolvedInCluster
                                              ? "btn-disabled"
                                              : isSelected
                                              ? "btn-success"
                                              : "btn-outline btn-success"
                                          }`}
                                          disabled={isResolvedInCluster}
                                        >
                                          {isResolvedInCluster ? (
                                            "Resolved"
                                          ) : isSelected ? (
                                            <>
                                              <CheckCircle size={14} />
                                              Unselect
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle size={14} />
                                              Select
                                            </>
                                          )}
                                        </button>
                                      );
                                    })()}
                                  {/* Remove from cluster with inline confirm */}
                                  {pendingRemovals.includes(reportId) ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          confirmRemoveFromCluster(reportId)
                                        }
                                        className={`btn btn-warning btn-sm ${
                                          removingId === reportId
                                            ? "btn-disabled"
                                            : ""
                                        }`}
                                        disabled={removingId === reportId}
                                      >
                                        {removingId === reportId ? (
                                          <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            Removing...
                                          </>
                                        ) : (
                                          "Confirm Remove"
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          cancelRemoveFromCluster(reportId)
                                        }
                                        className="btn btn-outline btn-ghost btn-sm"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          requestRemoveFromCluster(reportId)
                                        }
                                        className="btn btn-outline btn-warning btn-sm"
                                      >
                                        Remove from Cluster
                                      </button>
                                      {report.isResolved !== true && (
                                        <button
                                          onClick={() => markResolved(reportId)}
                                          className={`btn btn-success btn-sm ${
                                            isResolving ? "btn-disabled" : ""
                                          }`}
                                          disabled={isResolving}
                                        >
                                          {isResolving ? (
                                            <>
                                              <span className="loading loading-spinner loading-xs"></span>
                                              Processing...
                                            </>
                                          ) : (
                                            "Mark Resolved"
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Unreject removed per updated design */}
                            </>
                          )}
                          {isClusterTooSmall && (
                            <div className="text-sm text-gray-600">
                              Actions have been disabled because this is no
                              longer a cluster.
                            </div>
                          )}

                          <button
                            onClick={() => {
                              if (mapOnlyRef.current && reportCoordinates) {
                                // Handle both coordinate formats
                                if (Array.isArray(reportCoordinates)) {
                                  // New format: [lng, lat]
                                  mapOnlyRef.current.panTo({
                                    lng: reportCoordinates[0],
                                    lat: reportCoordinates[1],
                                  });
                                } else if (
                                  reportCoordinates.lat &&
                                  reportCoordinates.lng
                                ) {
                                  // Old format: {lat, lng}
                                  mapOnlyRef.current.panTo(reportCoordinates);
                                }
                                mapOnlyRef.current.setZoom(32);

                                // Highlight the specific report marker
                                if (highlightReportMarker) {
                                  highlightReportMarker(reportId);
                                }
                              }
                              setShowClusterDetailsModal(false);
                            }}
                            className="btn btn-outline btn-primary btn-sm"
                            disabled={!reportCoordinates}
                          >
                            <MapPinLine size={14} />
                            View on Map
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Analysis View */}
          <div className="w-1/3 p-6 overflow-y-auto">
            <p className="text-lg font-bold text-primary mb-4">
              Cluster Analysis
            </p>

            {/* Resolution Summary */}
            {localSelectedCount > 0 && (
              <div className="card bg-success/10 border-success mb-6">
                <div className="card-body">
                  <h4 className="card-title text-success">
                    <CheckCircle size={20} />
                    Ready to Resolve
                  </h4>
                  <div className="text-sm">
                    <p className="mb-2">
                      <strong>{localSelectedCount}</strong> reports selected for
                      resolution
                    </p>
                    <p className="text-gray-600">
                      {localUnselectedCount} reports will remain pending
                    </p>
                    {canFormSubCluster() && (
                      <div className="mt-2 p-2 bg-info/10 rounded border border-info/20">
                        <p className="text-info text-xs">
                          <strong>Note:</strong> {getRemainingReports().length}{" "}
                          reports will form a new sub-cluster
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Status */}
            {!isClusterResolved && (
              <div className="card bg-warning/10 border-warning mb-6">
                <div className="card-body">
                  <h4 className="card-title text-warning">
                    <CheckCircle size={20} />
                    Resolution Status
                  </h4>
                  <div className="text-sm">
                    <p className="mb-2">
                      <strong>Active</strong> — {unprocessedCount} unprocessed{" "}
                      {unprocessedCount === 1 ? "report" : "reports"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cluster Summary */}
            <div className="card bg-base-100 shadow-md mb-6">
              <div className="card-body">
                <h4 className="card-title text-primary">Cluster Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Primary Type:</span>
                    <span className="font-semibold">
                      {reports[0]?.report_type || reports[0]?.type || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Period:</span>
                    <span className="font-semibold">
                      {finalDateRange.start_date && finalDateRange.end_date
                        ? formatDateRange(
                            finalDateRange.start_date,
                            finalDateRange.end_date
                          )
                        : "Date range unavailable"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-semibold ${
                        isClusterResolved ? "text-success" : "text-warning"
                      }`}
                    >
                      {isClusterResolved ? "Resolved" : "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unprocessed:</span>
                    <span className="font-semibold text-warning">
                      {unprocessedCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolved:</span>
                    <span className="font-semibold text-success">
                      {resolvedCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setShowClusterDetailsModal(false)}>close</button>
      </form>

      {/* Image Expansion Modal */}
      <ImageExpansionModal
        isOpen={showImageModal}
        onClose={handleCloseImageModal}
        image={selectedImage}
      />
    </dialog>
  );
};

export default ClusterDetailsModal;
