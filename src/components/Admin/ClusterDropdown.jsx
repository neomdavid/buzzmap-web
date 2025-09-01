import React from 'react';
import { Megaphone, CaretDown } from "phosphor-react";

const ClusterDropdown = ({
  showClusterDropdown,
  setShowClusterDropdown,
  flaggedClusters,
  isLoadingClusters,
  zoomToCluster,
  handleViewClusterDetails,
  getSeverityColor,
  formatDateRange
}) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowClusterDropdown((s) => !s)}
        className="flex items-center gap-2 bg-error text-white font-bold border border-error py-2 pl-3 pr-2 text-sm rounded-full shadow hover:brightness-95 active:brightness-90 transition"
        disabled={isLoadingClusters}
      >
        <Megaphone weight="fill" />
        {isLoadingClusters ? (
          <span>Loading clusters...</span>
        ) : flaggedClusters.length > 0 ? (
          <span>
            {flaggedClusters.length} cluster
            {flaggedClusters.length > 1 ? "s" : ""} reported
          </span>
        ) : (
          <span>No active clusters</span>
        )}
        <span className="bg-white/20 rounded-full p-0.5">
          <CaretDown size={12} />
        </span>
      </button>

      {showClusterDropdown && (
        <div className="absolute right-0 mt-2 w-80 z-50 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-3 py-2 text-md text-gray-600 font-bold border-b">
            Detected Clusters
          </div>
          {isLoadingClusters ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              <div className="loading loading-spinner loading-md"></div>
              <p className="mt-2">Loading clusters...</p>
            </div>
          ) : flaggedClusters.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No clusters detected in the selected timeframe.
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {flaggedClusters.map((c) => (
                <li
                  key={c.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3"
                  onClick={() => zoomToCluster(c)}
                >
                  <div
                    className="mt-1 h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getSeverityColor(c.severity) }}
                    title={c.severity}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-primary truncate">
                        {c.barangays[0]}
                      </p>
                      <span className="text-xs font-bold text-white bg-primary px-2 py-0.5 rounded-full">
                        {c.count}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDateRange(c.earliestReportAt, c.latestReportAt)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          zoomToCluster(c);
                        }}
                        className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/80 transition-colors"
                      >
                        Show on Map
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClusterDetails(c);
                        }}
                        className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ClusterDropdown;
