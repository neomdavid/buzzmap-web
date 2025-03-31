import DengueMap from "../components/DengueMap";
import { CustomDropDown, CustomSearchBar, LogoNamed } from "../components";
import UPBuilding from "../assets/UPBuilding.jpg";
const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap className="" />
      </div>
      <aside className="flex flex-col justify-between text-white z-10000000 absolute left-0 bottom-0 top-0 bg-primary w-[28vw] shadow-[10px_0px_10px_rgba(0,0,0,0.3)] px-4 py-8">
        <LogoNamed theme="dark" iconSize="h-11 w-11" textSize="text-[30px]" />
        <div>
          <CustomDropDown
            options={["Quezon City", "Manila", "Makati", "Pasig"]}
            onSelect={(value) => console.log("Selected location:", value)}
            className="mt-4 text-sm mb-4"
            fillColor="white"
          />
          <img
            src={UPBuilding}
            className="w-full h-[35%] object-cover rounded-2xl mb-4"
          />
          <p className="text-[21px] mr-4 ml-1 mb-4 tracking-wide leading-8">
            Department of Chemical Engineering, University of the Philippines
            Diliman
          </p>
          <p className="text-[12px] font-light mr-4 ml-1">
            J3X8+6Q6 University of the Philippines Diliman, T.H. Pardo de Tavera
            St, Extension, Quezon City, Metro Manila
          </p>
        </div>
        <div>
          <p className="text-[14px] font-semibold">
            Number of Community Reports: 100
          </p>
          <p className="text-[12px]">🦟 50 Breeding Sites Identified</p>
          <p>🏥 30 Confirmed Dengue Cases</p>
          <p>🕵️ 20 Suspected Cases Reported</p>
        </div>
      </aside>
    </main>
  );
};

export default SpecificLocation;
