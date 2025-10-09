import { InterventionsTable } from "../../components";
import { useGetAllInterventionsQuery } from "../../api/dengueApi";
import { ArrowLeft } from "phosphor-react";
import { useNavigate } from "react-router-dom";

const ArchivesInterventions = () => {
  const navigate = useNavigate();
  const {
    data: interventions,
    isLoading,
    error,
    refetch: refetchInterventions,
  } = useGetAllInterventionsQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading interventions: {error.message}</div>;
  }

  const interventionsArray = interventions || [];
  const hasArchived = interventionsArray.some(
    (i) => (i.status || "") === "Archived"
  );

  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[48%]">
        Archived Interventions
      </p>
      <section className="flex flex-col gap-16">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-base-content text-4xl font-bold">Archives</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/admin/interventions")}
                className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Interventions
              </button>
              <button
                onClick={() => navigate("/admin/interventions/all")}
                className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Records
              </button>
            </div>
          </div>
          <div className="h-[75vh]">
            <InterventionsTable
              interventions={interventionsArray}
              archivesView={true}
              showControls={false}
              refetchInterventions={refetchInterventions}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default ArchivesInterventions;
