import React, { useState, useEffect, useRef } from "react";
import {
  IconX,
  IconCheck,
  IconTrendingUp,
  IconTrendingUp2,
  IconChartLine,
  IconTrendingDown,
  IconMinusVertical,
} from "@tabler/icons-react";
import { useCreateInterventionMutation, dengueApi } from "../../api/dengueApi"; // Import dengueApi
import InterventionLocationPicker from "./InterventionLocationPicker"; // Import the new component
import centerOfMass from "@turf/center-of-mass"; // Import correct turf fn
import dayjs from "dayjs";
import { toast } from "react-toastify"; // Import react-toastify
import {
  useGetBarangaysQuery,
  useGetAllInterventionsQuery,
} from "../../api/dengueApi";
import {
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Upload,
  Download,
} from "lucide-react";
import {
  getPatternColor,
  getPatternLabel,
  normalizePatternType,
  PATTERN_TYPES,
} from "../../utils/patternConfig";

// Default map center (Quezon City Hall)
const defaultCenter = {
  lat: 14.6488,
  lng: 121.0509,
};

const mapContainerStyle = {
  width: "100%",
  height: "300px", // Adjust as needed
  borderRadius: "0.5rem",
  marginBottom: "1rem",
};

const AddInterventionModal = ({
  isOpen,
  onClose,
  preselectedBarangay,
  patternType,
  patternUrgency,
  transformedBarangays = [],
  onRefetch,
}) => {
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    barangay: "",
    address: "", // Changed from addressLine
    interventionType: "All", // Set default value to "All"
    personnel: "",
    date: "",
    status: "Scheduled",
    specific_location: null, // Added for coordinates
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [submissionError, setSubmissionError] = useState(""); // For displaying submission errors
  const [isLocationValid, setIsLocationValid] = useState(false); // Track location validity
  const [barangayGeoJsonData, setBarangayGeoJsonData] = useState(null); // Store full GeoJSON
  const [focusCommand, setFocusCommand] = useState(null); // To control picker focus (renamed from focusBarangayPicker)
  const [isBoundaryDataLoaded, setIsBoundaryDataLoaded] = useState(false);
  const [showUrgencyLevel, setShowUrgencyLevel] = useState(true); // Track whether to show urgency level

  // Mock personnel options (replace with real data if needed)
  const personnelOptions = ["John Doe", "Jane Smith", "Carlos Rivera"];

  // RTK Query mutation hook for creating an intervention
  const [createIntervention] = useCreateInterventionMutation();

  // Add new state for current barangay's pattern data
  const [currentBarangayPattern, setCurrentBarangayPattern] = useState({
    type: patternType,
    urgency: patternUrgency,
  });

  // Add state for current highlighted barangay
  const [highlightedBarangay, setHighlightedBarangay] =
    useState(preselectedBarangay);

  // Update the intervention types array
  const interventionTypes = [
    "All",
    "Fogging",
    "Ovicidal-Larvicidal Trapping",
    "Clean-up Drive",
    "Education Campaign",
  ];

  // Update the getAllowedStatuses function
  const getAllowedStatuses = (dateStr) => {
    const now = new Date();
    const selectedDate = new Date(dateStr);
    const isPast = selectedDate < now;
    const isToday =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();
    const isFuture = selectedDate > now;

    // Check if intervention is within 24 hours for Ongoing option
    const hoursDiff = (now - selectedDate) / (1000 * 60 * 60);
    const within24Hours = hoursDiff <= 24;

    // If future date and not today, only allow "Scheduled"
    if (isFuture && !isToday) {
      return ["Scheduled"];
    }

    // If today and not past, allow "Scheduled" and "Ongoing"
    if (isToday && !isPast) {
      return ["Scheduled", "Ongoing"];
    }

    // If past date (including past times today), allow "Ongoing" (if within 24 hours) and "Complete"
    const options = [];
    if (within24Hours) {
      options.push("Ongoing");
    }
    options.push("Complete");
    return options;
  };

  // Add loading state for boundary data
  useEffect(() => {
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        setBarangayGeoJsonData(data);
        setIsBoundaryDataLoaded(true);
        const barangayNames = data.features
          .map((feature) => feature.properties.name)
          .filter((name) => name && name.trim() !== "") // Filter out empty, null, or whitespace-only names
          .sort();
        setBarangayOptions(barangayNames);
      })
      .catch((error) => {
        console.error("[Modal DEBUG] Error loading boundary data:", error);
        setSubmissionError(
          "Failed to load boundary data. Please refresh the page."
        );
      });
  }, []);

  // Set preselected barangay when modal opens
  useEffect(() => {
    if (
      isOpen &&
      preselectedBarangay &&
      barangayGeoJsonData &&
      barangayGeoJsonData.features &&
      isBoundaryDataLoaded
    ) {
      setFormData((prev) => ({ ...prev, barangay: preselectedBarangay }));
      // Set focusCommand to highlight the barangay on the map
      const selectedFeature = barangayGeoJsonData.features.find(
        (feature) => feature.properties.name === preselectedBarangay
      );
      if (selectedFeature && selectedFeature.geometry) {
        try {
          const center = centerOfMass(selectedFeature);
          if (center && center.geometry && center.geometry.coordinates) {
            const [lng, lat] = center.geometry.coordinates;
            setFocusCommand({
              type: "barangay",
              name: preselectedBarangay,
              center: { lat, lng },
              zoomLevel: 15,
            });
          } else {
          }
        } catch (err) {}
      } else {
      }
    } else {
    }
  }, [isOpen, preselectedBarangay, barangayGeoJsonData, isBoundaryDataLoaded]);

  // Update useEffect to set initial highlighted barangay
  useEffect(() => {
    if (isOpen && preselectedBarangay) {
      setHighlightedBarangay(preselectedBarangay);
      setCurrentBarangayPattern({
        type: patternType,
        urgency: patternUrgency,
      });
    }
  }, [isOpen, preselectedBarangay, patternType, patternUrgency]);

  // Helper function to get pattern data for a barangay
  const getBarangayPatternData = (barangayName) => {
    const barangayData = transformedBarangays.find(
      (b) => b.name === barangayName
    );
    if (barangayData) {
      // Use the existing patternType from transformedBarangays
      let patternType = barangayData.patternType || "none";
      let urgency = null;

      // Map pattern types to urgency levels
      const patternUrgencyMap = {
        [PATTERN_TYPES.SPIKE]: "Immediate Action Required",
        [PATTERN_TYPES.INCREASE]: "Action Required Soon",
        [PATTERN_TYPES.LOW_LEVEL_ACTIVITY]: "Monitor Situation",
        [PATTERN_TYPES.DECREASE]: "Continue Monitoring",
        [PATTERN_TYPES.NO_CHANGE]: "No Specific Pattern",
        none: null,
      };

      urgency = patternUrgencyMap[patternType];

      // Also check death priority for additional urgency
      if (
        barangayData.death_priority &&
        barangayData.death_priority.count > 0
      ) {
        urgency = "Immediate Action Required (Death Cases Detected)";
        if (patternType === "none") {
          patternType = "spike"; // Treat death cases as high priority
        }
      }

      return {
        type: patternType,
        urgency: urgency,
      };
    }
    return {
      type: "none",
      urgency: null,
    };
  };

  // Update handleChange to update highlighted barangay and pan map
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-update status if current status is not in allowed statuses
    if (name === "date") {
      const allowedStatuses = getAllowedStatuses(value);
      if (!allowedStatuses.includes(formData.status)) {
        setFormData((prev) => ({
          ...prev,
          status: allowedStatuses[0] || "Scheduled",
        }));
      }
    }

    // If barangay is changed, update the highlighted barangay, pattern data, and pan map
    if (name === "barangay") {
      setHighlightedBarangay(value);

      // Clear previous pin data when barangay changes
      setFormData((prev) => ({
        ...prev,
        location: null,
        specific_location: null,
        address: "",
      }));
      setIsLocationValid(false);
      setSubmissionError("");

      const patternData = getBarangayPatternData(value);
      // Always update the pattern data, even if it's null/empty
      setCurrentBarangayPattern(patternData);

      // Pan map to selected barangay
      if (value && barangayGeoJsonData) {
        const selectedFeature = barangayGeoJsonData.features.find(
          (feature) => feature.properties.name === value
        );
        if (selectedFeature && selectedFeature.geometry) {
          try {
            const center = centerOfMass(selectedFeature);
            if (center && center.geometry && center.geometry.coordinates) {
              const [lng, lat] = center.geometry.coordinates;
              setFocusCommand({
                type: "barangay",
                name: value,
                center: { lat, lng },
                zoomLevel: 15,
              });
            }
          } catch (err) {
            console.error("Error calculating center for barangay:", value, err);
          }
        }
      } else if (!value) {
        // Clear focus if no barangay selected
        setFocusCommand(null);
      }
    }
  };

  // Update handlePinChange to update highlighted barangay
  const handlePinChange = (pinData) => {
    if (pinData) {
      // Update the form data with both location and specific_location
      setFormData((prev) => ({
        ...prev,
        location: {
          coordinates: pinData.coordinates,
          barangay: pinData.barangayName,
          address: pinData.formattedAddress,
        },
        specific_location: {
          coordinates: pinData.coordinates,
          barangay: pinData.barangayName,
          address: pinData.formattedAddress,
        },
        // Update the barangay dropdown
        barangay: pinData.barangayName,
        // Update the address field
        address: pinData.formattedAddress,
      }));

      // Update the highlighted barangay
      setHighlightedBarangay(pinData.barangayName);

      // Get pattern data for the pinned barangay
      const patternData = getBarangayPatternData(pinData.barangayName);
      if (patternData) {
        setCurrentBarangayPattern(patternData);
      }

      // Set location as valid since we have valid pin data
      setIsLocationValid(true);
      setSubmissionError(null);
    } else {
      setIsLocationValid(false);
      setSubmissionError(
        "Please pin a specific location on the map within the selected barangay."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.barangay) {
      setSubmissionError("Please select a barangay");
      return;
    }

    if (!isLocationValid) {
      setSubmissionError(
        "Please pin a specific location on the map within the selected barangay."
      );
      return;
    }

    if (!formData.date) {
      setSubmissionError("Please select a date");
      return;
    }

    if (!formData.interventionType) {
      setSubmissionError("Please select an intervention type");
      return;
    }

    if (!formData.personnel) {
      setSubmissionError("Please enter personnel name");
      return;
    }

    if (!formData.status) {
      setSubmissionError("Please select a status");
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      // Format the data before sending to the backend
      const formattedData = {
        ...formData,
        date: new Date(formData.date).toISOString(), // Ensure proper ISO string format
        status: formData.status, // Use the user's selection directly
        specific_location: {
          type: "Point", // Add the required type field
          coordinates: formData.specific_location.coordinates,
        },
      };

      const response = await createIntervention(formattedData).unwrap();

      // Refetch the interventions data
      if (onRefetch) {
        await onRefetch();
      }

      toast.success("Intervention created successfully!");
      onClose();
    } catch (error) {
      console.error("[Modal DEBUG] Error creating intervention:", error);
      setSubmissionError(
        error.data?.message || "Failed to create intervention"
      );
      toast.error(error.data?.message || "Failed to create intervention");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmation(false);
  };

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.showModal();
      setSubmissionError("");
      // If opening and formData.barangay has a value (e.g. from previous edit session not yet submitted)
      // then try to focus the map on it, BUT only if no specific location is already pinned.
      if (formData.barangay && barangayGeoJsonData) {
        // Only set focus command to a barangay if there's NO valid pin.
        // If there is a valid pin, the map should be focused on the pin via initialPin,
        // not the entire barangay boundary from here.
        if (!formData.specific_location) {
          const selectedFeature = barangayGeoJsonData.features.find(
            (feature) => feature.properties.name === formData.barangay
          );
          if (selectedFeature && selectedFeature.geometry) {
            try {
              const center = centerOfMass(selectedFeature);
              if (center && center.geometry && center.geometry.coordinates) {
                const [lng, lat] = center.geometry.coordinates;
                setFocusCommand({
                  type: "barangay",
                  name: formData.barangay,
                  center: { lat, lng },
                  zoomLevel: 15,
                });
              }
            } catch (err) {
              console.error(
                "Error recentering on initial load for barangay focus",
                err
              );
            }
          }
        } else {
          // If a specific location IS set, ensure focusCommand is not redundantly a barangay focus.
          // It could be null or a pin focus if needed in other scenarios, but for now, we prevent overriding pin focus.
          // If focusCommand is already correctly set (e.g. to null or a pin focus by another logic path), leave it.
          // If it was a barangay focus, and now we have a pin, it implies the pin should take precedence, so a barangay focus here is wrong.
          // Consider if clearing focusCommand is right if specific_location exists.
          // For now, the key is to NOT set a BARANGAY focus if a pin exists.
        }
      } else if (!formData.barangay) {
        setFocusCommand(null); // Ensure no previous focus if barangay is cleared
      }
    }
  }, [
    isOpen,
    formData.barangay,
    barangayGeoJsonData,
    formData.specific_location,
  ]); // Added formData.specific_location

  if (!isOpen) return null;

  return (
    <dialog
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box bg-white rounded-3xl shadow-3xl w-11/12 max-w-5xl max-h-[95vh] p-12 pt-12 relative">
        <button
          className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        <p className="text-center text-3xl font-bold mb-6">
          Add New Intervention
        </p>
        <hr className="text-accent/50 mb-6" />

        {showConfirmation ? (
          <div className="space-y-6">
            {!isSuccess ? (
              <>
                <div className="flex flex-col items-center text-center">
                  <p className="text-primary mb-2 text-2xl">
                    Are you sure you want to submit this intervention?
                  </p>
                  {/* Display key details for confirmation */}
                  <div className="text-left bg-base-200 p-4 rounded-lg w-full max-w-md mb-4 text-sm">
                    <p>
                      <strong>Barangay:</strong> {formData.barangay}
                    </p>
                    <p>
                      <strong>Address:</strong> {formData.address}
                    </p>
                    <p>
                      <strong>Type:</strong> {formData.interventionType}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(formData.date).toLocaleString()}
                    </p>
                    <p>
                      <strong>Personnel:</strong> {formData.personnel}
                    </p>
                    {formData.specific_location && (
                      <p>
                        <strong>Coordinates:</strong> Lng:{" "}
                        {formData.specific_location.coordinates[0].toFixed(4)},
                        Lat:{" "}
                        {formData.specific_location.coordinates[1].toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Error Message in Confirmation View */}
                {submissionError && (
                  <div className="text-center p-4 bg-error/10 rounded-lg border border-error/20">
                    <p className="text-error font-semibold mb-1">Error</p>
                    <p className="text-error/90">{submissionError}</p>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={cancelSubmit}
                    className="bg-gray-300 text-gray-800 font-semibold py-2 px-8 rounded-xl hover:bg-gray-400 transition-all hover:cursor-pointer"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-success text-white font-semibold py-2 px-8 rounded-xl hover:bg-success/80 transition-all hover:cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      "Confirm & Submit"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="rounded-full bg-success p-3 mt-[-5px] mb-4 text-white">
                  <IconCheck size={32} stroke={3} />
                </div>
                <p className="text-3xl font-bold mb-2 text-center text-success">
                  Intervention Submitted!
                </p>
                <p className="text-gray-600 text-center">
                  The intervention has been successfully recorded.
                </p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6 text-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                {/* Left Column: Form Fields */}
                <div className="flex flex-col gap-5">
                  {/* Location (Barangay & Address) */}
                  <div className="form-control">
                    <div className="space-y-2">
                      <label className="label text-primary text-lg font-bold">
                        Location Details
                      </label>
                      {/* Pattern Tag - Now shows for any barangay with pattern data */}
                    </div>
                    {currentBarangayPattern &&
                      currentBarangayPattern.type &&
                      currentBarangayPattern.urgency && (
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium w-fit mb-2 mt-2
                          ${
                            currentBarangayPattern.type === "spike"
                              ? "bg-error/10 text-error border border-error/20"
                              : ""
                          }
                                              ${
                                                currentBarangayPattern.type ===
                                                PATTERN_TYPES.INCREASE
                                                  ? "bg-warning/10 text-warning border border-warning/20"
                                                  : ""
                                              }
                    ${
                      currentBarangayPattern.type ===
                      PATTERN_TYPES.LOW_LEVEL_ACTIVITY
                        ? "bg-info/10 text-info border border-info/20"
                        : ""
                    }
                    ${
                      currentBarangayPattern.type === PATTERN_TYPES.DECREASE
                        ? "bg-success/10 text-success border border-success/20"
                        : ""
                    }
                          ${
                            currentBarangayPattern.type === "none"
                              ? "bg-gray-100 text-gray-500 border border-gray-200"
                              : ""
                          }
                        `}
                        >
                          {currentBarangayPattern.type ===
                          PATTERN_TYPES.SPIKE ? (
                            <IconTrendingUp size={18} className="text-error" />
                          ) : currentBarangayPattern.type ===
                            PATTERN_TYPES.INCREASE ? (
                            <IconTrendingUp2
                              size={18}
                              className="text-warning"
                            />
                          ) : currentBarangayPattern.type ===
                            PATTERN_TYPES.LOW_LEVEL_ACTIVITY ? (
                            <IconMinusVertical
                              size={18}
                              className="text-info"
                            />
                          ) : currentBarangayPattern.type ===
                            PATTERN_TYPES.DECREASE ? (
                            <IconTrendingDown
                              size={18}
                              className="text-success"
                            />
                          ) : null}
                          {currentBarangayPattern.urgency}
                        </div>
                      )}

                    <div className="space-y-4 ">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-base font-medium">
                            Barangay
                          </span>
                        </label>
                        <select
                          name="barangay"
                          value={formData.barangay}
                          onChange={handleChange}
                          className="select select-bordered w-full text-base"
                          required
                        >
                          <option value="">Select Barangay</option>
                          {barangayOptions.map((bName, index) => (
                            <option key={index} value={bName}>
                              {bName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-base font-medium">
                            Address
                          </span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          placeholder="Address will be set when you place a pin on the map"
                          className="input input-bordered w-full text-base bg-gray-50"
                          readOnly
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Intervention Type Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold">
                        Intervention Type
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full text-lg"
                      value={formData.interventionType}
                      onChange={handleChange}
                      name="interventionType"
                      required
                    >
                      {interventionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Personnel Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold">
                        Personnel
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full text-lg"
                      value={formData.personnel}
                      onChange={handleChange}
                      name="personnel"
                      required
                    />
                  </div>

                  {/* Date Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold">
                        Date
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      className="input input-bordered w-full text-lg"
                      value={formData.date}
                      onChange={handleChange}
                      name="date"
                      required
                      step="60"
                    />
                  </div>

                  {/* Status Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold">
                        Status
                      </span>
                      <span className="label-text-alt text-xs text-gray-500">
                        (Status options depend on the selected date)
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full text-lg"
                      value={formData.status}
                      onChange={handleChange}
                      name="status"
                      required
                      disabled={!formData.date}
                    >
                      {!formData.date && (
                        <option value="" disabled>
                          Select a date first
                        </option>
                      )}
                      {getAllowedStatuses(formData.date).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column: Map */}
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold">
                        Location
                      </span>
                    </label>
                    <div className="rounded-xl overflow-hidden ">
                      <InterventionLocationPicker
                        onPinChange={handlePinChange}
                        initialPin={
                          formData.specific_location
                            ? {
                                lat: formData.specific_location.coordinates[1],
                                lng: formData.specific_location.coordinates[0],
                              }
                            : null
                        }
                        focusCommand={focusCommand}
                        patternType={patternType}
                        preselectedBarangay={preselectedBarangay}
                        highlightedBarangay={highlightedBarangay}
                      />
                    </div>
                  </div>

                  {/* Location Validation Message */}
                  {!isLocationValid && (
                    <div className="text-error text-sm">
                      Please place a pin on the map to specify the exact
                      location.
                    </div>
                  )}

                  {/* Error Message */}
                  {submissionError && (
                    <div className="text-error text-sm">{submissionError}</div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary text-white text-lg px-8"
                  disabled={!isLocationValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
};

export default AddInterventionModal;
