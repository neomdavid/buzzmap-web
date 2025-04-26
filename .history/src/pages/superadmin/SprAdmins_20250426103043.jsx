import { AdminsTable } from "../../components";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { toastSuccess } from "../../utils.jsx";
function SprAdmins() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: null,
  });
  const [errors, setErrors] = useState({});

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
        else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(value))
          error = "Password does not meet requirements";
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

    // Also validate confirmPassword if password is changing
    if (name === "password" || name === "confirmPassword") {
      validateField(
        "confirmPassword",
        name === "confirmPassword" ? value : formData.confirmPassword
      );
    }
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

    return fields.every((field) => {
      const error = (() => {
        switch (field) {
          case "firstName":
            return !formData.firstName.trim();
          case "lastName":
            return !formData.lastName.trim();
          case "email":
            return (
              !formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)
            );
          case "password":
            return (
              !formData.password ||
              !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(formData.password)
            );
          case "confirmPassword":
            return formData.password !== formData.confirmPassword;
          default:
            return false;
        }
      })();

      return !error;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      setIsModalOpen(false);
      toastSuccess("New Admin Created");
    }
  };

  return (
    <main className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-5xl font-extrabold text-center md:text-left">
          Admin Management
        </h1>

        <button
          className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm md:w-auto w-full"
          onClick={() => setIsModalOpen(true)}
        >
          <IconPlus size={20} />
          Create an Admin
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
        onClose={() => setIsModalOpen(false)}
      >
        <div className="modal-box gap-6 text-lg w-10/12 max-w-3xl p-8 sm:p-12 rounded-3xl">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-8">
              <p className="text-center text-3xl font-bold">Create New Admin</p>

              <div className="flex flex-col sm:flex-row gap-6 w-full">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-primary font-bold">First Name*</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`p-3 bg-base-200 text-primary rounded-3xl border-none ${
                      errors.firstName ? "border border-error" : ""
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-error text-sm">{errors.firstName}</p>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-primary font-bold">Last Name*</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`p-3 bg-base-200 text-primary rounded-3xl border-none ${
                      errors.lastName ? "border border-error" : ""
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-error text-sm">{errors.lastName}</p>
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
                  className={`p-3 bg-base-200 text-primary rounded-3xl border-none ${
                    errors.email ? "border border-error" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-error text-sm">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-primary font-bold">Password*</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`p-3 bg-base-200 text-primary rounded-3xl border-none ${
                    errors.password ? "border border-error" : ""
                  }`}
                />
                <p className="text-xs italic text-gray-500">
                  Password must be at least 8 characters long, contain both
                  uppercase and lowercase letters, include at least one number,
                  and contain one special character (e.g., !, @, #, $)
                </p>
                {errors.password && (
                  <p className="text-error text-sm">{errors.password}</p>
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
                  className={`p-3 bg-base-200 text-primary rounded-3xl border-none ${
                    errors.confirmPassword ? "border border-error" : ""
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-error text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-primary font-bold">
                  Profile picture{" "}
                  <span className="text-sm font-normal italic">(Optional)</span>
                </label>
                <div className="flex items-center gap-4 rounded-full border-2 border-base-200 p-2 px-5">
                  <label className="bg-primary text-xs text-white px-4 py-2 rounded-lg cursor-pointer">
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
                  className="bg-gray-300 text-white px-6 py-2.5 rounded-xl hover:bg-gray-400 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#245261] to-[#4AA8C7] text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Create Admin
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsModalOpen(false)}>close</button>
        </form>
      </dialog>
    </main>
  );
}

export default SprAdmins;
