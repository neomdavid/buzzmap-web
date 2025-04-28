import React, { useState, useEffect, useRef } from "react";
import { useGoogleMaps } from "../GoogleMapsProvider";

const ReportDetailsModal = ({
  reportId,
  barangay,
  location,
  description,
  reportType,
  status,
  username,
  dateAndTime,
  images,
  onClose,
  coordinates,
  type = "view", // Default to "view" if not provided
  onConfirmAction, // Only needed for verify/reject
}) => {
  const modalRef = useRef(null);
  const streetViewRef = useRef(null);
  const [address, setAddress] = useState(location);
  const { isLoaded } = useGoogleMaps();
  console.log(username);
  useEffect(() => {
    const geocoder = new window.google.maps.Geocoder();

    if (isLoaded && coordinates && coordinates.length === 2) {
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

    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.showModal();
    }

    if (
      isLoaded &&
      coordinates &&
      coordinates.length === 2 &&
      type === "view"
    ) {
      new window.google.maps.StreetViewPanorama(streetViewRef.current, {
        position: { lat: coordinates[1], lng: coordinates[0] },
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
      });
    }
  }, [isLoaded, coordinates, type]);

  const handleConfirmAction = () => {
    onConfirmAction?.(type);
    onClose();
  };

  const modalTitle = {
    view: "View Report",
    verify: <span className="text-primary">Verify Report</span>,
    reject: <span className="text-error">Reject Report</span>,
  }[type];

  return (
    <dialog
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
    >
      <div className="modal-box bg-white rounded-3xl shadow-2xl max-w-4xl p-12 relative">
        <button
          className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500 transition-color duration-200 hover:cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        <p className="text-center text-3xl font-bold mb-6">{modalTitle}</p>
        <p className="text-left text-2xl font-bold mb-6">Report Details</p>
        <hr className="text-accent/50 mb-6" />

        <div className="space-y-6">
          {/* Report Details */}
          <div className="space-y-2 text-lg rounded-lg">
            <p className="font-semibold">
              <span className="text-gray-500 font-normal mr-1">Report ID:</span>{" "}
              {reportId}
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
              <span className="text-gray-500 font-normal mr-1">Barangay:</span>{" "}
              {barangay}
            </p>
            <p className="font-semibold">
              <span className="text-gray-500 font-normal mr-1">
                Coordinates:
              </span>{" "}
              {coordinates?.[0]}, {coordinates?.[1]}
            </p>
            <p className="font-semibold">
              <span className="text-gray-500 font-normal mr-1">Address:</span>{" "}
              {address}
            </p>
            <p className="font-semibold">
              <span className="text-gray-500 font-normal mr-1">
                Description:
              </span>{" "}
              {description}
            </p>

            <p className="font-semibold mb-6">
              <span className="text-gray-500 font-normal mr-1">
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

            <p className="text-left text-2xl font-bold mb-6">
              User Information:
            </p>
            <hr className="text-accent/50 mb-6" />
            <p className="font-semibold mb-6">
              <span className="text-gray-500 font-normal mr-1">Username:</span>{" "}
              {username}
            </p>

            <p className="text-left text-2xl font-bold mb-6">
              User Information:
            </p>
            <hr className="text-accent/50 mb-6" />
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
                      alt={`Report image ${index + 1}`}
                      className="w-full h-auto rounded-md transition-transform transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Street View (only for view mode) */}
          {/* {type === "view" && coordinates?.length === 2 && (
            <div className="w-full h-64 mt-4" ref={streetViewRef}></div>
          )} */}

          {/* Action Confirmation (only for verify/reject) */}
          {/* {type !== "view" && (
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold text-gray-700">
                Are you sure you want to {type} this report?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirmAction}
                  className={`btn ${
                    type === "verify" ? "bg-success" : "bg-error"
                  } text-white`}
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
          )} */}
        </div>
      </div>
    </dialog>
  );
};

export default ReportDetailsModal;
