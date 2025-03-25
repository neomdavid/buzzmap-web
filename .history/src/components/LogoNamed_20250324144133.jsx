import { ReactComponent as LightBgLogo } from "../assets/logo_ligthbg.svg";
const LogoNamed = () => {
  return (
    <div className="flex items-center gap-x-1">
      <LightBgLogo className="h-10 w-10" />
      <p className="italic uppercase text-2xl">Buzzmap</p>
    </div>
  );
};

export default LogoNamed;
