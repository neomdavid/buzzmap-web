import SideNavDetails from "../components/Mapping/SideNavDetails";
import DengueMap from "../components/DengueMap";

const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap className="" />
      </div>
      <SideNavDetails />
      <article className="absolute z-100000  text-primary right-0 left-[38vw] bottom-0 flex flex-col">
        <p className="text-2xl font-semibold shadow-xl">Most Recent Reports</p>
        <section>
          <div></div>
        </section>
      </article>
    </main>
  );
};

export default SpecificLocation;
