function Otp() {
  return (
    <main className="flex h-[100vh] items-center justify-center text-white bg-primary">
      <div className="flex flex-col items-center">
        <h1>Almost there...</h1>
        <p>
          We've sent a one-time password (OTP) to your email. Enter the code to
          verify your account and continue.
        </p>
        {/* 4 input boxes for the code */}
        <p>
          Didn't receive an OTP? <bold>Resend</bold>
        </p>
        <button
          className={`bg-primary  font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300`}
        >
          Verify
        </button>
      </div>
    </main>
  );
}

export default Otp;
