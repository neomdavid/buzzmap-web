import { ReactComponent as LightBgLogo } from "../assets/logo_ligthbg.svg";
const LogoNamed = () => {
  return (
    <div className="flex items-center gap-x-1">
      <LightBgLogo className="h-10 w-10" />
      <div className="text-2xl flex italic font-extrabold tracking-[.2px] font-title uppercase text-2xl">
        <h1>buzz</h1>
        <h1>map</h1>
      </div>
    </div>
  );
};

export default LogoNamed;
