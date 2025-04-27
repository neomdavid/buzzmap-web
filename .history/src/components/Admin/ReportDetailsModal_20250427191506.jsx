import React, { useState, useEffect, useRef } from "react";
import { useGoogleMaps } from "../GoogleMapsProvider"; // Import your GoogleMapsProvider

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
  type, // New prop to determine whether it's verify or reject
  onConfirmAction, // Function to confirm the action
}) => {
  const modalRef = useRef(null);
  const streetViewRef = useRef(null);
  const [address, setAddress] = useState(location); // State for the address
  const { isLoaded } = useGoogleMaps(); // Check if Google Maps API is loaded

  // Reverse geocoding to get the address from coordinates
  useEffect(() => {
    const geocoder = new window.google.maps.Geocoder();

    if (isLoaded && coordinates && coordinates.length === 2) {
      const latLng = new window.google.maps.LatLng(
        coordinates[1],
        coordinates[0]
      );

      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address); // Set the address if successful
        } else {
          setAddress("Address not found"); // Default if reverse geocoding fails
        }
      });
    }

    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.showModal();
    }

    // Initialize Street View when coordinates are available
    if (isLoaded && coordinates && coordinates.length === 2) {
      const streetViewPanorama = new window.google.maps.StreetViewPanorama(
        streetViewRef.current,
        {
          position: { lat: coordinates[1], lng: coordinates[0] },
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
        }
      );
    }
  }, [isLoaded, coordinates]);

  const handleConfirmAction = () => {
    onConfirmAction(type); // Pass the action type to handle the verification/rejection
    onClose(); // Close the modal after confirmation
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
              <span className="font-semibold text-gray-700">Address:</span>{" "}
              {address} {/* Display the address here */}
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
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" at "}
              {new Date(dateAndTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
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
                      src={`http://localhost:4000/${image.replace(/\\/g, "/")}`}
                      alt={`Report image ${index + 1}`}
                      className="w-full h-auto rounded-md transition-transform transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Street View */}
          {coordinates && type !== "view" && coordinates.length === 2 && (
            <div className="w-full h-64 mt-4" ref={streetViewRef}></div>
          )}

          {/* Action Confirmation */}
          {type && (
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold text-gray-700">
                Are you sure you want to {type} this report?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirmAction}
                  className="btn bg-success text-white"
                >
                  Confirm {type}
                </button>
                <button
                  onClick={onClose}
                  className="btn bg-gray-300 text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default ReportDetailsModal;
