import { CustomFormInput, LogoNamed } from "../../components";
import womanLowHand from "../../assets/woman_lowhand.png";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useRegisterMutation } from "../../api/dengueApi";
import { useDispatch } from "react-redux";
import { setEmailForOtp } from "../../features/otpSlice";
import { toastError, toastSuccess } from "../../utils.jsx";

const SignUp = () => {
  const [username, setUsername] = useState("");
  // const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    number: false
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  const [signUp, { isLoading, isError, error: apiError }] = useRegisterMutation("");

  const dispatch = useDispatch();

  // Password validation
  useEffect(() => {
    setPasswordErrors({
      length: password.length < 8,
      number: !/\d/.test(password)
    });
  }, [password]);

  const isPasswordValid = () => {
    return !passwordErrors.length && !passwordErrors.number;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (!isPasswordValid()) {
      setError("Please fix the password requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms and Conditions to continue");
      return;
    }

    try {
      const response = await signUp({
        username,
        email,
        password,
        confirmPassword,
        role: "user"
      }).unwrap();
      console.log("Registration successful:", response);

      // Store email in Redux for OTP verification
      dispatch(setEmailForOtp(email));

      // Show success message
      toastSuccess("Registration successful! Please verify your email.");

      // Navigate to OTP page
      navigate("/otp");
    } catch (err) {
      console.error("Registration error:", err);
      // Handle validation errors from the backend
      if (err.data?.errors) {
        // If there are multiple errors, show them all
        const errorMessages = err.data.errors.map(error => error).join('\n');
        setError(errorMessages);
        toastError(errorMessages);
      } else {
        // Fallback error message
        const errorMessage = err.data?.message || "Registration failed. Please try again.";
        setError(errorMessage);
        toastError(errorMessage);
      }
    }
  };

  return (
    <main className="flex justify-center items-center relative h-[100vh] overflow-scroll">
      <div className=" hidden sm:absolute left-14 top-10">
        <LogoNamed
          textSize="text-[28px] lg:text-5xl xl:text-5xl 2xl:text-5xl"
          iconSize="h-11 w-11 lg:h-16 lg:w-16 xl:h-16 xl:w-16 2xl:h-16 2xl:w-16"
        />
      </div>
      <img
        src={womanLowHand}
        className="absolute hidden right-[59vw] bottom-[-36px] w-203 lg:block xl:bottom-[-44px] xl:w-250 xl:right-249 2xl:w-260"
      />

      <section
        className="w-[87vw] max-w-220 mt-25 rounded-2xl shadow-md text-white bg-primary py-8 px-[7%] lg:px-25 flex flex-col justify-center items-center text-center text-xl lg:text-xl
        lg:max-w-none lg:m-0 lg:rounded-none lg:absolute lg:right-0 lg:top-0 lg:h-[100vh] lg:w-[60vw] xl:w-250"
      >
        <h1 className="mb-2 text-7xl lg:text-8xl">Join buzzmap!</h1>
        <p className="mb-4">
          <span className="font-bold">Sign Up</span> to join us today and be
          part of the movement to track, report, and prevent dengue outbreaks.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-y-3 lg:gap-y-4 w-[90%]"
        >
          <div className="flex flex-row  gap-x-4 w-full">
            <CustomFormInput
              label="Username"
              theme="dark"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {/* <CustomFormInput
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            /> */}
          </div>
          <CustomFormInput
            label="Email"
            type="email"
            theme="dark"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="w-full">
            <CustomFormInput
              label="Password"
              type="password"
              theme="dark"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={password && !isPasswordValid()}
            />
            {password && !isPasswordValid() && (
              <div className="text-error text-[12px] mt-1 text-left">
                {passwordErrors.length && <p>• Password must be at least 8 characters long</p>}
                {passwordErrors.number && <p>• Password must contain at least a number</p>}
              </div>
            )}
          </div>
          <CustomFormInput
            label="Confirm Password"
            type="password"
            theme="dark"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            isConfirm={true}
            error={confirmPassword && password !== confirmPassword}
          />
          <div className="mt-6 mb-7 flex justify-center  items-center gap-x-2">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="checkbox checkbox-lg border-white bg-transparent checked:bg-transparent checked:text-white checked:border-white "
            />
            <label className="text-md lg:text-[14px]">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => document.getElementById('terms_modal').showModal()}
                className="underline hover:text-gray-200 font-semibold hover:cursor-pointer"
              >
                Terms and Conditions
              </button>
            </label>
          </div>
          <button
            disabled={isLoading || !acceptedTerms}
            className="bg-white font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-primary w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>

          {error && (
            <p className="text-error font-semibold text-md">
              {error}
            </p>
          )}

          <div className="flex w-[60%] gap-x-4 mt-6 mb-2 ">
            <div className="flex-1 border-t-1 border-white/60 mt-3 text-primary ">
              -
            </div>
            <div className="text:sm lg:text-[13px]">or Sign Up With</div>
            <div className="flex-1 border-t-1 border-white/60 mt-3 text-primary ">
              -
            </div>
          </div>
          <button className="bg-white mb-2 font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-primary w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300">
            Google
          </button>
        </form>
        <p className="mt-4 text-md lg:text-[14px]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold hover:underline hover:cursor-pointer"
          >
            Login
          </Link>
        </p>
      </section>

      {/* Terms and Conditions Modal */}
      <dialog id="terms_modal" className="modal">
        <div className="modal-box w-11/12 text-primary max-w-4xl max-h-[80vh]">
          <p className="font-extrabold text-2xl text-primary mb-4">Terms and Conditions</p>
          <div className="overflow-y-auto max-h-[50vh] text-gray-700 space-y-4 text-sm leading-relaxed">
            <div>
              <h4 className="font-semibold text-base text-lg mb-2">Acceptance of Terms:</h4>
              <p className="text-md">By accessing or using the BuzzMap application, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the application.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-base text-lg mb-2">User Responsibilities:</h4>
              <p className="text-md">You agree to use BuzzMap only for lawful purposes and in a way that does not infringe on the rights of, restrict, or inhibit anyone else's use and enjoyment of the application.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-base text-lg mb-2">Data Collection and Privacy:</h4>
              <p className="text-md">BuzzMap collects personal information to provide and improve its services. By using the application, you consent to the collection and use of information in accordance with our Privacy Policy.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-base text-lg mb-2">Dengue Reporting Accuracy:</h4>
              <p className="text-md">Users are responsible for providing accurate information when reporting dengue cases. False or misleading reports may result in account suspension.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-base text-lg mb-2">Intellectual Property:</h4>
              <p className="text-md">All content, features, and functionality of BuzzMap are the exclusive property of the developers and are protected by international copyright laws.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-base text-lg mb-2">Limitation of Liability:</h4>
              <p className="text-md">BuzzMap and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the application.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-base text-lg mb-2">Changes to Terms:</h4>
              <p className="text-md">We reserve the right to modify these terms at any time. Your continued use of BuzzMap after any changes constitutes your acceptance of the new terms.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-base text-lg mb-2">Governing Law:</h4>
              <p className="text-md">These terms shall be governed by and construed in accordance with the laws of the jurisdiction where the application is developed.</p>
            </div>
          </div>
          <div className="modal-action">
            <button
              onClick={() => {
                setAcceptedTerms(true);
                document.getElementById('terms_modal').close();
              }}
              className="bg-primary text-white font-semibold py-2 px-4 rounded-md hover:cursor-pointer hover:bg-primary/80 transition-all duration-300"
            >
              Accept Terms
            </button>
                          <form method="dialog">
                <button 
                  onClick={() => setAcceptedTerms(false)}
                  className="bg-white border-1 border-primary text-primary font-semibold py-2 px-4 rounded-md hover:cursor-pointer hover:bg-primary/20 transition-all duration-300"
                >
                  Close
                </button>
              </form>
          </div>
        </div>
      </dialog>
    </main>
  );
};

export default SignUp;
