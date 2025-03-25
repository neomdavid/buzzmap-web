import { ReactComponent as LightBgLogo } from "../assets/logo_ligthbg.svg";

const LogoNamed = () => {
  return (
    <div
      className="flex items-center gap-x-1 justify-between"
      style={{
        clipPath: " polygon(100% 0, 100% 60%, 80% 100%, 0 100%, 0 0)",
      }}
    >
      <LightBgLogo className="h-8 w-8" />
      <div className="text-3xl flex italic font-extrabold tracking-[.2px] font-title uppercase text-2xl">
        <h1 className="text-primary">buzz</h1>
        <h1 className="text-accent-content">map</h1>
      </div>
    </div>
  );
};

export default LogoNamed;
