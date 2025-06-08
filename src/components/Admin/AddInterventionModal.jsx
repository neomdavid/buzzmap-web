import React, { useState, useEffect, useRef } from "react";
import { 
  IconX, 
  IconCheck, 
  IconTrendingUp, 
  IconTrendingUp2, 
  IconChartLine,
  IconTrendingDown,
  IconMinusVertical
} from "@tabler/icons-react";
import { useCreateInterventionMutation, dengueApi } from "../../api/dengueApi"; // Import dengueApi
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

const AddInterventionModal = ({ isOpen, onClose, preselectedBarangay, patternType, patternUrgency, transformedBarangays = [] }) => {
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
    urgency: patternUrgency
  });

  // Add state for current highlighted barangay
  const [highlightedBarangay, setHighlightedBarangay] = useState(preselectedBarangay);

  // Update the intervention types array
  const interventionTypes = [
    "All",
    "Fogging",
    "Ovicidal-Larvicidal Trapping",
    "Clean-up Drive",
    "Education Campaign"
  ];

  // Update the getAllowedStatuses function
  const getAllowedStatuses = (dateStr) => {
    const now = new Date();
    const selectedDate = new Date(dateStr);
    
    // Reset hours, minutes, seconds, and milliseconds for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    // If date is in the past, only allow "Complete"
    if (selectedDay < today) {
      return ["Complete"];
    }
    
    // If date is today, allow "Scheduled" and "Ongoing"
    if (selectedDay.getTime() === today.getTime()) {
      return ["Scheduled", "Ongoing"];
    }
    
    // If date is in the future, only allow "Scheduled"
    return ["Scheduled"];
  };

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

  // Set preselected barangay when modal opens
  useEffect(() => {
    if (isOpen && preselectedBarangay && barangayGeoJsonData && barangayGeoJsonData.features && isBoundaryDataLoaded) {
      setFormData((prev) => ({ ...prev, barangay: preselectedBarangay }));
      // Set focusCommand to highlight the barangay on the map
      console.log('[AddInterventionModal] useEffect: isOpen:', isOpen, 'preselectedBarangay:', preselectedBarangay);
      const selectedFeature = barangayGeoJsonData.features.find(
        (feature) => feature.properties.name === preselectedBarangay
      );
      if (selectedFeature && selectedFeature.geometry) {
        try {
          const center = turf.centerOfMass(selectedFeature);
          if (center && center.geometry && center.geometry.coordinates) {
            const [lng, lat] = center.geometry.coordinates;
            console.log('[AddInterventionModal] Found center for', preselectedBarangay, 'at', lat, lng);
            setFocusCommand({
              type: 'barangay',
              name: preselectedBarangay,
              center: { lat, lng },
              zoomLevel: 15,
            });
          } else {
            console.log('[AddInterventionModal] No center found for', preselectedBarangay);
          }
        } catch (err) {
          console.log('[AddInterventionModal] Error calculating center for', preselectedBarangay, err);
        }
      } else {
        console.log('[AddInterventionModal] No feature/geometry found for', preselectedBarangay);
      }
    } else {
      if (!isOpen) console.log('[AddInterventionModal] Modal not open');
      if (!preselectedBarangay) console.log('[AddInterventionModal] No preselectedBarangay');
      if (!barangayGeoJsonData) console.log('[AddInterventionModal] barangayGeoJsonData not loaded');
      if (!isBoundaryDataLoaded) console.log('[AddInterventionModal] Boundary data not loaded');
    }
  }, [isOpen, preselectedBarangay, barangayGeoJsonData, isBoundaryDataLoaded]);

  // Update useEffect to set initial highlighted barangay
  useEffect(() => {
    if (isOpen && preselectedBarangay) {
      setHighlightedBarangay(preselectedBarangay);
      setCurrentBarangayPattern({
        type: patternType,
        urgency: patternUrgency
      });
    }
  }, [isOpen, preselectedBarangay, patternType, patternUrgency]);

  // Helper function to get pattern data for a barangay
  const getBarangayPatternData = (barangayName) => {
    console.log('[DEBUG] Getting pattern data for:', barangayName);
    console.log('[DEBUG] Available barangays:', transformedBarangays);
    
    const barangayData = transformedBarangays.find(b => b.name === barangayName);
    if (barangayData) {
      console.log('[DEBUG] Found barangay data:', {
        name: barangayData.name,
        pattern: barangayData.pattern,
        issueDetected: barangayData.issueDetected,
        suggestedAction: barangayData.suggestedAction,
        rawData: barangayData
      });
      
      // Determine pattern type and urgency
      let patternType = 'none';
      let urgency = null;

      // Check pattern based on issueDetected text content
      if (barangayData.issueDetected) {
        const issueText = barangayData.issueDetected.toLowerCase();
        
        if (issueText.includes('spike') || issueText.includes('sudden increase')) {
          patternType = 'spike';
          urgency = 'Immediate Action Required';
          console.log('[DEBUG] Pattern determined as spike');
        } else if (issueText.includes('gradual rise') || issueText.includes('increasing trend')) {
          patternType = 'gradual_rise';
          urgency = 'Action Required Soon';
          console.log('[DEBUG] Pattern determined as gradual_rise');
        } else if (issueText.includes('stable') || issueText.includes('consistent')) {
          patternType = 'stability';
          urgency = 'Monitor Situation';
          console.log('[DEBUG] Pattern determined as stability');
        } else if (issueText.includes('decline') || issueText.includes('decreasing')) {
          patternType = 'decline';
          urgency = 'Continue Monitoring';
          console.log('[DEBUG] Pattern determined as decline');
        } else {
          console.log('[DEBUG] No specific pattern found in issue text');
        }
      }

      console.log('[DEBUG] Final pattern determination:', {
        patternType,
        urgency,
        barangayName
      });

      return {
        type: patternType,
        urgency: urgency
      };
    }
    console.log('[DEBUG] No barangay data found for:', barangayName);
    return null;
  };

  // Update handleChange to update highlighted barangay
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If barangay is changed, update the highlighted barangay and pattern data
    if (name === 'barangay') {
      setHighlightedBarangay(value);
      const patternData = getBarangayPatternData(value);
      if (patternData) {
        setCurrentBarangayPattern(patternData);
      }
    }
  };

  // Update handlePinChange to update highlighted barangay
  const handlePinChange = (pinData) => {
    console.log('[DEBUG] Pin data received:', pinData);
    
    if (pinData) {
      console.log('[DEBUG] Valid pin data:', pinData);
      
      // Update the form data with both location and specific_location
      setFormData(prev => ({
        ...prev,
        location: {
          coordinates: pinData.coordinates,
          barangay: pinData.barangayName,
          address: pinData.formattedAddress
        },
        specific_location: {
          coordinates: pinData.coordinates,
          barangay: pinData.barangayName,
          address: pinData.formattedAddress
        },
        // Update the barangay dropdown
        barangay: pinData.barangayName,
        // Update the address field
        address: pinData.formattedAddress
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
      console.log('[DEBUG] Invalid pin data:', pinData);
      setIsLocationValid(false);
      setSubmissionError('Please pin a specific location on the map within the selected barangay.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[Modal DEBUG] Form submission attempt:', {
      hasBarangay: !!formData.barangay,
      hasSpecificLocation: !!formData.specific_location,
      isLocationValid,
      isBoundaryDataLoaded: !!barangayGeoJsonData,
      formData
    });

    if (!formData.barangay) {
      setSubmissionError('Please select a barangay');
      return;
    }

    if (!isLocationValid) {
      setSubmissionError('Please pin a specific location on the map within the selected barangay.');
      return;
    }

    if (!formData.date) {
      setSubmissionError('Please select a date');
      return;
    }

    if (!formData.interventionType) {
      setSubmissionError('Please select an intervention type');
      return;
    }

    if (!formData.personnel) {
      setSubmissionError('Please enter personnel name');
      return;
    }

    if (!formData.status) {
      setSubmissionError('Please select a status');
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      // Format the data before sending to the backend
      const formattedData = {
        ...formData,
        status: formData.status === 'Completed' ? 'Complete' : formData.status, // Convert to correct case
        specific_location: {
          type: "Point", // Add the required type field
          coordinates: formData.specific_location.coordinates
        }
      };

      await createIntervention(formattedData).unwrap();
      console.log('[Modal DEBUG] Intervention created successfully');
      onClose();
    } catch (error) {
      console.error('[Modal DEBUG] Error creating intervention:', error);
      setSubmissionError(error.data?.message || 'Failed to create intervention');
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
    <dialog
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box bg-white rounded-3xl shadow-3xl w-11/12 max-w-5xl p-12 pt-12 relative">
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
                    {currentBarangayPattern.type && currentBarangayPattern.urgency && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium w-fit mb-2 mt-2
                          ${currentBarangayPattern.type === 'spike' ? 'bg-error/10 text-error border border-error/20' : ''}
                          ${currentBarangayPattern.type === 'gradual_rise' ? 'bg-warning/10 text-warning border border-warning/20' : ''}
                          ${currentBarangayPattern.type === 'stability' ? 'bg-info/10 text-info border border-info/20' : ''}
                          ${currentBarangayPattern.type === 'decline' ? 'bg-success/10 text-success border border-success/20' : ''}
                          ${currentBarangayPattern.type === 'none' ? 'bg-gray-100 text-gray-500 border border-gray-200' : ''}
                        `}>
                          {currentBarangayPattern.type === 'spike' ? (
                            <IconTrendingUp size={18} className="text-error" />
                          ) : currentBarangayPattern.type === 'gradual_rise' ? (
                            <IconTrendingUp2 size={18} className="text-warning" />
                          ) : currentBarangayPattern.type === 'stability' ? (
                            <IconMinusVertical size={18} className="text-info" />
                          ) : currentBarangayPattern.type === 'decline' ? (
                            <IconTrendingDown size={18} className="text-success" />
                          ) : null}
                          {currentBarangayPattern.urgency}
                        </div>
                      )}
                    
                    <div className="space-y-4 ">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-base font-medium">Barangay</span>
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
                          <span className="label-text text-base font-medium">Address</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter specific location"
                          className="input input-bordered w-full text-base"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Intervention Type Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold">Intervention Type</span>
                    </label>
                    <select
                      className="select select-bordered w-full text-lg"
                      value={formData.interventionType}
                      onChange={handleChange}
                      name="interventionType"
                      required
                    >
                      <option value="">Select Intervention Type</option>
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
                      <span className="label-text text-lg font-semibold">Personnel</span>
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
                      <span className="label-text text-lg font-semibold">Date</span>
                    </label>
                    <input
                      type="datetime-local"
                      className="input input-bordered w-full text-lg"
                      value={formData.date}
                      onChange={handleChange}
                      name="date"
                      required
                    />
                  </div>

                  {/* Status Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold">Status</span>
                    </label>
                    <select
                      className="select select-bordered w-full text-lg"
                      value={formData.status}
                      onChange={handleChange}
                      name="status"
                      required
                    >
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
                      <span className="label-text text-lg font-semibold">Location</span>
                    </label>
                    <div className="rounded-xl overflow-hidden ">
                      <InterventionLocationPicker 
                        onPinChange={handlePinChange}
                        initialPin={formData.specific_location ? { lat: formData.specific_location.coordinates[1], lng: formData.specific_location.coordinates[0] } : null}
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
                      Please place a pin on the map to specify the exact location.
                    </div>
                  )}

                  {/* Error Message */}
                  {submissionError && (
                    <div className="text-error text-sm">
                      {submissionError}
                    </div>
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
