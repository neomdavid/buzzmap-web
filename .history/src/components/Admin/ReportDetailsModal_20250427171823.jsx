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
  coordinates,
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
              {coordinates}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Description:</span>{" "}
              {description}
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
        </div>
      </div>
    </dialog>
  );
};

export default ReportDetailsModal;
