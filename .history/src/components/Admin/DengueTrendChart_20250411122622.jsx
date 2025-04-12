import { Card, Title, BarChart } from "@tremor/react";

const DengueTrendChart = () => {
  const rawData = [
    { week: "Week 1", cases: 18 },
    { week: "Week 2", cases: 32 },
    { week: "Week 3", cases: 51 },
    { week: "Week 4", cases: 47 },
    { week: "Week 5", cases: 22 },
    { week: "Week 6", cases: 55 },
  ];

  // Transform the data to create separate categories for each week
  const transformed = rawData.map((item) => ({
    week: item.week,
    [item.week]: item.cases,
  }));

  // Get the color for each week based on cases
  const getRiskColor = (cases) => {
    if (cases >= 50) return "rose"; // High
    if (cases >= 30) return "amber"; // Medium
    return "emerald"; // Low
  };

  const categories = rawData.map((d) => d.week);
  const colors = rawData.map((d) => getRiskColor(d.cases));

  return (
    <Card>
      <Title>Dengue Cases (Last 6 Weeks)</Title>
      <BarChart
        className="mt-4 h-72"
        data={transformed}
        index="week"
        categories={categories}
        colors={colors}
        yAxisWidth={40}
      />
    </Card>
  );
};

export default DengueTrendChart;
