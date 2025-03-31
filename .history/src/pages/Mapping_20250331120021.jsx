import DengueMap from "../components/DengueMap.jsx";

const Mapping = () => {
  return (
    <div className="flex flex-col py-12 px-8 items-center bg-primary text-white">
      <h1 className="text-7xl">Check your place</h1>
      <p className="text-lg">Stay Protected. Look out for Dengue Outbreaks.</p>
      <div className="w-full h-[65vh] mt-8 rounded-md  shadow-2xl">
        <DengueMap className="w-full h-full" />
      </div>
    </div>
  );
};

export default Mapping;
