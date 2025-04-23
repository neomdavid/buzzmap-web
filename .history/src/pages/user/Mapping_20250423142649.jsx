import CustomDropDown from "../../components/CustomDropDown.jsx";
import DengueMap from "../../components/DengueMap.jsx";

const Mapping = () => {
  return (
    <div className="flex flex-col pt-8 px-8 items-center bg-primary text-white h-[91.8vh] mt-[-13px] text-center">
      <h1 className="text-7xl md:text-8xl ">Check your place</h1>
      <p className="text-lg md:text-xl">
        Stay Protected. Look out for Dengue Outbreaks.
      </p>
      <CustomDropDown
        options={["Quezon City", "Manila", "Makati", "Pasig"]}
        onSelect={(value) => console.log("Selected location:", value)}
        className="mt-4 z-[1]"
      />
      <div className="w-full z-100 h-[68vh] mt-4 rounded-md shadow-md z-[10] ">
        <DengueMap className="w-full h-full " />
      </div>
    </div>
  );
};

export default Mapping;
