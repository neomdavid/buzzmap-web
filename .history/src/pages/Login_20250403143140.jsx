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
        className="absolute hidden right-[59vw] bottom-[-25px] w-203 lg:block xl:w-250 xl:right-249 2xl:w-260 "
      />

      <section
        className="w-[87vw] h-[70vh] max-w-220 mt-25 rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,0.40)]  text-primary  bg-white py-12 px-[7%] lg:px-25 flex flex-col justify-center items-center text-center text-lg lg:text-xl
      lg:shadow-none lg:max-w-none lg:m-0 lg:rounded-none lg:absolute lg:right-0 lg:top-0  lg:h-[100vh] lg:w-[60vw] xl:w-250  "
      >
        <h1 className="mb-4 text-7xl lg:text-8xl ">Welcome back!</h1>
        <p className="mb-6">
          <span className="font-bold ">Login</span> to stay informed and help
          prevent dengue outbreaks in your community.
        </p>
        <form className="flex flex-col items-center gap-y-6 lg:gap-y-8 w-full">
          <CustomFormInput label="Email" type="email" />
          <CustomFormInput label="Password" type="password" />
          <div className="mt-[-5px] flex  w-full justify-between">
            <div className=" mb-4 flex justify-center  items-center gap-x-2">
              <input
                type="checkbox"
                defaultChecked
                className="checkbox checkbox-lg border-primary bg-transparent checked:bg-transparent checked:text-primary checked:border-primary "
              />
              <label className="text-md lg:text-[14px]">Remember Me</label>
            </div>
            <p className="font-semibold italic">Forgot password?</p>
          </div>

          <button className="bg-primary font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300">
            Login
          </button>
          <div className="flex w-[60%] gap-x-4 mb-[-8px] ">
            <div className="flex-1 border-t-1 border-primary/60 mt-3 text-white  ">
              -
            </div>
            <div className="text:sm lg:text-[13px]">or Login With</div>
            <div className="flex-1 border-t-1 border-primary/60 mt-3 text-white  ">
              -
            </div>
          </div>
          <button className="bg-primary mb-2 font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-white w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300">
            Google
          </button>
        </form>
        <p className="mt-8 text-md lg:text-[14px]">
          Don't have an account?{" "}
          <span className="font-bold hover:underline hover:cursor-pointer">
            Sign Up
          </span>
        </p>
      </section>
    </main>
  );
};

export default Login;
