import { InterventionsTable } from "../../components";
import { useGetAllInterventionsQuery } from "../../api/dengueApi";

const AllInterventions = () => {
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
        Interventions
      </p>
      <section className="flex flex-col gap-16">
        <div>
          <p className="text-base-content text-4xl font-bold mb-2">
            All Intervention Records
          </p>
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
