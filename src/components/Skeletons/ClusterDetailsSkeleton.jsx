import React from "react";

const ClusterDetailsSkeleton = ({ open = true, onClose = () => {} }) => {
  if (!open) return null;

  return (
    <dialog id="cluster-details-skeleton" className="modal" open={open}>
      <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-7xl p-0 max-h-[95vh] overflow-hidden">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="skeleton h-6 w-6 rounded-full" />
            <div>
              <div className="skeleton h-6 w-64 mb-2" />
              <div className="skeleton h-4 w-40" />
            </div>
          </div>
          <form method="dialog">
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={onClose}
            >
              ✕
            </button>
          </form>
        </div>

        {/* Summary Bar Skeleton (neutral) */}
        <div className="bg-gray-100 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="stat">
                  <div className="skeleton h-3 w-24 mb-2" />
                  <div className="skeleton h-6 w-12" />
                </div>
              ))}
            </div>
            <div className="skeleton h-8 w-64 rounded" />
          </div>
        </div>

        <div className="flex h-[calc(95vh-200px)]">
          {/* Left Panel Skeleton */}
          <div className="w-2/3 border-r border-gray-200 overflow-y-auto bg-r">
            <div className="p-6">
              <div className="skeleton h-5 w-40 mb-4" />
              <div className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <div
                    key={idx}
                    className="card bg-base-100 border border-gray-100 shadow-sm border-2"
                  >
                    <div className="card-body p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="skeleton h-4 w-4 rounded-full" />
                          <div>
                            <div className="skeleton h-4 w-40 mb-2" />
                            <div className="skeleton h-3 w-64" />
                          </div>
                        </div>
                        <div className="skeleton h-5 w-20" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="skeleton h-4 w-28" />
                        <div className="skeleton h-4 w-32" />
                        <div className="col-span-2 skeleton h-4 w-72" />
                      </div>
                      <div className="flex gap-2">
                        <div className="skeleton h-8 w-24" />
                        <div className="skeleton h-8 w-24" />
                        <div className="skeleton h-8 w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel Skeleton */}
          <div className="w-1/3 p-6 overflow-y-auto">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="card bg-base-100 shadow-md mb-6">
                <div className="card-body">
                  <div className="skeleton h-5 w-40 mb-3" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-5/6" />
                    <div className="skeleton h-4 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default ClusterDetailsSkeleton;
