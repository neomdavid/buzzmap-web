import { CustomFormInput, LogoNamed } from "../components";
import { Check } from "phosphor-react";
const Login = () => {
  return (
    <main className="relative">
      <div className="absolute left-8 top-8">
        <LogoNamed textSize="text-[28px]" iconSize="h-11 w-11" />
      </div>
      <section className="absolute right-0 top-0 h-[100vh] text-white w-[60vw] bg-primary py-10 px-25 flex flex-col justify-center items-center text-center text-xl  ">
        <h1 className="mb-4 text-8xl lg:text-red-100">Join buzzmap!</h1>
        <p className="mb-6">
          <span className="font-bold">Sign Up</span> to join us today and be
          part of the movement to track, report, and prevent dengue outbreaks.
        </p>
        <form className="flex flex-col items-center gap-y-8 w-full">
          <div className="flex gap-x-4 ">
            <CustomFormInput label="First Name" />
            <CustomFormInput label="First Name" />
          </div>
          <CustomFormInput label="Email" type="email" />
          <CustomFormInput label="Password" type="password" />
          <CustomFormInput label="Confirm Password" type="password" />
          <div className="flex justify-center text-lg items-center gap-x-2">
            <input
              type="checkbox"
              defaultChecked
              className="checkbox checkbox-lg border-white bg-transparent checked:bg-transparent checked:text-white checked:border-white "
            />
            <label className="">I agree to the Terms and Conditions</label>
          </div>
          <button className="bg-white font-extrabold shadow-[2px_6px_3px_rgba(0,0,0,0.20)] font-bold text-primary w-xs py-3 px-4 rounded-2xl hover:cursor-pointer hover:bg-base-200/60 transition-all duration-300">
            Sign Up
          </button>
          <div className="flex w-full flex-col">
            <div className="divider">Default</div>
            <div className="divider divider-neutral/70">Neutral</div>
            <div className="divider divider-primary">Primary</div>
            <div className="divider divider-secondary">Secondary</div>
            <div className="divider divider-accent">Accent</div>
            <div className="divider divider-success">Success</div>
            <div className="divider divider-warning">Warning</div>
            <div className="divider divider-info">Info</div>
            <div className="divider divider-error">Error</div>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Login;
