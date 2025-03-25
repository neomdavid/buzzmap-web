import { ReactComponent as LightBgLogo } from "../assets/logo_ligthbg.svg";
const LogoNamed = () => {
  return (
    <div className="flex items-center gap-x-1">
      <LightBgLogo className="h-10 w-10" />
      <h1 className="font-body uppercase text-2xl">Buzzmap</h1>
    </div>
  );
};

export default LogoNamed;
