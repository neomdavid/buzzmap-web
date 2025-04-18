import { ReactComponent as LightBgLogo } from "../assets/logo_ligthbg.svg";
const LogoNamed = () => {
  return (
    <div className="flex items-center">
      <LightBgLogo className="h-10 w-10" />
      <h1>Buzzmap</h1>
    </div>
  );
};

export default LogoNamed;
