import React, { useState, useEffect, useRef } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import {
  useUpdateInterventionMutation,
  useDeleteInterventionMutation,
} from "../../api/dengueApi"; // Import the RTK Query hook for updating the intervention data
import { toastSuccess, toastError, formatDateForInput } from "../../utils.jsx";
import { X } from "phosphor-react";
import { InterventionAnalysisChart } from "../../components";

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

  if (!intervention) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Intervention Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Basic Intervention Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Intervention Information</h3>
            <p><span className="font-medium">Type:</span> {intervention.type}</p>
            <p><span className="font-medium">Date:</span> {new Date(intervention.date).toLocaleDateString()}</p>
            <p><span className="font-medium">Barangay:</span> {intervention.barangay}</p>
            <p><span className="font-medium">Personnel:</span> {intervention.personnel}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Status & Progress</h3>
            <p><span className="font-medium">Status:</span> {intervention.status}</p>
            <p><span className="font-medium">Progress:</span> {intervention.progress}%</p>
            <p><span className="font-medium">Last Updated:</span> {new Date(intervention.lastUpdated).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Intervention Analysis Chart */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Effectiveness Analysis</h3>
          <InterventionAnalysisChart interventionId={intervention._id} />
        </div>

        {/* Additional Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Additional Details</h3>
          <p><span className="font-medium">Description:</span> {intervention.description}</p>
          {intervention.notes && (
            <p><span className="font-medium">Notes:</span> {intervention.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterventionDetailsModal;
