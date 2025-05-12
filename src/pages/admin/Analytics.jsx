import { Check } from "phosphor-react";
import { alerts } from "../../utils";
import {
  ActionPlanCard,
  ProgressCard,
  AlertCard,
  DengueChartCard,
  DengueTrendChart,
  DengueMap,
  PieChart,
  DengueMapLegend
} from "../../components";
import PatternRecognitionResults from "@/components/Admin/PatternAlerts";
import PatternAlerts from "@/components/Admin/PatternAlerts";
import { useState } from "react";

// import { IconCheck, IconHourglassEmpty, IconSearch } from "@tabler/icons-react";

// Add the TABS array
const TABS = [
  { label: "Selected Barangay", value: "selected" },
  { label: "All Alerts", value: "all" },
  { label: "Spikes", value: "spikes" },
  { label: "Gradual Rise", value: "gradual" },
  { label: "Stability", value: "stability" },
  { label: "Decline", value: "decline" },
];

const Analytics = () => {
  const [selectedBarangay, setSelectedBarangay] = useState('bahay toro');
  const [selectedTab, setSelectedTab] = useState('selected'); // NEW

  return (
    <main className=" flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        Analytics
      </p>
      <article className="flex flex-col">
        {/* <div className="mb-6 flex flex-col lg:flex-row gap-7 gap-y-10 shadow-sm p-6 rounded-lg">
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
        </div> */}
        <div className="flex flex-col gap-6 gap-y-12 lg:grid lg:grid-cols-12 shadow-sm shadow-lg p-6 py-8 rounded-lg">
          <section className="flex flex-col lg:col-span-7">
            <p className="mb-4 text-base-content text-4xl font-bold">
              Trends and Patterns
            </p>
            <div className="mt-[-14px] ml-[-12px]">
              <DengueTrendChart 
                selectedBarangay={selectedBarangay}
                onBarangayChange={setSelectedBarangay}
              />
            </div>
          </section>

          <section className="flex flex-col lg:col-span-5 gap-y-5">
            <p className="mb-2 text-base-content text-4xl font-bold">
              Pattern Recognition Alerts
            </p>
            {/* TABS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  className={`px-3 py-1 rounded-full ${
                    selectedTab === tab.value 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-black'
                  }`}
                  onClick={() => setSelectedTab(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-y-5 h-95 xl:h-120 2xl:h-125 mt-[-10px] py-3 overflow-y-scroll">
              <PatternAlerts 
                selectedBarangay={selectedBarangay} 
                selectedTab={selectedTab}
              />
            </div>
          </section>
        </div>
        <div className="w-full flex flex-col  shadow-sm shadow-lg p-6 py-8 rounded-lg">
          <p className="mb-4 text-base-content text-4xl font-bold">Mapping</p>
          <p className="text-base-content text-xl font-semibold mb-6">
            Barangay Dengue Risk and Case Density Map
          </p>
          <div className="rounded-xl shadow-sm h-140 overflow-hidden">
            <DengueMap 
              showLegends={true} 
              defaultTab="cases"
            />
          </div>
        </div>
        <PieChart />
      </article>
    </main>
  );
};

export default Analytics;
