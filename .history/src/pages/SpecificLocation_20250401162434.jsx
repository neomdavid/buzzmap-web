import SideNavDetails from "../components/Mapping/SideNavDetails";
import { DengueMap, RecentReportCard } from "../components/";
import profile1 from "../assets/profile1.png";

const SpecificLocation = () => {
  return (
    <main className="text-2xl mt-[-69px]  ">
      <div className="w-full h-[100vh]">
        <DengueMap />
      </div>
      <SideNavDetails />
      <article className="absolute overflow-x-scroll z-100000 flex flex-col  text-primary right-[0]  bottom-5 md:max-w-[60vw]  lg:max-w-[62vw] xl:bg-white xl:max-w-[70vw] ">
        <p className="text-[20px] font-semibold text-left mb-2 w-full">
          Most Recent Reports
        </p>
        {/* Scrollable container */}
        <section className="flex gap-x-2 text-[13px] overflow-x-scroll  scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <RecentReportCard
            profileImage={profile1}
            username="Neo David"
            timestamp="1 minute ago"
            date="February 15, 2025, 2:30 PM"
            reportType="Mosquito Breeding Grounds Spotted"
            description="Noticed stagnant water collecting near the back of the ChemEng building after recent rains. Mosquitoes are swarming in the area, and some students have reported frequent bites. Needs immediate drainage cleanup to prevent dengue risk."
          />
          <RecentReportCard
            profileImage={profile1}
            username="Neo David"
            timestamp="1 minute ago"
            date="February 15, 2025, 2:30 PM"
            reportType="Mosquito Breeding Grounds Spotted"
            description="Noticed stagnant water collecting near the back of the ChemEng building after recent rains. Mosquitoes are swarming in the area, and some students have reported frequent bites. Needs immediate drainage cleanup to prevent dengue risk."
          />
          <RecentReportCard
            profileImage={profile1}
            username="Neo David"
            timestamp="1 minute ago"
            date="February 15, 2025, 2:30 PM"
            reportType="Mosquito Breeding Grounds Spotted"
            description="Noticed stagnant water collecting near the back of the ChemEng building after recent rains. Mosquitoes are swarming in the area, and some students have reported frequent bites. Needs immediate drainage cleanup to prevent dengue risk."
          />
          <RecentReportCard
            profileImage={profile1}
            username="Neo David"
            timestamp="1 minute ago"
            date="February 15, 2025, 2:30 PM"
            reportType="Mosquito Breeding Grounds Spotted"
            description="Noticed stagnant water collecting near the back of the ChemEng building after recent rains. Mosquitoes are swarming in the area, and some students have reported frequent bites. Needs immediate drainage cleanup to prevent dengue risk."
          />

          {/* <RecentReportCard
            profileImage={profile1}
            username="Neo David"
            timestamp="10 minutes ago"
            date="February 14, 2025, 1:00 PM"
            reportType="Fogging Request"
            description="Residents of the dormitory requested fogging due to a rise in mosquito bites at night."
          /> */}
        </section>
      </article>
    </main>
  );
};

export default SpecificLocation;
