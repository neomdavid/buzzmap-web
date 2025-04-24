// NewPostModal.jsx

const NewPostModal = () => {
  const [barangay, setBarangay] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reportType, setReportType] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [locationError, setLocationError] = useState("");
  const [locationMethod, setLocationMethod] = useState("map");

  const isInQuezonCity = (lat, lng) => {
    // Same function as before
  };

  const validateForm = () => {
    const errors = {};
    if (!coordinates) errors.location = "Location is required";
    if (!date || !time) errors.datetime = "Date and time are required";
    if (!reportType) errors.reportType = "Report type is required";
    if (locationError) errors.location = locationError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", {
        city: "Quezon City",
        barangay,
        coordinates,
        date,
        time,
        reportType,
      });
    }
  };

  const handleLocationSelect = (coords, barangayName) => {
    if (!isInQuezonCity(coords.lat, coords.lng)) {
      setLocationError("Please select a location within Quezon City");
      return;
    }

    setLocationError("");
    setCoordinates(`${coords.lat}, ${coords.lng}`);
    setBarangay(barangayName || "");
  };

  return (
    <dialog id="my_modal_4" className="modal text-xl text-primary">
      <div className="modal-box w-10/12 max-w-5xl">
        {/* Removed inner form tag */}
        <button className="btn btn-sm text-3xl font-bold btn-circle btn-ghost absolute right-8 top-8.5">
          ✕
        </button>

        <main className="p-3">
          <p className="text-4xl font-bold text-center">New Post</p>
          <hr className="text-gray-300 mt-4 mb-6" />

          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* Your form contents */}

            {/* 📍 Location Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="font-bold text-xl">
                  📍Location <span className="text-error">*</span>
                </p>
                {(formErrors.location || locationError) && (
                  <span className="text-error text-sm">
                    {formErrors.location || locationError}
                  </span>
                )}
              </div>

              <div className="flex gap-4 mb-2">
                <button
                  type="button"
                  className={`btn btn-lg ${locationMethod === "map" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setLocationMethod("map")}
                >
                  Pin on Map
                </button>
                <button
                  type="button"
                  className={`btn btn-lg ${locationMethod === "manual" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setLocationMethod("manual")}
                >
                  Enter Coordinates
                </button>
              </div>

              {locationMethod === "map" ? (
                <div className="flex flex-col gap-4">
                  <div className="h-80 rounded-lg overflow-hidden border border-gray-300">
                    <MapPicker onLocationSelect={handleLocationSelect} />
                  </div>

                  {/* The rest of the form */}
                </div>
              ) : (
                // The manual input section
              )}
            </div>

            <div className="flex justify-end mt-6">
              <SecondaryButton text="Share" className="h-11 w-[20%]" type="submit" />
            </div>
          </form>
        </main>
      </div>
    </dialog>
  );
};

export default NewPostModal;
