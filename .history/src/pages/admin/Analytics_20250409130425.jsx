import { ActionPlanCard } from "../../components";
const Analytics = () => {
  return (
    <main className=" flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        Analytics
      </p>
      <article className="flex flex-col">
        <section className="flex flex-col gap-y-4">
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
          

          
          </div>
        </section>
      </article>
    </main>
  );
};

export default Analytics;
