import { LogoNamed } from "../components";

const Login = () => {
  return (
    <main className="relative">
      <div className="absolute left-8 top-8">
        <LogoNamed textSize="text-[28px]" iconSize="h-11 w-11" />
      </div>
      <section className="absolute right-0 top-0 h-[100vh] text-white w-[60vw] bg-primary py-10 px-25 flex flex-col items-center text-center  ">
        <h1 className="text-7xl lg:text-red-100">Join buzzmap!</h1>
        <p>
          <span className="font-semibold">Sign Up</span> to join us today and be
          part of the movement to track, report, and prevent dengue outbreaks.
        </p>
        <form className="flex flex-col">
          <div className="flex">
            <div className="flex flex-col gap-y-2">
              <label className="text-left">First Name</label>
              <input
                type="text"
                className="bg-base-200 py-2 px-3"
                placeholder="hello"
              />
            </div>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Login;
