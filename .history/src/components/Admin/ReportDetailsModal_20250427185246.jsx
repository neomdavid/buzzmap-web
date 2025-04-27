import React, { useState, useEffect, useRef } from "react";

const ReportDetailsModal = ({
  reportId,
  barangay,
  location,
  description,
  reportType,
  status,
  dateAndTime,
  images,
  coordinates,
  onClose,
  onVerify,
  onReject,
}) => {
  const modalRef = useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Open the modal
  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.showModal();
    }
  }, []);

  const handleVerify = () => {
    onVerify(reportId); // Call the verify function passed via props
    setShowConfirmation(false); // Hide the confirmation dialog
    onClose(); // Close the modal after action
  };

  const handleReject = () => {
    onReject(reportId); // Call the reject function passed via props
    setShowConfirmation(false); // Hide the confirmation dialog
    onClose(); // Close the modal after action
  };

  return (
    <dialog
      id="reportModal"
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
    >
      <div className="modal-box bg-white rounded-lg shadow-2xl max-w-4xl p-8 relative">
        {/* Close button for the modal */}
        <button
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Modal content */}
        <h3 className="font-bold text-2xl text-center text-primary mb-4">
          Report Details
        </h3>

        <div className="space-y-6">
          {/* Report Details */}
          <div className="space-y-2 bg-gray-100 p-4 rounded-lg">
            <p>
              <span className="font-semibold text-gray-700">Report ID:</span>{" "}
              {reportId}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Barangay:</span>{" "}
              {barangay}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Coordinates:</span>{" "}
              {coordinates[0]}, {coordinates[1]}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Description:</span>{" "}
              {description}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Report Type:</span>{" "}
              {reportType}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Status:</span>{" "}
              {status}
            </p>
            <p>
              <span className="font-semibold text-gray-700">
                Date and Time:
              </span>{" "}
              {new Date(dateAndTime).toLocaleDateString("en-US", {
                weekday: "long", // Full day of the week (e.g., Monday)
                year: "numeric", // Full year (e.g., 2025)
                month: "long", // Full month name (e.g., April)
                day: "numeric", // Day of the month (e.g., 27)
              })}
              {" at "}
              {new Date(dateAndTime).toLocaleTimeString("en-US", {
                hour: "2-digit", // Hour (e.g., 3)
                minute: "2-digit", // Minute (e.g., 58)
                second: "2-digit", // Second (e.g., 00)
                hour12: true, // 12-hour format (AM/PM)
              })}
            </p>
          </div>

          {/* Image Gallery */}
          {images && images.length > 0 && (
            <div className="text-black flex flex-col">
              <p className="font-semibold text-lg mb-2 text-gray-700">
                Photo Evidence:
              </p>
              <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="rounded-md overflow-hidden shadow-lg"
                  >
                    <img
                      src={`http://localhost:4000/${image.replace(/\\/g, "/")}`} // Correct the URL
                      alt={`Report image ${index + 1}`}
                      className="w-full h-auto rounded-md transition-transform transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show confirmation prompt if required */}
          {showConfirmation && (
            <div className="mt-4">
              <p className="text-lg font-semibold text-gray-800">
                Are you sure you want to verify/reject this report?
              </p>
              <div className="mt-2 flex gap-4">
                <button className="btn btn-success" onClick={handleVerify}>
                  Verify
                </button>
                <button className="btn btn-error" onClick={handleReject}>
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Trigger the confirmation dialog if necessary */}
          {!showConfirmation && (
            <div className="mt-4">
              <button
                className="btn btn-warning w-full"
                onClick={() => setShowConfirmation(true)}
              >
                Verify / Reject Report
              </button>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default ReportDetailsModal;
