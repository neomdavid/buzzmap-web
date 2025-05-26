import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CustomFormInput, LogoNamed } from "../../components";
import { useForgotPasswordMutation, useVerifyResetOtpMutation, useResetPasswordMutation, useResendResetOtpMutation } from "../../api/dengueApi";
import { toastSuccess, toastError } from "../../utils.jsx";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  console.log("ForgotPassword component mounted");
  console.log("Current location:", location.pathname);

  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifyLoading }] = useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();
  const [resendOtp, { isLoading: isResendLoading }] = useResendResetOtpMutation();

  // Add useEffect for cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email).unwrap();
      toastSuccess("Password reset email sent successfully!");
      setStep(2);
    } catch (err) {
      toastError(err?.data?.message || "Failed to send password reset email");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    try {
      setOtpError(false);
      const response = await verifyOtp({
        email,
        otp: otpString,
        purpose: "password-reset"
      }).unwrap();
      setResetToken(response.resetToken);
      setStep(3);
    } catch (err) {
      setOtpError(true);
      toastError(err?.data?.message || "Failed to verify OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toastError("Password must be at least 8 characters long");
      return;
    }
    try {
      await resetPassword({
        resetToken,
        newPassword
      }).unwrap();
      toastSuccess("Password has been reset successfully!");
      navigate("/login");
    } catch (err) {
      toastError(err?.data?.message || "Failed to reset password");
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(email).unwrap();
      toastSuccess("A new OTP has been sent to your email");
      setCooldown(60); // Start 60 second cooldown
    } catch (err) {
      toastError(err?.data?.message || "Failed to resend OTP");
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(false); // Clear error when user types

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <main className="flex justify-center items-center relative h-[100vh] overflow-hidden">
      <div className="absolute left-16 lg:left-20 xl:left-22 top-10">
        <LogoNamed
          textSize="text-[28px] lg:text-5xl xl:text-5xl 2xl:text-5xl"
          iconSize="h-11 w-11 lg:h-16 lg:w-16 xl:h-16 xl:w-16 2xl:h-16 2xl:w-16"
        />
      </div>

      <section className="w-[87vw]  h-[80vh] max-w-220 mt-25 rounded-2xl  text-primary bg-white py-8 px-[7%] lg:px-25 flex flex-col justify-center items-center text-center text-xl lg:text-2xl
        lg:shadow-none lg:max-w-none lg:m-0 lg:rounded-none lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:h-[80vh] lg:w-[500px] xl:w-[600px] "
      >
        <h1 className="mb-2 text-7xl lg:text-8xl">Reset Password</h1>
        
        {step === 1 && (
          <>
            <p className="mb-4">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            <form onSubmit={handleForgotPassword} className="flex flex-col items-center gap-y-3 lg:gap-y-4 w-[85%]">
              <CustomFormInput
                label="Email"
                type="email"
                theme="light"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={isForgotLoading}
                className={`bg-primary font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300 ${
                  isForgotLoading && "opacity-50 cursor-not-allowed"
                }`}
              >
                {isForgotLoading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p className="mb-4">
              Enter the 4-digit code sent to your email.
            </p>
            <form onSubmit={handleVerifyOtp} className="flex flex-col items-center gap-y-3 lg:gap-y-4 w-[85%]">
              <div className="grid grid-cols-4 gap-2 h-30 sm:h-55 md:h-65 mb-4 w-[70vw] max-w-5xl">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    name={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`text-center text-4xl sm:text-9xl border-2 rounded-lg focus:outline-none focus:border-accent ${
                      otpError ? 'border-red-500' : 'border-primary'
                    }`}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={isVerifyLoading}
                className={`bg-primary font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300 ${
                  isVerifyLoading && "opacity-50 cursor-not-allowed"
                }`}
              >
                {isVerifyLoading ? "Verifying..." : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendLoading || cooldown > 0}
                className={`text-primary hover:underline mt-2 ${
                  (isResendLoading || cooldown > 0) && "opacity-50 cursor-not-allowed"
                }`}
              >
                {isResendLoading 
                  ? "Sending..." 
                  : cooldown > 0 
                    ? `Resend Code (${cooldown}s)` 
                    : "Resend Code"}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <p className="mb-4">
              Enter your new password.
            </p>
            <form onSubmit={handleResetPassword} className="flex flex-col items-center gap-y-3 lg:gap-y-4 w-[85%]">
              <CustomFormInput
                label="New Password"
                type="password"
                theme="light"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <CustomFormInput
                label="Confirm Password"
                type="password"
                theme="light"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={isResetLoading}
                className={`bg-primary font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300 ${
                  isResetLoading && "opacity-50 cursor-not-allowed"
                }`}
              >
                {isResetLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
};

export default ForgotPassword; 