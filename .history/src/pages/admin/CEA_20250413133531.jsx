import { DengueChartCard, DengueTrendChart } from "../../components";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
const CEA = () => {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center bg-red-100 text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] lg:w-[60%] ">
        Community Engagement and Awareness
      </p>
      <div className="flex w-full h-100">
        <DengueChartCard />
      </div>
    </main>
  );
};

export default CEA;
