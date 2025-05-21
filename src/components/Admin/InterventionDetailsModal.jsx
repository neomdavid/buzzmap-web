import React, { useState, useEffect, useRef } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import {
  useUpdateInterventionMutation,
  useDeleteInterventionMutation,
} from "../../api/dengueApi"; // Import the RTK Query hook for updating the intervention data
import { toastSuccess, toastError, formatDateForInput } from "../../utils.jsx";
const InterventionDetailsModal = ({
  intervention,
  onClose,
  onSave,
  onDelete,
}) => {
  const modalRef = useRef(null);
  const [barangayData, setBarangayData] = useState(null);
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Track if the user is editing
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // For delete confirmation inside modal
  const [isLoading, setIsLoading] = useState(false); // Loading state for save operation
  const [updateIntervention] = useUpdateInterventionMutation(); // RTK Query hook for updating the intervention
  const [deleteIntervention] = useDeleteInterventionMutation();

  const [formData, setFormData] = useState({
    barangay: intervention.barangay,
    address: intervention.address,
    date: intervention.date,
    interventionType: intervention.interventionType,
    personnel: intervention.personnel,
    status: intervention.status,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  console.log(formData.date);
  // Handle save button
  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loading indicator
    try {
      const response = await updateIntervention({
        id: intervention._id, // intervention id
        updatedData: formData, // the data to update
      }).unwrap();

      console.log("Intervention updated successfully:", response);
      setIsEditing(false); // Switch back to readonly mode
    } catch (error) {
      console.error("Failed to update intervention:", error);
    } finally {
      setIsLoading(false); // Hide loading indicator after the request completes
      onClose();
      toastSuccess("Intervention updated successfully");
    }
  };

  // Handle edit click
  const handleEditClick = () => {
    setIsEditing(true); // Switch to editable mode
  };

  // Handle delete click
  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true); // Show delete confirmation inside the current modal
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    console.log("Start delete action...");
    setIsLoading(true); // Hide loading indicator after the request completes
    try {
      const response = await deleteIntervention(intervention._id);
      setIsLoading(false); // Hide loading indicator after the request completes
    } catch (err) {
      console.error("Error during delete:", err); // Log error in detail
      toastError(err.message);
    } finally {
      toastError("Intervention Deleted");
      console.log("Finally block reached...");
      onClose();
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false); // Revert back to original modal content
  };

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.showModal();
    }
  }, []);

  useEffect(() => {
    // Fetch the barangay data (geojson file)
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        setBarangayData(data);

        // Extract barangay names and set the options for the select
        const barangayNames = data.features.map(
          (feature) => feature.properties.name
        );
        setBarangayOptions(barangayNames);
      })
      .catch(console.error);
  }, []);

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
                {isLoading ? "Deleting..." : "Confirm Delete"}
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
            <div className="flex justify-center mb-6">
              <p className={`${intervention.status === "Complete" ? "bg-success" : intervention.status === "Scheduled" ? "bg-warning" : intervention.status === "Ongoing" ? "bg-info" : "bg-gray-300"} w-[40%] text-center rounded-xl py-1.5 text-white font-extrabold text-xl`}>{intervention.status}</p>
            </div>

            {/* Display form to edit or view */}
            <form
              onSubmit={handleSave}
              className="flex flex-col space-y-2 text-lg font-semibold"
            >
              {!isEditing ? (
                <>
                  <div className="flex gap-1">
                    <p className="text-gray-500">Intervention ID: </p>
                    <p className="font-semibold text-primary">
                      {intervention._id}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="text-gray-500">Barangay: </p>
                    <p className="font-semibold text-primary">
                      {intervention.barangay}
                    </p>
                  </div>
                  {intervention.address && (
                    <div className="flex gap-1">
                      <p className="text-gray-500">Address: </p>
                      <p className="font-semibold text-primary">
                        {intervention.address}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <p className="text-gray-500">Date and Time: </p>
                    <p className="font-semibold text-primary">
                      {intervention.date}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="text-gray-500">Type of Intervention: </p>
                    <p className="font-semibold text-primary">
                      {intervention.interventionType}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <p className="text-gray-500">Assigned Personnel: </p>
                    <p className="font-semibold text-primary">
                      {intervention.personnel}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Editable Form */}
                  <div className="flex flex-col gap-2">
                    <label className="text-primary text-lg">Location</label>
                    <select
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleChange}
                      className="border-2 font-normal border-primary/60 p-3 rounded-lg w-full"
                    >
                      {barangayOptions.map((barangay, idx) => (
                        <option key={idx} value={barangay}>
                          {barangay}
                        </option>
                      ))}
                    </select>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="border-2 font-normal border-primary/60 p-3 px-4 rounded-lg w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-primary text-lg">
                      Date of Intervention
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formatDateForInput(formData.date)}
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
                      className="border-2 font-normal border-primary/60 p-3 px-4 rounded-lg w-full"
                      required
                    >
                      <option value="All">All</option>
                      <option value="Fogging">Fogging</option>
                      <option value="Ovicidal-Larvicidal Trapping">Ovicidal-Larvicidal Trapping</option>
                      <option value="Clean-up Drive">Clean-up Drive</option>
                      <option value="Education Campaign">Education Campaign</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-primary text-lg">
                      Assigned Personnel
                    </label>
                    <input
                      name="personnel"
                      value={formData.personnel}
                      onChange={handleChange}
                      className="border-2 font-normal border-primary/60 p-3 px-4 rounded-lg w-full"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-primary text-lg">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="border-2 font-normal border-primary/60 p-3 rounded-lg w-full"
                    >
                      <option value="Complete">Complete</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Ongoing">Ongoing</option>
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
                      {isLoading ? "Saving changes..." : "Save changes"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleEditClick}
                      className="bg-primary text-white font-semibold py-1 px-12 rounded-xl hover:bg-primary/80 transition-all hover:cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteClick}
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
