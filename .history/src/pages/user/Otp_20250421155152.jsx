import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useVerifyOtpMutation } from "../../api/dengueApi";
import { toast } from "react-toastify";

function Otp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const email = useSelector((state) => state.otp.email);
  const [verifyOtp, { isLoading, isError, error }] = useVerifyOtpMutation();
  console.log(email);
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
      toast.success(`Welcome, ${email}`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "text-md",
      });
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
        <div className="flex gap-5 mb-8">
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
              className="w-43 h-65 border-3  rounded-xl py-10 px-2 text-center text-9xl border-b-2 border-white bg-transparent focus:outline-none focus:border-accent"
            />
          ))}
        </div>

        <p className="font-light mb-6">
          Didn't receive an OTP?{" "}
          <span className="font-bold hover:cursor-pointer">Resend</span>
        </p>

        <button
          onClick={handleVerify}
          className={`bg-white text-primary rounded-2xl shadow-[2px_6px_3px_rgba(0,0,0,0.10)] px-4 w-[25%] py-2.5 text-lg hover:bg-base-200 transition-all duration-300 cursor-pointer`}
        >
          <p className="font-bold text-xl">Verify</p>
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
