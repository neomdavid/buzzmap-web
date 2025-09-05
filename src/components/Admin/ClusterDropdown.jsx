import React from "react";
import { Megaphone, CaretDown } from "phosphor-react";

const ClusterDropdown = ({
  showClusterDropdown,
  setShowClusterDropdown,
  flaggedClusters,
  pendingClusters,
  partiallyResolvedClusters,
  fullyResolvedClusters,
  isLoadingClusters,
  zoomToCluster,
  handleViewClusterDetails,
  getSeverityColor,
  getClusterStatus,
  getClusterStatusColor,
  formatDateRange,
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
          <span className="flex items-center gap-2">
            <span className="loading loading-spinner loading-xs"></span>
            <span className="sr-only">Loading</span>
          </span>
        ) : (
          (() => {
            const activeCount =
              pendingClusters.length + partiallyResolvedClusters.length;
            if (activeCount > 0) {
              return (
                <span>{`${activeCount} ${
                  activeCount === 1 ? "cluster" : "clusters"
                }`}</span>
              );
            }
            return <span>No active clusters</span>;
          })()
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
            <div className="max-h-96 overflow-y-auto px-3 py-3">
              {/* Skeleton groups */}
              <div className="mb-3">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                  <div className="skeleton h-4 w-40" />
                </div>
                <ul>
                  {[...Array(3)].map((_, idx) => (
                    <li key={idx} className="px-4 py-3 flex items-start gap-3">
                      <div className="skeleton h-3 w-3 rounded-full mt-1" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="skeleton h-4 w-36" />
                          <div className="skeleton h-4 w-10 rounded-full" />
                        </div>
                        <div className="skeleton h-3 w-40 mt-2" />
                        <div className="flex gap-2 mt-2">
                          <div className="skeleton h-6 w-24 rounded" />
                          <div className="skeleton h-6 w-24 rounded" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-3">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                  <div className="skeleton h-4 w-44" />
                </div>
                <ul>
                  {[...Array(2)].map((_, idx) => (
                    <li key={idx} className="px-4 py-3 flex items-start gap-3">
                      <div className="skeleton h-3 w-3 rounded-full mt-1" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="skeleton h-4 w-32" />
                          <div className="skeleton h-4 w-10 rounded-full" />
                        </div>
                        <div className="skeleton h-3 w-36 mt-2" />
                        <div className="skeleton h-6 w-28 mt-2 rounded" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : flaggedClusters.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No clusters detected in the selected timeframe.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {/* Pending Clusters */}
              {pendingClusters.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-sm font-semibold text-red-700">
                    🔴 Pending Resolution ({pendingClusters.length})
                  </div>
                  <ul>
                    {pendingClusters.map((c) => (
                      <li
                        key={c.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3"
                        onClick={() => zoomToCluster(c)}
                      >
                        <div
                          className="mt-1 h-3 w-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: getClusterStatusColor(
                              getClusterStatus(c)
                            ),
                          }}
                          title={getClusterStatus(c)}
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
                            {formatDateRange(
                              c.earliestReportAt,
                              c.latestReportAt
                            )}
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
                </div>
              )}

              {/* Partially Resolved Clusters */}
              {partiallyResolvedClusters.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-sm font-semibold text-yellow-700">
                    🟡 Partially Resolved ({partiallyResolvedClusters.length})
                  </div>
                  <ul>
                    {partiallyResolvedClusters.map((c) => (
                      <li
                        key={c.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3"
                        onClick={() => zoomToCluster(c)}
                      >
                        <div
                          className="mt-1 h-3 w-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: getClusterStatusColor(
                              getClusterStatus(c)
                            ),
                          }}
                          title={getClusterStatus(c)}
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
                            {formatDateRange(
                              c.earliestReportAt,
                              c.latestReportAt
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
                              {c.processedCount} resolved, {c.unprocessedCount}{" "}
                              pending
                            </span>
                          </div>
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
                </div>
              )}

              {/* Fully Resolved Clusters */}
              {fullyResolvedClusters.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-green-50 border-b border-green-200 text-sm font-semibold text-green-700">
                    🟢 Fully Resolved ({fullyResolvedClusters.length})
                  </div>
                  <ul>
                    {fullyResolvedClusters.map((c) => (
                      <li
                        key={c.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3"
                        onClick={() => zoomToCluster(c)}
                      >
                        <div
                          className="mt-1 h-3 w-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: getClusterStatusColor(
                              getClusterStatus(c)
                            ),
                          }}
                          title={getClusterStatus(c)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-primary truncate">
                              {c.barangays[0]}
                            </p>
                            <span className="text-xs font-bold text-white bg-green-600 px-2 py-0.5 rounded-full">
                              {c.count}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {formatDateRange(
                              c.earliestReportAt,
                              c.latestReportAt
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                              All {c.processedCount} reports resolved
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                zoomToCluster(c);
                              }}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
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
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClusterDropdown;
