import React, { useState, useEffect, useRef } from "react";
import { useGoogleMaps } from "../GoogleMapsProvider";

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
  type,
  onConfirmAction,
}) => {
  const modalRef = useRef(null);
  const streetViewRef = useRef(null);
  const [address, setAddress] = useState(location);
  const { isLoaded } = useGoogleMaps();
  const [activeImage, setActiveImage] = useState(0);

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

    if (isLoaded && coordinates && coordinates.length === 2) {
      new window.google.maps.StreetViewPanorama(streetViewRef.current, {
        position: { lat: coordinates[1], lng: coordinates[0] },
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
      });
    }
  }, [isLoaded, coordinates]);

  const handleConfirmAction = () => {
    onConfirmAction(type);
    onClose();
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    validated: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const typeColors = {
    view: "text-gray-700",
    verify: "text-blue-600",
    reject: "text-red-600",
  };

  return (
    <dialog
      ref={modalRef}
      className="modal backdrop-blur-sm transition-all duration-300 ease-out"
    >
      <div className="modal-box bg-white rounded-xl shadow-xl max-w-5xl p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2
            className={`text-2xl font-bold ${
              typeColors[type] || typeColors.view
            }`}
          >
            {type === "view"
              ? "Report Details"
              : type === "verify"
              ? "Verify Report"
              : type === "reject"
              ? "Reject Report"
              : ""}
          </h2>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Details */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">
                Report Information
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Report ID</p>
                  <p className="font-medium">{reportId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Barangay</p>
                  <p className="font-medium">{barangay}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Coordinates</p>
                  <p className="font-medium">
                    {coordinates[0]}, {coordinates[1]}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{address}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[status] || statusColors.pending
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">
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
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">
                Description
              </h3>
              <p className="text-gray-700">{description}</p>
            </div>
          </div>

          {/* Right Column - Media */}
          <div className="space-y-4">
            {/* Image Gallery */}
            {images && images.length > 0 && (
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-700 mb-4">
                  Photo Evidence
                </h3>

                {/* Main Image */}
                <div className="mb-4 rounded-lg overflow-hidden bg-black">
                  <img
                    src={`http://localhost:4000/${images[activeImage].replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt={`Report evidence ${activeImage + 1}`}
                    className="w-full h-64 object-contain mx-auto"
                  />
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`rounded-md overflow-hidden border-2 transition-all ${
                        activeImage === index
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={`http://localhost:4000/${image.replace(
                          /\\/g,
                          "/"
                        )}`}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Street View */}
            {coordinates && type === "view" && coordinates.length === 2 && (
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-700 mb-4">
                  Street View
                </h3>
                <div
                  className="w-full h-64 rounded-lg overflow-hidden"
                  ref={streetViewRef}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {type !== "view" && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 mb-4">
              Are you sure you want to {type} this report?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmAction}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  type === "verify"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Confirm {type}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default ReportDetailsModal;
