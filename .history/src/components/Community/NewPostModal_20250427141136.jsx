import React, { useState, useRef } from "react";
import { DescriptionWithImages, RiskLevelLegends, SecondaryButton } from "../";
import profile1 from "../../assets/profile1.png";
import { MapPicker, CustomToast } from "../";
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

  // RTK Query mutations
  const [createPost] = useCreatePostMutation();
  const [createPostWithImage] = useCreatePostWithImageMutation();

  const [toast, setToast] = useState(null); // For storing the toast message

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
      const firstError = Object.values(errors)[0];
      showToast(firstError, "error"); // Show error toast
      return false;
    }

    return true;
  };

  const showToast = (message, type) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null); // Hide the toast after 3 seconds
    }, 3000);
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
      showToast("Post created successfully!", "success");
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
      console.error("❌ Failed to create post:", error);
      showToast("Failed to create post. Please try again.", "error");
    }
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
                {/* Your form fields go here */}
                {/* Example: */}
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-xl">
                    📍Location <span className="text-error">*</span>
                  </p>
                  <input
                    type="text"
                    className="input input-bordered py-6 w-full text-lg"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    placeholder="Enter barangay"
                  />
                </div>

                {/* Additional form fields... */}

                <SecondaryButton
                  text="Submit"
                  className="h-11 w-[20%]"
                  type="submit"
                />
              </div>
            </section>
          </form>
        </main>
      </div>

      {/* Show Custom Toast if it's set */}
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
