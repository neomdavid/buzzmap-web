import { InterventionsTable } from "../../components";
import { useGetAllInterventionsQuery } from "../../api/dengueApi";
import { ArrowLeft } from "phosphor-react";
import { useNavigate } from "react-router-dom";

const AllInterventions = () => {
  const navigate = useNavigate();
  const {
    data: interventions,
    isLoading,
    error,
  } = useGetAllInterventionsQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading interventions: {error.message}</div>;
  }

  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[48%]">
        All Interventions
      </p>
      <section className="flex flex-col gap-16">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-base-content text-4xl font-bold">
              All Intervention Records
            </p>
            <button
              onClick={() => navigate("/admin/interventions")}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Interventions
            </button>
          </div>
          <div className="h-[75vh]">
            {/* Pass the interventions data to the table with onlyRecent={false} */}
            <InterventionsTable
              interventions={interventions}
              onlyRecent={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default AllInterventions;
