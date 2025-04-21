function Otp() {
  return (
    <main className="flex h-[100vh] items-center justify-center text-white bg-primary">
      <div className="flex flex-col items-center text-lg gap-6">
        <h1 className="text-8xl">Almost there...</h1>
        <p className="font-semibold w-[80%] text-center">
          We've sent a one-time password (OTP) to your email. Enter the code to
          verify your account and continue.
        </p>
        {/* 4 input boxes for the code */}
        <p className="font-light">
          Didn't receive an OTP? <bold>Resend</bold>
        </p>
        <button
          className={`bg-white text-primary rounded-2xl shadow-[2px_6px_3px_rgba(0,0,0,0.10)] px-4 w-[20%] py-2 text-lg hover:bg-base-200 transition-all duration-300 cursor-pointer`}
        >
          <p className="font-bold text-lg">Verify</p>
        </button>
      </div>
    </main>
  );
}

export default Otp;
