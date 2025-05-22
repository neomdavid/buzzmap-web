import React, { useState, useEffect, useRef } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { useCreateInterventionMutation } from "../../api/dengueApi"; // Import RTK query hook for create intervention
import InterventionLocationPicker from "./InterventionLocationPicker"; // Import the new component
import * as turf from '@turf/turf'; // Import turf for calculations
import dayjs from "dayjs";
import { showCustomToast } from "../../utils"; // Import the custom toast function

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

const AddInterventionModal = ({ isOpen, onClose }) => {
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

  // Mock personnel options (replace with real data if needed)
  const personnelOptions = ["John Doe", "Jane Smith", "Carlos Rivera"];

  // RTK Query mutation hook for creating an intervention
  const [createIntervention] = useCreateInterventionMutation();

  // Helper to get allowed statuses based on date
  const getAllowedStatuses = (dateStr) => {
    if (!dateStr) return ["Scheduled", "Ongoing", "Complete"];
    const today = dayjs().startOf('day');
    const selected = dayjs(dateStr).startOf('day');
    if (selected.isBefore(today)) return ["Complete"];
    if (selected.isSame(today)) return ["Ongoing", "Complete"];
    return ["Scheduled"];
  };
  const allowedStatuses = getAllowedStatuses(formData.date);

  // If the current status is not allowed, reset it
  useEffect(() => {
    if (!allowedStatuses.includes(formData.status)) {
      setFormData((prev) => ({ ...prev, status: allowedStatuses[0] }));
    }
    // eslint-disable-next-line
  }, [formData.date]);

  // Add loading state for boundary data
  useEffect(() => {
    console.log('[Modal DEBUG] Fetching boundary data...');
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        console.log('[Modal DEBUG] Boundary data loaded successfully');
        setBarangayGeoJsonData(data);
        setIsBoundaryDataLoaded(true);
        const barangayNames = data.features
          .map((feature) => feature.properties.name)
          .sort();
        setBarangayOptions(barangayNames);
      })
      .catch((error) => {
        console.error('[Modal DEBUG] Error loading boundary data:', error);
        setSubmissionError("Failed to load boundary data. Please refresh the page.");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (submissionError) setSubmissionError(""); // Clear error on form change

    if (name === 'barangay') {
      // When barangay changes via dropdown, clear specific pinned location, its validity, and any existing pin-related error.
      setFormData(prev => ({ ...prev, specific_location: null }));
      setIsLocationValid(false);
      setSubmissionError(''); // Explicitly clear submission error here

      if (value && barangayGeoJsonData && barangayGeoJsonData.features) {
        const selectedFeature = barangayGeoJsonData.features.find(
          (feature) => feature.properties.name === value
        );
        if (selectedFeature) {
          try {
            // Use turf.centerOfMass for a more robust center, fallback to centroid if error
            let center;
            if (selectedFeature.geometry) {
                // turf.centerOfMass expects a Feature or FeatureCollection.
                // If geometry is simple, turf.centroid can be more direct for simple polygons.
                // However, centerOfMass is generally better for complex/multi-polygons.
                center = turf.centerOfMass(selectedFeature);
            }
            
            if (center && center.geometry && center.geometry.coordinates) {
              const [lng, lat] = center.geometry.coordinates;
              setFocusCommand({ // Renamed from setFocusBarangayPicker
                type: 'barangay', // Explicitly set type
                name: value,
                center: { lat, lng },
                zoomLevel: 15, // Standard zoom for a barangay
              });
              console.log(`[Modal] Focusing map on ${value}: Lat ${lat}, Lng ${lng}`);
            } else {
              console.warn('[Modal] Could not calculate center for barangay:', value);
              setFocusCommand(null); // Renamed from setFocusBarangayPicker
            }
          } catch (err) {
            console.error('[Modal] Error calculating center for barangay:', value, err);
            setFocusCommand(null); // Renamed from setFocusBarangayPicker
          }
        } else {
          setFocusCommand(null); // Renamed from setFocusBarangayPicker
        }
      } else {
        setFocusCommand(null); // Renamed from setFocusBarangayPicker
      }
    }
  };

  const handlePinChange = (pinData) => {
    console.log('[Modal DEBUG] handlePinChange received pinData:', pinData);

    if (!isBoundaryDataLoaded) {
      console.log('[Modal DEBUG] Boundary data not yet loaded, cannot validate pin');
      setSubmissionError("Please wait for the map to load completely before placing a pin.");
      return;
    }

    if (pinData && pinData.isWithinQC && pinData.coordinates && pinData.barangayName) {
      console.log('[Modal DEBUG] Pin is valid. Setting location data:', {
        coordinates: pinData.coordinates,
        barangay: pinData.barangayName,
        address: pinData.formattedAddress
      });

      setFormData(prev => {
        const newAddress = typeof pinData.formattedAddress === 'string' ? pinData.formattedAddress : prev.address;
        return {
          ...prev,
          specific_location: {
            type: "Point",
            coordinates: pinData.coordinates,
          },
          barangay: pinData.barangayName || prev.barangay,
          address: newAddress,
        };
      });
      setIsLocationValid(true);
      setSubmissionError("");
    } else { 
      console.log('[Modal DEBUG] Pin validation failed:', {
        isWithinQC: pinData?.isWithinQC,
        hasCoordinates: !!pinData?.coordinates,
        hasBarangayName: !!pinData?.barangayName,
        error: pinData?.error,
        boundaryDataLoaded: isBoundaryDataLoaded
      });

      setFormData(prev => ({
        ...prev,
        specific_location: null,
      }));
      setIsLocationValid(false);

      if (pinData) {
        if (!pinData.isWithinQC) {
          setSubmissionError("Pinned location is outside Quezon City boundaries.");
        } else if (!pinData.coordinates || !pinData.barangayName) {
          setSubmissionError("Unable to determine barangay for this location. Please try pinning again.");
        } else if (pinData.error) {
          setSubmissionError(pinData.error);
        }
      } else if (!isBoundaryDataLoaded) {
        setSubmissionError("Please wait for the map to load completely before placing a pin.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[Modal DEBUG] Form submission attempt:', {
      hasBarangay: !!formData.barangay,
      hasSpecificLocation: !!formData.specific_location,
      isLocationValid,
      isBoundaryDataLoaded,
      formData
    });

    if (!isBoundaryDataLoaded) {
      const errorMsg = "Please wait for the map to load completely before submitting.";
      showCustomToast(errorMsg, "error");
      setSubmissionError(errorMsg);
      return;
    }

    if (!formData.barangay) {
      const errorMsg = "Please select a barangay.";
      showCustomToast(errorMsg, "error");
      setSubmissionError(errorMsg);
      return;
    }
    if (!formData.specific_location || !isLocationValid) {
      const errorMsg = "Please pin a specific location on the map within the selected barangay.";
      showCustomToast(errorMsg, "error");
      setSubmissionError(errorMsg);
      return;
    }
    setSubmissionError("");
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(""); 
    try {
      // Format the date to ISO string
      const formattedDate = formData.date ? new Date(formData.date).toISOString() : null;

      // Ensure coordinates are in the correct format [longitude, latitude]
      const formattedLocation = formData.specific_location ? {
        type: "Point",
        coordinates: [
          parseFloat(formData.specific_location.coordinates[0]),
          parseFloat(formData.specific_location.coordinates[1])
        ]
      } : null;

      // Prepare the submission data
      const submissionData = {
        barangay: formData.barangay,
        address: formData.address || "",
        interventionType: formData.interventionType,
        personnel: formData.personnel,
        date: formattedDate,
        status: formData.status,
        specific_location: formattedLocation
      };

      console.log("[DEBUG] Starting intervention submission with data:", JSON.stringify(submissionData, null, 2));
      
      const response = await createIntervention(submissionData).unwrap();
      console.log("[DEBUG] API Response:", JSON.stringify(response, null, 2));
      
      setIsSuccess(true);
      setFormData({
        barangay: "",
        address: "",
        interventionType: "All",
        personnel: "",
        date: "",
        status: "Scheduled",
        specific_location: null,
      });
      setIsLocationValid(false); 
      setFocusCommand(null);

      setTimeout(() => {
        onClose(); 
        setShowConfirmation(false);
        setIsSuccess(false);
      }, 2000); 
    } catch (error) {
      // Enhanced error logging
      console.error("[DEBUG] Error submitting intervention:", {
        error: error,
        errorData: error.data,
        errorMessage: error.data?.error || error.data?.message,
        fullError: JSON.stringify(error, null, 2),
        status: error.status,
        originalError: error.originalError,
        stack: error.stack
      });

      // Extract error message from different possible locations in the error object
      let errorMessage = "Failed to submit intervention. Please try again.";
      
      if (error.data) {
        if (typeof error.data === 'string') {
          errorMessage = error.data;
        } else if (error.data.error) {
          errorMessage = error.data.error;
        } else if (error.data.message) {
          // Clean up MongoDB validation error messages
          if (error.data.message.includes('validation failed')) {
            const validationError = error.data.message.split(': ')[1];
            errorMessage = `Validation Error: ${validationError}`;
          } else {
            errorMessage = error.data.message;
          }
        } else if (error.data.details) {
          errorMessage = error.data.details;
        }
      } else if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // If we have a network error or server error, add more context
      if (error.status === 'FETCH_ERROR') {
        errorMessage = "Network error: Unable to connect to the server. Please check your internet connection.";
      } else if (error.status === 'PARSING_ERROR') {
        errorMessage = "Server response error: Unable to parse server response.";
      } else if (error.status === 'CUSTOM_ERROR') {
        errorMessage = `Server error: ${errorMessage}`;
      }

      // Show error using custom toast - ensure it's called after error message is set
      console.log("[DEBUG] Showing error toast with message:", errorMessage);
      showCustomToast(errorMessage, "error");
      
      setSubmissionError(errorMessage);
      setIsSuccess(false);
      setShowConfirmation(false);
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
      if(formData.barangay && barangayGeoJsonData) {
        // Only set focus command to a barangay if there's NO valid pin.
        // If there is a valid pin, the map should be focused on the pin via initialPin,
        // not the entire barangay boundary from here.
        if (!formData.specific_location) { 
          const selectedFeature = barangayGeoJsonData.features.find(
            (feature) => feature.properties.name === formData.barangay
          );
          if (selectedFeature && selectedFeature.geometry) {
            try {
              const center = turf.centerOfMass(selectedFeature);
              if (center && center.geometry && center.geometry.coordinates) {
                const [lng, lat] = center.geometry.coordinates;
                setFocusCommand({ 
                  type: 'barangay',
                  name: formData.barangay,
                  center: { lat, lng },
                  zoomLevel: 15,
                });
              }
            } catch (err) { console.error("Error recentering on initial load for barangay focus", err); }
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
  }, [isOpen, formData.barangay, barangayGeoJsonData, formData.specific_location]); // Added formData.specific_location

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <dialog
        ref={modalRef}
        className="modal transition-transform duration-300 ease-in-out"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-box bg-white rounded-3xl shadow-3xl w-11/12 max-w-5xl p-12 relative"> {/* Increased width */}
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

          <div className="space-y-6 text-lg">
            {!showConfirmation ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5"> {/* Adjusted gap */}
                  {/* Left Column: Form Fields */}
                  <div className="flex flex-col gap-5">
                    {/* Location (Barangay & Address) */}
                    <div className="form-control">
                      <label className="label text-primary text-lg font-bold mb-1">
                        Location Details
                      </label>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          {/* Barangay Dropdown */}
                          <select
                            name="barangay"
                            value={formData.barangay}
                            onChange={handleChange}
                            className="select rounded-lg bg-base-200 w-full border-0 text-lg py-2 cursor-pointer hover:bg-base-300 transition-all"
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
                        <div>
                          {/* Address (changed from addressLine) */}
                          <input
                            type="text"
                            name="address" // Changed from addressLine
                            value={formData.address}
                            onChange={handleChange}
                            className="input border-0 w-full rounded-lg bg-base-200 text-lg py-2 cursor-pointer hover:bg-base-300 transition-all"
                            placeholder="Street Address / Building Name (Optional)"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Type of Intervention */}
                    <div className="form-control">
                      <label className="label text-primary text-lg font-bold mb-1">
                        Type of Intervention
                      </label>
                      <select
                        name="interventionType"
                        value={formData.interventionType}
                        onChange={handleChange}
                        className="select border-0 rounded-lg w-full bg-base-200 text-lg py-2 cursor-pointer hover:bg-base-300 transition-all"
                        required
                      >
                        <option value="All">All</option>
                        <option value="Fogging">Fogging</option>
                        <option value="Ovicidal-Larvicidal Trapping">Ovicidal-Larvicidal Trapping</option>
                        <option value="Clean-up Drive">Clean-up Drive</option>
                        <option value="Education Campaign">Education Campaign</option>
                      </select>
                    </div>

                    {/* Assigned Personnel */}
                    <div className="form-control">
                      <label className="label text-primary text-lg font-bold mb-1">
                        Assigned Personnel
                      </label>
                      <input
                        type="text" // Changed from select to input for flexibility
                        name="personnel"
                        value={formData.personnel}
                        onChange={handleChange}
                        className="input border-0 w-full rounded-lg bg-base-200 text-lg py-2 cursor-pointer hover:bg-base-300 transition-all"
                        placeholder="e.g., John Doe, Jane Smith"
                        required
                      />
                    </div>

                    {/* Date and Time */}
                    <div className="form-control">
                      <label className="label text-primary text-lg font-bold mb-1">
                        Date and Time
                      </label>
                      <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="input border-0 w-full rounded-lg bg-base-200 text-lg py-2 cursor-pointer hover:bg-base-300 transition-all"
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="form-control">
                      <label className="label text-primary text-lg font-bold mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="select border-0 rounded-lg w-full bg-base-200 text-lg py-2 cursor-pointer hover:bg-base-300 transition-all"
                        required
                      >
                        {allowedStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column: Map and Coordinates */}
                  <div className="flex flex-col">
                    <label className="label text-primary text-lg font-bold mb-1">
                      Pin Intervention Location on Map 
                    </label>
                    <InterventionLocationPicker 
                      onPinChange={handlePinChange} // Renamed from onLocationSelect
                      initialPin={formData.specific_location ? { lat: formData.specific_location.coordinates[1], lng: formData.specific_location.coordinates[0] } : null} // Renamed from initialPosition
                      focusCommand={focusCommand} // Renamed from focusBarangay
                    />
                    {/* Error for picker is handled by submissionError or picker's internal messages */}
                  </div>
                </div>
                
                {/* Updated error message display */}
                {submissionError && (
                  <div className="text-center p-4 bg-error/10 rounded-lg border border-error/20 mb-4">
                    <p className="text-error font-semibold mb-2">Error</p>
                    <p className="text-error/90 whitespace-pre-line">{submissionError}</p>
                    <button 
                      onClick={() => setSubmissionError("")}
                      className="mt-2 text-error/70 hover:text-error text-sm underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="modal-action w-full flex justify-center mt-6">
                  <button
                    type="submit"
                    className="bg-success text-white font-semibold py-3 px-8 rounded-xl hover:bg-success/80 transition-all hover:cursor-pointer text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      "Submit Intervention"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {!isSuccess ? (
                  <>
                    <div className="flex flex-col items-center text-center">
                      <p className="text-primary mb-2 text-2xl">
                        Are you sure you want to submit this intervention?
                      </p>
                      {/* Display key details for confirmation */}
                      <div className="text-left bg-base-200 p-4 rounded-lg w-full max-w-md mb-4 text-sm">
                        <p><strong>Barangay:</strong> {formData.barangay}</p>
                        <p><strong>Address:</strong> {formData.address}</p>
                        <p><strong>Type:</strong> {formData.interventionType}</p>
                        <p><strong>Date:</strong> {new Date(formData.date).toLocaleString()}</p>
                        <p><strong>Personnel:</strong> {formData.personnel}</p>
                        {formData.specific_location && (
                          <p>
                            <strong>Coordinates:</strong> Lng: {formData.specific_location.coordinates[0].toFixed(4)}, Lat: {formData.specific_location.coordinates[1].toFixed(4)}
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
                        onClick={confirmSubmit}
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
            )}
          </div>
        </div>
      </dialog>
    </>
  );
};

export default AddInterventionModal;
