import DengueMap from "../components/DengueMap";
import { CustomDropDown, CustomSearchBar, LogoNamed } from "../components";

const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap className="" />
      </div>
      <aside className="flex flex-col z-10000000 absolute left-0 bottom-0 top-0 bg-primary w-[28vw] shadow-[10px_0px_10px_rgba(0,0,0,0.3)] px-4">
        <LogoNamed theme="dark" iconSize="h-14 w-14" textSize="text-[32px]" />
        <CustomDropDown
          options={["Quezon City", "Manila", "Makati", "Pasig"]}
          onSelect={(value) => console.log("Selected location:", value)}
          className="mt-4 text-sm"
          fillColor="white"
        />
      </aside>
    </main>
  );
};

export default SpecificLocation;
