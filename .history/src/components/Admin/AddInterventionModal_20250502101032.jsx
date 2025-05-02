import React, { useState, useEffect } from "react";

const AddInterventionModal = ({ isOpen, onClose }) => {
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [formData, setFormData] = useState({
    barangay: "",
    addressLine: "",
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

  useEffect(() => {
    if (isOpen) {
      // Fetch the GeoJSON data when the modal is open
      fetch("/path-to-your-geojson-file/quezon_barangays_boundaries.geojson")
        .then((response) => response.json())
        .then((data) => {
          // Extract barangay names from the GeoJSON data
          const barangays = data.features.map(
            (feature) => feature.properties.name
          );
          setBarangayOptions(barangays); // Set the options in the state
        })
        .catch((error) => console.error("Error fetching barangays:", error));
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting intervention:", formData);
    // Submit the intervention
  };

  return (
    <dialog className="modal" open={isOpen}>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Barangay Dropdown */}
          <div className="form-control">
            <label className="label text-primary text-lg font-bold mb-1">
              Barangay
            </label>
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

          {/* Address Line */}
          <div className="form-control">
            <label className="label text-primary text-lg font-bold mb-1">
              Specific Address Line (Optional)
            </label>
            <input
              type="text"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              className="input border-0 w-full rounded-lg bg-base-200 text-lg py-2 cursor-pointer hover:bg-base-300 transition-all"
              placeholder="Specific Address Line (Optional)"
            />
          </div>

          {/* Intervention Type */}
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
              <option value="Education Campaign">Education Campaign</option>
            </select>
          </div>

          {/* Personnel */}
          <div className="form-control">
            <label className="label text-primary text-lg font-bold mb-1">
              Assigned Personnel
            </label>
            <input
              type="text"
              name="personnel"
              value={formData.personnel}
              onChange={handleChange}
              className="input border-0 w-full rounded-lg bg-base-200 text-lg py-2 cursor-pointer hover:bg-base-300 transition-all"
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

          {/* Submit Button */}
          <div className="modal-action w-full flex justify-center">
            <button
              type="submit"
              className="bg-success text-white font-semibold py-2 px-8 rounded-xl hover:bg-success/80 transition-all hover:cursor-pointer"
            >
              Submit Intervention
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddInterventionModal;
