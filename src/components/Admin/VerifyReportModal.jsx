import React, { useState, useEffect, useRef } from "react";
import { useGoogleMaps } from "../GoogleMapsProvider";
import { useValidatePostMutation } from "../../api/dengueApi.js";
import { toast } from "react-toastify";

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
  username,
  onSuccess,
  onConfirmAction,
}) => {
  const modalRef = useRef(null);
  const streetViewRef = useRef(null);
  const [address, setAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(type === 'verify' || type === 'reject');
  const [actionType, setActionType] = useState(type === 'verify' || type === 'reject' ? type : null);
  const { isLoaded } = useGoogleMaps();
  const [validatePost, { isLoading }] = useValidatePostMutation();
  // Store the previous status for undo
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const prevStatusRef = useRef(status);

  const handleConfirm = async () => {
    if (typeof onConfirmAction === 'function') {
      await onConfirmAction(actionType);
      if (typeof onClose === "function") onClose();
    } else {
      // fallback: do the API call directly
      const newStatus = actionType === "verify" ? "Validated" : "Rejected";
      const requestPayload = { id: reportId, status: newStatus };
      try {
        await validatePost(requestPayload).unwrap();
        toast.success(`Report ${newStatus === "Validated" ? "verified" : "rejected"} successfully!`);
        if (typeof onSuccess === "function") onSuccess();
        if (typeof onClose === "function") onClose();
      } catch (error) {
        console.error("Verify/Reject error:", error);
        toast.error("Failed to update report status.");
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeout) clearTimeout(undoTimeout);
    };
  }, [undoTimeout]);

  useEffect(() => {
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

      if (streetViewRef.current) {
        new window.google.maps.StreetViewPanorama(streetViewRef.current, {
          position: latLng,
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
        });
      }
    }

    modalRef.current?.showModal();
  }, [isLoaded, coordinates]);

  const handleActionClick = (action) => {
    setActionType(action);
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setActionType(null);
  };

  return (
    <dialog
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
    >
      <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-5xl p-6 py-14 relative">
        <button
          className="absolute top-4 right-4 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        {!showConfirmation ? (
          <>
            <p className="text-center text-3xl font-bold mb-6">
              <span className="text-primary">
                {type === "verify" ? "Verify" : "Reject"} Report
              </span>
            </p>

            <div className="space-y-6">
              {/* Report Details */}
              <p className="text-left text-2xl font-bold mb-6">
                Report Details
              </p>
              <hr className="text-accent/50 mb-4" />
              <div className="flex justify-between text-lg rounded-lg">
                <div className="flex flex-col gap-y-1">
                  <p className="font-semibold">
                    <span className="text-gray-500 font-normal mr-1">
                      Username:
                    </span>
                    {username}
                  </p>
                  <p className="font-semibold">
                    <span className="text-gray-500 font-normal mr-1">
                      Barangay:
                    </span>
                    {barangay}
                  </p>
                </div>
                <div className="flex flex-col gap-y-1">
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

              {/* Image Gallery */}
              {images?.length > 0 && (
                <div>
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
                        <img
                          src={image}
                          alt={`Report image ${index + 1}`}
                          className="w-full shadow-sm h-full object-cover rounded-md transition-transform hover:scale-105"
                          style={{ aspectRatio: "4/3" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-left text-2xl font-bold">Reported Area</p>
              <hr className="text-accent/50 mb-4" />
              {coordinates?.length === 2 && (
                <div
                  className="w-full h-64 mt-4 shadow-sm overflow-hidden rounded-2xl"
                  ref={streetViewRef}
                ></div>
              )}

              {/* Action Buttons */}
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleActionClick("verify")}
                    className="bg-success text-white font-semibold px-7 py-2 rounded-xl hover:cursor-pointer hover:opacity-70 transition-all duration-200"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleActionClick("reject")}
                    className="bg-error text-white font-semibold px-7 py-2 rounded-xl hover:cursor-pointer hover:opacity-70 transition-all duration-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : showConfirmation ? (
          <div className="space-y-6">
            <p className="text-center text-3xl font-bold mb-6">
              <span
                className={
                  actionType === "verify" ? "text-success" : "text-error"
                }
              >
                Confirm {actionType === "verify" ? "Verification" : "Rejection"}
              </span>
            </p>

            <div className="text-center py-8">
              <p className="text-xl font-semibold mb-8">
                Are you sure you want to {actionType} report #{reportId}?
              </p>

              <div className="flex justify-center gap-6">
                <button
                  onClick={handleConfirm}
                  className={`${
                    actionType === "verify" ? "bg-success" : "bg-error"
                  } text-white font-semibold px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-200`}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Confirm"}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </dialog>
  );
};

export default VerifyReportModal;
