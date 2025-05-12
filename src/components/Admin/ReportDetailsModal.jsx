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
  type = "view", // Default to "view"
  onConfirmAction,
}) => {
  const modalRef = useRef(null);
  const streetViewRef = useRef(null);
  const streetViewModalRef = useRef(null);
  const [address, setAddress] = useState(location);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || !coordinates || coordinates.length !== 2) return;

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

    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.showModal();
    }

    if (images?.length === 0 && type === "view") {
      new window.google.maps.StreetViewPanorama(streetViewRef.current, {
        position: { lat: coordinates[1], lng: coordinates[0] },
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
      });
    }
  }, [isLoaded, coordinates, images, type]);

  const handleConfirmAction = () => {
    onConfirmAction?.(type);
    onClose();
  };

  const openStreetViewModal = () => {
    const streetViewElement = streetViewModalRef.current;
    if (streetViewElement && isLoaded && coordinates?.length === 2) {
      streetViewElement.showModal();

      new window.google.maps.StreetViewPanorama(
        streetViewElement.querySelector("#street-view-container"),
        {
          position: { lat: coordinates[1], lng: coordinates[0] },
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
        }
      );
    }
  };

  const modalTitle = {
    view: "View Report",
    verify: <span className="text-primary">Verify Report</span>,
    reject: <span className="text-error">Reject Report</span>,
  }[type];

  return (
    <>
      {/* Main Modal */}
      <dialog
        ref={modalRef}
        className="modal transition-transform duration-300 ease-in-out"
      >
        <div className="modal-box bg-white rounded-3xl shadow-2xl w-9/12 max-w-4xl p-12 relative">
          <button
            className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={onClose}
          >
            ✕
          </button>

          <p className="text-center text-3xl font-bold mb-6">{modalTitle}</p>
          <p className="text-left text-2xl font-bold mb-6">Report Details</p>
          <hr className="text-accent/50 mb-6" />

          <div className="space-y-6">
            {/* Report Info */}
            <div className="space-y-2 text-lg rounded-lg">
              <p className="font-semibold">
                <span className="text-gray-500 font-normal mr-1">
                  Report ID:
                </span>{" "}
                {reportId}
              </p>
              <div className="flex items-center gap-1">
                <p className="text-gray-500 font-normal mr-1">Status:</p>
                <p
                  className={`p-1 px-4 rounded-full text-[11px] text-white font-bold ${
                    status === "Pending"
                      ? "bg-warning"
                      : status === "Validated"
                      ? "bg-success"
                      : "bg-error"
                  }`}
                >
                  {status}
                </p>
              </div>
              <p className="font-semibold">
                <span className="text-gray-500 font-normal mr-1">
                  Barangay:
                </span>{" "}
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
              <p className="font-semibold mb-10">
                <span className="text-gray-500 font-normal mr-1">
                  Date and Time:
                </span>{" "}
                {new Date(dateAndTime).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                at{" "}
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
              <p className="font-semibold mb-10">
                <span className="text-gray-500 font-normal mr-1">
                  Username:
                </span>{" "}
                {username}
              </p>
            </div>

            {/* Image Gallery or StreetView */}
            {images?.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-left text-2xl font-bold mb-6">
                    Photo Evidence
                  </p>
                  <hr className="text-accent/50 mb-4" />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="rounded-md overflow-hidden shadow-lg h-55"
                    >
                      <img src={image} />
                    </div>
                  ))}
                </div>
                {/* View StreetView Button */}
                <div className="text-center mt-6">
                  <button
                    onClick={openStreetViewModal}
                    className="btn bg-primary text-white hover:bg-primary/80 transition-colors"
                  >
                    View Street View
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="text-left text-2xl font-bold mb-6">Report Area</p>
                <hr className="text-accent/50 " />
                <div
                  className="w-full h-70 mt-4 rounded-md overflow-hidden"
                  ref={streetViewRef}
                ></div>
              </div>
            )}

            {/* Action Confirmation */}
            {type !== "view" && (
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
            )}
          </div>
        </div>
      </dialog>

      {/* StreetView Modal */}
      <dialog ref={streetViewModalRef} className="modal">
        <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-5xl p-6 py-14 relative max-h-[85vh] overflow-y-auto">
          <button
            className="absolute top-4 right-4 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => streetViewModalRef.current.close()}
          >
            ✕
          </button>

          {/* Reported Photos Section */}
          {images && images.length > 0 && (
            <div className="mb-6">
              <p className="text-xl font-bold mb-4">Reported Photos</p>
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={img} 
                      alt={`Reported Photo ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* StreetView Container */}
          <div className="space-y-4">
            <p className="text-xl font-bold">Street View</p>
            <div
              id="street-view-container"
              className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg"
            />
          </div>
        </div>
      </dialog>
    </>
  );
};

export default ReportDetailsModal;
