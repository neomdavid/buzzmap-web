import { LogoNamed } from "../components";

const Login = () => {
  return (
    <main className="relative">
      <div className="absolute left-8 top-8">
        <LogoNamed textSize="text-[28px]" iconSize="h-11 w-11" />
      </div>
      <section className="absolute right-0 top-0 bottom-0 bg-red-100 py-5 px-8">
        hello
      </section>
    </main>
  );
};

export default Login;
