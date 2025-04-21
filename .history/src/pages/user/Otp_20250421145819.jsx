import { useRef, useState } from "react";

function Otp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

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

  return (
    <main className="flex h-[100vh] items-center justify-center text-white bg-primary">
      <div className="flex flex-col items-center text-lg gap-6">
        <h1 className="text-8xl">Almost there...</h1>
        <p className="font-semibold w-[80%] text-center mb-6">
          We've sent a one-time password (OTP) to your email. Enter the code to
          verify your account and continue.
        </p>

        {/* 4 OTP input boxes */}
        <div className="flex gap-4 mb-6">
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
              className="w-40 h-59 border-2  rounded-xl py-10 px-2 text-center text-9xl border-b-2 border-white bg-transparent focus:outline-none focus:border-accent"
            />
          ))}
        </div>

        <p className="font-light mb-6">
          Didn't receive an OTP?{" "}
          <span className="font-bold hover:cursor-pointer">Resend</span>
        </p>

        <button
          className={`bg-white text-primary rounded-2xl shadow-[2px_6px_3px_rgba(0,0,0,0.10)] px-4 w-[23%] py-2 text-lg hover:bg-base-200 transition-all duration-300 cursor-pointer`}
        >
          <p className="font-bold text-lg">Verify</p>
        </button>
      </div>
    </main>
  );
}

export default Otp;
