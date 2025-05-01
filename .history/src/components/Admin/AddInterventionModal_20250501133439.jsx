import React, { useState } from "react";
import { IconX } from "@tabler/icons-react";

const AddInterventionModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    barangay: "",
    interventionType: "",
    personnel: "",
    date: "",
    status: "Scheduled",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    onClose();
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
                <option value="Education Campaign">Education Campaign</option>
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
      </div>
    </dialog>
  );
};

export default AddInterventionModal;
