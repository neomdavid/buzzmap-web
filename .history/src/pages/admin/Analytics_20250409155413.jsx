import { Check } from "phosphor-react";
import { ActionPlanCard, ProgressCard } from "../../components";
import { IconCheck, IconHourglassEmpty, IconSearch } from "@tabler/icons-react";
const Analytics = () => {
  return (
    <main className=" flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        Analytics
      </p>
      <article className="flex flex-col">
        <div className="mb-6 flex flex-col lg:flex-row gap-7 gap-y-10 shadow-sm p-6 rounded-lg">
          <section className="flex flex-7 flex-col gap-y-3">
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
          <section className="flex flex-9 flex-col gap-3 text-black">
            <p className="font-bold text-base-content text-4xl mb-2">
              Action Plans Progress
            </p>
            <ProgressCard
              title="Surveillance in Commonwealth"
              date="March 15"
              progress={50}
              statusColor="bg-info"
              items={[
                {
                  type: "done",
                  label: "Installed 3 monitoring cameras",
                },
                {
                  type: "result",
                  label: "Results: 80% decrease in mosquito larvae",
                },
                {
                  type: "pending",
                  label: "Data collection",
                },
              ]}
              onEdit={() => alert("Edit action triggered")}
            />
            <ProgressCard
              title="Awareness Seminar in Payatas"
              date="March 18"
              progress={80}
              statusColor="bg-success"
              items={[
                { type: "done", label: "Distributed 100 flyers" },
                { type: "done", label: "Hosted seminar with 50 attendees" },
                { type: "pending", label: "Post-event survey analysis" },
              ]}
              onEdit={() => console.log("Edit Awareness Progress")}
            />
            <ProgressCard
              title="Clean-Up Drive in Batasan"
              date="March 22"
              progress={30}
              statusColor="bg-warning"
              items={[
                { type: "done", label: "Cleared drainage in 3 zones" },
                { type: "result", label: "Initial improvement in water flow" },
                { type: "pending", label: "Debris disposal coordination" },
              ]}
              onEdit={() => console.log("Edit Cleanup Progress")}
            />
          </section>
        </div>
        <div className="flex shadow-sm shadow-lg p-4 rounded-lg">
          <section className="flex flex-20"></section>
          <section className="flex flex-19 flex-col gap-y-5">
            <p className="mb-2 text-base-content text-4xl font-bold">
              Pattern Recognition Alerts
            </p>
            <div className=" relative border-[2px] border-error rounded-4xl p-4 pt-10 text-black">
              <p className="absolute text-lg left-[-2px] top-[-6px] text-nowrap bg-error rounded-2xl font-semibold text-white p-1 px-4">
                Dengue Spike in Holy Spirit
              </p>
              <p>
                <span className="font-bold">Last 2 Weeks:</span> 30% Increase in
                cases
              </p>
              <p>
                <span className="font-bold">Suggested Action:</span> Immediate
                fogging required
              </p>
              <p>
                <span className="font-bold">Barangays Affected:</span> Holy
                Spirit, Payatas
              </p>
              <div className="flex justify-end">
                <button className="mt-1 text-xs text-nowrap bg-base-content text-white font-light px-4 py-2 rounded-full transition-all duration-200 hover:brightness-110 active:scale-95">
                  View Details
                </button>
              </div>
            </div>
            <div className=" relative border-[2px] border-warning rounded-4xl p-4 pt-10 text-black">
              <p className="absolute text-lg left-[-2px] top-[-6px] text-nowrap bg-warning rounded-2xl font-semibold text-white p-1 px-4">
                Gradual Rise in Payatas
              </p>
              <p>
                <span className="font-bold">Last Month:</span> Cases up by 10%
              </p>
              <p>
                <span className="font-bold">Suggested Action:</span> Increase
                awareness campaign
              </p>
              <div className="flex justify-end mt-1">
                <button className="text-xs text-nowrap bg-base-content text-white font-light px-4 py-2 rounded-full transition-all duration-200 hover:brightness-110 active:scale-95">
                  View Details
                </button>
              </div>
            </div>
            <div className=" relative border-[2px] border-success rounded-4xl p-4 pt-10 text-black">
              <p className="absolute text-lg left-[-2px] top-[-6px] text-nowrap bg-success rounded-2xl font-semibold text-white p-1 px-4">
                Stable in Batasan Hills
              </p>
              <p>
                <span className="font-bold">
                  No new cases reported in 3 weeks
                </span>
              </p>

              <div className="flex justify-end mt-1">
                <button className="text-xs text-nowrap bg-base-content text-white font-light px-4 py-2 rounded-full transition-all duration-200 hover:brightness-110 active:scale-95">
                  View Details
                </button>
              </div>
            </div>
            <div className=" relative border-[2px] border-error rounded-4xl p-4 pt-10 text-black">
              <p className="absolute text-lg left-[-2px] top-[-6px] text-nowrap bg-error rounded-2xl font-semibold text-white p-1 px-4">
                Cluster Detected - Barangay Talipapa
              </p>
              <p>
                <span className="font-bold">
                  5 cases reported in the same area
                </span>
              </p>
              <p>
                <span className="font-bold">Suggested Action:</span> Targeted
                Intervention
              </p>

              <div className="flex justify-end">
                <button className="mt-1 text-xs text-nowrap bg-base-content text-white font-light px-4 py-2 rounded-full transition-all duration-200 hover:brightness-110 active:scale-95">
                  View Details
                </button>
              </div>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
};

export default Analytics;
