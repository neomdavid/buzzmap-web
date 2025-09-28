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

  // Handle empty interventions array - don't show error, show empty state
  const interventionsArray = interventions || [];
  const hasInterventions = interventionsArray.length > 0;

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
            {hasInterventions ? (
              <InterventionsTable
                interventions={interventionsArray}
                onlyRecent={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m6 0h6m-6 6v6m0 6v6m-3-3h6"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No interventions found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No intervention records have been created yet.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => navigate("/admin/interventions")}
                      className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      Go to Interventions Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AllInterventions;
