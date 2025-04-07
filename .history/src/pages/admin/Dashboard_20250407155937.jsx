import { ReportCard } from "../../components";
const Dashboard = () => {
  return (
    <main className="flex flex-col w-full ">
      <div className="bg-primary text-white flex flex-col p-6 rounded-2xl mb-4">
        <p className="text-5xl font-[Koulen] lowercase">Hello, Jane!</p>
        <p className="text-lg">Today is Friday, 7 March 2025</p>
      </div>
      <section className="grid grid-cols-2 gap-4">
        <ReportCard
          title="Total Reports"
          count={125}
          type="status"
          items={[
            { label: "Verified", value: 80, color: "bg-success" },
            { label: "Pending", value: 30, color: "bg-warning" },
            { label: "Rejected", value: 15, color: "bg-error" },
          ]}
        />
        <ReportCard
          title="Interventions"
          count={2}
          type="interventions"
          items={[{ label: "Fogging" }, { label: "Clean Up Campaigns" }]}
        />
        <ReportCard
          title="Community Engagement"
          count={20}
          type="engagement"
          items={[
            { label: "Reports", value: 12 },
            { label: "Discussions", value: 8 },
          ]}
        />
      </section>
    </main>
  );
};

export default Dashboard;
