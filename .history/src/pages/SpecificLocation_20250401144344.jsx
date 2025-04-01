import DengueMap from "../components/DengueMap";
import { CustomDropDown, SecondaryButton, LogoNamed } from "../components";
import UPBuilding from "../assets/UPBuilding.jpg";
const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap className="" />
      </div>
      <aside className="flex flex-col justify-around text-white z-10000000 absolute bottom-0 h-[100vh] bg-primary w-[28vw] shadow-[10px_0px_10px_rgba(0,0,0,0.3)] px-5 md:border md:border-red-100 md:w-[35vw]">
        <div className="flex flex-col bg-red-100">
          <LogoNamed theme="dark" iconSize="h-11 w-11" textSize="text-[30px]" />
          <CustomDropDown
            options={["Quezon City", "Manila", "Makati", "Pasig"]}
            onSelect={(value) => console.log("Selected location:", value)}
            className="mt-4 text-sm mb-4"
            fillColor="white"
          />
          <img
            src={UPBuilding}
            className="w-full object-cover rounded-2xl mb-4 md:h-[20vh]"
          />
          <p className="text-[27px] mr-4 ml-1 mb-4 tracking-wide leading-8 md:text-[23px]">
            Department of Chemical Engineering, University of the Philippines
            Diliman
          </p>
          <p className="text-[14px] font-light mr-4 ml-1 md:text-[12px]">
            J3X8+6Q6 University of the Philippines Diliman, T.H. Pardo de Tavera
            St, Extension, Quezon City, Metro Manila
          </p>
        </div>
        <div className="flex flex-col  ">
          <p className="text-[16px] font-semibold mb-1 md:text-[13px]">
            Number of Community Reports: 100
          </p>
          <div className="text-[14px]  ml-[-2px] font-light md:text-[12px]">
            <p>🦟 50 Breeding Sites Identified</p>
            <p>🏥 30 Confirmed Dengue Cases</p>
            <p>🕵️ 20 Suspected Cases Reported</p>
          </div>
        </div>
        <div className="flex flex-col items-center mx-2 gap-y-4 text-[12px] text-primary">
          <SecondaryButton text="Report a Dengue Case" />
          <SecondaryButton text="View Reports by the Community" />
          <SecondaryButton text="Prevention Tips" />
        </div>
        <div className="flex flex-col text-sm text-center font-light">
          <p>
            Heads up! Your data helps power community safety insights. Learn how
            we protect it in our
          </p>
          <p className="font-semibold italic underline">
            Privacy & Data Disclaimer.
          </p>
        </div>
      </aside>
    </main>
  );
};

export default SpecificLocation;
