import React, { useState, useEffect, useRef } from "react";
import {
  IconX,
  IconCheck,
  IconAlertTriangle,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import {
  useUpdateInterventionMutation,
  useDeleteInterventionMutation,
} from "../../api/dengueApi"; // Import the RTK Query hook for updating the intervention data
import { toastSuccess, toastError, formatDateForInput } from "../../utils.jsx";
import InterventionLocationPicker from "./InterventionLocationPicker";
import center from "@turf/center";

// Helper to compute correct status based on date/time
function computeStatusFromDate(dateString) {
  if (!dateString) return "Scheduled";
  const now = new Date();
  const selected = new Date(dateString);
  return selected < now ? "Complete" : "Scheduled";
}

function isToday(dateString) {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const InterventionDetailsModal = ({
  intervention,
  onClose,
  onSave,
  onDelete,
  onRefetch,
}) => {
  const modalRef = useRef(null);
  const [barangayData, setBarangayData] = useState(null);
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Track if the user is editing
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // For delete confirmation inside modal
  const [isLoading, setIsLoading] = useState(false); // Loading state for save operation
  const [updateIntervention] = useUpdateInterventionMutation(); // RTK Query hook for updating the intervention
  const [deleteIntervention] = useDeleteInterventionMutation();
  const [saveError, setSaveError] = useState(null); // Inline error for save failures
  const [completionNoticeVisible, setCompletionNoticeVisible] = useState(false); // Show notice after clicking Mark as Completed

  // Map and location handling states
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [focusCommand, setFocusCommand] = useState(null);
  const [highlightedBarangay, setHighlightedBarangay] = useState(
    intervention.barangay
  );
  const [isLocationValid, setIsLocationValid] = useState(
    !!intervention.specific_location
  );

  const [formData, setFormData] = useState({
    barangay: intervention.barangay,
    address: intervention.address,
    date: intervention.date,
    interventionType: intervention.interventionType,
    personnel: intervention.personnel,
    status: intervention.status,
    specific_location: intervention.specific_location || null,
  });

  // Only coerce status when editing, not when viewing
  useEffect(() => {
    if (!isEditing) return; // Don't alter status when just viewing

    const now = new Date();
    const interventionDate = new Date(formData.date);
    const isPast = interventionDate < now;
    const isTodayDate = isToday(formData.date);
    const isFuture = interventionDate > now;

    // If future date and not today, force status to Scheduled
    if (isFuture && !isTodayDate) {
      setFormData((prev) => ({ ...prev, status: "Scheduled" }));
    }
    // If past date, force status away from Scheduled (can't be scheduled in the past)
    else if (isPast && formData.status === "Scheduled") {
      setFormData((prev) => ({ ...prev, status: "Complete" }));
    }
  }, [formData.date, isEditing]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // When changing date, auto-derive status
    if (name === "date") {
      const derivedStatus = computeStatusFromDate(value);
      const today = isToday(value);
      // If today, keep Scheduled by default (user may choose Ongoing); if past, Complete; if future, Scheduled
      const nextStatus =
        derivedStatus === "Complete"
          ? "Complete"
          : today
          ? "Scheduled"
          : "Scheduled";
      setFormData((prev) => ({
        ...prev,
        date: value,
        status: nextStatus,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle pin changes from the map
  const handlePinChange = async (pinData) => {
    if (pinData) {
      // Validate that the pin is within the barangay boundaries
      const isWithinBarangay = await validatePinWithinBarangay(
        pinData.coordinates,
        intervention.barangay
      );

      if (isWithinBarangay) {
        setFormData((prev) => ({
          ...prev,
          specific_location: {
            type: "Point",
            coordinates: pinData.coordinates,
          },
          address: pinData.formattedAddress,
        }));
        setIsLocationValid(true);
        // Don't close the map automatically - let user click save button
      } else {
        // Show error toast if pin is outside barangay
        const { toast } = await import("react-toastify");
        toast.error(`Pin must be within ${intervention.barangay} boundaries!`);
        setIsLocationValid(false);
      }
    } else {
      setIsLocationValid(false);
    }
  };

  // Validate if pin coordinates are within barangay boundaries
  const validatePinWithinBarangay = async (coordinates, barangayName) => {
    if (!barangayData || !coordinates) return false;

    try {
      const selectedFeature = barangayData.features.find(
        (feature) => feature.properties.name === barangayName
      );

      if (!selectedFeature || !selectedFeature.geometry) return false;

      // Create a point from the pin coordinates
      const pinPoint = turf.point(coordinates);

      // Check if the point is within the barangay polygon
      const isWithin = turf.booleanPointInPolygon(pinPoint, selectedFeature);

      return isWithin;
    } catch (error) {
      console.error("Error validating pin within barangay:", error);
      return false;
    }
  };

  // Handle save location button
  const handleSaveLocation = () => {
    if (isLocationValid) {
      setShowLocationPicker(false);
    }
  };

  // Handle change location button
  const handleChangeLocation = () => {
    setShowLocationPicker(true);

    // If there is an existing specific location, focus map and place pin there first
    if (
      formData.specific_location &&
      Array.isArray(formData.specific_location.coordinates) &&
      formData.specific_location.coordinates.length === 2
    ) {
      const [lng, lat] = formData.specific_location.coordinates;
      setFocusCommand({ type: "pin", lat, lng, zoom: 18 });

      // Re-validate the existing location since we're showing the location picker
      // This ensures the existing pin is properly validated and the save button appears
      const existingPinData = {
        coordinates: formData.specific_location.coordinates,
        formattedAddress: formData.address,
      };
      handlePinChange(existingPinData);
      return;
    }

    // Only set location as invalid if there's no existing location
    setIsLocationValid(false);

    // Otherwise, focus map on current barangay
    if (intervention.barangay && barangayData) {
      const selectedFeature = barangayData.features.find(
        (feature) => feature.properties.name === intervention.barangay
      );
      if (selectedFeature && selectedFeature.geometry) {
        try {
          const center = turf.centerOfMass(selectedFeature);
          if (center && center.geometry && center.geometry.coordinates) {
            const [lng, lat] = center.geometry.coordinates;
            setFocusCommand({
              type: "barangay",
              name: intervention.barangay,
              center: { lat, lng },
              zoom: 15,
            });
          }
        } catch (err) {
          console.error(
            "Error calculating center for barangay:",
            intervention.barangay,
            err
          );
        }
      }
    }
  };

  console.log(formData.date);
  // Handle save button
  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loading indicator
    setSaveError(null);
    try {
      // Use the user's selected status (already validated by dropdown options)
      const statusToSend = formData.status;

      // Format the data before sending to the backend
      const formattedData = {
        ...formData,
        status: statusToSend,
        date: new Date(formData.date).toISOString(), // Ensure proper ISO string format
        specific_location: formData.specific_location
          ? {
              type: "Point",
              coordinates: formData.specific_location.coordinates,
            }
          : null,
      };

      // Debug logs: request
      console.log("[EditIntervention] Submitting update", {
        id: intervention._id,
        payload: formattedData,
      });
      console.log(
        "[EditIntervention] Request body (JSON)",
        JSON.stringify(formattedData)
      );

      const response = await updateIntervention({
        id: intervention._id, // intervention id
        updatedData: formattedData, // the data to update
      }).unwrap();

      // Debug logs: response
      console.log("[EditIntervention] Update response", response);
      try {
        console.log(
          "[EditIntervention] Response (JSON)",
          JSON.stringify(response)
        );
      } catch {}

      // Refetch the interventions data
      if (onRefetch) {
        await onRefetch();
      }

      // Close modal and show success toast
      onClose();
      toastSuccess("Intervention updated successfully");
    } catch (error) {
      // Debug logs: error details
      console.error("[EditIntervention] Update failed", error);
      let message = "Failed to update intervention. Please try again.";
      if (error && (error.data || error.message)) {
        try {
          const details =
            error.data?.details || error.data?.message || error.message;
          if (details) message = details;
        } catch {}
      }
      setSaveError(message);
    } finally {
      setIsLoading(false); // Hide loading indicator after the request completes
    }
  };

  // Handle edit click
  const handleEditClick = () => {
    if (intervention?.status === "Complete") return; // Disallow editing completed interventions
    setIsEditing(true); // Switch to editable mode
  };

  // Handle archive click
  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true); // Show delete confirmation inside the current modal
  };

  // Handle archive confirmation
  const handleConfirmDelete = async () => {
    console.log("Start archive action...");
    setIsLoading(true);
    try {
      const response = await deleteIntervention(intervention._id);
      console.log("Archive successful:", response);

      // Show success toast
      toastSuccess("Intervention archived successfully");

      // Refetch the interventions data
      if (onRefetch) {
        await onRefetch();
      }

      // Close the modal
      onClose();
    } catch (err) {
      console.error("Error during archive:", err);
      toastError("Failed to archive intervention. Please try again.");
    } finally {
      setIsLoading(false);
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
      <div className="modal-box bg-white rounded-4xl shadow-2xl w-11/12 max-w-3xl max-h-[95vh] p-12 relative">
        <button
          className="absolute top-6 right-6 text-2xl font-semibold hover:text-gray-500 hover:cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Show archive confirmation only if it's set to true */}
        {showDeleteConfirmation ? (
          <>
            <p className="text-3xl font-bold mb-6 text-center">
              Archive this intervention?
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
                {isLoading ? "Archiving..." : "Confirm Archive"}
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
            <div className="flex justify-center mb-2">
              <p
                className={`${
                  intervention.status === "Complete"
                    ? "bg-success"
                    : intervention.status === "Scheduled"
                    ? "bg-info"
                    : intervention.status === "Ongoing"
                    ? "bg-warning"
                    : "bg-gray-300"
                } w-[40%] text-center rounded-xl py-1.5 text-white font-extrabold text-xl`}
              >
                {intervention.status}
              </p>
            </div>
            {/* Status badge shows backend status only; edit guidance is near the dropdown below */}

            {/* Display form to edit or view */}
            <form
              onSubmit={handleSave}
              className="flex flex-col space-y-2 text-lg font-semibold"
            >
              {isEditing && saveError && (
                <div className="mb-2 rounded-md border border-error/30 bg-error/10 text-error p-3 text-sm">
                  {saveError}
                </div>
              )}
              {!isEditing ? (
                <>
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
                      {new Date(intervention.date).toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  {intervention.completedAt && (
                    <div className="flex gap-1">
                      <p className="text-gray-500">Completed At: </p>
                      <p className="font-semibold text-primary">
                        {new Date(intervention.completedAt).toLocaleString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                  )}
                  {intervention.updatedAt && (
                    <div className="flex gap-1">
                      <p className="text-gray-500">Last Updated: </p>
                      <p className="font-semibold text-primary">
                        {new Date(intervention.updatedAt).toLocaleString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                  )}
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
                      className="border-2 font-normal border-primary/60 p-3 rounded-lg w-full bg-gray-100 cursor-not-allowed"
                      disabled
                    >
                      {barangayOptions.map((barangay, idx) => (
                        <option key={idx} value={barangay}>
                          {barangay}
                        </option>
                      ))}
                    </select>
                    <input
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      placeholder="Address will be set when you place a pin on the map"
                      className="border-2 font-normal border-primary/60 p-3 px-4 rounded-lg w-full bg-gray-50"
                      readOnly
                    />

                    {/* Change Location Button */}
                    <button
                      type="button"
                      onClick={handleChangeLocation}
                      className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary/80 transition-all self-start"
                    >
                      📍 Change Location
                    </button>

                    {/* Location Picker */}
                    {showLocationPicker && (
                      <div className="mt-4">
                        <label className="text-primary text-lg mb-2 block">
                          Pin Location on Map
                        </label>
                        <div className="bg-info/10 border border-info/30 rounded-lg p-3 mb-3">
                          <p className="text-sm text-info font-medium">
                            Pin must be within{" "}
                            <strong>{intervention.barangay}</strong> only
                          </p>
                          <p className="text-xs text-info/80 mt-1">
                            Pins outside this barangay will be rejected with an
                            error message.
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden border-2 border-primary/60">
                          <InterventionLocationPicker
                            onPinChange={handlePinChange}
                            initialPin={
                              formData.specific_location
                                ? {
                                    lat: formData.specific_location
                                      .coordinates[1],
                                    lng: formData.specific_location
                                      .coordinates[0],
                                  }
                                : null
                            }
                            focusCommand={focusCommand}
                            highlightedBarangay={intervention.barangay} // Use original barangay, not edited one
                          />
                        </div>
                        {!isLocationValid && (
                          <div className="text-error text-sm mt-2">
                            Please place a pin on the map to specify the exact
                            location.
                          </div>
                        )}
                        {isLocationValid && (
                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              onClick={handleSaveLocation}
                              className="bg-success text-white font-semibold py-2 px-6 rounded-lg hover:bg-success/80 transition-all"
                            >
                              Save Location
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-primary text-lg">
                      Date of Intervention
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formatDateForInput(formData.date) || ""}
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
                      <option value="Ovicidal-Larvicidal Trapping">
                        Ovicidal-Larvicidal Trapping
                      </option>
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
                      name="personnel"
                      value={formData.personnel || ""}
                      onChange={handleChange}
                      className="border-2 font-normal border-primary/60 p-3 px-4 rounded-lg w-full"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-primary text-lg">Status</label>
                      <span className="text-sm font-normal text-gray-500">
                        (Status options depend on the selected date)
                      </span>
                    </div>
                    {(() => {
                      const now = new Date();
                      const interventionDate = new Date(formData.date);
                      const isPast = interventionDate < now;
                      const isTodayDate = isToday(formData.date);
                      const isFuture = interventionDate > now;

                      // Check if intervention is within 24 hours for Ongoing option
                      const hoursDiff =
                        (now - interventionDate) / (1000 * 60 * 60);
                      const within24Hours = hoursDiff <= 24;

                      const showForcedCompleteNotice =
                        isPast &&
                        intervention.status === "Scheduled" &&
                        formData.status === "Complete";

                      return (
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="border-2 font-normal border-primary/60 p-3 rounded-lg w-full"
                        >
                          {showForcedCompleteNotice && (
                            <option disabled value="__divider__">
                              {""}
                            </option>
                          )}
                          {isFuture && !isTodayDate ? (
                            <option value="Scheduled">Scheduled</option>
                          ) : isTodayDate && !isPast ? (
                            <>
                              <option value="Scheduled">Scheduled</option>
                              <option value="Ongoing">Ongoing</option>
                            </>
                          ) : (
                            <>
                              {within24Hours && (
                                <option value="Ongoing">Ongoing</option>
                              )}
                              <option value="Complete">Complete</option>
                            </>
                          )}
                        </select>
                      );
                    })()}
                    {(() => {
                      const now = new Date();
                      const interventionDate = new Date(formData.date);
                      const isPast = interventionDate < now;
                      const showNotice =
                        isEditing &&
                        isPast &&
                        intervention?.status === "Scheduled" &&
                        formData.status === "Complete";
                      if (!showNotice) return null;
                      return (
                        <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-800 p-3 flex items-start gap-2">
                          <IconAlertTriangle size={18} className="mt-0.5" />
                          <p className="text-sm">
                            This intervention is currently marked as Scheduled,
                            but because the date of intervention is in the past,
                            it can only be set to
                            <span className="font-semibold"> Complete</span>.
                          </p>
                        </div>
                      );
                    })()}
                    {(() => {
                      const now = new Date();
                      const interventionDate = new Date(formData.date);
                      const isPast = interventionDate < now;
                      const isTodayDate = isToday(formData.date);
                      const hoursDiff =
                        (now - interventionDate) / (1000 * 60 * 60);
                      const within24Hours = hoursDiff <= 24;
                      const canBeOngoing =
                        (!isPast && isTodayDate) || (isPast && within24Hours);
                      const showOngoingNotice =
                        isEditing &&
                        intervention?.status === "Scheduled" &&
                        formData.status === "Ongoing" &&
                        canBeOngoing;
                      if (!showOngoingNotice) return null;
                      return (
                        <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-800 p-3 flex items-start gap-2">
                          <IconAlertTriangle size={18} className="mt-0.5" />
                          <p className="text-sm">
                            This intervention is currently marked as Scheduled,
                            but because the date of intervention is{" "}
                            {isTodayDate ? "today" : "within the last 24 hours"}
                            , it can be set to
                            <span className="font-semibold"> Ongoing</span>.
                          </p>
                        </div>
                      );
                    })()}
                    {(() => {
                      const now = new Date();
                      const interventionDate = new Date(formData.date);
                      const isPast = interventionDate < now;
                      const hoursDiff =
                        (now - interventionDate) / (1000 * 60 * 60);
                      const beyond24Hours = hoursDiff > 24;
                      const showOngoingToCompleteNotice =
                        isEditing &&
                        intervention?.status === "Ongoing" &&
                        isPast &&
                        beyond24Hours &&
                        formData.status === "Complete";
                      if (!showOngoingToCompleteNotice) return null;
                      return (
                        <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-800 p-3 flex items-start gap-2">
                          <IconAlertTriangle size={18} className="mt-0.5" />
                          <p className="text-sm">
                            This intervention is currently marked as Ongoing,
                            but because the date of intervention is in the past,
                            it can only be set to
                            <span className="font-semibold"> Complete</span>.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="modal-action flex justify-center gap-6">
                {isEditing ? (
                  <>
                    {!(
                      formData.status === "Complete" && completionNoticeVisible
                    ) && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          // Revert form data to backend source of truth on cancel
                          setFormData({
                            barangay: intervention.barangay,
                            address: intervention.address,
                            date: intervention.date,
                            interventionType: intervention.interventionType,
                            personnel: intervention.personnel,
                            status: intervention.status,
                            specific_location:
                              intervention.specific_location || null,
                          });
                          setShowLocationPicker(false);
                          setIsLocationValid(!!intervention.specific_location);
                        }}
                        className="bg-gray-300 text-gray-700 font-semibold py-1 px-12 rounded-xl hover:bg-gray-400 transition-all hover:cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    {intervention?.status !== "Complete" && (
                      <div className="flex flex-col items-center gap-2">
                        {formData.status === "Complete" ? (
                          <>
                            {!completionNoticeVisible ? (
                              <button
                                type="button"
                                className="bg-success text-white font-semibold py-1 px-12 rounded-xl hover:bg-success/80 transition-all hover:cursor-pointer disabled:opacity-50"
                                disabled={
                                  !isLocationValid && showLocationPicker
                                }
                                onClick={() => setCompletionNoticeVisible(true)}
                              >
                                Mark as Completed
                              </button>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <p className="text-xs text-warning-600 text-center">
                                  Completing this intervention will lock its
                                  status and details. You will not be able to
                                  change them afterward.
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="bg-gray-300 text-gray-700 font-semibold py-1 px-6 rounded-xl hover:bg-gray-400 transition-all hover:cursor-pointer"
                                    onClick={() =>
                                      setCompletionNoticeVisible(false)
                                    }
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="bg-success text-white font-semibold py-1 px-6 rounded-xl hover:bg-success/80 transition-all hover:cursor-pointer disabled:opacity-50"
                                    disabled={
                                      (!isLocationValid &&
                                        showLocationPicker) ||
                                      isLoading
                                    }
                                  >
                                    {isLoading
                                      ? "Marking..."
                                      : "Confirm Complete"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <button
                            type="submit"
                            className="bg-primary text-white font-semibold py-1 px-12 rounded-xl hover:bg-primary/80 transition-all hover:cursor-pointer disabled:opacity-50"
                            disabled={
                              (!isLocationValid && showLocationPicker) ||
                              isLoading
                            }
                          >
                            {isLoading ? "Saving..." : "Save changes"}
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {intervention?.status !== "Complete" && (
                      <button
                        type="button"
                        onClick={handleEditClick}
                        className="bg-primary text-white font-semibold py-1 px-12 rounded-xl hover:bg-primary/80 transition-all hover:cursor-pointer flex items-center gap-2"
                      >
                        <IconEdit size={18} />
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="bg-error text-white font-semibold py-1 px-12 rounded-xl hover:bg-error/80 transition-all hover:cursor-pointer flex items-center gap-2"
                      title="Archive Intervention"
                    >
                      <IconTrash size={18} />
                      Archive
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
