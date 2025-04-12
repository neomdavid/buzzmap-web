import { Check } from "phosphor-react";
import { ActionPlanCard } from "../../components";
import { IconCheck, IconHourglassEmpty, IconSearch } from "@tabler/icons-react";
const Analytics = () => {
  return (
    <main className=" flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        Analytics
      </p>
      <article className="flex flex-col">
        <div className="grid grid-cols-2 gap-7">
          <section className="flex flex-col gap-y-3">
            <p className="text-base-content text-4xl font-bold mb-2">
              Action Plans
            </p>
            <ActionPlanCard
              title="Scheduled"
              borderColor="border-l-warning"
              items={[
                { event: "Fogging in Barangay Payatas", date: "March 15" },
                {
                  event: "Awareness Seminar in Barangay Holy Spirit",
                  date: "March 15",
                },
              ]}
            />
            <ActionPlanCard
              title="Ongoing"
              borderColor="border-l-info"
              items={[
                { event: "Surveillance in Commonwealth" },
                {
                  event: "Clean-up Drive in Barangay Batasan Hills",
                },
              ]}
            />
            <ActionPlanCard
              title="Completed"
              borderColor="border-l-success"
              items={[
                { event: "Fogging in Barangay Tandang Sora", date: "March 2" },
                {
                  event: "Health Check-ups in Barangay Payatas",
                  date: "March 1",
                },
              ]}
            />
          </section>
          <section className="flex flex-col gap-3 text-black">
            <p className="font-bold text-base-content text-4xl mb-2">
              Action Plans Progress
            </p>
            <div className="flex flex-col gap-1.5 bg-white p-5 rounded-3xl shadow-sm">
              <div className="flex justify-between">
                <div className="flex items-center gap-x-3 ">
                  <div className="w-5 h-5 bg-info rounded-full" />
                  <p>Surveillance in Commonwealth</p>
                  <p className="text-base-content font-bold">March 15</p>
                </div>
                <p className="text-primary font-semibold">50%</p>
              </div>
              <div>{/* bar progress */}</div>
              {/* items, make this dynamic, the three divs below are the three possible items*/}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <div className="flex items-center gap-x-3 ">
                    <div className="rounded-full bg-success p-0.5 ">
                      <IconCheck size={12} color="white" stroke={4} />
                    </div>
                    <p className="text-gray-500">
                      Installed 3 monitoring cameras
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-x-3 ">
                    <div className="rounded-full bg-success p-0.5 ">
                      <IconSearch size={12} color="white" stroke={4} />
                    </div>
                    <p className="text-gray-500">
                      Results: 80% decrease in mosquito larvae
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-x-3 ">
                    <div className="text-warning ">
                      <IconHourglassEmpty size={16} stroke={2} />
                    </div>
                    <p className="text-gray-500">Data collection</p>
                  </div>
                  <button className="text-xs bg-base-content text-white font-light p-2.5 rounded-full hover:cursor-pointer hover:bg-base-content/70 transition-all duration-200">
                    Edit Action Plan Progress
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
};

export default Analytics;
