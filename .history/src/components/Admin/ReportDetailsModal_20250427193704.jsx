<dialog
  id="reportModal"
  ref={modalRef}
  className="modal transition-transform duration-300 ease-in-out"
>
  <div className="modal-box bg-white rounded-2xl shadow-lg max-w-4xl p-8 relative">
    {/* Close button for the modal */}
    <button
      className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800"
      onClick={onClose}
    >
      ✕
    </button>

    {/* Modal content */}
    <h3 className="font-bold text-2xl text-center text-primary mb-6">
      {type === "view"
        ? "Report Details"
        : type === "verify"
        ? "Verify Report"
        : "Reject Report"}
    </h3>

    <div className="space-y-6">
      {/* Report Details */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <div className="flex flex-col gap-4">
          {/* Report ID */}
          <p className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Report ID:</span>
            <span>{reportId}</span>
          </p>

          {/* Barangay */}
          <p className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Barangay:</span>
            <span>{barangay}</span>
          </p>

          {/* Coordinates */}
          <p className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Coordinates:</span>
            <span>
              {coordinates[0]}, {coordinates[1]}
            </span>
          </p>

          {/* Address */}
          <p className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Address:</span>
            <span>{address || "Address not found"}</span>
          </p>

          {/* Description */}
          <p className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Description:</span>
            <span>{description}</span>
          </p>

          {/* Status with badge */}
          <p className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Status:</span>
            <span
              className={`px-4 py-1 text-white font-semibold rounded-full ${
                status === "Pending"
                  ? "bg-warning"
                  : status === "Validated"
                  ? "bg-success"
                  : status === "Rejected"
                  ? "bg-error"
                  : ""
              }`}
            >
              {status}
            </span>
          </p>

          {/* Date and Time */}
          <p className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Date and Time:</span>
            <span>
              {new Date(dateAndTime).toLocaleDateString("en-US", {
                weekday: "long", // Full weekday (e.g., Monday)
                year: "numeric", // Full year (e.g., 2025)
                month: "long", // Full month name (e.g., April)
                day: "numeric", // Day of the month (e.g., 27)
              })}{" "}
              at{" "}
              {new Date(dateAndTime).toLocaleTimeString("en-US", {
                hour: "2-digit", // Hour (e.g., 3)
                minute: "2-digit", // Minute (e.g., 58)
                second: "2-digit", // Second (e.g., 00)
                hour12: true, // 12-hour format (AM/PM)
              })}
            </span>
          </p>
        </div>
      </div>

      {/* Image Gallery */}
      {images && images.length > 0 && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2 text-gray-700">
            Photo Evidence:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div key={index} className="rounded-md overflow-hidden shadow-lg">
                <img
                  src={`http://localhost:4000/${image.replace(/\\/g, "/")}`}
                  alt={`Report image ${index + 1}`}
                  className="w-full h-auto rounded-md transition-transform transform hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Street View */}
      {coordinates && coordinates.length === 2 && (
        <div className="w-full h-64 mt-4" ref={streetViewRef}></div>
      )}

      {/* Action Confirmation (Verify / Reject) */}
      {type !== "view" && (
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-gray-700">
            Are you sure you want to {type} this report?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleConfirmAction}
              className="btn bg-success text-white"
            >
              Confirm {type}
            </button>
            <button onClick={onClose} className="btn bg-gray-300 text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</dialog>;
