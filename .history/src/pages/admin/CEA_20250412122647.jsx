import { DengueChartCard } from "../../components";
import { Bar, BarChart } from "recharts";
import { ChartContainer, ChartTooltipContent } from "../components/ui/charts";

const CEA = () => {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center bg-red-100 text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] lg:w-[60%] ">
        Community Engagement and Awareness
      </p>
      <div className="flex">
        <ChartContainer>
          <BarChart data={data}>
            <Bar dataKey="value" />
            <ChartTooltip content={<ChartTooltipContent />} />
          </BarChart>
        </ChartContainer>
      </div>
    </main>
  );
};

export default CEA;
