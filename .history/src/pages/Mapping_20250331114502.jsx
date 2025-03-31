import DengueMap from "../components/DengueMap.jsx";
const Mapping = () => {
  return (
    <div className="flex flex-col py-12 px-10 items-center">
      <h1 className="text-8xl">Check your place</h1>
      <p className="text-2xl">Stay Protected. Look out for Dengue Outbreaks.</p>
      <div className="w-full h-[70vh] mt-8">
        <DengueMap />
      </div>
    </div>
  );
};

export default Mapping;
