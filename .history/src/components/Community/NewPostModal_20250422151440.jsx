import React, { useState, useEffect } from "react";
import { DescriptionWithImages, SecondaryButton } from "../";
import profile1 from "../../assets/profile1.png";
import { MapPicker } from "../";

const NewPostModal = () => {
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reportType, setReportType] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [locationMethod, setLocationMethod] = useState("map"); // 'map' or 'manual'

  useEffect(() => {
    // Set current time when component mounts
    setNow();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!coordinates) errors.location = "Location is required";
    if (!date || !time) errors.datetime = "Date and time are required";
    if (!reportType) errors.reportType = "Report type is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Submit form logic here
      console.log("Form submitted:", {
        city,
        barangay,
        coordinates,
        date,
        time,
        reportType,
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
        setCoordinates(`${latitude}, ${longitude}`);
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

  const handleLocationSelect = (coords, barangayName, cityName) => {
    setCoordinates(`${coords.lat}, ${coords.lng}`);
    setBarangay(barangayName);
    setCity(cityName);
  };

  return (
    <dialog id="my_modal_4" className="modal text-lg text-primary">
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
            <section className="flex">
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
                    <p className="font-bold">
                      📍Location: <span className="text-error">*</span>
                    </p>
                    {formErrors.location && (
                      <span className="text-error text-sm">
                        {formErrors.location}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4 mb-2">
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        locationMethod === "map" ? "btn-primary" : "btn-ghost"
                      }`}
                      onClick={() => setLocationMethod("map")}
                    >
                      Pin on Map
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        locationMethod === "manual"
                          ? "btn-primary"
                          : "btn-ghost"
                      }`}
                      onClick={() => setLocationMethod("manual")}
                    >
                      Enter Manually
                    </button>
                  </div>

                  {locationMethod === "map" ? (
                    <div className="flex flex-col gap-4">
                      <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                        <MapPicker onLocationSelect={handleLocationSelect} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text">City</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered w-full"
                            value={city}
                            readOnly
                            placeholder="Select on map"
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text">Barangay</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered w-full"
                            value={barangay}
                            readOnly
                            placeholder="Select on map"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Coordinates</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
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
                            <span className="label-text">City</span>
                          </label>
                          <select
                            className="select select-bordered w-full"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          >
                            <option value="">Select City</option>
                            <option value="Taguig">Taguig</option>
                            <option value="Pasay">Pasay</option>
                          </select>
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text">Barangay</span>
                          </label>
                          <select
                            className="select select-bordered w-full"
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)}
                            disabled={!city}
                          >
                            <option value="">Select Barangay</option>
                            {city === "Taguig" && (
                              <>
                                <option value="Bagumbayan">Bagumbayan</option>
                                <option value="Ususan">Ususan</option>
                              </>
                            )}
                            {city === "Pasay" && (
                              <>
                                <option value="Barangay 183">
                                  Barangay 183
                                </option>
                                <option value="Barangay 201">
                                  Barangay 201
                                </option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Coordinates</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="input input-bordered flex-1"
                            placeholder="Latitude, Longitude"
                            value={coordinates}
                            onChange={(e) => setCoordinates(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="btn btn-ghost"
                          >
                            Use Current
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 🕑 Date & Time Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">
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
                        <span className="label-text">Date</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">Time</span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered w-full"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={setNow}
                    className="btn btn-ghost btn-sm self-start"
                  >
                    Use Current Date & Time
                  </button>
                </div>

                {/* ⚠️ Report Type Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">
                      ⚠️Report Type: <span className="text-error">*</span>
                    </p>
                    {formErrors.reportType && (
                      <span className="text-error text-sm">
                        {formErrors.reportType}
                      </span>
                    )}
                  </div>

                  <select
                    className="select select-bordered w-full"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="">Choose Report Type</option>
                    <option value="Suspected Dengue Case">
                      Suspected Dengue Case
                    </option>
                    <option value="Breeding Ground Site">
                      Breeding Ground Site
                    </option>
                  </select>
                </div>
              </div>
            </section>

            <DescriptionWithImages />

            <div className="flex justify-end mt-6">
              <SecondaryButton
                text="Share"
                className="h-11 w-[20%]"
                type="submit"
              />
            </div>
          </form>
        </main>
      </div>
    </dialog>
  );
};

export default NewPostModal;
