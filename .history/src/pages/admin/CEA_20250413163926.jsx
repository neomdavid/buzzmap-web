import { ReportTable2, SampleTable } from "../../components";

const CEA = () => {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center bg-red-100 text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] lg:w-[60%] ">
        Community Engagement and Awareness
      </p>
      <div className="flex">
        <section className="w-full h-100 ">
          <ReportTable2 />
        </section>
      </div>
    </main>
  );
};

export default CEA;
