import { AdminsTable } from "../../components";
import { IconPlus, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toastSuccess, toastError } from "../../utils.jsx";
import { useCreateAdminMutation, useVerifyAdminOTPMutation, useLoginMutation, useGetAccountsQuery } from "../../api/dengueApi";
import { useSelector } from "react-redux";
import { UserGear, CheckCircle, XCircle, Clock } from "phosphor-react";
import { Link } from "react-router-dom";

function SprAdmins() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [superAdminAuth, setSuperAdminAuth] = useState({
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createAdmin] = useCreateAdminMutation();
  const [verifyOTP] = useVerifyAdminOTPMutation();
  const [login] = useLoginMutation();
  const { data: accounts } = useGetAccountsQuery();

  // Get super admin email from Redux store
  const superAdminEmail = useSelector((state) => state.auth?.user?.email);

  // Add these statistics states
  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    disabledAdmins: 0,
    unverifiedAdmins: 0,
    lastUpdated: new Date()
  });

  // Add these new states
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Update stats when accounts data changes
  useEffect(() => {
    if (accounts) {
      const adminAccounts = accounts.filter(acc => acc.role === 'admin');
      setStats({
        totalAdmins: adminAccounts.length,
        activeAdmins: adminAccounts.filter(acc => acc.status === 'active').length,
        disabledAdmins: adminAccounts.filter(acc => acc.status === 'disabled').length,
        unverifiedAdmins: adminAccounts.filter(acc => acc.status === 'unverified').length,
        lastUpdated: new Date()
      });
    }
  }, [accounts]);

  // Field validation logic
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value.trim()) error = "Username is required";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = "Email is invalid";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Must be at least 8 characters";
        else if (!/(?=.*[a-z])/.test(value)) error = "Needs a lowercase letter";
        else if (!/(?=.*[A-Z])/.test(value)) error = "Needs an uppercase letter";
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

  const validateForm = () => {
    const fields = ["username", "email", "password", "confirmPassword"];
    fields.forEach((field) => validateField(field, formData[field]));
    return fields.every((field) => !errors[field]);
  };

  const handleNextStep = async () => {
    if (validateForm()) {
      // Check if email already exists in active accounts only
      const emailExists = accounts?.some(account => 
        account.email.toLowerCase() === formData.email.trim().toLowerCase() &&
        account.status !== 'deleted' // Only check non-deleted accounts
      );

      if (emailExists) {
        setErrors(prev => ({
          ...prev,
          email: "An active account with this email already exists"
        }));
        return; // Don't proceed to next step if email exists in active accounts
      }

      // If email doesn't exist in active accounts, proceed to next step
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const verifySuperAdmin = async () => {
    try {
      const loginData = {
        email: superAdminEmail,
        password: superAdminAuth.password,
        role: "superadmin"
      };

      const response = await login(loginData).unwrap();
      return true;
    } catch (error) {
      setAuthError("Incorrect super admin password.");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Move requestData declaration outside try block
    const requestData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: "admin"
    };

    console.log('[DEBUG] Creating admin account with data:', requestData);
    console.log('[DEBUG] API URL:', 'http://localhost:4000/api/v1/accounts');

    try {
      const isVerified = await verifySuperAdmin();
      if (!isVerified) {
        setIsSubmitting(false);
        return;
      }

      console.log('[DEBUG] Sending create admin request...');
      const response = await createAdmin(requestData).unwrap();
      console.log('[DEBUG] Create admin response:', response);
      
      toastSuccess("Admin account created successfully. Please check your email for verification.");
      setCurrentStep(3);
    } catch (error) {
      console.error('[DEBUG] Admin creation failed:', {
        errorStatus: error?.status,
        errorMessage: error?.data?.message,
        errorData: error?.data
      });
      toastError(error?.data?.message || "Failed to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    // Check if OTP is empty
    if (!otp.trim()) {
      toastError("Please enter the OTP");
      return;
    }

    try {
      await verifyOTP({
        email: formData.email,
        otp: otp,
        purpose: "account-verification"
      }).unwrap();

      toastSuccess("Email verified successfully!");
      setIsModalOpen(false);
      setCurrentStep(1);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setOtp("");
    } catch (error) {
      toastError(error?.data?.message || "Failed to verify OTP");
    }
  };

  const isFormValid =
    Object.values(errors).every((error) => !error) &&
    formData.username &&
    formData.email &&
    formData.password &&
    formData.confirmPassword;

  // Add this function to handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentStep(1); // Reset to first step
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setOtp("");
    setSuperAdminAuth({ password: "" });
    setErrors({});
    setAuthError("");
    setIsSubmitting(false);
  };

  return (
    <main className="flex flex-col w-full">
      {/* Add Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Admins</p>
              <p className="text-2xl font-bold">{stats.totalAdmins}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg">
              <UserGear size={24} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Admins</p>
              <p className="text-2xl font-bold text-success">{stats.activeAdmins}</p>
            </div>
            <div className="bg-success/10 p-3 rounded-lg">
              <CheckCircle size={24} className="text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Disabled Admins</p>
              <p className="text-2xl font-bold text-error">{stats.disabledAdmins}</p>
            </div>
            <div className="bg-error/10 p-3 rounded-lg">
              <XCircle size={24} className="text-error" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unverified Admins</p>
              <p className="text-2xl font-bold text-warning">{stats.unverifiedAdmins}</p>
            </div>
            <div className="bg-warning/10 p-3 rounded-lg">
              <Clock size={24} className="text-warning" />
            </div>
          </div>
        </div>
      </div>

    

      <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between mb-8 gap-4 mt-6">
        <p className="flex justify-center text-5xl font-extrabold mb-12 md:mb-0 text-center md:justify-start md:text-left md:w-[48%] ">
          Admin Management
        </p>
        <div className="flex items-center gap-6">
          <Link to="/superadmin/admins/archives" className="btn btn-outline rounded-full">
            View Archives
          </Link>
          <button
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm md:w-auto w-full hover:cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <IconPlus size={20} />
            Create New Admin
          </button>
        </div>
      </div>

        {/* Add Filters Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by username or email..."
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select 
                className="select select-bordered w-full max-w-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
                <option value="unverified">Unverified</option>
              </select>

              <select 
                className="select select-bordered w-full max-w-xs"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              className="btn btn-ghost"
              onClick={() => {
                setStatusFilter("");
                setRoleFilter("");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <AdminsTable 
          statusFilter={statusFilter} 
          roleFilter={roleFilter}
          searchQuery={searchQuery}
        />
      </div>

      {/* Add Last Updated Info */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        Last updated: {stats.lastUpdated.toLocaleString()}
      </div>

      {/* Modal */}
      <dialog
        id="admin_modal"
        className="modal"
        open={isModalOpen}
        onClose={handleModalClose}
      >
        <div className="modal-box gap-6 text-lg w-10/12 max-w-3xl p-8 sm:p-12 rounded-3xl">
          <form onSubmit={(e) => {
            e.preventDefault();
            console.log('[DEBUG] Form submitted');
            handleSubmit(e);
          }}>
            {currentStep === 1 ? (
              <div className="flex flex-col gap-6">
                <p className="text-center text-3xl font-bold">
                  Create New Admin
                </p>

                <div className="w-full flex flex-col gap-1">
                  <label className="text-primary font-bold">Username*</label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`p-3 bg-base-200 text-primary rounded-xl border-none ${
                      errors.username ? "border-2 border-error" : ""
                    }`}
                  />
                  {errors.username && (
                    <p className="text-error text-sm mt-1">{errors.username}</p>
                  )}
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

                <div className="w-full flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    className="bg-gray-300 text-white px-6 py-2.5 rounded-xl hover:bg-gray-400 transition-colors hover:cursor-pointer"
                    onClick={handleModalClose}
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
            ) : currentStep === 2 ? (
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
                    onClick={() => console.log('[DEBUG] Submit button clicked')}
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
            ) : (
              <div className="flex flex-col gap-6">
                <p className="text-center text-3xl font-bold">
                  Verify Email
                </p>
                <p className="text-center text-gray-600">
                  Please enter the OTP sent to {formData.email}
                </p>

                <div className="w-full flex flex-col gap-1">
                  <label className="text-primary font-bold">OTP*</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="p-3 bg-base-200 text-primary rounded-xl border-none"
                    placeholder="Enter OTP"
                  />
                </div>

                <div className="w-full flex justify-between gap-3 mt-4">
                  <button
                    type="button"
                    className="bg-gray-300 text-white px-6 py-2.5 rounded-xl hover:bg-gray-400 transition-colors hover:cursor-pointer"
                    onClick={handleModalClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#245261] to-[#4AA8C7] text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity hover:cursor-pointer"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleModalClose}>close</button>
        </form>
      </dialog>
    </main>
  );
}

export default SprAdmins;
