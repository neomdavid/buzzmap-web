import CustomDropDown from "../components/CustomDropDown.jsx";
import DengueMap from "../components/DengueMap.jsx";

const Mapping = () => {
  return (
    <div className="flex flex-col pt-8 px-8 items-center bg-primary text-white h-[91.8vh] mt-[-1px] text-center">
      <h1 className="text-7xl md:text-8xl ">Check your place</h1>
      <p className="text-lg md:text-xl">
        Stay Protected. Look out for Dengue Outbreaks.
      </p>
      <CustomDropDown
        options={["Quezon City", "Manila", "Makati", "Pasig"]}
        onSelect={(value) => console.log("Selected location:", value)}
        className=""
      />
      <div className="w-full h-[70vh] mt-8 rounded-md shadow-md ">
        <DengueMap className="w-full h-full" />
      </div>
    </div>
  );
};

export default Mapping;
