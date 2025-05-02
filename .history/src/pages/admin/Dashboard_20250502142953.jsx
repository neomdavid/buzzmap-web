import React from "react";
import {
  ReportCard,
  ReportTable2,
  DengueChartCard,
  DengueMap,
} from "../../components";
import {
  useGetPostsQuery,
  useGetAllInterventionsQuery,
} from "../../api/dengueApi.js"; // Import the intervention query hook

const Dashboard = () => {
  // Fetching the posts from the API
  const {
    data: posts,
    isLoading: postsLoading,
    isError: postsError,
  } = useGetPostsQuery();

  // Fetching the interventions from the API
  const {
    data: interventions,
    isLoading: interventionsLoading,
    isError: interventionsError,
  } = useGetAllInterventionsQuery();
  console.log(interventions);
  // Handle loading and error states for both posts and interventions
  if (postsLoading || interventionsLoading) return <div>Loading...</div>;
  if (postsError || interventionsError)
    return <div>Error fetching data...</div>;

  // Calculate counts for reports
  const reportCounts = posts.reduce(
    (acc, post) => {
      if (post.status === "Validated") acc.validated += 1;
      if (post.status === "Pending") acc.pending += 1;
      if (post.status === "Rejected") acc.rejected += 1;
      return acc;
    },
    { validated: 0, pending: 0, rejected: 0 }
  );

  // Calculate counts for interventions
  const interventionCounts = interventions.reduce(
    (acc, intervention) => {
      if (intervention.status === "Complete") acc.completed += 1;
      if (intervention.status === "Scheduled") acc.scheduled += 1;
      if (intervention.status === "Ongoing") acc.ongoing += 1;
      return acc;
    },
    { completed: 0, scheduled: 0, ongoing: 0 }
  );
  const totalInterventions =
    interventionCounts.completed +
    interventionCounts.scheduled +
    interventionCounts.ongoing;
  console.log(interventionCounts);

  return (
    <main className="flex flex-col w-full">
      <div className="bg-primary text-white flex flex-col p-6 rounded-2xl mb-4">
        <p className="text-5xl font-[Koulen] lowercase">Hello, Jane!</p>
        <p className="text-lg">Today is Friday, 7 March 2025</p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {/* ReportCard for Total Reports */}
        <ReportCard
          title="Total Reports "
          count={posts.length} // Total reports
          topBg="bg-base-content"
          type="status"
          items={[
            {
              label: "Validated",
              value: reportCounts.validated,
              color: "bg-success",
            },
            {
              label: "Pending",
              value: reportCounts.pending,
              color: "bg-warning",
            },
            {
              label: "Rejected",
              value: reportCounts.rejected,
              color: "bg-error",
            },
          ]}
        />

        {/* ReportCard for Total Alerts Sent */}
        <ReportCard
          title="Total Alerts Sent (No backend yet)"
          count={0} // This can be dynamic as well if you have alerts data
          topBg="bg-error/90"
          type="interventions"
          items={[{ label: "Fogging" }, { label: "Clean Up Campaigns" }]}
        />

        {/* ReportCard for Completed Interventions */}
        <ReportCard
          title=" Interventions"
          count={totalInterventions} // Count of completed interventions
          type="status"
          topBg="bg-warning"
          items={[
            {
              label: "Completed",
              value: interventionCounts.completed,
              color: "bg-success",
            },
            {
              label: "Ongoing",
              value: interventionCounts.ongoing,
              color: "bg-info",
            },
            {
              label: "Scheduled",
              value: interventionCounts.scheduled,
              color: "bg-warning",
            },
          ]}
        />

        {/* User Engagement */}
        <ReportCard
          title="User Engagement (No backend yet) "
          count={0}
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
        <div className="flex  md:flex-row  gap-6 lg:flex-3">
          <div className="flex-1 min-w-[150px] shadow-sm rounded-2xl h-70 overflow-hidden  ">
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
