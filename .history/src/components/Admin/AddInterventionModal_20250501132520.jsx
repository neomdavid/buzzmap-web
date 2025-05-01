import React, { useState } from "react";

function AddInterventionModal({ isOpen, onClose, onAddIntervention }) {
  const [barangay, setBarangay] = useState("");
  const [interventionType, setInterventionType] = useState("");
  const [personnel, setPersonnel] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirm = () => {
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
    setShowConfirmation(true); // Show confirmation message
  };

  if (!isOpen) return null; // Don't render the modal if it's closed

  return (
    <dialog
      open={isOpen}
      className="modal transition-transform duration-300 ease-in-out"
    >
      <div className="modal-box bg-white rounded-3xl shadow-2xl w-9/12 max-w-4xl p-12 relative">
        <button
          className="absolute top-12 right-10 text-2xl font-semibold hover:text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        {!showConfirmation ? (
          <>
            <p className="text-center text-3xl font-bold mb-6">
              <span className="text-primary">Add New Intervention</span>
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold">Barangay:</label>
                <input
                  type="text"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="input w-full border-gray-300 rounded-md p-2"
                  placeholder="Enter Barangay Name"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold">
                  Intervention Type:
                </label>
                <input
                  type="text"
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="input w-full border-gray-300 rounded-md p-2"
                  placeholder="Enter Type of Intervention"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold">
                  Personnel:
                </label>
                <input
                  type="text"
                  value={personnel}
                  onChange={(e) => setPersonnel(e.target.value)}
                  className="input w-full border-gray-300 rounded-md p-2"
                  placeholder="Enter Personnel Name"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="select w-full border-gray-300 rounded-md p-2"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Complete">Complete</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleConfirm}
                  className="bg-success text-white font-semibold px-7 py-2 rounded-xl hover:cursor-pointer hover:opacity-70 transition-all duration-200"
                >
                  Add Intervention
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-300 text-gray-700 font-semibold px-7 py-2 rounded-xl hover:cursor-pointer hover:opacity-70 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl font-semibold mb-8">
              New intervention has been added successfully!
            </p>

            <div className="flex justify-center gap-6">
              <button
                onClick={onClose}
                className="bg-success text-white font-semibold px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}

export default AddInterventionModal;
