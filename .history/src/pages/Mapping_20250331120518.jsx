import DengueMap from "../components/DengueMap.jsx";

const Mapping = () => {
  return (
    <div className="flex flex-col py-13 px-8 items-center bg-primary text-white h-[91.8vh] mt-[-1px] text-center">
      <h1 className="text-7xl md:text-8xl ">Check your place</h1>
      <p className="text-lg md:text-xl">
        Stay Protected. Look out for Dengue Outbreaks.
      </p>
      <div className="w-full h-[70vh] mt-8 rounded-md  shadow-2xl">
        <DengueMap className="w-full h-full" />
      </div>
    </div>
  );
};

export default Mapping;
