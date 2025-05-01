import React, { useState, useEffect, useRef } from "react";
import { IconX } from "@tabler/icons-react";
import { useGetInterventionQuery } from "../../api/dengueApi"; // Import the RTK Query hook for fetching intervention data

const InterventionDetailsModal = ({
  interventionId, // Receive interventionId as a prop to fetch data
  onClose,
  onSave,
  onDelete,
}) => {
  const modalRef = useRef(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track if the user is editing
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // For delete confirmation inside modal

  const {
    data: intervention,
    isLoading,
    error,
  } = useGetInterventionQuery(interventionId); // Fetch single intervention

  const [formData, setFormData] = useState({
    // Initialize with current intervention data when fetched
    barangay: "",
    address: "",
    date: "",
    interventionType: "",
    personnel: "",
    status: "",
  });

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (error) {
      console.error("Error fetching intervention:", error);
      return;
    }

    if (intervention) {
      setFormData({
        barangay: intervention.barangay,
        address: intervention.address,
        date: intervention.date,
        interventionType: intervention.interventionType,
        personnel: intervention.personnel,
        status: intervention.status,
      });
    }
  }, [isLoading, intervention, error]);

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
  }, [interventionId]); // Ensure modal opens when the interventionId changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true); // Switch to editable mode
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(formData); // Save the updated data
    setIsEditing(false); // Switch back to readonly mode
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true); // Show delete confirmation inside the current modal
  };

  const handleConfirmDelete = () => {
    onDelete(interventionId); // Perform the delete action
    setShowDeleteConfirmation(false); // Hide the confirmation modal
    setIsSuccess(true); // Optionally set success status
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false); // Revert back to original modal content
  };

  if (isLoading) {
    return <div>Loading intervention...</div>; // Show loading indicator while fetching data
  }

  if (error) {
    return <div>Error: {error.message}</div>; // Show error message if fetching fails
  }

  return (
    <dialog
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box bg-white rounded-4xl shadow-2xl w-11/12 max-w-3xl p-12 relative">
        <button
          className="absolute top-6 right-6 text-2xl font-semibold hover:text-gray-500 hover:cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Show delete confirmation only if it's set to true */}
        {showDeleteConfirmation ? (
          <>
            <p className="text-3xl font-bold mb-6 text-center">
              Are you sure you want to delete this intervention?
            </p>

            <div className="modal-action flex justify-center gap-6">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="bg-gray-300 text-gray-700 font-semibold py-1 px-12 rounded-xl hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-error text-white font-semibold py-1 px-12 rounded-xl hover:bg-error/80 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-3xl font-bold mb-6 text-center">
              {isEditing
                ? "Edit Intervention Details"
                : "View Intervention Details"}
            </p>
            {isEditing ? (
              <></>
            ) : (
              <div className="w-full flex justify-center">
                <p
                  className={`${
                    intervention.status === "Complete"
                      ? "bg-success"
                      : intervention.status === "Scheduled"
                      ? "bg-warning"
                      : "bg-info"
                  } py-2 px-18 text-xl text-white font-bold rounded-2xl mb-6`}
                >
                  {intervention.status}
                </p>
              </div>
            )}
            {isEditing ? (
              <p className="text-center text-3xl font-bold mt-[-16px] mb-4">
                {intervention.id}
              </p>
            ) : (
              <></>
            )}

            {/* Forms for editing and viewing */}
            <form
              onSubmit={handleSave}
              className="flex flex-col space-y-2 text-lg font-semibold"
            >
              {/* View Form (when not editing) */}
              {!isEditing && (
                <>
                  <div className="flex gap-1">
                    <p className="text-gray-500 ">Intervention ID: </p>
                    <p className="font-semibold text-primary">
                      {intervention._id}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="text-gray-500 ">Barangay: </p>
                    <p className="font-semibold text-primary">
                      {intervention.barangay}
                    </p>
                  </div>
                  {intervention.address && (
                    <div className="flex gap-1">
                      <p className="text-gray-500">Address</p>
                      <p className="font-semibold text-primary">
                        {intervention.address}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <p className="text-gray-500 ">Date and Time: </p>
                    <p className="font-semibold text-primary">
                      {intervention.date}
                    </p>
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
                </>
              )}

              {/* Edit Form (when editing) */}
              {isEditing && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-primary text-lg">Location</label>
                    <select
                      defaultValue={intervention.barangay}
                      className="border-2 font-normal border-primary/60 p-3 rounded-lg w-full"
                    >
                      <option>Barangay 1</option>
                      <option>Barangay 2</option>
                      <option>Barangay 3</option>
                    </select>
                    {intervention.address && (
                      <input
                        defaultValue={intervention.address}
                        className="border-2 font-normal border-primary/60 p-3 px-4 rounded-lg w-full"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-primary text-lg">
                      Date of Intervention
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="border-2 font-normal border-primary/60 p-3 px-4 rounded-lg w-full"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-primary text-lg">
                      Type of Intervention
                    </label>
                    <select
                      name="interventionType"
                      value={formData.interventionType}
                      onChange={handleChange}
                      defaultValue={intervention.interventionType}
                      className="border-2 font-normal border-primary/60 p-3 px-4 rounded-lg w-full"
                      required
                    >
                      <option value="Fogging">
                        {intervention.interventionType}
                      </option>
                      <option value="Larviciding">Larviciding</option>
                      <option value="Clean-up Drive">Clean-up Drive</option>
                      <option value="Education Campaign">
                        Education Campaign
                      </option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-primary text-lg">
                      Assigned Personnel
                    </label>
                    <input
                      onChange={handleChange}
                      className="border-2 font-normal border-primary/60 p-3 px-4 rounded-lg w-full"
                      required
                      defaultValue={intervention.personnel}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-primary text-lg">Status</label>
                    <select
                      defaultValue={intervention.status}
                      className="border-2 font-normal border-primary/60 p-3 rounded-lg w-full"
                    >
                      <option>Complete</option>
                      <option>Scheduled</option>
                      <option>Ongoing</option>
                    </select>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="modal-action flex justify-center gap-6">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 text-gray-700 font-semibold py-1 px-12 rounded-xl hover:bg-gray-400 transition-all hover:cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-white font-semibold py-1 px-12 rounded-xl hover:bg-primary/80 transition-all hover:cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="bg-primary text-white font-semibold py-1 px-12 rounded-xl hover:bg-primary/80 transition-all hover:cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteClick} // Show delete confirmation
                      className="bg-error text-white font-semibold py-1 px-12 rounded-xl hover:bg-error/80 transition-all hover:cursor-pointer"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
};

export default InterventionDetailsModal;
