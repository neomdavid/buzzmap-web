import React, { useEffect, useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";

const InterventionDetailsModal = ({ intervention, onClose }) => {
  const modalRef = useRef(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Automatically close the modal after showing the details for a short time
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onClose();
      }, 2000); // Close the modal after 2 seconds
    }
  }, [isSuccess, onClose]);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.showModal();
    }
  }, []);

  return (
    <dialog
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box bg-white rounded-4xl shadow-2xl w-11/12 max-w-4xl p-12 relative">
        <button
          className="absolute top-11 right-8 text-2xl font-semibold hover:text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        <p className="text-3xl font-bold mb-6 text-center">
          View Intervention Details
        </p>
        <div className="w-full flex justify-center">
          <p>{intervention.status}</p>
        </div>

        {/* Single Column Layout */}
        <div className=" flex flex-col space-y-2 text-lg font-semibold ">
          <div className="flex gap-2">
            <p className="text-gray-500 ">Intervention ID: </p>
            <p className="font-semibold text-primary">{intervention.id}</p>
          </div>

          <div>
            <p className="text-gray-500">Barangay</p>
            <p className="font-semibold text-primary">
              {intervention.barangay}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Coordinates</p>
            <p className="font-semibold text-primary">
              {intervention.coordinates}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Address</p>
            <p className="font-semibold text-primary">{intervention.address}</p>
          </div>

          <div>
            <p className="text-gray-500">Date and Time</p>
            <p className="font-semibold text-primary">{intervention.date}</p>
          </div>

          <div>
            <p className="text-gray-500">Type of Intervention</p>
            <p className="font-semibold text-primary">
              {intervention.interventionType}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Assigned Personnel</p>
            <p className="font-semibold text-primary">
              {intervention.personnel}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Status</p>
            <div className="mt-1">
              <span
                className={`${
                  intervention.status === "Complete"
                    ? "bg-success"
                    : intervention.status === "Scheduled"
                    ? "bg-warning"
                    : "bg-info"
                } rounded-2xl px-4 py-1 inline-flex items-center justify-center text-white text-sm font-semibold`}
              >
                {intervention.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-action flex justify-center gap-6">
          <button
            className="btn btn-outline w-1/3 bg-gray-300 text-gray-700 hover:bg-gray-400 transition-all"
            onClick={() => onClose()}
          >
            Close
          </button>
          <button
            className="btn btn-success w-1/3"
            onClick={() => {
              setIsSuccess(true); // Trigger auto-close after success
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default InterventionDetailsModal;
