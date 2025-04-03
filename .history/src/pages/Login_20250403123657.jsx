import { CustomFormInput, LogoNamed } from "../components";
import womanLowHand from "../assets/woman_lowhand.png";
const Login = () => {
  return (
    <main className="flex justify-center items-center relative h-[100vh] overflow-hidden">
      <div className="absolute left-8 top-8">
        <LogoNamed textSize="text-[28px]" iconSize="h-11 w-11" />
      </div>
      <img
        src={womanLowHand}
        className="absolute hidden right-[59vw] bottom-[-25px] w-203 lg:block xl:w-260 xl:right-249 2xl:w-270 "
      />

      <section
        className="mx-20 mt-20  text-white  bg-primary py-10 px-25 flex flex-col justify-center items-center text-center text-xl w-[100vw]
      lg:absolute lg:right-0 lg:top-0  lg:h-[100vh] lg:w-[60vw] xl:w-250  "
      >
        <h1 className="mb-4 text-8xl lg:text-red-100">Join buzzmap!</h1>
        <p className="mb-6">
          <span className="font-bold">Sign Up</span> to join us today and be
          part of the movement to track, report, and prevent dengue outbreaks.
        </p>
        <form className="flex flex-col items-center gap-y-8 w-full">
          <div className="flex flex-col lg:flex-row gap-y-4 gap-x-4 w-full">
            <CustomFormInput label="First Name" />
            <CustomFormInput label="First Name" />
          </div>
          <CustomFormInput label="Email" type="email" />
          <CustomFormInput label="Password" type="password" />
          <CustomFormInput label="Confirm Password" type="password" />
          <div className="mt-2 mb-4 flex justify-center  items-center gap-x-2">
            <input
              type="checkbox"
              defaultChecked
              className="checkbox checkbox-lg border-white bg-transparent checked:bg-transparent checked:text-white checked:border-white "
            />
            <label className="text-[14px]">
              I agree to the Terms and Conditions
            </label>
          </div>
          <button className="bg-white font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-primary w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300">
            Sign Up
          </button>
          <div className="flex w-[60%] gap-x-4 mb-[-8px] ">
            <div className="flex-1 border-t-1 border-white/60 mt-3 text-primary ">
              -
            </div>
            <div className="text-[13px]">or Sign Up With</div>
            <div className="flex-1 border-t-1 border-white/60 mt-3 text-primary ">
              -
            </div>
          </div>
          <button className="bg-white mb-2 font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-primary w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300">
            Google
          </button>
        </form>
        <p className="mt-8 text-[14px]">
          Already have an account? <span className="font-bold">Login</span>
        </p>
      </section>
    </main>
  );
};

export default Login;
