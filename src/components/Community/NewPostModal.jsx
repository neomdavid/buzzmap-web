import React, { useState, useEffect, useRef, forwardRef } from "react";
import { DescriptionWithImages, RiskLevelLegends, SecondaryButton } from "../";
import profile1 from "../../assets/profile1.png";
// import anonProfile from "../../assets/anon-profile.png";
import { MapPicker, CustomModalToast } from "../";
import { showCustomToast, toastError } from "../../utils.jsx";
import {
  useCreatePostMutation,
  useCreatePostWithImageMutation,
} from "../../api/dengueApi";
import { useSelector } from "react-redux";
import { IconUserCircle } from "@tabler/icons-react";

// Define Quezon City boundaries
const QC_BOUNDS = {
  north: 14.8,
  south: 14.5,
  west: 121.0,
  east: 121.2,
};

const NewPostModal = forwardRef(({ onSubmit, initialCoordinates = "", initialBarangay = "" }, ref) => {
  const [barangay, setBarangay] = useState(initialBarangay);
  const [coordinates, setCoordinates] = useState(initialCoordinates);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [locationError, setLocationError] = useState("");
  const [locationMethod, setLocationMethod] = useState("map"); // 'map' or 'manual'
  const [images, setImages] = useState([]); // State for images
  const token = useSelector((state) => state.auth.token);
  const [toast, setToast] = useState(null); // For storing the toast message
  const [isAnonymous, setIsAnonymous] = useState(false);

  // RTK Query mutations
  const [createPost] = useCreatePostMutation();
  const [createPostWithImage, { isLoading, isError, error }] =
    useCreatePostWithImageMutation();

  const showToast = (message, type) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null); // Hide the toast after 3 seconds
    }, 3000);
  };

  useEffect(() => {
    // Set current time when component mounts
    setNow();
  }, []);

  useEffect(() => {
    if (initialCoordinates) setCoordinates(initialCoordinates);
    if (initialBarangay) setBarangay(initialBarangay);
  }, [initialCoordinates, initialBarangay]);

  const isInQuezonCity = (lat, lng) => {
    return (
      lat >= QC_BOUNDS.south &&
      lat <= QC_BOUNDS.north &&
      lng >= QC_BOUNDS.west &&
      lng <= QC_BOUNDS.east
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!barangay) errors.barangay = "Barangay is required.";
    if (!coordinates) errors.coordinates = "Location is required.";
    if (!date) errors.date = "Date is required.";
    if (!time) errors.time = "Time is required.";
    if (!reportType) errors.reportType = "Report type is required.";
    if (!description || description.trim() === "") errors.description = "Description is required.";

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Show first error in a toast (optional, improve UX)
      const firstError = Object.values(errors)[0];
      showToast(firstError, "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔐 Current token:", token);
    console.log("✅ SUBMIT button clicked");

    console.log("📝 Current form values:");
    console.log({
      barangay,
      coordinates,
      date,
      time,
      reportType,
      images,
      description,
    });

    if (!validateForm()) {
      console.warn("❌ Form validation failed");
      showToast("Please fill all required fields", "error");
      return;
    }

    console.log("✅ Form validation passed");

    try {
      // Prepare coordinates as [longitude, latitude]
      const [lat, lng] = coordinates
        .split(",")
        .map((coord) => parseFloat(coord.trim()));

      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append("barangay", barangay);
      formData.append("specific_location[type]", "Point");
      formData.append("specific_location[coordinates][0]", lng);
      formData.append("specific_location[coordinates][1]", lat);
      formData.append(
        "date_and_time",
        new Date(`${date}T${time}`).toISOString()
      );
      formData.append("report_type", reportType);
      formData.append("description", description);
      formData.append("isAnonymous", isAnonymous);

      // If images are added, append each image to the FormData
      if (images.length > 0) {
        console.log(`📸 Appending ${images.length} image(s)`);
        images.forEach((img) => {
          formData.append("images", img); // Append each image (file) to the FormData
        });
      }

      console.log("📦 Final FormData body:", formData);

      // Call createPost mutation with FormData
      const response = await createPostWithImage(formData).unwrap();

      console.log("✅ Post uploaded successfully", response);
      showCustomToast("Post reported to surveillance", "success");

      // Reset form
      setBarangay("");
      setCoordinates("");
      setDate("");
      setTime("");
      setReportType("");
      setDescription("");
      setImages([]);
      console.log("🧹 Form reset after successful submission");

      if (onSubmit) {
        onSubmit();
        // Close the modal dialog (for Community page)
        const dlg = document.getElementById("my_modal_4");
        if (dlg) dlg.close();
      }
    } catch (error) {
      // If backend error occurs, display the custom toast with error message
      console.error("❌ Failed to create post:", error);
      showToast("Failed to create post", "error");
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (!isInQuezonCity(latitude, longitude)) {
          setLocationError(
            "Your current location is outside Quezon City. Please pin a location within Quezon City."
          );
          return;
        }

        setLocationError("");
        setCoordinates(`${latitude}, ${longitude}`);
        // You might want to reverse geocode here to get the barangay
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  };

  const setNow = () => {
    const now = new Date();
    setDate(now.toISOString().slice(0, 10));
    setTime(now.toTimeString().slice(0, 5));
  };

  const handleLocationSelect = (coords, barangayName) => {
    console.log('NewPostModal received:', { coords, barangayName });

    setLocationError("");
    setCoordinates(coords);
    setBarangay(barangayName || ""); // Always set barangay, even if empty
    
    // Debug log to verify state updates
    console.log('Updated state:', {
      coordinates: coords,
      barangay: barangayName || ""
    });
  };

  return (
    <dialog
      id="my_modal_4"
      ref={ref}
      className="modal text-xl text-primary "
    >
      <div className="modal-box w-11/12 max-w-5xl max-h-[95vh]">
        <form method="dialog">
          <button className="btn btn-sm text-3xl font-bold btn-circle btn-ghost absolute right-8 top-8.5">
            ✕
          </button>
        </form>
        <main className="p-3 pr-10">
          <p className="text-4xl font-bold text-center">Report to Surveillance</p>
          <hr className="text-gray-300 mt-4 mb-2" />

          {/* --- ANONYMOUS SWITCH --- */}
          <div className="flex items-center justify-between mb-4 bg-base-200 p-4 rounded-lg">
            <span className="font-semibold text-[14px]">Participate anonymously</span>
            <label className="inline-flex items-center cursor-pointer relative">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => setIsAnonymous((prev) => !prev)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-all"></div>
              <div
                className={`absolute w-5 h-5 bg-white rounded-full shadow left-0.5 top-0.5 transition-all
                  ${isAnonymous ? 'translate-x-5' : ''}`}
              ></div>
            </label>
          </div>
          {/* --- END ANONYMOUS SWITCH --- */}

          <form className="flex flex-col" onSubmit={handleSubmit}>
            <section className="flex mb-4">
              <div>
                {/* --- PROFILE/ANONYMOUS AVATAR ONLY --- */}
                {isAnonymous ? (
                  <IconUserCircle size={48} className="text-gray-400 mr-2" />
                ) : (
                <img
                  src={profile1}
                  className="h-15 w-15 rounded-full mr-4"
                  alt="Profile"
                />
                )}
              </div>

              <div className="flex flex-col w-full gap-4">
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
                      className={`btn  btn-lg ${
                        locationMethod === "map" ? "btn-primary text-white" : "btn-ghost"
                      }`}
                      onClick={() => setLocationMethod("map")}
                    >
                      Pin on Map
                    </button>
                    <button
                      type="button"
                      className={`btn btn-lg ${
                        locationMethod === "manual"
                          ? "btn-primary text-white "
                          : "btn-ghost"
                      }`}
                      onClick={() => setLocationMethod("manual")}
                    >
                      Enter Coordinates
                    </button>
                  </div>

                  {locationMethod === "map" ? (
                    <div className="flex flex-col gap-4">
                      <div className="h-100 rounded-lg overflow-hidden border border-gray-300">
                        <RiskLevelLegends />
                        <MapPicker
                          onLocationSelect={handleLocationSelect}
                          bounds={QC_BOUNDS}
                          defaultCity="Quezon City"
                          defaultCoordinates={coordinates}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text mb-1">City</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered py-6  w-full text-lg"
                            value="Quezon City"
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text mb-1">Barangay</span>
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="input input-bordered py-6  w-full text-lg"
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)}
                            placeholder="Select on map or enter manually"
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text mb-1">Coordinates</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered py-6 w-full text-lg"
                            value={coordinates}
                            readOnly
                            placeholder="Select on map"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text mb-1">City</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered py-6 w-full text-lg"
                            value="Quezon City"
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text mb-1">Barangay</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered py-6 w-full text-lg"
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)}
                            placeholder="Enter barangay"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text mb-1">Coordinates</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="input input-bordered py-6 flex-1 text-lg"
                            placeholder="Latitude, Longitude"
                            value={coordinates}
                            onChange={(e) => setCoordinates(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="btn text-lg"
                          >
                            Use Current
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Must be within Quezon City boundaries
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 🕑 Date & Time Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xl">
                      🕑Date & Time: <span className="text-error">*</span>
                    </p>
                    {formErrors.datetime && (
                      <span className="text-error text-sm">
                        {formErrors.datetime}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text mb-1">Date</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered py-6 w-full text-lg"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text mb-1">Time</span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered py-6 w-full text-lg"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={setNow}
                    className="btn btn-md btn-outline cursor-pointer mt-2 btn-lg self-center"
                  >
                    Use Current Date & Time
                  </button>
                </div>

                {/* ⚠️ Report Type Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xl">
                      ⚠️Report Type: <span className="text-error">*</span>
                    </p>
                    {formErrors.reportType && (
                      <span className="text-error text-sm">
                        {formErrors.reportType}
                      </span>
                    )}
                  </div>

                  <select
                    className="select select-bordered h-12 w-full text-lg"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="">Choose Report Type</option>
                    <option value="Standing Water">Standing Water</option>
                    <option value="Breeding Site">Breeding Site</option>
                  </select>
                </div>
              </div>
            </section>

            <DescriptionWithImages
              images={images}
              onImageChange={setImages}
              description={description}
              onDescriptionChange={setDescription}
            />
            {formErrors.description && (
              <div className="w-full pl-20">
                <span className="text-error text-sm">{formErrors.description}</span>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <SecondaryButton
                text="Share"
                loadingText="Sharing..." // Optional custom loading text
                className="h-11 w-[20%]"
                type="submit"
                isLoading={isLoading} // Pass the loading state
              />
            </div>
          </form>
        </main>
      </div>
      {toast && (
        <CustomModalToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </dialog>
  );
});

export default NewPostModal;
