import SideNavDetails from "../components/Mapping/SideNavDetails";
import DengueMap from "../components/DengueMap";

const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap className="" />
      </div>
      <SideNavDetails />
      <article className="absolute z-100000 right-0 bottom-0">
        <h1>hel</h1>
      </article>
    </main>
  );
};

export default SpecificLocation;
