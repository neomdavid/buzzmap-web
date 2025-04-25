import { CustomFormInput, LogoNamed } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import manHighHand from "../../assets/man_highhand.png";
import { useState } from "react";
import { useLoginMutation } from "../../api/dengueApi";
import { useDispatch } from "react-redux";
import { login as setAuthCredentials } from "../../features/authSlice.js";
import { toastSuccess } from "../../utils.jsx";
import { IconChevronDown } from "@tabler/icons-react";

const Login = () => {
  const [userType, setUserType] = useState("user"); // 'user' is default
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log(email);

  const [login, { isLoading, isError, error }] = useLoginMutation("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login({ email, password }).unwrap();
      console.log(response);
      const { user, accessToken: token } = response;
      dispatch(setAuthCredentials({ user, token }));
      toastSuccess(`Welcome, ${user.name}`);
      navigate("/mapping");
    } catch (err) {
      console.error("Login failed:", err);
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
        className="z-10000 absolute hidden left-[-2px] bottom-[-25px] w-203 lg:block xl:w-250 xl:right-249 2xl:w-260 "
      />

      <section
        className="w-[87vw] h-[80vh] max-w-220 mt-25 rounded-2xl shadow-md text-primary  bg-white py-12 px-[7%] lg:px-25 flex flex-col justify-center items-center text-center text-xl lg:text-2xl
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
          {/* Dropdown Input */}
          <div className="w-full text-left relative hover:cursor-pointer">
            <label className="block mb-2 font-semibold text-xl text-black">
              Login As
            </label>
            <div className="relative rounded-xl px-3 py-2 border border-gray-300 transition-all duration-200 focus-within:outline focus-within:outline-2 focus-within:outline-primary">
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full text-xl p-2 pr-10 outline-none bg-transparent text-black appearance-none hover:cursor-pointer"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="admin">Superadmin</option>
              </select>

              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <IconChevronDown size={20} />
              </span>
            </div>
          </div>

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
            <p className="mt-[-4px] font-semibold text-red-500 font-light italic text-md">
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
