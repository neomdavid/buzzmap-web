import React from "react";

const MainReportModal = ({
  modalRef,
  showFullReport,
  setShowFullReport,
  selectedFullReport,
  isFetchingFullReport,
  openStreetViewModal,
  handleShowOnMap,
}) => {
  return (
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
          {isFetchingFullReport && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="loading loading-spinner loading-sm" />
              <span>Loading full report…</span>
            </div>
          )}
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
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default MainReportModal;
