import React, { useState } from "react";
import { useRemoveReportsFromSubClusterMutation } from "@/api/dengueApi";
import { toast } from "react-toastify";
import { CheckCircle, X, MapPinLine } from "phosphor-react";

const SubClusterEditModal = ({
  isOpen,
  onClose,
  subCluster,
  onReportRemoved,
  mapOnlyRef,
  highlightReportMarker,
}) => {
  const [removingReportId, setRemovingReportId] = useState(null);
  const [removeReportsFromSubCluster, { isLoading: isRemoving }] =
    useRemoveReportsFromSubClusterMutation();

  if (!isOpen || !subCluster) return null;

  const subClusterReports = subCluster.reports || [];
  const subClusterId = subCluster._id || subCluster.id;

  const handleRemoveReport = async (reportId) => {
    try {
      setRemovingReportId(reportId);

      const response = await removeReportsFromSubCluster({
        subClusterId,
        reportIds: [reportId],
        resetStatus: false,
      }).unwrap();

      toast.success("Report removed from sub-cluster successfully");

      // Call the callback to update parent component
      if (onReportRemoved) {
        onReportRemoved(subClusterId, reportId);
      }
    } catch (error) {
      console.error("Failed to remove report from sub-cluster:", error);
      const msg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Request failed";
      toast.error(`Failed to remove report: ${msg}`);
    } finally {
      setRemovingReportId(null);
    }
  };

  const handleViewOnMap = (report) => {
    const reportCoordinates =
      report.specific_location?.coordinates || report.coordinates;
    const reportId = report._id || report.id;

    if (mapOnlyRef.current && reportCoordinates) {
      // Handle both coordinate formats
      if (Array.isArray(reportCoordinates)) {
        // New format: [lng, lat]
        mapOnlyRef.current.panTo({
          lng: reportCoordinates[0],
          lat: reportCoordinates[1],
        });
      } else if (reportCoordinates.lat && reportCoordinates.lng) {
        // Old format: {lat, lng}
        mapOnlyRef.current.panTo(reportCoordinates);
      }
      mapOnlyRef.current.setZoom(18);

      // Highlight the specific report marker
      if (highlightReportMarker) {
        highlightReportMarker(reportId);
      }
    }
  };

  return (
    <dialog open={isOpen} className="modal">
      <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-4xl p-6 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-primary">
              Edit Sub-cluster
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {subClusterReports.length} reports • ID: {subClusterId}
            </p>
          </div>
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Reports List */}
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {subClusterReports.map((report) => {
              const reportId = report._id || report.id;
              const reportType = report.report_type || report.type;
              const reportDescription = report.description || "";
              const reportDate = report.date_and_time || report.date;
              const reportCoordinates =
                report.specific_location?.coordinates || report.coordinates;

              return (
                <div
                  key={reportId}
                  className="card shadow-sm border border-gray-200 bg-base-100"
                >
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-primary badge-sm">
                            {reportType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(reportDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {reportDescription || "No description"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>ID: {reportId}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOnMap(report)}
                          className="btn btn-outline btn-primary btn-sm"
                          disabled={!reportCoordinates}
                        >
                          <MapPinLine size={14} />
                          View on Map
                        </button>
                        <button
                          onClick={() => handleRemoveReport(reportId)}
                          className="btn btn-error btn-sm"
                          disabled={isRemoving && removingReportId === reportId}
                        >
                          {isRemoving && removingReportId === reportId ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Removing...
                            </>
                          ) : (
                            "Remove"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default SubClusterEditModal;
