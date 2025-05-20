import React, { useState, useEffect } from "react";

const EditInterventionModal = ({ intervention, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...intervention });

  useEffect(() => {
    setFormData({ ...intervention });
  }, [intervention]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Pass the updated form data to the parent component
  };

  return (
    <div className="modal transition-transform duration-300 ease-in-out">
      <div className="modal-box bg-white rounded-4xl shadow-2xl w-11/12 max-w-3xl p-12 relative">
        <button
          className="absolute top-6 right-6 text-2xl font-semibold hover:text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        <p className="text-3xl font-bold mb-6 text-center">Edit Intervention</p>

        {/* Form to edit intervention */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intervention Type */}
            <div className="form-control">
              <label className="label">Type of Intervention</label>
              <select
                name="interventionType"
                value={formData.interventionType}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="All">All</option>
                <option value="Fogging">Fogging</option>
                <option value="Ovicidal-Larvicidal Trapping">Ovicidal-Larvicidal Trapping</option>
                <option value="Clean-up Drive">Clean-up Drive</option>
                <option value="Education Campaign">Education Campaign</option>
              </select>
            </div>

            {/* Personnel */}
            <div className="form-control">
              <label className="label">Assigned Personnel</label>
              <input
                type="text"
                name="personnel"
                value={formData.personnel}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Date */}
            <div className="form-control">
              <label className="label">Date and Time</label>
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
              <label className="label">Status</label>
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
          <div className="modal-action flex justify-center gap-6">
            <button
              type="button"
              className="btn btn-outline w-1/3"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success w-1/3">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInterventionModal;
