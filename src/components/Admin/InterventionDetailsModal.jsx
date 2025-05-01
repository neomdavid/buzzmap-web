import React from "react";
import { IconX } from "@tabler/icons-react";

const InterventionDetailsModal = ({ intervention, onClose }) => {
  return (
    <dialog
      open
      className="modal modal-bottom sm:modal-middle"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-4xl p-8">
        <button
          className="absolute top-6 right-6 text-2xl font-semibold hover:text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold mb-6 text-center">
          Intervention Details
        </h3>

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
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default InterventionDetailsModal;
