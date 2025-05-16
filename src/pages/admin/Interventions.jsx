import { Link } from "react-router-dom"; // Import Link for navigation
import {
  InterventionsTable,
  FormCoordinationRequest,
  ActionRecommendationCard,
} from "../../components";
import { useGetAllInterventionsQuery, useGetPostsQuery } from "../../api/dengueApi"; // Import the hook
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Interventions = () => {
  // Fetch interventions using the RTK Query hook
  const {
    data: interventions,
    isLoading,
    error,
  } = useGetAllInterventionsQuery();
  const { data: posts } = useGetPostsQuery();

  // Dashboard calculations
  // const completedInterventions = interventions ? interventions.filter(i => {
  //   const status = i.status?.toLowerCase();
  //   return status === 'completed' || status === 'complete';
  // }) : [];
  // const totalInterventions = completedInterventions.length;
  // const barangaySet = new Set(completedInterventions.map(i => i.barangay));
  // const totalBarangays = barangaySet.size;
  // const typeCounts = completedInterventions.reduce((acc, i) => {
  //   acc[i.interventionType] = (acc[i.interventionType] || 0) + 1;
  //   return acc;
  // }, {});
  // const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  // const barangayCounts = completedInterventions.reduce((acc, i) => {
  //   acc[i.barangay] = (acc[i.barangay] || 0) + 1;
  //   return acc;
  // }, {});
  // const totalReports = Array.isArray(posts) ? posts.length : 0;
  // const recentInterventions = [...completedInterventions]
  //   .sort((a, b) => new Date(b.date) - new Date(a.date))
  //   .slice(0, 5);

  // // Pie chart data (by type)
  // const pieData = {
  //   labels: Object.keys(typeCounts),
  //   datasets: [
  //     {
  //       data: Object.values(typeCounts),
  //       backgroundColor: [
  //         '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#facc15', '#4ade80', '#38bdf8', '#f472b6'
  //       ],
  //     },
  //   ],
  // };

  // // Bar chart data (by barangay)
  // const barData = {
  //   labels: Object.keys(barangayCounts),
  //   datasets: [
  //     {
  //       label: 'Interventions',
  //       data: Object.values(barangayCounts),
  //       backgroundColor: '#60a5fa',
  //     },
  //   ],
  // };

  // Check if the data is still loading or there's an error
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading interventions: {error.message}</div>;
  }

  console.log(interventions);

  return (
    <main className="flex flex-col w-full ">
      {/* DASHBOARD SECTION
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded shadow p-4 flex flex-col items-center border">
            <span className="text-2xl font-bold text-primary">{totalInterventions}</span>
            <span className="text-gray-600">Total Interventions</span>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-center border">
            <span className="text-2xl font-bold text-primary">{totalBarangays}</span>
            <span className="text-gray-600">Barangays Covered</span>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-center border">
            <span className="text-2xl font-bold text-primary">{mostCommonType}</span>
            <span className="text-gray-600">Most Common Type</span>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-center border">
            <span className="text-2xl font-bold text-primary">{totalReports}</span>
            <span className="text-gray-600">Total Dengue Reports</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded shadow p-4 border">
            <h3 className="font-bold text-lg mb-2 text-primary">Interventions by Type</h3>
            <Pie data={pieData} />
          </div>
          <div className="bg-white rounded shadow p-4 border">
            <h3 className="font-bold text-lg mb-2 text-primary">Interventions by Barangay</h3>
            <Bar data={barData} options={{ indexAxis: 'y', plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-white rounded shadow p-4 border mb-8">
          <h3 className="font-bold text-lg mb-2 text-primary">Recent Interventions</h3>
          <ul>
            {recentInterventions.map(i => (
              <li key={i._id} className="mb-2 border-b pb-2 last:border-b-0 last:pb-0">
                <span className="font-semibold text-primary">{i.interventionType}</span> in <span className="font-semibold">{i.barangay}</span> on <span>{new Date(i.date).toLocaleDateString()}</span> by <span>{i.personnel}</span>
              </li>
            ))}
          </ul>
        </div>
      </div> */}
      <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[48%]">
        Interventions
      </p>
      <section className="flex flex-col gap-16">
        <div className="flex justify-between items-center mb-[-35px]">
          <p className="text-base-content text-4xl font-bold ">
            Recent Intervention Records
          </p>
          {/* Link to View All Records */}
          <Link
            to="/admin/interventions/all"
            className="bg-primary text-center text-nowrap font-semibold text-white py-1 px-3 rounded-full text-sm hover:bg-primary/80 transition-all duration-200"
          >
            View All Records
          </Link>
        </div>
        <div className="h-135">
          {/* Pass the interventions data to the table */}
          <InterventionsTable interventions={interventions} onlyRecent={true} />
        </div>
        <div className="flex flex-col w-full gap-10 lg:flex-row">
          <div className="lg:flex-21">
            <FormCoordinationRequest />
          </div>
          <div className="flex flex-col lg:flex-23 gap-4">
            <p className="text-base-content text-4xl font-bold mb-1">
              Prescriptive Action Recommendations
            </p>
            {/* High Risk (red) */}
            <ActionRecommendationCard
              barangay="Barangay Commonwealth"
              riskLevel="high"
              issueDetected="Spike in Breeding Site & Infestation Reports"
              suggestedAction="Fogging Operation, Breeding Site Elimination"
              urgencyLevel="Immediate Action Required"
            />

            {/* Medium Risk (yellow) */}
            <ActionRecommendationCard
              barangay="Barangay Fairview"
              riskLevel="medium"
              issueDetected="Moderate breeding sites detected"
              suggestedAction="Larviciding, Community Cleanup"
              urgencyLevel="Action Required Soon"
            />

            {/* Low Risk (green) */}
            <ActionRecommendationCard
              barangay="Barangay Holy Spirit"
              riskLevel="low"
              issueDetected="Minimal reports"
              suggestedAction="Regular monitoring"
              urgencyLevel="Monitor Situation"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Interventions;
