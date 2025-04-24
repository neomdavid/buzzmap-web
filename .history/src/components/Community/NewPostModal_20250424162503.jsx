import React, { useState, useEffect } from "react";
import { DescriptionWithImages, RiskLevelLegends, SecondaryButton } from "../";
import profile1 from "../../assets/profile1.png";
import { MapPicker } from "../";

// Define Quezon City boundaries
const QC_BOUNDS = {
  north: 14.8,
  south: 14.5,
  west: 121.0,
  east: 121.2,
};

const NewPostModal = () => {
  const [barangay, setBarangay] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reportType, setReportType] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [locationError, setLocationError] = useState("");
  const [locationMethod, setLocationMethod] = useState("map"); // 'map' or 'manual'
  const [images, setImages] = useState([]); // State to track images
  const [imageError, setImageError] = useState(""); // Error state for images

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

    if (!coordinates) errors.location = "Location is required";
    if (!date || !time) errors.datetime = "Date and time are required";
    if (!reportType) errors.reportType = "Report type is required";
    if (locationError) errors.location = locationError;

    // Validate image count
    if (images.length === 0) {
      errors.images = "At least one image is required";
    } else if (images.length > 4) {
      errors.images = "You can only upload a maximum of 4 images";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", {
        city: "Quezon City", // Always Quezon City
        barangay,
        coordinates,
        date,
        time,
        reportType,
        images,
      });
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
    if (!isInQuezonCity(coords.lat, coords.lng)) {
      setLocationError("Please select a location within Quezon City");
      return;
    }

    setLocationError("");
    setCoordinates(`${coords.lat}, ${coords.lng}`);
    setBarangay(barangayName || "");
  };

  // Handle image input change
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 4) {
      setImageError("You can only upload a maximum of 4 images");
    } else {
      setImageError("");
      setImages(selectedFiles);
    }
  };

  return (
    <dialog id="my_modal_4" className="modal text-xl text-primary z-[-1]">
      <div className="modal-box w-10/12 max-w-5xl">
        <form method="dialog">
          <button className="btn btn-sm text-3xl font-bold btn-circle btn-ghost absolute right-8 top-8.5">
            ✕
          </button>
        </form>
        <main className="p-3">
          <p className="text-4xl font-bold text-center">New Post</p>
          <hr className="text-gray-300 mt-4 mb-6" />

          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* 📍 Location Section */}
            <section className="flex mb-4 gap-4">
              <div>
                <img
                  src={profile1}
                  className="h-15 w-15 rounded-full"
                  alt="Profile"
                />
              </div>

              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xl">
                      📍 Location <span className="text-error">*</span>
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
                      <div className="h-80 rounded-lg overflow-hidden border border-gray-300">
                        <RiskLevelLegends />
                        <MapPicker
                          onLocationSelect={handleLocationSelect}
                          bounds={QC_BOUNDS}
                          defaultCity="Quezon City"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                            className="input input-bordered py-6  w-full text-lg"
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)}
                            placeholder="Select on map or enter manually"
                          />
                        </div>
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
                            className="btn btn-primary text-white w-24"
                          >
                            Use Current
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 📅 Date & Time */}
            <section className="mb-6">
              <div className="flex flex-col gap-2">
                <label className="label">
                  <span className="label-text mb-1">Date & Time</span>
                </label>
                <div className="flex gap-4">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input input-bordered py-6 w-full text-lg"
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input input-bordered py-6 w-full text-lg"
                  />
                </div>
                {formErrors.datetime && (
                  <span className="text-error text-sm">
                    {formErrors.datetime}
                  </span>
                )}
              </div>
            </section>

            {/* 📝 Report Type */}
            <section className="mb-6">
              <div className="flex flex-col gap-2">
                <label className="label">
                  <span className="label-text mb-1">Report Type</span>
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="select select-bordered w-full text-lg"
                >
                  <option value="">Select Report Type</option>
                  <option value="suspectedDengue">Suspected Dengue Case</option>
                  <option value="breedingGround">Breeding Ground Site</option>
                </select>
                {formErrors.reportType && (
                  <span className="text-error text-sm">
                    {formErrors.reportType}
                  </span>
                )}
              </div>
            </section>

            {/* 📸 Image Upload */}
            <section className="mb-6">
              <div className="flex flex-col gap-2">
                <label className="label">
                  <span className="label-text mb-1">
                    Upload Images (Max: 4)
                  </span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input file-input-bordered w-full text-lg"
                />
                {imageError && (
                  <span className="text-error text-sm">{imageError}</span>
                )}
              </div>
            </section>

            {/* Submit */}
            <section>
              <SecondaryButton text="Submit" />
            </section>
          </form>
        </main>
      </div>
    </dialog>
  );
};

export default NewPostModal;
