import { CustomFormInput, LogoNamed } from "../../components";
import { Link, useNavigate, useLocation } from "react-router-dom";
import manHighHand from "../../assets/man_highhand.png";
import { useState } from "react";
import { useLoginMutation, useResendOtpMutation } from "../../api/dengueApi";
import { useDispatch } from "react-redux";
import { setAuthCredentials } from "../../features/authSlice.js";
import { setEmailForOtp } from "../../features/otpSlice";
import { toastSuccess, toastError } from "../../utils.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  console.log("Login component rendered");
  console.log("Current location:", location.pathname);

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    console.log("Forgot password clicked");
    console.log("Attempting to navigate to /forgot-password");
    navigate("/forgot-password", { replace: false });
  };

  const [login, { isLoading, isError, error }] = useLoginMutation("");
  const [resendOtp] = useResendOtpMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login attempt started for email:", email);

    try {
      const response = await login({
        email,
        password,
      }).unwrap();
      console.log("Login successful:", response);
      
      const { user, accessToken } = response;
      
      // First update Redux state
      dispatch(setAuthCredentials({ user, token: accessToken, rememberMe }));

      // Show success message
      toastSuccess(`Welcome, ${user.name}`);

      // Wait for state to be updated and persisted
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the state was updated correctly
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!storedUser || !storedToken) {
        toastError('Login failed - please try again');
        return;
      }

      // Navigate based on role
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "superadmin":
          navigate("/superadmin/users", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login error details:", {
        status: err?.status,
        message: err?.data?.message,
        fullError: err
      });
      
      // Check for unverified account error
      const errorMessage = err?.data?.message?.toLowerCase() || '';
      if (errorMessage.includes("not been verified") || errorMessage.includes("pending activation")) {
        console.log("Unverified account detected");
        console.log("Storing email in Redux:", email);
        
        // Store email in Redux for OTP verification
        dispatch(setEmailForOtp(email));
        
        try {
          // Automatically resend OTP for account verification
          await resendOtp({
            email,
            purpose: "account-verification"
          }).unwrap();
          
          toastSuccess("Verification code has been resent to your email!");
          
          // Wait for Redux state to update
          setTimeout(() => {
            console.log("Redirecting to OTP page with state");
            // Use replace: true to prevent back navigation
            navigate("/otp", { 
              replace: true,
              state: { 
                from: 'login',
                email: email 
              }
            });
          }, 100);
        } catch (resendError) {
          console.error("Failed to resend OTP:", resendError);
          toastError("Failed to resend verification code. Please try again.");
          
          // Still redirect to OTP page even if resend fails
          setTimeout(() => {
            navigate("/otp", { 
              replace: true,
              state: { 
                from: 'login',
                email: email 
              }
            });
          }, 100);
        }
        return;
      }

      // Handle other errors - prioritize backend message
      const backendMessage = err?.data?.message;
      if (backendMessage) {
        toastError(backendMessage);
      } else if (err?.status === 500) {
        toastError('Network error. Please check your connection and try again.');
      } else {
        toastError("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <main className="flex justify-center items-center relative h-[100vh]  overflow-hidden">
      <div className="absolute left-16 lg:left-20 xl:left-22 top-10">
        <LogoNamed
          textSize="text-[28px] lg:text-5xl xl:text-5xl 2xl:text-5xl"
          iconSize="h-11 w-11 lg:h-16 lg:w-16 xl:h-16 xl:w-16 2xl:h-16 2xl:w-16"
        />
      </div>
      <div className="hidden absolute lg:block z-[-1000] text-primary bg-primary w-10 top-0 bottom-0 left-0 xl:w-12.5 2xl:w-13">
        h
      </div>
      <img
        src={manHighHand}
        className="z-10000 absolute hidden left-[-2px] bottom-[-25px] w-203 lg:block xl:w-230 xl:right-249 2xl:w-265 "
      />

      <section
        className="md:w-[87vw] md:h-[80vh] max-w-220 mt-25 rounded-2xl lg:shadow-md text-primary bg-white py-8 px-[7%] lg:px-25 flex flex-col justify-center items-center text-center text-lg lg:text-2xl
        lg:shadow-none lg:max-w-none lg:m-0 lg:rounded-none lg:absolute lg:right-0 lg:top-0 lg:h-[100vh] lg:w-[60vw] xl:w-250 overflow-y-auto"
      >
        <h1 className="mb-2 text-7xl lg:text-8xl">Welcome back!</h1>
        <p className="mb-4">
          <span className="font-bold">Login</span> to stay informed and help
          prevent dengue outbreaks in your community.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-y-3 lg:gap-y-4 w-[85%]"
        >
          <CustomFormInput
            label="Email"
            type="email"
            theme="light"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <CustomFormInput
            label="Password"
            type="password"
            theme="light"
            isConfirm={true}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mt-[-1px] mb-4 flex  w-full justify-between z-10000000">
            <div className="flex justify-center  items-center gap-x-2">
              <input
                type="checkbox"
                className="checkbox checkbox-lg border-primary bg-transparent checked:bg-transparent checked:text-primary checked:border-primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-md lg:text-[14px]">Remember Me</label>
            </div>
            <button
              onClick={handleForgotPasswordClick}
              className="font-semibold  italic hover:underline hover:cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="flex flex-col h-full"></div>

          <button
            disabled={isLoading || !email.trim() || !password.trim()}
            className={`bg-primary  font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300 ${
              (isLoading || !email.trim() || !password.trim()) && "bg-gray-100 disabled opacity-50 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {isError && (
            <p className="z-10000000  font-semibold text-red-500 font-light italic text-md">
              {error?.data?.message || 
                (error?.status === 500 
                  ? "Network error. Please check your connection and try again."
                  : "Login failed. Please check your credentials.")}
            </p>
          )}
          {/* <div className="flex w-[60%] gap-x-4 mb-[-8px] ">
            <div className="flex-1 border-t-1 border-primary/60 mt-3 text-white  ">
              -
            </div>
            <div className="text:sm lg:text-[13px] mb-6">or Login With</div>
            <div className="flex-1 border-t-1 border-primary/60 mt-3 text-white  ">
              -
            </div>
          </div>
          <button className="bg-primary mb-2 font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300">
            Google
          </button> */}
        </form>
        <p className="mt-4 text-md lg:text-[14px]">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-bold hover:underline hover:cursor-pointer"
          >
            Sign Up
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
