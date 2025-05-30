import React, { useState, useEffect, useRef } from "react";
import { IconX, IconCheck, IconAlertCircle } from "@tabler/icons-react";

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

  // Mock barangay options (replace with real data if needed)
  const barangayOptions = ["Barangay 1", "Barangay 2", "Barangay 3"];
  // Mock personnel options (replace with real data if needed)
  const personnelOptions = ["John Doe", "Jane Smith", "Carlos Rivera"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      console.log("Submitting intervention:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
    } catch (error) {
      console.error("Error submitting intervention:", error);
    } finally {
      setIsSubmitting(false);
      // Close the modal after 2 seconds if successful
      if (isSuccess) {
        setTimeout(() => {
          onClose(); // Close the modal after successful submission
          setShowConfirmation(false);
          setIsSuccess(false);
        }, 2000); // Auto-close after 2 seconds
      }
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

          <div className="space-y-6">
            {!showConfirmation ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location (Barangay & Address Line) */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Location</span>
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        {/* Barangay Dropdown */}
                        <select
                          name="barangay"
                          value={formData.barangay}
                          onChange={handleChange}
                          className="select  w-full"
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
                          className="input input-bordered w-full"
                          placeholder="Specific Address Line (Optional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Type of Intervention */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Type of Intervention</span>
                    </label>
                    <select
                      name="interventionType"
                      value={formData.interventionType}
                      onChange={handleChange}
                      className="select select-bordered w-full"
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
                    <label className="label">
                      <span className="label-text">Assigned Personnel</span>
                    </label>
                    <select
                      name="personnel"
                      value={formData.personnel}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="">Select Personnel</option>
                      {personnelOptions.map((person, index) => (
                        <option key={index} value={person}>
                          {person}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date and Time */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Date and Time</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Status</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Complete">Complete</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="modal-action">
                  <button type="button" className="btn" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Intervention
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {!isSuccess ? (
                  <>
                    <div className="flex flex-col items-center text-center">
                      <div className="rounded-full bg-warning p-3 mb-4 text-white">
                        <IconAlertCircle size={32} stroke={2} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        Confirm Submission
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Are you sure you want to submit this intervention?
                      </p>
                    </div>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={cancelSubmit}
                        className="btn btn-outline px-8"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmSubmit}
                        className="btn btn-primary px-8"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="loading loading-spinner"></span>
                        ) : (
                          "Confirm"
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="rounded-full bg-success p-3 mb-4 text-white">
                      <IconCheck size={32} stroke={3} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-center text-success">
                      Intervention Submitted!
                    </h3>
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
