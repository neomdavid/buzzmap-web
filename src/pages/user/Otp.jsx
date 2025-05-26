import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useVerifyOtpMutation, useResendOtpMutation } from "../../api/dengueApi";
// import { setCredentials } from "../../features/authSlice";
import { toastSuccess, toastError } from "../../utils.jsx";
import { useNavigate } from "react-router-dom";

function Otp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const email = useSelector((state) => state.otp.email);
  const [verifyOtp, { isLoading, isError, error }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendLoading }] = useResendOtpMutation();
  const [cooldown, setCooldown] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const handleResendOtp = async () => {
    try {
      await resendOtp(email).unwrap();
      toastSuccess("A new OTP has been sent to your email");
      setCooldown(60); // Start 60 second cooldown
    } catch (err) {
      toastError(err?.data?.message || "Failed to resend OTP");
    }
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow one digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    try {
      const fullOtp = otp.join(""); // combine 4 digits into a string
      const response = await verifyOtp({
        email,
        otp: fullOtp,
        purpose: "account-verification",
      }).unwrap();
      console.log("OTP verified:", response);

      // TODO: Store user account info (see below)
      // dispatch(setCredentials({ user }));

      toastSuccess("Your account has been registered.");
      navigate("/login");
    } catch (err) {
      console.error("OTP failed:", err);
    }
  };

  return (
    <main className="flex h-[100vh] items-center justify-center text-white bg-primary">
      <div className="flex flex-col items-center text-xl gap-8">
        <h1 className="text-8xl">Almost there...</h1>
        <p className="font-semibold w-[70%] text-center mb-6">
          We've sent a one-time password (OTP) to your email. Enter the code to
          verify your account and continue.
        </p>

        {/* 4 OTP input boxes */}
        <div className="grid grid-cols-4 gap-2 h-30 sm:h-55 md:h-65 mb-4 w-[70vw] max-w-5xl">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`rounded-xl py-10 px-2 text-center text-4xl sm:text-9xl border-3 border-white bg-transparent focus:outline-none focus:border-accent ${
                isError ? "text-red-400" : ""
              }`}
            />
          ))}
        </div>

        <p className="font-light mb-6">
          Didn't receive an OTP?{" "}
          <button
            onClick={handleResendOtp}
            disabled={isResendLoading || cooldown > 0}
            className={`font-bold hover:underline ${
              (isResendLoading || cooldown > 0) && "opacity-50 cursor-not-allowed"
            }`}
          >
            {isResendLoading 
              ? "Sending..." 
              : cooldown > 0 
                ? `Resend (${cooldown}s)` 
                : "Resend"}
          </button>
        </p>
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className={`bg-white text-primary rounded-2xl shadow-[2px_6px_3px_rgba(0,0,0,0.10)] px-4 w-[25%] py-2.5 text-lg transition-all duration-300 cursor-pointer
    ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-base-200"}
  `}
        >
          {isLoading ? (
            <p className="font-bold text-xl animate-pulse">Verifying...</p>
          ) : (
            <p className="font-bold text-xl">Verify</p>
          )}
        </button>

        {isError && (
          <p className="text-red-400 font-semibold text-md mt-[-10px]">
            {error?.data?.message || "Something went wrong. Please try again."}
          </p>
        )}
      </div>
    </main>
  );
}

export default Otp;
