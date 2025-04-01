import SideNavDetails from "../components/Mapping/SideNavDetails";
import DengueMap from "../components/DengueMap";

const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap className="" />
      </div>
      <SideNavDetails />
      <article className="absolute z-100000 flex flex-col text-primary right-0 left-[38vw] bottom-0">
        <p className="text-2xl font-semibold shadow-2xl">Most Recent Reports</p>
        <section className="flex gap-x-2 text-md">
          <div className="bg-white rounded-xl shadow-md p-4">hell</div>
        </section>
      </article>
    </main>
  );
};

export default SpecificLocation;
