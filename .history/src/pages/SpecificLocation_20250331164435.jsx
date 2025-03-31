import DengueMap from "../components/DengueMap";
import { CustomDropDown, CustomSearchBar, LogoNamed } from "../components";
import UPBuilding from "../assets/UPBuilding.jpg";
const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap className="" />
      </div>
      <aside className="flex flex-col z-10000000 absolute left-0 bottom-0 top-0 bg-primary w-[28vw] shadow-[10px_0px_10px_rgba(0,0,0,0.3)] px-4 py-8">
        <LogoNamed theme="dark" iconSize="h-11 w-11" textSize="text-[30px]" />
        <CustomDropDown
          options={["Quezon City", "Manila", "Makati", "Pasig"]}
          onSelect={(value) => console.log("Selected location:", value)}
          className="mt-4 text-sm mb-4"
          fillColor="white"
        />
        <img
          src={UPBuilding}
          className="w-full h-[18%] object-cover rounded-2xl mb-4"
        />
        <p className="text-white text-[20px] mr-4 ml-2">
          Department of Chemical Engineering, University of the Philippines
          Diliman
        </p>
      </aside>
    </main>
  );
};

export default SpecificLocation;
