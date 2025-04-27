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
    <dialog id="reportModal" ref={modalRef} className="modal">
      <div className="modal-box">
        <form method="dialog">
          {/* Close button for the modal */}
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>

        {/* Modal content */}
        <h3 className="font-bold text-lg mb-4">Report Details</h3>

        <div className="flex flex-col gap-4">
          <p>
            <span className="font-bold">Report ID:</span> {reportId}
          </p>
          <p>
            <span className="font-bold">Barangay:</span> {barangay}
          </p>
          <p>
            <span className="font-bold">Location:</span> {location}
          </p>
          <p>
            <span className="font-bold">Description:</span> {description}
          </p>
          <p>
            <span className="font-bold">Report Type:</span> {reportType}
          </p>
          <p>
            <span className="font-bold">Status:</span> {status}
          </p>
          <p>
            <span className="font-bold">Date and Time:</span>{" "}
            {new Date(dateAndTime).toLocaleString()}
          </p>

          {/* Render images if any */}
          {images && images.length > 0 && (
            <div className="text-black flex flex-col">
              <p className="font-bold mb-2">Photo Evidence:</p>
              <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <img
                    key={index}
                    // Replace backslashes with forward slashes in the image path
                    src={`http://localhost:4000/${image.replace(/\\/g, "/")}`} // Correct the URL
                    alt={`Report image ${index + 1}`}
                    className="rounded-md"
                  />
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
