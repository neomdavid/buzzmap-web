import { Check } from "phosphor-react";
import { ActionPlanCard } from "../../components";
import { IconCheck } from "@tabler/icons-react";
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
          <section className="flex flex-col gap-3">
            <p className="font-bold text-base-content text-4xl mb-2">
              Action Plans Progress
            </p>
            <div className="flex flex-col gap-1 bg-white p-5 rounded-3xl shadow-sm">
              <div className="flex justify-between">
                <div className="flex items-center gap-x-3 ">
                  <div className="w-5 h-5 bg-info rounded-full" />
                  <p>Surveillance in Commonwealth</p>
                </div>
                <p className="text-primary font-semibold">50%</p>
              </div>
              <div>{/* bar progress */}</div>
              {/* items */}
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <div className="flex items-center gap-x-3 ">
                    <div className="rounded-full bg-success ">
                      <IconCheck size={16} />
                    </div>

                    <p>Surveillance in Commonwealth</p>
                  </div>
                  <p className="text-primary font-semibold">50%</p>
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
