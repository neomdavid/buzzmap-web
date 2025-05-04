import { Link } from "react-router-dom"; // Import Link for navigation
import {
  InterventionsTable,
  FormCoordinationRequest,
  ActionRecommendationCard,
} from "../../components";
import { useGetAllInterventionsQuery } from "../../api/dengueApi"; // Import the hook

const Interventions = () => {
  // Fetch interventions using the RTK Query hook
  const {
    data: interventions,
    isLoading,
    error,
  } = useGetAllInterventionsQuery();

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
      <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[48%]">
        Interventions
      </p>
      <section className="flex flex-col gap-16">
        <div className="flex justify-between items-center">
          <p className="text-base-content text-4xl font-bold mb-2">
            Recent Intervention Records
          </p>
          {/* Link to View All Records */}
          <Link
            to="/admin/interventions/all"
            className="bg-primary font-semibold text-white py-1 px-3 rounded-full text-md hover:underline"
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
