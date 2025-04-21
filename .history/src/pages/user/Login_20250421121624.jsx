import { CustomFormInput, LogoNamed } from "../../components";
import { Link } from "react-router-dom";
import manHighHand from "../../assets/man_highhand.png";
import { useState } from "react";
import { useLoginMutation } from "../../api/dengueApi";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  console.log(email);

  const [login, { isLoading, isError, error }] = useLoginMutation("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login({ email, password }).unwrap();
      console.log(response);

      toast.success("Logged in successfully!", {
        position: "top-center", // where the toast shows
        autoClose: 3000, // closes after 3 seconds
        hideProgressBar: false, // shows progress bar
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "text-md bg-secondary text-primary", // custom styling via Tailwind
      });
    } catch (err) {
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
      lg:shadow-none lg:max-w-none lg:m-0 lg:rounded-none lg:absolute lg:right-0 lg:top-0  lg:h-[100vh] lg:w-[60vw] xl:w-250  "
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
            isConfirm={true}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mt-[-1px] mb-4 flex  w-full justify-between">
            <div className="flex justify-center  items-center gap-x-2">
              <input
                type="checkbox"
                defaultChecked
                className="checkbox checkbox-lg border-primary bg-transparent checked:bg-transparent checked:text-primary checked:border-primary "
              />
              <label className="text-md lg:text-[14px]">Remember Me</label>
            </div>
            <p className="font-semibold text-[14px] italic hover:underline hover:cursor-pointer">
              Forgot password?
            </p>
          </div>
          <div className="flex flex-col h-full"></div>

          <button
            className={`bg-primary  font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300 ${
              isLoading && "bg-gray-100 disabled"
            }`}
          >
            Login
          </button>
          {isError && (
            <p className="mt-[-10px] font-semibold text-red-500 font-light italic text-md">
              {error?.data?.message ||
                "Login failed. Please check your credentials."}
            </p>
          )}
          <div className="flex w-[60%] gap-x-4 mb-[-8px] ">
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
