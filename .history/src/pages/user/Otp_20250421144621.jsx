function Otp() {
  return (
    <main className="flex h-[100vh] items-center justify-center text-white bg-primary">
      <div className="flex flex-col items-center text-md">
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
          className={`bg-white text-primary rounded-2xl px-4 py-2 text-lg`}
        >
          Verify
        </button>
      </div>
    </main>
  );
}

export default Otp;
