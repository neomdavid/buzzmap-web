import React, { useState } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";

const AddInterventionModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    barangay: "",
    interventionType: "",
    personnel: "",
    date: "",
    status: "Scheduled",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically call an API to save the intervention
    console.log("Form submitted:", formData);
    setIsSubmitted(true);

    // In a real app, you would wait for the API response before showing success
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setFormData({
        barangay: "",
        interventionType: "",
        personnel: "",
        date: "",
        status: "Scheduled",
      });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <dialog
      open
      className="modal modal-bottom sm:modal-middle"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-4xl p-8">
        <button
          className="absolute top-6 right-6 text-2xl font-semibold hover:text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        {!isSubmitted ? (
          <>
            <h3 className="text-2xl font-bold mb-6 text-center">
              Add New Intervention
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Barangay</span>
                  </label>
                  <input
                    type="text"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

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
                    <option value="">Select type</option>
                    <option value="Fogging">Fogging</option>
                    <option value="Larviciding">Larviciding</option>
                    <option value="Clean-up Drive">Clean-up Drive</option>
                    <option value="Education Campaign">
                      Education Campaign
                    </option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Personnel</span>
                  </label>
                  <input
                    type="text"
                    name="personnel"
                    value={formData.personnel}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

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

              <div className="modal-action">
                <button type="button" className="btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Intervention
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-success p-3 mb-4">
              <IconCheck size={32} color="white" stroke={3} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-center text-success">
              Intervention Added Successfully!
            </h3>
            <p className="text-gray-500 text-center">
              The new intervention has been recorded.
            </p>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default AddInterventionModal;
