import { Card, Title, BarChart } from "@tremor/react";

// Helper to determine risk level and color
const getRiskColor = (cases) => {
  if (cases >= 50) return "rose"; // High risk (Red)
  if (cases >= 30) return "amber"; // Medium risk (Orange/Yellow)
  return "amber"; // Low risk (Green)
};

const DengueTrendChart = () => {
  // Sample data (replace with actual from backend)
  const data = [
    { week: "Week 1", cases: 18 },
    { week: "Week 2", cases: 32 },
    { week: "Week 3", cases: 51 },
    { week: "Week 4", cases: 47 },
    { week: "Week 5", cases: 22 },
    { week: "Week 6", cases: 55 },
  ];

  // Assign color based on each bar's case count
  const barColors = data.map((item) => getRiskColor(item.cases));

  return (
    <Card>
      <Title>Dengue Cases (Last 6 Weeks)</Title>
      <BarChart
        className="mt-4 h-72"
        data={data}
        index="week"
        categories={["cases"]}
        colors={barColors}
        yAxisWidth={40}
      />
    </Card>
  );
};

export default DengueTrendChart;
