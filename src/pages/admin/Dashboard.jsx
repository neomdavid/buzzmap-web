import React, { useState, useEffect, lazy, Suspense } from "react";
import { ReportCard } from "../../components";
import { useGetAdminDashboardSummaryQuery } from "../../api/dengueApi.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Lazy load heavy components to reduce initial bundle size
const ReportTable2 = lazy(() => import("../../components/Admin/ReportTable2"));
const DengueChartCard = lazy(() =>
  import("../../components/Admin/DengueChartCard")
);
const MapOnly = lazy(() => import("../../components/Mapping/MapOnly"));

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    verifiedReports: 0,
    pendingReports: 0,
    totalInterventions: 0,
    activeInterventions: 0,
    completedInterventions: 0,
  });
  const navigate = useNavigate();

  // Fetch compact dashboard summary
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useGetAdminDashboardSummaryQuery({
    recent_posts_limit: 5,
    recent_alerts_limit: 3,
  });

  // State for showing analysis loading
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Show analysis modal when loading for admin users
  useEffect(() => {
    if (user?.role === "admin" && summaryLoading) {
      setShowAnalysisModal(true);
    } else {
      setShowAnalysisModal(false);
    }
  }, [user, summaryLoading]);

  // Get current date string in the format: Today is <weekday>, <day> <month> <year>
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handle loading and error states
  if (summaryLoading) {
    return (
      <main className="flex flex-col w-full p-6">
        <div className="skeleton h-28 w-full mb-6 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-36 w-full rounded-2xl" />
          ))}
        </div>
        <div className="mb-10">
          <div className="skeleton h-8 w-56 mb-4 rounded-xl" />
          <div className="skeleton h-96 w-full rounded-2xl" />
        </div>
        <div className="flex mt-4 gap-4 flex-col xl:flex-row">
          <div className="skeleton h-86 w-full rounded-lg" />
          <div className="skeleton h-86 w-full rounded-lg" />
        </div>
      </main>
    );
  }
  if (summaryError) return <div>Error fetching data...</div>;

  // Derive values from summary
  const safePosts = Array.isArray(summary?.reports?.recent)
    ? summary.reports.recent.map((r) => ({
        _id: r.id,
        barangay: r.barangay,
        report_type: r.report_type,
        status: r.status,
        date_and_time: r.date,
        description: r.description,
        user: { username: r.username },
        isAnonymous: r.isAnonymous,
        specific_location: {
          coordinates: r?.specific_location?.coordinates || [],
        },
      }))
    : [];

  // Recent posts for map/table
  const recentPosts = safePosts;

  // Counts from summary
  const reportCounts = summary?.reports?.by_status || {
    validated: 0,
    pending: 0,
    rejected: 0,
  };

  const interventionCounts = summary?.interventions?.by_status || {
    completed: 0,
    scheduled: 0,
    ongoing: 0,
  };
  const totalInterventions = summary?.interventions?.total || 0;

  const totalAlerts = summary?.alerts?.total || 0;
  const recentAlerts = Array.isArray(summary?.alerts?.recent)
    ? summary.alerts.recent
    : [];

  const alertItems = recentAlerts.map((alert) => ({
    label: (alert.barangays || [])
      .map((b) => (typeof b === "string" ? b : b?.name))
      .join(", "),
    value: alert?.message || "No message",
  }));

  // Compute cluster stats (fully/partially/not resolved)
  const fullyResolved = summary?.clusters?.fully_resolved || 0;
  const partiallyResolved = summary?.clusters?.partially_resolved || 0;
  const notResolved = summary?.clusters?.not_resolved || 0;
  const totalClusters =
    summary?.clusters?.total || fullyResolved + partiallyResolved + notResolved;

  // Handler to redirect to /admin/map when a barangay is clicked
  const handleDashboardMapPolygonClick = () => {
    navigate("/admin/map");
  };

  // Add null check for user
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Loading...</h2>
          <p>Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full mt-[-10px]">
      {/* Analysis Loading Modal */}

      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="space-y-3">
              <div className="skeleton h-8 w-3/4 mx-auto rounded-xl" />
              <div className="skeleton h-4 w-full rounded-xl" />
              <div className="skeleton h-4 w-5/6 rounded-xl" />
              <div className="skeleton h-4 w-4/6 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-primary text-white flex flex-col p-6 rounded-2xl mb-4">
        <p className="text-5xl font-extrabold capitalize tracking-[1px]">
          Hello, {user.name}
        </p>
        <p className="text-lg">Today is {formattedDate}</p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {/* ReportCard for Total Reports */}
        <div
          className="cursor-pointer"
          onClick={() => navigate("/admin/reportsverification")}
        >
          <ReportCard
            title="Total Reports "
            count={summary?.reports?.total || 0} // Total reports from summary
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
        </div>

        {/* ReportCard for Total Alerts Sent */}
        <div
          className="cursor-pointer"
          onClick={() => navigate("/admin/cea?tab=alerts")}
        >
          <ReportCard
            title="Total Alerts Sent"
            count={totalAlerts}
            topBg="bg-error/90"
            type="interventions"
            items={alertItems}
          />
        </div>

        {/* ReportCard for Completed Interventions */}
        <div
          className="cursor-pointer"
          onClick={() => navigate("/admin/interventions")}
        >
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
        </div>

        {/* ReportCard for Clusters */}
        <div className="cursor-pointer" onClick={() => navigate("/admin/map")}>
          <ReportCard
            title="Clusters"
            count={totalClusters}
            topBg="bg-[#60a5fa]"
            type="status"
            items={[
              {
                label: "Fully Resolved",
                value: fullyResolved,
                color: "bg-success",
              },
              {
                label: "Partially Resolved",
                value: partiallyResolved,
                color: "bg-warning",
              },
              {
                label: "Not Resolved",
                value: notResolved,
                color: "bg-error",
              },
            ]}
          />
        </div>

        {/* User Engagement */}
        {/* <ReportCard
          title="User Engagement (No backend yet) "
          count={0}
          type="engagement"
          topBg="bg-success/80"
          items={[
            { label: "Reports", value: 45 },
            { label: "Discussions", value: 75 },
          ]}
        /> */}
      </section>

      <section className="ml-1 mb-6 mt-6">
        <p className="mb-6 text-3xl font-extrabold text-primary">
          Recent Reports
        </p>
        <hr className="mb-6 border-[1.5px] border-gray-200" />
        <div className="h-120">
          <Suspense
            fallback={<div className="skeleton h-full w-full rounded-2xl" />}
          >
            <ReportTable2
              posts={safePosts}
              isActionable={false}
              onlyRecent={true}
            />
          </Suspense>
        </div>
      </section>

      <section className="flex mt-10 gap-4 flex-col xl:flex-row">
        <div className="w-full shadow-sm h-86 rounded-lg xl:flex-2 overflow-hidden">
          <Suspense
            fallback={<div className="skeleton h-full w-full rounded-lg" />}
          >
            <DengueChartCard />
          </Suspense>
        </div>
        <div className="flex  md:flex-row  gap-6 lg:flex-3">
          <div className="flex-1 min-w-[150px] shadow-sm rounded-2xl h-auto overflow-hidden  ">
            <Suspense
              fallback={
                <div className="skeleton h-[300px] w-full rounded-2xl" />
              }
            >
              <MapOnly
                style={{ height: "300px", width: "100%" }}
                useAdminEndpoint={true}
                showBreedingSites={true}
                recentOnly={true}
                recentCount={5}
                recentPosts={recentPosts}
                disableSiteInfoWindows={true}
              />
            </Suspense>
          </div>
          {/* <div className="flex flex-col ">
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
          </div> */}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
