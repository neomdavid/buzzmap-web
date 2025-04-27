import React, { useEffect, useRef } from "react";

const ReportDetailsModal = ({
  reportId,
  barangay,
  location,
  description,
  reportType,
  status,
  dateAndTime,
  images,
  onClose,
}) => {
  const modalRef = useRef(null);

  // Open the modal
  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.showModal();
    }
  }, []);

  return (
    <dialog
      id="reportModal"
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
    >
      <div className="modal-box bg-white rounded-lg shadow-xl max-w-4xl p-8 relative">
        {/* Close button for the modal */}
        <button
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Modal content */}
        <h3 className="font-bold text-xl text-center mb-4 text-primary">
          Report Details
        </h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <p>
              <span className="font-semibold text-gray-700">Report ID:</span>{" "}
              {reportId}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Barangay:</span>{" "}
              {barangay}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Location:</span>{" "}
              {location}
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
              {new Date(dateAndTime).toLocaleString()}
            </p>
          </div>

          {/* Render images if any */}
          {images && images.length > 0 && (
            <div className="flex flex-col">
              <p className="font-semibold text-lg mb-2 text-gray-700">
                Photo Evidence:
              </p>
              <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="rounded-md overflow-hidden">
                    <img
                      src={`http://localhost:4000/${image.replace(/\\/g, "/")}`} // Correct the URL
                      alt={`Report image ${index + 1}`}
                      className="w-full h-auto rounded-md shadow-md transition-transform transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default ReportDetailsModal;
