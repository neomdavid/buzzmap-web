import { CustomFormInput, LogoNamed } from "../components";
import { Check } from "phosphor-react";
const Login = () => {
  return (
    <main className="relative">
      <div className="absolute left-8 top-8">
        <LogoNamed textSize="text-[28px]" iconSize="h-11 w-11" />
      </div>
      <section className="absolute right-0 top-0 h-[100vh] text-white w-[60vw] bg-primary py-10 px-25 flex flex-col justify-center items-center text-center text-lg  ">
        <h1 className="mb-4 text-7xl lg:text-red-100">Join buzzmap!</h1>
        <p className="mb-6">
          <span className="font-extrabold">Sign Up</span> to join us today and
          be part of the movement to track, report, and prevent dengue
          outbreaks.
        </p>
        <form className="flex flex-col gap-y-6 w-full">
          <div className="flex gap-x-4 ">
            <CustomFormInput label="First Name" />
            <CustomFormInput label="First Name" />
          </div>
          <CustomFormInput label="Email" type="email" />
          <CustomFormInput label="Password" type="password" />
          <CustomFormInput label="Confirm Password" type="password" />
          <div className="flex items-center gap-x-2">
            <label className="relative flex items-center cursor-pointer">
              {/* Hidden default checkbox */}
              <input type="checkbox" className="sr-only peer" />

              {/* Custom circular checkbox */}
              <span className="flex items-center justify-center h-5 w-5 rounded-full border-2 border-gray-300 peer-checked:border-primary peer-checked:bg-primary transition-colors">
                {/* White checkmark */}
                <svg
                  className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>

              {/* Label text */}
              <span className="ml-2 text-sm">I agree to the terms</span>
            </label>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Login;
