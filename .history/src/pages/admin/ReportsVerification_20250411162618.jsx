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
          <p className="text-base-content text-4xl font-extrabold">
            Recent Dengue Reports
          </p>
          <ReportTable rows={reports} hasActions={true} />
        </section>
      </div>
    </main>
  );
};

export default ReportsVerification;
