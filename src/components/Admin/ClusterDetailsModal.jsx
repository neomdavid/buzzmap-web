import React from "react";
import { CheckCircle, Circle, MapPinLine, Hourglass } from "phosphor-react";

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
  getSelectedReportsCount,
  getUnselectedReportsCount,
  getRejectedReportsCount,
  getResolvedReportsCount,
  hasResolvedReports,
  canFormSubCluster,
  getRemainingReports,
  subClusters,
  mapOnlyRef,
}) => {
  if (!showClusterDetailsModal || !selectedCluster) return null;

  // Handle both old and new API response structures
  const clusterData = selectedCluster.data || selectedCluster;
  const reports = clusterData.reports || [];
  const dateRange = clusterData.date_range || {};
  const barangay =
    clusterData.barangay || clusterData.barangays?.[0] || "Unknown";
  const clusterId = clusterData._id || clusterData.id;
  const subClustersData = clusterData.sub_clusters || subClusters || [];
  const severity = clusterData.severity || "medium";

  // Count of validated sub-clusters
  const validatedCount = subClustersData.filter(
    (sc) => sc.cluster_type === "validated"
  ).length;

  // Check if cluster is resolved (no unprocessed reports)
  const unprocessedReports = clusterData.unprocessed_reports || [];
  const unprocessedCount = clusterData.unprocessed_count || 0;
  const processedCount = clusterData.processed_count || 0;
  const isClusterResolved = unprocessedCount === 0 && processedCount > 0;

  // Create a set of report IDs that are already in validated sub-clusters
  const validatedSubClusterReportIds = new Set();
  subClustersData.forEach((subCluster) => {
    if (subCluster.cluster_type === "validated" && subCluster.reports) {
      subCluster.reports.forEach((reportId) => {
        validatedSubClusterReportIds.add(reportId);
      });
    }
  });

  // Helper function to check if a report is already in a validated sub-cluster
  const isReportInValidatedSubCluster = (reportId) => {
    return validatedSubClusterReportIds.has(reportId);
  };

  // Derived counts for summary (exclude reports already in validated sub-clusters)
  const selectableReportIds = new Set(
    reports
      .map((r) => r._id || r.id)
      .filter((id) => id && !isReportInValidatedSubCluster(id))
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

  return (
    <dialog
      id="cluster-verification-modal"
      className="modal"
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
                {reports.length} reports •{" "}
                {dateRange.start_date && dateRange.end_date
                  ? formatDateRange(dateRange.start_date, dateRange.end_date)
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
                <div className="stat-title text-sm">Selected</div>
                <div className="stat-value text-2xl text-success">
                  {localSelectedCount}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-sm">Unselected</div>
                <div className="stat-value text-2xl text-warning">
                  {localUnselectedCount}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-sm">Rejected</div>
                <div className="stat-value text-2xl text-error">
                  {localRejectedCount}
                </div>
              </div>
            </div>
            {isClusterResolved ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-2 px-4 py-2 bg-success text-white font-medium rounded-lg ">
                  <CheckCircle size={16} weight="fill" />
                  <p className="font-bold">
                    Cluster Resolved
                    <span className="font-normal">
                      {" "}
                      ({processedCount} reports processed)
                    </span>
                  </p>
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
                <button
                  onClick={() => {
                    handleClusterResolution("resolve-all");
                  }}
                  className="btn btn-primary btn-sm"
                  disabled={reports.length === 0}
                >
                  <CheckCircle size={16} />
                  Resolve All
                </button>
                <button
                  onClick={() => {
                    handleClusterResolution("reject-all");
                  }}
                  className="btn btn-error btn-sm"
                >
                  <Circle size={16} />
                  Reject All
                </button>
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
                  const reportDescription = report.description || "";
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
                    : report.user || "User";

                  return (
                    <div
                      key={reportId}
                      className={`card shadow-md border-2 transition-all relative ${
                        isReportInValidatedSubCluster(reportId)
                          ? "border-success bg-success/5 opacity-75"
                          : selectedReports.includes(reportId)
                          ? "border-success bg-success/5"
                          : "border-base-300 hover:border-primary/50 bg-base-100"
                      }`}
                    >
                      <div className="card-body p-4">
                        {/* Selection Indicator - Fixed positioning */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          {selectedReports.includes(reportId) &&
                            !isReportInValidatedSubCluster(reportId) && (
                              <div className="badge badge-success badge-sm">
                                <CheckCircle size={12} />
                                Selected
                              </div>
                            )}
                          {resolvedReports.includes(reportId) &&
                            !isReportInValidatedSubCluster(reportId) && (
                              <div className="badge badge-success badge-sm">
                                <CheckCircle size={12} />
                                Resolved
                              </div>
                            )}
                        </div>

                        {/* Report Header */}
                        <div className="flex items-start justify-between mb-3 pr-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{
                                backgroundColor: getReportTypeColor(reportType),
                              }}
                            />
                            <div>
                              <h4 className="font-semibold text-primary">
                                {reportType}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {reportDescription}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {rejectedReports.includes(reportId) && (
                              <span className="badge badge-error badge-sm">
                                Rejected
                              </span>
                            )}
                            <span
                              className={`badge badge-sm ${
                                reportStatus === "Validated"
                                  ? "badge-success"
                                  : reportStatus === "Pending"
                                  ? "badge-warning"
                                  : reportStatus === "Rejected"
                                  ? "badge-error"
                                  : "badge-info"
                              }`}
                            >
                              {reportStatus}
                            </span>
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
                                  onClick={() => {
                                    // TODO: Open image in full view
                                    console.log("View image:", image);
                                  }}
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
                            <p className="font-medium">{reportLocation}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {!isReportInValidatedSubCluster(reportId) && (
                            <>
                              {!rejectedReports.includes(reportId) &&
                                !resolvedReports.includes(reportId) && (
                                  <>
                                    <button
                                      onClick={() => {
                                        handleReportSelection(
                                          reportId,
                                          "select"
                                        );
                                      }}
                                      className={`btn btn-sm ${
                                        selectedReports.includes(reportId)
                                          ? "btn-success"
                                          : "btn-outline btn-success"
                                      }`}
                                    >
                                      {selectedReports.includes(reportId) ? (
                                        <>
                                          <CheckCircle size={14} />
                                          Selected
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle size={14} />
                                          Select
                                        </>
                                      )}
                                    </button>

                                    {pendingRejections.includes(reportId) ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleReportSelection(
                                              reportId,
                                              "confirm-reject"
                                            )
                                          }
                                          className="btn btn-error btn-sm"
                                        >
                                          <Circle size={14} />
                                          Confirm Reject
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleReportSelection(
                                              reportId,
                                              "cancel-reject"
                                            )
                                          }
                                          className="btn btn-outline btn-ghost btn-sm"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleReportSelection(
                                            reportId,
                                            "reject"
                                          )
                                        }
                                        className="btn btn-outline btn-error btn-sm"
                                      >
                                        <Circle size={14} />
                                        Reject
                                      </button>
                                    )}
                                  </>
                                )}

                              {rejectedReports.includes(reportId) && (
                                <button
                                  onClick={() =>
                                    handleReportSelection(reportId, "unreject")
                                  }
                                  className="btn btn-outline btn-warning btn-sm"
                                >
                                  <CheckCircle size={14} />
                                  Unreject
                                </button>
                              )}
                            </>
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
                                mapOnlyRef.current.setZoom(18);
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
            {subClustersData.length > 0 || !isClusterResolved ? (
              <div
                className={`card ${
                  isClusterResolved
                    ? "bg-success/10 border-success"
                    : "bg-warning/10 border-warning"
                } mb-6`}
              >
                <div className="card-body">
                  <h4
                    className={`card-title ${
                      isClusterResolved ? "text-success" : "text-warning"
                    }`}
                  >
                    <CheckCircle size={20} />
                    Resolution Status
                  </h4>
                  <div className="text-sm">
                    <p className="mb-2">
                      {isClusterResolved ? (
                        validatedCount >= 2 ? (
                          <>
                            <strong>Resolved</strong> with {validatedCount}{" "}
                            validated sub-clusters
                          </>
                        ) : validatedCount === 1 ? (
                          <>
                            <strong>Resolved</strong> as a cluster
                          </>
                        ) : (
                          <>
                            <strong>Resolved</strong> (no sub-clusters)
                          </>
                        )
                      ) : (
                        <>
                          <strong>Active</strong> — {unprocessedCount}{" "}
                          unprocessed{" "}
                          {unprocessedCount === 1 ? "report" : "reports"}
                        </>
                      )}
                    </p>

                    {validatedCount > 0 && (
                      <p className="text-gray-600">
                        Reports in validated sub-clusters are automatically
                        marked as resolved (green)
                      </p>
                    )}

                    {validatedSubClusterReportIds.size > 0 && (
                      <div className="mt-2 p-2 bg-success/10 rounded border border-success/20">
                        <p className="text-success text-xs">
                          <strong>Note:</strong> No action required for{" "}
                          {validatedSubClusterReportIds.size}{" "}
                          {validatedSubClusterReportIds.size === 1
                            ? "report"
                            : "reports"}{" "}
                          (already validated)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Similarity Analysis */}
            <div className="card bg-base-100 shadow-md mb-6">
              <div className="card-body">
                <h4 className="card-title text-primary">Similarity Analysis</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Location Proximity:</span>
                    <div className="flex items-center gap-2">
                      <progress
                        className="progress progress-success w-20"
                        value="85"
                        max="100"
                      ></progress>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Report Type Match:</span>
                    <div className="flex items-center gap-2">
                      <progress
                        className="progress progress-info w-20"
                        value="100"
                        max="100"
                      ></progress>
                      <span className="text-sm font-medium">100%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Time Proximity:</span>
                    <div className="flex items-center gap-2">
                      <progress
                        className="progress progress-warning w-20"
                        value="70"
                        max="100"
                      ></progress>
                      <span className="text-sm font-medium">70%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                      {dateRange.start_date && dateRange.end_date
                        ? formatDateRange(
                            dateRange.start_date,
                            dateRange.end_date
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
                    <span className="text-gray-600">Processed:</span>
                    <span className="font-semibold text-success">
                      {processedCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-clusters */}
            {subClustersData.length >= 2 && (
              <div className="card bg-base-100 shadow-md mb-6">
                <div className="card-body">
                  <h4 className="card-title text-primary">
                    Sub-clusters Created
                  </h4>
                  <div className="space-y-3">
                    {subClustersData.map((subCluster) => {
                      const subClusterId = subCluster._id || subCluster.id;
                      const subClusterReports = subCluster.reports || [];
                      const subClusterDateRange = subCluster.date_range || {};
                      const subClusterType =
                        subCluster.cluster_type || "Unknown";

                      return (
                        <div
                          key={subClusterId}
                          className="border rounded-lg p-3 bg-info/5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-sm">
                              {subClusterType} Sub-cluster
                            </h5>
                            <span className="badge badge-info badge-sm">
                              {subClusterReports.length} reports
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <p>Created from resolved reports</p>
                            <p>
                              Active:{" "}
                              {subClusterDateRange.start_date &&
                              subClusterDateRange.end_date
                                ? formatDateRange(
                                    subClusterDateRange.start_date,
                                    subClusterDateRange.end_date
                                  )
                                : "Date range unavailable"}
                            </p>
                            <p className="font-mono text-xs mt-1">
                              ID: {subClusterId}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              // TODO: Navigate to sub-cluster or open it in a new modal
                              console.log("View sub-cluster:", subCluster);
                            }}
                            className="btn btn-outline btn-primary btn-xs mt-2"
                          >
                            View Sub-cluster
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setShowClusterDetailsModal(false)}>close</button>
      </form>
    </dialog>
  );
};

export default ClusterDetailsModal;
