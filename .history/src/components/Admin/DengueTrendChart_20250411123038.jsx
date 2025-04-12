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

  // Determine risk level
  const classifyRisk = (cases) => {
    if (cases >= 50) return "High Risk";
    if (cases >= 30) return "Medium Risk";
    return "Low Risk";
  };

  // Transform the data
  const data = rawData.map((item) => ({
    week: item.week,
    cases: item.cases,
    risk: classifyRisk(item.cases),
  }));

  // Mapping colors per risk level
  const colorMap = {
    "Low Risk": "emerald",
    "Medium Risk": "amber",
    "High Risk": "rose",
  };

  return (
    <Card>
      <Title>Dengue Cases Trend (Last 6 Weeks)</Title>
      <BarChart
        className="mt-4 h-72"
        data={data}
        index="week"
        categories={["cases"]}
        colors={data.map((d) => colorMap[d.risk])}
        yAxisWidth={40}
        showLegend={false}
      />
    </Card>
  );
};

export default DengueTrendChart;
