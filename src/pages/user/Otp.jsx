import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useVerifyOtpMutation, useResendOtpMutation } from "../../api/dengueApi";
// import { setCredentials } from "../../features/authSlice";
import { toastError } from "../../utils.jsx";
import { useNavigate, useLocation } from "react-router-dom";

function Otp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const email = useSelector((state) => state.otp.email);
  const [verifyOtp, { isLoading, isError, error, reset }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendLoading }] = useResendOtpMutation();
  const [cooldown, setCooldown] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasResent, setHasResent] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from either Redux or location state
  const emailToUse = email || location.state?.email;

  // Log component mount and state
  useEffect(() => {
    console.log("[OTP] Component mounted");
    console.log("[OTP] Email from Redux:", email);
    console.log("[OTP] Location state:", location.state);
  }, []);

  // Add useEffect for cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      console.log("[OTP] Starting cooldown timer:", cooldown);
      timer = setInterval(() => {
        setCooldown((prev) => {
          const newValue = prev - 1;
          console.log("[OTP] Cooldown updated:", newValue);
          return newValue;
        });
      }, 1000);
    }
    return () => {
      if (timer) {
        console.log("[OTP] Clearing cooldown timer");
        clearInterval(timer);
      }
    };
  }, [cooldown]);

  // Add useEffect to handle initialization
  useEffect(() => {
    console.log("[OTP] Initialization effect running");
    console.log("[OTP] Has initialized:", hasInitialized);
    console.log("[OTP] Email:", email);
    console.log("[OTP] Location state:", location.state);

    const initializeOtp = async () => {
      console.log("[OTP] Initializing OTP component");
      
      if (!emailToUse) {
        console.log("[OTP] No email found, redirecting to login");
        toastError("No email found. Please try logging in again.");
        navigate("/login");
        return;
      }

      // Show toast if redirected from login
      if (location.state?.from === 'login') {
        console.log("[OTP] Redirected from login, showing toast");
        toastError("Account registration was not completed. Please verify your email to continue.");
      }

      try {
        console.log("[OTP] Attempting to send initial OTP to:", emailToUse);
        const response = await resendOtp({
          email: emailToUse,
          purpose: "account-verification"
        }).unwrap();
        console.log("[OTP] Initial OTP send response:", response);
        setCooldown(60); // Set initial cooldown
      } catch (err) {
        console.error("[OTP] Initial OTP send error:", err);
        // Extract cooldown time from error message if available
        if (err?.data?.message?.includes("wait")) {
          const waitTime = parseInt(err.data.message.match(/\d+/)[0]);
          console.log("[OTP] Setting cooldown from error message:", waitTime);
          setCooldown(waitTime);
        } else {
          toastError(err?.data?.message || "Failed to send OTP");
        }
      }
    };

    // Only run initialization if we haven't already
    if (!hasInitialized) {
      console.log("[OTP] Running initialization");
      initializeOtp();
      setHasInitialized(true);
    }
  }, [email, location.state?.from, location.state?.email]);

  const handleResendOtp = async () => {
    if (!emailToUse) {
      console.log("[OTP] No email found for resend");
      toastError("No email found. Please try logging in again.");
      navigate("/login");
      return;
    }

    try {
      console.log("[OTP] Sending resend request with:", {
        email: emailToUse,
        purpose: "account-verification"
      });
      const response = await resendOtp({
        email: emailToUse,
        purpose: "account-verification"
      }).unwrap();
      console.log("[OTP] OTP resend response:", response);
      setCooldown(60); // Start 60 second cooldown only for resend
      setHasResent(true);
    } catch (err) {
      console.error("[OTP] OTP resend error:", err);
      // Extract cooldown time from error message if available
      if (err?.data?.message?.includes("wait")) {
        const waitTime = parseInt(err.data.message.match(/\d+/)[0]);
        console.log("[OTP] Setting cooldown from error message:", waitTime);
        setCooldown(waitTime);
      } else {
        toastError(err?.data?.message || "Failed to resend OTP");
      }
    }
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow one digit
    
    // Reset error state when OTP changes
    if (isError) {
      reset();
    }
    
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
      console.log("[OTP] Attempting to verify OTP");
      const response = await verifyOtp({
        email: emailToUse,
        otp: fullOtp,
        purpose: "account-verification",
      }).unwrap();
      console.log("[OTP] OTP verified successfully:", response);
      navigate("/login");
    } catch (err) {
      console.error("[OTP] OTP verification failed:", err);
    }
  };

  return (
    <main className="flex h-[100vh] items-center justify-center text-white bg-primary">
      <div className="flex flex-col items-center text-xl gap-8">
        <h1 className="text-8xl">Almost there...</h1>
        <p className="font-normal w-[70%] text-center mb-2">
          We've sent a one-time password (OTP) to your email. Enter the code to
          verify your account and continue.
        </p>
        <p className="font-bold text-white text-2xl text-center mt-[-18px] mb-6">
          {emailToUse}
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
            {error?.data?.message?.includes("email") 
              ? "Invalid OTP code. Please try again."
              : error?.data?.message || "Something went wrong. Please try again."}
          </p>
        )}
      </div>
    </main>
  );
}

export default Otp;
