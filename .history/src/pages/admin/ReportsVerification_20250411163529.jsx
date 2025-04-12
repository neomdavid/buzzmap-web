import { ReportTable } from "../../components";
import { reports } from "../../utils";

const ReportsVerification = () => {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-10  text-center md:justify-start md:text-left md:w-[48%] ">
        Reports Verification
      </p>
      <div className="flex flex-col">
        <section className="flex flex-col gap-2">
          <p className="text-base-content text-4xl font-bold mb-2">
            Recent Dengue Reports
          </p>
          <ReportTable rows={reports} hasActions={true} />
        </section>
        <section className="flex">
          <div className="flex flex-col p-4 py-2 border border-primary-1 rounded-lg">
            <p className="text-base-conte">Select Report</p>
            <p className="capitalize">Barangay holy spirit </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ReportsVerification;
