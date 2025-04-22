import React, { useState } from "react";
import { DescriptionWithImages, SecondaryButton } from "../";
import profile1 from "../../assets/profile1.png";
const NewPostModal = () => {
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reportType, setReportType] = useState("");

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
          <form className="flex flex-col">
            <section className="flex">
              <div>
                <img
                  src={profile1}
                  className="h-15 w-15 rounded-full mr-4"
                  alt="Profile"
                />
              </div>
              <div className="flex flex-col w-full gap-4">
                {/* 📍 Location */}
                <div className="flex gap-2 w-full">
                  <p className="font-bold mt-1.5">
                    📍Location: <span className="text-error">*</span>
                  </p>
                  <div className="flex flex-1 gap-4 flex-col">
                    <div className="flex gap-2">
                      <select
                        className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      >
                        <option value="">Select City</option>
                        <option value="Taguig">Taguig</option>
                        <option value="Pasay">Pasay</option>
                      </select>

                      <select
                        className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                        value={barangay}
                        onChange={(e) => setBarangay(e.target.value)}
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
                            <option value="Barangay 183">Barangay 183</option>
                            <option value="Barangay 201">Barangay 201</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                        placeholder="Latitude, Longitude"
                        value={coordinates}
                        onChange={(e) => setCoordinates(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="text-sm text-accent underline"
                      >
                        Use Current Location
                      </button>
                    </div>
                  </div>
                </div>

                {/* 🕑 Date & Time */}
                <div className="flex flex-col w-full">
                  <div className="flex gap-2 items-center w-full">
                    <p className="font-bold">
                      🕑Date & Time: <span className="text-error">*</span>
                    </p>
                    <div className="flex-1 flex-col">
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                        <input
                          type="time"
                          className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={setNow}
                        className="mt-1 text-sm text-accent underline"
                      >
                        Use Current Date & Time
                      </button>
                    </div>
                  </div>
                </div>

                {/* ⚠️ Report Type */}
                <div className="flex flex-col w-full">
                  <div className="flex gap-2 items-center w-full">
                    <p className="font-bold">
                      ⚠️Choose Report Type:{" "}
                      <span className="text-error">*</span>
                    </p>
                    <select
                      className="flex-1 bg-base-200 px-5 py-2 rounded-full"
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
              </div>
            </section>

            <DescriptionWithImages />

            <div className="flex justify-end mt-6">
              <SecondaryButton text="Share" className="h-11 w-[20%]" />
            </div>
          </form>
        </main>
      </div>
    </dialog>
  );
};

export default NewPostModal;
