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
      <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-4xl p-8 relative">
        <button
          className="absolute top-6 right-6 text-2xl font-semibold hover:text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        <p className="text-2xl font-bold mb-6 text-center">
          View Intervention Details
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-gray-500">ID</p>
              <p className="font-semibold">{intervention.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Barangay</p>
              <p className="font-semibold">{intervention.barangay}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-semibold">{intervention.date}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-gray-500">Type of Intervention</p>
              <p className="font-semibold">{intervention.interventionType}</p>
            </div>
            <div>
              <p className="text-gray-500">Personnel</p>
              <p className="font-semibold">{intervention.personnel}</p>
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
        </div>

        <div className="modal-action">
          <button
            className="btn"
            onClick={() => {
              setIsSuccess(true); // Trigger auto-close after success
            }}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default InterventionDetailsModal;
