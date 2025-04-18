import { ReactComponent as LightBgLogo } from "../assets/logo_ligthbg.svg";

const LogoNamed = () => {
  return (
    <div
      className="flex items-center gap-x-1 "
      style={{
        clipPath:
          " polygon(20% 0%, 80% 0%, 100% 0, 100% 57%, 58% 100%, 20% 100%, 0 100%, 0 0)",
      }}
    >
      <LightBgLogo className="h-8 w-8 mt-1" />
      <div className="text-[24px] flex italic font-extrabold tracking-wider font-title uppercase text-2xl">
        <h1 className="text-primary">buzz</h1>
        <h1 className="text-accent-content">map</h1>
      </div>
    </div>
  );
};

export default LogoNamed;
