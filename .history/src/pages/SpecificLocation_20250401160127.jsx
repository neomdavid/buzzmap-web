import SideNavDetails from "../components/Mapping/SideNavDetails";
import { DengueMap, RecentReportCard } from "../components/";
import profile1 from "../assets/profile1.png";

const SpecificLocation = () => {
  return (
    <<main className="text-2xl mt-[-69px] relative"> {/* Ensure parent is relative */}
    <div className="w-full h-[100vh]">
      <DengueMap />
    </div>
    <SideNavDetails />
    <article className="absolute overflow-hidden z-[100] flex flex-col items-start text-primary right-0 left-[38vw] bottom-5 bg-white">
      <p className="text-[20px] font-semibold text-left mb-2">
        Most Recent Reports
      </p>
      {/* Scrollable container - RIGHT-ALIGNED CONTENT */}
      <section className="flex flex-row-reverse justify-start gap-x-2 text-[13px] overflow-x-auto w-[80vw] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <RecentReportCard
          profileImage={profile1}
          username="Neo David"
          timestamp="1 minute ago"
          date="February 15, 2025, 2:30 PM"
          reportType="Mosquito Breeding Grounds Spotted"
          description="Noticed stagnant water collecting near the back of the ChemEng building after recent rains. Mosquitoes are swarming in the area, and some students have reported frequent bites. Needs immediate drainage cleanup to prevent dengue risk."
        />
        {/* Additional reports will stack from the right */}
      </section>
    </article>
  </main>
  );
};

export default SpecificLocation;
