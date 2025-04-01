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
      <article className="absolute z-100000 flex flex-col items-start text-primary right-0 left-[38vw] bottom-5">
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
            <div className="flex flex-col gap-y-1 text-[11.5px]">
              <p>
                <span className="font-semibold">🕒 Date & Time: </span>February
                15, 2025, 2:30 PM
              </p>
              <p>
                <span className="font-semibold">⚠️ Report Type: </span>Mosquito
                Breeding Grounds Spotted
              </p>
              <p>
                <span className="font-semibold">📝 Description: </span>Noticed
                stagnant water collecting near the back of the ChemEng building
                after recent rains. Mosquitoes are swarming in the area, and
                some students have reported frequent bites. Needs immediate
                drainage cleanup to prevent dengue risk.
              </p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
};

export default SpecificLocation;
