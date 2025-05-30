import { LogoNamed } from "../components";

const Login = () => {
  return (
    <main className="relative">
      <div className="absolute left-8 top-8">
        <LogoNamed textSize="text-[28px]" iconSize="h-11 w-11" />
      </div>
      <section className="absolute right-0 top-0 h-[100vh] text-white w-[56vw] bg-primary py-4 px-8 flex flex-col items-center ">
        <h1 className="text-6xl">Join buzzmap!</h1>
      </section>
    </main>
  );
};

export default Login;
