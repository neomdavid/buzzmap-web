import { CustomFormInput, LogoNamed } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import manHighHand from "../../assets/man_highhand.png";
import { useState } from "react";
import { useLoginMutation } from "../../api/dengueApi";
import { useDispatch } from "react-redux";
import { login as setAuthCredentials } from "../../features/authSlice.js";
import { toastSuccess } from "../../utils.jsx";

const Login = () => {
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
  {/* User Type Dropdown */}
  <div className="w-full text-left">
    <label className="block mb-2 font-semibold text-xl">Login As</label>
    <select
      value={userType}
      onChange={(e) => setUserType(e.target.value)}
      className="w-full p-3 rounded-xl border border-gray-300 text-base text-black bg-white focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  </div>

  {/* Email Input */}
  <CustomFormInput
    label="Email"
    type="email"
    theme="light"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  {/* Password Input */}
  <CustomFormInput
    label="Password"
    type="password"
    theme="light"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

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
