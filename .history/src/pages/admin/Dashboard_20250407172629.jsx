import { DengueMap, ReportCard, ReportTable } from "../../components";
import { reports } from "../../utils";
const Dashboard = () => {
  return (
    <main className="flex flex-col w-full ">
      <div className="bg-primary text-white flex flex-col p-6 rounded-2xl mb-4">
        <p className="text-5xl font-[Koulen] lowercase">Hello, Jane!</p>
        <p className="text-lg">Today is Friday, 7 March 2025</p>
      </div>
      <section className="grid grid-cols-2  lg:grid-cols-4 gap-4 mb-12">
        <ReportCard
          title="Total Reports"
          count={125}
          topBg="bg-base-content"
          type="status"
          items={[
            { label: "Verified", value: 80, color: "bg-success" },
            { label: "Pending", value: 30, color: "bg-warning" },
            { label: "Rejected", value: 15, color: "bg-error" },
          ]}
        />
        <ReportCard
          title="Total Alerts Sent"
          count={45}
          topBg="bg-info"
          type="interventions"
          items={[{ label: "Fogging" }, { label: "Clean Up Campaigns" }]}
        />
        <ReportCard
          title="Ongoing Interventions"
          count={2}
          type="interventions"
          topBg="bg-info-content"
          items={[
            { label: "Fogging" },
            { label: "Clean Up Campaigns" },
            { label: "Health Drive" },
          ]}
        />
        <ReportCard
          title="User Engagement"
          count={120}
          type="engagement"
          topBg="bg-primary-content"
          items={[
            { label: "Reports", value: 45 },
            { label: "Discussions", value: 75 },
          ]}
        />
      </section>
      <section className="ml-1">
        <p className="mb-6 text-3xl font-extrabold text-primary">
          Recent Reports
        </p>
        <div className="mb-6 border-[1.5px] border-gray-200" />
        <ReportTable rows={reports} />
      </section>

      <section className="flex mt-10 gap-3  flex-col lg:flex-row">
        <div className="w-full lg:flex-2 h-30 rounded-xl overflow-hidden">
          <DengueMap />
        </div>
        <div className="flex gap-3 lg:flex-3">
          <div className="flex-1 bg-red-100 min-w-[150px] rounded-2xl ">s</div>
          <div className="flex flex-col ">
            <p className="text-3xl font-extrabold text-primary">Key Insights</p>
            <div className="flex flex-col text-white">
              <p className="bg-error py-2 px-3">
                Spike in Barangay Holy Spirit
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
