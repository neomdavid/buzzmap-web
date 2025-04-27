import React from "react";

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
  return (
    <div
      className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-2/3 max-w-4xl"
        onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-gray-500"
        >
          ✕
        </button>
        <h2 className="text-3xl font-semibold mb-4">Report Details</h2>
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
                    src={`/uploads/${image}`} // Assuming images are served from the /uploads directory
                    alt={`Report image ${index + 1}`}
                    className="rounded-md"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;
