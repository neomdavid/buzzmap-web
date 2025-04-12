import { Card, Title, BarChart } from "@tremor/react";

const DengueTrendChart = () => {
  // Sample data – replace this with actual data from your backend
  const data = [
    { week: "Week 1", cases: 35 },
    { week: "Week 2", cases: 48 },
    { week: "Week 3", cases: 42 },
    { week: "Week 4", cases: 50 },
    { week: "Week 5", cases: 58 },
    { week: "Week 6", cases: 62 },
  ];

  return (
    <Card>
      <Title>Dengue Cases (Last 6 Weeks)</Title>
      <BarChart
        className="mt-4 h-72"
        data={data}
        index="week"
        categories={["cases"]}
        colors={["rose"]}
        yAxisWidth={40}
      />
    </Card>
  );
};

export default DengueTrendChart;
