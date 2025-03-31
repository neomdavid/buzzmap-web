import DengueMap from "../components/DengueMap.jsx";

const Mapping = () => {
  return (
    <div className="flex flex-col py-12 px-10 items-center bg-primary text-white">
      <h1 className="text-7xl">Check your place</h1>
      <p className="text-lg">Stay Protected. Look out for Dengue Outbreaks.</p>
      <DengueMap className="w-full h-full shadow-2xl" />
    </div>
  );
};

export default Mapping;
