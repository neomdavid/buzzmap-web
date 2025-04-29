import { ReportTable2, SampleTable } from "../../components";

const CEA = () => {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] lg:w-[60%] ">
        Community Engagement and Awareness
      </p>
      <section className="flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="flex flex-col rounded-lg overflow-hidden">
            <p className="w-full bg-primary text-white text-center">
              Send Dengue Alerts
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CEA;
