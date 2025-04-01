import SideNavDetails from "../components/Mapping/SideNavDetails";
import DengueMap from "../components/DengueMap";

const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap className="" />
      </div>
      <SideNavDetails />
    </main>
  );
};

export default SpecificLocation;
