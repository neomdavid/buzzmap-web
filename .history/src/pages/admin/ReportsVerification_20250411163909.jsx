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
          <div className="flex flex-col items-center p-7 py-2 border-2 border-primary rounded-2xl">
            <p className="text-base-content font-semibold text-lg">
              Selected Report
            </p>
            <p className="capitalize font-extrabold text-3xl">
              Barangay holy spirit
            </p>
            <div className="flex flex-col w-full text-left">
              <p>
                <span className="font-bold">Report ID: </span>RTP-00124
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ReportsVerification;
