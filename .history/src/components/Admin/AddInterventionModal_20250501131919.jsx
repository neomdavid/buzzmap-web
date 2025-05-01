import React, { useState } from "react";

function AddInterventionModal({ isOpen, onClose, onAddIntervention }) {
  const [barangay, setBarangay] = useState("");
  const [interventionType, setInterventionType] = useState("");
  const [personnel, setPersonnel] = useState("");
  const [status, setStatus] = useState("Scheduled");

  const handleSubmit = () => {
    if (!barangay || !interventionType || !personnel) {
      alert("Please fill in all fields!");
      return;
    }

    const newIntervention = {
      id: Date.now(), // Generate a unique ID based on the current timestamp
      barangay,
      date: new Date().toISOString(),
      interventionType,
      personnel,
      status,
    };

    onAddIntervention(newIntervention); // Pass the new intervention to the parent
    onClose(); // Close the modal
  };

  if (!isOpen) return null; // Don't render the modal if it's closed

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Intervention</h2>
        <div>
          <label>Barangay:</label>
          <input
            type="text"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            placeholder="Barangay"
          />
        </div>
        <div>
          <label>Type of Intervention:</label>
          <input
            type="text"
            value={interventionType}
            onChange={(e) => setInterventionType(e.target.value)}
            placeholder="Intervention Type"
          />
        </div>
        <div>
          <label>Personnel:</label>
          <input
            type="text"
            value={personnel}
            onChange={(e) => setPersonnel(e.target.value)}
            placeholder="Personnel"
          />
        </div>
        <div>
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Scheduled">Scheduled</option>
            <option value="Complete">Complete</option>
            <option value="Ongoing">Ongoing</option>
          </select>
        </div>
        <div>
          <button onClick={handleSubmit}>Add Intervention</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AddInterventionModal;
