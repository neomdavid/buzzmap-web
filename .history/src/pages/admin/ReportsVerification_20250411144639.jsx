import { ReportTable } from "../components";

const ReportsVerification = () => {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] ">
        Reports Verification
      </p>
      <div className="flex">
        <ReportTable />
      </div>
    </main>
  );
};

export default ReportsVerification;
