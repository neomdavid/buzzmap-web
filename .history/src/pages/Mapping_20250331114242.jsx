import DengueMap from "../components/DengueMap.jsx";
const Mapping = () => {
  return (
    <div className="flex flex-col py-12 px-10 items-center">
      <h1 className="text-5xl">Check your place</h1>
      <p>Stay Protected. Look out for Dengue Outbreaks.</p>
      <div>
        <DengueMap />
      </div>
    </div>
  );
};

export default Mapping;
