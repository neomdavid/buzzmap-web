import React from 'react';
import { Bar } from 'react-chartjs-2';

const SelectedBarangayAnalytics = ({ 
  mapSelectedBarangay, 
  posts, 
  allInterventionsData 
}) => {
  if (!mapSelectedBarangay) {
    return (
      <div className="w-full flex flex-col shadow-sm shadow-lg p-6 py-8 rounded-lg mt-6">
        <p className="mb-4 text-base-content text-3xl font-bold">
          Selected Barangay Analytics
        </p>
        <p className="text-gray-500 italic">
          No barangay selected. Select a barangay to view analytics.
        </p>
      </div>
    );
  }

  // Normalize barangay name for matching
  const normalize = (name) =>
    (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const selectedNorm = normalize(mapSelectedBarangay);
  
  // Reports analytics
  const filteredPosts = Array.isArray(posts?.posts)
    ? posts.posts.filter(
        (post) => normalize(post.barangay) === selectedNorm
      )
    : [];

  const validatedCount = Array.isArray(filteredPosts)
    ? filteredPosts.filter((p) => p.status === "Validated").length
    : 0;
  const pendingCount = Array.isArray(filteredPosts)
    ? filteredPosts.filter((p) => p.status === "Pending").length
    : 0;
  const rejectedCount = Array.isArray(filteredPosts)
    ? filteredPosts.filter((p) => p.status === "Rejected").length
    : 0;

  // Interventions analytics
  const filteredInterventions = Array.isArray(
    allInterventionsData?.interventions
  )
    ? allInterventionsData.interventions.filter(
        (i) => normalize(i.barangay) === selectedNorm
      )
    : [];

  const totalInterventions = filteredInterventions.length;
  const scheduledInterventions = filteredInterventions.filter(
    (i) => (i.status || "").toLowerCase() === "scheduled"
  ).length;
  const ongoingInterventions = filteredInterventions.filter(
    (i) => (i.status || "").toLowerCase() === "ongoing"
  ).length;
  const completedInterventions = filteredInterventions.filter((i) =>
    ["completed", "complete"].includes(
      (i.status || "").toLowerCase()
    )
  ).length;

  // Bar chart data for reports
  const reportsBarData = {
    labels: ["Validated", "Pending", "Rejected"],
    datasets: [
      {
        label: "Reports",
        data: [validatedCount, pendingCount, rejectedCount],
        backgroundColor: [
          "rgba(34,197,94,0.7)", // green
          "rgba(234,179,8,0.7)", // yellow
          "rgba(239,68,68,0.7)", // red
        ],
      },
    ],
  };
  
  const reportsBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Reports Status" },
    },
    scales: {
      y: {
        beginAtZero: true,
        precision: 0,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  // Bar chart data for interventions
  const interventionsBarData = {
    labels: ["Scheduled", "Ongoing", "Completed", "Total"],
    datasets: [
      {
        label: "Interventions",
        data: [
          scheduledInterventions,
          ongoingInterventions,
          completedInterventions,
          totalInterventions,
        ],
        backgroundColor: [
          "rgba(139,92,246,0.7)", // purple (scheduled)
          "rgba(59,130,246,0.7)", // blue (ongoing)
          "rgba(34,197,94,0.7)", // green (completed)
          "rgba(107,114,128,0.7)", // gray (total)
        ],
      },
    ],
  };
  
  const interventionsBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Interventions Status" },
    },
    scales: {
      y: {
        beginAtZero: true,
        precision: 0,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  return (
    <div className="w-full flex flex-col shadow-sm shadow-lg p-6 py-8 rounded-lg mt-6">
      <p className="mb-4 text-base-content text-3xl font-bold">
        Selected Barangay Analytics
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Bar Chart */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-primary/20">
          <p className="font-bold text-lg text-primary mb-2">
            Reports
          </p>
          <div className="h-48">
            {filteredPosts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            ) : (
              <Bar
                data={reportsBarData}
                options={reportsBarOptions}
              />
            )}
          </div>
        </div>
        
        {/* Interventions Bar Chart */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-primary/20">
          <p className="font-bold text-lg text-primary mb-2">
            Interventions
          </p>
          <div className="h-48">
            {filteredInterventions.length === 0 ||
            (scheduledInterventions === 0 &&
              ongoingInterventions === 0 &&
              completedInterventions === 0 &&
              totalInterventions === 0) ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            ) : (
              <Bar
                data={interventionsBarData}
                options={interventionsBarOptions}
              />
            )}
          </div>
        </div>
        
        {/* Pattern Recognition Card - Commented out for future use */}
        {/* <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-primary/20">
          <p className="font-bold text-lg text-primary mb-2">Pattern Recognition</p>
          {patternInfo ? (
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Pattern: <span className="capitalize">{patternInfo.triggered_pattern || 'None'}</span></span>
              <span className="font-semibold">Alert: {patternInfo.alert || 'No recent data'}</span>
              <span className="font-semibold">Last Analyzed: {patternInfo.last_analysis_time ? new Date(patternInfo.last_analysis_time).toLocaleString() : 'N/A'}</span>
            </div>
          ) : (
            <span className="text-gray-500">No pattern data available.</span>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default SelectedBarangayAnalytics;
