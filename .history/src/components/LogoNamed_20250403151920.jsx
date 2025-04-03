import { ReactComponent as LightBgLogo } from "../assets/logo_ligthbg.svg";
import { ReactComponent as DarkBgLogo } from "../assets/logo_darkbg.svg";

const LogoNamed = ({ theme = "light", iconSize = "", textSize = "" }) => {
  return theme === "light" ? (
    <div
      className="flex items-center gap-x-1 px-1 "
      style={{
        clipPath:
          " polygon(20% 0%, 80% 0%, 100% 0, 100% 51%, 72% 100%, 20% 100%, 0 100%, 0 0)",
      }}
    >
      <LightBgLogo className={` xl:h-13 w-13 mt-[-1px] ${iconSize}`} />
      <div
        className={` flex italic font-extrabold tracking-wider font-title uppercase text-2xl xl:text-4xl ${textSize}`}
      >
        <h1 className="text-primary">buzz</h1>
        <h1 className="text-accent-content">map</h1>
      </div>
    </div>
  ) : (
    <div
      className="flex items-center gap-x-1 px-1 "
      style={{
        clipPath:
          " polygon(20% 0%, 80% 0%, 100% 0, 100% 51%, 72% 100%, 20% 100%, 0 100%, 0 0)",
      }}
    >
      <DarkBgLogo className={`${iconSize} xl:h-13 w-13 mt-[-1px]`} />
      <div
        className={` ${textSize} flex italic font-extrabold tracking-wider font-title uppercase text-2xl xl:text-4xl ${textSize}`}
      >
        <h1 className="text-white">buzz</h1>
        <h1 className="text-white">map</h1>
      </div>
    </div>
  );
};

export default LogoNamed;
