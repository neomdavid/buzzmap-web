import React, { useState, useEffect, useRef } from "react";
import { useGoogleMaps } from "../GoogleMapsProvider";

const VerifyReportModal = ({
  reportId,
  barangay,
  description,
  status,
  dateAndTime,
  images,
  onClose,
  coordinates,
  type, // "verify" or "reject"
  onConfirmAction,
  username,
}) => {
  const modalRef = useRef(null);
  const [address, setAddress] = useState("");
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    // Handle geocoding
    if (isLoaded && coordinates?.length === 2) {
      const geocoder = new window.google.maps.Geocoder();
      const latLng = new window.google.maps.LatLng(
        coordinates[1],
        coordinates[0]
      );

      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          setAddress("Address not found");
        }
      });
    }

    // Show modal
    modalRef.current?.showModal();
  }, [isLoaded, coordinates]);

  const handleConfirm = () => {
    onConfirmAction(type);
    onClose();
  };

  const actionColor = type === "verify" ? "bg-success" : "bg-error";
  const actionText = type === "verify" ? "Verify" : "Reject";

  return (
    <dialog
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
    >
      <div className="modal-box bg-white rounded-3xl shadow-2xl max-w-4xl p-12 relative">
        <button
          className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        <p className="text-center text-3xl font-bold mb-6">
          <span className="text-primary">{actionText} Report</span>
        </p>
        <hr className="text-gray-300 mb-6" />

        <div className="space-y-6">
          {/* Report Details */}
          <div className="space-y-2 text-lg p-4 rounded-lg">
            <p className="font-semibold ">
              <span className="text-gray-500 font-normal mr-1">Username:</span>{" "}
              {username}
            </p>
            <p className="font-semibold">
              <span className="text-gray-500 font-normal mr-1">Barangay:</span>
              {barangay}
            </p>
            <p className="font-semibold">
              <span className="text-gray-500 font-normal mr-1">
                Description:
              </span>
              {description}
            </p>
            <div className="flex items-center gap-1">
              <p className="text-gray-500 font-normal mr-1">Status:</p>
              <p
                className={`p-1 px-4 rounded-full text-[11px] text-white font-bold ${
                  status === "pending"
                    ? "bg-warning"
                    : status === "validated"
                    ? "bg-success"
                    : "bg-error"
                }`}
              >
                {status}
              </p>
            </div>
            <p className="font-semibold">
              <span className="text-gray-500 font-normal mr-1">
                Date and Time:
              </span>
              {new Date(dateAndTime).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>

          {/* Image Gallery */}
          {images?.length > 0 && (
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
                      alt={`Report ${index + 1}`}
                      className="w-full h-auto rounded-md hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Confirmation */}
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-gray-700">
              Are you sure you want to {type} this report?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirm}
                className={`btn ${actionColor} text-white`}
              >
                Confirm {actionText}
              </button>
              <button
                onClick={onClose}
                className="btn bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default VerifyReportModal;
