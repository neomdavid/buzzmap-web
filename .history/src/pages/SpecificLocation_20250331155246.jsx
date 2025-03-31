import DengueMap from "../components/DengueMap";
import { CustomSearchBar } from "../components";

const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap className="" />
      </div>
      <aside className="flex flex-col z-10000000 absolute left-0 bottom-0 top-0 bg-primary w-[28vw] shadow-[10px_0px_10px_rgba(0,0,0,0.3)]">
        <CustomSearchBar />
      </aside>
    </main>
  );
};

export default SpecificLocation;
