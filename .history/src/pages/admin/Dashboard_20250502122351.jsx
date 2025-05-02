import React from "react";
import { ReportCard, ReportTable2, DengueChartCard } from "../../components";
import { useGetPostsQuery } from "../../api/dengueApi.js";

const Dashboard = () => {
  // Fetching the posts from the API
  const { data: posts, isLoading, isError } = useGetPostsQuery();

  // Handle loading and error states
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching data...</div>;

  // Calculating counts based on the 'status' field of the posts array
  const counts = posts.reduce(
    (acc, post) => {
      if (post.status === "Validated") acc.validated += 1;
      if (post.status === "Pending") acc.pending += 1;
      if (post.status === "Rejected") acc.rejected += 1;
      return acc;
    },
    { validated: 0, pending: 0, rejected: 0 }
  );

  return (
    <main className="flex flex-col w-full">
      <div className="bg-primary text-white flex flex-col p-6 rounded-2xl mb-4">
        <p className="text-5xl font-[Koulen] lowercase">Hello, Jane!</p>
        <p className="text-lg">Today is Friday, 7 March 2025</p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <ReportCard
          title="Total Reports"
          count={posts.length} // Total reports
          topBg="bg-base-content"
          type="status"
          items={[
            {
              label: "Validated",
              value: counts.validated,
              color: "bg-success",
            },
            { label: "Pending", value: counts.pending, color: "bg-warning" },
            { label: "Rejected", value: counts.rejected, color: "bg-error" },
          ]}
        />
        <ReportCard
          title="Total Alerts Sent"
          count={45} // This can be dynamic as well if you have alerts data
          topBg="bg-error/90"
          type="interventions"
          items={[{ label: "Fogging" }, { label: "Clean Up Campaigns" }]}
        />
        <ReportCard
          title="Ongoing Interventions"
          count={2} // Change based on actual data
          type="interventions"
          topBg="bg-warning"
          items={[
            { label: "Fogging" },
            { label: "Clean Up Campaigns" },
            { label: "Health Drive" },
          ]}
        />
        <ReportCard
          title="User Engagement"
          count={120} // Example value, adjust accordingly
          type="engagement"
          topBg="bg-success/80"
          items={[
            { label: "Reports", value: 45 },
            { label: "Discussions", value: 75 },
          ]}
        />
      </section>

      <section className="ml-1 mb-6 mt-6">
        <p className="mb-6 text-3xl font-extrabold text-primary">
          Recent Reports
        </p>
        <hr className="mb-6 border-[1.5px] border-gray-200" />
        <div className="h-120">
          <ReportTable2 posts={posts} isActionable={false} onlyRecent={true} />
        </div>
      </section>

      <section className="flex mt-10 gap-4 flex-col xl:flex-row">
        <div className="w-full shadow-sm h-72 rounded-lg xl:flex-2 overflow-hidden">
          <DengueChartCard />
        </div>
        <div className="flex gap-6 lg:flex-3">
          <div className="flex-1 min-w-[150px] shadow-sm rounded-2xl ">
            <DengueMap />
          </div>
          <div className="flex flex-col ">
            <p className="text-3xl font-extrabold text-primary mb-3">
              Key Insights
            </p>
            <div className="flex flex-col text-sm gap-2 text-md text-white font-light items-start ">
              <p className="bg-error py-2.5 px-4 rounded-2xl">
                Spike in Barangay Holy Spirit (30% Increase)
              </p>
              <p className="bg-warning py-2.5 px-4 rounded-2xl">
                Gradual rise in Barangay Payatas
              </p>

              <p className="bg-success py-2.5 px-4 rounded-2xl">
                No new cases in Barangay Batasan Hills
              </p>
              <p className="bg-warning py-2.5 px-4 rounded-2xl">
                Seasonal pattern detected
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
