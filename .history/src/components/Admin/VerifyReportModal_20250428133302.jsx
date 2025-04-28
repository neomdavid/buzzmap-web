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
  const streetViewRef = useRef(null); // Add this line
  const [address, setAddress] = useState("");
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    // Handle geocoding and Street View initialization
    if (isLoaded && coordinates?.length === 2) {
      const geocoder = new window.google.maps.Geocoder();
      const latLng = new window.google.maps.LatLng(
        coordinates[1],
        coordinates[0]
      );

      // Geocoding
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          setAddress("Address not found");
        }
      });

      // Street View initialization
      if (streetViewRef.current) {
        new window.google.maps.StreetViewPanorama(streetViewRef.current, {
          position: latLng,
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
        });
      }
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

        <div className="space-y-6">
          {/* Report Details */}
          <p className="text-left text-2xl font-bold mb-6">Report Details</p>
          <hr className="text-accent/50 mb-4" />
          <div className="flex justify-between text-lg  rounded-lg">
            <div>
              {" "}
              <p className="font-semibold ">
                <span className="text-gray-500 font-normal mr-1">
                  Username:
                </span>{" "}
                {username}
              </p>
              <p className="font-semibold">
                <span className="text-gray-500 font-normal mr-1">
                  Barangay:
                </span>
                {barangay}
              </p>
            </div>
            <div>
              {" "}
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
              <p className="font-semibold">
                <span className="text-gray-500 font-normal mr-1">
                  Description:
                </span>
                {description}
              </p>
            </div>
          </div>
          <p className="text-left text-2xl font-bold mb-6">Photo Evidence</p>
          <hr className="text-accent/50 mb-4" />
          {/* Image Gallery */}
          {images?.length > 0 && (
            <div className="grid grid-cols-2 gap-4 w-full">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="rounded-md overflow-hidden shadow-lg h-55" // Constrain container height
                >
                  <img
                    src={`http://localhost:4000/${image.replace(/\\/g, "/")}`}
                    alt={`Report image ${index + 1}`}
                    className="w-full shadow-sm h-full object-cover rounded-md transition-transform hover:scale-105"
                    style={{ aspectRatio: "4/3" }} // Force aspect ratio
                  />
                </div>
              ))}
            </div>
          )}
          <p className="text-left text-2xl font-bold mb-6">Reported Area</p>
          <hr className="text-accent/50 mb-4" />
          {/* Street View  */}
          {coordinates?.length === 2 && (
            <div
              className="w-full h-64 mt-4 shadow-sm overflow-hidden rounded-2xl"
              ref={streetViewRef}
            ></div>
          )}
          {/* Action Confirmation */}
          <div className="text-center space-y-4">
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
