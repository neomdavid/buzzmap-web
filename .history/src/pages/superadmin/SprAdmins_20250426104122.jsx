import { AdminsTable } from "../../components";
import { IconPlus, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import { toastSuccess, toastError } from "../../utils.jsx";

// Default super admin password for development
const SUPER_ADMIN_PASSWORD = "Password!123";

function SprAdmins() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: null,
  });
  const [superAdminAuth, setSuperAdminAuth] = useState({
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field validation logic
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
        if (!value.trim()) error = "First name is required";
        break;
      case "lastName":
        if (!value.trim()) error = "Last name is required";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = "Email is invalid";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Must be at least 8 characters";
        else if (!/(?=.*[a-z])/.test(value)) error = "Needs a lowercase letter";
        else if (!/(?=.*[A-Z])/.test(value))
          error = "Needs an uppercase letter";
        else if (!/(?=.*\d)/.test(value)) error = "Needs a number";
        else if (!/(?=.*\W)/.test(value)) error = "Needs a special character";
        break;
      case "confirmPassword":
        if (value !== formData.password) error = "Passwords do not match";
        break;
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);

    if (name === "password" || name === "confirmPassword") {
      validateField(
        "confirmPassword",
        name === "confirmPassword" ? value : formData.confirmPassword
      );
    }
  };

  const handleSuperAdminAuthChange = (e) => {
    const { name, value } = e.target;
    setSuperAdminAuth((prev) => ({
      ...prev,
      [name]: value,
    }));
    setAuthError("");
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: e.target.files[0],
    }));
  };

  const validateForm = () => {
    const fields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "confirmPassword",
    ];

    fields.forEach((field) => validateField(field, formData[field]));

    return fields.every((field) => !errors[field]);
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const verifySuperAdmin = async () => {
    try {
      // In a real app, this would be an API call to verify the super admin's credentials
      if (superAdminAuth.password !== SUPER_ADMIN_PASSWORD) {
        throw new Error("Invalid super admin credentials");
      }
      return true;
    } catch (error) {
      setAuthError(error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isVerified = await verifySuperAdmin();
      if (!isVerified) {
        setIsSubmitting(false);
        return;
      }

      // Here you would typically make an API call to create the admin
      console.log("Creating admin with data:", formData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsModalOpen(false);
      setCurrentStep(1);
      toastSuccess("New admin created successfully");

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        profilePicture: null,
      });
      setSuperAdminAuth({ password: "" });
    } catch (error) {
      toastError("Failed to create admin");
      console.error("Admin creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    Object.values(errors).every((error) => !error) &&
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword;

  return (
    <main className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
          Admin Management
        </p>

        <button
          className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm md:w-auto w-full"
          onClick={() => setIsModalOpen(true)}
        >
          <IconPlus size={20} />
          Create New Admin
        </button>
      </div>

      <div className="h-[calc(100vh-200px)] bg-white rounded-xl shadow-sm p-4">
        <AdminsTable />
      </div>

      {/* Modal */}
      <dialog
        id="admin_modal"
        className="modal"
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentStep(1);
        }}
      >
        <div className="modal-box gap-6 text-lg w-10/12 max-w-3xl p-8 sm:p-12 rounded-3xl">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 ? (
              <div className="flex flex-col gap-6">
                <p className="text-center text-3xl font-bold">
                  Create New Admin
                </p>

                <div className="flex flex-col sm:flex-row gap-6 w-full">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-primary font-bold">
                      First Name*
                    </label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`p-3 bg-base-200 text-primary rounded-xl border-none ${
                        errors.firstName ? "border-2 border-error" : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-error text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-primary font-bold">Last Name*</label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`p-3 bg-base-200 text-primary rounded-xl border-none ${
                        errors.lastName ? "border-2 border-error" : ""
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-error text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full flex flex-col gap-1">
                  <label className="text-primary font-bold">Email*</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`p-3 bg-base-200 text-primary rounded-xl border-none ${
                      errors.email ? "border-2 border-error" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-error text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-primary font-bold">Password*</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`p-3 bg-base-200 text-primary rounded-xl border-none ${
                      errors.password ? "border-2 border-error" : ""
                    }`}
                  />
                  <p className="text-xs italic text-gray-500 mt-1">
                    Must be at least 8 characters with uppercase, lowercase,
                    number, and special character
                  </p>
                  {errors.password && (
                    <p className="text-error text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-primary font-bold">
                    Confirm Password*
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`p-3 bg-base-200 text-primary rounded-xl border-none ${
                      errors.confirmPassword ? "border-2 border-error" : ""
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-error text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-primary font-bold">
                    Profile picture{" "}
                    <span className="text-sm font-normal italic">
                      (Optional)
                    </span>
                  </label>
                  <div className="flex items-center gap-4 rounded-xl border-2 border-base-200 p-2 px-4">
                    <label className="bg-primary text-xs text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
                      Choose File
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="text-sm">
                      {formData.profilePicture
                        ? formData.profilePicture.name
                        : "No File Chosen"}
                    </p>
                  </div>
                </div>

                <div className="w-full flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    className="bg-gray-300 text-white px-6 py-2.5 rounded-xl hover:bg-gray-400 transition-colors hover:cursor-pointer"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors hover:cursor-pointer ${
                      !isFormValid ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleNextStep}
                    disabled={!isFormValid}
                  >
                    Next <IconArrowRight size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <p className="text-center text-3xl font-bold">
                  Super Admin Verification
                </p>
                <p className="text-center text-gray-600">
                  Enter your super admin password to confirm this action
                </p>

                <div className="w-full flex flex-col gap-1">
                  <label className="text-primary font-bold">
                    Super Admin Password*
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={superAdminAuth.password}
                    onChange={handleSuperAdminAuthChange}
                    className={`p-3 bg-base-200 text-primary rounded-xl border-none ${
                      authError ? "border-2 border-error" : ""
                    }`}
                    placeholder="Enter super admin password"
                  />
                  {authError && (
                    <p className="text-error text-sm mt-1">{authError}</p>
                  )}
                  <p className="text-xs italic text-gray-500 mt-1">
                    For development: Use "{SUPER_ADMIN_PASSWORD}"
                  </p>
                </div>

                <div className="w-full flex justify-between gap-3 mt-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-gray-300 text-white px-6 py-2.5 rounded-xl hover:bg-gray-400 transition-colors hover:cursor-pointer"
                    onClick={handlePrevStep}
                  >
                    <IconArrowLeft size={20} /> Back
                  </button>
                  <button
                    type="submit"
                    className={`flex items-center gap-2 bg-gradient-to-r from-[#245261] to-[#4AA8C7] text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity hover:cursor-pointer ${
                      isSubmitting ? "opacity-70 cursor-wait" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Processing..."
                    ) : (
                      <>
                        Confirm Creation <IconArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => {
              setIsModalOpen(false);
              setCurrentStep(1);
            }}
          >
            close
          </button>
        </form>
      </dialog>
    </main>
  );
}

export default SprAdmins;
