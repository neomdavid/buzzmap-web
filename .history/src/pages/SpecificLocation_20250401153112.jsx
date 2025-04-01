import SideNavDetails from "../components/Mapping/SideNavDetails";
import { DengueMap, UserDetailsTab } from "../components/";
import profile1 from "../assets/profile1.png";
const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px] ">
      <div className="w-full h-[100vh]">
        <DengueMap />
      </div>
      <SideNavDetails />
      <article className="absolute z-100000 flex flex-col items-start text-primary right-0 left-[38vw] bottom-0">
        <p className="text-[20px] font-semibold text-left mb-2">
          Most Recent Reports
        </p>
        <section className="flex gap-x-2 text-[13px]">
          <div className="bg-white rounded-xl shadow-md p-5 w-[300px]">
            <UserDetailsTab
              profileImage={profile1}
              username="Neo David"
              timestamp="1 minute ago"
            />
          </div>
        </section>
      </article>
    </main>
  );
};

export default SpecificLocation;
