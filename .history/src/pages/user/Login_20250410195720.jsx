import { CustomFormInput, LogoNamed } from "../../components";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLoginMutation } from "../../api/dengueApi"; // Import the useLoginMutation hook
import manHighHand from "../../assets/man_highhand.png";

const Login = () => {
  // Local state for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Get the login mutation hook
  const [login, { isLoading, isError, error }] = useLoginMutation();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login({ email, password }).unwrap();
      // Handle successful login (e.g., redirect to dashboard)
    } catch (err) {
      // Handle error
      console.error("Login failed:", err);
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
      <div className="hidden absolute lg:block z-[-1000] text-primary bg-primary w-10 top-0 bottom-0 left-0 xl:w-12.5 2xl:w-13">
        h
      </div>
      <img
        src={manHighHand}
        className="z-10000 absolute hidden left-[-2px] bottom-[-25px] w-203 lg:block xl:w-250 xl:right-249 2xl:w-260 "
      />
      <section
        className="w-[87vw] h-[80vh] max-w-220 mt-25 rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,0.40)]  text-primary  bg-white py-12 px-[7%] lg:px-25 flex flex-col justify-center items-center text-center text-lg lg:text-xl
        lg:shadow-none lg:max-w-none lg:m-0 lg:rounded-none lg:absolute lg:right-0 lg:top-0  lg:h-[100vh] lg:w-[60vw] xl:w-250"
      >
        <h1 className="mb-4 text-7xl lg:text-8xl ">Welcome back!</h1>
        <p className="mb-10">
          <span className="font-bold">Login</span> to stay informed and help
          prevent dengue outbreaks in your community.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-y-6 lg:gap-y-8 w-[85%]"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isConfirm={true}
          />
          <div className="mt-[-1px] mb-4 flex w-full justify-between">
            <div className="flex justify-center items-center gap-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox checkbox-lg border-primary bg-transparent checked:bg-transparent checked:text-primary checked:border-primary"
                id="rememberMe"
              />
              <label htmlFor="rememberMe" className="text-md lg:text-[14px]">
                Remember Me
              </label>
            </div>
            <p className="font-semibold text-[14px] italic hover:underline hover:cursor-pointer">
              Forgot password?
            </p>
          </div>
          <button
            type="submit"
            className="bg-primary mb-4 font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {isError && (
            <p className="text-red-500 text-sm">
              {error?.message || "An error occurred. Please try again."}
            </p>
          )}
          <div className="flex w-[60%] gap-x-4 mb-[-8px]">
            <div className="flex-1 border-t-1 border-primary/60 mt-3 text-white">
              -
            </div>
            <div className="text:sm lg:text-[13px] mb-6">or Login With</div>
            <div className="flex-1 border-t-1 border-primary/60 mt-3 text-white">
              -
            </div>
          </div>
          <button className="bg-primary mb-2 font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300">
            Google
          </button>
        </form>
        <p className="mt-6 text-md lg:text-[14px]">
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
