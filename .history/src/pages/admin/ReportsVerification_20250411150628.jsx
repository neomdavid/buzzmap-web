import { ReportTable } from "../../components";
import { reports } from "../../utils";

const ReportsVerification = () => {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] ">
        Reports Verification
      </p>
      <div className="flex">
        <ReportTable rows={reports} hasActions={trie} />
      </div>
    </main>
  );
};

export default ReportsVerification;
