import React, { useState, useEffect, useRef } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { useCreateInterventionMutation } from "../../api/dengueApi"; // Import RTK query hook for create intervention

const AddInterventionModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    barangay: "",
    addressLine: "",
    interventionType: "",
    personnel: "",
    date: "",
    status: "Scheduled",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [barangayData, setBarangayData] = useState(null);
  const [barangayOptions, setBarangayOptions] = useState([]);

  // Mock personnel options (replace with real data if needed)
  const personnelOptions = ["John Doe", "Jane Smith", "Carlos Rivera"];

  // RTK Query mutation hook for creating an intervention
  const [createIntervention] = useCreateInterventionMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit intervention data via RTK Query
      await createIntervention(formData).unwrap();

      setIsSuccess(true);
      // Reset form after successful submission
      setFormData({
        barangay: "",
        addressLine: "",
        interventionType: "",
        personnel: "",
        date: "",
        status: "Scheduled",
      });

      // Show success toast
      // Close modal after showing success message
      setTimeout(() => {
        onClose(); // Close the modal after successful submission
        setShowConfirmation(false);
        setIsSuccess(false);
      }, 2000); // Auto-close after 2 seconds
    } catch (error) {
      console.error("Error submitting intervention:", error);
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    <>
      {/* Main Modal */}
      <dialog
        ref={modalRef}
        className="modal transition-transform duration-300 ease-in-out"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-box bg-white rounded-3xl shadow-3xl w-9/12 max-w-5xl p-12 relative">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Location (Barangay & Address Line) */}
                  <div className="form-control">
                    <label className="label text-primary text-lg font-bold mb-1">
                      Location
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
                          {barangayOptions.map((barangay, index) => (
                            <option key={index} value={barangay}>
                              {barangay}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        {/* Address Line (Optional) */}
                        <input
                          type="text"
                          name="addressLine"
                          value={formData.addressLine}
                          onChange={handleChange}
                          className="input border-0 w-full rounded-lg bg-base-200 text-lg py-2 cursor-pointer hover:bg-base-300 transition-all"
                          placeholder="Specific Address Line (Optional)"
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
                      <option value="">Select Type</option>
                      <option value="Fogging">Fogging</option>
                      <option value="Larviciding">Larviciding</option>
                      <option value="Clean-up Drive">Clean-up Drive</option>
                      <option value="Education Campaign">
                        Education Campaign
                      </option>
                    </select>
                  </div>

                  {/* Assigned Personnel */}
                  <div className="form-control">
                    <label className="label text-primary text-lg font-bold mb-1">
                      Assigned Personnel
                    </label>
                    <input
                      name="personnel"
                      value={formData.personnel}
                      onChange={handleChange}
                      className="select border-0 rounded-lg w-full bg-base-200 text-lg py-2 cursor-pointer hover:bg-base-300 transition-all"
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
                      <option value="Scheduled">Scheduled</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Complete">Complete</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="modal-action w-full flex justify-center">
                  <button
                    type="submit"
                    className="bg-success text-white font-semibold py-2 px-8 rounded-xl hover:bg-success/80 transition-all hover:cursor-pointer"
                  >
                    Submit Intervention
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
                    </div>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={cancelSubmit}
                        className="bg-gray-400/90 text-white font-semibold py-2 px-8 rounded-xl hover:bg-gray-200 transition-all hover:cursor-pointer"
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
                          "Submit Intervention"
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
