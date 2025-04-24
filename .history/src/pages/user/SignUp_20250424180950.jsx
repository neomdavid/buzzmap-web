import { CustomFormInput, LogoNamed } from "../../components";
import womanLowHand from "../../assets/woman_lowhand.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSignUpMutation } from "../../api/dengueApi";
import { useDispatch } from "react-redux";
import { setEmailForOtp } from "../../features/otpSlice";

const SignUp = () => {
  const [username, setUsername] = useState("");
  // const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const [signUp, { isLoading, isError, error }] = useSignUpMutation("");

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signUp({ username, email, password }).unwrap();
      dispatch(setEmailForOtp(email));
      navigate("/otp"); // go to OTP screen
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main className="flex justify-center items-center relative h-[100vh] overflow-hidden">
      <div className="absolute left-14 top-10">
        <LogoNamed
          textSize="text-[28px] lg:text-5xl xl:text-5xl 2xl:text-5xl"
          iconSize="h-11 w-11 lg:h-16 lg:w-16 xl:h-16 xl:w-16 2xl:h-16 2xl:w-16"
        />
      </div>
      <img
        src={womanLowHand}
        className="absolute hidden right-[59vw] bottom-[-36px] w-203 lg:block xl:bottom-[-44px] xl:w-250 xl:right-249 2xl:w-260 "
      />

      <section
        className="w-[87vw] max-w-220 mt-25 rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,0.40)]  text-white  bg-primary py-12 px-[7%] lg:px-25 flex flex-col justify-center items-center text-center text-xl lg:text-xl
      lg:max-w-none lg:m-0 lg:rounded-none lg:absolute lg:right-0 lg:top-0  lg:h-[100vh] lg:w-[60vw] xl:w-250  "
      >
        <h1 className="mb-4 text-7xl lg:text-8xl ">Join buzzmap!</h1>
        <p className="mb-6">
          <span className="font-bold ">Sign Up</span> to join us today and be
          part of the movement to track, report, and prevent dengue outbreaks.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-y-3 lg:gap-y-8  w-[90%]"
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
          <CustomFormInput
            label="Password"
            type="password"
            theme="dark"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <CustomFormInput
            label="Confirm Password"
            type="password"
            theme="dark"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            isConfirm={true}
          />
          <div className="mt-4 mb-4 flex justify-center  items-center gap-x-2">
            <input
              type="checkbox"
              defaultChecked
              className="checkbox checkbox-lg border-white bg-transparent checked:bg-transparent checked:text-white checked:border-white "
            />
            <label className="text-md lg:text-[14px]">
              I agree to the Terms and Conditions
            </label>
          </div>
          <button
            disabled={isLoading}
            className="bg-white font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-primary w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>

          {isError && (
            <p className="text-error font-semibold text-md mt-[-10px]">
              {error?.data?.message ||
                "Something went wrong. Please try again."}
            </p>
          )}

          <div className="flex w-[60%] gap-x-4 mb-[-8px] ">
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
        <p className="mt-8 text-md lg:text-[14px]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold hover:underline hover:cursor-pointer"
          >
            Login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default SignUp;
