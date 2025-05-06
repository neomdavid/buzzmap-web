import React, { useState, useEffect, useRef } from "react";
import { DescriptionWithImages, RiskLevelLegends, SecondaryButton } from "../";
import profile1 from "../../assets/profile1.png";
import { MapPicker, CustomModalToast } from "../";
import { showCustomToast, toastError } from "../../utils.jsx";
import {
  useCreatePostMutation,
  useCreatePostWithImageMutation,
} from "../../api/dengueApi";
import { useSelector } from "react-redux";
import axios from "axios";

// Define Quezon City boundaries
const QC_BOUNDS = {
  north: 14.8,
  south: 14.5,
  west: 121.0,
  east: 121.2,
};

const NewPostModal = ({ onSubmit }) => {
  const [barangay, setBarangay] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [locationError, setLocationError] = useState("");
  const [locationMethod, setLocationMethod] = useState("map"); // 'map' or 'manual'
  const [images, setImages] = useState([]); // State for images
  const modalRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const [toast, setToast] = useState(null); // For storing the toast message

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

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Show first error in a toast (optional, improve UX)
      const firstError = Object.values(errors)[0];
      showToast(firstError, "error"); // You can use toastWarn if that's your style
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
      modalRef.current?.close();

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
        console.log("📣 Calling onSubmit callback");
        onSubmit();
      }
    } catch (error) {
      // If backend error occurs, display the custom toast with error message
      console.error("❌ Failed to create post:", error);
      showToast("Failed to create post", "error");
    }
  };

  // Utility to convert File to base64 string
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // This gives you a base64-encoded data URI
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

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
    if (!isInQuezonCity(coords.lat, coords.lng)) {
      setLocationError("Please select a location within Quezon City");
      return;
    }

    setLocationError("");
    setCoordinates(`${coords.lat}, ${coords.lng}`);
    setBarangay(barangayName || "");
  };

  return (
    <dialog
      id="my_modal_4"
      ref={modalRef}
      className="modal text-xl text-primary"
    >
      <div className="modal-box w-10/12 max-w-5xl">
        <form method="dialog">
          <button className="btn btn-sm text-3xl font-bold btn-circle btn-ghost absolute right-8 top-8.5">
            ✕
          </button>
        </form>
        <main className="p-3 pr-10">
          <p className="text-4xl font-bold text-center">New Post</p>
          <hr className="text-gray-300 mt-4 mb-6" />

          <form className="flex flex-col" onSubmit={handleSubmit}>
            <section className="flex mb-4">
              <div>
                <img
                  src={profile1}
                  className="h-15 w-15 rounded-full mr-4"
                  alt="Profile"
                />
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
                      className={`btn btn-lg ${
                        locationMethod === "map" ? "btn-primary" : "btn-ghost"
                      }`}
                      onClick={() => setLocationMethod("map")}
                    >
                      Pin on Map
                    </button>
                    <button
                      type="button"
                      className={`btn btn-lg ${
                        locationMethod === "manual"
                          ? "btn-primary"
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
                            className="btn btn-ghost text-lg"
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

                {/* Rest of your form remains the same */}
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
                    className="btn btn-ghost btn-lg self-start"
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
};

export default NewPostModal;
