import { DengueMap, ReportCard, ReportTable } from "../../components";
import { reports } from "../../utils";
const Dashboard = () => {
  return (
    <main className="flex flex-col w-full ">
      <div className="bg-primary text-white flex flex-col p-6 rounded-2xl mb-4">
        <p className="text-5xl font-[Koulen] lowercase">Hello, Jane!</p>
        <p className="text-lg">Today is Friday, 7 March 2025</p>
      </div>
      <section className="grid grid-cols-2  lg:grid-cols-4 gap-4 mb-10">
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
        <p className="mb-4 text-3xl font-extrabold text-primary">
          Recent Reports
        </p>
        <div className="mb-4 border-[1.5px] border-gray-200" />
        <ReportTable rows={reports} />
      </section>
      <section className="grid grid-cols-1 md:grid-cols-10 gap-4">
        {/* Left (Dengue Map) - 6/10 width on md and up */}
        <div className="md:col-span-6">
          <DengueMap />
        </div>

        {/* Right section - 4/10 width on md and up */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="flex flex-row md:flex-col gap-4">
            {/* Left portion - takes remaining width on mobile, full on md */}
            <div className="flex-1 bg-gray-200 p-4 rounded-lg">
              {/* Content here */}
              First Child
            </div>
            {/* Right portion - auto width */}
            <div className="w-[100px] md:w-full bg-gray-300 p-4 rounded-lg">
              {/* Content here */}
              Second Child
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
