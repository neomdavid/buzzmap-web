import DengueMap from "../components/DengueMap";
import { CustomDropDown, SecondaryButton, LogoNamed } from "../components";
import UPBuilding from "../assets/UPBuilding.jpg";
const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap className="" />
      </div>
      <aside className="flex flex-col text-white  z-10000000 absolute  bottom-0 h-[100vh]  bg-primary w-[28vw] shadow-[10px_0px_10px_rgba(0,0,0,0.3)] px-4 py-8 md:border md:border-red-100 md:w-[35vw]">
        <LogoNamed theme="dark" iconSize="h-11 w-11" textSize="text-[30px]" />
        <div className="flex flex-col">
          <CustomDropDown
            options={["Quezon City", "Manila", "Makati", "Pasig"]}
            onSelect={(value) => console.log("Selected location:", value)}
            className="mt-4 text-sm mb-4"
            fillColor="white"
          />
          <img
            src={UPBuilding}
            className="w-full h-[35%] object-cover rounded-2xl mb-4 md:h-[26%]"
          />
          <p className="text-[27px] mr-4 ml-1 mb-4 tracking-wide leading-8 md:text-md">
            Department of Chemical Engineering, University of the Philippines
            Diliman
          </p>
          <p className="text-[14px] font-light mr-4 ml-1">
            J3X8+6Q6 University of the Philippines Diliman, T.H. Pardo de Tavera
            St, Extension, Quezon City, Metro Manila
          </p>
        </div>
        <div className="mb-10">
          <p className="text-[16px] font-semibold">
            Number of Community Reports: 100
          </p>
          <p className="text-[14px] font-light">
            🦟 50 Breeding Sites Identified
          </p>
          <p className="text-[14px] font-light">🏥 30 Confirmed Dengue Cases</p>
          <p className="text-[14px] font-light">
            🕵️ 20 Suspected Cases Reported
          </p>
        </div>
        <div className="flex flex-col mx-2 gap-y-4 text-[12px] text-primary">
          <SecondaryButton
            text="Report a Dengue Case"
            maxWidth={"max-w-[230px]"}
          />
          <SecondaryButton
            text="View Reports by the Community"
            maxWidth={"max-w-[230px]"}
          />
          <SecondaryButton text="Prevention Tips" maxWidth={"max-w-[230px]"} />
        </div>
      </aside>
    </main>
  );
};

export default SpecificLocation;
