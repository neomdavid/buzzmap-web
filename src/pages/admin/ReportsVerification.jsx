import {
  ImageGrid,
  ReportStatistics,
  ReportTable,
  ReportTable2,
} from "../../components";
import { useGetPostsQuery } from "../../api/dengueApi.js";
import { useState, useEffect } from "react";
import post1 from "../../assets/post1.jpg";
import post2 from "../../assets/post2.jpg";
import VerifyReportModal from "../../components/Admin/VerifyReportModal";
import dayjs from "dayjs";
import {
  IconChartBar,
  IconChecks,
  IconClock,
  IconUserCircle,
} from "@tabler/icons-react";

const ReportsVerification = () => {
  const { data: posts, isLoading, isError, refetch } = useGetPostsQuery();
  const [selectedReport, setSelectedReport] = useState(null);
  const [validatedPosts, setValidatedPosts] = useState([]);

  // Calculate summary stats
  const totalReports = posts?.length || 0;
  const totalValidated = posts?.filter(p => p.status === "Validated").length || 0;
  const totalPending = posts?.filter(p => p.status === "Pending").length || 0;
  const totalRejected = posts?.filter(p => p.status === "Rejected").length || 0;
  const today = dayjs().format("YYYY-MM-DD");
  const totalToday = posts?.filter(p => dayjs(p.date_and_time).format("YYYY-MM-DD") === today).length || 0;

  // Most active barangay
  const barangayCounts = {};
  posts?.forEach(p => {
    if (p.barangay) barangayCounts[p.barangay] = (barangayCounts[p.barangay] || 0) + 1;
  });
  const mostActiveBarangay = Object.entries(barangayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  useEffect(() => {
    if (posts) {
      setValidatedPosts(posts.filter((post) => post.status === "Validated"));
    }
  }, [posts]);

  const handleVerificationSuccess = () => {
    refetch();
    setSelectedReport(null);
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading posts</p>;

  return (
    <main className="flex flex-col w-full">
      <p className="flex justify-center text-5xl font-extrabold mb-10 text-center md:justify-start md:text-left md:w-[48%] ">
        Reports Verification
      </p>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* Total Reports */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-base-100 border border-base-200 px-6 py-5 items-center">
          <IconChartBar size={28} className="text-primary mb-1" />
          <span className="text-3xl font-bold text-primary">{totalReports}</span>
          <span className="text-base font-medium text-gray-600 mt-1">Total Reports</span>
        </div>
        {/* Validated */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-green-50 border border-green-100 px-6 py-5 items-center">
          <IconChecks size={28} className="text-green-600 mb-1" />
          <span className="text-3xl font-bold text-green-600">{totalValidated}</span>
          <span className="text-base font-medium text-green-700 mt-1">Validated</span>
        </div>
        {/* Pending */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-yellow-50 border border-yellow-100 px-6 py-5 items-center">
          <IconClock size={28} className="text-yellow-600 mb-1" />
          <span className="text-3xl font-bold text-yellow-600">{totalPending}</span>
          <span className="text-base font-medium text-yellow-700 mt-1">Pending</span>
        </div>
        {/* Rejected */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-red-50 border border-red-100 px-6 py-5 items-center">
          <IconUserCircle size={28} className="text-red-600 mb-1" />
          <span className="text-3xl font-bold text-red-600">{totalRejected}</span>
          <span className="text-base font-medium text-red-700 mt-1">Rejected</span>
        </div>
        {/* Reports Today */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-blue-50 border border-blue-100 px-6 py-5 items-center">
          <IconClock size={28} className="text-blue-600 mb-1" />
          <span className="text-3xl font-bold text-blue-600">{totalToday}</span>
          <span className="text-base font-medium text-blue-700 mt-1">Reports Today</span>
        </div>
        {/* Most Active Barangay */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-purple-50 border border-purple-100 px-6 py-5 items-center">
          <IconUserCircle size={28} className="text-purple-600 mb-1" />
          <span className="text-2xl font-bold text-purple-700">{mostActiveBarangay}</span>
          <span className="text-base font-medium text-purple-700 mt-1">Most Active Barangay</span>
        </div>
      </div>
      {/* --- END SUMMARY CARDS --- */}

      <div className="flex flex-col">
        <section className="flex flex-col gap-2">
          <p className="text-base-content text-4xl font-bold mb-2">
            Recent Breeding Sites Reports
          </p>
          <div className="h-[75vh]">
            <ReportTable2
              posts={posts}
              onSelectReport={setSelectedReport}
            />
          </div>
        </section>
      </div>
      {selectedReport && (
        <VerifyReportModal
          reportId={selectedReport._id}
          barangay={selectedReport.barangay}
          description={selectedReport.description}
          status={selectedReport.status}
          dateAndTime={selectedReport.date_and_time}
          images={selectedReport.images}
          coordinates={selectedReport.specific_location?.coordinates}
          username={selectedReport.user?.username}
          onClose={() => setSelectedReport(null)}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </main>
  );
};

export default ReportsVerification;
