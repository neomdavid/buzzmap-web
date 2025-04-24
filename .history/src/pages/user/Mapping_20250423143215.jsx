import MapPicker from "../../components/MapPicker.jsx";

const Mapping = () => {
  return (
    <div className="flex flex-col pt-8 px-8 items-center bg-primary text-white h-[91.8vh] mt-[-13px] text-center">
      <h1 className="text-7xl md:text-8xl">Check your place</h1>
      <p className="text-lg md:text-xl">
        Stay Protected. Look out for Dengue Outbreaks.
      </p>
      <div className="w-full z-[10] h-[68vh] mt-4 rounded-md shadow-md">
        <MapPicker
          onLocationSelect={(coords, barangay) => {
            console.log("Selected location:", coords);
            console.log("Barangay:", barangay);
          }}
        />
      </div>
    </div>
  );
};

export default Mapping;
