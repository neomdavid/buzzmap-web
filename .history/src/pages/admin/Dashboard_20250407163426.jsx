import { ReportCard } from "../../components";
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
        <table className="w-full">
          <tr className="text-left text-lg text-base-content font-semibold">
            <th>Report ID</th>
            <th>Location</th>
            <th>Date</th>
            <th>Status</th>
          </tr>{" "}
          <tr className="text-black text-[13px]">
            <td>RPT-00123</td>
            <td>Barangay CommonWealth</td>
            <td>2025-03-01</td>
            <td>
              <div className="bg-success text-[12px] text-white font-semibold rounded-full text-center">
                Verified
              </div>
            </td>
          </tr>
        </table>
      </section>
    </main>
  );
};

export default Dashboard;
