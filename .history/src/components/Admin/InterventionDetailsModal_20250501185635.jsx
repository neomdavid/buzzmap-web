import React, { useState, useEffect, useRef } from "react";
import { IconX } from "@tabler/icons-react";
import EditInterventionModal from "./EditInterventionModal"; // Ensure this is the correct import path

const InterventionDetailsModal = ({ intervention, onClose, onSave }) => {
  const modalRef = useRef(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);

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

  const handleEditClick = () => {
    setShowEditConfirmation(true); // Show confirmation modal for editing
  };

  const handleEditConfirm = () => {
    setIsEditModalOpen(true); // Show the edit modal after confirmation
    setShowEditConfirmation(false); // Hide the confirmation modal
  };

  const handleEditCancel = () => {
    setShowEditConfirmation(false); // Close the confirmation modal if cancelled
  };

  const handleSave = (updatedIntervention) => {
    onSave(updatedIntervention); // Pass updated data to parent for saving
    setIsEditModalOpen(false); // Close the Edit Modal
  };

  return (
    <dialog
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box bg-white rounded-4xl shadow-2xl w-11/12 max-w-3xl p-12 relative">
        <button
          className="absolute top-6 right-6 text-2xl font-semibold hover:text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        <p className="text-3xl font-bold mb-6 text-center">
          View Intervention Details
        </p>
        <div className="w-full flex justify-center">
          <p
            className={`${
              intervention.status === "Complete"
                ? "bg-success"
                : intervention.status === "Scheduled"
                ? "bg-warning"
                : "bg-info"
            } py-2 px-18 text-xl text-white font-bold rounded-2xl`}
          >
            {intervention.status}
          </p>
        </div>

        {/* Single Column Layout */}
        <div className="flex flex-col space-y-2 text-lg font-semibold">
          <div className="flex gap-1">
            <p className="text-gray-500 ">Intervention ID: </p>
            <p className="font-semibold text-primary">{intervention.id}</p>
          </div>
          <div className="flex gap-1">
            <p className="text-gray-500 ">Barangay: </p>
            <p className="font-semibold text-primary">
              {intervention.barangay}
            </p>
          </div>
          {intervention.address && (
            <div>
              <p className="text-gray-500">Address</p>
              <p className="font-semibold text-primary">
                {intervention.address}
              </p>
            </div>
          )}
          <div className="flex gap-1">
            <p className="text-gray-500 ">Date and Time: </p>
            <p className="font-semibold text-primary">{intervention.date}</p>
          </div>
          <div className="flex gap-1">
            <p className="text-gray-500 ">Type of Intervention: </p>
            <p className="font-semibold text-primary">
              {intervention.interventionType}
            </p>
          </div>
          <div className="flex gap-1">
            <p className="text-gray-500 ">Assigned Personnel: </p>
            <p className="font-semibold text-primary">
              {intervention.personnel}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-action flex justify-center gap-6">
          <button
            className="bg-primary text-white font-semibold py-1 px-12 rounded-xl hover:bg-primary/80 transition-all hover:cursor-pointer"
            onClick={handleEditClick} // Open the edit modal when clicked
          >
            Edit
          </button>
          <button
            className="bg-error text-white font-semibold py-1 px-12 rounded-xl hover:bg-error/80 transition-all hover:cursor-pointer"
            onClick={() => {
              setIsSuccess(true); // Trigger auto-close after success
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Edit Intervention Confirmation Modal */}
      {showEditConfirmation && (
        <div className="modal transition-transform duration-300 ease-in-out">
          <div className="modal-box bg-white rounded-4xl shadow-2xl w-9/12 max-w-3xl p-12 relative">
            <button
              className="absolute top-6 right-6 text-2xl font-semibold hover:text-gray-500"
              onClick={handleEditCancel}
            >
              ✕
            </button>

            <p className="text-3xl font-bold mb-6 text-center">
              Are you sure you want to edit this intervention?
            </p>

            <div className="modal-action flex justify-center gap-6">
              <button
                className="bg-success text-white font-semibold py-1 px-12 rounded-xl hover:bg-success/80 transition-all"
                onClick={handleEditConfirm} // Confirm editing
              >
                Confirm Edit
              </button>
              <button
                className="bg-gray-300 text-gray-700 font-semibold py-1 px-12 rounded-xl hover:bg-gray-400 transition-all"
                onClick={handleEditCancel} // Cancel edit action
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Intervention Modal */}
      {isEditModalOpen && (
        <EditInterventionModal
          intervention={intervention}
          onClose={() => setIsEditModalOpen(false)} // Close the edit modal
          onSave={handleSave} // Save the updated intervention data
        />
      )}
    </dialog>
  );
};

export default InterventionDetailsModal;
