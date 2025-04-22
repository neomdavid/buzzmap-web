import React, { useState } from "react";
import { Modal, Button, Input, Select } from "antd";
import Map from "./Map"; // your custom map component
import dayjs from "dayjs";

const NewPostModal = ({ visible, onClose }) => {
  const [reportType, setReportType] = useState("Suspected Dengue Case");
  const [barangay, setBarangay] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState(dayjs().format("YYYY-MM-DDTHH:mm"));
  const [locationError, setLocationError] = useState("");

  const handleReportSubmit = () => {
    if (!barangay || !coordinates || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    const postData = {
      type: reportType,
      city: "Quezon City",
      barangay,
      coordinates,
      description,
      dateTime,
    };

    console.log("Submitting post:", postData);
    onClose();
  };

  const handleLocationSelect = async (coords, barangayName) => {
    const isInQC = await isLocationInQuezonCity(coords.lat, coords.lng);
    if (!isInQC) {
      setLocationError("Selected location is not in Quezon City.");
      return;
    }

    setLocationError("");
    setCoordinates(`${coords.lat}, ${coords.lng}`);
    setBarangay(barangayName);
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const isInQC = await isLocationInQuezonCity(latitude, longitude);

        if (!isInQC) {
          setLocationError("Your current location is not in Quezon City.");
          return;
        }

        setLocationError("");
        setCoordinates(`${latitude}, ${longitude}`);
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  };

  const isLocationInQuezonCity = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`
      );
      const data = await res.json();
      return data.city === "Quezon City";
    } catch (error) {
      console.error("Geocoding failed:", error);
      return false;
    }
  };

  return (
    <Modal title="New Post" open={visible} onCancel={onClose} footer={null}>
      <div className="space-y-4">
        <div>
          <label className="block font-semibold">Report Type</label>
          <Select
            value={reportType}
            onChange={(value) => setReportType(value)}
            className="w-full"
            options={[
              {
                label: "Suspected Dengue Case",
                value: "Suspected Dengue Case",
              },
              { label: "Breeding Ground Site", value: "Breeding Ground Site" },
            ]}
          />
        </div>

        <div>
          <label className="block font-semibold">City</label>
          <p>Quezon City</p>
        </div>

        <div>
          <label className="block font-semibold">Barangay</label>
          <Input
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            placeholder="e.g. Bagong Silangan"
          />
        </div>

        <div>
          <label className="block font-semibold">Coordinates</label>
          <Input
            value={coordinates}
            onChange={(e) => setCoordinates(e.target.value)}
            placeholder="Latitude, Longitude"
          />
          <Button type="link" onClick={getCurrentLocation}>
            Use Current Location
          </Button>
          {locationError && (
            <p className="text-red-500 text-sm">{locationError}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold">Date & Time</label>
          <Input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold">Map Location</label>
          <Map
            onSelectLocation={handleLocationSelect}
            defaultCoords={coordinates}
          />
        </div>

        <div>
          <label className="block font-semibold">Description</label>
          <Input.TextArea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
          />
        </div>

        <Button type="primary" onClick={handleReportSubmit} block>
          Submit Report
        </Button>
      </div>
    </Modal>
  );
};

export default NewPostModal;
