import React, { useEffect, useRef } from "react";
import { useGoogleMaps } from "../GoogleMapsProvider"; // Import your custom GoogleMapsProvider

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
  const streetViewRef = useRef(null); // Reference to the Street View container
  const { isLoaded } = useGoogleMaps(); // Get the loading status of the Google Maps API

  // Open the modal and initialize the Street View when the modal is opened
  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.showModal();
    }

    if (isLoaded && coordinates && coordinates.length === 2) {
      // Initialize the Street View only when Google Maps is loaded
      const streetViewPanorama = new window.google.maps.StreetViewPanorama(
        streetViewRef.current,
        {
          position: { lat: coordinates[1], lng: coordinates[0] }, // Use the coordinates as the location
          pov: { heading: 165, pitch: 0 }, // Set initial view (angle, pitch)
          zoom: 1, // Optional: You can adjust the zoom level
        }
      );
    }
  }, [isLoaded, coordinates]); // Re-run if coordinates change or Google Maps load status changes

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

          {/* Street View */}
          {coordinates && coordinates.length === 2 && (
            <div className="w-full h-64 mt-4" ref={streetViewRef}></div>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default ReportDetailsModal;
